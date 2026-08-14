import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { config } from "../config.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Initialize authentication
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

let auth;
if (process.env.GOOGLE_CREDENTIALS) {
  // For Production (Vercel): Use Environment Variable
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
  } catch (error) {
    console.error("Failed to parse GOOGLE_CREDENTIALS env var:", error);
  }
} 

if (!auth) {
  // For Local Development: Use credentials.json file
  const KEYFILEPATH = config.googleCredentialsPath || path.join(__dirname, '../../../credentials.json');
  auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });
}
const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
const TIMEZONE = config.timezone;

let calendar;

try {
  calendar = google.calendar({ version: "v3", auth });
  console.log("Google Calendar (Service Account) initialized.");
} catch (error) {
  console.warn("Failed to initialize Google Calendar client:", error.message);
}

export const getCalendarEvents = async ({ past = false } = {}) => {
  if (!calendar) return [];
  try {
    const authClient = await calendar.context._options.auth.getClient();
    const cal = google.calendar({ version: "v3", auth: authClient });

    const now = new Date().toISOString();
    
    const response = await cal.events.list({
      calendarId,
      timeMin: past ? undefined : now,
      timeMax: past ? now : undefined,
      timeZone: TIMEZONE,
      maxResults: config.googleCalendarMaxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];
    if (past) {
      // Reverse so newest past events are first
      events.reverse();
    }

    return events.map((event) => {
      let imageUrl = null;
      let cleanDescription = event.description || "";
      
      if (cleanDescription) {
        const imageRegex = /<a[^>]*href=["']?(https?:\/\/[^\s"'<>]+?\.(?:jpg|jpeg|gif|png|webp))["']?[^>]*>.*?<\/a>|(https?:\/\/[^\s"'<>]+?\.(?:jpg|jpeg|gif|png|webp))/i;
        const match = cleanDescription.match(imageRegex);
        if (match) {
          imageUrl = match[1] || match[2];
          cleanDescription = cleanDescription.replace(match[0], "").trim();
          cleanDescription = cleanDescription.replace(/^(?:<br\s*\/?>\s*)+|(?:<br\s*\/?>\s*)+$/gi, '');
        }
      }

      return {
        id: event.id,
        google_event_id: event.id,
        title: event.summary || "Untitled Event",
        event_date: event.start.dateTime || event.start.date,
        end_date: event.end.dateTime || event.end.date,
        location: event.location || "",
        description: cleanDescription,
        meetLink: event.hangoutLink || null,
        imageUrl: imageUrl,
      };
    });
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
    const endTime = new Date(startTime.getTime() + config.defaultEventDurationMs); // Default 1 hour

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

export const updateCalendarEvent = async (eventId, eventDetails) => {
  if (!calendar) return null;
  try {
    const authClient = await calendar.context._options.auth.getClient();
    const cal = google.calendar({ version: "v3", auth: authClient });

    const startTime = new Date(eventDetails.event_date);
    const endTime = new Date(startTime.getTime() + config.defaultEventDurationMs);

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

    const res = await cal.events.update({
      calendarId,
      eventId,
      resource: event,
    });

    return res.data;
  } catch (err) {
    console.error("Error updating Google Calendar event:", err.message);
    return null;
  }
};

export const deleteCalendarEvent = async (eventId) => {
  if (!calendar) return false;
  try {
    const authClient = await calendar.context._options.auth.getClient();
    const cal = google.calendar({ version: "v3", auth: authClient });

    await cal.events.delete({
      calendarId,
      eventId,
    });

    return true;
  } catch (err) {
    console.error("Error deleting Google Calendar event:", err.message);
    return false;
  }
};
