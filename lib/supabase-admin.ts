import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client with Service Role Key.
 * Used for admin operations like updating user passwords.
 * NEVER expose this client or key to the browser.
 *
 * Lazy-initialized to avoid build-time errors when the
 * SUPABASE_SERVICE_ROLE_KEY env var is not yet set.
 */

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL environment variable.'
    );
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _supabaseAdmin;
}
