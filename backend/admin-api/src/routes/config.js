import { Router } from "express";
import { getConfig, updateConfig, updatePage } from "../services/configService.js";

const router = Router();

// GET /api/admin/config
router.get("/config", async (req, res, next) => {
  try {
    const config = await getConfig(req.tenantId);
    res.status(200).json(config);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/config
// Body: any partial subset of the config object (theme, businessDetails,
// footer, mainPage, etc.) — merged into the existing document.
router.patch("/config", async (req, res, next) => {
  try {
    const config = await updateConfig(req.tenantId, req.body);
    res.status(200).json(config);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/pages/:type
// Body: { pageUrl, content, layout, active }
router.patch("/pages/:type", async (req, res, next) => {
  try {
    const config = await updatePage(req.tenantId, req.params.type, req.body);
    res.status(200).json(config);
  } catch (error) {
    next(error);
  }
});

export default router;
