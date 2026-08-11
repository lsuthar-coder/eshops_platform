import { Router } from "express";
import { login, getAdminProfile } from "../services/authService.js";
import { requireAdminAuth } from "../middleware/requireAdminAuth.js";

const router = Router();

// POST /api/admin/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const result = await login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/auth/me
router.get("/me", requireAdminAuth, async (req, res, next) => {
  try {
    const profile = await getAdminProfile(req.tenantId);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
});

export default router;
