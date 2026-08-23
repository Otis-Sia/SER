import { supabase } from "./src/utils/supabase.js";

async function check() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString().split('T')[0]);
  
  if (error) console.error(error);
  console.log("Supabase Upcoming Events:", data);
}
check();
