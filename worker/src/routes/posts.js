import { Hono } from "hono";
import slugify from "slugify";
import { getSupabase } from "../utils/supabase.js";
import { requireAdmin } from "../middleware/auth.js";

const posts = new Hono();

// Public: list published posts
posts.get("/", async (c) => {
  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, slug, cover_url, published_at, created_at, updated_at, body_md")
      .eq("published", true)
      .eq("hidden", false)
      .order("published_at", { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (err) {
    console.error("Error fetching posts:", err);
    return c.json({ error: "Server error" }, 500);
  }
});

// Admin: list all posts
posts.get("/all", requireAdmin, async (c) => {
  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return c.json(data);
  } catch (err) {
    console.error("Error fetching all posts:", err);
    return c.json({ error: "Server error" }, 500);
  }
});

// Public: get single post by slug
posts.get("/slug/:slug", async (c) => {
  const slug = c.req.param("slug");
  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .eq("hidden", false)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return c.json({ error: "Post not found" }, 404);
      }
      throw error;
    }

    return c.json(data);
  } catch (err) {
    console.error("Error fetching post by slug:", err);
    return c.json({ error: "Server error" }, 500);
  }
});

// Admin: create post
posts.post("/", requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { title, slug, cover_url, body_md, published } = body;

    if (!title || !body_md) {
      return c.json({ error: "title and body_md are required" }, 400);
    }

    const isPublished = published !== false;
    const safeSlug = slug && String(slug).trim()
      ? slugify(String(slug), { lower: true, strict: true })
      : slugify(String(title), { lower: true, strict: true });

    const supabase = getSupabase(c.env);

    const { data: existing, error: existError } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", safeSlug)
      .maybeSingle();

    if (existError) throw existError;
    if (existing) {
      return c.json({ error: "A post with that slug already exists" }, 409);
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
      .from("posts")
      .insert([postData])
      .select()
      .single();

    if (error) throw error;
    return c.json(data, 201);
  } catch (err) {
    console.error("Error creating post:", err);
    return c.json({ error: "Server error" }, 500);
  }
});

// Admin: update post
posts.put("/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { title, slug, cover_url, body_md, published } = body;

    if (!title || !body_md) {
      return c.json({ error: "title and body_md are required" }, 400);
    }

    const isPublished = published !== false;
    const safeSlug = slug && String(slug).trim()
      ? slugify(String(slug), { lower: true, strict: true })
      : slugify(String(title), { lower: true, strict: true });

    const supabase = getSupabase(c.env);

    const { data: existing, error: existError } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", safeSlug)
      .neq("id", id)
      .maybeSingle();

    if (existError) throw existError;
    if (existing) {
      return c.json({ error: "A post with that slug already exists" }, 409);
    }

    const { data: docSnap, error: getError } = await supabase
      .from("posts")
      .select("published_at")
      .eq("id", id)
      .single();

    if (getError) {
      if (getError.code === "PGRST116") {
        return c.json({ error: "Post not found" }, 404);
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
      published_at: isPublished ? existing_published_at || now : null,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return c.json(data);
  } catch (err) {
    console.error("Error updating post:", err);
    return c.json({ error: "Server error" }, 500);
  }
});

// Admin: delete post
posts.delete("/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param("id");
    const supabase = getSupabase(c.env);
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) throw error;
    return c.json({ success: true });
  } catch (err) {
    console.error("Error deleting post:", err);
    return c.json({ error: "Server error" }, 500);
  }
});

export default posts;
