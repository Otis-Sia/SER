import jwt from "jsonwebtoken";

const TIMEZONE = "Africa/Nairobi";

async function getAccessToken(env) {
  const credsRaw = env.GOOGLE_CREDENTIALS || process.env.GOOGLE_CREDENTIALS;
  if (!credsRaw) {
    throw new Error("GOOGLE_CREDENTIALS is not defined in environment");
  }
  const creds = JSON.parse(credsRaw);
  
  const token = jwt.sign(
    {
      iss: creds.client_email,
      scope: "https://www.googleapis.com/auth/calendar",
      aud: "https://oauth2.googleapis.com/token",
    },
    creds.private_key,
    { algorithm: "RS256", expiresIn: "1h" }
  );

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: token,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error("Failed to get access token: " + error);
  }

  const data = await res.json();
  return data.access_token;
}

function extractImageAndCleanDescription(rawDescription) {
  let imageUrl = null;
  let cleanDescription = rawDescription || "";
  
  if (cleanDescription) {
    const imageRegex = /<a[^>]*href=["']?(https?:\/\/[^\s"'<>]+?\.(?:jpg|jpeg|gif|png|webp))["']?[^>]*>.*?<\/a>|(https?:\/\/[^\s"'<>]+?\.(?:jpg|jpeg|gif|png|webp))/i;
    const match = cleanDescription.match(imageRegex);
    if (match) {
      imageUrl = match[1] || match[2];
      cleanDescription = cleanDescription.replace(match[0], "").trim();
      cleanDescription = cleanDescription.replace(/^(?:<br\s*\/?>\s*)+|(?:<br\s*\/?>\s*)+$/gi, '');
    }
  }

  return { imageUrl, cleanDescription };
}

function getCalendarId(env) {
  return env.GOOGLE_CALENDAR_ID || process.env.GOOGLE_CALENDAR_ID || "primary";
}

export async function getCalendarEvents(env, { past = false } = {}) {
  const calendarId = getCalendarId(env);
  let accessToken;
  try {
    accessToken = await getAccessToken(env);
  } catch (err) {
    console.error("Failed to authenticate with Google API", err);
    return [];
  }

  const now = new Date().toISOString();
  
  const params = new URLSearchParams({
    timeZone: TIMEZONE,
    maxResults: "2500",
    singleEvents: "true",
    orderBy: "startTime"
  });

  if (past) {
    params.append("timeMax", now);
  } else {
    params.append("timeMin", now);
  }

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    console.error("Error fetching Google Calendar events:", await res.text());
    return [];
  }

  const data = await res.json();
  const events = data.items || [];
  
  if (past) {
    events.reverse();
  }

  return events.map((event) => {
    const { imageUrl, cleanDescription } = extractImageAndCleanDescription(event.description);
    return {
      id: event.id,
      google_event_id: event.id,
      title: event.summary || "Untitled Event",
      event_date: event.start?.dateTime || event.start?.date,
      end_date: event.end?.dateTime || event.end?.date,
      location: event.location || "",
      description: cleanDescription,
      meetLink: event.hangoutLink || null,
      imageUrl: imageUrl,
    };
  });
}

export async function createCalendarEvent(env, eventDetails) {
  const calendarId = getCalendarId(env);
  const accessToken = await getAccessToken(env);

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

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(event)
  });

  if (!res.ok) {
    throw new Error("Failed to create event: " + await res.text());
  }

  return res.json();
}

export async function updateCalendarEvent(env, eventId, eventDetails) {
  const calendarId = getCalendarId(env);
  const accessToken = await getAccessToken(env);

  const startTime = new Date(eventDetails.event_date);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

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

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {
    method: "PUT",
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(event)
  });

  if (!res.ok) {
    throw new Error("Failed to update event: " + await res.text());
  }

  return res.json();
}

export async function deleteCalendarEvent(env, eventId) {
  const calendarId = getCalendarId(env);
  const accessToken = await getAccessToken(env);

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("Failed to delete event: " + await res.text());
  }

  return true;
}
