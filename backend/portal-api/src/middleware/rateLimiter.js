import rateLimit from "express-rate-limit";

// Store creation writes to Postgres, Mongo, and Redis in one request and
// is public-facing — cap it per IP to prevent abuse/accidental hammering.
export const createTenantLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many store creation attempts, try again later" },
});
