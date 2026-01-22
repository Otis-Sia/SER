import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/auth/register
 * Body: { full_name, email, password }
 * Creates a regular user (NOT admin)
 */
router.post("/register", async(req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ error: "full_name, email, and password are required" });
    }

    try {
        const hash = await bcrypt.hash(password, 10);

        const { rows } = await pool.query(
            `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1,$2,$3)
       RETURNING id, full_name, email, created_at`,
            [full_name, email.toLowerCase(), hash]
        );

        res.status(201).json({ user: rows[0] });
    } catch (err) {
        // unique violation on email
        if (err?.code === "23505") {
            return res.status(409).json({ error: "Email already registered" });
        }
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Logs in either an admin OR a regular user.
 */
router.post("/login", async(req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    const cleanEmail = String(email).toLowerCase();

    try {
        // 1) Try Admin first
        const adminRes = await pool.query(
            "SELECT id, email, password_hash FROM admins WHERE email = $1",
            [cleanEmail]
        );

        if (adminRes.rows.length) {
            const admin = adminRes.rows[0];
            const ok = await bcrypt.compare(password, admin.password_hash);
            if (!ok) return res.status(401).json({ error: "Invalid credentials" });

            const token = jwt.sign(
                { id: admin.id, email: admin.email, role: "admin" },
                process.env.JWT_SECRET,
                { expiresIn: "8h" }
            );

            return res.json({
                token,
                role: "admin",
                user: { id: admin.id, email: admin.email }
            });
        }

        // 2) Otherwise regular user
        const userRes = await pool.query(
            "SELECT id, full_name, email, password_hash FROM users WHERE email = $1",
            [cleanEmail]
        );

        if (!userRes.rows.length) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = userRes.rows[0];
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.id, email: user.email, full_name: user.full_name, role: "user" },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        return res.json({
            token,
            role: "user",
            user: { id: user.id, email: user.email, full_name: user.full_name }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * GET /api/auth/me
 * Requires Bearer token.
 */
router.get("/me", requireAuth, async(req, res) => {
    const { id, role, email, full_name } = req.auth || {};
    res.json({
        id,
        role,
        email,
        full_name: full_name || null
    });
});

export default router;
