// Fixed RAP statement rules — the "real computation" of the audit. No AI here.
import type { AuditFinding, BorrowerInput, StatementExtraction } from "@/lib/types";
import { computePlans } from "@/lib/engine";
import { formatUSD as usd, round2 } from "@/lib/format";

const TOL = 0.01 + 1e-9;
const NOTICE_RULE = "ED servicer contract: statements ≥21 days before due date";
const SPLIT_RULE = "34 CFR 685.211(a)(1) (how payments are applied)";
const SUBSIDY_RULE = "34 CFR 685.209(h)(4)";
const MATCH_RULE = "34 CFR 685.209(o)(2)";
const FORMULA_RULE = "34 CFR 685.209(f)(5)";
const PLACEMENT_RULE = "34 CFR 685.210";
const ON_TIME_NOTE = "This check assumes your payment was made on time and in full.";

const MIN_CONFIDENCE = 0.5;

const within = (a: number, b: number) => Math.abs(a - b) <= TOL;
const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

type PlanCode = "RAP" | "IBR" | "PAYE" | "ICR" | "SAVE" | "TIERED" | "STANDARD" | "OTHER";

/** Servicers print plan names many ways ("RAP", "Repayment Assistance Plan", "Standard Repayment Plan"). */
function planCode(name?: string): PlanCode | undefined {
  const n = name?.trim().toUpperCase();
  if (!n) return undefined;
  if (/\bRAP\b|REPAYMENT ASSISTANCE/.test(n)) return "RAP";
  if (/\bIBR\b|INCOME[- ]BASED/.test(n)) return "IBR";
  if (/\bPAYE\b|PAY AS YOU EARN/.test(n)) return "PAYE";
  if (/\bICR\b|INCOME[- ]CONTINGENT/.test(n)) return "ICR";
  if (/\bSAVE\b|SAVING ON A VALUABLE/.test(n)) return "SAVE";
  if (/TIERED/.test(n)) return "TIERED";
  if (/STANDARD/.test(n)) return "STANDARD";
  return "OTHER";
}

const isRap = (x: StatementExtraction) => planCode(x.planName) === "RAP";

/** True when the model was reasonably sure it read every one of these fields (missing key = sure). */
const sure = (x: StatementExtraction, ...keys: string[]) => keys.every((k) => (x.fieldConfidence?.[k] ?? 1) >= MIN_CONFIDENCE);

function notEnoughData(id: string, what: string, ruleRef: string): AuditFinding {
  return {
    id,
    severity: "warn",
    title: `Not enough data on this statement to check ${what}`,
    detail: "That field isn't printed on this statement or couldn't be read. Check it in your servicer account or ask your servicer.",
    ruleRef,
  };
}

function checkSubsidy(x: StatementExtraction): AuditFinding | null {
  const lp = x.lastPayment;
  if (lp?.subsidyApplied === undefined && !isRap(x)) return null;
  if (!lp || x.monthlyInterestAccrued === undefined || !sure(x, "lastPayment", "monthlyInterestAccrued")) {
    return notEnoughData("rap-subsidy", "the RAP interest subsidy", SUBSIDY_RULE);
  }
  const interest = x.monthlyInterestAccrued;
  const covered = Math.min(lp.amount, interest);
  const expected = round2(interest - covered);
  const rule = `On an on-time payment, RAP waives the interest your payment didn't cover: ${usd(interest)} − ${usd(covered)} = ${usd(expected)}.`;
  if (lp.subsidyApplied === undefined && !within(expected, 0)) {
    return {
      id: "rap-subsidy", severity: "warn", title: `Your statement doesn't show a RAP interest subsidy (we expected ${usd(expected)})`,
      detail: `${rule} This statement doesn't show how much interest was waived — ask your servicer. ${ON_TIME_NOTE}`, expected, ruleRef: SUBSIDY_RULE,
    };
  }
  const actual = lp.subsidyApplied ?? 0;
  const math = `${rule} The statement applied ${usd(actual)}. ${ON_TIME_NOTE}`;
  if (within(expected, actual)) {
    return { id: "rap-subsidy", severity: "ok", title: "RAP interest subsidy applied correctly", detail: math, expected, actual, ruleRef: SUBSIDY_RULE };
  }
  const title = actual < expected
    ? `Your RAP interest subsidy looks short by ${usd(round2(expected - actual))}`
    : `Your RAP interest subsidy doesn't match (${usd(round2(actual - expected))} more than expected)`;
  return { id: "rap-subsidy", severity: "error", title, detail: math, expected, actual, ruleRef: SUBSIDY_RULE, letterTemplateId: "billing_dispute" };
}

