import express from "express";
import { supabase } from "../utils/supabase.js";
import { requireAdmin } from "../middleware/auth.js";
import { createCalendarEvent, getCalendarEvents, updateCalendarEvent, deleteCalendarEvent } from "../utils/googleCalendar.js";

const router = express.Router();

// Public: list events (newest first)
router.get("/", async (req, res) => {
  const isPast = req.query.past === 'true';
  
  try {
    const googleEvents = await getCalendarEvents({ past: isPast });
    if (googleEvents) {
      let sortedEvents = googleEvents;
      if (!isPast) {
        sortedEvents = googleEvents.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      }
      return res.json(sortedEvents);
    }
  } catch (error) {
    console.error("Failed to fetch from Google Calendar, falling back to local DB", error);
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, event_date, location, description, google_event_id')
      .filter('event_date', isPast ? 'lt' : 'gte', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: !isPast });

    if (error) throw error;
    res.json(data);
  } catch (dbError) {
    console.error("Database query failed during events fallback:", dbError.message);
    res.json([]);
  }
});

// Public: get single event
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const googleEvents = await getCalendarEvents();
    if (googleEvents) {
      const gEvent = googleEvents.find(e => String(e.id) === String(id) || e.google_event_id === id);
      if (gEvent) return res.json(gEvent);
    }
  } catch (error) {
    console.error("Failed to fetch from Google Calendar for single event, falling back to local DB", error);
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, event_date, location, description, google_event_id')
      .or(`id.eq.${id},google_event_id.eq.${id}`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Event not found" });
      }
      throw error;
    }
    res.json(data);
  } catch (dbError) {
    console.error("Database query failed during single event fallback:", dbError.message);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// Admin: create event
router.post("/", requireAdmin, async (req, res) => {
  const { title, event_date, location, description } = req.body;

  if (!title || !event_date || !location) {
    return res.status(400).json({ error: "title, event_date, and location are required" });
  }

  let googleEventId = null;
  try {
    const gEvent = await createCalendarEvent({ title, event_date, location, description });
    if (gEvent && gEvent.id) {
      googleEventId = gEvent.id;
    }
  } catch (error) {
    console.error("Failed to sync event to Google Calendar", error);
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .insert([{ title, event_date, location, description: description || null, google_event_id: googleEventId }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (dbError) {
    console.error("Database query failed during event creation:", dbError.message);
    // Return a synthetic response since the Google Calendar sync might have succeeded
    res.status(201).json({
      id: "synced-only",
      title,
      event_date,
      location,
      description,
      google_event_id: googleEventId
    });
  }
});

// Admin: update event
router.put("/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, event_date, location, description, google_event_id } = req.body;

  if (!title || !event_date || !location) {
    return res.status(400).json({ error: "title, event_date, and location are required" });
  }

  const targetGoogleId = google_event_id || id;
  try {
    await updateCalendarEvent(targetGoogleId, { title, event_date, location, description });
  } catch (error) {
    console.error("Failed to update event in Google Calendar", error);
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .update({ title, event_date, location, description: description || null })
      .or(`id.eq.${id},google_event_id.eq.${id}`)
      .select();

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.json({ id, title, event_date, location, description, google_event_id: targetGoogleId });
    }
    res.json(data[0]);
  } catch (dbError) {
    console.error("Database query failed during event update:", dbError.message);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// Admin: delete event
router.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await deleteCalendarEvent(id);
  } catch (error) {
    console.error("Failed to delete event from Google Calendar", error);
  }

  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .or(`id.eq.${id},google_event_id.eq.${id}`);

    if (error) throw error;
    res.json({ success: true });
  } catch (dbError) {
    console.error("Database query failed during event deletion:", dbError.message);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
