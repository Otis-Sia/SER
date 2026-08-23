import { getCalendarEvents } from "./src/utils/googleCalendar.js";

async function run() {
  const events = await getCalendarEvents();
  console.log("Events:", events);
}
run();
