import { Router } from "express";

const router = Router();

// GET /api/store/categories
// Should: categories WHERE tenantId = req.tenantId, ordered by `order`.
router.get("/categories", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// GET /api/store/search
// Query: ?q=
// Should: text search on products.name/description WHERE tenantId =
// req.tenantId. Use the compound (tenantId, text-index) so search never
// crosses tenant boundaries.
router.get("/search", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

export default router;
