// Servicer call helper: what to say on the phone for each common problem, and a log of the calls.
// The borrower makes the call themselves; we never call for them and never ask for their FSA ID.
export const CALL_TOPICS = ["switch_plan", "billing_error", "save_deadline", "recertify"] as const;
export type CallTopic = (typeof CALL_TOPICS)[number];

export interface CallLog {
  id: string;
  on: string; // ISO date of the call
  topic: CallTopic;
  rep?: string;
  reference?: string;
  notes?: string;
  disputeId?: string;
}

export const CALL_SCRIPTS: Record<CallTopic, { title: string; lines: string[] }> = {
  switch_plan: {
    title: "Switch my repayment plan",
    lines: [
      "Hi, I applied for a new repayment plan at StudentAid.gov on [DATE]. Can you confirm you received it?",
      "When will it be processed, and what will my new monthly payment be?",
      "Please don't put my loans in forbearance or on the Standard plan unless I ask for that in writing.",
      "Can I have a reference number for this call, and your name?",
    ],
  },
  billing_error: {
    title: "A billing error on my statement",
    lines: [
      "My statement dated [DATE] looks wrong: [WHAT'S WRONG, e.g. the interest subsidy is short by $40.10].",
      "Can you review my account and correct it, including any interest or fees charged because of the error?",
      "Please send me your answer in writing.",
      "Can I have a reference number for this call, and your name?",
    ],
  },
  save_deadline: {
    title: "My SAVE plan is ending",
    lines: [
      "I got your notice that the SAVE plan is ending, dated [DATE]. What is my deadline to choose a new plan?",
      "Which plans can I move to, and what would each one cost me each month?",
      "Please don't move me to the Standard plan or into forbearance without asking me first.",
      "Can I have a reference number for this call, and your name?",
    ],
  },
  recertify: {
    title: "My income changed",
    lines: [
      "My income has changed. Can I recertify now so my payment is recalculated?",
      "Can I agree to IRS data sharing so my income updates automatically each year?",
      "When will my new payment start?",
      "Can I have a reference number for this call, and your name?",
    ],
  },
};

/** Shown with every script. */
export const CALL_SAFETY = "You make the call. Never give your FSA ID password to anyone on the phone, including us.";
