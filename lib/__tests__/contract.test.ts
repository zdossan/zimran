import { describe, it, expect } from "vitest";
import { computePlans, compareFiling, buildActionPlan } from "@/lib/engine";
import { auditStatement, SAMPLE_IDS } from "@/lib/audit";
import { renderLetter } from "@/lib/letters";
import { isPaidStateBlocked } from "@/lib/supabase/entitlement";
import { SAMPLE_BORROWERS, MOCK_COMPARISON, MOCK_FILING, MOCK_AUDIT, MOCK_ENTITLEMENT } from "@/lib/mocks";
import { formatUSD } from "@/lib/format";

describe("shared contract (stubs + mocks)", () => {
  it("engine stub returns a comparison with all four plans", () => {
    expect(computePlans(SAMPLE_BORROWERS.F2b).results.length).toBe(4);
    expect(MOCK_COMPARISON.recommended).toBe("RAP");
    expect(MOCK_COMPARISON.cheapestMonthly).toBe("IBR");
    expect(MOCK_COMPARISON.rulesAsOf).toBe("2026-11-01");
  });

  it("filing stub and action-plan stub return typed data", () => {
    const f = compareFiling({ ...SAMPLE_BORROWERS.F4, spouseAgi: 90000 });
    expect(f.mfsExtraTaxPerYear).toBe(MOCK_FILING.mfsExtraTaxPerYear);
    expect(Array.isArray(buildActionPlan(MOCK_COMPARISON, new Date("2026-11-15")))).toBe(true);
  });

  it("mock audit carries the RAP subsidy error from the Reddit case", () => {
    expect(MOCK_AUDIT.findings.some((f) => f.expected === 93.21 && f.actual === 53.11)).toBe(true);
    expect(auditStatement(MOCK_AUDIT.extraction).length).toBeGreaterThan(0);
    expect(SAMPLE_IDS).toEqual(["mohela-subsidy-error", "edfinancial-ok", "nelnet-standard-placement"]);
  });

  it("letters stub, entitlement stub and money format behave", () => {
    expect(typeof renderLetter("billing_dispute", { today: new Date() })).toBe("string");
    expect(isPaidStateBlocked("NY")).toBe(true);
    expect(isPaidStateBlocked("TX")).toBe(false);
    expect(MOCK_ENTITLEMENT.pro).toBe(false);
    expect(formatUSD(1234.5)).toBe("$1,234.50");
  });
});
