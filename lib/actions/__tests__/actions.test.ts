import { describe, it, expect } from "vitest";
import { buildActionPlan, computePlans } from "@/lib/engine";
import { SAMPLE_BORROWERS } from "@/lib/mocks";
import type { ActionItem } from "@/lib/types";

const today = new Date("2026-11-15T12:00:00Z");
const byId = (items: ActionItem[], id: string) => items.find((i) => i.id === id);

describe("buildActionPlan — F2b on SAVE, notice 2026-09-01", () => {
  const items = buildActionPlan(computePlans(SAMPLE_BORROWERS.F2b), today);

  it("SAVE deadline is the notice date + 90 days", () => {
    expect(byId(items, "save-90-day")?.dueDate).toBe("2026-11-30");
  });

  it("apply for the recommended plan within a week, free, with the plan-switch letter as backup", () => {
    const a = byId(items, "apply-recommended");
    expect(a?.dueDate).toBe("2026-11-22");
    expect(a?.title).toBe("Apply for RAP at StudentAid.gov or through your servicer (free)");
    expect(a?.letterTemplateId).toBe("plan_switch");
  });

  it("recertify a year from today", () => {
    expect(byId(items, "recertify")?.dueDate).toBe("2027-11-15");
  });

  it("is sorted by date with undated items last", () => {
    const dated = items.filter((i) => i.dueDate).map((i) => i.dueDate!);
    expect(dated).toEqual([...dated].sort());
    expect(items.at(-1)?.id).toBe("no-new-loans");
    expect(items.at(-1)?.dueDate).toBeUndefined();
  });

  it("never promises forgiveness", () => {
    for (const i of items) {
      const t = i.title.toLowerCase();
      expect(t.includes("forgive") && t.includes("guarantee")).toBe(false);
    }
  });
});

describe("buildActionPlan — conditional items", () => {
  it("F4 (PSLF track, joint): certify employment in 30 days and decide filing status by April 15", () => {
    const items = buildActionPlan(computePlans(SAMPLE_BORROWERS.F4), today);
    expect(byId(items, "pslf-certify")?.dueDate).toBe("2026-12-15");
    expect(byId(items, "filing-status")?.dueDate).toBe("2027-04-15");
  });

  it("before April 15, the filing deadline is this year's", () => {
    const items = buildActionPlan(computePlans(SAMPLE_BORROWERS.F4), new Date("2027-03-01T12:00:00Z"));
    expect(byId(items, "filing-status")?.dueDate).toBe("2027-04-15");
  });

  it("F1 (single, private, not on SAVE) gets only the always-on items and the new-loan caution", () => {
    const ids = buildActionPlan(computePlans(SAMPLE_BORROWERS.F1), today).map((i) => i.id);
    expect(ids).toEqual(["apply-recommended", "recertify", "no-new-loans"]);
  });

  it("a SAVE deadline that already passed says so", () => {
    const c = computePlans({ ...SAMPLE_BORROWERS.F2b, saveNoticeDate: "2026-07-05" });
    const s = byId(buildActionPlan(c, today), "save-90-day");
    expect(s?.dueDate).toBe("2026-10-03");
    expect(s?.title).toMatch(/passed/i);
  });

  it("a malformed SAVE notice date skips the SAVE item instead of crashing", () => {
    const c = computePlans({ ...SAMPLE_BORROWERS.F2b, saveNoticeDate: "09/01/2026" });
    expect(byId(buildActionPlan(c, today), "save-90-day")).toBeUndefined();
  });

  it("no eligible loans: no 'apply' item and no new-loan caution", () => {
    const ids = buildActionPlan(computePlans({ ...SAMPLE_BORROWERS.F1, loans: [] }), today).map((i) => i.id);
    expect(ids).not.toContain("apply-recommended");
    expect(ids).not.toContain("no-new-loans");
  });

  it("F6 (already has a new loan) gets no new-loan caution", () => {
    const ids = buildActionPlan(computePlans(SAMPLE_BORROWERS.F6), today).map((i) => i.id);
    expect(ids).not.toContain("no-new-loans");
  });
});
