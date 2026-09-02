import { Hono } from "hono";
import { getSupabase } from "../utils/supabase.js";
import { requireAdmin } from "../middleware/auth.js";

const gallery = new Hono();

// Public: list gallery items
gallery.get("/", async (c) => {
  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (err) {
    console.error("Failed to fetch gallery:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: create gallery item
gallery.post("/", requireAdmin, async (c) => {
  const { title, image_url, alt, description } = await c.req.json();

  if (!title || !image_url) {
    return c.json({ error: "title and image_url are required" }, 400);
  }

  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("gallery")
      .insert([{ title, image_url, alt: alt || null, description: description || null }])
      .select()
      .single();

    if (error) throw error;
    return c.json(data, 201);
  } catch (err) {
    console.error("Failed to create gallery item:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default gallery;
