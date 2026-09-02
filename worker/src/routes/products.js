import { Hono } from "hono";
import { getSupabase } from "../utils/supabase.js";
import { requireAdmin } from "../middleware/auth.js";

const products = new Hono();

// Public: list products
products.get("/", async (c) => {
  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin: create product
products.post("/", requireAdmin, async (c) => {
  const { name, price_kes, image_url, description, featured } = await c.req.json();

  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          price_kes,
          image_url: image_url || null,
          description: description || null,
          featured: !!featured,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return c.json(data, 201);
  } catch (err) {
    console.error("Failed to create product:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default products;
