import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";

/**
 * Expects a customer JWT signed at login with at least:
 *   { sub: userId, tenantId }
 *
 * The tenantId claim is checked against req.tenantId, which
 * resolveTenant already set from the Host header. This is the actual
 * security-critical check: without it, a customer logged into Store A
 * could replay their token against Store B's API and it would decode
 * fine (same signing secret, shared across all tenants) — the mismatch
 * check is what stops that, not the signature alone.
 *
 * Must run AFTER resolveTenant in the middleware chain.
 */
function verifyAndCheckTenant(token, expectedTenantId) {
  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new UnauthorizedError("Invalid or expired session");
  }

  if (!decoded.tenantId || decoded.tenantId !== expectedTenantId) {
    throw new ForbiddenError("Session is not valid for this store");
  }

  return decoded;
}

function extractToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

/** Hard requirement — rejects the request if no valid session is present. */
export function requireCustomerAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new UnauthorizedError("Sign in required");
    }

    const decoded = verifyAndCheckTenant(token, req.tenantId);
    req.userId = decoded.sub;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Soft requirement — attaches req.userId if a valid session is present,
 * but lets anonymous requests through. Needed for routes that support
 * guest checkout.
 */
export function optionalCustomerAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();

    const decoded = verifyAndCheckTenant(token, req.tenantId);
    req.userId = decoded.sub;
    next();
  } catch {
    // An invalid token on an optional route is treated as anonymous,
    // not an error — the route itself doesn't require auth.
    next();
  }
}
