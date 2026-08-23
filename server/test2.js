import { getCalendarEvents } from "./src/utils/googleCalendar.js";
import { config } from "./src/config.js";

async function run() {
  try {
    console.log("Fetching events...");
    const events = await getCalendarEvents();
    console.log("Upcoming events:", events.length);
    if (events.length > 0) {
      console.log(events[0]);
    }
    const pastEvents = await getCalendarEvents({ past: true });
    console.log("Past events:", pastEvents.length);
  } catch (err) {
    console.error(err);
  }
}
run();
