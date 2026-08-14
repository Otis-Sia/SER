import express from "express";
import { supabase } from "../utils/supabase.js";

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
    const { data, error } = await supabase
      .from('members')
      .insert([
        {
          name: `${first_name} ${last_name}`,
          first_name,
          middle_name: middle_name || null,
          last_name,
          county,
          sub_county,
          crew,
          blood_type: blood_type || null,
          email,
          whatsapp,
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505" && error.message?.includes("email")) {
        return res.status(409).json({ error: "This email address is already registered." });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    console.error("Failed to insert member:", err);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

// Admin: list all members (no auth middleware required for now, can be added later)
router.get("/", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('id, first_name, middle_name, last_name, county, sub_county, crew, blood_type, email, whatsapp, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Failed to fetch members:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
