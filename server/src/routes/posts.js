import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Public: list published posts (newest first)
router.get("/", async(_req, res) => {
    const { rows } = await pool.query(
        `SELECT id, title, slug, cover_url, published_at
     FROM posts
     WHERE published = true
     ORDER BY published_at DESC`
    );
    res.json(rows);
});

export default router;