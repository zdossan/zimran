// The "My loans" dashboard in numbers: balance, this month's payment, next deadline, money recovered and
// progress toward forgiveness — from the borrower's answers, refined by the statements they check.
import type { ActionItem, PlanComparison, PlanId } from "@/lib/types";
import { round2 } from "@/lib/format";
import type { AuditEntry } from "@/components/plan/progress";
import { totalRecovered, type Dispute } from "@/components/plan/disputes";

export type DashboardSummary = {
  balance: { amount: number; source: "statement" | "answers"; asOf?: string; change?: number };
  payment: { amount: number; source: "statement" | "estimate"; plan: PlanId; dueDate?: string };
  nextDeadline?: ActionItem;
  recovered: number;
  openDisputes: number;
  progress?: { made: number; target: number; label: string };
  lastChecked?: string;
};

export function dashboardSummary(d: {
  comparison: PlanComparison;
  actions: ActionItem[];
  history: AuditEntry[]; // newest first, real statements only
  disputes: Dispute[];
  done: string[];
  payments: number | null;
  now: Date;
}): DashboardSummary {
  const c = d.comparison;
  const rec = c.results.find((r) => r.plan === c.recommended && r.available) ?? c.results[0];
  const fromAnswers = round2(c.input.loans.reduce((s, l) => s + l.balance, 0));
  const statements = d.history.filter((h) => h.balance !== undefined);
  const latest = statements[0];
  const earliest = statements[statements.length - 1];

  const balance: DashboardSummary["balance"] = latest
    ? {
        amount: latest.balance!,
        source: "statement",
        asOf: latest.statementDate,
        change: round2(latest.balance! - (statements.length >= 2 ? earliest.balance! : fromAnswers)),
      }
    : { amount: fromAnswers, source: "answers" };

  const due = d.history.find((h) => h.amountDue !== undefined);
  const payment: DashboardSummary["payment"] = due
    ? { amount: due.amountDue!, source: "statement", plan: c.recommended, dueDate: due.dueDate }
    : { amount: rec.monthlyPayment, source: "estimate", plan: c.recommended };

  const pslf = c.pslfTrack && rec.pslfQualifying;
  const target = pslf ? 120 : (rec.forgivenessYears ?? 0) * 12;

  return {
    balance,
    payment,
    nextDeadline: d.actions.find((a) => a.dueDate && !d.done.includes(a.id)),
    recovered: totalRecovered(d.disputes),
    openDisputes: d.disputes.filter((x) => x.status !== "fixed").length,
    progress: d.payments !== null && target ? { made: Math.min(d.payments, target), target, label: pslf ? "toward PSLF" : "toward forgiveness" } : undefined,
    lastChecked: d.history[0]?.checkedOn,
  };
}
