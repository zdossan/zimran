import type { AuditFinding, PlanId } from "@/lib/types";
import { formatUSD } from "@/lib/format";

// docs/research/08-student-loan-deep-dive.md §H "Letter templates" (6.5), verbatim with brand + date filled in.
export const LETTER_HEADER =
  "Template only. You fill it in, check it, and send it yourself. Student Loan Guardian does not send letters, does not represent you, and is not a law firm. This template is general information, not legal advice, and not a substitute for the advice of an attorney. Check every fact and date before sending, keep a copy, and use your servicer's official address or secure message center. Do not include your FSA ID password, and include only the identifiers your servicer requests. For free help, contact your servicer, the Federal Student Aid Ombudsman through StudentAid.gov, or a local legal aid office. Not affiliated with the U.S. Department of Education or your servicer. Based on rules as of November 1, 2026.";

export const PLAN_NAMES: Record<PlanId, string> = {
  RAP: "Repayment Assistance Plan (RAP)",
  IBR: "Income-Based Repayment (IBR) plan",
  STANDARD_10: "10-year Standard Repayment Plan",
  TIERED: "Tiered Standard Repayment Plan",
};

export const longDate = (d: Date) =>
  d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export const ACCOUNT_BLANK = "[ACCOUNT NUMBER — last 4 digits only]";

export function addressBlock(today: Date, servicer?: string): string {
  return [longDate(today), "", "[YOUR NAME]", "[YOUR MAILING ADDRESS]", `Account: ${ACCOUNT_BLANK}`, "", `To: ${servicer ?? "[SERVICER NAME]"}`].join("\n");
}

// What each finding is about, in the borrower's words to the servicer (titles/details are written to the borrower).
const SUBJECTS: Record<string, string> = {
  "rap-subsidy": "RAP interest subsidy",
  "rap-match": "RAP principal match",
  "payment-split": "how my last payment was applied",
  "plan-placement": "my repayment plan",
  "payment-vs-formula": "my RAP payment amount",
  "notice-21-day": "the date my billing statement was sent",
};

export const findingSubject = (f?: AuditFinding) => (f && SUBJECTS[f.id]) ?? "[SHORT DESCRIPTION]";

export function findingLines(f?: AuditFinding): string[] {
  if (!f) return ["[DESCRIBE THE PROBLEM ON YOUR STATEMENT]"];
  const usd = formatUSD;
  const { expected: e, actual: a, ruleRef: rule } = f;
  switch (f.id) {
    case "rap-subsidy":
    case "rap-match": {
      const what = SUBJECTS[f.id];
      const shown = a === undefined ? `My statement doesn't show a ${what}.` : `My statement shows a ${what} of ${usd(a)}.`;
      return [shown, `Under ${rule}, I calculate ${usd(e ?? 0)}.`, "I made this payment on time and in full on [PAYMENT DATE]."];
    }
    case "payment-split":
      return [`My last payment was ${usd(e ?? 0)}, but my statement shows only ${usd(a ?? 0)} applied to interest and principal (${rule}).`];
    case "plan-placement":
      return [`My statement shows my loans on the Standard plan, but I did not choose that plan (${rule}).`];
    case "payment-vs-formula":
      return [`My statement asks for ${usd(a ?? 0)}, but under ${rule} I calculate a RAP payment of ${usd(e ?? 0)} from my income and family size.`];
    default:
      return [`[DESCRIBE THE PROBLEM ON YOUR STATEMENT] (${rule})`];
  }
}
