import { describe, it, expect } from "vitest";
import { fpl, ibrMonthly } from "@/lib/engine/ibr";
import { amortize, standard10, tieredStandard, tieredTermMonths } from "@/lib/engine/amortize";

// CRS R48727 Table 4 uses the 2025 poverty line.
const fpl2025 = (n: number) => 15650 + 5500 * (n - 1);

describe("poverty line", () => {
  it("2026, 48 states + DC: $15,960 + $5,680 per extra person", () => {
    expect(fpl(1)).toBe(15960);
    expect(fpl(3)).toBe(27320);
  });
});

describe("IBR monthly payment", () => {
  it("WE-2 single 45k, 10% (ED: $176)", () => {
    expect(ibrMonthly(45000, 1, false, null)).toBe(175.5);
  });

  it("CRS single 50k new borrower 10% ($221, 2025 poverty line)", () => {
    expect(Math.round(ibrMonthly(50000, 1, false, null, undefined, undefined, fpl2025))).toBe(221);
  });

  it("CRS single 50k original IBR 15% ($332, 2025 poverty line)", () => {
    expect(Math.round(ibrMonthly(50000, 1, true, null, undefined, undefined, fpl2025))).toBe(332);
  });

  it("CRS married 1 dependent 100k new borrower ($500, 2025 poverty line)", () => {
    expect(Math.round(ibrMonthly(100000, 3, false, null, undefined, undefined, fpl2025))).toBe(500);
  });

  it("is capped at the given 10-year Standard payment", () => {
    expect(ibrMonthly(150000, 3, true, 591.24)).toBe(591.24);
  });

  it("prorates by the borrower's share of the couple's eligible balance", () => {
    expect(ibrMonthly(45000, 1, false, null, 20000, 20000)).toBe(87.75);
  });

  it("a result under $5 becomes $0", () => {
    expect(ibrMonthly(100000, 1, false, 4.99)).toBe(0);
  });

  it("a result of $5 up to $10 becomes $10", () => {
    expect(ibrMonthly(100000, 1, false, 5)).toBe(10);
    expect(ibrMonthly(100000, 1, false, 9.99)).toBe(10);
  });

  it("income under 150% of the poverty line pays $0", () => {
    expect(ibrMonthly(12000, 2, false, null)).toBe(0);
  });
});

describe("amortization, 10-year Standard and Tiered Standard", () => {
  it("WE-10 amortizer: $10,000 at 6% over 144 months (ED: $97.59)", () => {
    expect(amortize(10000, 0.06, 144)).toBe(97.59);
  });

  it("a 0% loan is principal divided by months", () => {
    expect(amortize(1200, 0, 120)).toBe(10);
  });

  it("WE-3 10-year Standard on $30,000 (ED: $341)", () => {
    expect(Math.abs(standard10(30000, 0.0653) - 341)).toBeLessThanOrEqual(0.5);
  });

  it("10-year Standard has a $50 minimum", () => {
    expect(standard10(1000, 0.05)).toBe(50);
  });

  it("WE-3 Tiered Standard 15-year on $30,000 (ED: $262)", () => {
    expect(Math.abs(tieredStandard(30000, 0.0653) - 262)).toBeLessThanOrEqual(0.5);
  });

  it("Tiered term by total balance: <25k 10y, <50k 15y, <100k 20y, else 25y", () => {
    expect(tieredTermMonths(24999.99)).toBe(120);
    expect(tieredTermMonths(25000)).toBe(180);
    expect(tieredTermMonths(99999)).toBe(240);
    expect(tieredTermMonths(100000)).toBe(300);
  });

  it("Tiered Standard on $85,000 at 7% (20 years) is $659.00", () => {
    expect(tieredStandard(85000, 0.07)).toBe(659);
  });
});
