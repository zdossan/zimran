"use client";
// The paid CTA on the results page: opens the separate /paywall page. The starting price sits right under
// it (§H: prices up front) — except in NY/CA, where paid plans are blocked and the paywall page explains why.
// A paying user goes straight to their plan.
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getEntitlement, isPaidStateBlocked } from "@/lib/supabase/entitlement";
import { buttonClass } from "@/components/brand/kit";
import { PRICE_FROM } from "@/components/funnel/labels";

export function ActionPlanLink({ state }: { state: string }) {
  const [pro, setPro] = useState(false);
  const blocked = isPaidStateBlocked(state);

  useEffect(() => {
    let live = true;
    getEntitlement(state)
      .then((e) => live && setPro(e.pro))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [state]);

  return (
    <div className="w-full sm:w-auto">
      <Link href="/paywall" className={buttonClass("primary", "w-full sm:w-auto")}>
        {pro ? "Open my dated action plan" : "Get my dated action plan"}
        <ArrowRight aria-hidden className="size-4" />
      </Link>
      {!pro && !blocked ? (
        <p className="mt-1.5 text-center text-sm text-slate-600 sm:text-left">From {PRICE_FROM} · cancel anytime</p>
      ) : null}
    </div>
  );
}
