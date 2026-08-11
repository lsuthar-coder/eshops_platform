import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";

import healthRouter from "./routes/health.js";
import portalRouter from "./routes/portal.js";
import statusRouter from "./routes/status.js";
import otpRouter from "./routes/otp.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.allowedOrigins.length > 0 ? env.allowedOrigins : false,
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(pinoHttp({ logger }));

app.use("/health", healthRouter);
app.use("/api/portal/tenants", portalRouter);
app.use("/api/portal/tenants", statusRouter);
app.use("/api/portal/otp", otpRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

export default app;
