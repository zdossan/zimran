"use client";
// The primary results CTA. Tapping it reveals P4's Paywall in place (no dialog); the price is in the label
// (§H: prices upfront). Paid users see the plan open; in NY/CA (paid plans blocked) the label drops the price.
// The panel stays mounted (hidden) so the Paywall's acknowledgement checkbox survives open/close.
import { useEffect, useState } from "react";
import type { ActionItem } from "@/lib/types";
import { Paywall } from "@/components/paywall/Paywall";
import { getEntitlement, isPaidStateBlocked } from "@/lib/supabase/entitlement";
import { PRICE_FROM, shortDate } from "@/components/funnel/labels";

function ActionList({ actions }: { actions: ActionItem[] }) {
  return (
    <ol className="space-y-2">
      {actions.map((a) => (
        <li key={a.id} className="rounded-xl border bg-card p-3 text-sm">
          <p className="font-semibold">
            {a.dueDate ? `${shortDate(a.dueDate)} — ` : ""}
            {a.title}
          </p>
          <p className="text-muted-foreground">{a.detail}</p>
        </li>
      ))}
    </ol>
  );
}

export function ActionPlanCta({ state, actions }: { state: string; actions: ActionItem[] }) {
  const [open, setOpen] = useState(false);
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

  if (pro) {
    return (
      <section aria-labelledby="action-plan-heading" className="space-y-3">
        <h3 id="action-plan-heading" className="text-base font-extrabold">
          Your dated action plan
        </h3>
        <Paywall feature="action-plan" state={state}>
          <ActionList actions={actions} />
        </Paywall>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="action-plan-panel"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-extrabold text-primary-foreground shadow-[0_10px_22px_-10px_rgba(72,64,187,0.8)] transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {blocked ? "Get my dated action plan" : `Get my dated action plan · from ${PRICE_FROM}`}
      </button>
      <div id="action-plan-panel" hidden={!open}>
        <Paywall feature="action-plan" state={state}>
          <ActionList actions={actions} />
        </Paywall>
      </div>
    </div>
  );
}
