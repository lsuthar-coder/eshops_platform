import { Router } from "express";
import { Review } from "../models/review.js";

const router = Router();

// GET /api/admin/reviews
// Query: ?productId=... (optional — filters to one product's reviews)
router.get("/", async (req, res, next) => {
  try {
    const filter = { tenantId: req.tenantId };
    if (req.query.productId) filter.productId = req.query.productId;

    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
});

export default router;
