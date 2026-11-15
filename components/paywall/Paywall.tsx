"use client";
// Owned by P4 (plans/04-pay-trust-pitch.md). Locks a feature behind entitlement + checkout.
import { useEffect, useState, type ReactNode } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { getEntitlement, isPaidStateBlocked, DEMO_UNLOCK_KEY } from "@/lib/supabase/entitlement";
import { getBrowserClient } from "@/lib/supabase/client";
import type { Entitlement } from "@/lib/types";

export type PaywallFeature = "audit-details" | "letters" | "action-plan" | "report";

const LABELS: Record<PaywallFeature, string> = {
  "audit-details": "Full audit details",
  letters: "Ready-to-send letters",
  "action-plan": "Your dated action plan",
  report: "Owen report (PDF)",
};

const ACK_TEXT =
  "I understand that Owen is not affiliated with the U.S. Department of Education, that I can apply for repayment plans for free at StudentAid.gov or through my servicer, and that my subscription renews automatically until I cancel.";

type Plan = "monthly" | "annual";

// Prices must match the Stripe prices and texts.ts. `monthly` is the annual price per month (79 / 12).
const PLANS: { id: Plan; label: string; short: string; price: string; per: string; note: string; monthly?: string; badge?: string }[] = [
  { id: "monthly", label: "Monthly", short: "$9/mo", price: "$9", per: "month", note: "Billed every month. Cancel anytime in one step." },
  { id: "annual", label: "Annual", short: "$79/yr", price: "$79", per: "year", note: "Billed once a year. Cancel anytime in one step.", monthly: "$6.58", badge: "Save 27%" },
];

type CheckoutStatus = "idle" | "loading" | "not-configured";

export function Paywall({
  feature,
  state,
  children,
}: {
  feature: PaywallFeature;
  state?: string;
  children: ReactNode;
}) {
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [plan, setPlan] = useState<Plan>("monthly");
  const [acknowledged, setAcknowledged] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>("idle");

  useEffect(() => {
    let active = true;
    getEntitlement(state).then((result) => {
      if (active) setEntitlement(result);
    });
    return () => {
      active = false;
    };
  }, [state]);

  // Synchronous and independent of the async entitlement fetch above, so the block message
  // never flashes an unblocked plan picker first.
  const blocked = state ? isPaidStateBlocked(state) : false;

  if (entitlement?.pro) {
    return <>{children}</>;
  }

  async function handleCheckout() {
    setCheckoutStatus("loading");
    try {
      // /api/checkout resolves the buyer from this bearer token (no server-side session in
      // this stack — see lib/supabase/client.ts); omit it if Supabase isn't configured or no
      // session exists yet, rather than blocking the request.
      const session = await getBrowserClient()?.auth.getSession();
      const token = session?.data.session?.access_token;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan, state }),
      });
      const json: unknown = await res.json().catch(() => null);
      const url =
        res.ok && json && typeof json === "object" && "url" in json && typeof json.url === "string"
          ? json.url
          : null;
      if (url) {
        window.location.href = url;
        return;
      }
    } catch {
      // Network error, route missing (404), etc. — fall through to "not configured" below.
    }
    setCheckoutStatus("not-configured");
  }

  function handleDemoUnlock() {
    window.localStorage.setItem(DEMO_UNLOCK_KEY, "1");
    window.location.reload();
  }

  const chosen = PLANS.find((p) => p.id === plan)!;

  return (
    <section
      data-feature={feature}
      aria-label={`Owen Plus: ${LABELS[feature]}`}
      className="rounded-[28px] bg-white p-5 shadow-[0_24px_60px_-28px_rgba(42,36,117,0.4)] ring-1 ring-slate-900/5 sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-brand-800">
          <Lock aria-hidden className="size-4" />
          Owen Plus
        </p>
        <p className="text-xs text-slate-500">Unlocks: {LABELS[feature]}</p>
      </div>

      {blocked ? (
        <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-900">
          Paid plans aren&apos;t available in your state yet. You can use our free tools.
        </p>
      ) : (
        <>
          <div role="radiogroup" aria-label="Choose a plan" className="mt-4 flex flex-wrap gap-1 rounded-[28px] bg-slate-100 p-1">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={plan === p.id}
                onClick={() => setPlan(p.id)}
                className={`flex min-h-12 min-w-[7.5rem] flex-1 flex-col items-center justify-center rounded-full px-3 py-1.5 leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  plan === p.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="text-sm font-semibold">{p.label}</span>
                <span className="text-xs">
                  {p.short}
                  {p.badge ? <span className="font-semibold text-emerald-700"> · {p.badge}</span> : null}
                </span>
              </button>
            ))}
          </div>

          <p data-testid="price" className="mt-5 text-5xl font-medium tracking-tight text-slate-900">
            {chosen.price}
            <span className="text-lg font-normal text-slate-500">/{chosen.per}</span>
          </p>
          {chosen.monthly ? <p className="mt-1 text-sm font-medium text-emerald-800">That&apos;s {chosen.monthly} a month.</p> : null}
          <p className="mt-1 text-sm text-slate-600">{chosen.note}</p>

          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
            <Checkbox
              id={`paywall-ack-${feature}`}
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(Boolean(checked))}
              className="mt-0.5"
            />
            <Label htmlFor={`paywall-ack-${feature}`} className="text-xs font-normal leading-relaxed text-slate-600">
              {ACK_TEXT}
            </Label>
          </div>

          <Button
            type="button"
            size="lg"
            className="mt-4 h-12 w-full rounded-full text-base font-medium"
            disabled={!acknowledged || checkoutStatus === "loading"}
            onClick={handleCheckout}
          >
            Continue to secure checkout
          </Button>
          <p className="mt-2 text-center text-sm text-slate-600">
            {acknowledged
              ? `You'll be charged ${chosen.price} today, then every ${chosen.per} until you cancel.`
              : "Tick the box above to continue."}
          </p>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck aria-hidden className="size-3.5" />
            Secure checkout by Stripe · no account needed
          </p>
          {checkoutStatus === "not-configured" && (
            <Button type="button" variant="outline" className="mt-3 w-full rounded-full" onClick={handleDemoUnlock}>
              Demo unlock (no payment configured)
            </Button>
          )}
        </>
      )}

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">The fine print</p>
        <Disclaimer variant="paywall" />
      </div>
    </section>
  );
}
