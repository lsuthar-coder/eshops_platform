import { Router } from "express";
import { generateUploadSignature } from "../utils/cloudinary.js";
import { updateConfig } from "../services/configService.js";

const router = Router();

// POST /api/admin/assets/upload-signature
// Body: { folder? } — e.g. "products", "banners", "logo"
// Returns everything the frontend needs to upload directly to
// Cloudinary (signature, timestamp, folder, apiKey, cloudName) —
// image bytes never pass through this backend.
router.post("/upload-signature", (req, res) => {
  const signaturePayload = generateUploadSignature({
    tenantId: req.tenantId,
    folder: req.body.folder,
  });

  res.status(200).json(signaturePayload);
});

// PATCH /api/admin/assets/logo
// Body: { main?, small? } — Cloudinary URLs, already uploaded by the
// frontend using the signature above.
router.patch("/logo", async (req, res, next) => {
  try {
    const { main, small } = req.body;
    const patch = { logo: {} };
    if (main !== undefined) patch.logo.main = main;
    if (small !== undefined) patch.logo.small = small;

    const config = await updateConfig(req.tenantId, patch);
    res.status(200).json({ logo: config.logo });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/assets/favicon
// Body: { url }
router.patch("/favicon", async (req, res, next) => {
  try {
    const config = await updateConfig(req.tenantId, { favicon: req.body.url });
    res.status(200).json({ favicon: config.favicon });
  } catch (error) {
    next(error);
  }
});

export default router;
