import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

let oauth2Client;
let calendar;

try {
  oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:4000" // redirect URI
  );

  if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  }

  calendar = google.calendar({ version: "v3", auth: oauth2Client });
} catch (error) {
  console.warn("Failed to initialize Google Calendar client. Check credentials.");
}

const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

export const getCalendarEvents = async () => {
  if (!calendar) return [];
  try {
    const res = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
    });
    return res.data.items || [];
  } catch (err) {
    console.error("Error fetching Google Calendar events:", err);
    return [];
  }
};

export const createCalendarEvent = async (eventDetails) => {
  if (!calendar) return null;
  try {
    const event = {
      summary: eventDetails.title,
      location: eventDetails.location,
      description: eventDetails.description,
      start: {
        dateTime: new Date(eventDetails.event_date).toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: new Date(new Date(eventDetails.event_date).getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: "UTC",
      },
    };

    const res = await calendar.events.insert({
      calendarId,
      resource: event,
    });
    return res.data;
  } catch (err) {
    console.error("Error creating Google Calendar event:", err);
    return null;
  }
};
