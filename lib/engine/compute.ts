// computePlans — every plan's payment, eligibility, 12-month balance change, recommendation and warnings.
import type { BorrowerInput, PlanComparison, PlanId, PlanResult, Warning } from "@/lib/types";
import { RULES_AS_OF } from "@/lib/config/rules";
import { rapMonthly } from "@/lib/engine/rap";
import { ibrMonthly } from "@/lib/engine/ibr";
import { standard10, tieredStandard } from "@/lib/engine/amortize";
import { rapMonthBenefit, simulate12 } from "@/lib/engine/simulate";
import { hasNewLoan, poolLoans, PSLF_QUALIFYING, unavailableReason } from "@/lib/engine/eligibility";
import { recommend } from "@/lib/engine/recommend";
import { addDays, isIsoDate, shortDate } from "@/lib/engine/dates";

const RULE_REFS: Record<PlanId, string[]> = {
  RAP: ["34 CFR 685.209(b)(2)", "34 CFR 685.209(f)(5)", "34 CFR 685.209(h)(4)", "34 CFR 685.209(o)(2)"],
  IBR: ["34 CFR 685.209(b)(4)", "34 CFR 685.209(f)(3)", "34 CFR 685.209(b)(13)(ii)"],
  STANDARD_10: ["34 CFR 685.208(b)(1)"],
  TIERED: ["34 CFR 685.208(c)(1)", "HEA §455(d)(7)(A)"],
};

const IBR_CONSERVATIVE = "IBR's interest waiver for subsidized loans is ignored, so the balance change is conservative.";

interface WarningFlags {
  noEligibleLoans: boolean;
  ibrAvailable: boolean;
  tieredAvailable: boolean;
  hasParentPlus: boolean;
  pslfTrack: boolean;
}

function warningsFor(input: BorrowerInput, f: WarningFlags): Warning[] {
  const w: Warning[] = [];
  if (f.noEligibleLoans) {
    w.push({
      id: "no-eligible-loans", severity: "danger", title: "We can't compare plans for these loans",
      body: "None of your loans are covered by this comparison. Parent PLUS loans have different repayment options — ask your servicer which plans you can use.",
    });
  }
  if (input.currentPlan === "SAVE") {
    const deadline = isIsoDate(input.saveNoticeDate) ? addDays(input.saveNoticeDate, 90) : undefined;
    w.push({
      id: "save-deadline", severity: "danger",
      title: deadline ? `Your SAVE deadline: ${shortDate(deadline)}` : "Choose a new plan before your SAVE deadline",
      body: "Choose a plan within 90 days of your servicer's notice, or you may be placed on the Standard plan.",
    });
  }
  if (f.ibrAvailable) {
    w.push({
      id: "new-loan-kills-ibr", severity: "danger", title: "A new loan would remove IBR",
      body: "Any new federal loan or consolidation made on or after July 1, 2026 limits all your loans to RAP or Tiered Standard.",
      ruleRef: "HEA §455(d)(7)",
    });
  }
  if (f.pslfTrack && f.tieredAvailable) {
    w.push({
      id: "tiered-not-pslf", severity: "danger", title: "Tiered Standard doesn't count toward PSLF",
      body: "Payments on the Tiered Standard plan don't count toward Public Service Loan Forgiveness. RAP does.",
      ruleRef: "34 CFR 685.219",
    });
  }
  if (f.hasParentPlus) {
    w.push({
      id: "parent-plus-unsupported", severity: "warn", title: "Parent PLUS loans aren't included",
      body: "Parent PLUS loans have different repayment options, so we left them out of these numbers.",
    });
  }
  if (["AK", "HI"].includes(input.state.trim().toUpperCase())) {
    w.push({
      id: "ak-hi-approx", severity: "info", title: "Alaska and Hawaii use higher poverty lines",
      body: "We used the 48-state poverty line, so your IBR payment here may be a little high. Your servicer will use your state's table.",
    });
  }
  w.push({
    id: "idr-forgiveness-taxable", severity: "info", title: "Forgiveness may be taxed",
    body: "RAP and IBR forgiveness is federally taxable from 2026. PSLF forgiveness is tax-free.", ruleRef: "IRC §108(f)",
  });
  return w;
}

