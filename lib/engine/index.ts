// STUB — owned by P1 (plans/01-engine.md). Replace bodies; keep signatures.
import type { ActionItem, BorrowerInput, FilingComparison, PlanComparison } from "@/lib/types";
import { MOCK_ACTIONS, MOCK_COMPARISON, MOCK_FILING } from "@/lib/mocks";

export function computePlans(input: BorrowerInput): PlanComparison {
  return { ...MOCK_COMPARISON, input };
}

export function compareFiling(input: BorrowerInput & { spouseAgi: number }): FilingComparison {
  void input;
  return MOCK_FILING;
}

export function buildActionPlan(c: PlanComparison, today: Date): ActionItem[] {
  void c;
  void today;
  return MOCK_ACTIONS;
}
