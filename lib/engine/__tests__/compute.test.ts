import { describe, it, expect } from "vitest";
import { computePlans } from "@/lib/engine";
import { recommend } from "@/lib/engine/recommend";
import { SAMPLE_BORROWERS } from "@/lib/mocks";
import type { BorrowerInput, PlanComparison, PlanId, PlanResult } from "@/lib/types";

const PLANS: PlanId[] = ["RAP", "IBR", "STANDARD_10", "TIERED"];
const pays = (c: PlanComparison) =>
  PLANS.map((p) => {
    const r = c.results.find((x) => x.plan === p)!;
    return r.available ? r.monthlyPayment : null;
  });
const warningIds = (c: PlanComparison) => c.warnings.map((w) => w.id);

type Row = [keyof typeof SAMPLE_BORROWERS, (number | null)[], PlanId, PlanId];
const TABLE: Row[] = [
  ["F1", [150, 175.5, 397.95, null], "RAP", "RAP"],
  ["F2a", [229.17, 258.83, 454.19, null], "RAP", "RAP"],
  ["F2b", [129.17, 116.83, 454.19, null], "IBR", "RAP"],
  ["F3a", [229.17, 388.25, 454.19, null], "RAP", "RAP"],
  ["F3b", [129.17, 175.25, 454.19, null], "RAP", "RAP"],
  ["F4", [1200, 591.24, 591.24, null], "IBR", "IBR"],
  ["F5", [10, 0, 284.25, null], "IBR", "RAP"],
  ["F6", [466.67, null, null, 659], "RAP", "RAP"],
];

describe("computePlans — test borrowers F1–F6 (engine_fixtures.py part B)", () => {
  for (const [id, want, cheapest, recommended] of TABLE) {
    it(`${id}: payments ${JSON.stringify(want)}, cheapest ${cheapest}, recommended ${recommended}`, () => {
      const c = computePlans(SAMPLE_BORROWERS[id]);
      expect(pays(c)).toEqual(want);
      expect(c.cheapestMonthly).toBe(cheapest);
      expect(c.recommended).toBe(recommended);
      expect(c.rulesAsOf).toBe("2026-11-01");
      for (const r of c.results) expect(r.ruleRefs.length).toBeGreaterThan(0);
      expect(c.reason.length).toBeGreaterThan(0);
    });
  }

  it("F2b: IBR is cheapest but grows the balance, so RAP is recommended with a balance-grows warning", () => {
    const c = computePlans(SAMPLE_BORROWERS.F2b);
    expect(warningIds(c)).toContain("balance-grows");
    expect(c.reason).toContain("IBR");
    expect(c.reason).toContain("RAP");
    expect(c.bestFor12mBalance).toBe("STANDARD_10");
    const rap = c.results.find((r) => r.plan === "RAP")!;
    expect(rap.firstMonth).toEqual({ interest: 216.67, waived: 87.5, principalPaid: 0, match: 50, principalDrop: 50 });
    expect(rap.balanceChange12m).toBe(-600);
    expect(c.results.find((r) => r.plan === "IBR")!.balanceChange12m).toBe(1198.08);
  });

  it("F2b on SAVE gets the SAVE deadline (notice + 90 days) and the new-loan warning", () => {
    const c = computePlans(SAMPLE_BORROWERS.F2b);
    const save = c.warnings.find((w) => w.id === "save-deadline");
    expect(save?.severity).toBe("danger");
    expect(save?.title).toContain("Nov 30, 2026");
    expect(warningIds(c)).toContain("new-loan-kills-ibr");
  });

  it("F4 joint on a PSLF track: IBR ties the 10-year Standard and wins the tie-break", () => {
    const c = computePlans(SAMPLE_BORROWERS.F4);
    expect(c.pslfTrack).toBe(true);
    expect(c.reason).toContain("PSLF");
  });

  it("F6: a new loan removes IBR and 10-year Standard, opens Tiered, and warns Tiered isn't PSLF", () => {
    const c = computePlans(SAMPLE_BORROWERS.F6);
    const ibr = c.results.find((r) => r.plan === "IBR")!;
    expect(ibr.unavailableReason).toBe("A loan made on or after July 1, 2026 limits you to RAP or Tiered Standard");
    expect(c.results.find((r) => r.plan === "TIERED")!.pslfQualifying).toBe(false);
    expect(warningIds(c)).toContain("tiered-not-pslf");
    expect(warningIds(c)).not.toContain("new-loan-kills-ibr");
  });

  it("without a new loan, Tiered is unavailable with the plan's reason", () => {
    const t = computePlans(SAMPLE_BORROWERS.F1).results.find((r) => r.plan === "TIERED")!;
    expect(t.available).toBe(false);
    expect(t.unavailableReason).toBe("Only for borrowers with a loan made on or after July 1, 2026");
  });
});

