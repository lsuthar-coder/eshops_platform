import crypto from "node:crypto";
import { env } from "../config/env.js";

export function verifyWebhookSecret(req, res, next) {
  const provided = req.header("x-webhook-secret") || "";
  const expected = env.jenkins.webhookSecret;

  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);

  const isValid =
    providedBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(providedBuf, expectedBuf);

  if (!isValid) {
    return res.status(401).json({ error: "Invalid webhook secret" });
  }

  next();
}
