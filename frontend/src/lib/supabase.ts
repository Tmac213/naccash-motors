import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your environment variables.');
}

// Supabase expects the base URL without /rest/v1/
const baseUrl = supabaseUrl.replace('/rest/v1/', '').replace('/rest/v1', '');

export const supabase = createClient(baseUrl, supabaseAnonKey);
