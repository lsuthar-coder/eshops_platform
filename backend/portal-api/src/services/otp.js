import crypto from "node:crypto";
import { redis } from "../db/redis.js";
import { sendOtpEmail } from "./email.js";
import { ValidationError, RateLimitedError } from "../utils/errors.js";

const OTP_TTL_SECONDS = 5 * 60;
const VERIFIED_TTL_SECONDS = 15 * 60;
const RESEND_COOLDOWN_SECONDS = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

function validateMail(mail) {
  if (!mail || typeof mail !== "string" || !EMAIL_RE.test(mail)) {
    throw new ValidationError("A valid mail is required");
  }
}

export async function requestOtp(mail) {
  validateMail(mail);

  const cooldownKey = `otp:cooldown:${mail}`;
  const onCooldown = await redis.get(cooldownKey);
  if (onCooldown) {
    throw new RateLimitedError(
      "Please wait before requesting another code"
    );
  }

  const otp = generateOtp();
  await redis.set(`otp:${mail}`, otp, "EX", OTP_TTL_SECONDS);
  await redis.set(cooldownKey, "1", "EX", RESEND_COOLDOWN_SECONDS);

  await sendOtpEmail({ to: mail, otp });
}

export async function verifyOtp(mail, otp) {
  validateMail(mail);

  if (!otp || typeof otp !== "string") {
    throw new ValidationError("A valid code is required");
  }

  const key = `otp:${mail}`;
  const stored = await redis.get(key);

  if (!stored || stored !== otp) {
    throw new ValidationError("Invalid or expired code");
  }

  await redis.del(key);
  await redis.set(`otp:verified:${mail}`, "1", "EX", VERIFIED_TTL_SECONDS);
}

export async function isMailVerified(mail) {
  const verified = await redis.get(`otp:verified:${mail}`);
  return Boolean(verified);
}

export async function consumeMailVerification(mail) {
  await redis.del(`otp:verified:${mail}`);
}
