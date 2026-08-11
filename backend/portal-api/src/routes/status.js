import { Router } from "express";
import { getTenantStatus, getTenantStatusByMail } from "../services/portal.js";

const router = Router();

// GET /api/portal/tenants/status?mail=...
// Recovery path for refreshes/dropped connections — no tenantId needed.
router.get("/status", async (req, res, next) => {
  try {
    const result = await getTenantStatusByMail(req.query.mail);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/portal/tenants/:tenantId/status
router.get("/:tenantId/status", async (req, res, next) => {
  try {
    const result = await getTenantStatus(req.params.tenantId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
