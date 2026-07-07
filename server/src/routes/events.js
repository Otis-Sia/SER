import express from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";
import { createCalendarEvent, getCalendarEvents } from "../utils/googleCalendar.js";

const router = express.Router();

// Public: list events (newest first)
router.get("/", async (_req, res) => {
  try {
    const googleEvents = await getCalendarEvents();
    if (googleEvents && googleEvents.length > 0) {
      const formattedEvents = googleEvents.map(event => ({
        id: event.id, // using google event id as id for frontend keys
        google_event_id: event.id,
        title: event.summary,
        event_date: event.start.dateTime || event.start.date,
        location: event.location || "",
        description: event.description || "",
      })).sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
      return res.json(formattedEvents);
    }
  } catch (error) {
    console.error("Failed to fetch from Google Calendar, falling back to local DB", error);
  }

  const { rows } = await pool.query(
    `SELECT id, title, event_date, location, description, google_event_id
     FROM events
     ORDER BY event_date DESC`
  );
  res.json(rows);
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

  const { rows } = await pool.query(
    `INSERT INTO events (title, event_date, location, description, google_event_id)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [title, event_date, location, description || null, googleEventId]
  );

  res.status(201).json(rows[0]);
});

export default router;
