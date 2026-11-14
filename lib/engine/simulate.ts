// RAP monthly benefits (34 CFR 685.209(h)(4) interest waiver, (o)(2) principal match) and a 12-month balance simulation.
import type { PlanId, RapMonthBenefit } from "@/lib/types";
import { round2 } from "@/lib/format";

/** One on-time RAP month with no older unpaid interest. */
export function rapMonthBenefit(principal: number, rate: number, payment: number): RapMonthBenefit {
  const interest = round2((principal * rate) / 12);
  const waived = round2(interest - Math.min(payment, interest));
  const principalPaid = Math.max(0, round2(payment - interest));
  const match = principalPaid < 50 ? round2(Math.min(50, payment) - principalPaid) : 0;
  return { interest, waived, principalPaid, match, principalDrop: round2(principalPaid + match) };
}

/**
 * Balance change over 12 on-time payments (+ grows, − shrinks). Simple interest, no capitalization.
 * RAP: unpaid interest is waived and the principal match applies. Other plans: the payment covers this
 * month's interest, then older unpaid interest, then principal; any shortfall accrues as unpaid interest.
 */
export function simulate12(kind: PlanId, principal: number, rate: number, payment: number): number {
  let p = principal;
  let accrued = 0;
  for (let m = 0; m < 12; m++) {
    if (kind === "RAP") {
      const b = rapMonthBenefit(p, rate, payment);
      p = Math.max(0, round2(p - b.principalDrop));
      continue;
    }
    const interest = round2((p * rate) / 12);
    if (payment < interest) {
      accrued = round2(accrued + interest - payment);
      continue;
    }
    let extra = round2(payment - interest);
    const toAccrued = Math.min(extra, accrued);
    accrued = round2(accrued - toAccrued);
    extra = round2(extra - toAccrued);
    p = Math.max(0, round2(p - extra));
  }
  return round2(p + accrued - principal);
}
