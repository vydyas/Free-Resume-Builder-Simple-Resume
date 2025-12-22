import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

/**
 * Create a Supabase client instance (browser-safe)
 */
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
