// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { MOCK_COMPARISON, SAMPLE_BORROWERS } from "@/lib/mocks";
import { computePlans } from "@/lib/engine";
import { followUpLetter, newDispute, nextStep, totalRecovered, type Dispute } from "@/components/plan/disputes";
import { CALL_SCRIPTS, CALL_TOPICS, type CallLog } from "@/components/plan/calls";
import { compareExtra, payoff, verdict } from "@/components/plan/payoff";
import { incomeCheck } from "@/components/plan/income";
import { loadCalls, loadDisputes, saveCalls, saveDisputes } from "@/components/plan/progress";

const NOW = new Date("2026-11-15T12:00:00Z");

describe("dispute tracker", () => {
  const sent = newDispute({ title: "RAP interest subsidy looks short by $40.10", servicer: "MOHELA", amount: 40.1, sentOn: "2026-11-01" }, "d1");

  it("waits 30 days after the letter, then asks for a follow-up", () => {
    expect(nextStep(sent, NOW)).toMatchObject({ kind: "wait", due: "2026-12-01" });
    expect(nextStep(sent, new Date("2026-12-02T12:00:00Z"))).toMatchObject({ kind: "follow_up" });
  });

  it("after a follow-up with no fix for 30 more days, escalates to the CFPB and the FSA Ombudsman", () => {
    const followed: Dispute = { ...sent, status: "followed_up", followedUpOn: "2026-12-02" };
    expect(nextStep(followed, new Date("2026-12-20T12:00:00Z"))).toMatchObject({ kind: "wait", due: "2027-01-01" });
    const step = nextStep(followed, new Date("2027-01-05T12:00:00Z"));
    expect(step.kind).toBe("escalate");
    expect(step.text).toMatch(/CFPB/);
    expect(step.text).toMatch(/Ombudsman/);
  });

  it("a fixed dispute is done, and the money recovered adds up across disputes", () => {
    const fixed: Dispute = { ...sent, status: "fixed", recovered: 40.1 };
    expect(nextStep(fixed, NOW).kind).toBe("done");
    expect(totalRecovered([fixed, { ...fixed, id: "d2", recovered: 12.5 }, sent])).toBe(52.6);
  });

  it("the follow-up letter cites the first letter's date and every logged call", () => {
    const calls: CallLog[] = [{ id: "c1", on: "2026-11-20", topic: "billing_error", rep: "Dana", reference: "REF-123", disputeId: "d1" }];
    const text = followUpLetter(sent, calls, NOW);
    expect(text).toMatch(/November 1, 2026/);
    expect(text).toMatch(/Dana/);
    expect(text).toMatch(/REF-123/);
    expect(text).toMatch(/RAP interest subsidy looks short by \$40\.10/);
    expect(text).toMatch(/\[YOUR NAME\]/);
  });
});

describe("servicer call helper", () => {
  it("has a short script for every topic, and none asks for an FSA ID or password", () => {
    for (const t of CALL_TOPICS) {
      expect(CALL_SCRIPTS[t].lines.length).toBeGreaterThanOrEqual(3);
      expect(CALL_SCRIPTS[t].lines.join(" ")).not.toMatch(/(give|tell|share)[^.]*FSA (ID|password)/i);
    }
    expect(CALL_SCRIPTS.billing_error.lines.join(" ")).toMatch(/reference number/i);
  });
});

describe("pay extra or aim for forgiveness", () => {
  it("amortizes like the 10-year Standard plan: $40,000 at 6.5% for $454.19 a month is paid off in 120 months", () => {
    const r = payoff(40000, 0.065, 454.19);
    expect(r.months).toBe(120);
    expect(r.totalPaid).toBeGreaterThan(54000);
    expect(r.totalPaid).toBeLessThan(54600);
  });

  it("a payment that doesn't cover the interest never pays the loan off", () => {
    expect(payoff(40000, 0.065, 150).months).toBeNull();
  });

  it("compares staying on the recommended plan with paying extra", () => {
    const c = compareExtra(MOCK_COMPARISON, 200);
    expect(c.stay.payment).toBe(129.17);
    expect(c.extra.payment).toBe(329.17);
    expect(c.extra.months).not.toBeNull();
    expect(c.forgivenessYears).toBe(30);
  });

  it("says in one line which way costs less: here, aiming for forgiveness (and that it's taxable)", () => {
    const v = verdict(compareExtra(MOCK_COMPARISON, 100), false);
    expect(v).toMatch(/Aiming for forgiveness costs about \$[\d,]+ less in payments/);
    expect(v).toMatch(/taxable/);
  });

  it("when the plan pays the loan off anyway, paying extra saves interest and time", () => {
    const standard = { ...MOCK_COMPARISON, recommended: "STANDARD_10" as const };
    expect(verdict(compareExtra(standard, 100), false)).toMatch(/saves about \$[\d,]+ in interest/);
  });

  it("an extra amount that doesn't cover the interest says so", () => {
    expect(verdict({ ...compareExtra(MOCK_COMPARISON, 0), extra: { payment: 129.17, months: null, totalPaid: 0, totalInterest: 0 } }, false)).toMatch(/doesn't cover the interest/);
  });

  it("on the PSLF track it warns that paying extra usually doesn't help", () => {
    expect(compareExtra(computePlans(SAMPLE_BORROWERS.F4), 200).pslfNote).toMatch(/120 qualifying payments/);
  });
});

describe("my income changed", () => {
  it("a pay cut lowers the payment: recertify now", () => {
    const r = incomeCheck(MOCK_COMPARISON, 40000);
    expect(r.newPayment).toBeLessThan(r.oldPayment);
    expect(r.advice).toBe("recertify_now");
  });

  it("a raise: no need to recertify early", () => {
    const r = incomeCheck(MOCK_COMPARISON, 80000);
    expect(r.newPayment).toBeGreaterThan(r.oldPayment);
    expect(r.advice).toBe("wait");
  });

  it("about the same income: nothing to do", () => {
    expect(incomeCheck(MOCK_COMPARISON, 55000).advice).toBe("same");
  });
});

describe("storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("remembers disputes and calls on this device, and survives junk", () => {
    expect(loadDisputes()).toEqual([]);
    const d = newDispute({ title: "x", sentOn: "2026-11-01" }, "d1");
    saveDisputes([d]);
    expect(loadDisputes()).toEqual([d]);
    const call: CallLog = { id: "c1", on: "2026-11-02", topic: "switch_plan" };
    saveCalls([call]);
    expect(loadCalls()).toEqual([call]);
    window.localStorage.setItem("slg_disputes", "{bad");
    expect(loadDisputes()).toEqual([]);
  });
});
