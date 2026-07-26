import { getCalendarEvents } from './src/utils/googleCalendar.js';

async function test() {
  console.log("Fetching events from Google Calendar (Service Account)...\n");
  try {
    const events = await getCalendarEvents();
    if (!events || events.length === 0) {
      console.log("No upcoming events found.");
      return;
    }
    console.log("Upcoming Schedule:\n");
    events.forEach((event) => {
      console.log(`Time:     ${event.event_date}`);
      console.log(`Event:    ${event.title}`);
      console.log(`Venue:    ${event.location || "N/A"}`);
      console.log(`Meet:     ${event.meetLink || "No Google Meet link"}`);
      console.log("-------------------------");
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
