// Browser Supabase client — owned by P4 (plans/04-pay-trust-pitch.md).
// Returns null when NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are unset, so the
// rest of the app can fall back to localStorage (see lib/supabase/session.ts).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null | undefined;

export function getBrowserClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  cachedClient = url && anonKey ? createClient(url, anonKey) : null;
  return cachedClient;
}

/**
 * Ensures the current browser has a Supabase auth session, signing in anonymously if needed.
 * Returns the user ID, or null when Supabase isn't configured (no env vars) or sign-in fails.
 */
export async function ensureAnonSession(): Promise<string | null> {
  const supabase = getBrowserClient();
  if (!supabase) return null;

  const { data: existing } = await supabase.auth.getSession();
  if (existing.session?.user.id) return existing.session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) return null;
  return data.user.id;
}
