"use client";
// "My income changed" (Owen Plus): re-run the plan with the new income and say whether to recertify now.
import { useState } from "react";
import type { PlanComparison } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import { parseMoney } from "@/components/funnel/mapping";
import { PLAN_FULL_NAME, PLAN_LABEL, RULES_DATE_LABEL } from "@/components/funnel/labels";
import { incomeCheck } from "@/components/plan/income";

export function IncomeChange({ comparison }: { comparison: PlanComparison }) {
  const [text, setText] = useState("");
  const agi = parseMoney(text);
  const r = agi !== null && agi >= 0 ? incomeCheck(comparison, agi) : null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Got a raise or a pay cut? Enter your new yearly income (AGI). Your answers stay as they are; this is a what-if.
      </p>
      <div className="max-w-xs">
        <label htmlFor="new-income" className="block text-sm font-semibold">
          Your new yearly income
        </label>
        <span className="relative mt-1 block">
          <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            $
          </span>
          <input
            id="new-income"
            inputMode="decimal"
            autoComplete="off"
            placeholder={String(comparison.input.agi)}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white pl-7 pr-3 text-base focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100"
          />
        </span>
      </div>
      {r ? (
        <div data-testid="income-result" className="space-y-2 rounded-2xl bg-brand-50 p-4">
          <p className="text-sm text-slate-700">
            Your payment on {PLAN_FULL_NAME[r.plan]}: <span className="font-semibold">{formatUSD(r.oldPayment)}</span> →{" "}
            <span className="font-semibold text-brand-800">{formatUSD(r.newPayment)}</span> a month
          </p>
          <p className="text-base font-semibold text-slate-900">
            {r.advice === "recertify_now"
              ? "Recertify now. Under current rules you can ask your servicer to recalculate early when your income drops."
              : r.advice === "wait"
                ? "No need to recertify early. Your new income counts at your next yearly recertification."
                : "Your payment stays about the same. Nothing to do."}
          </p>
          {r.newRecommended !== r.plan ? (
            <p className="text-sm text-slate-700">
              With this income, {PLAN_LABEL[r.newRecommended]} would be cheaper at {formatUSD(r.newRecommendedPayment)} a month. Re-run the free check to compare.
            </p>
          ) : null}
          <p className="text-xs text-slate-500">Estimate · Rules as of {RULES_DATE_LABEL}</p>
        </div>
      ) : null}
    </div>
  );
}
