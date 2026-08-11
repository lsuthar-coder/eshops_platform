import { Router } from "express";
import { optionalCustomerAuth } from "../middleware/requireCustomerAuth.js";

const router = Router();

// GET /api/store/cart
// Should: return the current cart. If req.userId is set (logged in),
// load by (tenantId, userId). If anonymous, cart should be tracked via
// a session/cart-id cookie instead — decide and document the approach
// before implementing, since guest checkout depends on it.
router.get("/", optionalCustomerAuth, (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// POST /api/store/cart/items
// Body: { productId, qty, variant? }
// Should: add an item, scoped by tenantId + (userId or guest cart id).
// Validate the product actually belongs to req.tenantId before adding.
router.post("/items", optionalCustomerAuth, (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// PATCH /api/store/cart/items/:id
// Body: { qty }
router.patch("/items/:id", optionalCustomerAuth, (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// DELETE /api/store/cart/items/:id
router.delete("/items/:id", optionalCustomerAuth, (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// POST /api/store/checkout
// Body: { shippingAddress, paymentMethod, ... }
// Should: snapshot cart items into an order (copy name/price at time of
// purchase, don't just store productId references), charge via the
// tenant's configured payment gateway (keys come from the separate
// encrypted sensitive-data store, never from this service's own DB),
// clear the cart on success.
router.post("/checkout", optionalCustomerAuth, (req, res) => {
  return res.status(200).json({ status: "ok" });
});

export default router;
