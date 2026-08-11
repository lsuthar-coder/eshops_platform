import "dotenv/config";

const REQUIRED_VARS = ["MONGO_URI", "REDIS_URL", "JWT_SECRET", "PLATFORM_DOMAIN"];

function loadEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
    process.exit(1);
  }

  return {
    port: Number(process.env.PORT) || 4000,
    nodeEnv: process.env.NODE_ENV || "development",
    allowedOrigins: (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
    mongoUri: process.env.MONGO_URI,
    redisUrl: process.env.REDIS_URL,
    jwtSecret: process.env.JWT_SECRET,
    // Used to build the always-on generated URL for a tenant:
    // https://<tenantId>.<platformDomain> — same value Portal used.
    platformDomain: process.env.PLATFORM_DOMAIN,
  };
}

export const env = loadEnv();
