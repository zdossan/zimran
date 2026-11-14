// Which plans a borrower can use — HEA §455(d)(7): a loan made on or after 2026-07-01 limits all loans to RAP or Tiered.
import type { BorrowerInput, Loan, PlanId } from "@/lib/types";
import { NEW_LOAN_CUTOFF } from "@/lib/config/rules";

export const NEW_LOAN_REASON = "A loan made on or after July 1, 2026 limits you to RAP or Tiered Standard";
export const TIERED_REASON = "Only for borrowers with a loan made on or after July 1, 2026";
export const NO_LOANS_REASON = "None of your loans are covered by this comparison";

export const PSLF_QUALIFYING: Record<PlanId, boolean> = { RAP: true, IBR: true, STANDARD_10: true, TIERED: false };

export interface Pool {
  eligible: Loan[];
  hasParentPlus: boolean;
  principal: number;
  rate: number; // balance-weighted average; 0 when there is no eligible balance
}

/** Pool every eligible loan; Parent PLUS loans are left out. */
export function poolLoans(loans: Loan[]): Pool {
  const eligible = loans.filter((l) => l.type !== "parentplus");
  const principal = eligible.reduce((s, l) => s + l.balance, 0);
  const rate = principal > 0 ? eligible.reduce((s, l) => s + l.balance * l.rate, 0) / principal : 0;
  return { eligible, hasParentPlus: eligible.length < loans.length, principal, rate };
}

export const hasNewLoan = (input: BorrowerInput) => input.loans.some((l) => l.disbursedOn >= NEW_LOAN_CUTOFF);

/** null = available; otherwise the reason it isn't. */
export function unavailableReason(plan: PlanId, newLoan: boolean, noEligibleLoans = false): string | null {
  if (noEligibleLoans) return NO_LOANS_REASON;
  if (plan === "TIERED") return newLoan ? null : TIERED_REASON;
  if (plan === "IBR" || plan === "STANDARD_10") return newLoan ? NEW_LOAN_REASON : null;
  return null;
}
