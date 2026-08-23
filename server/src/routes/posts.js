import express from "express";
import { supabase } from "../utils/supabase.js";
import { requireAdmin } from "../middleware/auth.js";
import slugify from "slugify";

const router = express.Router();

// ── Public Routes ─────────────────────────────────────────────────────────────

// Public: list published posts (newest first)
router.get("/", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, cover_url, published_at, created_at, updated_at, body_md')
      .eq('published', true)
      .eq('hidden', false)
      .order('published_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: list ALL posts (including drafts)
router.get("/all", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error fetching all posts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Public: get single post by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('published', true)
      .eq('hidden', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Post not found" });
      }
      throw error;
    }

    res.json(data);
  } catch (err) {
    console.error("Error fetching post by slug:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Admin Routes ──────────────────────────────────────────────────────────────

// Admin: create post
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, slug, cover_url, body_md, published } = req.body;

    if (!title || !body_md) {
      return res.status(400).json({ error: "title and body_md are required" });
    }

    const isPublished = published !== false;
    const safeSlug = (slug && String(slug).trim())
      ? slugify(String(slug), { lower: true, strict: true })
      : slugify(String(title), { lower: true, strict: true });

    // Check slug uniqueness
    const { data: existing, error: existError } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', safeSlug)
      .maybeSingle();
      
    if (existError) throw existError;
    if (existing) {
      return res.status(409).json({ error: "A post with that slug already exists" });
    }

    const now = new Date().toISOString();
    const postData = {
      title,
      slug: safeSlug,
      cover_url: cover_url || null,
      body_md,
      published: isPublished,
      published_at: isPublished ? now : null,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: update post
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, cover_url, body_md, published } = req.body;

    if (!title || !body_md) {
      return res.status(400).json({ error: "title and body_md are required" });
    }

    const isPublished = published !== false;
    const safeSlug = (slug && String(slug).trim())
      ? slugify(String(slug), { lower: true, strict: true })
      : slugify(String(title), { lower: true, strict: true });

    // Check slug uniqueness (excluding this doc)
    const { data: existing, error: existError } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', safeSlug)
      .neq('id', id)
      .maybeSingle();
      
    if (existError) throw existError;
    if (existing) {
      return res.status(409).json({ error: "A post with that slug already exists" });
    }

    const { data: docSnap, error: getError } = await supabase
      .from('posts')
      .select('published_at')
      .eq('id', id)
      .single();

    if (getError) {
      if (getError.code === 'PGRST116') {
        return res.status(404).json({ error: "Post not found" });
      }
      throw getError;
    }

    const existing_published_at = docSnap.published_at;
    const now = new Date().toISOString();

    const updateData = {
      title,
      slug: safeSlug,
      cover_url: cover_url || null,
      body_md,
      published: isPublished,
      published_at: isPublished ? (existing_published_at || now) : null,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: delete post
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
