// Exact disclaimer texts — owned by P4 (plans/04-pay-trust-pitch.md).
// Verbatim, per docs/research/08-student-loan-deep-dive.md §H with the team's substitutions
// already applied: brand name -> "Student Loan Guardian", [RULES_DATE] -> "November 1, 2026",
// [CONSOLIDATION_LINK] -> "https://studentaid.gov". Do not edit these strings without updating
// the source research doc's resolved-decisions trail.
import type { DisclaimerVariant } from "./Disclaimer";

export const DISCLAIMERS: Record<DisclaimerVariant, string> = {
  footer:
    "Student Loan Guardian is an independent company. We are not affiliated with, endorsed by, or acting for the U.S. Department of Education, Federal Student Aid, or any loan servicer, and we are not a loan servicer or lender. You can apply for federal repayment plans, consolidation, and forgiveness for free at StudentAid.gov or through your loan servicer. You never have to pay anyone for that. We sell software that helps you compare options and organize your own next steps; we never contact your servicer or apply for you. Our tools give general information, not legal, tax, or financial advice, and are not a substitute for the advice of an attorney. Never share your FSA ID username or password with anyone, including us. Estimates use federal rules as of November 1, 2026.",

  hero:
    "What we do: Student Loan Guardian is software. It estimates which federal repayment plan may cost you least, gives you a dated checklist and letter templates you send yourself, and flags possible errors in statements you upload. We do not contact your servicer or file anything for you. You can apply for a federal Direct Consolidation Loan from the U.S. Department of Education at no cost: https://studentaid.gov. Our service may not be the best or only option for you. Other federal repayment options, including income-driven plans that do not require consolidation, may be available to you. Consider contacting your student loan servicer before you sign any legal document about your student loan.",

  results:
    "These are estimates, not guarantees. They are based on the information you entered and on federal student loan rules as of November 1, 2026. Rules, plan availability, and court decisions can change. Only the U.S. Department of Education and your servicer decide your actual payment, eligibility, and forgiveness. Before you act, check your numbers with the Repayment Calculator on StudentAid.gov or with your servicer. Applying for any repayment plan is free at StudentAid.gov or through your servicer. Student Loan Guardian is not affiliated with the U.S. Department of Education. This is general information, not legal, tax, or financial advice; forgiven amounts and plan choices can have tax effects, so consider a tax professional.",

  paywall:
    "What you're buying: access to Student Loan Guardian's software for 1 month for $9 or 1 year for $79: plan comparison, your dated action plan and reminders, letter templates, and statement checks. What you're not buying: a repayment plan, consolidation, forgiveness, or anyone acting for you. Those applications are free at StudentAid.gov or through your servicer, and you can do everything this tool suggests on your own without paying us. We don't guarantee any savings, approval, or forgiveness. Auto-renewal: your subscription renews automatically at $9/month or $79/year (whichever you chose) until you cancel. Cancel anytime in one step via Manage subscription (Stripe billing portal).",

  letter:
    "Template only. You fill it in, check it, and send it yourself. Student Loan Guardian does not send letters, does not represent you, and is not a law firm. This template is general information, not legal advice, and not a substitute for the advice of an attorney. Check every fact and date before sending, keep a copy, and use your servicer's official address or secure message center. Do not include your FSA ID password, and include only the identifiers your servicer requests. For free help, contact your servicer, the Federal Student Aid Ombudsman through StudentAid.gov, or a local legal aid office. Not affiliated with the U.S. Department of Education or your servicer. Based on rules as of November 1, 2026.",

  audit:
    "We flag *possible* discrepancies by comparing your statement with the information you provided and with federal rules as of November 1, 2026. A flag is not a finding that your servicer made an error, and it does not affect your credit report. Confirm with your servicer, using the template if you like. If the issue isn't resolved, you can contact the Federal Student Aid Ombudsman for free.",
};
