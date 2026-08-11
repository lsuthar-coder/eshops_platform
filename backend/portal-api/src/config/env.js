import "dotenv/config";

const REQUIRED_VARS = [
  "POSTGRES_URL",
  "MONGO_URI",
  "REDIS_URL",
  "PLATFORM_DOMAIN",
  "RESEND_API_KEY",
  "ADMIN_PORTAL_URL",
];

function loadEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    // Fail fast and loud — a half-configured service should never start.
    // eslint-disable-next-line no-console
    console.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
    process.exit(1);
  }

  return {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    allowedOrigins: (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    // Expected to be "eshops.lsuthar.in" — the wildcard Ingress/cert cover
    // *.eshops.lsuthar.in, so every tenant subdomain works with no new
    // Kubernetes object created per tenant.
    platformDomain: process.env.PLATFORM_DOMAIN,
    postgresUrl: process.env.POSTGRES_URL,
    mongoUri: process.env.MONGO_URI,
    redisUrl: process.env.REDIS_URL,
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
    resend: {
      apiKey: process.env.RESEND_API_KEY,
    },
    // Fixed URL every store admin logs into — placeholder until the Admin
    // Portal app exists. Same URL regardless of tenant; the tenant is
    // resolved from the admin's JWT after they log in, not the hostname.
    adminPortalUrl: process.env.ADMIN_PORTAL_URL,
  };
}

export const env = loadEnv();
