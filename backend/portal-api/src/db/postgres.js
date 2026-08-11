import pg from "pg";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.postgresUrl,
  max: 10,
});

pool.on("error", (error) => {
  logger.error({ err: error }, "Unexpected PostgreSQL pool error");
});

export async function checkPostgresConnection() {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}