describe("computePlans — edges", () => {
  const f1 = SAMPLE_BORROWERS.F1;

  it("a loan disbursed exactly on 2026-07-01 counts as new", () => {
    const c = computePlans({ ...f1, loans: [{ ...f1.loans[0], disbursedOn: "2026-07-01" }] });
    expect(pays(c)[1]).toBeNull();
    expect(pays(c)[3]).not.toBeNull();
  });

  it("a joint filer whose spouse also has eligible loans pays their balance share", () => {
    const c = computePlans({ ...SAMPLE_BORROWERS.F4, spouseEligibleBalance: 52000 });
    expect(pays(c)[0]).toBe(600);
  });

  it("pools several loans: total balance, balance-weighted rate", () => {
    const input: BorrowerInput = {
      ...f1,
      loans: [
        { id: "a", type: "sub", balance: 20000, rate: 0.05, disbursedOn: "2016-09-01" },
        { id: "b", type: "unsub", balance: 20000, rate: 0.08, disbursedOn: "2017-09-01" },
      ],
    };
    const rap = computePlans(input).results.find((r) => r.plan === "RAP")!;
    expect(rap.firstMonth?.interest).toBe(216.67); // 40,000 × 6.5% / 12
  });

  it("leaves Parent PLUS loans out with a warning", () => {
    const c = computePlans({ ...f1, loans: [...f1.loans, { id: "pp", type: "parentplus", balance: 30000, rate: 0.09, disbursedOn: "2018-09-01" }] });
    expect(pays(c)[2]).toBe(397.95);
    expect(warningIds(c)).toContain("parent-plus-unsupported");
  });

  it("warns that Alaska and Hawaii poverty lines are approximated", () => {
    expect(warningIds(computePlans({ ...f1, state: "AK" }))).toContain("ak-hi-approx");
    expect(warningIds(computePlans(f1))).not.toContain("ak-hi-approx");
  });

  it("always notes that RAP/IBR forgiveness is taxable", () => {
    expect(warningIds(computePlans(f1))).toContain("idr-forgiveness-taxable");
  });

  it("Parent PLUS only: no plan is offered, and the reason and a warning say so", () => {
    const c = computePlans({ ...f1, loans: [{ id: "pp", type: "parentplus", balance: 30000, rate: 0.09, disbursedOn: "2018-09-01" }] });
    expect(c.results.every((r) => !r.available)).toBe(true);
    expect(c.results[0].unavailableReason).toBe("None of your loans are covered by this comparison");
    expect(c.warnings.find((w) => w.id === "no-eligible-loans")?.severity).toBe("danger");
    expect(warningIds(c)).not.toContain("new-loan-kills-ibr");
    expect(c.reason).toMatch(/can't compare/i);
  });

  it("no loans at all: no plan is offered", () => {
    expect(computePlans({ ...f1, loans: [] }).results.every((r) => !r.available)).toBe(true);
  });

  it("a malformed SAVE notice date doesn't crash; the deadline warning loses its date", () => {
    const c = computePlans({ ...SAMPLE_BORROWERS.F2b, saveNoticeDate: "09/01/2026" });
    expect(c.warnings.find((w) => w.id === "save-deadline")?.title).toBe("Choose a new plan before your SAVE deadline");
  });

  it("a blank (NaN) income is treated as $0", () => {
    const c = computePlans({ ...f1, agi: Number.NaN });
    expect(pays(c)[0]).toBe(10);
    for (const r of c.results) expect(Number.isNaN(r.monthlyPayment)).toBe(false);
    expect(c.recommended).toBe("RAP"); // $10 shrinks the balance; IBR at $0 grows it
  });

  it("negative dependents count as none", () => {
    expect(pays(computePlans({ ...f1, dependents: -2 }))[0]).toBe(150);
  });

  it("a borrower on Standard still gets the new-loan caution while IBR is open", () => {
    expect(warningIds(computePlans({ ...f1, currentPlan: "STANDARD" }))).toContain("new-loan-kills-ibr");
  });

  it("on a PSLF track, a recommended plan that grows the balance gets an info note", () => {
    const c = computePlans({ ...SAMPLE_BORROWERS.F2b, employer: "nonprofit" });
    expect(c.recommended).toBe("IBR");
    expect(c.warnings.find((w) => w.id === "balance-grows")?.severity).toBe("info");
  });

  it("F6 first RAP month: interest rounded to the cent, then the waiver", () => {
    const rap = computePlans(SAMPLE_BORROWERS.F6).results.find((r) => r.plan === "RAP")!;
    expect(rap.firstMonth).toEqual({ interest: 495.83, waived: 29.16, principalPaid: 0, match: 50, principalDrop: 50 });
  });
});

describe("recommend — rules the test borrowers don't reach", () => {
  const plan = (p: PlanId, monthlyPayment: number, balanceChange12m: number, pslfQualifying = true): PlanResult => ({
    plan: p, available: true, monthlyPayment, balanceChange12m, pslfQualifying, ruleRefs: ["x"], notes: [],
  });

  it("when every plan grows the balance, picks the lowest payment and adds a danger warning", () => {
    const r = recommend([plan("RAP", 100, 50), plan("IBR", 90, 300)], false);
    expect(r.recommended).toBe("IBR");
    expect(r.warnings.find((w) => w.id === "balance-grows")?.severity).toBe("danger");
  });

  it("payments within $1 prefer the plan that shrinks the balance more", () => {
    const r = recommend([plan("RAP", 200.5, -600), plan("IBR", 200, -100)], false);
    expect(r.recommended).toBe("RAP");
  });

  it("with no available plan, doesn't throw and says it can't compare", () => {
    const r = recommend([{ ...plan("RAP", 0, 0), available: false }], false);
    expect(r.reason).toMatch(/can't compare/i);
  });

  it("on a PSLF track never recommends Tiered", () => {
    const r = recommend([plan("RAP", 466.67, -600), plan("TIERED", 300, -2000, false)], true);
    expect(r.recommended).toBe("RAP");
  });
});
