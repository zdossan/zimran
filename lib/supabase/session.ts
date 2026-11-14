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
  const supabase = getBrowserClient();
  if (supabase) {
    const userId = await ensureAnonSession();
    if (userId) {
      const column = COLUMN_BY_KEY[key];
      await supabase.from("sessions_data").upsert({ user_id: userId, [column]: value });
      return;
    }
    // No user ID (anon sign-in failed/disabled) — fall through to localStorage so data isn't lost.
  }

  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export async function loadSessionData<T>(key: SessionKey): Promise<T | null> {
  const supabase = getBrowserClient();
  if (supabase) {
    const userId = await ensureAnonSession();
    if (userId) {
      const column = COLUMN_BY_KEY[key];
      const { data } = await supabase
        .from("sessions_data")
        .select(column)
        .eq("user_id", userId)
        .maybeSingle();
      return (data ? (data as Record<Column, T | null>)[column] : null) ?? null;
    }
  }

  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PREFIX + key);
  return raw ? (JSON.parse(raw) as T) : null;
}
