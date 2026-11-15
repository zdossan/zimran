import { describe, it, expect } from "vitest";
import { parseMoney, parsePercent, toBorrowerInput, validateStep } from "@/components/funnel/mapping";
import type { QuizAnswers } from "@/components/funnel/quizTypes";
import { SAMPLE_ANSWERS, SAMPLE_KEYS, SAMPLES } from "@/components/funnel/samples";
import { computePlans } from "@/lib/engine";

describe("sample answers", () => {
  it("walking a sample through the quiz gives the same engine answer as opening its results directly", () => {
    for (const key of SAMPLE_KEYS) {
      const viaQuiz = computePlans(toBorrowerInput(SAMPLE_ANSWERS[key]).input);
      const direct = computePlans(SAMPLES[key].input);
      expect(viaQuiz.recommended).toBe(direct.recommended);
      expect(viaQuiz.results.map((r) => [r.plan, r.available, r.monthlyPayment, r.balanceChange12m])).toEqual(
        direct.results.map((r) => [r.plan, r.available, r.monthlyPayment, r.balanceChange12m]),
      );
    }
  });

  it("sample answers pass every step's validation", () => {
    for (const key of SAMPLE_KEYS) for (const step of [1, 2, 3, 4, 5, 6] as const) expect(validateStep(step, SAMPLE_ANSWERS[key])).toBeNull();
  });
});

const F2B_LIKE: QuizAnswers = {
  agi: "55,000",
  filing: "hoh",
  spouseHasLoans: false,
  dependents: 2,
  state: "OH",
  balance: "$40,000",
  rate: "6.5",
  firstLoanYear: 2015,
  hadBalanceJuly2014: "no",
  newLoanSinceJuly2026: false,
  employer: "private",
  currentPlan: "SAVE",
  saveNoticeDate: "2026-09-01",
};

describe("parseMoney", () => {
  it("accepts commas and a dollar sign", () => {
    expect(parseMoney("55,000")).toBe(55000);
    expect(parseMoney("$55,000")).toBe(55000);
    expect(parseMoney(" $1,234.56 ")).toBe(1234.56);
  });

  it("returns null for blank or non-numbers", () => {
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("   ")).toBeNull();
    expect(parseMoney("abc")).toBeNull();
  });

  it("percent: '6.5' and '6.5%' are 6.5", () => {
    expect(parsePercent("6.5%")).toBe(6.5);
    expect(parsePercent("")).toBeNull();
  });
});

describe("toBorrowerInput", () => {
  it("maps the F2b-like answers", () => {
    const { input, notes } = toBorrowerInput(F2B_LIKE);
    expect(input.agi).toBe(55000);
    expect(input.familySize).toBe(3);
    expect(input.dependents).toBe(2);
    expect(input.loans).toEqual([{ id: "pooled", type: "unsub", balance: 40000, rate: 0.065, disbursedOn: "2015-01-01" }]);
    expect(input.hadBalanceOnJuly2014).toBe(false);
    expect(input.currentPlan).toBe("SAVE");
    expect(input.saveNoticeDate).toBe("2026-09-01");
    expect(notes).toEqual([]);
  });

  it("joint filing with 1 dependent is a family of 3, with the spouse's income and loans", () => {
    const { input } = toBorrowerInput({ ...F2B_LIKE, filing: "mfj", dependents: 1, spouseAgi: "90,000", spouseHasLoans: true, spouseBalance: "20,000" });
    expect(input.familySize).toBe(3);
    expect(input.spouseAgi).toBe(90000);
    expect(input.spouseEligibleBalance).toBe(20000);
  });

  it("'not sure' about July 2014 assumes the conservative 15% and says so", () => {
    const { input, notes } = toBorrowerInput({ ...F2B_LIKE, firstLoanYear: 2012, hadBalanceJuly2014: "not_sure" });
    expect(input.hadBalanceOnJuly2014).toBe(true);
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatch(/July 2014/);
  });

  it("a first loan in 2015 or later can't have been owed in July 2014: 10% IBR, no note", () => {
    const { input, notes } = toBorrowerInput({ ...F2B_LIKE, firstLoanYear: 2018, hadBalanceJuly2014: "not_sure" });
    expect(input.hadBalanceOnJuly2014).toBe(false);
    expect(notes).toEqual([]);
  });

  it("a first loan in 2026 isn't a new loan unless the new-loan box is checked", () => {
    const { input } = toBorrowerInput({ ...F2B_LIKE, firstLoanYear: 2026 });
    expect(input.loans).toHaveLength(1);
    expect(input.loans[0].disbursedOn < "2026-07-01").toBe(true);
  });

  it("a new loan since July 2026 adds a second loan dated 2026-08-15", () => {
    const { input } = toBorrowerInput({ ...F2B_LIKE, newLoanSinceJuly2026: true });
    expect(input.loans[1]).toMatchObject({ disbursedOn: "2026-08-15", balance: 0.01 });
  });

  it("drops the SAVE notice date unless the current plan is SAVE", () => {
    expect(toBorrowerInput({ ...F2B_LIKE, currentPlan: "IBR" }).input.saveNoticeDate).toBeUndefined();
  });
});

