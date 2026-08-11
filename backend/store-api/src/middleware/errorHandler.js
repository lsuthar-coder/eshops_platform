import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  logger.error({ err: error, path: req.path }, "Request failed");

  res.status(statusCode).json({
    error:
      statusCode === 500 && env.nodeEnv === "production"
        ? "Internal server error"
        : error.message,
  });
}
