import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Service Account credentials file
const KEYFILEPATH = path.join(__dirname, "../../../credentials.json"); // project root: SER/credentials.json
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
const TIMEZONE = "Africa/Nairobi";

let calendar;

try {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  calendar = google.calendar({ version: "v3", auth });
  console.log("Google Calendar (Service Account) initialized.");
} catch (error) {
  console.warn("Failed to initialize Google Calendar client:", error.message);
}

export const getCalendarEvents = async () => {
  if (!calendar) return [];
  try {
    const authClient = await calendar.context._options.auth.getClient();
    const cal = google.calendar({ version: "v3", auth: authClient });

    const response = await cal.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      timeZone: TIMEZONE,
      maxResults: 50,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    return events.map((event) => ({
      id: event.id,
      google_event_id: event.id,
      title: event.summary || "Untitled Event",
      event_date: event.start.dateTime || event.start.date,
      end_date: event.end.dateTime || event.end.date,
      location: event.location || "",
      description: event.description || "",
      meetLink: event.hangoutLink || null,
    }));
  } catch (err) {
    console.error("Error fetching Google Calendar events:", err.message);
    return [];
  }
};

export const createCalendarEvent = async (eventDetails) => {
  if (!calendar) return null;
  try {
    const authClient = await calendar.context._options.auth.getClient();
    const cal = google.calendar({ version: "v3", auth: authClient });

    const startTime = new Date(eventDetails.event_date);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour

    const event = {
      summary: eventDetails.title,
      location: eventDetails.location,
      description: eventDetails.description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: TIMEZONE,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: TIMEZONE,
      },
    };

    const res = await cal.events.insert({
      calendarId,
      resource: event,
    });

    return res.data;
  } catch (err) {
    console.error("Error creating Google Calendar event:", err.message);
    return null;
  }
};
