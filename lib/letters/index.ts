// Owned by P3 (plans/03-audit.md). Plain-text letters the borrower fills in and sends themselves.
import type { AuditFinding, LetterTemplateId, PlanComparison } from "@/lib/types";
import { LETTER_HEADER, PLAN_NAMES, ACCOUNT_BLANK, addressBlock, findingLines, findingSubject, longDate } from "@/lib/letters/templates";

export type LetterData = {
  borrowerName?: string;
  servicer?: string;
  finding?: AuditFinding;
  comparison?: PlanComparison;
  today: Date;
};

function billingDispute(d: LetterData): string {
  return [
    addressBlock(d.today, d.servicer),
    "",
    `Re: Possible billing error — ${findingSubject(d.finding)}`,
    "",
    "I'm writing about a possible error on my federal student loan billing statement.",
    "",
    ...findingLines(d.finding),
    "",
    "Please review my account, correct any error (including any interest or fees charged because of it), and send me a written answer within 30 days. Please also confirm my current repayment plan and the amount due.",
    "",
    "If this isn't resolved, I may send a copy of this letter to the Consumer Financial Protection Bureau and the Federal Student Aid Ombudsman.",
    "",
    "Thank you,",
    d.borrowerName ?? "[YOUR NAME]",
  ].join("\n");
}

function planSwitch(d: LetterData): string {
  const plan = d.comparison ? PLAN_NAMES[d.comparison.recommended] : "[PLAN NAME]";
  return [
    addressBlock(d.today, d.servicer),
    "",
    `Re: Please place my loans on the ${plan}`,
    "",
    `I applied for the ${plan} at StudentAid.gov (applying is free) on [DATE YOU APPLIED]. Please process my request and place all my eligible loans on this plan.`,
    "Please don't place my loans in forbearance or on the Standard plan unless I ask for that in writing.",
    "",
    "Please confirm in writing within 30 days: the plan my loans are on, my new monthly payment, and its first due date.",
    "",
    "Thank you,",
    d.borrowerName ?? "[YOUR NAME]",
  ].join("\n");
}

function cfpbComplaint(d: LetterData): string {
  return [
    `Prepared ${longDate(d.today)} — paste the parts below into consumerfinance.gov/complaint (product: Student loan).`,
    "",
    `Company: ${d.servicer ?? "[SERVICER NAME]"}`,
    `My name: [YOUR NAME] · Account: ${ACCOUNT_BLANK}`,
    "",
    "What happened:",
    ...findingLines(d.finding),
    "I contacted my servicer on [DATE] and [describe their response, or that they did not respond].",
    "",
    "What I want the company to do:",
    "Correct the error on my account, reverse any interest or fees it caused, and confirm my repayment plan and payment amount in writing.",
  ].join("\n");
}

export function renderLetter(id: LetterTemplateId, data: LetterData): string {
  const body = id === "billing_dispute" ? billingDispute(data) : id === "plan_switch" ? planSwitch(data) : cfpbComplaint(data);
  return `${LETTER_HEADER}\n\n${body}\n`;
}
