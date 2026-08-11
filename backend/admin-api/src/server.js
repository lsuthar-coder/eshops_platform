import mongoose from "mongoose";
import cron from "node-cron";

import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import app from "./app.js";
import { connectMongo } from "./db/mongo.js";
import { redis } from "./db/redis.js";
import { checkPostgresConnection, pool } from "./db/postgres.js";
import { runCertificateReadinessCheck } from "./jobs/certificateReadinessJob.js";
import { runDomainLifecycleCheck } from "./jobs/domainLifecycleJob.js";

let server;
let scheduledTasks = [];

async function start() {
  try {
    await checkPostgresConnection();
    logger.info("PostgreSQL connected");

    await connectMongo();

    await redis.ping();
    logger.info("Redis connected");

    server = app.listen(env.port, () => {
      logger.info(`Admin API running on port ${env.port}`);
    });

    // Certificate readiness: frequent, cheap check (K8s API read only).
    // Every 10 minutes is a reasonable balance between "verified"
    // appearing promptly and not hammering the K8s API.
    scheduledTasks.push(
      cron.schedule("*/10 * * * *", () => {
        runCertificateReadinessCheck().catch((error) =>
          logger.error({ err: error }, "Certificate readiness check failed")
        );
      })
    );

    // Domain lifecycle (7-day alert / 14-day suspend): daily is enough,
    // these are day-granularity thresholds, not minute-granularity.
    scheduledTasks.push(
      cron.schedule("0 9 * * *", () => {
        runDomainLifecycleCheck().catch((error) =>
          logger.error({ err: error }, "Domain lifecycle check failed")
        );
      })
    );

    logger.info("Scheduled jobs started (certificate readiness, domain lifecycle)");
  } catch (error) {
    logger.error({ err: error }, "Failed to start application");
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`);

  scheduledTasks.forEach((task) => task.stop());
  if (server) server.close();

  await Promise.allSettled([
    mongoose.connection.close(),
    redis.quit(),
    pool.end(),
  ]);
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start();
