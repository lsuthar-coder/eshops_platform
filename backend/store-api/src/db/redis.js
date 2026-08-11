import Redis from "ioredis";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const redis = new Redis(env.redisUrl);

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (error) => logger.error({ err: error }, "Redis error"));
