import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const publicSupabaseUrl = supabaseUrl as string | undefined;
export const supabaseFunctionsUrl = supabaseUrl ? `${supabaseUrl}/functions/v1` : undefined;
export const supabaseConfigError = isSupabaseConfigured
  ? null
  : 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add both variables to your .env file.';

function createUnconfiguredClient(): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get() {
      throw new Error(supabaseConfigError ?? 'Supabase is not configured.');
    },
  });
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createUnconfiguredClient();
