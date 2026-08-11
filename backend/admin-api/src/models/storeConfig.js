import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Corrections applied vs. the draft this was based on:
 *  - tenantId (not store_id) — matches the field name used by every
 *    other service (Portal, Store API, Redis keys, JWT claims). Mixing
 *    names across services is exactly the kind of thing that causes a
 *    silent cross-service bug.
 *  - footer.columnCount is NOT stored — it's derived from which of
 *    links/socialMedia are non-empty. Storing it lets it drift out of
 *    sync the moment content changes without every write path
 *    remembering to recompute it. The admin frontend computes it for
 *    preview; it is intentionally absent here.
 *  - banners: "main" (hero) placement is a single image; "scroll"
 *    (carousel) placement is the only one that holds multiple images —
 *    the previous shape gave every banner an array regardless of type.
 *  - banners/pages both got an `active`/`enabled` flag so content can be
 *    paused without deleting it, consistent with everything else in
 *    this schema.
 *  - theme keeps the free-form colors as given (not the earlier
 *    predefined-palette design) — flagging this again here: free-form
 *    color entry has no contrast/accessibility guardrail. If that's a
 *    deliberate reopening of that decision, fine; if not, worth
 *    revisiting before real merchants use this.
 */

const bannerImageSchema = new Schema(
  { imageUrl: String, linkUrl: String },
  { _id: false }
);

const bannerSchema = new Schema(
  {
    placement: { type: Number, required: true }, // 1 = top, increasing
    type: { type: String, enum: ["main", "scroll"], required: true },
    clickable: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    // "main" should realistically hold one entry; "scroll" holds many.
    // Not enforced at the schema level to avoid over-constraining early —
    // enforce it in the route handler/validation instead.
    images: [bannerImageSchema],
  },
  { _id: true }
);

const pageContentBlockSchema = new Schema(
  { text: String, imageUrl: String },
  { _id: false }
);

const pageSchema = new Schema(
  {
    pageName: { type: String, required: true },
    pageUrl: { type: String, required: true },
    content: [pageContentBlockSchema],
    layout: { type: String, enum: ["zig_zag", "list"], default: "zig_zag" },
    active: { type: Boolean, default: true },
  },
  { _id: true }
);

const storeConfigSchema = new Schema(
  {
    tenantId: { type: String, required: true, unique: true, index: true },
    storeName: { type: String, required: true },

    // Derived from tenantId at read time (https://<tenantId>.eshops...),
    // not stored — see storeUrl getter usage in routes instead of a field.

    domain: {
      domainName: { type: String, default: null },
      status: {
        type: String,
        enum: ["pending", "verified", "rejected", "suspended"],
        default: null,
      },
      updatedAt: { type: Date, default: null }, // set whenever domainName changes; anchors the 7/14-day clock
      certIssued: { type: Boolean, default: false },
      // Set when the 7-day alert email goes out, so the lifecycle job
      // never sends it twice for the same pending attempt. Cleared
      // whenever domainName changes (fresh attempt, fresh clock).
      alertSentAt: { type: Date, default: null },
    },

    theme: {
      primaryColor: String,
      secondaryColor: String,
      tertiaryColor: String,
      fontFamily: String,
      lightDarkModeEnabled: { type: Boolean, default: false },
    },

    favicon: { type: String, default: null }, // Cloudinary URL
    logo: {
      main: { type: String, default: null },
      small: { type: String, default: null },
    },

    // Enabled/disabled flags only — actual keys live in the separate
    // payment_credentials Postgres table, encrypted, never in Mongo.
    paymentGateways: [
      {
        _id: false,
        method: { type: String, enum: ["stripe", "razorpay"] },
        status: { type: String, enum: ["enabled", "disabled"], default: "disabled" },
      },
    ],

    businessDetails: {
      businessName: String,
      businessEmail: String,
      businessPhone: String,
      businessAddress: String,
      gstNumber: String,
    },

    customerSupport: {
      email: String,
      phone: String,
    },

    footer: {
      links: [{ _id: false, name: String, url: String }],
      socialMedia: [{ _id: false, platform: String, url: String, text: String }],
      // columnCount intentionally NOT a field — derive in the frontend.
    },

    mainPage: {
      banners: [bannerSchema],
      featuredProductIds: [{ type: String }],
      categoryIds: [{ type: String }],
    },

    searchPage: {
      enabledFilters: [{ type: String }],
    },

    pages: [pageSchema],

    gallery: {
      enabled: { type: Boolean, default: false },
      images: [{ _id: false, imageUrl: String, caption: String }],
    },
  },
  { timestamps: true }
);

export const StoreConfig = mongoose.model("StoreConfig", storeConfigSchema);
