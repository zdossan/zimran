// P1 engine (plans/01-engine.md). Pure functions — safe on client and server.
export { computePlans } from "@/lib/engine/compute";
export { compareFiling } from "@/lib/engine/filing";
export { mfsBracketPenalty } from "@/lib/engine/mfsTax";
export { rapMonthly, rapRate } from "@/lib/engine/rap";
export { fpl, ibrMonthly } from "@/lib/engine/ibr";
export { amortize, standard10, tieredStandard, tieredTermMonths } from "@/lib/engine/amortize";
export { rapMonthBenefit, simulate12 } from "@/lib/engine/simulate";
export { recommend } from "@/lib/engine/recommend";
export { buildActionPlan } from "@/lib/actions/buildActionPlan";
