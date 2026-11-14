// Dated action plan from a PlanComparison — owned by P1 (plans/01-engine.md Task 6). Dates are ISO, in UTC.
import type { ActionItem, PlanComparison } from "@/lib/types";
import { addDays, isIsoDate, isoDate, shortDate } from "@/lib/engine/dates";
import { PLAN_LABEL } from "@/lib/engine/recommend";

/** The next April 15 on or after today. */
function nextTaxDay(today: string): string {
  const year = Number(today.slice(0, 4));
  const thisYear = `${year}-04-15`;
  return today <= thisYear ? thisYear : `${year + 1}-04-15`;
}

export function buildActionPlan(c: PlanComparison, today: Date): ActionItem[] {
  const now = isoDate(today);
  const { input } = c;
  const items: ActionItem[] = [];
  // No plan is available when none of the loans are covered (e.g. Parent PLUS only): nothing to apply for.
  if (c.results.some((r) => r.available)) {
    items.push({
      id: "apply-recommended",
      dueDate: addDays(now, 7),
      title: `Apply for ${PLAN_LABEL[c.recommended]} at StudentAid.gov or through your servicer (free)`,
      detail: "Applying is free. If your servicer doesn't act within 30 days, send the plan-switch letter.",
      letterTemplateId: "plan_switch",
    });
  }
  if (input.currentPlan === "SAVE" && isIsoDate(input.saveNoticeDate)) {
    const due = addDays(input.saveNoticeDate, 90);
    const passed = due < now;
    items.push({
      id: "save-90-day",
      dueDate: due,
      title: passed ? `Your SAVE deadline passed on ${shortDate(due)}` : "SAVE deadline: choose your new plan",
      detail: passed
        ? "Contact your servicer now: you may have been moved to the Standard plan. Applying for a new plan is still free."
        : "Choose a plan within 90 days of your servicer's notice, or you may be placed on the Standard plan.",
    });
  }
  if (c.pslfTrack) {
    items.push({
      id: "pslf-certify",
      dueDate: addDays(now, 30),
      title: "Certify your employment for PSLF",
      detail: "Submit an employment certification with the PSLF Help Tool at StudentAid.gov so your payments count.",
    });
  }
  items.push({
    id: "recertify",
    dueDate: addDays(now, 365),
    title: "Recertify your income",
    detail: "Or consent to IRS data sharing so it happens automatically.",
  });
  if (input.filingStatus === "mfj" || input.filingStatus === "mfs") {
    items.push({
      id: "filing-status",
      dueDate: nextTaxDay(now),
      title: "Decide joint or separate tax filing before you file",
      detail: "Your filing status changes your income-driven payment. Compare both before you file your taxes.",
    });
  }
  if (c.warnings.some((w) => w.id === "new-loan-kills-ibr")) {
    items.push({
      id: "no-new-loans",
      title: "Avoid new federal loans or consolidation",
      detail: "A loan made on or after July 1, 2026 would limit all your loans to RAP or Tiered Standard.",
    });
  }
  // Dated items by date (ISO strings sort correctly), undated last; stable for equal dates.
  return items.sort((a, b) => (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31"));
}
