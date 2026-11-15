// "My income changed": re-run the engine with the new income and say whether to recertify now.
import type { PlanComparison, PlanId } from "@/lib/types";
import { computePlans } from "@/lib/engine";

export type IncomeCheck = {
  plan: PlanId;
  oldPayment: number;
  newPayment: number;
  newRecommended: PlanId;
  newRecommendedPayment: number;
  advice: "recertify_now" | "wait" | "same";
};

export function incomeCheck(c: PlanComparison, newAgi: number): IncomeCheck {
  const rec = c.results.find((r) => r.plan === c.recommended)!;
  const next = computePlans({ ...c.input, agi: newAgi });
  const samePlan = next.results.find((r) => r.plan === c.recommended);
  const newRec = next.results.find((r) => r.plan === next.recommended)!;
  const newPayment = samePlan?.available ? samePlan.monthlyPayment : rec.monthlyPayment;
  const diff = newPayment - rec.monthlyPayment;
  return {
    plan: c.recommended,
    oldPayment: rec.monthlyPayment,
    newPayment,
    newRecommended: next.recommended,
    newRecommendedPayment: newRec.monthlyPayment,
    advice: diff < -1 ? "recertify_now" : diff > 1 ? "wait" : "same",
  };
}
