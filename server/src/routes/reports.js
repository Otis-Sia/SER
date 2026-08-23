import express from "express";
import { supabase } from "../utils/supabase.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public: get a single event report by google_event_id
router.get("/:google_event_id", async (req, res) => {
  const { google_event_id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('event_reports')
      .select('*')
      .eq('google_event_id', google_event_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Report not found" });
      }
      throw error;
    }
    res.json(data);
  } catch (error) {
    console.error("Database query failed during report fetch:", error.message);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// Admin: create or update event report
router.post("/", requireAdmin, async (req, res) => {
  const { google_event_id, title, content_md, author } = req.body;

  if (!google_event_id || !title || !content_md) {
    return res.status(400).json({ error: "google_event_id, title, and content_md are required" });
  }

  try {
    const { data, error } = await supabase
      .from('event_reports')
      .upsert({ 
        google_event_id, 
        title, 
        content_md, 
        author: author || "Admin",
        updated_at: new Date().toISOString()
      }, { onConflict: 'google_event_id' })
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Database query failed during report creation:", error.message);
    res.status(500).json({ error: "Failed to save report" });
  }
});

// Admin: delete event report
router.delete("/:google_event_id", requireAdmin, async (req, res) => {
  const { google_event_id } = req.params;

  try {
    const { error } = await supabase
      .from('event_reports')
      .delete()
      .eq('google_event_id', google_event_id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error("Database query failed during report deletion:", error.message);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

export default router;
