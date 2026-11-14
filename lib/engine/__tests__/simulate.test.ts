import { describe, it, expect } from "vitest";
import { rapMonthBenefit, simulate12 } from "@/lib/engine/simulate";

describe("one on-time RAP month", () => {
  it("payment below interest: waives the rest, matches $50 of principal", () => {
    expect(rapMonthBenefit(35000, 0.0653, 150)).toEqual({ interest: 190.46, waived: 40.46, principalPaid: 0, match: 50, principalDrop: 50 });
  });

  it("payment just above interest: tops principal up to $50", () => {
    expect(rapMonthBenefit(40000, 0.065, 229.17)).toEqual({ interest: 216.67, waived: 0, principalPaid: 12.5, match: 37.5, principalDrop: 50 });
  });

  it("$10 minimum payment: match is the whole $10 (WE-7b)", () => {
    expect(rapMonthBenefit(25000, 0.0653, 10)).toMatchObject({ waived: 126.04, match: 10, principalDrop: 10 });
  });
});

describe("12-month balance change", () => {
  it("RAP below interest shrinks $50/month", () => {
    expect(simulate12("RAP", 40000, 0.065, 129.17)).toBe(-600);
  });

  it("RAP just above interest still drops $50/month", () => {
    expect(simulate12("RAP", 40000, 0.065, 229.17)).toBe(-600);
  });

  it("RAP at the $10 minimum shrinks $10/month", () => {
    expect(simulate12("RAP", 25000, 0.0653, 10)).toBe(-120);
  });

  it("IBR below interest grows by the unpaid interest", () => {
    expect(simulate12("IBR", 40000, 0.065, 116.83)).toBe(1198.08);
  });

  it("IBR at $0 grows by a full year of interest", () => {
    expect(simulate12("IBR", 25000, 0.0653, 0)).toBe(1632.48);
  });

  it("10-year Standard pays the balance down", () => {
    expect(simulate12("STANDARD_10", 40000, 0.065, 454.19)).toBe(-2936.75);
  });
});
