// Extra federal income tax from filing separately — research/08 §B TAX-2 bracket method.
// Joint brackets are exactly double the separate ones, so the only extra tax comes from income on
// either side of a separate-return threshold: for each threshold b between the two taxable incomes,
// the rate step × min(H − b, b − L).
import { round2 } from "@/lib/format";
import { MFS_BRACKETS_2026, MFS_STD_DEDUCTION_2026 } from "@/lib/config/rules";

export function mfsBracketPenalty(agiA: number, agiB: number): number {
  const a = agiA - MFS_STD_DEDUCTION_2026;
  const b = agiB - MFS_STD_DEDUCTION_2026;
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  let penalty = 0;
  for (const { threshold, step } of MFS_BRACKETS_2026) {
    if (lo < threshold && threshold < hi) penalty += step * Math.min(hi - threshold, threshold - lo);
  }
  return round2(penalty);
}
