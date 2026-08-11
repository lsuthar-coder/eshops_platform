import { Router } from "express";
import { Product } from "../models/product.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

const router = Router();

// GET /api/admin/products
router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find({ tenantId: req.tenantId }).sort({
      createdAt: -1,
    });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/products
// Body: { name, description, price, categoryId, images, stockQty, isFeatured }
router.post("/", async (req, res, next) => {
  try {
    const { name, price } = req.body;
    if (!name || typeof price !== "number" || price < 0) {
      throw new ValidationError("name and a valid price are required");
    }

    const product = await Product.create({
      ...req.body,
      tenantId: req.tenantId,
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/products/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await Product.deleteOne({
      _id: req.params.id,
      tenantId: req.tenantId, // scoping the delete itself, not just the lookup
    });

    if (result.deletedCount === 0) {
      throw new NotFoundError("Product not found");
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

export default router;
