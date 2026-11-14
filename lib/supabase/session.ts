// Owned by P4 (plans/04-pay-trust-pitch.md).
// Supabase-backed when NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set (see
// supabase/migrations/0001_init.sql for the `sessions_data` table); falls back to localStorage
// when they're unset, so the rest of the app keeps working on mocks without a Supabase project.
import { getBrowserClient, ensureAnonSession } from "@/lib/supabase/client";

export type SessionKey = "borrowerInput" | "comparison" | "audit";
const PREFIX = "slg_session_";

type Column = "borrower_input" | "comparison" | "audit";
const COLUMN_BY_KEY: Record<SessionKey, Column> = {
  borrowerInput: "borrower_input",
  comparison: "comparison",
  audit: "audit",
};

export async function saveSessionData(key: SessionKey, value: unknown): Promise<void> {
  // Guard entry into the Supabase path, not just the localStorage fallback: this must stay a
  // no-op-or-localStorage function on the server (Server Components, route handlers), never
  // trigger a server-side signInAnonymously() call.
  if (typeof window === "undefined") return;

  const supabase = getBrowserClient();
  if (supabase) {
    const userId = await ensureAnonSession();
    if (userId) {
      const column = COLUMN_BY_KEY[key];
      const { error } = await supabase.from("sessions_data").upsert({ user_id: userId, [column]: value });
      if (!error) return;
      console.error("saveSessionData: Supabase upsert failed, falling back to localStorage", error);
    }
    // No user ID (anon sign-in failed/disabled), or a write error above — fall through to
    // localStorage so data isn't silently lost.
  }

  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export async function loadSessionData<T>(key: SessionKey): Promise<T | null> {
  // Same guard as saveSessionData — don't enter the Supabase path on the server.
  if (typeof window === "undefined") return null;

  const supabase = getBrowserClient();
  if (supabase) {
    const userId = await ensureAnonSession();
    if (userId) {
      const column = COLUMN_BY_KEY[key];
      const { data, error } = await supabase
        .from("sessions_data")
        .select(column)
        .eq("user_id", userId)
        .maybeSingle();
      if (!error) {
        return (data ? (data as Record<Column, T | null>)[column] : null) ?? null;
      }
      console.error("loadSessionData: Supabase select failed, falling back to localStorage", error);
    }
    // No user ID, or a read error above — fall through to localStorage rather than conflating
    // "read failed" with "never saved".
  }

  const raw = window.localStorage.getItem(PREFIX + key);
  return raw ? (JSON.parse(raw) as T) : null;
}
