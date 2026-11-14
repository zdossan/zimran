// One repayment plan: payment, balance change, PSLF, forgiveness timing and the rules behind the numbers.
import type { PlanResult } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { PLAN_LABEL, RULES_DATE_LABEL } from "@/components/funnel/labels";

function BalanceLine({ change }: { change: number }) {
  if (change > 0) return <p className="text-sm font-medium text-destructive">Balance grows {formatUSD(change)} this year</p>;
  if (change < 0) return <p className="text-sm font-medium">Balance shrinks {formatUSD(-change)} this year</p>;
  return <p className="text-sm font-medium">Balance stays about the same this year</p>;
}

export function PlanCard({ r, recommended }: { r: PlanResult; recommended: boolean }) {
  const headingId = `plan-${r.plan}`;
  return (
    <section
      aria-labelledby={headingId}
      className={`space-y-2 rounded-xl border p-4 ${r.available ? "" : "bg-muted/40 text-muted-foreground"} ${recommended ? "border-primary ring-1 ring-primary" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 id={headingId} className="font-semibold text-foreground">
          {PLAN_LABEL[r.plan]} plan
        </h3>
        {recommended ? <Badge>Recommended</Badge> : null}
        {r.available ? <Badge variant="outline">{r.pslfQualifying ? "Counts toward PSLF" : "Doesn't count toward PSLF"}</Badge> : null}
      </div>

      {r.available ? (
        <>
          <p>
            <span className="text-2xl font-bold text-foreground">{formatUSD(r.monthlyPayment)}</span>
            <span className="text-sm text-muted-foreground"> per month</span>
          </p>
          {r.balanceChange12m !== undefined ? <BalanceLine change={r.balanceChange12m} /> : null}
          {r.forgivenessYears ? (
            <p className="text-sm text-muted-foreground">
              Under current rules, a balance left after {r.forgivenessYears} years of qualifying payments is forgiven (federally taxable).
            </p>
          ) : null}
          {r.firstMonth ? (
            <p className="text-xs text-muted-foreground">
              First month: {formatUSD(r.firstMonth.waived)} of interest waived and a {formatUSD(r.firstMonth.match)} principal match.
            </p>
          ) : null}
          {r.notes.map((n) => (
            <p key={n} className="text-xs text-muted-foreground">
              {n}
            </p>
          ))}
        </>
      ) : (
        <p className="text-sm">Not available: {r.unavailableReason}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Rules: {r.ruleRefs.join(" · ")} · Rules as of {RULES_DATE_LABEL}
      </p>
    </section>
  );
}
