import { describe, it, expect } from "vitest";
import { auditStatement } from "@/lib/audit";
import { SAMPLE_EXTRACTIONS } from "@/lib/audit/samples";
import { SAMPLE_BORROWERS } from "@/lib/mocks";
import type { AuditFinding } from "@/lib/types";

const byId = (fs: AuditFinding[], id: string) => fs.find((f) => f.id === id);

describe("auditStatement — MOHELA subsidy error sample", () => {
  const fs = auditStatement(SAMPLE_EXTRACTIONS["mohela-subsidy-error"]);

  it("flags the RAP interest subsidy shortfall ($93.21 expected, $53.11 applied)", () => {
    const f = byId(fs, "rap-subsidy");
    expect(f?.severity).toBe("error");
    expect(f?.expected).toBe(93.21);
    expect(f?.actual).toBe(53.11);
    expect(f?.ruleRef).toBe("34 CFR 685.209(h)(4)");
    expect(f?.letterTemplateId).toBe("billing_dispute");
    expect(f?.detail).toContain("on-time");
  });

  it("confirms the principal match ($50) was applied", () => {
    const f = byId(fs, "rap-match");
    expect(f?.severity).toBe("ok");
    expect(f?.expected).toBe(50);
    expect(f?.actual).toBe(50);
  });

  it("accepts a statement sent 28 days before the due date", () => {
    expect(byId(fs, "notice-21-day")?.severity).toBe("ok");
  });

  it("checks that the payment split adds up", () => {
    expect(byId(fs, "payment-split")?.severity).toBe("ok");
  });
});

describe("auditStatement — EdFinancial clean sample", () => {
  const fs = auditStatement(SAMPLE_EXTRACTIONS["edfinancial-ok"]);

  it("finds nothing wrong", () => {
    expect(fs.filter((f) => f.severity !== "ok")).toEqual([]);
  });

  it("expects a $37.50 principal match when $12.50 went to principal", () => {
    expect(byId(fs, "rap-match")?.expected).toBe(37.5);
    expect(byId(fs, "rap-subsidy")?.expected).toBe(0);
  });
});

describe("auditStatement — Nelnet placed on Standard", () => {
  const input = { ...SAMPLE_BORROWERS.F2a, currentPlan: "SAVE" as const };
  const fs = auditStatement(SAMPLE_EXTRACTIONS["nelnet-standard-placement"], input);

  it("flags a possible move to the Standard plan", () => {
    const f = byId(fs, "plan-placement");
    expect(f?.severity).toBe("error");
    expect(f?.letterTemplateId).toBe("plan_switch");
    expect(f?.ruleRef).toBe("34 CFR 685.210");
  });

  it("warns that the statement came only 12 days before the due date", () => {
    expect(byId(fs, "notice-21-day")?.severity).toBe("warn");
  });

  it.todo("compares the bill to the RAP formula ($229.17 expected vs $454.19) once P1's engine is merged");
});

describe("auditStatement — missing data never reports a false ok", () => {
  it("says there is not enough data when monthly interest is missing", () => {
    const x = { ...SAMPLE_EXTRACTIONS["mohela-subsidy-error"], monthlyInterestAccrued: undefined };
    const f = byId(auditStatement(x), "rap-subsidy");
    expect(f?.severity).toBe("warn");
    expect(f?.title.startsWith("Not enough data")).toBe(true);
  });

  it("says there is not enough data when the last payment split is missing", () => {
    const x = { ...SAMPLE_EXTRACTIONS["mohela-subsidy-error"], lastPayment: undefined };
    const f = byId(auditStatement(x), "payment-split");
    expect(f?.severity).toBe("warn");
    expect(f?.title.startsWith("Not enough data")).toBe(true);
  });

  it("tolerates a one-cent rounding difference", () => {
    const base = SAMPLE_EXTRACTIONS["mohela-subsidy-error"];
    const x = { ...base, lastPayment: { ...base.lastPayment!, subsidyApplied: 93.2 } };
    expect(byId(auditStatement(x), "rap-subsidy")?.severity).toBe("ok");
  });

  it("a RAP statement that doesn't print a subsidy line gets 'check this', not a possible error", () => {
    const base = SAMPLE_EXTRACTIONS["mohela-subsidy-error"];
    const x = { ...base, planName: "RAP", lastPayment: { ...base.lastPayment!, subsidyApplied: undefined, matchApplied: undefined } };
    const fs = auditStatement(x);
    expect(byId(fs, "rap-subsidy")?.severity).toBe("warn");
    expect(byId(fs, "rap-subsidy")?.expected).toBe(93.21);
    expect(byId(fs, "rap-match")?.severity).toBe("warn");
  });

  it("doesn't judge a payment the model was unsure it read", () => {
    const base = SAMPLE_EXTRACTIONS["mohela-subsidy-error"];
    const x = { ...base, fieldConfidence: { ...base.fieldConfidence, lastPayment: 0.2 } };
    const fs = auditStatement(x);
    for (const id of ["rap-subsidy", "rap-match", "payment-split"]) {
      expect(byId(fs, id)?.severity).toBe("warn");
      expect(byId(fs, id)?.title.startsWith("Not enough data")).toBe(true);
    }
  });

  it("doesn't compare an amount due the model was unsure it read", () => {
    const base = SAMPLE_EXTRACTIONS["mohela-subsidy-error"];
    const x = { ...base, fieldConfidence: { ...base.fieldConfidence, amountDue: 0.3 } };
    const f = byId(auditStatement(x, SAMPLE_BORROWERS.F2a), "payment-vs-formula");
    expect(f?.title.startsWith("Not enough data")).toBe(true);
  });
});

describe("auditStatement — plan names as servicers print them", () => {
  const nelnet = SAMPLE_EXTRACTIONS["nelnet-standard-placement"];

  it("recognises 'Standard Repayment Plan' as Standard", () => {
    const x = { ...nelnet, planName: "Standard Repayment Plan" };
    expect(byId(auditStatement(x, { ...SAMPLE_BORROWERS.F2a, currentPlan: "SAVE" }), "plan-placement")?.severity).toBe("error");
  });

  it("recognises 'Repayment Assistance Plan' as RAP", () => {
    const base = SAMPLE_EXTRACTIONS["mohela-subsidy-error"];
    const x = { ...base, planName: "Repayment Assistance Plan", lastPayment: { ...base.lastPayment!, subsidyApplied: undefined, matchApplied: undefined } };
    expect(byId(auditStatement(x), "rap-subsidy")).toBeDefined();
  });

  it("doesn't compare an 'Income-Based Repayment' bill to the RAP formula", () => {
    const x = { ...nelnet, planName: "Income-Based Repayment" };
    expect(byId(auditStatement(x, SAMPLE_BORROWERS.F2a), "payment-vs-formula")).toBeUndefined();
  });

  it("doesn't compare a Standard bill to RAP when the borrower chose Standard", () => {
    const fs = auditStatement(nelnet, { ...SAMPLE_BORROWERS.F2a, currentPlan: "STANDARD" });
    expect(byId(fs, "payment-vs-formula")).toBeUndefined();
  });
});
