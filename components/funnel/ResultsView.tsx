"use client";
// Results page body (owned by P2, plans/02-funnel.md Task 3). Presentational: the engine runs in ResultsScreen.
import Link from "next/link";
import { cn } from "cn";
import type { BorrowerInput, FilingComparison, PlanComparison, Warning } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import { buildActionPlan } from "@/lib/engine";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Paywall } from "@/components/paywall/Paywall";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { PlanCard } from "@/components/funnel/PlanCard";
import { PaymentChart } from "@/components/funnel/PaymentChart";
import { FilingPanel } from "@/components/funnel/FilingPanel";
import { Toggles } from "@/components/funnel/Toggles";
import { SampleButtons } from "@/components/funnel/SampleButtons";
import { PLAN_LABEL, RULES_DATE_LABEL, shortDate } from "@/components/funnel/labels";

const SEVERITY_ORDER: Record<Warning["severity"], number> = { danger: 0, warn: 1, info: 2 };

function EmptyState() {
  return (
    <section className="space-y-4 rounded-xl border p-6 text-center">
      <h2 className="text-xl font-semibold">We don&apos;t have your answers yet</h2>
      <p className="text-muted-foreground">Answer six questions to see every plan you qualify for, or look at a sample borrower.</p>
      <div className="flex flex-col items-center gap-3">
        <Link href="/check" className={cn(buttonVariants())}>
          Start the check
        </Link>
        <SampleButtons />
      </div>
    </section>
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
  const rec = results.find((r) => r.plan === comparison.recommended);
  const cheapest = results.find((r) => r.plan === comparison.cheapestMonthly);
  const showCallout = !noPlans && comparison.cheapestMonthly !== comparison.recommended;
  const warnings = [...comparison.warnings].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  const actions = noPlans ? [] : buildActionPlan(comparison, new Date());

  return (
    <div className="space-y-6">
      {notes.map((n) => (
        <p key={n} className="rounded-lg border border-primary/30 bg-muted/50 p-3 text-sm font-medium">
          {n}
        </p>
      ))}

      <section className="space-y-2">
        {noPlans ? (
          <h2 className="text-xl font-semibold">We can&apos;t compare plans for these loans</h2>
        ) : (
          <>
            <h2 className="text-xl font-semibold">Recommended: {PLAN_LABEL[comparison.recommended]}</h2>
            {rec ? <p className="text-muted-foreground">{formatUSD(rec.monthlyPayment)} per month</p> : null}
            {showCallout ? null : <p>{comparison.reason}</p>}
          </>
        )}
        <p className="text-xs text-muted-foreground">Rules as of {RULES_DATE_LABEL}</p>
      </section>

      {input.filingStatus === "mfj" && input.spouseAgi === undefined ? (
        <Alert data-testid="spouse-income-missing" variant="destructive">
          <AlertTitle>We need your spouse&apos;s income</AlertTitle>
          <AlertDescription>These joint-filing numbers count it as $0. Add it under “What if…” below.</AlertDescription>
        </Alert>
      ) : null}

      {showCallout && cheapest ? (
        <Alert data-testid="cheapest-callout">
          <AlertTitle>
            Lowest monthly: {PLAN_LABEL[cheapest.plan]} at {formatUSD(cheapest.monthlyPayment)}. Shrinks your debt fastest:{" "}
            {PLAN_LABEL[comparison.bestFor12mBalance]}.
          </AlertTitle>
          <AlertDescription>
            Here&apos;s why we recommend {PLAN_LABEL[comparison.recommended]}: {comparison.reason}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {results.map((r) => (
          <PlanCard key={r.plan} r={r} recommended={!noPlans && r.plan === comparison.recommended} />
        ))}
      </div>

      {noPlans ? null : <PaymentChart results={results} recommended={comparison.recommended} />}

      <Toggles key={version} input={input} onChange={onChange} changed={changed} onReset={onReset} />
      {filing ? <FilingPanel filing={filing} /> : null}

      {warnings.length ? (
        <section aria-labelledby="warnings-heading" className="space-y-2">
          <h3 id="warnings-heading" className="font-semibold">
            Watch out for
          </h3>
          {warnings.map((w) => (
            <Alert key={w.id} variant={w.severity === "danger" ? "destructive" : "default"}>
              <AlertTitle>{w.title}</AlertTitle>
              <AlertDescription>
                {w.body}
                {w.ruleRef ? <span className="block text-xs">Rule: {w.ruleRef}</span> : null}
              </AlertDescription>
            </Alert>
          ))}
        </section>
      ) : null}

      <section aria-labelledby="next-heading" className="space-y-3">
        <h3 id="next-heading" className="font-semibold">
          Next steps
        </h3>
        <Link href="/audit" className={cn(buttonVariants({ variant: "outline" }))}>
          Check a statement for errors
        </Link>
        {actions.length ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Get your dated action plan</p>
            <Paywall feature="action-plan" state={input.state}>
              <ol className="space-y-2">
                {actions.map((a) => (
                  <li key={a.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">
                      {a.dueDate ? `${shortDate(a.dueDate)} — ` : ""}
                      {a.title}
                    </p>
                    <p className="text-muted-foreground">{a.detail}</p>
                  </li>
                ))}
              </ol>
            </Paywall>
          </div>
        ) : null}
      </section>

      <Disclaimer variant="results" />
    </div>
  );
}
