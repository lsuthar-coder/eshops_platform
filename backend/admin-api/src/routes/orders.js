import { Router } from "express";
import { Order } from "../models/order.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

const router = Router();

const VALID_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

// GET /api/admin/orders
router.get("/", async (req, res, next) => {
  try {
    const filter = { tenantId: req.tenantId };
    if (req.query.status) filter.status = req.query.status;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/orders/:id
router.get("/:id", async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/orders/:id/status
// Body: { status }
router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      throw new ValidationError(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { status },
      { new: true }
    );

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
});

export default router;
