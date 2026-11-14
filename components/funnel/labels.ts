// Display labels shared by the results components (owned by P2).
import type { PlanId } from "@/lib/types";
import { RULES_AS_OF } from "@/lib/types";
import { formatUSD } from "@/lib/format";

export const PLAN_LABEL: Record<PlanId, string> = { RAP: "RAP", IBR: "IBR", STANDARD_10: "10-year Standard", TIERED: "Tiered Standard" };
export const PLAN_SHORT: Record<PlanId, string> = { RAP: "RAP", IBR: "IBR", STANDARD_10: "10-yr Std", TIERED: "Tiered" };
export const PLAN_FULL_NAME: Record<PlanId, string> = {
  RAP: "Repayment Assistance Plan",
  IBR: "Income-Based Repayment",
  STANDARD_10: "10-year Standard Plan",
  TIERED: "Tiered Standard Plan",
};

/** Lowest paid price, shown on the action-plan CTA (§H: prices upfront). */
export const PRICE_FROM = "$9/mo";

/** "$129" / "$1,250" — whole dollars, only for the results hero, the landing preview card and chart labels. */
export const wholeUSD = (n: number) => formatUSD(Math.round(n)).replace(/\.00$/, "");

/** "Nov 1, 2026" — derived from RULES_AS_OF so it never drifts. */
export const RULES_DATE_LABEL = new Date(`${RULES_AS_OF}T00:00:00Z`).toLocaleDateString("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
});

/** "+$1,198.08" / "−$600.00" / "$0.00" (a real minus sign). */
export const signedUSD = (n: number) => (n > 0 ? `+${formatUSD(n)}` : n < 0 ? `−${formatUSD(-n)}` : formatUSD(0));

/** "Nov 30, 2026" from an ISO date. */
export const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
