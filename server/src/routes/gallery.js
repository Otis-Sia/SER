import express from "express";
import { supabase } from "../utils/supabase.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public: list gallery items (newest first)
router.get("/", async(_req, res) => {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Failed to fetch gallery:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: create gallery item
router.post("/", requireAdmin, async(req, res) => {
  const { title, image_url, alt, description } = req.body;

  if (!title || !image_url) {
    return res.status(400).json({ error: "title and image_url are required" });
  }

  try {
    const { data, error } = await supabase
      .from('gallery')
      .insert([{ title, image_url, alt: alt || null, description: description || null }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("Failed to create gallery item:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
