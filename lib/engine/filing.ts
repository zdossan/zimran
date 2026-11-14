// Joint vs separate tax filing: each side's plans, the extra tax from filing separately, and the net saving.
import type { BorrowerInput, FilingComparison, PlanComparison } from "@/lib/types";
import { round2 } from "@/lib/format";
import { computePlans } from "@/lib/engine/compute";
import { mfsBracketPenalty } from "@/lib/engine/mfsTax";

export const MFS_CAVEATS = [
  "Filing separately removes the student loan interest deduction.",
  "Filing separately removes education credits (American Opportunity and Lifetime Learning).",
  "Filing separately removes the child and dependent care credit and caps a dependent-care FSA at $2,500.",
  "Filing separately generally removes the Earned Income Tax Credit (exceptions for separated spouses).",
  "Filing separately removes the premium tax credit for Marketplace health insurance.",
  "Filing separately limits Roth IRA contributions.",
  "Filing separately removes the new tips, overtime and senior deductions.",
  "On a separate return the Child Tax Credit starts phasing out at $200,000 of income.",
  "In community-property states, income is generally split 50/50 on separate returns.",
];

const recommendedPayment = (c: PlanComparison) => c.results.find((r) => r.plan === c.recommended)?.monthlyPayment ?? 0;

export function compareFiling(input: BorrowerInput & { spouseAgi: number }): FilingComparison {
  const mfj = computePlans({ ...input, filingStatus: "mfj", familySize: 2 + input.dependents });
  const mfs = computePlans({ ...input, filingStatus: "mfs", familySize: 1 + input.dependents });
  const mfsExtraTaxPerYear = mfsBracketPenalty(input.agi, input.spouseAgi);
  return {
    mfj,
    mfs,
    mfsExtraTaxPerYear,
    netAnnualSavingMfs: round2((recommendedPayment(mfj) - recommendedPayment(mfs)) * 12 - mfsExtraTaxPerYear),
    caveats: MFS_CAVEATS,
  };
}
