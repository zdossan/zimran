import { describe, it, expect } from "vitest";
import { renderLetter } from "@/lib/letters";
import { auditStatement } from "@/lib/audit";
import { SAMPLE_EXTRACTIONS } from "@/lib/audit/samples";
import { MOCK_COMPARISON } from "@/lib/mocks";
import type { LetterTemplateId } from "@/lib/types";

const today = new Date("2026-11-15T12:00:00Z");
const subsidy = auditStatement(SAMPLE_EXTRACTIONS["mohela-subsidy-error"]).find((f) => f.id === "rap-subsidy")!;
const IDS: LetterTemplateId[] = ["billing_dispute", "plan_switch", "cfpb_complaint"];

describe("letters", () => {
  it("the billing dispute quotes the finding, the amounts and the rule", () => {
    const t = renderLetter("billing_dispute", { finding: subsidy, servicer: "MOHELA (SAMPLE)", today });
    expect(t).toContain("$93.21");
    expect(t).toContain("$53.11");
    expect(t).toContain("34 CFR 685.209(h)(4)");
    expect(t).toContain("within 30 days");
  });

  it("the billing dispute speaks to the servicer in the borrower's own voice", () => {
    const t = renderLetter("billing_dispute", { finding: subsidy, servicer: "MOHELA (SAMPLE)", today });
    expect(t).toContain("My statement shows a RAP interest subsidy of $53.11");
    expect(t).toContain("I calculate $93.21");
    expect(t).not.toContain("Your RAP");
    expect(t).not.toMatch(/your payment didn't cover|This check assumes/);
  });

  it("the plan switch letter names the recommended plan and the free application", () => {
    const t = renderLetter("plan_switch", { comparison: MOCK_COMPARISON, servicer: "Nelnet", today });
    expect(t).toContain("Repayment Assistance Plan (RAP)");
    expect(t).toContain("StudentAid.gov");
  });

  for (const id of IDS) {
    it(`${id}: starts with the template disclaimer and has fill-in blanks`, () => {
      const t = renderLetter(id, { finding: subsidy, comparison: MOCK_COMPARISON, today });
      expect(t.startsWith("Template only.")).toBe(true);
      expect(t).toContain("[YOUR NAME]");
      expect(t).toContain("[ACCOUNT NUMBER — last 4 digits only]");
      expect(t).toContain("November 15, 2026");
    });

    it(`${id}: never asks for a password or FSA ID beyond the warning line`, () => {
      const t = renderLetter(id, { finding: subsidy, comparison: MOCK_COMPARISON, today });
      const withoutWarning = t.replace("Do not include your FSA ID password", "");
      expect(withoutWarning.toLowerCase()).not.toContain("password");
      expect(withoutWarning).not.toContain("FSA ID");
    });
  }
});
