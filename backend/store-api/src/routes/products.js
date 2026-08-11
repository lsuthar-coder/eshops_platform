import { Router } from "express";

const router = Router();

// GET /api/store/products
// Query: ?page=&limit=&categoryId=&q=
// Should: paginated list of products WHERE tenantId = req.tenantId,
// optionally filtered by categoryId and/or a text search on q.
// Never accept tenantId from the query string — always req.tenantId.
router.get("/", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// GET /api/store/products/featured
// Should: products WHERE tenantId = req.tenantId AND isFeatured = true.
router.get("/featured", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

// GET /api/store/products/:slug
// Should: single product WHERE tenantId = req.tenantId AND slug =
// req.params.slug. 404 if not found OR belongs to a different tenant
// (don't leak existence of another tenant's product via a 403 vs 404
// distinction — just 404 either way).
router.get("/:slug", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

export default router;
