import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";

/**
 * IMPORTANT ARCHITECTURAL DIFFERENCE FROM STORE API:
 *
 * Store API resolves the tenant from the Host header, because every
 * store has its own subdomain. Admin API can't do that — every tenant's
 * admin logs into the SAME fixed URL (ADMIN_PORTAL_URL, e.g.
 * admin.lsuthar.in), so there is no per-tenant hostname to read.
 *
 * That means THIS middleware is the tenant-resolution boundary for
 * Admin API, not a separate resolveTenant step. The admin's JWT (issued
 * at login by POST /api/admin/auth/login, once that route is
 * implemented) must carry a tenantId claim, and every route handler
 * downstream must scope its queries by req.tenantId exactly the way
 * Store API's routes scope by the tenantId that resolveTenant sets —
 * the source is different, the discipline required is identical.
 *
 * Expected JWT payload: { sub: adminId, tenantId, role: "admin" }
 */
export function requireAdminAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedError("Sign in required");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch {
      throw new UnauthorizedError("Invalid or expired session");
    }

    if (!decoded.tenantId || decoded.role !== "admin") {
      throw new UnauthorizedError("Invalid session");
    }

    req.tenantId = decoded.tenantId;
    req.adminId = decoded.sub;
    next();
  } catch (error) {
    next(error);
  }
}
