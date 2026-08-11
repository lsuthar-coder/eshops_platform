import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./postgres.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.resolve(__dirname, "../../sql");

export async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const alreadyApplied = await pool.query(
      "SELECT 1 FROM schema_migrations WHERE id = $1",
      [file]
    );

    if (alreadyApplied.rowCount > 0) {
      continue;
    }

    const sql = await fs.readFile(
      path.join(migrationsDir, file),
      "utf8"
    );

    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(sql);

      await client.query(
        "INSERT INTO schema_migrations (id) VALUES ($1)",
        [file]
      );

      await client.query("COMMIT");

      console.log(`Migration applied: ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}