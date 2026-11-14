// Fixed-payment plans — 10-year Standard (34 CFR 685.208(b)(1)) and Tiered Standard (685.208(c)(1), HEA §455(d)(7)(A)).
import { round2 } from "@/lib/format";

/** Level monthly payment that pays off `principal` over `months` at `annualRate`. */
export function amortize(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return round2(principal / months);
  const i = annualRate / 12;
  return round2((principal * i) / (1 - (1 + i) ** -months));
}

/** 10-year Standard payment, $50 minimum. */
export function standard10(principal: number, rate: number): number {
  return Math.max(50, amortize(principal, rate, 120));
}

/** Tiered Standard term by total principal: <$25k 10 yrs, <$50k 15, <$100k 20, otherwise 25. */
export function tieredTermMonths(totalPrincipal: number): 120 | 180 | 240 | 300 {
  if (totalPrincipal < 25_000) return 120;
  if (totalPrincipal < 50_000) return 180;
  if (totalPrincipal < 100_000) return 240;
  return 300;
}

/** Tiered Standard payment, $50 minimum. */
export function tieredStandard(principal: number, rate: number): number {
  return Math.max(50, amortize(principal, rate, tieredTermMonths(principal)));
}
