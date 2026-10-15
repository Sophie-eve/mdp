import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials from Vite environment variables
// Supports VITE_SUPABASE_PUBLISHABLE_KEY as requested, with fallback to VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabasePublishableKey.includes('your-supabase-publishable')
);

/**
 * Reusable Supabase client instance.
 * If credentials are not yet supplied, we initialize a dummy or null client
 * that won't crash the application, enabling a friendly configuration screen.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const getSupabaseConfig = () => ({
  url: supabaseUrl || '',
  isConfigured: isSupabaseConfigured,
  hasUrl: Boolean(supabaseUrl),
  hasKey: Boolean(supabasePublishableKey),
});
