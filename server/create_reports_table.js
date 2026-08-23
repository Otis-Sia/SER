import dotenv from "dotenv";
dotenv.config();
import { pool } from "./src/db.js";

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_reports (
        id SERIAL PRIMARY KEY,
        google_event_id TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        content_md TEXT NOT NULL,
        author TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    console.log("Table created");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
