import express from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import slugify from "slugify";

const router = express.Router();

// Public: list published posts (newest first)
router.get("/", async(_req, res) => {
    const { rows } = await pool.query(
        `SELECT id, title, slug, cover_url, published_at, created_at, updated_at
     FROM posts
     WHERE published = true
     ORDER BY published_at DESC`
    );
    res.json(rows);
});

// Admin: list all posts
router.get("/all", requireAdmin, async(_req, res) => {
    const { rows } = await pool.query(
        `SELECT *
     FROM posts
     ORDER BY created_at DESC`
    );
    res.json(rows);
});

// Public: get single post by slug
router.get("/slug/:slug", async(req, res) => {
    const { slug } = req.params;
    const { rows } = await pool.query(
        `SELECT *
     FROM posts
     WHERE slug = $1 AND published = true`,
        [slug]
    );
    if (rows.length === 0) {
        return res.status(404).json({ error: "Post not found" });
    }
    res.json(rows[0]);
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
       RETURNING *`,
            [title, safeSlug, cover_url || null, body_md, published !== false]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        if (err?.code === "23505") {
            return res.status(409).json({ error: "A post with that slug already exists" });
        }
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Admin: update post
router.put("/:id", requireAdmin, async(req, res) => {
    const { id } = req.params;
    const { title, slug, cover_url, body_md, published } = req.body;

    if (!title || !body_md) {
        return res.status(400).json({ error: "title and body_md are required" });
    }

    const safeSlug = (slug && String(slug).trim())
        ? slugify(String(slug), { lower: true, strict: true })
        : slugify(String(title), { lower: true, strict: true });

    try {
        const { rows } = await pool.query(
            `UPDATE posts
       SET title = $1, slug = $2, cover_url = $3, body_md = $4, published = $5, updated_at = now()
       WHERE id = $6
       RETURNING *`,
            [title, safeSlug, cover_url || null, body_md, published !== false, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Post not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        if (err?.code === "23505") {
            return res.status(409).json({ error: "A post with that slug already exists" });
        }
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Admin: delete post
router.delete("/:id", requireAdmin, async(req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await pool.query(
            `DELETE FROM posts WHERE id = $1`,
            [id]
        );
        if (rowCount === 0) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
