import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export async function connectMongo() {
  await mongoose.connect(env.mongoUri);
  logger.info("MongoDB connected");
}
