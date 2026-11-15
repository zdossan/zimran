// The two made-up sample borrowers (owned by P2). Their numbers always come from the engine.
import type { BorrowerInput } from "@/lib/types";
import { SAMPLE_BORROWERS } from "@/lib/mocks";
import type { QuizAnswers } from "@/components/funnel/quizTypes";

export const SAMPLE_KEYS = ["F2b", "F4"] as const;
export type SampleKey = (typeof SAMPLE_KEYS)[number];

export const isSampleKey = (v: unknown): v is SampleKey => typeof v === "string" && (SAMPLE_KEYS as readonly string[]).includes(v);

export const SAMPLE_NOTE = "Sample borrower — these are not your numbers. Start the check to see yours.";

export const SAMPLES: Record<SampleKey, { title: string; button: string; input: BorrowerInput }> = {
  F2b: { title: "Single parent, 2 kids", button: "Try: single parent, 2 kids", input: SAMPLE_BORROWERS.F2b },
  F4: { title: "Married teacher", button: "Try: married teacher", input: SAMPLE_BORROWERS.F4 },
};

/** The same two borrowers as quiz answers, so the quiz can be walked through pre-filled.
 *  A test pins that these give the same engine result as SAMPLES[key].input. */
export const SAMPLE_ANSWERS: Record<SampleKey, QuizAnswers> = {
  F2b: {
    agi: "55,000", filing: "hoh", spouseHasLoans: false, dependents: 2, state: "OH",
    balance: "40,000", rate: "6.5", firstLoanYear: 2015, hadBalanceJuly2014: "no", newLoanSinceJuly2026: false,
    employer: "private", currentPlan: "SAVE", saveNoticeDate: "2026-09-01",
  },
  F4: {
    agi: "60,000", filing: "mfj", spouseAgi: "90,000", spouseHasLoans: false, dependents: 1, state: "OH",
    balance: "52,000", rate: "6.53", firstLoanYear: 2012, hadBalanceJuly2014: "yes", newLoanSinceJuly2026: false,
    employer: "government", currentPlan: "UNKNOWN",
  },
};
