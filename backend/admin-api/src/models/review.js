import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    userId: { type: String, default: null },
    authorName: { type: String, default: "Anonymous" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // auto-approve for v1; flip the default if moderation is enabled later
    },
  },
  { timestamps: true }
);

reviewSchema.index({ tenantId: 1, productId: 1 });

export const Review = mongoose.model("Review", reviewSchema);
