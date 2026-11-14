"use client";
// Lead the statement check with the answer: one headline on the brand gradient. Never reassure when we
// found a mismatch or couldn't check — warnings lead with their count. Focus moves here when it appears,
// so on a phone the answer is where the user lands.
import { useEffect, useRef } from "react";
import type { AuditFinding } from "@/lib/types";
import { GRADIENT } from "@/components/brand/Band";

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const isNoData = (f: AuditFinding) => f.title.startsWith("Not enough data");

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
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
    heading.current?.scrollIntoView?.({ block: "center", behavior: "smooth" });
  }, []);

  return (
    <section className="rounded-3xl p-6 text-white shadow-lg" style={{ background: GRADIENT }}>
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/90">Statement check</p>
      <h2 ref={heading} tabIndex={-1} className="mt-1 text-3xl font-extrabold tracking-tight outline-none sm:text-4xl">
        {v.headline}
      </h2>
      <p className="mt-2 text-white/90">{v.detail}</p>
    </section>
  );
}
