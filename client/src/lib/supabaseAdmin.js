import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE must be provided in .env.local");
}

// Admin client using service role key (bypasses RLS). MUST ONLY BE USED ON THE SERVER.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
