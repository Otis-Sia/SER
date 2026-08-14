import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://hotnfgrqzgmnwzeedwar.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdG5mZ3Jxemdtbnd6ZWVkd2FyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjY0MjU0NSwiZXhwIjoyMTAyMjE4NTQ1fQ.GVKn0Nru_CbDBwSUUu1oW6vlkRoS7lwniEy27TlgD-o';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) {
  console.warn("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE should be provided in Vercel environment variables.");
}

// Admin client using service role key (bypasses RLS). MUST ONLY BE USED ON THE SERVER.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
