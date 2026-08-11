import mongoose from "mongoose";

const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
    productId: String,
    name: String, // snapshot at time of purchase — don't rely on live product data
    price: Number,
    qty: Number,
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: String, default: null }, // null = guest checkout
    items: [orderItemSchema],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: { type: Schema.Types.Mixed, default: {} },
    customerEmail: { type: String, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ tenantId: 1, status: 1 });

export const Order = mongoose.model("Order", orderSchema);
