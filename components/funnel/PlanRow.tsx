// One plan as a compact, tap-to-open row. The rules, forgiveness timing and notes live in the open part.
// <summary> holds phrasing content only (spans), per its content model.
import { ChevronDown } from "lucide-react";
import type { PlanResult } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import { PLAN_LABEL, RULES_DATE_LABEL, signedUSD } from "@/components/funnel/labels";

const SHRINKS_TEXT = "text-[#0B7A3B]"; // 5.44:1 on white
const GROWS_TEXT = "text-[#C81E4F]"; // 5.59:1 on white

export function PlanRow({ r, recommended }: { r: PlanResult; recommended: boolean }) {
  const label = PLAN_LABEL[r.plan];
  const change = r.balanceChange12m;
  const fm = r.firstMonth;

  return (
    <section
      aria-label={`${label} plan`}
      className={`rounded-2xl shadow-sm ${r.available ? "bg-card" : "bg-muted"} ${recommended ? "ring-2 ring-primary" : "ring-1 ring-border"}`}
    >
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
          <span className="min-w-0 flex-1">
            <span className={`flex flex-wrap items-center gap-2 font-extrabold ${r.available ? "" : "text-muted-foreground"}`}>
              {label}
              {recommended ? <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-extrabold text-primary-foreground">BEST</span> : null}
            </span>
            <span className="block text-xs font-semibold text-muted-foreground">
              {r.available ? (r.pslfQualifying ? "Counts toward PSLF" : "No PSLF credit") : `Not available: ${r.unavailableReason}`}
            </span>
          </span>
          {r.available ? (
            <span className="text-right">
              <span className="block text-xl font-extrabold tracking-tight">{formatUSD(r.monthlyPayment)}</span>
              {change !== undefined ? (
                <span className={`block text-xs font-bold ${change > 0 ? GROWS_TEXT : change < 0 ? SHRINKS_TEXT : "text-muted-foreground"}`}>
                  Balance {signedUSD(change)}/yr
                </span>
              ) : null}
            </span>
          ) : null}
          <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-1.5 border-t px-4 py-3 text-sm text-muted-foreground">
          {r.available && r.forgivenessYears ? (
            <p>Under current rules, a balance left after {r.forgivenessYears} years of qualifying payments is forgiven (federally taxable).</p>
          ) : null}
          {fm && (fm.waived > 0 || fm.match > 0) ? (
            <p>
              First month: {formatUSD(fm.waived)} of interest waived and a {formatUSD(fm.match)} principal match.
            </p>
          ) : null}
          {r.available ? r.notes.map((n) => <p key={n}>{n}</p>) : null}
          <p className="text-xs">
            Rules: {r.ruleRefs.join(" · ")} · Rules as of {RULES_DATE_LABEL}
          </p>
        </div>
      </details>
    </section>
  );
}
