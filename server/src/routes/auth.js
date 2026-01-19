import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post("/login", async(req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }

    try {
        const { rows } = await pool.query(
            "SELECT id, email, password_hash FROM admins WHERE email = $1", [email]
        );

        if (!rows.length) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const admin = rows[0];
        const ok = await bcrypt.compare(password, admin.password_hash);

        if (!ok) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: admin.id, email: admin.email },
            process.env.JWT_SECRET, { expiresIn: "8h" }
        );

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;