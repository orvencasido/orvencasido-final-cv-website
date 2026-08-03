import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables for Supabase integration.
// Supports both Vite VITE_ prefix and Next.js style NEXT_PUBLIC_ prefix.
const env = (import.meta as any).env || {};
export const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Supabase client instance (initialized if credentials are present, otherwise null fallback)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Helper to get the authenticated user or session from Supabase
 */
export async function getSupabaseUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}
