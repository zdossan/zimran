// STUB — owned by P4 (plans/04-pay-trust-pitch.md). P4 adds the exact text for every variant
// from docs/research/08-student-loan-deep-dive.md §H. Until then every variant shows the footer text (§H 6.1).
export type DisclaimerVariant = "footer" | "hero" | "results" | "paywall" | "letter" | "audit";

export const FOOTER_TEXT =
  "Student Loan Guardian is an independent company. We are not affiliated with, endorsed by, or acting for the U.S. Department of Education, Federal Student Aid, or any loan servicer, and we are not a loan servicer or lender. You can apply for federal repayment plans, consolidation, and forgiveness for free at StudentAid.gov or through your loan servicer. You never have to pay anyone for that. We sell software that helps you compare options and organize your own next steps; we never contact your servicer or apply for you. Our tools give general information, not legal, tax, or financial advice, and are not a substitute for the advice of an attorney. Never share your FSA ID username or password with anyone, including us. Estimates use federal rules as of November 1, 2026.";

export function Disclaimer({ variant }: { variant: DisclaimerVariant }) {
  return (
    <p data-variant={variant} className="text-xs leading-relaxed text-muted-foreground">
      {FOOTER_TEXT}
    </p>
  );
}
