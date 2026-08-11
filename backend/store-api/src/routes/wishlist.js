import { Router } from "express";
import { requireCustomerAuth } from "../middleware/requireCustomerAuth.js";

const router = Router();

// GET /api/store/wishlist
router.get("/", requireCustomerAuth, (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// POST /api/store/wishlist/:productId
// Should: verify the product belongs to req.tenantId before adding.
router.post("/:productId", requireCustomerAuth, (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// DELETE /api/store/wishlist/:productId
router.delete("/:productId", requireCustomerAuth, (req, res) => {
  return res.status(200).json({ status: "ok" });
});

export default router;
