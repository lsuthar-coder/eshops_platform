import crypto from "node:crypto";
import bcrypt from "bcrypt";

import { pool } from "../db/postgres.js";
import { redis } from "../db/redis.js";
import { StoreConfig } from "../models/storeConfig.js";
import { isMailVerified, consumeMailVerification } from "./otp.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { ValidationError, ConflictError, NotFoundError } from "../utils/errors.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateInput({ mail, password, name, store_name }) {
  if (!mail || typeof mail !== "string" || !EMAIL_RE.test(mail)) {
    throw new ValidationError("A valid mail is required");
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    throw new ValidationError("password must be at least 8 characters");
  }
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new ValidationError("name is required");
  }
  if (
    !store_name ||
    typeof store_name !== "string" ||
    store_name.trim().length === 0
  ) {
    throw new ValidationError("store_name is required");
  }
}

function buildStoreUrl(tenantId) {
  // env.platformDomain is expected to be "eshops.lsuthar.in" — the wildcard
  // Ingress/cert cover *.eshops.lsuthar.in, so every tenantId subdomain
  // under it works with no new Kubernetes object required.
  return `https://${tenantId}.${env.platformDomain}`;
}

async function cacheMailStatus(mail, payload) {
  await redis.set(`portal:mail:${mail}`, JSON.stringify(payload));
}

/**
 * Creates a tenant. No pipeline, no polling — the wildcard Ingress/cert
 * for *.eshops.lsuthar.in already covers every tenant subdomain, so
 * there is no per-tenant Kubernetes object left to create here. This
 * writes Postgres (identity/auth), Mongo (config), and Redis (fast-read
 * cache) synchronously and returns the final status in the same request.
 */
export async function createTenant({ mail, password, name, store_name }) {
  validateInput({ mail, password, name, store_name });

  const verified = await isMailVerified(mail);
  if (!verified) {
    throw new ValidationError(
      "Mail is not verified. Request and verify a code first."
    );
  }

  const tenantId = crypto.randomUUID();
  const storeUrl = buildStoreUrl(tenantId);
  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);

  let tenantRow;
  try {
    const result = await pool.query(
      `
      INSERT INTO tenants
        (tenant_id, store_name, admin_name, admin_mail, password_hash, status, store_url)
      VALUES
        ($1, $2, $3, $4, $5, 'pending', $6)
      RETURNING tenant_id, store_name, status, store_url
      `,
      [tenantId, store_name, name, mail, passwordHash, storeUrl]
    );
    tenantRow = result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      throw new ConflictError("A store with this admin mail already exists");
    }
    throw error;
  }

  // Single-use: once the store record exists, the verification is spent.
  await consumeMailVerification(mail);

  let finalStatus;
  try {
    const config = { tenantId, storeName: store_name };

    // Intentionally minimal — Portal only knows tenantId/storeName/storeUrl,
    // it doesn't own the full config schema (Admin API does). Admin API's
    // configService.normalizeConfig() fills in every other section with
    // safe defaults whenever it reads or writes this document, so this
    // partial insert never has to become a partial read downstream.
    await StoreConfig.findOneAndUpdate(
      { tenantId },
      { tenantId, storeName: store_name, storeUrl },
      { upsert: true, new: true }
    );

    const domainHost = new URL(storeUrl).hostname;
    await redis.set(`config:domain:${domainHost}`, JSON.stringify(config));
    await redis.set(`config:uuid:${tenantId}`, JSON.stringify(config));

    finalStatus = "live";
  } catch (error) {
    logger.error(
      { err: error, tenantId },
      "Failed to write store config to Mongo/Redis"
    );
    finalStatus = "failed";
  }

  await pool.query(
    "UPDATE tenants SET status = $2, updated_at = NOW() WHERE tenant_id = $1",
    [tenantId, finalStatus]
  );

  const payload = {
    tenantId,
    status: finalStatus,
    storeUrl,
    adminPortalUrl: env.adminPortalUrl,
  };

  await cacheMailStatus(mail, payload);

  if (finalStatus === "live") {
    logger.info({ tenantId }, "Tenant created successfully");
  } else {
    logger.warn({ tenantId }, "Tenant creation partially failed");
  }

  return payload;
}

export async function getTenantStatus(tenantId) {
  const result = await pool.query(
    "SELECT tenant_id, store_name, status, store_url FROM tenants WHERE tenant_id = $1",
    [tenantId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Tenant not found");
  }

  const row = result.rows[0];
  return {
    tenantId: row.tenant_id,
    storeName: row.store_name,
    status: row.status,
    storeUrl: row.store_url,
    adminPortalUrl: env.adminPortalUrl,
  };
}

/**
 * Recovery path for page refreshes / dropped connections — the client
 * doesn't need to hold on to tenantId in memory, just the mail address
 * they signed up with.
 */
export async function getTenantStatusByMail(mail) {
  if (!mail || typeof mail !== "string" || !EMAIL_RE.test(mail)) {
    throw new ValidationError("A valid mail is required");
  }

  const cached = await redis.get(`portal:mail:${mail}`);
  if (cached) {
    return JSON.parse(cached);
  }

  const result = await pool.query(
    "SELECT tenant_id, status, store_url FROM tenants WHERE admin_mail = $1",
    [mail]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("No store found for this mail");
  }

  const row = result.rows[0];
  const payload = {
    tenantId: row.tenant_id,
    status: row.status,
    storeUrl: row.store_url,
    adminPortalUrl: env.adminPortalUrl,
  };

  // Redis had gone cold for this key — repopulate it.
  await cacheMailStatus(mail, payload);

  return payload;
}
