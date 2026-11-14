import { z } from "zod";
import { buildGuardianReport } from "@/lib/audit/report";
import { StatementSchema } from "@/lib/audit/schema";
import type { ActionItem, AuditResult } from "@/lib/types";

export const runtime = "nodejs";

const FindingSchema = z.object({
  id: z.string(),
  severity: z.enum(["ok", "warn", "error"]),
  title: z.string(),
  detail: z.string(),
  expected: z.number().optional(),
  actual: z.number().optional(),
  ruleRef: z.string(),
  letterTemplateId: z.enum(["plan_switch", "billing_dispute", "cfpb_complaint"]).optional(),
});
const BodySchema = z.object({
  audit: z.object({ extraction: StatementSchema, findings: z.array(FindingSchema).max(20), rulesAsOf: z.string() }),
  actions: z
    .array(z.object({ id: z.string(), dueDate: z.string().optional(), title: z.string(), detail: z.string(), letterTemplateId: z.string().optional() }))
    .max(20)
    .optional(),
});

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid report request" }, { status: 400 });
  }
  const bytes = await buildGuardianReport(parsed.data.audit as AuditResult, (parsed.data.actions ?? []) as ActionItem[]);
  return new Response(bytes.slice().buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="guardian-report.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
