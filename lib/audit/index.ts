// STUB — owned by P3 (plans/03-audit.md). Replace bodies; keep signatures.
import type { AuditFinding, BorrowerInput, StatementExtraction } from "@/lib/types";
import { MOCK_AUDIT } from "@/lib/mocks";

export const SAMPLE_IDS = ["mohela-subsidy-error", "edfinancial-ok", "nelnet-standard-placement"] as const;
export type SampleId = (typeof SAMPLE_IDS)[number];

export function auditStatement(x: StatementExtraction, input?: BorrowerInput): AuditFinding[] {
  void x;
  void input;
  return MOCK_AUDIT.findings;
}
