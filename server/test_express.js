import express from "express";
import { getCalendarEvents } from "./src/utils/googleCalendar.js";

const app = express();
app.get("/api/events", async (req, res) => {
  const isPast = req.query.past === 'true';
  try {
    const googleEvents = await getCalendarEvents({ past: isPast });
    let sortedEvents = googleEvents || [];
    if (!isPast) {
      sortedEvents = sortedEvents.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    }
    res.json(sortedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed" });
  }
});

app.listen(4001, () => {
  console.log("Listening on 4001");
  fetch("http://localhost:4001/api/events")
    .then(r => r.json())
    .then(data => {
      console.log("API returned:", data);
      process.exit(0);
    });
});
