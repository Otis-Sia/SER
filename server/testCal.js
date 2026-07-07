import { getCalendarEvents } from './src/utils/googleCalendar.js';

async function test() {
  console.log("Fetching events...");
  try {
    const events = await getCalendarEvents();
    console.log("Events:", events);
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
