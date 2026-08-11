import mongoose from "mongoose";

import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import app from "./app.js";
import { connectMongo } from "./db/mongo.js";
import { redis } from "./db/redis.js";

let server;

async function start() {
  try {
    await connectMongo();
    await redis.ping();
    logger.info("Redis connected");

    server = app.listen(env.port, () => {
      logger.info(`Store API running on port ${env.port}`);
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start application");
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`);

  if (server) server.close();

  await Promise.allSettled([mongoose.connection.close(), redis.quit()]);
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start();
