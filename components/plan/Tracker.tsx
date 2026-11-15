"use client";
// "Your monthly check-in": the reason to come back. Statement checks over time with the money they found,
// and a qualifying-payment counter toward PSLF or the recommended plan's forgiveness. Device-local.
import { useState } from "react";
import Link from "next/link";
import type { PlanComparison } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import { Card, buttonClass } from "@/components/brand/kit";
import { LetterPanel } from "@/components/plan/LetterPanel";
import { loadAuditHistory, loadPayments, savePayments } from "@/components/plan/progress";
import { PLAN_LABEL, RULES_DATE_LABEL, shortDate } from "@/components/funnel/labels";

const monthYear = (d: Date) => d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

function PaymentCounter({ comparison, now }: { comparison: PlanComparison; now: Date }) {
  const rec = comparison.results.find((r) => r.plan === comparison.recommended && r.available);
  const target = comparison.pslfTrack ? 120 : (rec?.forgivenessYears ?? 0) * 12;
  const [count, setCount] = useState<number | null>(() => loadPayments());
  if (!target) return null;

  const made = Math.min(count ?? 0, target);
  const left = target - made;
  const when = new Date(now);
  when.setUTCMonth(when.getUTCMonth() + left);
  const rule = comparison.pslfTrack
    ? "Under current rules, PSLF forgives the balance left after 120 qualifying payments while you work for a qualifying employer."
    : `Under current rules, a balance left after ${rec?.forgivenessYears} years of qualifying payments on ${rec ? PLAN_LABEL[rec.plan] : "this plan"} is forgiven (federally taxable).`;

  return (
    <Card data-testid="payment-counter" className="space-y-4">
      <div>
        <h4 className="text-lg font-semibold">{comparison.pslfTrack ? "PSLF progress" : "Progress toward forgiveness"}</h4>
        <p className="text-sm text-slate-600">Find your count on StudentAid.gov, then update it here after each certification.</p>
      </div>
      <div>
        <label htmlFor="qualifying-payments" className="block text-sm font-semibold text-slate-900">
          Qualifying payments so far
        </label>
        <input
          id="qualifying-payments"
          type="number"
          inputMode="numeric"
          min={0}
          max={target}
          value={count ?? ""}
          placeholder="0"
          onChange={(e) => {
            const n = e.target.value === "" ? null : Math.max(0, Math.min(target, Math.floor(Number(e.target.value))));
            const v = n === null || Number.isNaN(n) ? null : n;
            setCount(v);
            if (v !== null) savePayments(v);
          }}
          className="mt-2 min-h-11 w-32 rounded-xl border border-slate-300 bg-white px-3 text-base focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100"
        />
      </div>
      <div>
        <p className="text-base font-semibold">
          {made} of {target}
        </p>
        <div aria-hidden className="mt-2 h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-brand-700" style={{ width: `${Math.round((made / target) * 100)}%` }} />
        </div>
        <p className="mt-2 text-sm text-slate-700">
          {left} payments to go, around {monthYear(when)} if you pay every month. Estimate.
        </p>
      </div>
      <p className="text-xs text-slate-600">
        {rule} Rules as of {RULES_DATE_LABEL}.
      </p>
    </Card>
  );
}

export function Tracker({ comparison, now }: { comparison: PlanComparison; now: Date }) {
  const [history] = useState(() => loadAuditHistory());
  const found = history.reduce((sum, h) => sum + h.found, 0);
  const withError = history.find((h) => h.errors > 0);

  return (
    <section aria-labelledby="tracker-heading" className="space-y-4">
      <div>
        <h3 id="tracker-heading" className="text-xl font-semibold">
          Your monthly check-in
        </h3>
        <p className="text-sm text-slate-600">Servicers make billing mistakes. Check each new statement when it arrives.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <Card className="space-y-4">
          <h4 className="text-lg font-semibold">Statement checks</h4>
          {history.length ? (
            <>
              <div>
                <p className="text-sm text-slate-600">Possible errors found for you so far</p>
                <p data-testid="found-total" className="text-3xl font-semibold text-brand-800">
                  {formatUSD(found)}
                </p>
                <p className="text-xs text-slate-600">Estimate: amounts your servicer may owe you if the errors are confirmed.</p>
              </div>
              <ul className="space-y-2 text-sm">
                {history.slice(0, 3).map((h, i) => (
                  <li key={`${h.checkedOn}-${i}`} className="rounded-lg bg-slate-50 px-3 py-2">
                    {shortDate(h.checkedOn)} · {h.servicer ?? "Statement"} · {h.errors ? `${h.errors} possible error${h.errors === 1 ? "" : "s"}` : "no errors"}
                    {h.found ? ` · ${formatUSD(h.found)}` : ""}
                  </li>
                ))}
              </ul>
              <Link href="/audit" className={buttonClass("primary", "w-full sm:w-auto")}>
                Check this month&apos;s statement
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-700">No statements checked yet. Upload your latest statement and we&apos;ll compare it with the rules.</p>
              <Link href="/audit" className={buttonClass("primary", "w-full sm:w-auto")}>
                Check a statement
              </Link>
            </>
          )}
          {withError ? (
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-700">Servicer hasn&apos;t fixed an error within 30 days? You can send a complaint to the CFPB yourself.</p>
              <LetterPanel id="cfpb_complaint" comparison={comparison} servicer={withError.servicer} now={now} />
            </div>
          ) : null}
        </Card>
        <PaymentCounter comparison={comparison} now={now} />
      </div>
    </section>
  );
}
