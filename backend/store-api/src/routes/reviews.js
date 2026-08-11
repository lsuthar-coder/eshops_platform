import { Router } from "express";
import { requireCustomerAuth } from "../middleware/requireCustomerAuth.js";

const router = Router();

// GET /api/store/products/:id/reviews
// Should: reviews WHERE tenantId = req.tenantId AND productId =
// req.params.id AND status = 'approved' (customers should only ever
// see approved reviews — pending/rejected are Admin API's concern).
router.get("/products/:id/reviews", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// POST /api/store/products/:id/reviews
// Requires auth. Body: { rating, comment }
// Should: insert scoped by tenantId, userId, productId. Default
// status per your moderation policy — 'approved' if auto-approving
// for v1, 'pending' if moderation is enabled.
router.post("/products/:id/reviews", requireCustomerAuth, (req, res) => {
  return res.status(200).json({ status: "ok" });
});

export default router;
