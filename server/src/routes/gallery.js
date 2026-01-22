import express from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public: list gallery items (featured first, then newest)
router.get("/", async(_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, title, image_url, category, featured, created_at
     FROM gallery_items
     ORDER BY featured DESC, created_at DESC`
  );
  res.json(rows);
});

// Admin: create gallery item
router.post("/", requireAdmin, async(req, res) => {
  const { title, image_url, category, featured } = req.body;

  if (!title || !image_url) {
    return res.status(400).json({ error: "title and image_url are required" });
  }

  const { rows } = await pool.query(
    `INSERT INTO gallery_items (title, image_url, category, featured)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [title, image_url, category || null, !!featured]
  );

  res.status(201).json(rows[0]);
});

export default router;
