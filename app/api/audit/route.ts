import { z } from "zod";
import { auditStatement, SAMPLE_IDS, type SampleId } from "@/lib/audit";
import { extractStatement, logAuditFailure, UNAVAILABLE_MESSAGE, UNREADABLE_MESSAGE, type ExtractResult, type MediaType } from "@/lib/audit/extract";
import { RULES_AS_OF, type AuditResult, type BorrowerInput } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

// Vercel Functions cap request bodies at 4.5 MB; stay under it so users get our message, not a platform 413.
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED: MediaType[] = ["application/pdf", "image/png", "image/jpeg"];

// Loose check: the input comes from our own quiz; we only need it to be shaped like BorrowerInput.
const InputSchema = z
  .object({ agi: z.number(), filingStatus: z.string(), dependents: z.number(), familySize: z.number(), state: z.string(), loans: z.array(z.any()) })
  .passthrough();

const bad = (error: string, status = 400) => Response.json({ error }, { status });

function parseInput(raw: unknown): BorrowerInput | undefined {
  const r = InputSchema.safeParse(raw);
  return r.success ? (r.data as unknown as BorrowerInput) : undefined;
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

async function run(input: Parameters<typeof extractStatement>[0], borrower?: BorrowerInput) {
  let read: ExtractResult;
  try {
    read = await extractStatement(input);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === UNREADABLE_MESSAGE) return bad(UNREADABLE_MESSAGE, 422);
    return bad(UNAVAILABLE_MESSAGE, 503);
  }
  try {
    const result: AuditResult = { extraction: read.extraction, findings: auditStatement(read.extraction, borrower), rulesAsOf: RULES_AS_OF };
    return Response.json({ result, usedCache: read.usedCache });
  } catch (e) {
    logAuditFailure("checking the statement failed", e);
    return bad("Something went wrong checking this statement. Please try again.", 500);
  }
}

export async function POST(req: Request) {
  const type = req.headers.get("content-type") ?? "";

  if (type.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    if (!form) return bad("We couldn't receive that upload. Please try again.");
    const file = form.get("file");
    if (!(file instanceof File)) return bad("Please choose a statement file.");
    if (!ALLOWED.includes(file.type as MediaType)) return bad("Please upload a PDF, PNG or JPEG statement.");
    if (file.size > MAX_BYTES) return bad("That file is over 4 MB. Please upload a smaller file or a photo of just the first page.");
    const rawInput = form.get("input");
    const borrower = typeof rawInput === "string" ? parseInput(parseJson(rawInput)) : undefined;
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    return run({ base64, mediaType: file.type as MediaType }, borrower);
  }

  const body = (await req.json().catch(() => null)) as { sampleId?: unknown; input?: unknown } | null;
  if (!body || typeof body.sampleId !== "string" || !SAMPLE_IDS.includes(body.sampleId as SampleId)) {
    return bad("Unknown sample statement.");
  }
  return run({ sampleId: body.sampleId as SampleId }, parseInput(body.input));
}
