/**
 * migrate.js
 * Run this script once against any database (local or production) to create
 * all required tables. Safe to run multiple times — uses IF NOT EXISTS.
 *
 * Usage:
 *   node src/scripts/migrate.js
 *
 * For production (Render), set DATABASE_URL env var:
 *   DATABASE_URL="postgres://..." node src/scripts/migrate.js
 */

import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const schema = fs.readFileSync(path.resolve(__dirname, "../schema.sql"), "utf8");

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Running migrations...");
    await client.query(schema);
    console.log("[SUCCESS] All tables created (or already exist).");

    // List all tables to confirm
    const { rows } = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
    `);
    console.log("\n[INFO] Tables in database:");
    rows.forEach((r) => console.log("  •", r.tablename));
  } catch (err) {
    console.error("[ERROR] Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
