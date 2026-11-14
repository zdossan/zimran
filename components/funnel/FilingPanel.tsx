// Married borrowers: joint vs separate filing — each side's recommended plan, the extra tax, and the net.
import type { FilingComparison, PlanComparison } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import { PLAN_LABEL, RULES_DATE_LABEL } from "@/components/funnel/labels";

const rec = (c: PlanComparison) => c.results.find((r) => r.plan === c.recommended);

export function FilingPanel({ filing }: { filing: FilingComparison }) {
  const joint = rec(filing.mfj);
  const separate = rec(filing.mfs);
  if (!joint?.available || !separate?.available) return null;
  const net = filing.netAnnualSavingMfs;

  return (
    <section data-testid="filing-panel" aria-labelledby="filing-heading" className="space-y-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
      <h3 id="filing-heading" className="font-extrabold">
        Filing jointly vs separately
      </h3>
      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-lg bg-muted/50 p-3">
          <dt className="text-muted-foreground">Filing jointly</dt>
          <dd className="font-medium">
            {PLAN_LABEL[joint.plan]} at {formatUSD(joint.monthlyPayment)} per month
          </dd>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <dt className="text-muted-foreground">Filing separately</dt>
          <dd className="font-medium">
            {PLAN_LABEL[separate.plan]} at {formatUSD(separate.monthlyPayment)} per month
          </dd>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <dt className="text-muted-foreground">Extra federal tax from filing separately</dt>
          <dd className="font-medium">{formatUSD(filing.mfsExtraTaxPerYear)} per year</dd>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <dt className="text-muted-foreground">After that tax</dt>
          <dd className="font-medium">
            {net > 0
              ? `Filing separately saves about ${formatUSD(net)} a year`
              : `Filing jointly saves about ${formatUSD(-net)} a year`}
          </dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">
        Payments: joint {joint.ruleRefs.join(", ")}; separate {separate.ruleRefs.join(", ")}. Tax: 2026 federal brackets for married
        filing separately with the $16,100 standard deduction, brackets only. Rules as of {RULES_DATE_LABEL}. Have a tax professional
        confirm before you file.
      </p>
      <details className="text-sm">
        <summary className="cursor-pointer font-medium">What filing separately can cost you</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          {filing.caveats.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
