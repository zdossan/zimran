import { describe, it, expect } from "vitest";
import { buildGuardianReport } from "@/lib/audit/report";
import { auditStatement } from "@/lib/audit";
import { SAMPLE_EXTRACTIONS } from "@/lib/audit/samples";
import { MOCK_ACTIONS, MOCK_AUDIT } from "@/lib/mocks";
import { RULES_AS_OF } from "@/lib/types";

const head = (b: Uint8Array) => new TextDecoder("latin1").decode(b.subarray(0, 4));

describe("Owen report PDF", () => {
  it("renders a PDF for the mock audit", async () => {
    const bytes = await buildGuardianReport(MOCK_AUDIT);
    expect(head(bytes)).toBe("%PDF");
    expect(bytes.length).toBeGreaterThan(1000);
  });

  it("renders a PDF for a real audit with next steps", async () => {
    const x = SAMPLE_EXTRACTIONS["mohela-subsidy-error"];
    const audit = { extraction: x, findings: auditStatement(x), rulesAsOf: RULES_AS_OF };
    const bytes = await buildGuardianReport(audit, MOCK_ACTIONS);
    expect(head(bytes)).toBe("%PDF");
    expect(bytes.length).toBeGreaterThan(1000);
  });

  it("does not crash on very long finding text", async () => {
    const long = { ...MOCK_AUDIT, findings: [{ ...MOCK_AUDIT.findings[0], detail: "word ".repeat(400) }] };
    const bytes = await buildGuardianReport(long);
    expect(head(bytes)).toBe("%PDF");
  });
});
