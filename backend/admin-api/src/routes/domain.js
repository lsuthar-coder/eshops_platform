import { Router } from "express";
import { submitDomain, getDomainStatus } from "../services/domainService.js";

const router = Router();

// POST /api/admin/domain
// Body: { domainName }
// Updates config (status -> pending), triggers the Jenkins pipeline
// that creates the Ingress + Certificate. Returns immediately — the
// actual verification result arrives later via the readiness job, not
// this response.
router.post("/", async (req, res, next) => {
  try {
    const domain = await submitDomain(req.tenantId, req.body.domainName);
    res.status(202).json(domain);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/domain/status
// Returns current domain status plus the DNS setup instructions and
// target IP the admin frontend displays.
router.get("/status", async (req, res, next) => {
  try {
    const status = await getDomainStatus(req.tenantId);
    res.status(200).json(status);
  } catch (error) {
    next(error);
  }
});

export default router;
