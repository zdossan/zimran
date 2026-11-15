"use client";
// The paywall page (/paywall). Before paying: what you get and don't, and P4's Paywall order card (prices,
// acknowledgement, Stripe checkout, NY/CA block). After paying: the full-width plan hub — every step with
// how to do it and its letter, calendar reminders, and the monthly check-in. P4's Paywall stays the gate.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, CalendarClock, Check, KeyRound, Minus, RotateCcw } from "lucide-react";
import type { ActionItem, BorrowerInput, PlanComparison } from "@/lib/types";
import { buildActionPlan, computePlans } from "@/lib/engine";
import { loadSessionData } from "@/lib/supabase/session";
import { getEntitlement } from "@/lib/supabase/entitlement";
import { Paywall } from "@/components/paywall/Paywall";
import { Badge, Card, Eyebrow, SampleTag, buttonClass } from "@/components/brand/kit";
import { PlanHub } from "@/components/plan/PlanHub";
import { looksLikeInput } from "@/components/funnel/ResultsScreen";
import { loadFunnelNotes } from "@/components/funnel/notesStore";
import { RestoreAccess } from "@/components/funnel/RestoreAccess";
import { SAMPLE_NOTE } from "@/components/funnel/samples";
import { shortDate } from "@/components/funnel/labels";

// Free vs Owen Plus. Must match what the Paywall gates (action-plan, audit-details, letters, report).
const COMPARE: { what: string; free: boolean }[] = [
  { what: "Compare all 4 repayment plans, with the rule behind each number", free: true },
  { what: "Statement check: the verdict and the first issue", free: true },
  { what: "Every statement issue in full, with the numbers", free: false },
  { what: "Your dated action plan, with step-by-step how-tos", free: false },
  { what: "Calendar reminders before each deadline", free: false },
  { what: "Ready-to-send letters: plan switch, billing dispute, CFPB complaint", free: false },
  { what: "Monthly check-in: money found and PSLF progress", free: false },
  { what: "Dispute tracker: when to follow up, when to escalate, money recovered", free: false },
  { what: "\"My income changed\" check: your new payment, and whether to recertify now", free: false },
  { what: "Pay extra or aim for forgiveness? Side-by-side estimate", free: false },
  { what: "Servicer call scripts and a log of every call", free: false },
  { what: "Your Owen report (PDF)", free: false },
];

const TRUST = [
  { icon: RotateCcw, text: "Cancel anytime in one step" },
  { icon: BadgeCheck, text: "Applying for plans is always free at StudentAid.gov" },
  { icon: KeyRound, text: "We never ask for your FSA ID" },
];

function Mark({ on }: { on: boolean }) {
  return on ? (
    <>
      <Check aria-hidden className="mx-auto size-5 text-brand-700" />
      <span className="sr-only">Included</span>
    </>
  ) : (
    <>
      <Minus aria-hidden className="mx-auto size-5 text-slate-300" />
      <span className="sr-only">Not included</span>
    </>
  );
}

