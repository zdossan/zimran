// STUB — owned by P4 (plans/04-pay-trust-pitch.md). localStorage-backed until Supabase is wired.
export type SessionKey = "borrowerInput" | "comparison" | "audit";
const PREFIX = "slg_session_";

export async function saveSessionData(key: SessionKey, value: unknown): Promise<void> {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export async function loadSessionData<T>(key: SessionKey): Promise<T | null> {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PREFIX + key);
  return raw ? (JSON.parse(raw) as T) : null;
}
