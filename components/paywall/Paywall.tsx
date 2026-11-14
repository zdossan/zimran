"use client";
// Owned by P4 (plans/04-pay-trust-pitch.md). Locks a feature behind entitlement + checkout.
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { getEntitlement, isPaidStateBlocked, DEMO_UNLOCK_KEY } from "@/lib/supabase/entitlement";
import { getBrowserClient } from "@/lib/supabase/client";
import type { Entitlement } from "@/lib/types";

export type PaywallFeature = "audit-details" | "letters" | "action-plan" | "report";

const LABELS: Record<PaywallFeature, string> = {
  "audit-details": "Full audit details",
  letters: "Ready-to-send letters",
  "action-plan": "Your dated action plan",
  report: "Guardian report (PDF)",
};

const ACK_TEXT =
  "I understand that Student Loan Guardian is not affiliated with the U.S. Department of Education, that I can apply for repayment plans for free at StudentAid.gov or through my servicer, and that my subscription renews automatically until I cancel.";

type Plan = "monthly" | "annual";

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

  return (
    <Card data-feature={feature}>
      <CardHeader>
        <CardTitle>🔒 {LABELS[feature]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Disclaimer variant="paywall" />

        {blocked ? (
          <p className="text-sm font-medium">
            Paid plans aren&apos;t available in your state yet. You can use our free tools.
          </p>
        ) : (
          <>
            <div role="radiogroup" aria-label="Choose a plan" className="flex gap-2">
              <Button
                type="button"
                role="radio"
                aria-checked={plan === "monthly"}
                variant={plan === "monthly" ? "default" : "outline"}
                onClick={() => setPlan("monthly")}
              >
                Monthly — $9/mo
              </Button>
              <Button
                type="button"
                role="radio"
                aria-checked={plan === "annual"}
                variant={plan === "annual" ? "default" : "outline"}
                onClick={() => setPlan("annual")}
              >
                Annual — $79/yr (save 27%)
              </Button>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id={`paywall-ack-${feature}`}
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(Boolean(checked))}
              />
              <Label htmlFor={`paywall-ack-${feature}`} className="text-xs font-normal leading-snug">
                {ACK_TEXT}
              </Label>
            </div>
          </>
        )}
      </CardContent>
      {!blocked && (
        <CardFooter className="flex flex-col items-stretch gap-2">
          <Button
            type="button"
            disabled={!acknowledged || checkoutStatus === "loading"}
            onClick={handleCheckout}
          >
            Continue to secure checkout
          </Button>
          {checkoutStatus === "not-configured" && (
            <Button type="button" variant="outline" onClick={handleDemoUnlock}>
              Demo unlock (no payment configured)
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
