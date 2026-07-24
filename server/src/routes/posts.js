import express from "express";
import { db } from "../utils/firebase.js";
import { requireAdmin } from "../middleware/auth.js";
import slugify from "slugify";

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPost(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    // Normalize Firestore Timestamps to ISO strings
    created_at: data.created_at?.toDate?.()?.toISOString?.() ?? data.created_at ?? new Date().toISOString(),
    updated_at: data.updated_at?.toDate?.()?.toISOString?.() ?? data.updated_at ?? new Date().toISOString(),
    published_at: data.published_at?.toDate?.()?.toISOString?.() ?? data.published_at ?? null,
  };
}

// ── Public Routes ─────────────────────────────────────────────────────────────

// Public: list published posts (newest first)
router.get("/", async (_req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });

    const snapshot = await db
      .collection("posts")
      .where("published", "==", true)
      .orderBy("published_at", "desc")
      .get();

    const posts = snapshot.docs
      .filter(doc => !doc.data().hidden)
      .map((doc) => {
      const p = formatPost(doc);
      // Return only public fields
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        cover_url: p.cover_url,
        published_at: p.published_at,
        created_at: p.created_at,
        updated_at: p.updated_at,
      };
    });

    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: list ALL posts (including drafts)
router.get("/all", async (_req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });

    const snapshot = await db
      .collection("posts")
      .orderBy("created_at", "desc")
      .get();

    res.json(snapshot.docs.map(formatPost));
  } catch (err) {
    console.error("Error fetching all posts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Public: get single post by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });

    const snapshot = await db
      .collection("posts")
      .where("slug", "==", req.params.slug)
      .where("published", "==", true)
      .limit(1)
      .get();

    if (snapshot.empty || snapshot.docs[0].data().hidden) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(formatPost(snapshot.docs[0]));
  } catch (err) {
    console.error("Error fetching post by slug:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Admin Routes ──────────────────────────────────────────────────────────────

// Admin: create post
router.post("/", requireAdmin, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });

    const { title, slug, cover_url, body_md, published } = req.body;

    if (!title || !body_md) {
      return res.status(400).json({ error: "title and body_md are required" });
    }

    const isPublished = published !== false;
    const safeSlug = (slug && String(slug).trim())
      ? slugify(String(slug), { lower: true, strict: true })
      : slugify(String(title), { lower: true, strict: true });

    // Check slug uniqueness
    const existing = await db.collection("posts").where("slug", "==", safeSlug).limit(1).get();
    if (!existing.empty) {
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

    const docRef = await db.collection("posts").add(postData);

    res.status(201).json({ id: docRef.id, ...postData });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: update post
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });

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
    const existing = await db.collection("posts").where("slug", "==", safeSlug).limit(1).get();
    if (!existing.empty && existing.docs[0].id !== id) {
      return res.status(409).json({ error: "A post with that slug already exists" });
    }

    const docRef = db.collection("posts").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const existing_published_at = docSnap.data().published_at;
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

    await docRef.update(updateData);

    res.json({ id, ...docSnap.data(), ...updateData });
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: delete post
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });

    const { id } = req.params;
    const docRef = db.collection("posts").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    await docRef.delete();
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
