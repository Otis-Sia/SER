import { createClient } from "@supabase/supabase-js";

export function getSupabase(env) {
  const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseServiceRoleKey =
    env.SUPABASE_SERVICE_ROLE ||
    env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    "placeholder-key";

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
