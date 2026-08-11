import { Router } from "express";
import { requireCustomerAuth } from "../middleware/requireCustomerAuth.js";

const router = Router();

// GET /api/store/orders
// Requires auth. Should: orders WHERE tenantId = req.tenantId AND
// userId = req.userId — a customer must only ever see their own orders.
router.get("/", requireCustomerAuth, (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// GET /api/store/orders/:id
// Requires auth. Should: single order WHERE tenantId = req.tenantId AND
// userId = req.userId AND _id = req.params.id — checking userId here is
// what stops one customer from viewing another customer's order by
// guessing/incrementing an id.
router.get("/:id", requireCustomerAuth, (req, res) => {
  return res.status(200).json({ status: "ok" });
});

export default router;
