"use client";
// Owned by P4 (plans/04-pay-trust-pitch.md, Task 3: checkout).
// Client half of app/checkout/success/page.tsx. Must run client-side: this stack's Supabase
// session only exists in the browser (no @supabase/ssr / cookie integration — see
// lib/supabase/client.ts), so confirming the Checkout Session and sending the bearer token both
// have to happen here. The server page passes session_id in as a prop (read from the awaited
// searchParams prop) instead of this component calling useSearchParams() itself, so the route
// stays dynamically rendered without needing a Suspense boundary around useSearchParams().
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonClass } from "@/components/brand/kit";
import { getBrowserClient } from "@/lib/supabase/client";

type Status = "loading" | "unlocked" | "error";

async function getAccessToken(): Promise<string | undefined> {
  const result = await getBrowserClient()?.auth.getSession();
  return result?.data.session?.access_token;
}

export function CheckoutSuccessClient({ sessionId }: { sessionId: string | null }) {
  const [status, setStatus] = useState<Status>("loading");
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function confirm() {
      if (!sessionId) {
        if (active) setStatus("error");
        return;
      }
      try {
        const token = await getAccessToken();
        const res = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const json: unknown = await res.json().catch(() => null);
        const pro = res.ok && !!json && typeof json === "object" && (json as { pro?: unknown }).pro === true;
        if (active) setStatus(pro ? "unlocked" : "error");
      } catch {
        if (active) setStatus("error");
      }
    }

    confirm();
    return () => {
      active = false;
    };
  }, [sessionId]);

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json: unknown = await res.json().catch(() => null);
      const url =
        json && typeof json === "object" && typeof (json as { url?: unknown }).url === "string"
          ? (json as { url: string }).url
          : null;
      if (url) {
        window.location.href = url;
        return;
      }
    } catch {
      // Network error, route not configured, etc. — just stop the spinner below.
    }
    setPortalLoading(false);
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Confirming your payment…</p>;
  }

  if (status === "error") {
    return (
      <section className="space-y-2">
        <p className="text-sm font-medium">We couldn&apos;t confirm your payment yet.</p>
        <p className="text-sm text-muted-foreground">
          If you were charged, check your email receipt or try refreshing this page. Nothing has been unlocked.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <p className="text-2xl font-semibold">You&apos;re unlocked</p>
        <p className="text-base text-muted-foreground">Your dated action plan, letters and Owen report are ready.</p>
      </div>
      <Link href="/paywall" className={buttonClass("primary", "w-full sm:w-auto")}>
        See my dated action plan
      </Link>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium text-brand-800">
        <Link href="/results" className="py-2 underline underline-offset-4">
          Back to results
        </Link>
        <Link href="/audit" className="py-2 underline underline-offset-4">
          Go to audit
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        On another phone or computer? Open Pricing, choose “Restore access” and enter the email you paid with. We&apos;ll send you a code.
      </p>
      <Button type="button" variant="outline" disabled={portalLoading} onClick={handleManageSubscription}>
        Manage subscription
      </Button>
    </section>
  );
}
