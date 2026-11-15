"use client";
// "My loans" dashboard (/dashboard): no sign-up. Balance, this month's payment and plan for everyone; the next
// deadline, money recovered and forgiveness progress with Owen Plus. Built from the borrower's answers and
// refined by each real statement they check; saved on this device.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, FileSearch, HandCoins, Landmark, Lock, Wallet } from "lucide-react";
import type { BorrowerInput } from "@/lib/types";
import { buildActionPlan, computePlans } from "@/lib/engine";
import { formatUSD } from "@/lib/format";
import { loadSessionData } from "@/lib/supabase/session";
import { getEntitlement } from "@/lib/supabase/entitlement";
import { Badge, Card, Eyebrow, SampleTag, buttonClass } from "@/components/brand/kit";
import { looksLikeInput } from "@/components/funnel/ResultsScreen";
import { loadFunnelNotes } from "@/components/funnel/notesStore";
import { SAMPLE_NOTE } from "@/components/funnel/samples";
import { PLAN_FULL_NAME, RULES_DATE_LABEL, shortDate, wholeUSD } from "@/components/funnel/labels";
import { dashboardSummary } from "@/components/plan/dashboard";
import { loadAuditHistory, loadDisputes, loadDone, loadPayments } from "@/components/plan/progress";

function Tile({ testId, icon: Icon, label, children }: { testId: string; icon: typeof Wallet; label: string; children: ReactNode }) {
  return (
    <Card data-testid={testId} className="flex flex-col gap-2 p-5 sm:p-6">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        <Icon aria-hidden className="size-4 text-brand-600" />
        {label}
      </p>
      {children}
    </Card>
  );
}

function Locked() {
  return (
    <Link href="/paywall" className="mt-auto inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand-800 hover:underline">
      <Lock aria-hidden className="size-4" />
      Unlock with Owen Plus
    </Link>
  );
}

