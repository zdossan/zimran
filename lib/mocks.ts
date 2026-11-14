// Mock data so every slice can build before the real engine/audit/payments merge.
// Values come from research/engine_fixtures.py (verified against 22 published examples).
import type {
  ActionItem,
  AuditResult,
  BorrowerInput,
  Entitlement,
  FilingComparison,
  PlanComparison,
  PlanResult,
  Warning,
} from "@/lib/types";
import { RULES_AS_OF } from "@/lib/types";

const RAP_REFS = ["34 CFR 685.209(b)(2)", "34 CFR 685.209(f)(5)", "34 CFR 685.209(h)(4)", "34 CFR 685.209(o)(2)"];
const IBR_REFS = ["34 CFR 685.209(b)(4)", "34 CFR 685.209(f)(3)", "34 CFR 685.209(b)(13)(ii)"];
const STD_REFS = ["34 CFR 685.208(b)(1)"];
const TIERED_REFS = ["34 CFR 685.208(c)(1)", "HEA §455(d)(7)(A)"];
const TIERED_NOT_AVAILABLE = "Only for borrowers with a loan made on or after July 1, 2026";

const loan = (balance: number, rate: number, disbursedOn: string, id = "pooled"): BorrowerInput["loans"][number] => ({
  id,
  type: "unsub",
  balance,
  rate,
  disbursedOn,
});

/** Engine test borrowers F1–F6 (research/08 §I.2). */
export const SAMPLE_BORROWERS: Record<"F1" | "F2a" | "F2b" | "F3a" | "F3b" | "F4" | "F5" | "F6", BorrowerInput> = {
  F1: { agi: 45000, filingStatus: "single", dependents: 0, familySize: 1, state: "OH", loans: [loan(35000, 0.0653, "2016-09-01")], hadBalanceOnJuly2014: false, employer: "private" },
  F2a: { agi: 55000, filingStatus: "single", dependents: 0, familySize: 1, state: "OH", loans: [loan(40000, 0.065, "2015-08-01")], hadBalanceOnJuly2014: false, employer: "private" },
  F2b: {
    agi: 55000, filingStatus: "hoh", dependents: 2, familySize: 3, state: "OH", loans: [loan(40000, 0.065, "2015-08-01")],
    hadBalanceOnJuly2014: false, employer: "private", currentPlan: "SAVE", saveNoticeDate: "2026-09-01",
  },
  F3a: { agi: 55000, filingStatus: "single", dependents: 0, familySize: 1, state: "OH", loans: [loan(40000, 0.065, "2009-09-01")], hadBalanceOnJuly2014: true, employer: "private" },
  F3b: { agi: 55000, filingStatus: "hoh", dependents: 2, familySize: 3, state: "OH", loans: [loan(40000, 0.065, "2009-09-01")], hadBalanceOnJuly2014: true, employer: "private" },
  F4: {
    agi: 60000, spouseAgi: 90000, filingStatus: "mfj", dependents: 1, familySize: 3, state: "OH",
    loans: [loan(52000, 0.0653, "2012-09-01")], hadBalanceOnJuly2014: true, employer: "government",
  },
  F5: { agi: 12000, filingStatus: "hoh", dependents: 1, familySize: 2, state: "OH", loans: [loan(25000, 0.0653, "2017-09-01")], hadBalanceOnJuly2014: false, employer: "private" },
  F6: {
    agi: 80000, filingStatus: "single", dependents: 0, familySize: 1, state: "OH",
    loans: [loan(60000, 0.07, "2016-09-01", "l1"), { id: "l2", type: "gradplus", balance: 25000, rate: 0.07, disbursedOn: "2026-08-15" }],
    hadBalanceOnJuly2014: false, employer: "nonprofit",
  },
};

const tieredUnavailable: PlanResult = {
  plan: "TIERED", available: false, unavailableReason: TIERED_NOT_AVAILABLE, monthlyPayment: 0,
  pslfQualifying: false, ruleRefs: TIERED_REFS, notes: [],
};

const W_TAXABLE: Warning = {
  id: "idr-forgiveness-taxable", severity: "info", title: "Forgiveness may be taxed",
  body: "RAP and IBR forgiveness is federally taxable from 2026. PSLF forgiveness is tax-free.", ruleRef: "IRC §108(f)",
};

