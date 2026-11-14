"use client";
// STUB — owned by P4 (plans/04-pay-trust-pitch.md). Renders a locked card until P4 wires Stripe + entitlements.
import type { ReactNode } from "react";

export type PaywallFeature = "audit-details" | "letters" | "action-plan" | "report";

const LABELS: Record<PaywallFeature, string> = {
  "audit-details": "Full audit details",
  letters: "Ready-to-send letters",
  "action-plan": "Your dated action plan",
  report: "Guardian report (PDF)",
};

export function Paywall({ feature, state, children }: { feature: PaywallFeature; state?: string; children: ReactNode }) {
  void state;
  void children;
  return (
    <div data-feature={feature} className="rounded-lg border border-dashed p-4 text-sm">
      <p className="font-medium">🔒 {LABELS[feature]}</p>
      <p className="text-muted-foreground">Unlock with Guardian ($9/mo or $79/yr). Checkout coming soon.</p>
    </div>
  );
}
