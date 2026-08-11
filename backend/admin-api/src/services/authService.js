import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { pool } from "../db/postgres.js";
import { env } from "../config/env.js";
import { UnauthorizedError, ValidationError } from "../utils/errors.js";

const JWT_EXPIRY = "12h";

export async function login({ mail, password }) {
  if (!mail || !password) {
    throw new ValidationError("mail and password are required");
  }

  const result = await pool.query(
    "SELECT tenant_id, store_name, password_hash FROM tenants WHERE admin_mail = $1",
    [mail]
  );

  // Same error for "no such account" and "wrong password" — don't let
  // the response shape reveal whether an email is registered.
  if (result.rows.length === 0) {
    throw new UnauthorizedError("Invalid mail or password");
  }

  const tenant = result.rows[0];
  const passwordMatches = await bcrypt.compare(password, tenant.password_hash);

  if (!passwordMatches) {
    throw new UnauthorizedError("Invalid mail or password");
  }

  const token = jwt.sign(
    { sub: tenant.tenant_id, tenantId: tenant.tenant_id, role: "admin" },
    env.jwtSecret,
    { expiresIn: JWT_EXPIRY }
  );

  return {
    token,
    tenantId: tenant.tenant_id,
    storeName: tenant.store_name,
  };
}

export async function getAdminProfile(tenantId) {
  const result = await pool.query(
    "SELECT tenant_id, store_name, admin_name, admin_mail, store_url FROM tenants WHERE tenant_id = $1",
    [tenantId]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError("Account not found");
  }

  const row = result.rows[0];
  return {
    tenantId: row.tenant_id,
    storeName: row.store_name,
    adminName: row.admin_name,
    adminMail: row.admin_mail,
    storeUrl: row.store_url,
  };
}
