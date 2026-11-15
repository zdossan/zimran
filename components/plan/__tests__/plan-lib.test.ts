// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import type { ActionItem, AuditResult } from "@/lib/types";
import { buildActionPlan, computePlans } from "@/lib/engine";
import { SAMPLE_BORROWERS } from "@/lib/mocks";
import { auditStatement } from "@/lib/audit";
import { SAMPLE_EXTRACTIONS } from "@/lib/audit/samples";
import { RULES_AS_OF } from "@/lib/types";
import { buildIcs } from "@/components/plan/ics";
import { HOW_TO } from "@/components/plan/howTo";
import { auditSummary, loadAuditHistory, loadDone, loadPayments, recordAudit, saveDone, savePayments } from "@/components/plan/progress";

const NOW = new Date("2026-11-15T12:00:00Z");
const ACTIONS: ActionItem[] = [
  { id: "apply-recommended", dueDate: "2026-11-22", title: "Apply for RAP, free", detail: "Applying is free; really.", letterTemplateId: "plan_switch" },
  { id: "save-90-day", dueDate: "2026-11-30", title: "SAVE deadline: choose your new plan", detail: "Choose within 90 days." },
  { id: "no-new-loans", title: "Avoid new federal loans or consolidation", detail: "A new loan limits your options." },
];

describe("buildIcs (calendar reminders)", () => {
  const ics = buildIcs(ACTIONS, NOW);
  const lines = ics.split("\r\n");

  it("is a calendar with one all-day event per dated step, and none for undated ones", () => {
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261122");
    expect(ics).toContain("DTEND;VALUE=DATE:20261123");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261130");
    expect(ics).not.toContain("Avoid new federal loans");
  });

  it("reminds a week before and the day before each step", () => {
    const deadline = ics.slice(ics.indexOf("DTSTART;VALUE=DATE:20261130"));
    expect(deadline.indexOf("TRIGGER:-P7D")).toBeGreaterThan(0);
    expect(deadline.indexOf("TRIGGER:-P1D")).toBeGreaterThan(0);
  });

  it("adds a monthly 'check your statement' reminder for the next 12 months", () => {
    expect(ics).toContain("SUMMARY:Check this month's student loan statement");
    expect(ics).toContain("RRULE:FREQ=MONTHLY;COUNT=12");
  });

  it("escapes text and keeps every line within 75 characters, with CRLF line ends", () => {
    expect(ics).toContain("SUMMARY:Apply for RAP\\, free");
    expect(ics).toContain("Applying is free\\; really.");
    expect(ics).not.toMatch(/[^\r]\n/);
    for (const l of lines) expect(l.length).toBeLessThanOrEqual(75);
  });
});

describe("HOW_TO", () => {
  it("has step-by-step instructions for every step the plan can produce", () => {
    const ids = new Set<string>();
    for (const b of Object.values(SAMPLE_BORROWERS)) {
      for (const a of buildActionPlan(computePlans({ ...b, filingStatus: b.filingStatus, currentPlan: "SAVE", saveNoticeDate: "2026-09-01" }), NOW)) ids.add(a.id);
    }
    ids.add("no-new-loans");
    for (const id of ids) {
      expect(HOW_TO[id]?.steps.length, id).toBeGreaterThan(1);
    }
  });

  it("never asks for an FSA ID or password, and points to the free official site", () => {
    const text = JSON.stringify(HOW_TO).toLowerCase();
    expect(text).toContain("studentaid.gov");
    expect(text).not.toMatch(/(give|send|share|enter) (us )?your fsa id/);
  });
});

describe("progress storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("remembers which steps are done", () => {
    expect(loadDone()).toEqual([]);
    saveDone(["apply-recommended"]);
    expect(loadDone()).toEqual(["apply-recommended"]);
  });

  it("remembers the qualifying payment count, clamped to sensible numbers", () => {
    expect(loadPayments()).toBeNull();
    savePayments(37);
    expect(loadPayments()).toBe(37);
    window.localStorage.setItem("slg_plan_payments", "\"junk\"");
    expect(loadPayments()).toBeNull();
  });

  it("summarises a statement check: possible errors and the money they add up to", () => {
    const mohela = SAMPLE_EXTRACTIONS["mohela-subsidy-error"];
    const result: AuditResult = { extraction: { ...mohela, isSample: false }, findings: auditStatement(mohela), rulesAsOf: RULES_AS_OF };
    const s = auditSummary(result, NOW);
    expect(s).toMatchObject({ checkedOn: "2026-11-15", errors: 1, found: 40.1 });
  });

  it("records real statement checks, newest first, but never sample statements", () => {
    const mohela = SAMPLE_EXTRACTIONS["mohela-subsidy-error"];
    const real: AuditResult = { extraction: { ...mohela, isSample: false }, findings: auditStatement(mohela), rulesAsOf: RULES_AS_OF };
    const sample: AuditResult = { extraction: { ...mohela, isSample: true }, findings: auditStatement(mohela), rulesAsOf: RULES_AS_OF };
    recordAudit(sample, NOW);
    expect(loadAuditHistory()).toEqual([]);
    recordAudit(real, NOW);
    recordAudit(real, new Date("2026-12-15T12:00:00Z"));
    expect(loadAuditHistory().map((h) => h.checkedOn)).toEqual(["2026-12-15", "2026-11-15"]);
  });

  it("junk in storage reads as empty, not a crash", () => {
    window.localStorage.setItem("slg_audit_history", "{not json");
    window.localStorage.setItem("slg_plan_done", "42");
    expect(loadAuditHistory()).toEqual([]);
    expect(loadDone()).toEqual([]);
  });
});
