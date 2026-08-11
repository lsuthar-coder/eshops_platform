import { Router } from "express";

const router = Router();

// GET /health
router.get("/", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

export default router;
