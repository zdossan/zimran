// One repayment plan as a card in the comparison grid. Every number sits next to its rule and the rules date.
import { Lock, TrendingDown, TrendingUp } from "lucide-react";
import type { PlanResult } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import { Badge } from "@/components/brand/kit";
import { PLAN_FULL_NAME, PLAN_LABEL, RULES_DATE_LABEL } from "@/components/funnel/labels";

function balanceLine(change: number) {
  if (change < 0) return { text: `shrinks by ${formatUSD(-change)}`, cls: "text-emerald-800", Icon: TrendingDown };
  if (change > 0) return { text: `grows by ${formatUSD(change)}`, cls: "text-red-800", Icon: TrendingUp };
  return { text: "stays the same", cls: "text-slate-700", Icon: TrendingDown };
}

export function PlanCard({ r, recommended, cheapest, maxPayment }: { r: PlanResult; recommended: boolean; cheapest: boolean; maxPayment: number }) {
  const label = PLAN_LABEL[r.plan];
  const fm = r.firstMonth;
  const balance = r.balanceChange12m !== undefined ? balanceLine(r.balanceChange12m) : null;
  // Payment bar from zero, scaled to the most expensive available plan: decorative, the number is right above it.
  const width = maxPayment > 0 ? Math.max(4, Math.round((r.monthlyPayment / maxPayment) * 100)) : 0;

  return (
    <section
      aria-label={`${label} plan`}
      className={`flex h-full flex-col rounded-2xl border p-6 shadow-sm ${r.available ? "bg-white" : "bg-slate-50"} ${
        recommended ? "border-brand-700 ring-1 ring-brand-700" : "border-slate-200"
      }`}
    >
      <div className="flex min-h-7 flex-wrap items-center gap-2">
        {recommended ? <Badge tone="primary">Recommended</Badge> : null}
        {cheapest && !recommended ? <Badge tone="neutral">Cheapest per month</Badge> : null}
        {!r.available ? (
          <Badge tone="error">
            <Lock aria-hidden className="size-3.5" />
            Unavailable
          </Badge>
        ) : null}
      </div>
      <h3 className="mt-4 text-xl font-semibold">
        {PLAN_FULL_NAME[r.plan]} <span className="font-medium text-slate-600">({label})</span>
      </h3>

      {r.available ? (
        <>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-600">Estimated monthly payment</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900 sm:text-4xl">
            <span>{formatUSD(r.monthlyPayment)}</span>
            <span className="text-base font-medium text-slate-600"> / mo</span>
          </p>
          <div aria-hidden className="mt-3 h-2 rounded-full bg-slate-100">
            <div className={`h-2 rounded-full ${recommended ? "bg-brand-700" : "bg-slate-400"}`} style={{ width: `${width}%` }} />
          </div>
          {balance ? (
            <p className={`mt-5 flex items-center gap-2 text-sm font-semibold ${balance.cls}`}>
              <balance.Icon aria-hidden className="size-4 shrink-0" />
              Balance in 12 months: {balance.text}
            </p>
          ) : null}
          <p className="mt-3 text-sm text-slate-700">
            <span className="font-semibold">PSLF: </span>
            {r.pslfQualifying ? "Payments count toward PSLF." : "Payments do not count toward PSLF."}
          </p>
          <div className="mt-3 space-y-1.5 text-sm text-slate-600">
            {r.forgivenessYears ? (
              <p>Under current rules, a balance left after {r.forgivenessYears} years of qualifying payments is forgiven (federally taxable).</p>
            ) : null}
            {fm && (fm.waived > 0 || fm.match > 0) ? (
              <p>
                First month: {formatUSD(fm.waived)} of interest waived and a {formatUSD(fm.match)} principal match.
              </p>
            ) : null}
            {r.notes.map((n) => (
              <p key={n}>{n}</p>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 rounded-xl bg-red-50 p-4 text-base text-red-900">{r.unavailableReason}</p>
      )}

      <p className="mt-auto pt-6 text-xs text-slate-600">
        Rules: {r.ruleRefs.join(" · ")} · Rules as of {RULES_DATE_LABEL}
      </p>
    </section>
  );
}
