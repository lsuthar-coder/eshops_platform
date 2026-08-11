import { Router } from "express";
import { createTenant } from "../services/portal.js";
import { createTenantLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// POST /api/portal/tenants
router.post("/", createTenantLimiter, async (req, res, next) => {
  try {
    const result = await createTenant(req.body);
    res.status(202).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
