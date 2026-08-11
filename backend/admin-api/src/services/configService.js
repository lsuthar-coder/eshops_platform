import { StoreConfig } from "../models/storeConfig.js";
import { redis } from "../db/redis.js";
import { NotFoundError } from "../utils/errors.js";

/**
 * Flattens a nested patch object into dot-notation keys for MongoDB's
 * $set — e.g. { logo: { main: "x" } } becomes { "logo.main": "x" }.
 *
 * This matters: a plain `$set: { logo: { main: "x" } }` REPLACES the
 * entire `logo` subdocument, silently wiping `small` if it wasn't
 * included in this particular request. Flattening means a PATCH that
 * only sends one nested field only touches that field.
 *
 * Arrays are treated as leaf values (replaced wholesale, not merged) —
 * merging array elements by position/id is ambiguous without more
 * context than a generic patch flattener can safely assume, so callers
 * updating an array (banners, pages, footer.links, etc.) should send
 * the full array they want to persist.
 */
function flattenPatch(obj, prefix = "") {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      Object.assign(result, flattenPatch(value, path));
    } else {
      result[path] = value;
    }
  }

  return result;
}

/**
 * Fields exposed to the storefront's public GET /config — mirrors what
 * Store API's resolveTenant middleware caches in Redis. Kept intentionally
 * small; the full document (returned to the admin UI) can carry more.
 */
function toPublicConfig(doc) {
  return {
    tenantId: doc.tenantId,
    storeName: doc.storeName,
    domain: doc.domain,
    theme: doc.theme,
    favicon: doc.favicon,
    logo: doc.logo,
    businessDetails: doc.businessDetails,
    customerSupport: doc.customerSupport,
    footer: doc.footer,
    mainPage: doc.mainPage,
    searchPage: doc.searchPage,
    pages: doc.pages,
    gallery: doc.gallery,
  };
}

async function writeThroughCache(doc) {
  const publicConfig = toPublicConfig(doc);
  const domainHost = `${doc.tenantId}.eshops.lsuthar.in`; // adjust if PLATFORM_DOMAIN differs

  await Promise.all([
    redis.set(`config:domain:${domainHost}`, JSON.stringify(publicConfig)),
    redis.set(`config:uuid:${doc.tenantId}`, JSON.stringify(publicConfig)),
  ]);
}

export async function getConfig(tenantId) {
  const doc = await StoreConfig.findOne({ tenantId });
  if (!doc) {
    throw new NotFoundError("Store config not found");
  }
  return doc;
}

/**
 * Partial update — merges the given patch into the existing document
 * rather than requiring the full object every time, then writes
 * through to Redis in the SAME request so there's no stale-read window
 * right after a save (matches the write-through requirement noted
 * throughout the design docs).
 */
export async function updateConfig(tenantId, patch) {
  // If the admin is setting/changing the custom domain, reset
  // verification state — a previously-verified status must not survive
  // a domain change, or the storefront could show "verified" for a
  // domain that was never actually checked.
  if (patch.domain?.domainName) {
    patch.domain.status = "pending";
    patch.domain.updatedAt = new Date();
  }

  const doc = await StoreConfig.findOneAndUpdate(
    { tenantId },
    { $set: flattenPatch(patch) },
    { new: true, upsert: false }
  );

  if (!doc) {
    throw new NotFoundError("Store config not found");
  }

  await writeThroughCache(doc);
  return doc;
}

export async function updatePage(tenantId, pageType, pageData) {
  // pages is an array of named pages, not a fixed enum — find-or-create
  // by pageName within this tenant's document.
  const doc = await StoreConfig.findOne({ tenantId });
  if (!doc) {
    throw new NotFoundError("Store config not found");
  }

  const existingIndex = doc.pages.findIndex((p) => p.pageName === pageType);
  if (existingIndex >= 0) {
    doc.pages[existingIndex] = { ...doc.pages[existingIndex].toObject(), ...pageData };
  } else {
    doc.pages.push({ pageName: pageType, ...pageData });
  }

  await doc.save();
  await writeThroughCache(doc);
  return doc;
}
