import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { resolveTenant } from "./middleware/resolveTenant.js";

import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import configRouter from "./routes/config.js";
import productsRouter from "./routes/products.js";
import categoriesRouter from "./routes/categories.js";
import cartRouter from "./routes/cart.js";
import ordersRouter from "./routes/orders.js";
import wishlistRouter from "./routes/wishlist.js";
import reviewsRouter from "./routes/reviews.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.allowedOrigins.length > 0 ? env.allowedOrigins : false,
  })
);
app.use(express.json({ limit: "200kb" }));
app.use(pinoHttp({ logger }));

// Liveness check — no tenant resolution needed.
app.use("/health", healthRouter);

// Every route below this line runs behind resolveTenant. req.tenantId
// is guaranteed to be set (or the request already 404'd) by the time
// any of these handlers run.
app.use(resolveTenant);

app.use("/api/store/auth", authRouter);
app.use("/api/store", configRouter);
app.use("/api/store/products", productsRouter);
app.use("/api/store", categoriesRouter);
app.use("/api/store/cart", cartRouter);
app.use("/api/store/orders", ordersRouter);
app.use("/api/store/wishlist", wishlistRouter);
app.use("/api/store", reviewsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

export default app;
