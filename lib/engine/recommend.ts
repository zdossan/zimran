// Recommendation rule — spec §5.4: PSLF track → lowest PSLF-qualifying payment; otherwise the lowest payment
// that doesn't grow the balance; payments within $1 tie-break on balance change, then PSLF, then plan order.
import type { PlanId, PlanResult, Warning } from "@/lib/types";
import { formatUSD } from "@/lib/format";

export const PLAN_ORDER: PlanId[] = ["RAP", "IBR", "STANDARD_10", "TIERED"];
export const PLAN_LABEL: Record<PlanId, string> = { RAP: "RAP", IBR: "IBR", STANDARD_10: "the 10-year Standard", TIERED: "Tiered Standard" };

const order = (p: PlanId) => PLAN_ORDER.indexOf(p);
const change = (r: PlanResult) => r.balanceChange12m ?? 0;
const about = (n: number) => `about ${formatUSD(Math.round(Math.abs(n))).replace(".00", "")}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Lowest by key; exact ties by plan order. */
function lowest(rs: PlanResult[], key: (r: PlanResult) => number): PlanResult {
  return [...rs].sort((a, b) => key(a) - key(b) || order(a.plan) - order(b.plan))[0];
}

/** Lowest payment, with payments within $1 of it tie-broken on balance change, then PSLF, then plan order. */
function pickLowestPayment(rs: PlanResult[]): { pick: PlanResult; tied: PlanResult[] } {
  const min = Math.min(...rs.map((r) => r.monthlyPayment));
  const group = rs
    .filter((r) => r.monthlyPayment <= min + 1)
    .sort((a, b) => change(a) - change(b) || Number(b.pslfQualifying) - Number(a.pslfQualifying) || order(a.plan) - order(b.plan));
  return { pick: group[0], tied: group.slice(1) };
}

export interface Recommendation {
  cheapestMonthly: PlanId;
  bestFor12mBalance: PlanId;
  recommended: PlanId;
  reason: string;
  warnings: Warning[];
}

export function recommend(results: PlanResult[], pslfTrack: boolean): Recommendation {
  const available = results.filter((r) => r.available);
  if (available.length === 0) {
    // PlanComparison.recommended is required; "RAP" is a placeholder — every result is unavailable.
    return {
      cheapestMonthly: "RAP", bestFor12mBalance: "RAP", recommended: "RAP", warnings: [],
      reason: "We can't compare plans for these loans: none of them are covered by RAP, IBR or the Standard plans here.",
    };
  }
  const cheapest = lowest(available, (r) => r.monthlyPayment);
  const best = lowest(available, change);
  const warnings: Warning[] = [];
  const at = (r: PlanResult) => `${PLAN_LABEL[r.plan]} at ${formatUSD(r.monthlyPayment)}/month`;
  let reason: string;
  let pick: PlanResult;

  if (pslfTrack) {
    const { pick: p, tied } = pickLowestPayment(available.filter((r) => r.pslfQualifying));
    pick = p;
    reason = `You're on a PSLF track, so we pick the lowest payment among PSLF-qualifying plans: ${at(pick)}`;
    reason += tied.length ? ` (it ties ${tied.map((t) => PLAN_LABEL[t.plan]).join(" and ")} and wins the tie-break).` : ".";
    if (change(pick) > 0) {
      warnings.push({
        id: "balance-grows", severity: "info", title: `${cap(PLAN_LABEL[pick.plan])} would grow your balance`,
        body: `At ${formatUSD(pick.monthlyPayment)}/month your balance would grow ${about(change(pick))} this year. If you qualify for PSLF, the remaining balance is forgiven tax-free.`,
      });
    }
  } else {
    const steady = available.filter((r) => change(r) <= 0);
    if (steady.length === 0) {
      pick = pickLowestPayment(available).pick;
      reason = `Every plan lets your balance grow this year, so we pick the lowest payment: ${at(pick)}.`;
      warnings.push({
        id: "balance-grows", severity: "danger", title: "Your balance will grow this year",
        body: `On ${at(pick)}, your balance will grow by ${about(change(pick))} this year.`,
      });
    } else {
      pick = pickLowestPayment(steady).pick;
      reason = `You're not on a PSLF track, so we pick the lowest payment that doesn't grow your balance: `;
      if (change(cheapest) > 0 && cheapest.plan !== pick.plan) {
        const diff = formatUSD(pick.monthlyPayment - cheapest.monthlyPayment);
        reason += `${PLAN_LABEL[cheapest.plan]} is ${diff} less per month, but your balance would grow ${about(change(cheapest))} this year, while ${PLAN_LABEL[pick.plan]} shrinks it ${about(change(pick))}.`;
        warnings.push({
          id: "balance-grows", severity: "warn", title: `${cap(PLAN_LABEL[cheapest.plan])} would grow your balance`,
          body: `At ${formatUSD(cheapest.monthlyPayment)}/month your payment doesn't cover the interest, so your balance would grow ${about(change(cheapest))} this year.`,
        });
      } else {
        reason += `${at(pick)}.`;
      }
    }
  }

  return { cheapestMonthly: cheapest.plan, bestFor12mBalance: best.plan, recommended: pick.plan, reason: cap(reason), warnings };
}
