import crypto from "node:crypto";
import { env } from "../config/env.js";

/**
 * Generates a Cloudinary signed-upload signature scoped to this
 * tenant's folder. The frontend uploads directly to Cloudinary using
 * this signature — the backend never touches the image bytes. Scoping
 * the `folder` param to tenantId is what actually prevents an admin
 * from uploading into another tenant's folder; the signature is only
 * valid for the exact params it was generated for, so a client can't
 * alter `folder` after the fact without invalidating it.
 *
 * Implemented via Cloudinary's documented signing algorithm directly
 * (SHA-1 of the sorted param string + api secret) rather than pulling
 * in the full Cloudinary SDK for one function.
 */
export function generateUploadSignature({ tenantId, folder }) {
  const timestamp = Math.floor(Date.now() / 1000);
  const scopedFolder = folder ? `${tenantId}/${folder}` : tenantId;

  const paramsToSign = { folder: scopedFolder, timestamp };

  const sortedParamString = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(sortedParamString + env.cloudinary.apiSecret)
    .digest("hex");

  return {
    signature,
    timestamp,
    folder: scopedFolder,
    apiKey: env.cloudinary.apiKey,
    cloudName: env.cloudinary.cloudName,
  };
}
