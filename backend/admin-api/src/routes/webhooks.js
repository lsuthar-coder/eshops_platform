import { Router } from "express";
import { handleDomainCallback } from "../services/domainService.js";
import { verifyWebhookSecret } from "../middleware/verifyWebhookSecret.js";

const router = Router();

// POST /api/admin/webhooks/jenkins-domain-callback
// Body: { tenantId, resourcesCreated: true|false }
// No admin JWT here — this is called by Jenkins, not a logged-in admin —
// so it's authenticated by shared secret instead, and mounted OUTSIDE
// the requireAdminAuth chain in app.js.
router.post("/jenkins-domain-callback", verifyWebhookSecret, async (req, res, next) => {
  try {
    const { tenantId, resourcesCreated } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: "tenantId is required" });
    }

    const result = await handleDomainCallback({
      tenantId,
      resourcesCreated: Boolean(resourcesCreated),
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
