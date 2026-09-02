import { Hono } from "hono";
import { getSupabase } from "../utils/supabase.js";
import { requireAdmin } from "../middleware/auth.js";

const reports = new Hono();

// Public: get a single event report by google_event_id
reports.get("/:google_event_id", async (c) => {
  const google_event_id = c.req.param("google_event_id");

  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("event_reports")
      .select("*")
      .eq("google_event_id", google_event_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return c.json({ error: "Report not found" }, 404);
      }
      throw error;
    }
    return c.json(data);
  } catch (error) {
    console.error("Database query failed during report fetch:", error.message);
    return c.json({ error: "Failed to fetch report" }, 500);
  }
});

// Admin: create or update event report
reports.post("/", requireAdmin, async (c) => {
  const body = await c.req.json();
  const { google_event_id, title, content_md, author } = body;

  if (!google_event_id || !title || !content_md) {
    return c.json(
      { error: "google_event_id, title, and content_md are required" },
      400
    );
  }

  try {
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase
      .from("event_reports")
      .upsert(
        {
          google_event_id,
          title,
          content_md,
          author: author || "Admin",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "google_event_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return c.json(data, 200);
  } catch (error) {
    console.error("Database query failed during report creation:", error.message);
    return c.json({ error: "Failed to save report" }, 500);
  }
});

// Admin: delete event report
reports.delete("/:google_event_id", requireAdmin, async (c) => {
  const google_event_id = c.req.param("google_event_id");

  try {
    const supabase = getSupabase(c.env);
    const { error } = await supabase
      .from("event_reports")
      .delete()
      .eq("google_event_id", google_event_id);

    if (error) throw error;
    return c.json({ success: true });
  } catch (error) {
    console.error("Database query failed during report deletion:", error.message);
    return c.json({ error: "Failed to delete report" }, 500);
  }
});

export default reports;
