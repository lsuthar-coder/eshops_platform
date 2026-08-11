import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requestOtp, verifyOtp } from "../services/otp.js";

const router = Router();

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many code requests, try again later" },
});

// POST /api/portal/otp/send  { mail }
router.post("/send", otpLimiter, async (req, res, next) => {
  try {
    await requestOtp(req.body.mail);
    res.status(200).json({ message: "Code sent" });
  } catch (error) {
    next(error);
  }
});

// POST /api/portal/otp/verify  { mail, otp }
router.post("/verify", otpLimiter, async (req, res, next) => {
  try {
    await verifyOtp(req.body.mail, req.body.otp);
    res.status(200).json({ verified: true });
  } catch (error) {
    next(error);
  }
});

export default router;