function Comparison() {
  return (
    <Card className="overflow-hidden p-0 sm:p-0">
      <table aria-label="Free vs Owen Plus" className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70">
            <th scope="col" className="px-4 py-3 font-medium text-slate-600 sm:px-6">
              What you get
            </th>
            <th scope="col" className="w-16 px-2 py-3 text-center font-medium text-slate-600 sm:w-24">
              Free
            </th>
            <th scope="col" className="w-20 px-2 py-3 text-center font-semibold text-brand-800 sm:w-28">
              Owen Plus
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {COMPARE.map((r) => (
            <tr key={r.what}>
              <td className="px-4 py-3 text-slate-800 sm:px-6">{r.what}</td>
              <td className="px-2 py-3 text-center">
                <Mark on={r.free} />
              </td>
              <td className="bg-brand-50/50 px-2 py-3 text-center">
                <Mark on />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

type Plan = { comparison: PlanComparison; actions: ActionItem[] };

function buildPlan(input: BorrowerInput | null): Plan | null {
  if (!input) return null;
  try {
    const comparison = computePlans(input);
    return comparison.results.some((r) => r.available) ? { comparison, actions: buildActionPlan(comparison, new Date()) } : null;
  } catch {
    return null;
  }
}

function StartCheck() {
  return (
    <div className="space-y-3">
      <p className="text-base text-slate-700">Your dated plan is built from your answers. It takes about a minute.</p>
      <Link href="/check" className={buttonClass("primary")}>
        Start the free check
      </Link>
    </div>
  );
}

export function PaywallScreen() {
  // undefined = still loading; null = no (usable) answers saved.
  const [input, setInput] = useState<BorrowerInput | null | undefined>(undefined);
  const [isSample, setIsSample] = useState(false);
  const [pro, setPro] = useState(false);

  useEffect(() => {
    loadSessionData<unknown>("borrowerInput")
      .then((v) => {
        setIsSample(loadFunnelNotes().includes(SAMPLE_NOTE));
        const ok = looksLikeInput(v) ? v : null;
        setInput(ok);
        return getEntitlement(ok?.state).then((e) => setPro(e.pro));
      })
      .catch(() => setInput((i) => (i === undefined ? null : i)));
  }, []);

  const plan = useMemo(() => buildPlan(input ?? null), [input]);
  const actions = plan?.actions ?? [];
  const firstDue = actions.find((a) => a.dueDate)?.dueDate;
  const hub = plan ? <PlanHub comparison={plan.comparison} actions={plan.actions} isSample={isSample} /> : <StartCheck />;

  // Paid: the plan hub gets the whole page.
  if (pro && input !== undefined) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="max-w-2xl">
          <Badge tone="primary">Your plan</Badge>
          <h1 className="mt-5 text-3xl font-medium tracking-tight sm:text-4xl">Your dated action plan</h1>
          <p className="mt-4 text-lg text-slate-600">Work through each step, add the dates to your calendar, and check each new statement when it arrives.</p>
        </header>
        <Paywall feature="action-plan" state={input?.state}>
          {hub}
        </Paywall>
        <Link href="/results" className={buttonClass("ghost")}>
          <ArrowLeft aria-hidden className="size-4" />
          Back to my results
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mx-auto max-w-2xl text-center">
        <Eyebrow>Owen Plus</Eyebrow>
        <h1 className="mt-3 text-[30px] font-normal leading-tight tracking-tight sm:text-5xl">Stay on top of every loan deadline</h1>
        <p className="mt-4 text-base font-light text-slate-600 sm:text-lg">
          Turn your results into a dated plan with reminders, ready-to-send letters and a monthly statement check.
        </p>
        {actions.length ? (
          <div data-testid="plan-teaser" className="mx-auto mt-6 max-w-xl space-y-2 rounded-[24px] bg-white p-4 text-left text-[15px] font-medium text-brand-900 ring-1 ring-brand-100">
            {isSample ? (
              <p className="flex flex-wrap items-center gap-2 text-sm font-normal text-sky-900">
                <SampleTag />
                {SAMPLE_NOTE}
              </p>
            ) : null}
            <p className="flex items-start gap-2">
              <CalendarClock aria-hidden className="mt-0.5 size-5 shrink-0" />
              <span>
                Your plan has {actions.length} {actions.length === 1 ? "step" : "steps"}
                {firstDue ? `. The first is due ${shortDate(firstDue)}` : ""}.
              </span>
            </p>
          </div>
        ) : input === null ? (
          <p className="mt-6 text-base text-slate-700">
            No answers yet?{" "}
            <Link href="/check" className="font-semibold text-brand-800 underline underline-offset-4">
              Run the free check first
            </Link>{" "}
            — your plan is built from your answers.
          </p>
        ) : input ? (
          <p className="mx-auto mt-6 max-w-xl rounded-[24px] bg-amber-50 p-4 text-left text-base text-amber-900">
            We couldn&apos;t build a dated plan from your answers, so there&apos;s nothing to unlock yet.{" "}
            <Link href="/check" className="font-semibold underline underline-offset-4">
              Review your answers
            </Link>{" "}
            before you pay for anything.
          </p>
        ) : null}
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-10">
        <div className="space-y-3 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
          {input === undefined ? (
            <p className="text-sm text-slate-600" aria-live="polite">
              Loading…
            </p>
          ) : (
            <Paywall feature="action-plan" state={input?.state}>
              {hub}
            </Paywall>
          )}
          <RestoreAccess />
          <Link href="/results" className={buttonClass("ghost", "w-full")}>
            <ArrowLeft aria-hidden className="size-4" />
            Back to my results
          </Link>
        </div>

        <div className="space-y-5 lg:col-start-1 lg:row-start-1">
          <Comparison />
          <ul aria-label="Good to know" className="grid gap-2 sm:grid-cols-3">
            {TRUST.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2 rounded-2xl bg-white/70 p-3 text-sm text-slate-700 ring-1 ring-slate-900/5">
                <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-600" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
