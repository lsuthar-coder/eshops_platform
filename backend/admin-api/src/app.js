import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAdminAuth } from "./middleware/requireAdminAuth.js";

import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import configRouter from "./routes/config.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";
import reviewsRouter from "./routes/reviews.js";
import assetsRouter from "./routes/assets.js";
import paymentSettingsRouter from "./routes/paymentSettings.js";
import domainRouter from "./routes/domain.js";
import webhooksRouter from "./routes/webhooks.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.allowedOrigins.length > 0 ? env.allowedOrigins : false,
  })
);
app.use(express.json({ limit: "300kb" }));
app.use(pinoHttp({ logger }));

app.use("/health", healthRouter);

// No admin JWT on these — login has no token yet, and the webhook is
// called by Jenkins (authenticated by shared secret instead). Both are
// mounted before requireAdminAuth for that reason.
app.use("/api/admin/auth", authRouter);
app.use("/api/admin/webhooks", webhooksRouter);

app.use("/api/admin", requireAdminAuth);

app.use("/api/admin", configRouter);
app.use("/api/admin/products", productsRouter);
app.use("/api/admin/orders", ordersRouter);
app.use("/api/admin/reviews", reviewsRouter);
app.use("/api/admin/assets", assetsRouter);
app.use("/api/admin/payment-settings", paymentSettingsRouter);
app.use("/api/admin/domain", domainRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

export default app;
