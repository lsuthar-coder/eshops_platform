import { Router } from "express";

const router = Router();

// GET /health
// Liveness check — no tenant resolution, no auth. Used by k8s probes.
router.get("/", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

export default router;
