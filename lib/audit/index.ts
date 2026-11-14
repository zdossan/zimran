// Owned by P3 (plans/03-audit.md). Public entry for the audit slice.
export const SAMPLE_IDS = ["mohela-subsidy-error", "edfinancial-ok", "nelnet-standard-placement"] as const;
export type SampleId = (typeof SAMPLE_IDS)[number];

export { auditStatement } from "@/lib/audit/rules";
