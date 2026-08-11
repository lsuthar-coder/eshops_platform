import { redis } from "../db/redis.js";
import { StoreConfig } from "../models/storeConfig.js";
import { NotFoundError } from "../utils/errors.js";
import { env } from "../config/env.js";

/**
 * Resolves which tenant a request belongs to, from the Host header.
 *
 * This is THE tenant-isolation boundary for Store API — every route sits
 * behind this middleware, and every DB query downstream must be scoped
 * by req.tenantId. A bug here is a cross-tenant data leak, not just a
 * bug, so keep this function small and don't let route-specific logic
 * creep into it.
 *
 * IMPORTANT DEPLOYMENT REQUIREMENT: since tenant resolution depends on
 * the Host header of the request TO THIS API, the storefront and this
 * API must be served from the SAME hostname in production — Ingress
 * should route `/api/*` on `<tenantId>.eshops.lsuthar.in` to Store API
 * and everything else to the frontend, both under that one hostname.
 * A separately-hosted API subdomain (the pattern Portal/Admin UI use)
 * would break this, since the browser's fetch would carry the API's
 * own hostname, not the tenant's.
 *
 * Lookup order:
 *   1. Redis `config:domain:<host>` — the fast path, written by Portal
 *      on tenant creation and kept current on every admin config save.
 *   2. Mongo fallback (StoreConfig.domainHost) — only hit if Redis is
 *      cold for this key (e.g. a cache flush/restart). Repopulates
 *      Redis on the way out so subsequent requests hit the fast path
 *      again.
 *   3. Neither has it → 404. An unrecognized Host header should never
 *      silently fall through to any tenant's data.
 */
export async function resolveTenant(req, res, next) {
  try {
    // Dev-only convenience: local development can't easily replicate
    // the same-hostname Ingress path-routing described above, so allow
    // an explicit override header — NEVER honored in production, so
    // this can't become a spoofing vector in a real deployment.
    const devOverride =
      env.nodeEnv !== "production" ? req.headers["x-dev-tenant-host"] : null;

    const host = (devOverride || req.headers.host || "").split(":")[0].toLowerCase();

    if (!host) {
      throw new NotFoundError("Store not found");
    }

    const cached = await redis.get(`config:domain:${host}`);
    if (cached) {
      const config = JSON.parse(cached);
      req.tenantId = config.tenantId;
      req.tenantConfig = config;
      return next();
    }

    const doc = await StoreConfig.findOne({ domainHost: host }).lean();
    if (!doc) {
      throw new NotFoundError("Store not found");
    }

    const config = { tenantId: doc.tenantId, storeName: doc.storeName };
    req.tenantId = doc.tenantId;
    req.tenantConfig = config;

    // Self-heal the cache for next time.
    await redis.set(`config:domain:${host}`, JSON.stringify(config));

    return next();
  } catch (error) {
    return next(error);
  }
}
