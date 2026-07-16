import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Public: submit a membership application
router.post("/", async (req, res) => {
  const {
    first_name,
    middle_name,
    last_name,
    county,
    sub_county,
    crew,
    blood_type,
    email,
    whatsapp,
  } = req.body;

  // Validate required fields
  if (!first_name || !last_name || !county || !sub_county || !crew || !email || !whatsapp) {
    return res.status(400).json({
      error: "first_name, last_name, county, sub_county, crew, email, and whatsapp are required",
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO members (first_name, middle_name, last_name, county, sub_county, crew, blood_type, email, whatsapp)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        first_name,
        middle_name || null,
        last_name,
        county,
        sub_county,
        crew,
        blood_type || null,
        email,
        whatsapp,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    // Handle duplicate email
    if (err.code === "23505" && err.constraint?.includes("email")) {
      return res.status(409).json({ error: "This email address is already registered." });
    }
    console.error("Failed to insert member:", err);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

// Admin: list all members (no auth middleware required for now, can be added later)
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, first_name, middle_name, last_name, county, sub_county, crew, blood_type, email, whatsapp, created_at
       FROM members
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch members:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
