import express from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

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

// Admin: create event
router.post("/", requireAdmin, async(req, res) => {
    const { title, event_date, location, description } = req.body;

    if (!title || !event_date || !location) {
        return res.status(400).json({ error: "title, event_date, and location are required" });
    }

    const { rows } = await pool.query(
        `INSERT INTO events (title, event_date, location, description)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
        [title, event_date, location, description || null]
    );

    res.status(201).json(rows[0]);
});

export default router;