/** F2b — single parent, 2 kids: IBR is cheapest per month but grows the balance; RAP is recommended. */
export const MOCK_COMPARISON: PlanComparison = {
  input: SAMPLE_BORROWERS.F2b,
  results: [
    {
      plan: "RAP", available: true, monthlyPayment: 129.17, forgivenessYears: 30, pslfQualifying: true,
      firstMonth: { interest: 216.67, waived: 87.5, principalPaid: 0, match: 50, principalDrop: 50 },
      balanceChange12m: -600, ruleRefs: RAP_REFS, notes: ["Assumes on-time payments."],
    },
    {
      plan: "IBR", available: true, monthlyPayment: 116.83, forgivenessYears: 20, pslfQualifying: true,
      balanceChange12m: 1198.08, ruleRefs: IBR_REFS,
      notes: ["IBR's interest waiver for subsidized loans is ignored, so the balance change is conservative."],
    },
    { plan: "STANDARD_10", available: true, monthlyPayment: 454.19, pslfQualifying: true, balanceChange12m: -2936.75, ruleRefs: STD_REFS, notes: [] },
    tieredUnavailable,
  ],
  cheapestMonthly: "IBR",
  bestFor12mBalance: "STANDARD_10",
  pslfTrack: false,
  recommended: "RAP",
  reason:
    "You're not on a PSLF track, so we pick the lowest payment that doesn't grow your balance: IBR is $12.34 less per month, but your balance would grow about $1,198 this year, while RAP shrinks it about $600.",
  warnings: [
    {
      id: "save-deadline", severity: "danger", title: "Your SAVE deadline: Nov 30, 2026",
      body: "Choose a plan within 90 days of your servicer's notice, or you may be placed on the Standard plan.",
    },
    {
      id: "balance-grows", severity: "warn", title: "IBR would grow your balance",
      body: "At $116.83/month your payment doesn't cover the interest, so your balance would grow about $1,198 this year.",
    },
    {
      id: "new-loan-kills-ibr", severity: "danger", title: "A new loan would remove IBR",
      body: "Any new federal loan or consolidation made on or after July 1, 2026 limits all your loans to RAP or Tiered Standard.",
      ruleRef: "HEA §455(d)(7)",
    },
    W_TAXABLE,
  ],
  rulesAsOf: RULES_AS_OF,
};

const F4_MFJ: PlanComparison = {
  input: SAMPLE_BORROWERS.F4,
  results: [
    {
      plan: "RAP", available: true, monthlyPayment: 1200, forgivenessYears: 30, pslfQualifying: true,
      firstMonth: { interest: 282.97, waived: 0, principalPaid: 917.03, match: 0, principalDrop: 917.03 },
      balanceChange12m: -11339.8, ruleRefs: RAP_REFS, notes: [],
    },
    { plan: "IBR", available: true, monthlyPayment: 591.24, forgivenessYears: 25, pslfQualifying: true, balanceChange12m: -3812.03, ruleRefs: IBR_REFS, notes: ["Capped at the 10-year standard payment."] },
    { plan: "STANDARD_10", available: true, monthlyPayment: 591.24, pslfQualifying: true, balanceChange12m: -3812.03, ruleRefs: STD_REFS, notes: [] },
    tieredUnavailable,
  ],
  cheapestMonthly: "IBR",
  bestFor12mBalance: "RAP",
  pslfTrack: true,
  recommended: "IBR",
  reason: "You're on a PSLF track, so we pick the lowest payment among PSLF-qualifying plans; IBR ties the 10-year Standard and wins the tie-break.",
  warnings: [W_TAXABLE],
  rulesAsOf: RULES_AS_OF,
};

