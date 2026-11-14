// IBR payment — 34 CFR 685.209(b)(4), (f)(2)–(3), (g)(1); poverty line per 685.209(b)(14).
import { round2 } from "@/lib/format";
import { FPL_2026 } from "@/lib/config/rules";

/** 2026 HHS poverty guideline for a family size (48 states + DC). */
export function fpl(size: number): number {
  return FPL_2026.base + FPL_2026.step * (Math.max(1, size) - 1);
}

/**
 * Monthly IBR payment: rate × max(0, AGI − 1.5 × poverty line) ÷ 12, where the rate is 15% if the borrower
 * had a balance on 2014-07-01, else 10%. Capped (cap = 10-year Standard), prorated by spouse balance,
 * then floored: under $5 → $0, $5 up to $10 → $10.
 */
export function ibrMonthly(
  agi: number,
  familySize: number,
  hadBalanceOnJuly2014: boolean,
  cap: number | null,
  ownBal?: number,
  spouseBal?: number,
  fplFn: (n: number) => number = fpl,
): number {
  const discretionary = Math.max(0, agi - 1.5 * fplFn(familySize));
  let pay = ((hadBalanceOnJuly2014 ? 0.15 : 0.1) * discretionary) / 12;
  if (cap !== null) pay = Math.min(pay, cap);
  if (ownBal !== undefined && spouseBal !== undefined && spouseBal > 0) {
    pay = (pay * ownBal) / (ownBal + spouseBal);
  }
  if (pay < 5) return 0;
  if (pay < 10) return 10;
  return round2(pay);
}
