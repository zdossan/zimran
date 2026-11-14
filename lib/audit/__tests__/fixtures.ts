import type { LlmStatement } from "@/lib/audit/schema";

/** A clean Claude extraction of the MOHELA sample, as the structured output would return it. */
export const LLM_OK: LlmStatement = {
  isStudentLoanStatement: true,
  servicer: "MOHELA (SAMPLE)",
  statementDate: "2026-09-23",
  dueDate: "2026-10-21",
  amountDue: 87.79,
  planName: "RAP",
  loanStatus: "REPAY",
  principalBalance: 31478.26,
  interestRate: 0.069,
  lastPayment: { date: "2026-09-16", amount: 87.79, toInterest: 87.79, toPrincipal: 0, subsidyApplied: 53.11, matchApplied: 50 },
  monthlyInterestAccrued: 181,
  confidence: { servicer: 1, statementDate: 1, dueDate: 1, amountDue: 1, principalBalance: 1, lastPayment: 1, monthlyInterestAccrued: 1 },
};
