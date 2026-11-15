// "Pay extra or aim for forgiveness?": a rough side-by-side, assuming the payment stays the same.
// Staying on an income-driven plan ends either when the loan is paid off or, under current rules, when the
// remaining balance is forgiven after the plan's term (10 years / 120 payments on the PSLF track).
import type { PlanComparison } from "@/lib/types";
import { round2 } from "@/lib/format";

export type Payoff = { months: number | null; totalPaid: number; totalInterest: number };

/** Months to pay off `balance` at `annualRate` paying `monthly`; null if it never gets paid off (≤ 50 years). */
export function payoff(balance: number, annualRate: number, monthly: number, maxMonths = 600): Payoff {
  const r = annualRate / 12;
  if (balance <= 0) return { months: 0, totalPaid: 0, totalInterest: 0 };
  if (monthly <= balance * r) return { months: null, totalPaid: 0, totalInterest: 0 };
  let b = balance;
  let paid = 0;
  for (let m = 1; m <= maxMonths; m++) {
    const interest = b * r;
    const pay = Math.min(monthly, b + interest);
    paid += pay;
    b = b + interest - pay;
    // Under $1 left (payment rounding): the final payment absorbs it, as servicers do.
    if (b < 1) {
      paid += Math.max(0, b);
      return { months: m, totalPaid: round2(paid), totalInterest: round2(paid - balance) };
    }
  }
  return { months: null, totalPaid: 0, totalInterest: 0 };
}

export type ExtraComparison = {
  balance: number;
  rate: number;
  forgivenessYears?: number;
  stay: { payment: number; months: number | null; totalPaid: number; forgiven: boolean };
  extra: { payment: number } & Payoff;
  pslfNote?: string;
};

export function compareExtra(c: PlanComparison, extra: number): ExtraComparison {
  const rec = c.results.find((r) => r.plan === c.recommended && r.available) ?? c.results[0];
  const balance = c.input.loans.reduce((s, l) => s + l.balance, 0);
  const rate = balance > 0 ? c.input.loans.reduce((s, l) => s + l.balance * l.rate, 0) / balance : 0;
  const pslf = c.pslfTrack && rec.pslfQualifying;
  const forgivenessYears = pslf ? 10 : rec.forgivenessYears;
  const stayPayoff = payoff(balance, rate, rec.monthlyPayment);
  const termMonths = forgivenessYears ? forgivenessYears * 12 : undefined;
  const forgiven = !!termMonths && (stayPayoff.months === null || stayPayoff.months > termMonths);
  const stay = {
    payment: rec.monthlyPayment,
    months: forgiven ? termMonths! : stayPayoff.months,
    totalPaid: forgiven ? round2(rec.monthlyPayment * termMonths!) : stayPayoff.totalPaid,
    forgiven,
  };
  const extraPayment = round2(rec.monthlyPayment + Math.max(0, extra));
  return {
    balance,
    rate,
    forgivenessYears,
    stay,
    extra: { payment: extraPayment, ...payoff(balance, rate, extraPayment) },
    pslfNote: pslf
      ? "On the PSLF track, paying extra usually doesn't help: under current rules, what's left after 120 qualifying payments is forgiven tax-free."
      : undefined,
  };
}

/** "8 years 4 months" / "11 months". */
export function duration(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const ys = y ? `${y} year${y === 1 ? "" : "s"}` : "";
  const ms = m ? `${m} month${m === 1 ? "" : "s"}` : "";
  return [ys, ms].filter(Boolean).join(" ") || "0 months";
}

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** One plain line: which way costs less in payments, and the catch. `pslf` = forgiveness is tax-free. */
export function verdict(c: ExtraComparison, pslf: boolean): string {
  if (c.extra.months === null) return "This extra amount doesn't cover the interest, so the balance won't go down. Try a larger amount.";
  if (c.stay.forgiven) {
    const diff = c.stay.totalPaid - c.extra.totalPaid;
    return diff > 0
      ? `Paying extra saves about ${usd(diff)} in payments, and you're debt-free in ${duration(c.extra.months)} instead of waiting ${c.forgivenessYears} years for forgiveness.`
      : `Aiming for forgiveness costs about ${usd(-diff)} less in payments${pslf ? "" : ", but the forgiven balance is federally taxable"}. Paying extra gets you debt-free sooner.`;
  }
  const saved = c.stay.totalPaid - c.extra.totalPaid;
  const sooner = c.stay.months !== null ? c.stay.months - c.extra.months : 0;
  return `Paying extra saves about ${usd(Math.max(0, saved))} in interest${sooner > 0 ? `, and you're debt-free ${duration(sooner)} sooner` : ""}.`;
}
