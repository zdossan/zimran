// Quiz answers → BorrowerInput, and per-step validation (owned by P2, plans/02-funnel.md Task 1).
import type { BorrowerInput, Loan } from "@/lib/types";
import { US_STATES, type QuizAnswers, type QuizStep } from "@/components/funnel/quizTypes";

const NUMBER = /^-?\d+(\.\d+)?$/;

/** "$55,000" / "55,000" / "55000.50" → number; blank or not a number → null. */
export function parseMoney(s: string | undefined): number | null {
  const t = (s ?? "").replace(/[$,\s]/g, "");
  return NUMBER.test(t) ? Number(t) : null;
}

/** "6.5" / "6.5%" → 6.5; blank or not a number → null. */
export function parsePercent(s: string | undefined): number | null {
  const t = (s ?? "").replace(/[%\s]/g, "");
  return NUMBER.test(t) ? Number(t) : null;
}

export const CURRENT_YEAR = 2026;

/** Only someone whose first loan came before 2015 could have owed on July 1, 2014. */
export const askJuly2014 = (firstLoanYear?: number) => !firstLoanYear || firstLoanYear < 2015;
const STATE_CODES = new Set(US_STATES.map((s) => s.code));
const isMarried = (f?: QuizAnswers["filing"]) => f === "mfj" || f === "mfs";
const nonNegative = (s?: string) => {
  const n = parseMoney(s);
  return n !== null && n >= 0;
};

/** An error message for the first problem on this step, or null when the step is complete. */
export function validateStep(step: QuizStep, a: Partial<QuizAnswers>): string | null {
  switch (step) {
    case 1:
      return nonNegative(a.agi) ? null : "Enter your income (AGI) from your last tax return, for example 55,000. Use 0 if you had none.";
    case 2:
      if (!a.filing) return "Choose how you file your taxes.";
      if (a.filing === "mfj" && !nonNegative(a.spouseAgi)) return "Enter your spouse's income (AGI). Joint filers' payments use both incomes.";
      if (isMarried(a.filing) && a.spouseAgi && !nonNegative(a.spouseAgi)) return "Enter your spouse's income as a number, for example 90,000.";
      if (isMarried(a.filing) && a.spouseHasLoans && !((parseMoney(a.spouseBalance) ?? 0) > 0)) return "Enter your spouse's federal loan balance.";
      return null;
    case 3:
      if (a.dependents === undefined || !Number.isInteger(a.dependents) || a.dependents < 0 || a.dependents > 20) {
        return "Enter how many dependents you claim (0 or more).";
      }
      return a.state && STATE_CODES.has(a.state) ? null : "Choose your state.";
    case 4: {
      if (!((parseMoney(a.balance) ?? 0) > 0)) return "Enter your total federal student loan balance.";
      const rate = parsePercent(a.rate);
      if (rate === null || rate < 0 || rate > 20) return "Enter your interest rate as a percent, for example 6.5.";
      if (rate < 1) return "Enter your interest rate as a percent, for example 6.5 (not 0.065).";
      if (!a.firstLoanYear || a.firstLoanYear < 1970 || a.firstLoanYear > CURRENT_YEAR) return "Choose the year you took your first federal loan.";
      if (askJuly2014(a.firstLoanYear) && !a.hadBalanceJuly2014) return "Answer the July 2014 question. Choose “Not sure” if you don't know.";
      return null;
    }
    case 5:
      return a.employer ? null : "Choose who you work for.";
    case 6:
      return a.currentPlan ? null : "Choose your current plan, or “Not sure”.";
  }
}

export const NOT_SURE_2014_NOTE =
  "You weren't sure whether you had loans before July 2014, so we assumed you did (IBR at 15%, the more cautious estimate). If your first loan was later, your IBR payment may be lower.";

export function toBorrowerInput(a: QuizAnswers): { input: BorrowerInput; notes: string[] } {
  const notes: string[] = [];
  const married = isMarried(a.filing);
  const loans: Loan[] = [
    // Jan 1 of the first-loan year: only the new-loan checkbox should trigger the July-2026 rule.
    { id: "pooled", type: "unsub", balance: parseMoney(a.balance) ?? 0, rate: (parsePercent(a.rate) ?? 0) / 100, disbursedOn: `${a.firstLoanYear}-01-01` },
  ];
  if (a.newLoanSinceJuly2026) {
    loans.push({ id: "new-2026", type: "unsub", balance: 0.01, rate: (parsePercent(a.rate) ?? 0) / 100, disbursedOn: "2026-08-15" });
  }
  const asked = askJuly2014(a.firstLoanYear);
  if (asked && a.hadBalanceJuly2014 === "not_sure") notes.push(NOT_SURE_2014_NOTE);

  const spouseAgi = married ? parseMoney(a.spouseAgi) : null;
  const spouseBalance = married && a.spouseHasLoans ? parseMoney(a.spouseBalance) : null;
  const input: BorrowerInput = {
    agi: parseMoney(a.agi) ?? 0,
    filingStatus: a.filing,
    dependents: a.dependents,
    familySize: 1 + (a.filing === "mfj" ? 1 : 0) + a.dependents,
    state: a.state,
    loans,
    hadBalanceOnJuly2014: asked && a.hadBalanceJuly2014 !== "no",
    employer: a.employer,
    currentPlan: a.currentPlan,
  };
  if (spouseAgi !== null) input.spouseAgi = spouseAgi;
  if (spouseBalance !== null) input.spouseEligibleBalance = spouseBalance;
  if (a.currentPlan === "SAVE" && a.saveNoticeDate) input.saveNoticeDate = a.saveNoticeDate;
  return { input, notes };
}
