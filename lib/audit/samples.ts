// Pre-read extractions for the bundled SAMPLE statements (public/samples/*.pdf).
// Used when there is no API key, the live call fails, or it takes longer than 15 s.
import type { StatementExtraction } from "@/lib/types";
import type { SampleId } from "@/lib/audit";

const allSure = (keys: string[]) => Object.fromEntries(keys.map((k) => [k, 1]));

export const SAMPLE_EXTRACTIONS: Record<SampleId, StatementExtraction> = {
  // Reproduces the r/StudentLoans 2026 case: subsidy should be $93.21, statement applied $53.11.
  "mohela-subsidy-error": {
    isSample: true,
    servicer: "MOHELA (SAMPLE)",
    statementDate: "2026-09-23",
    dueDate: "2026-10-21",
    amountDue: 87.79,
    loanStatus: "REPAY",
    principalBalance: 31478.26,
    interestRate: 0.069,
    monthlyInterestAccrued: 181,
    lastPayment: { date: "2026-09-16", amount: 87.79, toInterest: 87.79, toPrincipal: 0, subsidyApplied: 53.11, matchApplied: 50 },
    fieldConfidence: allSure(["servicer", "statementDate", "dueDate", "amountDue", "principalBalance", "lastPayment", "monthlyInterestAccrued"]),
  },
  "edfinancial-ok": {
    isSample: true,
    servicer: "EdFinancial (SAMPLE)",
    statementDate: "2026-10-01",
    dueDate: "2026-10-28",
    amountDue: 229.17,
    principalBalance: 40000,
    interestRate: 0.065,
    monthlyInterestAccrued: 216.67,
    lastPayment: { date: "2026-09-27", amount: 229.17, toInterest: 216.67, toPrincipal: 12.5, subsidyApplied: 0, matchApplied: 37.5 },
    fieldConfidence: allSure(["servicer", "statementDate", "dueDate", "amountDue", "principalBalance", "lastPayment", "monthlyInterestAccrued"]),
  },
  "nelnet-standard-placement": {
    isSample: true,
    servicer: "Nelnet (SAMPLE)",
    statementDate: "2026-10-20",
    dueDate: "2026-11-01",
    amountDue: 454.19,
    planName: "STANDARD",
    principalBalance: 40000,
    interestRate: 0.065,
    fieldConfidence: allSure(["servicer", "statementDate", "dueDate", "amountDue", "principalBalance"]),
  },
};
