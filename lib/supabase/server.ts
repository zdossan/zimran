// Service-role Supabase client — owned by P4 (plans/04-pay-trust-pitch.md).
// SERVER ONLY: uses SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS. Never import this module
// from a client component or expose its output to the browser.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "getServiceClient: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Resolves the signed-in user id from a request's `Authorization: Bearer <token>` header.
 * Shared by every app/api/** route handler that needs to know who's calling (checkout,
 * checkout/confirm, billing-portal) — this stack has no server-side session (see
 * lib/supabase/client.ts), so the bearer token is the only way to authenticate a route handler.
 * Returns null for a missing header, an invalid/expired token, or any Supabase error — callers
 * should treat null as unauthenticated (401).
 */
export async function resolveUserId(req: Request): Promise<string | null> {
  const token = req.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  const { data, error } = await getServiceClient().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}
