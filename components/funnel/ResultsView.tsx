"use client";
// Results page body (owned by P2). Presentational: the engine runs in ResultsScreen.
// Layout from the owner's Bolt prototype: the answer first, then what to act on, then a what-if sidebar
// beside the four plan cards. The paid action plan lives on its own page (/paywall).
import Link from "next/link";
import { AlertTriangle, Info, type LucideIcon } from "lucide-react";
import type { BorrowerInput, FilingComparison, PlanComparison, Warning } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { Card, buttonClass } from "@/components/brand/kit";
import { RecommendationCard } from "@/components/funnel/RecommendationCard";
import { PlanCard } from "@/components/funnel/PlanCard";
import { FilingPanel } from "@/components/funnel/FilingPanel";
import { Toggles } from "@/components/funnel/Toggles";
import { SampleButtons } from "@/components/funnel/SampleButtons";
import { SAMPLE_NOTE } from "@/components/funnel/samples";
import { PLAN_LABEL, RULES_DATE_LABEL } from "@/components/funnel/labels";

const SEVERITY_ORDER: Record<Warning["severity"], number> = { danger: 0, warn: 1, info: 2 };
const TONE: Record<Warning["severity"], { box: string; icon: string; Icon: LucideIcon }> = {
  danger: { box: "border-red-200 bg-red-50 text-red-900", icon: "text-red-700", Icon: AlertTriangle },
  warn: { box: "border-amber-200 bg-amber-50 text-amber-900", icon: "text-amber-700", Icon: AlertTriangle },
  info: { box: "border-slate-200 bg-white text-slate-900", icon: "text-slate-600", Icon: Info },
};

function EmptyState() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Card className="space-y-4 text-center">
        <h2 className="text-2xl font-medium tracking-tight">We don&apos;t have your answers yet</h2>
        <p className="text-slate-600">Answer six questions to see every plan you qualify for, or look at a sample borrower.</p>
        <div className="flex flex-col items-center gap-3">
          <Link href="/check" className={buttonClass("primary")}>
            Start the check
          </Link>
          <SampleButtons />
        </div>
      </Card>
    </div>
  );
}

function WarningList({ warnings }: { warnings: Warning[] }) {
  return (
    <ul className="space-y-3">
      {warnings.map((w) => {
        const t = TONE[w.severity];
        return (
          <li key={w.id} data-severity={w.severity} className={`flex gap-4 rounded-2xl border p-5 ${t.box}`}>
            <t.Icon aria-hidden className={`mt-0.5 size-5 shrink-0 ${t.icon}`} />
            <div>
              <p className="text-base font-semibold">{w.title}</p>
              <p className="mt-1 text-sm">{w.body}</p>
              {w.ruleRef ? <p className="mt-1 text-xs">Rule: {w.ruleRef}</p> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ResultsView({
  comparison,
  filing,
  notes = [],
  onChange,
  changed = false,
  onReset,
  version = 0,
}: {
  comparison: PlanComparison | null;
  filing?: FilingComparison;
  notes?: string[];
  onChange: (input: BorrowerInput) => void;
  /** The what-ifs differ from the saved answers. */
  changed?: boolean;
  onReset?: () => void;
  /** Bumped on reset so the what-if fields re-read the saved answers. */
  version?: number;
}) {
  if (!comparison) return <EmptyState />;

  const { results, input } = comparison;
  const noPlans = results.every((r) => !r.available);
  const cheapest = results.find((r) => r.plan === comparison.cheapestMonthly);
  const showCallout = !noPlans && comparison.cheapestMonthly !== comparison.recommended;
  const warnings = [...comparison.warnings].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  const actOn = warnings.filter((w) => w.severity !== "info");
  const goodToKnow = warnings.filter((w) => w.severity === "info");
  const isSample = notes.includes(SAMPLE_NOTE);
  const otherNotes = notes.filter((n) => n !== SAMPLE_NOTE);
  const maxPayment = Math.max(0, ...results.filter((r) => r.available).map((r) => r.monthlyPayment));

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      {isSample ? (
        <div data-testid="sample-banner" className="flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base font-medium text-sky-900">{SAMPLE_NOTE}</p>
          <Link href="/check" className={buttonClass("secondary", "shrink-0 text-sm")}>
            Check my own numbers
          </Link>
        </div>
      ) : null}

      <RecommendationCard comparison={comparison} notes={otherNotes} />

      {input.filingStatus === "mfj" && input.spouseAgi === undefined ? (
        <div data-testid="spouse-income-missing" role="status" className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <p>
            <span className="font-semibold">We need your spouse&apos;s income.</span> These joint-filing numbers count it as $0. Add it under “What if?” below.
          </p>
        </div>
      ) : null}

      {showCallout && cheapest ? (
        <div data-testid="cheapest-callout" className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-sky-700" />
          <p className="text-base text-slate-800">
            <span className="font-semibold">Why not the cheapest?</span> {PLAN_LABEL[cheapest.plan]} has the lowest payment at {formatUSD(cheapest.monthlyPayment)} a month,
            but we recommend {PLAN_LABEL[comparison.recommended]} for the reason above. Shrinks your debt fastest: {PLAN_LABEL[comparison.bestFor12mBalance]}.
          </p>
        </div>
      ) : null}

      {actOn.length ? (
        <section aria-labelledby="act-heading" className="space-y-4">
          <h2 id="act-heading" className="text-xl font-medium tracking-tight">
            Things to act on
          </h2>
          <WarningList warnings={actOn} />
        </section>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
        <section aria-labelledby="plans-heading" className="space-y-4 lg:col-start-2 lg:row-start-1">
          <div>
            <h2 id="plans-heading" className="text-xl font-medium tracking-tight">
              All four plans compared
            </h2>
            <p className="mt-1 text-sm text-slate-600">Payments and balances are estimates under the rules as of {RULES_DATE_LABEL}.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((r) => (
              <PlanCard key={r.plan} r={r} recommended={!noPlans && r.plan === comparison.recommended} cheapest={!noPlans && r.plan === comparison.cheapestMonthly} maxPayment={maxPayment} />
            ))}
          </div>
          {filing ? <FilingPanel filing={filing} /> : null}
        </section>
        <div className="lg:sticky lg:top-24 lg:col-start-1 lg:row-start-1">
          <Toggles key={version} input={input} onChange={onChange} changed={changed} onReset={onReset} />
        </div>
      </div>

      {goodToKnow.length ? (
        <section aria-labelledby="good-heading" className="space-y-4">
          <h2 id="good-heading" className="text-xl font-medium tracking-tight">
            Good to know
          </h2>
          <WarningList warnings={goodToKnow} />
        </section>
      ) : null}

      <div className="rounded-2xl bg-slate-100 p-5">
        <Disclaimer variant="results" />
      </div>
    </div>
  );
}