export function DashboardScreen({ now = new Date() }: { now?: Date }) {
  // undefined = loading; null = no answers yet.
  const [input, setInput] = useState<BorrowerInput | null | undefined>(undefined);
  const [isSample, setIsSample] = useState(false);
  const [pro, setPro] = useState(false);

  useEffect(() => {
    loadSessionData<unknown>("borrowerInput")
      .then((v) => {
        const ok = looksLikeInput(v) ? v : null;
        setIsSample(loadFunnelNotes().includes(SAMPLE_NOTE));
        setInput(ok);
        return getEntitlement(ok?.state).then((e) => setPro(e.pro));
      })
      .catch(() => setInput((i) => (i === undefined ? null : i)));
  }, []);

  const data = useMemo(() => {
    if (!input) return null;
    try {
      const comparison = computePlans(input);
      if (!comparison.results.some((r) => r.available)) return null;
      const actions = buildActionPlan(comparison, now);
      const summary = dashboardSummary({
        comparison,
        actions,
        history: loadAuditHistory(),
        disputes: loadDisputes(),
        done: loadDone(),
        payments: loadPayments(),
        now,
      });
      return { comparison, summary };
    } catch {
      return null;
    }
  }, [input, now]);

  if (input === undefined) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600 sm:px-6" aria-live="polite">
        Loading your dashboard…
      </p>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
        <Card className="space-y-4 text-center">
          <Eyebrow>My loans</Eyebrow>
          <h1 className="text-3xl font-normal tracking-tight">Set up your dashboard</h1>
          <p className="text-slate-600">Answer six questions and your balance, monthly payment and deadlines appear here. No account needed.</p>
          <Link href="/check" className={buttonClass("primary")}>
            Run the free check
          </Link>
        </Card>
      </div>
    );
  }

  const { comparison, summary: s } = data;
  const rec = comparison.results.find((r) => r.plan === comparison.recommended)!;
  const change = s.balance.change;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>My loans</Eyebrow>
          <h1 className="mt-2 text-3xl font-normal tracking-tight sm:text-4xl">Your loan dashboard</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
            Updated from your answers and the statements you check. Saved on this device; no account needed.
          </p>
        </div>
        {isSample ? <SampleTag /> : null}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile testId="tile-balance" icon={Landmark} label="Total balance">
          <p className="text-3xl font-medium tracking-tight">{formatUSD(s.balance.amount)}</p>
          <p className="text-sm text-slate-600">
            {s.balance.source === "statement" && s.balance.asOf ? `From your ${shortDate(s.balance.asOf)} statement` : "From your answers"}
          </p>
          {change !== undefined && change !== 0 ? (
            <Badge tone={change < 0 ? "success" : "warning"} className="w-fit text-xs">
              {change < 0 ? `↓ ${wholeUSD(-change)}` : `↑ ${wholeUSD(change)}`} since you started
            </Badge>
          ) : null}
        </Tile>

        <Tile testId="tile-payment" icon={Wallet} label="This month's payment">
          <p className="text-3xl font-medium tracking-tight">{formatUSD(s.payment.amount)}</p>
          <p className="text-sm text-slate-600">
            {s.payment.source === "statement" && s.payment.dueDate ? `Due ${shortDate(s.payment.dueDate)}, from your statement` : `Estimate on the ${PLAN_FULL_NAME[s.payment.plan]}`}
          </p>
        </Tile>

        <Tile testId="tile-deadline" icon={CalendarClock} label="Next deadline">
          {pro ? (
            s.nextDeadline?.dueDate ? (
              <>
                <p className="text-2xl font-medium tracking-tight">{shortDate(s.nextDeadline.dueDate)}</p>
                <p className="text-sm text-slate-700">{s.nextDeadline.title}</p>
              </>
            ) : (
              <p className="text-sm text-slate-700">All dated steps are done.</p>
            )
          ) : (
            <>
              <p className="text-sm text-slate-600">Your next step and its date, from your dated plan.</p>
              <Locked />
            </>
          )}
        </Tile>

        <Tile testId="tile-recovered" icon={HandCoins} label="Money recovered">
          {pro ? (
            <>
              <p className="text-3xl font-medium tracking-tight text-emerald-800">{formatUSD(s.recovered)}</p>
              <p className="text-sm text-slate-600">
                {s.openDisputes ? `${s.openDisputes} open dispute${s.openDisputes === 1 ? "" : "s"}` : "No open disputes"}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">Billing errors you got fixed, and disputes still open.</p>
              <Locked />
            </>
          )}
        </Tile>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3 p-5 sm:p-6 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Your plan</p>
          <p className="text-xl font-medium">{PLAN_FULL_NAME[rec.plan]}</p>
          <p className="text-sm text-slate-700">{comparison.reason}</p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link href="/results" className={buttonClass("secondary", "text-sm")}>
              See all plans
            </Link>
            {pro ? (
              <Link href="/paywall" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand-800 hover:underline">
                Open my plan and tools
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            ) : null}
          </div>
        </Card>

        <Card className="space-y-3 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <FileSearch aria-hidden className="size-4 text-brand-600" />
            Statements
          </p>
          <p className="text-sm text-slate-700">
            {s.lastChecked ? `Last checked ${shortDate(s.lastChecked)}.` : "No statement checked yet."} Upload each new statement to keep your
            numbers current and catch billing errors.
          </p>
          <Link href="/audit" className={buttonClass("primary", "w-full text-sm")}>
            Check this month&apos;s statement
          </Link>
        </Card>
      </div>

      <Card className="space-y-3 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{comparison.pslfTrack ? "PSLF progress" : "Progress toward forgiveness"}</p>
        {pro ? (
          s.progress ? (
            <>
              <p className="text-lg font-medium">
                {s.progress.made} of {s.progress.target} qualifying payments {s.progress.label}
              </p>
              <div aria-hidden className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-brand-700" style={{ width: `${Math.round((s.progress.made / s.progress.target) * 100)}%` }} />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-700">
              Add your qualifying payment count in{" "}
              <Link href="/paywall" className="font-medium text-brand-800 underline underline-offset-4">
                your plan
              </Link>{" "}
              to see how far you&apos;ve come.
            </p>
          )
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600">Track your qualifying payments and see roughly when forgiveness could come, under current rules.</p>
            <Locked />
          </div>
        )}
      </Card>

      <p className="text-xs text-slate-500">Estimates · Rules as of {RULES_DATE_LABEL}. We never ask for your FSA ID or connect to your loan account.</p>
    </div>
  );
}
