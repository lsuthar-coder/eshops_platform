import { pool } from "../db/postgres.js";
import { encrypt, maskKey } from "../utils/encryption.js";
import { StoreConfig } from "../models/storeConfig.js";
import { ValidationError } from "../utils/errors.js";

const VALID_PROVIDERS = ["stripe", "razorpay"];

/**
 * Returns enabled/disabled + a masked key preview — never the raw key,
 * even back to the tenant's own admin. If they need to re-enter it
 * (e.g. rotating a key), that's a fresh PATCH, not a read of the old one.
 */
export async function getPaymentSettings(tenantId) {
  const result = await pool.query(
    "SELECT provider, encrypted_key FROM payment_credentials WHERE tenant_id = $1",
    [tenantId]
  );

  // We only have the ciphertext here, not the plaintext, so we can't
  // mask by "last 4 chars of the real key" without decrypting. Masking
  // is intentionally generic instead — decrypting just to throw most of
  // it away is unnecessary exposure of the plaintext in memory.
  return result.rows.map((row) => ({
    provider: row.provider,
    connected: true,
    keyPreview: "•••• (saved)",
  }));
}

export async function updatePaymentSettings(tenantId, { provider, apiKey }) {
  if (!VALID_PROVIDERS.includes(provider)) {
    throw new ValidationError(`provider must be one of: ${VALID_PROVIDERS.join(", ")}`);
  }
  if (!apiKey || typeof apiKey !== "string") {
    throw new ValidationError("apiKey is required");
  }

  const encryptedKey = encrypt(apiKey);

  await pool.query(
    `
    INSERT INTO payment_credentials (tenant_id, provider, encrypted_key, updated_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (tenant_id, provider)
    DO UPDATE SET encrypted_key = EXCLUDED.encrypted_key, updated_at = NOW()
    `,
    [tenantId, provider, encryptedKey]
  );

  // Keep the config object's enabled/disabled flag in sync — the actual
  // key lives only in Postgres, this is just the UI-facing status flag.
  await StoreConfig.updateOne(
    { tenantId, "paymentGateways.method": provider },
    { $set: { "paymentGateways.$.status": "enabled" } }
  );

  return { provider, connected: true, keyPreview: maskKey(apiKey) };
}
