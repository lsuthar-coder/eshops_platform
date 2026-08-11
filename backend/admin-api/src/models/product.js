import mongoose from "mongoose";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    categoryId: { type: String, default: null },
    images: [{ type: String }], // Cloudinary URLs
    stockQty: { type: Number, default: 0, min: 0 },
    stockStatus: {
      type: String,
      enum: ["in_stock", "out_of_stock", "low_stock"],
      default: "in_stock",
    },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ tenantId: 1, categoryId: 1 });

export const Product = mongoose.model("Product", productSchema);
