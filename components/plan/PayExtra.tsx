"use client";
// "Pay extra or aim for forgiveness?" (Owen Plus): a rough side-by-side of staying on the recommended plan
// and paying more each month.
import { useState } from "react";
import type { PlanComparison } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import { parseMoney } from "@/components/funnel/mapping";
import { PLAN_LABEL, RULES_DATE_LABEL, wholeUSD } from "@/components/funnel/labels";
import { compareExtra, duration, verdict } from "@/components/plan/payoff";

const QUICK = [50, 100, 200, 500];

export function PayExtra({ comparison }: { comparison: PlanComparison }) {
  const [text, setText] = useState("100");
  const extra = Math.max(0, parseMoney(text) ?? 0);
  const c = compareExtra(comparison, extra);
  const plan = PLAN_LABEL[comparison.recommended];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="extra-each-month" className="block text-sm font-semibold">
            Extra each month
          </label>
          <span className="relative mt-1 block">
            <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              $
            </span>
            <input
              id="extra-each-month"
              inputMode="decimal"
              autoComplete="off"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-11 w-32 rounded-xl border border-slate-300 bg-white pl-7 pr-3 text-base focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100"
            />
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setText(String(q))}
              className={`min-h-11 rounded-full px-3.5 text-sm ${extra === q ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              +${q}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div data-testid="stay-result" className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Stay on {plan}</p>
          <p className="mt-1 text-2xl font-medium">{formatUSD(c.stay.payment)}<span className="text-sm text-slate-500">/mo</span></p>
          <p className="mt-2 text-sm text-slate-700">
            {c.stay.forgiven && c.forgivenessYears
              ? `The balance left after ${c.forgivenessYears} years is forgiven under current rules${comparison.pslfTrack ? "" : " (federally taxable)"}.`
              : c.stay.months !== null
                ? `Debt-free in ${duration(c.stay.months)}.`
                : "Your balance doesn't go down at this payment."}
          </p>
          {c.stay.totalPaid ? <p className="mt-1 text-sm text-slate-600">About {wholeUSD(c.stay.totalPaid)} paid in total.</p> : null}
        </div>
        <div data-testid="extra-result" className="rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Pay {formatUSD(extra)} more</p>
          <p className="mt-1 text-2xl font-medium text-brand-800">{formatUSD(c.extra.payment)}<span className="text-sm text-slate-500">/mo</span></p>
          <p className="mt-2 text-sm text-slate-700">
            {c.extra.months !== null ? `You'd be debt-free in ${duration(c.extra.months)}.` : "Still not enough to cover the interest."}
          </p>
          {c.extra.months !== null ? (
            <p className="mt-1 text-sm text-slate-600">
              About {wholeUSD(c.extra.totalPaid)} paid in total, {wholeUSD(c.extra.totalInterest)} of it interest.
            </p>
          ) : null}
        </div>
      </div>

      <p data-testid="extra-verdict" className="text-base font-semibold text-slate-900">
        {verdict(c, !!c.pslfNote)}
      </p>
      {c.pslfNote ? <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">{c.pslfNote}</p> : null}
      <p className="text-xs text-slate-500">
        Rough estimate: assumes your payment and interest rate stay the same; income-driven payments change with your income. Rules as of {RULES_DATE_LABEL}.
      </p>
    </div>
  );
}
