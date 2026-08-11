import mongoose from "mongoose";

// Mirrors the StoreConfig collection written by Portal on tenant creation.
// This service only ever reads it (Store API doesn't own store creation),
// except for domainHost, which Store API backfills on a cache-miss read
// to make future fallback lookups a direct indexed match.
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
    // Derived from storeUrl (or a verified custom domain, once that
    // exists) — indexed for the Redis-cache-miss fallback path in
    // resolveTenant.
    domainHost: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

export const StoreConfig = mongoose.model("StoreConfig", storeConfigSchema);
