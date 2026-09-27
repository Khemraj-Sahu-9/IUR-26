import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://llvnlbhpxruhnbbhphbb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsdm5sYmhweHJ1aG5iYmhwaGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNjg3NzIsImV4cCI6MjEwNTg0NDc3Mn0.FFAqBEkbEuHMnEoOLdatbhfZGTjLq7S5jt4WCZYuvyY';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
