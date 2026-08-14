import express from "express";
import { supabase } from "../utils/supabase.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public: list products
router.get("/", async(_, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('featured', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("Failed to fetch products:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Admin: create product
router.post("/", requireAdmin, async(req, res) => {
    const { name, price_kes, image_url, description, featured } = req.body;

    try {
        const { data, error } = await supabase
            .from('products')
            .insert([{ name, price_kes, image_url: image_url || null, description: description || null, featured: !!featured }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error("Failed to create product:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;