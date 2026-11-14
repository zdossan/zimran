"use client";
import { useEffect, useState } from "react";
import type { AuditResult, BorrowerInput } from "@/lib/types";
import type { SampleId } from "@/lib/audit";
import { buildActionPlan, computePlans } from "@/lib/engine";
import { loadSessionData, saveSessionData } from "@/lib/supabase/session";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Paywall } from "@/components/paywall/Paywall";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { ExtractedFields } from "@/components/audit/ExtractedFields";
import { FindingsList } from "@/components/audit/FindingsList";

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
      a.download = "guardian-report.pdf";
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
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Try a sample statement</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {SAMPLES.map((s) => (
            <Card key={s.id}>
              <CardHeader>
                <CardTitle className="text-base">{s.label}</CardTitle>
                <CardDescription>{s.blurb}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => checkSample(s.id)} disabled={status === "loading"} aria-label={`Check the ${s.label} sample`}>
                  Check this sample
                </Button>
                <a className="text-sm underline" href={`/samples/${s.id}.pdf`} target="_blank" rel="noreferrer" aria-label={`View the ${s.label} sample PDF`}>
                  View PDF
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">
          <label htmlFor="statement-file">Or upload your statement</label>
        </h2>
        <p id="statement-file-hint" className="text-sm text-muted-foreground">
          PDF, PNG or JPEG, up to 4 MB. Cover your account number if you like — we only need the amounts and dates. Your file is sent to
          our AI provider (Anthropic) to read the numbers; we don&apos;t store the file.
        </p>
        <input
          id="statement-file"
          aria-describedby="statement-file-hint"
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          className="block w-full max-w-full text-sm file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
          disabled={status === "loading"}
        />
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
          {usedCache ? (
            <Alert>
              <AlertTitle>Using pre-read sample data</AlertTitle>
              <AlertDescription>Live statement reading isn&apos;t available right now, so this sample was checked from data we read earlier.</AlertDescription>
            </Alert>
          ) : null}
          {result.extraction.isSample ? <p className="text-xs font-semibold uppercase text-destructive">Sample statement — not real data</p> : null}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">What we read</CardTitle>
              <CardDescription>Check these against your statement. The checks below only use these values.</CardDescription>
            </CardHeader>
            <CardContent>
              <ExtractedFields x={result.extraction} />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">What we checked</h2>
            <FindingsList findings={result.findings} state={input?.state} servicer={result.extraction.servicer} comparison={comparison} />
          </div>

          <Paywall feature="report" state={input?.state}>
            <Button onClick={downloadReport} disabled={downloading}>
              {downloading ? "Preparing…" : "Download Guardian report (PDF)"}
            </Button>
            {reportError ? (
              <p role="alert" className="text-sm text-destructive">
                {reportError}
              </p>
            ) : null}
          </Paywall>

          <Disclaimer variant="audit" />
        </section>
      ) : null}
    </div>
  );
}
