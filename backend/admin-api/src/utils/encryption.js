import crypto from "node:crypto";
import { env } from "../config/env.js";

const ALGORITHM = "aes-256-gcm";

/**
 * Symmetric encryption for the payment_credentials table. The key comes
 * from an env var here (ENCRYPTION_KEY) for simplicity — in production
 * this key should be issued and rotated by a proper secrets manager
 * (Vault, per the platform's observability/secrets plan), not sitting
 * in a .env file. This is a deliberate, documented simplification, not
 * an oversight.
 */
function getKey() {
  const key = Buffer.from(env.encryptionKey, "hex");
  if (key.length !== 32) {
    throw new Error(
      "ENCRYPTION_KEY must be a 32-byte value, hex-encoded (64 hex chars)"
    );
  }
  return key;
}

export function encrypt(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Store iv + authTag alongside the ciphertext — all needed to decrypt.
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decrypt(payload) {
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8"
  );
}

/** Never return a raw key to the client — this is what admin UIs should show instead. */
export function maskKey(plaintext) {
  if (!plaintext || plaintext.length < 4) return "••••";
  return `••••${plaintext.slice(-4)}`;
}
