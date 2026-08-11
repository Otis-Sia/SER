import express from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import { createCalendarEvent, getCalendarEvents, updateCalendarEvent, deleteCalendarEvent } from "../utils/googleCalendar.js";

const router = express.Router();

// Public: list events (newest first)
router.get("/", async (_req, res) => {
  try {
    const googleEvents = await getCalendarEvents();
    if (googleEvents) {
      const sortedEvents = googleEvents.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      return res.json(sortedEvents);
    }
  } catch (error) {
    console.error("Failed to fetch from Google Calendar, falling back to local DB", error);
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, title, event_date, location, description, google_event_id
       FROM events
       ORDER BY event_date DESC`
    );
    res.json(rows);
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
      const gEvent = googleEvents.find(e => e.id === id || e.google_event_id === id);
      if (gEvent) return res.json(gEvent);
    }
  } catch (error) {
    console.error("Failed to fetch from Google Calendar for single event, falling back to local DB", error);
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, title, event_date, location, description, google_event_id
       FROM events
       WHERE id = $1 OR google_event_id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(rows[0]);
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
    const { rows } = await pool.query(
      `INSERT INTO events (title, event_date, location, description, google_event_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [title, event_date, location, description || null, googleEventId]
    );
    res.status(201).json(rows[0]);
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
    const { rows } = await pool.query(
      `UPDATE events 
       SET title = $1, event_date = $2, location = $3, description = $4
       WHERE id = $5 OR google_event_id = $5
       RETURNING *`,
      [title, event_date, location, description || null, id]
    );
    
    if (rows.length === 0) {
      return res.json({ id, title, event_date, location, description, google_event_id: targetGoogleId });
    }
    res.json(rows[0]);
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
    await pool.query(
      `DELETE FROM events WHERE id = $1 OR google_event_id = $1`,
      [id]
    );
    res.json({ success: true });
  } catch (dbError) {
    console.error("Database query failed during event deletion:", dbError.message);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
