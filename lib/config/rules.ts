// Rule constants for the engine — owned by P1 (plans/01-engine.md). Sources: docs/research/08a §6, 08 §B TAX-2.
export { RULES_AS_OF } from "@/lib/types";

/** 2026 HHS poverty guideline, 48 states + DC: base for one person + step per extra person (91 FR 1797). */
export const FPL_2026 = { base: 15960, step: 5680 } as const;

/** 2026 standard deduction on a married-filing-separately return. */
export const MFS_STD_DEDUCTION_2026 = 16100;

/**
 * 2026 married-filing-separately bracket thresholds (taxable income) and the rate step at each.
 * 0 is a threshold with a 10% step: income below the deduction is untaxed.
 */
export const MFS_BRACKETS_2026: readonly { threshold: number; step: number }[] = [
  { threshold: 0, step: 0.1 },
  { threshold: 12400, step: 0.02 },
  { threshold: 50400, step: 0.1 },
  { threshold: 105700, step: 0.02 },
  { threshold: 201775, step: 0.08 },
  { threshold: 256225, step: 0.03 },
  { threshold: 384350, step: 0.02 },
];

/** A Direct Loan made on or after this date ends IBR / 10-year Standard access (HEA §455(d)(7)). */
export const NEW_LOAN_CUTOFF = "2026-07-01";
