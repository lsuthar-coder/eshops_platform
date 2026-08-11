import { Router } from "express";
import { getPaymentSettings, updatePaymentSettings } from "../services/paymentSettingsService.js";

const router = Router();

// GET /api/admin/payment-settings
router.get("/", async (req, res, next) => {
  try {
    const settings = await getPaymentSettings(req.tenantId);
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/payment-settings
// Body: { provider: "stripe" | "razorpay", apiKey }
router.patch("/", async (req, res, next) => {
  try {
    const result = await updatePaymentSettings(req.tenantId, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
