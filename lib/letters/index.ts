// STUB — owned by P3 (plans/03-audit.md). Replace bodies; keep signatures.
import type { AuditFinding, LetterTemplateId, PlanComparison } from "@/lib/types";

export type LetterData = {
  borrowerName?: string;
  servicer?: string;
  finding?: AuditFinding;
  comparison?: PlanComparison;
  today: Date;
};

export function renderLetter(id: LetterTemplateId, data: LetterData): string {
  return `Template only. You fill it in, check it, and send it yourself.\n\n[${id} letter — stub, dated ${data.today.toISOString().slice(0, 10)}]\n[YOUR NAME]`;
}
