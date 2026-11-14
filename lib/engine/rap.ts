// RAP payment — 34 CFR 685.209(b)(2), (f)(5), (g)(3).
import { round2 } from "@/lib/format";

/** Whole-AGI band rate; bands are "more than X, not more than Y". null = the flat $120/yr base. */
export function rapRate(agi: number): number | null {
  if (agi <= 10_000) return null;
  if (agi > 100_000) return 0.1;
  return (Math.ceil(agi / 10_000) - 1) / 100;
}

/**
 * Monthly RAP payment: max($10, base/12 − $50 × dependents).
 * When filing jointly and the spouse has eligible loans, multiply by the borrower's balance share and floor at $10 again.
 */
export function rapMonthly(agi: number, dependents: number, ownBal?: number, spouseBal?: number): number {
  const a = Math.max(0, agi);
  const rate = rapRate(a);
  const base = rate === null ? 120 : rate * a;
  let pay = Math.max(10, base / 12 - 50 * dependents);
  if (ownBal !== undefined && spouseBal !== undefined && spouseBal > 0) {
    pay = Math.max(10, (pay * ownBal) / (ownBal + spouseBal));
  }
  return round2(pay);
}