/** A finite number at least `min`; anything else (NaN, blank, negative) becomes `min`. */
const atLeast = (n: number | undefined, min: number) => (typeof n === "number" && Number.isFinite(n) ? Math.max(min, n) : min);

/** Defend against what a form can send: blank/NaN money → 0, negative counts → 0, family size ≥ 1. */
function sanitize(input: BorrowerInput): BorrowerInput {
  return {
    ...input,
    agi: atLeast(input.agi, 0),
    spouseAgi: input.spouseAgi === undefined ? undefined : atLeast(input.spouseAgi, 0),
    spouseEligibleBalance: input.spouseEligibleBalance === undefined ? undefined : atLeast(input.spouseEligibleBalance, 0),
    dependents: Math.floor(atLeast(input.dependents, 0)),
    familySize: Math.floor(atLeast(input.familySize, 1)),
    loans: input.loans.map((l) => ({ ...l, balance: atLeast(l.balance, 0), rate: atLeast(l.rate, 0) })),
  };
}

export function computePlans(original: BorrowerInput): PlanComparison {
  const input = sanitize(original);
  const { principal, rate, hasParentPlus } = poolLoans(input.loans);
  const noEligibleLoans = principal <= 0;
  const newLoan = hasNewLoan(input);
  const joint = input.filingStatus === "mfj";
  const agi = joint ? input.agi + (input.spouseAgi ?? 0) : input.agi;
  const spouseBal = joint ? input.spouseEligibleBalance : undefined;
  const pslfTrack = input.employer !== "private";
  const std = standard10(principal, rate);

  const payment: Record<PlanId, () => { pay: number; notes: string[] }> = {
    RAP: () => ({ pay: rapMonthly(agi, input.dependents, principal, spouseBal), notes: ["Assumes on-time payments."] }),
    IBR: () => {
      const pay = ibrMonthly(agi, input.familySize, input.hadBalanceOnJuly2014, std, principal, spouseBal);
      const uncapped = ibrMonthly(agi, input.familySize, input.hadBalanceOnJuly2014, null, principal, spouseBal);
      return { pay, notes: uncapped > pay ? ["Capped at the 10-year standard payment.", IBR_CONSERVATIVE] : [IBR_CONSERVATIVE] };
    },
    STANDARD_10: () => ({ pay: std, notes: [] }),
    TIERED: () => ({ pay: tieredStandard(principal, rate), notes: [] }),
  };

  const results: PlanResult[] = (["RAP", "IBR", "STANDARD_10", "TIERED"] as PlanId[]).map((plan) => {
    const why = unavailableReason(plan, newLoan, noEligibleLoans);
    const base = { plan, pslfQualifying: PSLF_QUALIFYING[plan], ruleRefs: RULE_REFS[plan] };
    if (why) return { ...base, available: false, unavailableReason: why, monthlyPayment: 0, notes: [] };
    const { pay, notes } = payment[plan]();
    const r: PlanResult = { ...base, available: true, monthlyPayment: pay, balanceChange12m: simulate12(plan, principal, rate, pay), notes };
    if (plan === "RAP") {
      r.forgivenessYears = 30;
      r.firstMonth = rapMonthBenefit(principal, rate, pay);
    }
    if (plan === "IBR") r.forgivenessYears = input.hadBalanceOnJuly2014 ? 25 : 20;
    return r;
  });

  const rec = recommend(results, pslfTrack);
  const isOpen = (p: PlanId) => results.some((r) => r.plan === p && r.available);
  const general = warningsFor(input, { noEligibleLoans, ibrAvailable: isOpen("IBR"), tieredAvailable: isOpen("TIERED"), hasParentPlus, pslfTrack });

  return {
    input: original,
    results,
    cheapestMonthly: rec.cheapestMonthly,
    bestFor12mBalance: rec.bestFor12mBalance,
    pslfTrack,
    recommended: rec.recommended,
    reason: rec.reason,
    // SAVE deadline first, then the recommendation's balance warning, then the rest.
    warnings: [...general.filter((w) => w.id === "save-deadline"), ...rec.warnings, ...general.filter((w) => w.id !== "save-deadline")],
    rulesAsOf: RULES_AS_OF,
  };
}
