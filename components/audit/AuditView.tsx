"use client";
import { useEffect, useState } from "react";
import { FileText, ShieldAlert, Upload } from "lucide-react";
import type { AuditResult, BorrowerInput } from "@/lib/types";
import type { SampleId } from "@/lib/audit";
import { buildActionPlan, computePlans } from "@/lib/engine";
import { loadSessionData, saveSessionData } from "@/lib/supabase/session";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, buttonClass } from "@/components/brand/kit";
import { Progress } from "@/components/ui/progress";
import { Paywall } from "@/components/paywall/Paywall";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { ExtractedFields } from "@/components/audit/ExtractedFields";
import { FindingsList } from "@/components/audit/FindingsList";
import { AuditVerdict } from "@/components/audit/AuditVerdict";
import { recordAudit } from "@/components/plan/progress";

const SAMPLES: { id: SampleId; label: string; blurb: string }[] = [
  { id: "mohela-subsidy-error", label: "MOHELA statement", blurb: "RAP borrower — is the interest subsidy right?" },
  { id: "edfinancial-ok", label: "EdFinancial statement", blurb: "RAP borrower — does everything add up?" },
  { id: "nelnet-standard-placement", label: "Nelnet statement", blurb: "Former SAVE borrower — moved to Standard?" },
];
// Matches app/api/audit/route.ts — Vercel Functions cap request bodies at 4.5 MB.
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = ["application/pdf", "image/png", "image/jpeg"];

type Status = "idle" | "loading" | "done" | "error";

export function AuditView() {
  const [input, setInput] = useState<BorrowerInput | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [usedCache, setUsedCache] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    loadSessionData<BorrowerInput>("borrowerInput").then(setInput).catch(() => setInput(null));
  }, []);

  async function handle(res: Response) {
    const body = await res.json().catch(() => ({ error: "Something went wrong. Please try again." }));
    if (!res.ok) {
      setError(body.error ?? "Something went wrong. Please try again.");
      setStatus("error");
      return;
    }
    setResult(body.result);
    setUsedCache(Boolean(body.usedCache));
    setStatus("done");
    saveSessionData("audit", body.result).catch(() => undefined);
    recordAudit(body.result, new Date()); // monthly check-in history (real statements only)
  }

  async function checkSample(sampleId: SampleId) {
    setStatus("loading");
    setError("");
    try {
      await handle(await fetch("/api/audit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sampleId, input }) }));
    } catch {
      setError("We couldn't reach the server. Please try again.");
      setStatus("error");
    }
  }

  async function upload(file: File) {
    if (!ALLOWED.includes(file.type)) return (setError("Please upload a PDF, PNG or JPEG statement."), setStatus("error"));
    if (file.size > MAX_BYTES) return (setError("That file is over 4 MB. Please upload a smaller file or a photo of just the first page."), setStatus("error"));
    const form = new FormData();
    form.set("file", file);
    if (input) form.set("input", JSON.stringify(input));
    setStatus("loading");
    setError("");
    try {
      await handle(await fetch("/api/audit", { method: "POST", body: form }));
    } catch {
      setError("We couldn't reach the server. Please try again.");
      setStatus("error");
    }
  }

  async function downloadReport() {
    if (!result) return;
    setDownloading(true);
    setReportError("");
    try {
      const actions = input ? buildActionPlan(computePlans(input), new Date()) : [];
      const res = await fetch("/api/report", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ audit: result, actions }) });
      if (!res.ok) throw new Error("report failed");
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "owen-report.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setReportError("We couldn't build your report. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  const comparison = input ? computePlans(input) : undefined;

  return (
    <div className="space-y-8">
      <section aria-labelledby="samples-heading" className="space-y-4">
        <h2 id="samples-heading" className="text-xl font-medium tracking-tight">
          Try a sample statement
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {SAMPLES.map((s) => (
            <Card key={s.id} className="flex flex-col p-5 sm:p-6">
              <FileText aria-hidden className="size-6 text-sky-700" />
              <p className="mt-4 text-base font-semibold">{s.label}</p>
              <p className="mt-1 text-sm text-slate-600">{s.blurb}</p>
              <div className="mt-auto space-y-2 pt-5">
                <button type="button" className={buttonClass("secondary", "w-full text-sm")} onClick={() => checkSample(s.id)} disabled={status === "loading"} aria-label={`Check the ${s.label} sample`}>
                  Check this sample
                </button>
                <a
                  className="flex min-h-11 items-center justify-center text-sm font-medium text-brand-800 underline underline-offset-4"
                  href={`/samples/${s.id}.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`View the ${s.label} sample PDF`}
                >
                  View PDF
                </a>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="upload-heading" className="space-y-4">
        <h2 id="upload-heading" className="text-xl font-medium tracking-tight">
          Or upload your own
        </h2>
        <label
          htmlFor="statement-file"
          className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center transition hover:border-brand-600 hover:bg-brand-50/40 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2"
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-brand-100 text-brand-900 transition group-hover:scale-105">
            <Upload aria-hidden className="size-6" />
          </span>
          <span className="mt-4 text-lg font-semibold">Upload your statement</span>
          <span className="mt-1 text-sm text-slate-600">PDF, PNG or JPEG, up to 4 MB</span>
          <span className={buttonClass("secondary", "mt-4 text-sm")}>Choose a file</span>
          <input
            id="statement-file"
            aria-describedby="statement-file-hint"
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
            disabled={status === "loading"}
          />
        </label>
        <p id="statement-file-hint" className="flex gap-2 text-sm text-slate-600">
          <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-slate-500" />
          <span>
            Cover your account number if you like — we only need the amounts and dates. Your file is sent to our AI provider (Anthropic) to read the
            numbers; we don&apos;t store the file.
          </span>
        </p>
      </section>

      {status === "loading" ? (
        <div className="space-y-2" aria-live="polite">
          <p className="text-sm">Reading your statement…</p>
          <Progress value={60} />
        </div>
      ) : null}

      {status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>We couldn&apos;t check that statement</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {status === "done" && result ? (
        <section className="space-y-6">
          <AuditVerdict findings={result.findings} />
          {usedCache ? (
            <Alert>
              <AlertTitle>Using pre-read sample data</AlertTitle>
              <AlertDescription>Live statement reading isn&apos;t available right now, so this sample was checked from data we read earlier.</AlertDescription>
            </Alert>
          ) : null}
          {result.extraction.isSample ? (
            <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-900">Sample statement — not real data</p>
          ) : null}

          <Card>
            <h2 className="text-lg font-medium tracking-tight">What we read</h2>
            <p className="mt-1 text-sm text-slate-600">Check these against your statement. The checks below only use these values.</p>
            <div className="mt-4">
              <ExtractedFields x={result.extraction} />
            </div>
          </Card>

          <div className="space-y-3">
            <h2 className="text-xl font-medium tracking-tight">What we checked</h2>
            <FindingsList findings={result.findings} state={input?.state} servicer={result.extraction.servicer} comparison={comparison} />
          </div>

          <Paywall feature="report" state={input?.state}>
            <button type="button" className={buttonClass("primary")} onClick={downloadReport} disabled={downloading}>
              {downloading ? "Preparing…" : "Download your Owen report (PDF)"}
            </button>
            {reportError ? (
              <p role="alert" className="text-sm text-destructive">
                {reportError}
              </p>
            ) : null}
          </Paywall>

          <div className="rounded-2xl bg-slate-100 p-5">
            <Disclaimer variant="audit" />
          </div>
        </section>
      ) : null}
    </div>
  );
}
