import { getUploadSignature } from "../api/adminApi";

/**
 * Uploads a File directly to Cloudinary using a signature issued by
 * Admin API — the backend never receives the image bytes. The folder
 * is already tenant-scoped by the backend (tenantId/<folder>), so this
 * function can't be pointed at another tenant's folder even if misused.
 */
export async function uploadToCloudinary(file, folder) {
  const { signature, timestamp, folder: scopedFolder, apiKey, cloudName } =
    await getUploadSignature(folder);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", scopedFolder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Upload failed");
  }

  return data.secure_url;
}
