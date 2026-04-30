import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const publicSupabaseUrl = supabaseUrl as string | undefined;
export const supabaseFunctionsUrl = supabaseUrl ? `${supabaseUrl.replace(/\/+$/, '')}/functions/v1` : undefined;
export const supabaseConfigError = isSupabaseConfigured
  ? null
  : [
      !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
      !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null,
    ].filter(Boolean).join(' and ') + ' must be set in Vercel and local .env files.';

function createUnconfiguredClient(): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get() {
      throw new Error(supabaseConfigError ?? 'Supabase is not configured.');
    },
  });
}

function createConfiguredClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) return createUnconfiguredClient();
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = isSupabaseConfigured
  ? createConfiguredClient()
  : createUnconfiguredClient();
