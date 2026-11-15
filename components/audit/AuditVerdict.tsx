"use client";
// Lead the statement check with the answer: one headline in a card toned by the result. Never reassure when we
// found a mismatch or couldn't check — warnings lead with their count. Focus moves here when it appears,
// so on a phone the answer is where the user lands.
import { useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle2, SearchCheck } from "lucide-react";
import type { AuditFinding } from "@/lib/types";

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const isNoData = (f: AuditFinding) => f.title.startsWith("Not enough data");

type Tone = "error" | "warn" | "ok";
const TONES: Record<Tone, { box: string; icon: string; Icon: typeof AlertTriangle; label: string }> = {
  error: { box: "border-red-200 bg-red-50", icon: "text-red-700", Icon: AlertTriangle, label: "Possible error found" },
  warn: { box: "border-amber-200 bg-amber-50", icon: "text-amber-700", Icon: SearchCheck, label: "Needs a closer look" },
  ok: { box: "border-emerald-200 bg-emerald-50", icon: "text-emerald-700", Icon: CheckCircle2, label: "All clear" },
};

const toneFor = (findings: AuditFinding[]): Tone =>
  findings.some((f) => f.severity === "error") ? "error" : findings.some((f) => f.severity === "warn") ? "warn" : "ok";

export function verdictFor(findings: AuditFinding[]): { headline: string; detail: string } {
  const errors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warn");
  if (errors.length) return { headline: count(errors.length, "possible error"), detail: errors[0].title };
  if (warnings.length && warnings.every(isNoData)) {
    const n = warnings.length;
    return { headline: "We couldn't check this statement fully", detail: `${n === 1 ? "1 check needs" : `${n} checks need`} numbers this statement doesn't show.` };
  }
  if (warnings.length) return { headline: `${count(warnings.length, "thing")} to check`, detail: warnings[0].title };
  return { headline: "Everything we checked adds up", detail: `We checked ${findings.length} things against the rules.` };
}

export function AuditVerdict({ findings }: { findings: AuditFinding[] }) {
  const v = verdictFor(findings);
  const tone = toneFor(findings);
  const t = TONES[tone];
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
    heading.current?.scrollIntoView?.({ block: "center", behavior: "smooth" });
  }, []);

  return (
    <section data-tone={tone} className={`rounded-2xl border p-6 shadow-sm sm:p-8 ${t.box}`}>
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
        <t.Icon aria-hidden className={`size-5 ${t.icon}`} />
        Statement check · {t.label}
      </p>
      <h2 ref={heading} tabIndex={-1} className="mt-3 text-2xl font-medium tracking-tight text-slate-900 outline-none sm:text-3xl">
        {v.headline}
      </h2>
      <p className="mt-2 text-base text-slate-800">{v.detail}</p>
    </section>
  );
}
