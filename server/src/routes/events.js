import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Public: list events (newest first)
router.get("/", async(_req, res) => {
    const { rows } = await pool.query(
        `SELECT id, title, event_date, location, description
     FROM events
     ORDER BY event_date DESC`
    );
    res.json(rows);
});

export default router;