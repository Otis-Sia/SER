import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import { createCalendarEvent, getCalendarEvents, updateCalendarEvent, deleteCalendarEvent } from "../utils/googleCalendar.js";

const router = express.Router();

// Public: list events
router.get("/", async (req, res) => {
  const isPast = req.query.past === 'true';
  try {
    const googleEvents = await getCalendarEvents({ past: isPast });
    let sortedEvents = googleEvents || [];
    if (!isPast) {
      sortedEvents = sortedEvents.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    }
    return res.json(sortedEvents);
  } catch (error) {
    console.error("Failed to fetch events from Google Calendar", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Public: get single event
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const googleEvents = await getCalendarEvents();
    const gEvent = googleEvents?.find(e => String(e.id) === String(id) || e.google_event_id === id);
    if (gEvent) return res.json(gEvent);

    // Also check past events if not found in upcoming
    const pastGoogleEvents = await getCalendarEvents({ past: true });
    const pastGEvent = pastGoogleEvents?.find(e => String(e.id) === String(id) || e.google_event_id === id);
    if (pastGEvent) return res.json(pastGEvent);

    return res.status(404).json({ error: "Event not found" });
  } catch (error) {
    console.error("Failed to fetch single event from Google Calendar", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// Admin: create event
router.post("/", requireAdmin, async (req, res) => {
  const { title, event_date, location, description } = req.body;
  if (!title || !event_date || !location) {
    return res.status(400).json({ error: "title, event_date, and location are required" });
  }

  try {
    const gEvent = await createCalendarEvent({ title, event_date, location, description });
    if (!gEvent || !gEvent.id) throw new Error("Google API returned null event");
    
    res.status(201).json({
      id: gEvent.id,
      title,
      event_date,
      location,
      description,
      google_event_id: gEvent.id
    });
  } catch (error) {
    console.error("Failed to create event in Google Calendar", error);
    res.status(500).json({ error: "Failed to create event" });
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
    res.json({ id: targetGoogleId, title, event_date, location, description, google_event_id: targetGoogleId });
  } catch (error) {
    console.error("Failed to update event in Google Calendar", error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// Admin: delete event
router.delete("/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await deleteCalendarEvent(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to delete event from Google Calendar", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
