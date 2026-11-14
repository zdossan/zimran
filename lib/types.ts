// Shared contract for all four slices. Spec §5.3 (+ §5.4 additions).
// DO NOT EDIT without a "TYPE CHANGE:" message to the whole team — only the lead merges changes here.

export type FilingStatus = "single" | "hoh" | "mfj" | "mfs";
export type LoanType = "sub" | "unsub" | "gradplus" | "consolidation" | "parentplus";
export type PlanId = "RAP" | "IBR" | "STANDARD_10" | "TIERED";
export type Employer = "private" | "government" | "nonprofit";
export type CurrentPlan = "SAVE" | "IBR" | "PAYE" | "ICR" | "STANDARD" | "RAP" | "TIERED" | "UNKNOWN";

export interface Loan {
  id: string;
  type: LoanType;
  balance: number;
  rate: number; // annual, e.g. 0.065
  disbursedOn: string; // ISO date YYYY-MM-DD
}

export interface BorrowerInput {
  agi: number; // borrower AGI
  spouseAgi?: number; // used when filing jointly
  spouseEligibleBalance?: number; // spouse's RAP/IBR-eligible loans (MFJ proration)
  filingStatus: FilingStatus;
  dependents: number; // IRC §152 dependents on the borrower's return (RAP)
  familySize: number; // IBR family size (spouse counts only when MFJ)
  state: string; // 2-letter code
  loans: Loan[];
  hadBalanceOnJuly2014: boolean; // IBR "new borrower" test (true → 15%)
  employer: Employer; // PSLF eligibility hint
  currentPlan?: CurrentPlan;
  saveNoticeDate?: string; // ISO; drives the 90-day deadline
}

export interface RapMonthBenefit {
  interest: number;
  waived: number;
  principalPaid: number;
  match: number;
  principalDrop: number;
}

export interface PlanResult {
  plan: PlanId;
  available: boolean;
  unavailableReason?: string;
  monthlyPayment: number;
  forgivenessYears?: number;
  pslfQualifying: boolean;
  firstMonth?: RapMonthBenefit; // RAP only
  balanceChange12m?: number; // + grows / − shrinks
  ruleRefs: string[];
  notes: string[];
}

export interface Warning {
  id: string;
  severity: "info" | "warn" | "danger";
  title: string;
  body: string;
  ruleRef?: string;
}

export interface PlanComparison {
  input: BorrowerInput;
  results: PlanResult[];
  cheapestMonthly: PlanId; // lowest monthlyPayment among available plans
  bestFor12mBalance: PlanId; // most negative balanceChange12m
  pslfTrack: boolean; // employer is government or nonprofit
  recommended: PlanId;
  reason: string; // one plain sentence naming the rule used (spec §5.4)
  warnings: Warning[];
  rulesAsOf: string;
}

export interface FilingComparison {
  mfj: PlanComparison;
  mfs: PlanComparison;
  mfsExtraTaxPerYear: number;
  netAnnualSavingMfs: number;
  caveats: string[];
}

export type LetterTemplateId = "plan_switch" | "billing_dispute" | "cfpb_complaint";

export interface ActionItem {
  id: string;
  dueDate?: string; // ISO YYYY-MM-DD
  title: string;
  detail: string;
  letterTemplateId?: LetterTemplateId;
}

export interface StatementExtraction {
  isSample: boolean;
  servicer: string;
  statementDate: string;
  dueDate: string;
  amountDue: number;
  planName?: string;
  loanStatus?: string;
  principalBalance: number;
  interestRate?: number;
  lastPayment?: {
    date: string;
    amount: number;
    toInterest: number;
    toPrincipal: number;
    subsidyApplied?: number;
    matchApplied?: number;
  };
  monthlyInterestAccrued?: number;
  fieldConfidence: Record<string, number>; // 0..1
}

export interface AuditFinding {
  id: string;
  severity: "ok" | "warn" | "error";
  title: string;
  detail: string;
  expected?: number;
  actual?: number;
  ruleRef: string;
  letterTemplateId?: LetterTemplateId;
}

export interface AuditResult {
  extraction: StatementExtraction;
  findings: AuditFinding[];
  rulesAsOf: string;
}

export interface Entitlement {
  pro: boolean;
  plan?: "monthly" | "annual";
  paidStateBlocked: boolean;
}

export const RULES_AS_OF = "2026-11-01";
