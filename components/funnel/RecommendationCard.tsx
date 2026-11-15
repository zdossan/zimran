// The answer first: recommended plan, whole-dollar monthly payment, the reason, two facts and the next steps.
import Link from "next/link";
import { FileSearch, Info, Sparkles } from "lucide-react";
import type { PlanComparison } from "@/lib/types";
import { Badge, Card, buttonClass } from "@/components/brand/kit";
import { ActionPlanLink } from "@/components/funnel/ActionPlanLink";
import { PLAN_FULL_NAME, PLAN_LABEL, RULES_DATE_LABEL, wholeUSD } from "@/components/funnel/labels";

function balanceChip(change: number) {
  if (change < 0) return `↓ ${wholeUSD(-change)} this year`;
  if (change > 0) return `↑ ${wholeUSD(change)} this year`;
  return "Balance flat this year";
}

export function RecommendationCard({ comparison, notes = [] }: { comparison: PlanComparison; notes?: string[] }) {
  const rec = comparison.results.find((r) => r.plan === comparison.recommended && r.available);
  const change = rec?.balanceChange12m ?? 0;

  return (
    <Card data-testid="recommendation" className="overflow-hidden border-brand-200 bg-gradient-to-br from-white to-brand-50">
      <div aria-hidden className="bg-brand-gradient -mx-6 -mt-6 mb-6 h-2 sm:-mx-8 sm:-mt-8 sm:mb-8" />
      {rec ? (
        <>
          <Badge tone="primary">
            <Sparkles aria-hidden className="size-3.5" />
            Recommended for you
          </Badge>
          <h2 className="mt-5 text-3xl font-medium tracking-tight sm:text-4xl">Your best plan: {PLAN_LABEL[rec.plan]}</h2>
          <p className="mt-1 text-lg font-medium text-slate-700">{PLAN_FULL_NAME[rec.plan]}</p>
          <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
            <p className="text-5xl font-semibold tracking-tight text-brand-800 sm:text-6xl">
              <span data-testid="hero-number">{wholeUSD(rec.monthlyPayment)}</span>
            </p>
            <p className="pb-2 text-base font-medium text-slate-700">estimated per month</p>
          </div>
          <div data-testid="hero-chips" className="mt-4 flex flex-wrap gap-2">
            <Badge tone={change > 0 ? "warning" : "success"}>{balanceChip(change)}</Badge>
            {comparison.pslfTrack && rec.pslfQualifying ? <Badge tone="secondary">Counts toward PSLF ✓</Badge> : null}
          </div>
          <p className="mt-6 max-w-3xl text-lg text-slate-700">{comparison.reason}</p>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-medium tracking-tight">We can&apos;t compare plans for these loans</h2>
          <p className="mt-3 max-w-xl text-lg text-slate-700">None of the loans you entered are covered by RAP, IBR or the Standard plans in this check.</p>
        </>
      )}

      {notes.length ? (
        <ul className="mt-5 space-y-2">
          {notes.map((n) => (
            <li key={n} className="flex gap-2 text-sm text-slate-700">
              <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-sky-700" />
              {n}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-5 text-sm font-medium text-slate-600">Estimate · Rules as of {RULES_DATE_LABEL}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
        {rec ? <ActionPlanLink state={comparison.input.state} /> : null}
        <Link href="/audit" className={buttonClass("secondary", "w-full sm:w-auto")}>
          <FileSearch aria-hidden className="size-4" />
          Check my servicer statement
        </Link>
      </div>
    </Card>
  );
}
