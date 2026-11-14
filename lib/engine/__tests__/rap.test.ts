import { describe, it, expect } from "vitest";
import { rapMonthly, rapRate } from "@/lib/engine/rap";
import { FPL_2026, MFS_BRACKETS_2026, MFS_STD_DEDUCTION_2026, RULES_AS_OF } from "@/lib/config/rules";

describe("RAP monthly payment — published checks (engine_fixtures.py part A)", () => {
  const cases: [string, number, number, number | undefined, number | undefined, number][] = [
    ["WE-1 joint AGI 55k (FR: $229)", 55000, 0, undefined, undefined, 229.17],
    ["WE-1 joint, prorated 20k/20k", 55000, 0, 20000, 20000, 114.58],
    ["WE-1 separate AGI 27.5k (FR: $46)", 27500, 0, undefined, undefined, 45.83],
    ["WE-2 single 45k (ED: $150)", 45000, 0, undefined, undefined, 150],
    ["WE-5a 95k (FSA: $712.50)", 95000, 0, undefined, undefined, 712.5],
    ["WE-5b 65k, 2 dependents (FSA: $225)", 65000, 2, undefined, undefined, 225],
    ["WE-5c 25k, 1 dependent (FSA: $10)", 25000, 1, undefined, undefined, 10],
    ["CRS single 1 dep 80k ($417)", 80000, 1, undefined, undefined, 416.67],
    ["CRS married 1 dep 150k ($1,200)", 150000, 1, undefined, undefined, 1200],
  ];
  for (const [label, agi, deps, own, spouse, want] of cases) {
    it(label, () => {
      expect(rapMonthly(agi, deps, own, spouse)).toBe(want);
    });
  }
});

describe("RAP monthly payment — edges", () => {
  it("AGI exactly $50,000.00 uses the 4% band", () => {
    expect(rapMonthly(50000, 0)).toBe(166.67);
  });

  it("AGI $50,000.01 uses the 5% band", () => {
    expect(rapMonthly(50000.01, 0)).toBe(208.33);
  });

  it("AGI $0 pays the $10 minimum", () => {
    expect(rapMonthly(0, 0)).toBe(10);
  });

  it("a negative AGI is treated as $0", () => {
    expect(rapMonthly(-5, 0)).toBe(10);
  });

  it("so many dependents the payment would go negative floors at $10", () => {
    expect(rapMonthly(30000, 9)).toBe(10);
  });

  it("proration applies the $10 floor again", () => {
    expect(rapMonthly(25000, 1, 1000, 99000)).toBe(10);
  });

  it("band rate: flat $120/yr up to $10k, whole-AGI band above", () => {
    expect(rapRate(10000)).toBeNull();
    expect(rapRate(10000.01)).toBe(0.01);
    expect(rapRate(100000)).toBe(0.09);
    expect(rapRate(100000.01)).toBe(0.1);
  });
});

describe("rule constants", () => {
  it("2026 poverty line, separate-return deduction and rules date", () => {
    expect(FPL_2026).toEqual({ base: 15960, step: 5680 });
    expect(MFS_STD_DEDUCTION_2026).toBe(16100);
    expect(MFS_BRACKETS_2026.map((b) => b.threshold)).toEqual([0, 12400, 50400, 105700, 201775, 256225, 384350]);
    expect(RULES_AS_OF).toBe("2026-11-01");
  });
});
