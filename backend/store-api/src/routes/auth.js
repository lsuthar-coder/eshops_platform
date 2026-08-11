import { Router } from "express";
import { requireCustomerAuth } from "../middleware/requireCustomerAuth.js";

const router = Router();

// POST /api/store/auth/register
// Body: { name, email, password }
// Should: validate input, check email uniqueness WITHIN this tenant
// (users are scoped by tenantId — same email can exist across
// different tenants), hash password, insert into `users` collection
// with tenantId = req.tenantId, issue a JWT with { sub: userId,
// tenantId: req.tenantId }.
router.post("/register", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// POST /api/store/auth/login
// Body: { email, password }
// Should: look up user scoped by (tenantId, email), verify password
// hash, issue a JWT with { sub: userId, tenantId: req.tenantId }.
router.post("/login", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// POST /api/store/auth/logout
// Should: if using refresh tokens/session storage, invalidate here.
// With stateless JWTs this may just be a client-side token discard —
// document whichever approach is chosen.
router.post("/logout", requireCustomerAuth, (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// GET /api/store/auth/me
// Requires auth. Should: return the current user's profile, scoped by
// req.userId + req.tenantId (never trust a userId from the client).
router.get("/me", requireCustomerAuth, (req, res) => {
  return res.status(200).json({ status: "ok" });
});

export default router;
