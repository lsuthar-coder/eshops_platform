import { Router } from "express";
import { env } from "../config/env.js";

const router = Router();

// GET /api/store/config
// req.tenantConfig is already attached by resolveTenant (the "store
// not found" case is handled there — an unrecognized Host header never
// reaches this handler at all). This just adds the always-on generated
// URL, computed rather than stored, since it's fully derived from
// tenantId + the platform domain.
router.get("/config", (req, res) => {
  const config = req.tenantConfig;

  return res.status(200).json({
    ...config,
    generatedUrl: `https://${config.tenantId}.${env.platformDomain}`,
  });
});

// GET /api/store/pages/:type
// Should: return the content block for that page type, scoped by
// req.tenantId, from the `pages` field of the store config document.
// Still a stub — not part of this delivery's scope.
router.get("/pages/:type", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

export default router;
