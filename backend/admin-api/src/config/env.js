import "dotenv/config";

const REQUIRED_VARS = [
  "MONGO_URI",
  "REDIS_URL",
  "JWT_SECRET",
  "POSTGRES_URL",
  "ENCRYPTION_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "PLATFORM_DOMAIN",
  "PLATFORM_INGRESS_IP",
  "JENKINS_URL",
  "JENKINS_USER",
  "JENKINS_API_TOKEN",
  "JENKINS_DOMAIN_JOB",
  "JENKINS_WEBHOOK_SECRET",
  "RESEND_API_KEY",
];

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
    port: Number(process.env.PORT) || 4100,
    nodeEnv: process.env.NODE_ENV || "development",
    allowedOrigins: (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
    mongoUri: process.env.MONGO_URI,
    redisUrl: process.env.REDIS_URL,
    jwtSecret: process.env.JWT_SECRET,
    postgresUrl: process.env.POSTGRES_URL,
    encryptionKey: process.env.ENCRYPTION_KEY,
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    // Same value Portal/Store API use — the wildcard base domain, e.g.
    // "eshops.lsuthar.in".
    platformDomain: process.env.PLATFORM_DOMAIN,
    // Static IP of the ingress load balancer — shown to admins as the
    // A-record target for their custom domain.
    platformIngressIp: process.env.PLATFORM_INGRESS_IP,
    jenkins: {
      url: process.env.JENKINS_URL,
      user: process.env.JENKINS_USER,
      apiToken: process.env.JENKINS_API_TOKEN,
      domainJob: process.env.JENKINS_DOMAIN_JOB,
      webhookSecret: process.env.JENKINS_WEBHOOK_SECRET,
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY,
    },
    adminPortalUrl: process.env.ADMIN_PORTAL_URL || null,
  };
}

export const env = loadEnv();
