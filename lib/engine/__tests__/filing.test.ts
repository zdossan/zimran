import { describe, it, expect } from "vitest";
import { compareFiling } from "@/lib/engine";
import { mfsBracketPenalty } from "@/lib/engine/mfsTax";
import { SAMPLE_BORROWERS } from "@/lib/mocks";
import type { PlanComparison } from "@/lib/types";

const recommendedPay = (c: PlanComparison) => c.results.find((r) => r.plan === c.recommended)!.monthlyPayment;

describe("extra tax from filing separately (bracket method)", () => {
  it("F4: $60k and $90k → $650 (one spouse crosses the 22% threshold)", () => {
    expect(mfsBracketPenalty(60000, 90000)).toBe(650);
  });

  it("equal incomes → $0", () => {
    expect(mfsBracketPenalty(60000, 60000)).toBe(0);
  });

  it("a spouse below the standard deduction wastes part of it", () => {
    // Joint: 37,800 taxable → $4,040. Separate: $0 + 43,900 taxable → $5,020.
    expect(mfsBracketPenalty(10000, 60000)).toBe(980);
  });
});

describe("compareFiling — F4 married teacher", () => {
  const f = compareFiling({ ...SAMPLE_BORROWERS.F4, spouseAgi: 90000 });

  it("joint: IBR at $591.24", () => {
    expect(f.mfj.recommended).toBe("IBR");
    expect(recommendedPay(f.mfj)).toBe(591.24);
  });

  it("separate: RAP at $200.00 on her own $60k with the child on her return", () => {
    expect(f.mfs.recommended).toBe("RAP");
    expect(recommendedPay(f.mfs)).toBe(200);
  });

  it("extra tax $650, net saving $4,044.88 a year", () => {
    expect(f.mfsExtraTaxPerYear).toBe(650);
    expect(f.netAnnualSavingMfs).toBe(4044.88);
  });

  it("lists what a separate return loses", () => {
    expect(f.caveats.length).toBeGreaterThanOrEqual(6);
    expect(f.caveats.join(" ")).toMatch(/community-property/);
  });

  it("uses family size 2 + dependents joint and 1 + dependents separate", () => {
    expect(f.mfj.input.familySize).toBe(3);
    expect(f.mfs.input.familySize).toBe(2);
    expect(f.mfs.input.filingStatus).toBe("mfs");
  });
});
