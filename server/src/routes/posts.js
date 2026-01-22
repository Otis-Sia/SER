import express from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import slugify from "slugify";

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

// Admin: create post
router.post("/", requireAdmin, async(req, res) => {
    const { title, slug, cover_url, body_md, published } = req.body;

    if (!title || !body_md) {
        return res.status(400).json({ error: "title and body_md are required" });
    }

    const safeSlug = (slug && String(slug).trim())
        ? slugify(String(slug), { lower: true, strict: true })
        : slugify(String(title), { lower: true, strict: true });

    try {
        const { rows } = await pool.query(
            `INSERT INTO posts (title, slug, cover_url, body_md, published, published_at)
       VALUES ($1,$2,$3,$4,$5, CASE WHEN $5 THEN now() ELSE NULL END)
       RETURNING id, title, slug, cover_url, published, published_at, created_at, updated_at`,
            [title, safeSlug, cover_url || null, body_md, published !== false]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        // unique violation on slug
        if (err?.code === "23505") {
            return res.status(409).json({ error: "A post with that slug already exists" });
        }
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
