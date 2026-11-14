"use client";
// Results page body (owned by P2). Presentational: the engine runs in ResultsScreen.
// Layout per docs/superpowers/specs/2026-11-15-ui-redesign-design.md: lead with the answer.
import Link from "next/link";
import { cn } from "cn";
import type { BorrowerInput, FilingComparison, PlanComparison, Warning } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import { buildActionPlan } from "@/lib/engine";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { ResultsHero } from "@/components/funnel/ResultsHero";
import { PlanRow } from "@/components/funnel/PlanRow";
import { ActionPlanCta } from "@/components/funnel/ActionPlanCta";
import { PaymentChart } from "@/components/funnel/PaymentChart";
import { FilingPanel } from "@/components/funnel/FilingPanel";
import { Toggles } from "@/components/funnel/Toggles";
import { SampleButtons } from "@/components/funnel/SampleButtons";
import { PLAN_LABEL } from "@/components/funnel/labels";

const SEVERITY_ORDER: Record<Warning["severity"], number> = { danger: 0, warn: 1, info: 2 };

function EmptyState() {
  return (
    <section className="space-y-4 rounded-2xl bg-card p-6 text-center shadow-sm ring-1 ring-border">
      <h2 className="text-xl font-extrabold">We don&apos;t have your answers yet</h2>
      <p className="text-muted-foreground">Answer six questions to see every plan you qualify for, or look at a sample borrower.</p>
      <div className="flex flex-col items-center gap-3">
        <Link href="/check" className={cn(buttonVariants({ size: "lg" }))}>
          Start the check
        </Link>
        <SampleButtons />
      </div>
    </section>
  );
}

function WarningList({ warnings }: { warnings: Warning[] }) {
  return (
    <div className="space-y-2">
      {warnings.map((w) => (
        <Alert
          key={w.id}
          data-severity={w.severity}
          className={
            w.severity === "danger"
              ? "rounded-2xl border-[#F5C9A8] bg-[#FFF1E6] p-4 text-[#9A4A00] *:data-[slot=alert-description]:text-[#9A4A00]"
              : "rounded-2xl border-0 p-4 shadow-sm ring-1 ring-border"
          }
        >
          <AlertTitle className="font-extrabold">{w.title}</AlertTitle>
          <AlertDescription>
            {w.body}
            {w.ruleRef ? <span className="block text-xs">Rule: {w.ruleRef}</span> : null}
          </AlertDescription>
        </Alert>
      ))}
    </div>
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
  // Danger and warn-level items qualify the answer, so they sit before the CTA (spec §2); info goes last.
  const watchOut = warnings.filter((w) => w.severity !== "info");
  const goodToKnow = warnings.filter((w) => w.severity === "info");
  const actions = noPlans ? [] : buildActionPlan(comparison, new Date());

  return (
    <div className="space-y-6">
      <ResultsHero comparison={comparison} notes={notes} />

      {input.filingStatus === "mfj" && input.spouseAgi === undefined ? (
        <Alert data-testid="spouse-income-missing" variant="destructive">
          <AlertTitle>We need your spouse&apos;s income</AlertTitle>
          <AlertDescription>These joint-filing numbers count it as $0. Add it under “What if…” below.</AlertDescription>
        </Alert>
      ) : null}

      {showCallout && cheapest ? (
        <div data-testid="cheapest-callout" className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <p className="font-bold">
            Lowest monthly: {PLAN_LABEL[cheapest.plan]} at {formatUSD(cheapest.monthlyPayment)}. Shrinks your debt fastest:{" "}
            {PLAN_LABEL[comparison.bestFor12mBalance]}.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s why we recommend {PLAN_LABEL[comparison.recommended]}: {comparison.reason}
          </p>
        </div>
      ) : !noPlans ? (
        <p className="rounded-2xl bg-card p-4 text-sm font-medium shadow-sm ring-1 ring-border">{comparison.reason}</p>
      ) : null}

      <section aria-labelledby="compare-heading" className="space-y-2">
        <h3 id="compare-heading" className="text-base font-extrabold">
          Compare plans
        </h3>
        {results.map((r) => (
          <PlanRow key={r.plan} r={r} recommended={!noPlans && r.plan === comparison.recommended} />
        ))}
      </section>

      {watchOut.length ? (
        <section aria-labelledby="watch-heading" className="space-y-2">
          <h3 id="watch-heading" className="text-base font-extrabold">
            Watch out for
          </h3>
          <WarningList warnings={watchOut} />
        </section>
      ) : null}

      {actions.length ? <ActionPlanCta state={input.state} actions={actions} /> : null}
      <Link href="/audit" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}>
        Check a statement for errors
      </Link>

      {noPlans ? null : <PaymentChart results={results} recommended={comparison.recommended} />}

      <Toggles key={version} input={input} onChange={onChange} changed={changed} onReset={onReset} />
      {filing ? <FilingPanel filing={filing} /> : null}

      {goodToKnow.length ? (
        <section aria-labelledby="good-heading" className="space-y-2">
          <h3 id="good-heading" className="text-base font-extrabold">
            Good to know
          </h3>
          <WarningList warnings={goodToKnow} />
        </section>
      ) : null}

      <Disclaimer variant="results" />
    </div>
  );
}
