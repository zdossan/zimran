// How to do each step of the dated action plan, keyed by ActionItem.id (lib/actions/buildActionPlan.ts).
// Everything here is done by the borrower on the free official site or with their servicer; we never ask
// for, or take, their FSA ID.
export type HowTo = { steps: string[]; link?: { href: string; label: string } };

export const HOW_TO: Record<string, HowTo> = {
  "apply-recommended": {
    steps: [
      "Go to StudentAid.gov and sign in yourself. Your FSA ID is yours alone: never share it with anyone, including us.",
      "Open the income-driven repayment application and choose the plan we recommended. Applying is free.",
      "Agree to share your tax information with the Department of Education, so your income fills in now and updates each year.",
      "Save the confirmation. If your servicer hasn't moved you within 30 days, send the plan-switch letter below.",
    ],
    link: { href: "https://studentaid.gov/idr/", label: "Open the application on StudentAid.gov" },
  },
  "save-90-day": {
    steps: [
      "Find the date on your servicer's notice that SAVE is ending. You have 90 days from that date to choose a new plan.",
      "Apply for your new plan before the deadline (the first step above). It's free.",
      "If the deadline passes, call your servicer: you may have been moved to the Standard plan, and you can still apply for another plan for free.",
    ],
  },
  "pslf-certify": {
    steps: [
      "Open the PSLF Help Tool on StudentAid.gov and search for your employer.",
      "Fill in your employment dates and send the form to your employer to sign. The tool can collect the signature online.",
      "Once it's processed, look up your qualifying payment count on StudentAid.gov and enter it in the tracker below.",
      "Certify again every year and whenever you change jobs.",
    ],
    link: { href: "https://studentaid.gov/pslf/", label: "Open the PSLF Help Tool" },
  },
  recertify: {
    steps: [
      "Your servicer tells you when your yearly income recertification is due. Keep the date in your calendar.",
      "Easiest: agree to IRS data sharing on StudentAid.gov, so your income updates automatically.",
      "If your income drops before then, recertify early to lower your payment.",
    ],
    link: { href: "https://studentaid.gov/idr/", label: "Recertify on StudentAid.gov" },
  },
  "filing-status": {
    steps: [
      "Before you file, compare filing jointly and separately in your results (the “What if?” panel).",
      "Filing separately can lower your payment but raise your taxes. Check both with a tax professional.",
      "File your taxes, then recertify with the return you filed.",
    ],
  },
  "no-new-loans": {
    steps: [
      "Before you borrow again or consolidate, check the date the new loan would be made.",
      "A federal loan made on or after July 1, 2026 limits all your loans to RAP or the Tiered Standard plan.",
      "Thinking about consolidating? Ask your servicer how it changes your plan options first.",
    ],
  },
};
