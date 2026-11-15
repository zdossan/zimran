import { describe, it, expect } from "vitest";
import type { ActionItem } from "@/lib/types";
import { MOCK_COMPARISON } from "@/lib/mocks";
import { dashboardSummary } from "@/components/plan/dashboard";
import type { AuditEntry } from "@/components/plan/progress";
import type { Dispute } from "@/components/plan/disputes";

const NOW = new Date("2026-11-15T12:00:00Z");
const ACTIONS: ActionItem[] = [
  { id: "apply-recommended", dueDate: "2026-11-22", title: "Apply for RAP", detail: "" },
  { id: "save-90-day", dueDate: "2026-11-30", title: "SAVE deadline", detail: "" },
  { id: "no-new-loans", title: "Avoid new loans", detail: "" },
];
const base = { comparison: MOCK_COMPARISON, actions: ACTIONS, history: [] as AuditEntry[], disputes: [] as Dispute[], done: [] as string[], payments: null as number | null, now: NOW };

describe("dashboardSummary", () => {
  it("with only your answers: balance and an estimated payment on the recommended plan", () => {
    const s = dashboardSummary(base);
    expect(s.balance).toMatchObject({ amount: 40000, source: "answers" });
    expect(s.payment).toMatchObject({ amount: 129.17, source: "estimate", plan: "RAP" });
    expect(s.payment.dueDate).toBeUndefined();
    expect(s.lastChecked).toBeUndefined();
  });

  it("after a statement check: the statement's balance, amount due and due date win", () => {
    const history: AuditEntry[] = [{ checkedOn: "2026-11-10", servicer: "MOHELA", errors: 0, warnings: 0, found: 0, balance: 39850.12, amountDue: 131.4, dueDate: "2026-12-01", statementDate: "2026-11-03" }];
    const s = dashboardSummary({ ...base, history });
    expect(s.balance).toMatchObject({ amount: 39850.12, source: "statement", asOf: "2026-11-03" });
    expect(s.balance.change).toBeCloseTo(-149.88, 2); // vs your answers
    expect(s.payment).toMatchObject({ amount: 131.4, source: "statement", dueDate: "2026-12-01" });
    expect(s.lastChecked).toBe("2026-11-10");
  });

  it("with two statements, the balance change is since the first one", () => {
    const history: AuditEntry[] = [
      { checkedOn: "2026-12-10", errors: 0, warnings: 0, found: 0, balance: 39700, amountDue: 131.4, dueDate: "2027-01-01", statementDate: "2026-12-03" },
      { checkedOn: "2026-11-10", errors: 0, warnings: 0, found: 0, balance: 39850, amountDue: 131.4, dueDate: "2026-12-01", statementDate: "2026-11-03" },
    ];
    expect(dashboardSummary({ ...base, history }).balance.change).toBe(-150);
  });

  it("the next deadline is the first dated step not ticked done", () => {
    expect(dashboardSummary(base).nextDeadline?.id).toBe("apply-recommended");
    expect(dashboardSummary({ ...base, done: ["apply-recommended"] }).nextDeadline?.id).toBe("save-90-day");
  });

  it("adds up money recovered and counts open disputes", () => {
    const disputes: Dispute[] = [
      { id: "a", title: "x", sentOn: "2026-10-01", status: "fixed", recovered: 40.1 },
      { id: "b", title: "y", sentOn: "2026-11-01", status: "sent" },
    ];
    expect(dashboardSummary({ ...base, disputes })).toMatchObject({ recovered: 40.1, openDisputes: 1 });
  });

  it("shows progress toward forgiveness once a payment count is entered (RAP: 360)", () => {
    expect(dashboardSummary(base).progress).toBeUndefined();
    expect(dashboardSummary({ ...base, payments: 24 }).progress).toEqual({ made: 24, target: 360, label: "toward forgiveness" });
  });
});