describe("validateStep", () => {
  it("step 1 blocks a blank income with a message", () => {
    expect(validateStep(1, { agi: "" })).toMatch(/income/i);
    expect(validateStep(1, { agi: "$55,000" })).toBeNull();
  });

  it("step 2 blocks joint filing without the spouse's income", () => {
    expect(validateStep(2, { filing: "mfj" })).not.toBeNull();
    expect(validateStep(2, { filing: "mfj", spouseAgi: "90,000", spouseHasLoans: false })).toBeNull();
    expect(validateStep(2, { filing: "single" })).toBeNull();
  });

  it("step 2 blocks 'spouse has loans' without a spouse balance", () => {
    expect(validateStep(2, { filing: "mfj", spouseAgi: "90,000", spouseHasLoans: true })).not.toBeNull();
  });

  it("step 3 needs a US state", () => {
    expect(validateStep(3, { dependents: 0, state: "" })).not.toBeNull();
    expect(validateStep(3, { dependents: 0, state: "OH" })).toBeNull();
  });

  it("step 4 needs a balance, a sensible rate, a year and the July 2014 answer", () => {
    const ok = { balance: "40,000", rate: "6.5", firstLoanYear: 2015, hadBalanceJuly2014: "no" as const, newLoanSinceJuly2026: false };
    expect(validateStep(4, ok)).toBeNull();
    expect(validateStep(4, { ...ok, balance: "" })).not.toBeNull();
    expect(validateStep(4, { ...ok, rate: "65" })).not.toBeNull();
    expect(validateStep(4, { ...ok, firstLoanYear: 2012, hadBalanceJuly2014: undefined })).not.toBeNull();
  });

  it("step 4 doesn't ask about July 2014 when the first loan is 2015 or later", () => {
    const ok = { balance: "40,000", rate: "6.5", firstLoanYear: 2018, newLoanSinceJuly2026: false };
    expect(validateStep(4, ok)).toBeNull();
  });

  it("step 4 rejects a rate typed as a decimal (0.065)", () => {
    const ok = { balance: "40,000", rate: "0.065", firstLoanYear: 2018, newLoanSinceJuly2026: false };
    expect(validateStep(4, ok)).toMatch(/percent/i);
  });

  it("steps 5 and 6 need a choice", () => {
    expect(validateStep(5, {})).not.toBeNull();
    expect(validateStep(5, { employer: "nonprofit" })).toBeNull();
    expect(validateStep(6, {})).not.toBeNull();
    expect(validateStep(6, { currentPlan: "UNKNOWN" })).toBeNull();
  });
});