function checkMatch(x: StatementExtraction): AuditFinding | null {
  const lp = x.lastPayment;
  if (lp?.matchApplied === undefined && !isRap(x)) return null;
  if (!lp || !sure(x, "lastPayment")) return notEnoughData("rap-match", "the RAP principal match", MATCH_RULE);
  const principalPaid = lp.toPrincipal;
  const expected = principalPaid < 50 ? round2(Math.min(50, lp.amount) - principalPaid) : 0;
  const rule = `${usd(principalPaid)} of your payment went to principal. When that's under $50, RAP adds min($50, your payment) − principal paid = ${usd(expected)}.`;
  if (lp.matchApplied === undefined && !within(expected, 0)) {
    return {
      id: "rap-match", severity: "warn", title: `Your statement doesn't show a RAP principal match (we expected ${usd(expected)})`,
      detail: `${rule} This statement doesn't show a match — ask your servicer. ${ON_TIME_NOTE}`, expected, ruleRef: MATCH_RULE,
    };
  }
  const actual = lp.matchApplied ?? 0;
  const detail = `${rule} The statement applied ${usd(actual)}. ${ON_TIME_NOTE}`;
  if (within(expected, actual)) {
    return { id: "rap-match", severity: "ok", title: "Principal match applied correctly", detail, expected, actual, ruleRef: MATCH_RULE };
  }
  return {
    id: "rap-match", severity: "error", title: `Your RAP principal match looks off by ${usd(round2(Math.abs(expected - actual)))}`,
    detail, expected, actual, ruleRef: MATCH_RULE, letterTemplateId: "billing_dispute",
  };
}

function checkPlacement(x: StatementExtraction, input?: BorrowerInput): AuditFinding | null {
  if (planCode(x.planName) !== "STANDARD") return null;
  if (!input?.currentPlan || !["SAVE", "RAP", "IBR"].includes(input.currentPlan)) return null;
  return {
    id: "plan-placement",
    severity: "error",
    title: "You may have been moved to the Standard plan",
    detail: `This statement says STANDARD, but you told us you were on ${input.currentPlan}. If you didn't choose Standard, ask your servicer to put you on the plan you applied for — applying is free at StudentAid.gov.`,
    ruleRef: PLACEMENT_RULE,
    letterTemplateId: "plan_switch",
  };
}

function checkFormula(x: StatementExtraction, input?: BorrowerInput): AuditFinding | null {
  if (!input) return null;
  // Only where RAP is (or should be) the plan: a RAP or unlabelled bill, or a possible forced move to Standard.
  const code = planCode(x.planName);
  if (code !== undefined && code !== "RAP" && checkPlacement(x, input) === null) return null;
  const rap = computePlans(input).results.find((r) => r.plan === "RAP" && r.available);
  if (!rap) return null;
  if (!sure(x, "amountDue")) return notEnoughData("payment-vs-formula", "your bill against the RAP formula", FORMULA_RULE);
  const expected = rap.monthlyPayment;
  const actual = x.amountDue;
  if (Math.abs(expected - actual) <= 1) {
    return { id: "payment-vs-formula", severity: "ok", title: "Your bill matches the RAP formula", detail: `RAP for your answers is ${usd(expected)}/month.`, expected, actual, ruleRef: FORMULA_RULE };
  }
  return {
    id: "payment-vs-formula",
    severity: "warn",
    title: "Your bill doesn't match the RAP formula",
    detail: `Based on your answers, RAP would be ${usd(expected)}/month; this bill asks for ${usd(actual)}. If you're on (or applied for) RAP, ask your servicer to recheck your income and dependents.`,
    expected,
    actual,
    ruleRef: FORMULA_RULE,
  };
}

function checkSplit(x: StatementExtraction): AuditFinding {
  const lp = x.lastPayment;
  if (!lp || !sure(x, "lastPayment")) return notEnoughData("payment-split", "how your last payment was applied", SPLIT_RULE);
  const sum = round2(lp.toInterest + lp.toPrincipal);
  if (within(sum, lp.amount)) {
    return { id: "payment-split", severity: "ok", title: "Your last payment adds up", detail: `${usd(lp.toInterest)} to interest + ${usd(lp.toPrincipal)} to principal = ${usd(sum)}.`, expected: lp.amount, actual: sum, ruleRef: SPLIT_RULE };
  }
  return {
    id: "payment-split", severity: "error", title: "Your last payment doesn't add up",
    detail: `You paid ${usd(lp.amount)}, but the statement shows ${usd(lp.toInterest)} to interest + ${usd(lp.toPrincipal)} to principal = ${usd(sum)}.`,
    expected: lp.amount, actual: sum, ruleRef: SPLIT_RULE, letterTemplateId: "billing_dispute",
  };
}

function checkNotice(x: StatementExtraction): AuditFinding {
  if (!x.statementDate || !x.dueDate || Number.isNaN(Date.parse(x.statementDate)) || Number.isNaN(Date.parse(x.dueDate)) || !sure(x, "statementDate", "dueDate")) {
    return notEnoughData("notice-21-day", "how early the statement was sent", NOTICE_RULE);
  }
  const days = daysBetween(x.statementDate, x.dueDate);
  if (days >= 21) {
    return { id: "notice-21-day", severity: "ok", title: "Statement arrived in time", detail: `The statement was dated ${days} days before the due date (at least 21 required).`, ruleRef: NOTICE_RULE };
  }
  return {
    id: "notice-21-day", severity: "warn", title: `Statement sent only ${days} days before the due date`,
    detail: "Servicers are required to send billing statements at least 21 days before the due date. Ask your servicer to confirm no late fee applies.",
    ruleRef: NOTICE_RULE,
  };
}

/** Run every rule; errors first, then warnings, then passes. */
export function auditStatement(x: StatementExtraction, input?: BorrowerInput): AuditFinding[] {
  const order = { error: 0, warn: 1, ok: 2 } as const;
  return [checkSubsidy(x), checkMatch(x), checkPlacement(x, input), checkFormula(x, input), checkSplit(x), checkNotice(x)]
    .filter((f): f is AuditFinding => f !== null)
    .sort((a, b) => order[a.severity] - order[b.severity]);
}
