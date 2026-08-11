import mongoose from "mongoose";

// Minimal config object for Phase 2 — extend with theme/contact/banners/pages
// per the full store-config schema once the Admin API is built out.
const storeConfigSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    storeUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const StoreConfig = mongoose.model("StoreConfig", storeConfigSchema);
