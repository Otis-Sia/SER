import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://hotnfgrqzgmnwzeedwar.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_PUBLIC || process.env.SUPABASE_ANON_PUBLIC || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdG5mZ3Jxemdtbnd6ZWVkd2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NDI1NDUsImV4cCI6MjEwMjIxODU0NX0.YOxjYU3AsfH35eGC32Z8_55CkO3xhPRO0SBLMSml_f0';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) {
  console.warn('Supabase URL or Anon Key is missing from environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
