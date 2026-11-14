// Quiz answers as typed by the user (owned by P2, plans/02-funnel.md Task 1).
import type { CurrentPlan, Employer, FilingStatus } from "@/lib/types";

export interface QuizAnswers {
  agi: string;
  filing: FilingStatus;
  spouseAgi?: string;
  spouseHasLoans: boolean;
  spouseBalance?: string;
  dependents: number;
  state: string;
  balance: string;
  rate: string; // percent, e.g. "6.5"
  firstLoanYear: number;
  hadBalanceJuly2014: "yes" | "no" | "not_sure";
  newLoanSinceJuly2026: boolean;
  employer: Employer;
  currentPlan: CurrentPlan;
  saveNoticeDate?: string; // YYYY-MM-DD
}

export type QuizStep = 1 | 2 | 3 | 4 | 5 | 6;

export const STEP_TITLES: Record<QuizStep, string> = {
  1: "Your income",
  2: "How you file taxes",
  3: "Your household",
  4: "Your federal loans",
  5: "Where you work",
  6: "Your plan today",
};

export const FILING_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "hoh", label: "Head of household" },
  { value: "mfj", label: "Married, filing jointly" },
  { value: "mfs", label: "Married, filing separately" },
];

export const EMPLOYER_OPTIONS: { value: Employer; label: string; hint: string }[] = [
  { value: "government", label: "Government", hint: "Federal, state, local, tribal, public schools, military" },
  { value: "nonprofit", label: "Nonprofit", hint: "A 501(c)(3) employer, e.g. many hospitals and charities" },
  { value: "private", label: "Private company or self-employed", hint: "Anything else" },
];

export const PLAN_OPTIONS: { value: CurrentPlan; label: string }[] = [
  { value: "SAVE", label: "SAVE" },
  { value: "RAP", label: "RAP (Repayment Assistance Plan)" },
  { value: "IBR", label: "IBR (Income-Based Repayment)" },
  { value: "PAYE", label: "PAYE" },
  { value: "ICR", label: "ICR" },
  { value: "STANDARD", label: "Standard" },
  { value: "TIERED", label: "Tiered Standard" },
  { value: "UNKNOWN", label: "Not sure" },
];

export const JULY_2014_OPTIONS: { value: QuizAnswers["hadBalanceJuly2014"]; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
];

export const US_STATES: { code: string; name: string }[] = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"], ["CO", "Colorado"],
  ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
  ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"],
  ["ME", "Maine"], ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
  ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"],
  ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"],
  ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"], ["SD", "South Dakota"],
  ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
  ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
].map(([code, name]) => ({ code, name }));
