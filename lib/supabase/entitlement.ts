// STUB — owned by P4 (plans/04-pay-trust-pitch.md). Replace bodies; keep signatures.
import type { Entitlement } from "@/lib/types";

const BLOCKED_PAID_STATES = new Set(["NY", "CA"]);

export function isPaidStateBlocked(state: string): boolean {
  return BLOCKED_PAID_STATES.has(state.trim().toUpperCase());
}

export async function getEntitlement(state?: string): Promise<Entitlement> {
  return { pro: false, paidStateBlocked: state ? isPaidStateBlocked(state) : false };
}