const F4_MFS: PlanComparison = {
  input: { ...SAMPLE_BORROWERS.F4, filingStatus: "mfs", familySize: 2 },
  results: [
    {
      plan: "RAP", available: true, monthlyPayment: 200, forgivenessYears: 30, pslfQualifying: true,
      firstMonth: { interest: 282.97, waived: 82.97, principalPaid: 0, match: 50, principalDrop: 50 },
      balanceChange12m: -600, ruleRefs: RAP_REFS, notes: [],
    },
    { plan: "IBR", available: true, monthlyPayment: 344.25, forgivenessYears: 25, pslfQualifying: true, balanceChange12m: -757.81, ruleRefs: IBR_REFS, notes: [] },
    { plan: "STANDARD_10", available: true, monthlyPayment: 591.24, pslfQualifying: true, balanceChange12m: -3812.03, ruleRefs: STD_REFS, notes: [] },
    tieredUnavailable,
  ],
  cheapestMonthly: "RAP",
  bestFor12mBalance: "STANDARD_10",
  pslfTrack: true,
  recommended: "RAP",
  reason: "You're on a PSLF track, so we pick the lowest payment among PSLF-qualifying plans.",
  warnings: [W_TAXABLE],
  rulesAsOf: RULES_AS_OF,
};

/** F4 — married teacher: filing separately cuts the payment from $591.24 to $200.00. */
export const MOCK_FILING: FilingComparison = {
  mfj: F4_MFJ,
  mfs: F4_MFS,
  mfsExtraTaxPerYear: 650,
  netAnnualSavingMfs: 4044.88,
  caveats: [
    "Filing separately removes the student loan interest deduction.",
    "Filing separately removes education credits (American Opportunity and Lifetime Learning).",
    "Filing separately removes the child and dependent care credit and caps a dependent-care FSA at $2,500.",
    "Filing separately generally removes the Earned Income Tax Credit (exceptions for separated spouses).",
    "Filing separately removes the premium tax credit for Marketplace health insurance.",
    "Filing separately limits Roth IRA contributions and the new tips, overtime and senior deductions.",
    "In community-property states, income is generally split 50/50 on separate returns.",
  ],
};

/** The Reddit case (r/StudentLoans, 2026): subsidy should be $93.21, statement applied $53.11. */
export const MOCK_AUDIT: AuditResult = {
  extraction: {
    isSample: true,
    servicer: "MOHELA (SAMPLE)",
    statementDate: "2026-08-23",
    dueDate: "2026-09-21",
    amountDue: 87.79,
    loanStatus: "REPAY",
    principalBalance: 31478.26,
    interestRate: 0.069,
    monthlyInterestAccrued: 181,
    lastPayment: { date: "2026-09-16", amount: 87.79, toInterest: 87.79, toPrincipal: 0, subsidyApplied: 53.11, matchApplied: 50 },
    fieldConfidence: { servicer: 1, statementDate: 1, dueDate: 1, amountDue: 1, principalBalance: 1, monthlyInterestAccrued: 1, lastPayment: 1 },
  },
  findings: [
    {
      id: "rap-subsidy", severity: "error", title: "Your RAP interest subsidy looks short by $40.10",
      detail: "On an on-time payment, RAP waives the interest your payment didn't cover: $181.00 − $87.79 = $93.21. The statement applied $53.11.",
      expected: 93.21, actual: 53.11, ruleRef: "34 CFR 685.209(h)(4)", letterTemplateId: "billing_dispute",
    },
    {
      id: "rap-match", severity: "ok", title: "Principal match applied correctly",
      detail: "No principal was paid, so RAP adds min($50, payment) = $50.00. The statement applied $50.00.",
      expected: 50, actual: 50, ruleRef: "34 CFR 685.209(o)(2)",
    },
    {
      id: "notice-21-day", severity: "ok", title: "Statement arrived in time",
      detail: "The statement was dated 29 days before the due date (at least 21 required).",
      ruleRef: "ED servicer contract: statements ≥21 days before due date",
    },
  ],
  rulesAsOf: RULES_AS_OF,
};

export const MOCK_ACTIONS: ActionItem[] = [
  {
    id: "apply-recommended", dueDate: "2026-11-22",
    title: "Apply for RAP at StudentAid.gov or through your servicer (free)",
    detail: "Applying is free. If your servicer doesn't act within 30 days, send the plan-switch letter.",
    letterTemplateId: "plan_switch",
  },
  { id: "save-90-day", dueDate: "2026-11-30", title: "SAVE deadline", detail: "Choose a plan before your 90-day window closes." },
  { id: "recertify", dueDate: "2027-11-15", title: "Recertify your income", detail: "Or consent to IRS data sharing so it happens automatically." },
];

export const MOCK_ENTITLEMENT: Entitlement = { pro: false, paidStateBlocked: false };
