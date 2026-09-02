import { Hono } from "hono";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/auth.js";
import { getDb } from "../index.js";

const auth = new Hono();

// POST /register
auth.post("/register", async (c) => {
  const { full_name, email, password } = await c.req.json();

  if (!full_name || !email || !password) {
    return c.json(
      { error: "full_name, email, and password are required" },
      400
    );
  }

  const pool = getDb(c.env);

  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1,$2,$3)
       RETURNING id, full_name, email, created_at`,
      [full_name, email.toLowerCase(), hash]
    );

    return c.json({ user: rows[0] }, 201);
  } catch (err) {
    if (err?.code === "23505") {
      return c.json({ error: "Email already registered" }, 409);
    }
    console.error(err);
    return c.json({ error: "Server error" }, 500);
  }
});

// POST /login
auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Email and password required" }, 400);
  }

  const cleanEmail = String(email).toLowerCase();
  const pool = getDb(c.env);
  const jwtSecret = c.env.JWT_SECRET || process.env.JWT_SECRET || "default-secret";

  try {
    // 1) Try Admin first
    const adminRes = await pool.query(
      "SELECT id, email, password_hash FROM admins WHERE email = $1",
      [cleanEmail]
    );

    if (adminRes.rows.length) {
      const admin = adminRes.rows[0];
      const ok = await bcrypt.compare(password, admin.password_hash);
      if (!ok) return c.json({ error: "Invalid credentials" }, 401);

      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: "admin" },
        jwtSecret,
        { expiresIn: "7d" }
      );

      return c.json({
        token,
        role: "admin",
        user: { id: admin.id, email: admin.email },
      });
    }

    // 2) Otherwise regular user
    const userRes = await pool.query(
      "SELECT id, full_name, email, password_hash FROM users WHERE email = $1",
      [cleanEmail]
    );

    if (!userRes.rows.length) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const user = userRes.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return c.json({ error: "Invalid credentials" }, 401);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: "user",
      },
      jwtSecret,
      { expiresIn: "8h" }
    );

    return c.json({
      token,
      role: "user",
      user: { id: user.id, email: user.email, full_name: user.full_name },
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Server error" }, 500);
  }
});

// GET /me
auth.get("/me", requireAuth, async (c) => {
  const authPayload = c.get("auth") || {};
  return c.json({
    id: authPayload.id,
    role: authPayload.role,
    email: authPayload.email,
    full_name: authPayload.full_name || null,
  });
});

export default auth;
