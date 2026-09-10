import { Hono } from "hono";
import { requireAdmin } from "../middleware/auth.js";
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "../utils/googleCalendar.js";

const events = new Hono();

// Public: list events
events.get("/", async (c) => {
  const isPast = c.req.query("past") === "true";
  try {
    const googleEvents = await getCalendarEvents(c.env, { past: isPast });
    let sortedEvents = googleEvents || [];
    if (!isPast) {
      sortedEvents = sortedEvents.sort(
        (a, b) => new Date(a.event_date) - new Date(b.event_date)
      );
    }
    return c.json(sortedEvents);
  } catch (error) {
    console.error("Failed to fetch events from Google Calendar", error);
    return c.json({ error: "Failed to fetch events" }, 500);
  }
});

// Public: get single event
events.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const googleEvents = await getCalendarEvents(c.env);
    const gEvent = googleEvents?.find(
      (e) => String(e.id) === String(id) || e.google_event_id === id
    );
    if (gEvent) return c.json(gEvent);

    // Also check past events if not found in upcoming
    const pastGoogleEvents = await getCalendarEvents(c.env, { past: true });
    const pastGEvent = pastGoogleEvents?.find(
      (e) => String(e.id) === String(id) || e.google_event_id === id
    );
    if (pastGEvent) return c.json(pastGEvent);

    return c.json({ error: "Event not found" }, 404);
  } catch (error) {
    console.error("Failed to fetch single event from Google Calendar", error);
    return c.json({ error: "Failed to fetch event" }, 500);
  }
});

// Admin: create event
events.post("/", requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { title, event_date, location, description } = body;
  
  if (!title || !event_date) {
    return c.json({ error: "title and event_date are required" }, 400);
  }

  try {
    const gEvent = await createCalendarEvent(c.env, {
      title,
      event_date,
      location: location || "",
      description: description || "",
    });
    
    if (!gEvent || !gEvent.id) throw new Error("Google API returned null event");

    return c.json(
      {
        id: gEvent.id,
        title,
        event_date,
        location: location || "",
        description: description || "",
        google_event_id: gEvent.id,
      },
      201
    );
  } catch (error) {
    console.error("Failed to create event in Google Calendar", error);
    return c.json({ error: "Failed to create event" }, 500);
  }
});

// Admin: update event
events.put("/:id", requireAdmin, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));
  const { title, event_date, location, description, google_event_id } = body;

  if (!title || !event_date) {
    return c.json({ error: "title and event_date are required" }, 400);
  }

  const targetGoogleId = google_event_id || id;
  try {
    await updateCalendarEvent(c.env, targetGoogleId, {
      title,
      event_date,
      location: location || "",
      description: description || "",
    });
    
    return c.json({
      id: targetGoogleId,
      title,
      event_date,
      location: location || "",
      description: description || "",
      google_event_id: targetGoogleId,
    });
  } catch (error) {
    console.error("Failed to update event in Google Calendar", error);
    return c.json({ error: "Failed to update event" }, 500);
  }
});

// Admin: delete event
events.delete("/:id", requireAdmin, async (c) => {
  const id = c.req.param("id");
  try {
    await deleteCalendarEvent(c.env, id);
    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to delete event from Google Calendar", error);
    return c.json({ error: "Failed to delete event" }, 500);
  }
});

export default events;
