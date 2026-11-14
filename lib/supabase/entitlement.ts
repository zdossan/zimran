// Owned by P4 (plans/04-pay-trust-pitch.md).
// Reads the signed-in user's own `entitlements` row via RLS (the migration only grants `select`
// to `authenticated` on that table). This file never inserts/updates/upserts against
// `entitlements` — all writes are server-side-only (Task 3's job, via the service-role key).
import type { Entitlement } from "@/lib/types";
import { getBrowserClient, ensureAnonSession } from "@/lib/supabase/client";

const BLOCKED_PAID_STATES = new Set(["NY", "CA"]);
export const DEMO_UNLOCK_KEY = "slg_demo_unlock";

export function isPaidStateBlocked(state: string): boolean {
  return BLOCKED_PAID_STATES.has(state.trim().toUpperCase());
}

interface EntitlementRow {
  pro: boolean;
  plan?: "monthly" | "annual" | null;
}

export async function getEntitlement(state?: string): Promise<Entitlement> {
  const paidStateBlocked = state ? isPaidStateBlocked(state) : false;

  const supabase = getBrowserClient();
  if (supabase) {
    const userId = await ensureAnonSession();
    if (userId) {
      const { data, error } = await supabase
        .from("entitlements")
        .select("pro, plan")
        .eq("user_id", userId)
        .maybeSingle();
      if (!error && data) {
        const row = data as EntitlementRow;
        if (row.pro) {
          return { pro: true, plan: row.plan ?? undefined, paidStateBlocked };
        }
      }
      // No row, pro=false, or a read error — fall through to the localStorage demo-unlock
      // check below rather than treating any of these as a hard "not entitled".
    }
  }

  // No Supabase configured, or no server-written entitlement found: fall back to the local
  // demo-unlock flag set by the Paywall's "Demo unlock (no payment configured)" button.
  const demoUnlocked = typeof window !== "undefined" && window.localStorage.getItem(DEMO_UNLOCK_KEY) === "1";
  return { pro: demoUnlocked, paidStateBlocked };
}
