import express from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public: list products
router.get("/", async(_, res) => {
    const { rows } = await pool.query(
        "SELECT * FROM products ORDER BY featured DESC, created_at DESC"
    );
    res.json(rows);
});

// Admin: create product
router.post("/", requireAdmin, async(req, res) => {
    const { name, price_kes, image_url, description, featured } = req.body;

    const { rows } = await pool.query(
        `INSERT INTO products (name, price_kes, image_url, description, featured)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`, [name, price_kes, image_url || null, description || null, !!featured]
    );

    res.status(201).json(rows[0]);
});

export default router;