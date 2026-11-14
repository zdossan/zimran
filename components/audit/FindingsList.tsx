"use client";
import { useState } from "react";
import type { AuditFinding, PlanComparison } from "@/lib/types";
import { formatUSD } from "@/lib/format";
import { renderLetter } from "@/lib/letters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Paywall } from "@/components/paywall/Paywall";
import { Disclaimer } from "@/components/legal/Disclaimer";

const SEVERITY: Record<AuditFinding["severity"], { label: string; variant: "destructive" | "secondary" | "outline" }> = {
  error: { label: "Possible error", variant: "destructive" },
  warn: { label: "Check this", variant: "secondary" },
  ok: { label: "OK", variant: "outline" },
};

function SeverityBadge({ s }: { s: AuditFinding["severity"] }) {
  return <Badge variant={SEVERITY[s].variant}>{SEVERITY[s].label}</Badge>;
}

function LetterDialog({ finding, state, servicer, comparison, onClose }: { finding: AuditFinding | null; state?: string; servicer?: string; comparison?: PlanComparison; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const text = finding?.letterTemplateId
    ? renderLetter(finding.letterTemplateId, { finding, servicer, comparison, today: new Date() })
    : "";
  return (
    <Dialog open={finding !== null} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your letter</DialogTitle>
          <DialogDescription>Fill in the blanks, check every fact, then send it yourself.</DialogDescription>
        </DialogHeader>
        <Paywall feature="letters" state={state}>
          <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs leading-relaxed">{text}</pre>
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(text);
                setCopied(true);
              }}
            >
              {copied ? "Copied" : "Copy letter"}
            </Button>
          </div>
          <Disclaimer variant="letter" />
        </Paywall>
      </DialogContent>
    </Dialog>
  );
}

export function FindingsList({ findings, state, servicer, comparison }: { findings: AuditFinding[]; state?: string; servicer?: string; comparison?: PlanComparison }) {
  const [letterFor, setLetterFor] = useState<AuditFinding | null>(null);
  const counts = {
    error: findings.filter((f) => f.severity === "error").length,
    warn: findings.filter((f) => f.severity === "warn").length,
    ok: findings.filter((f) => f.severity === "ok").length,
  };
  const first = findings[0];

  return (
    <div className="space-y-4">
      <p className="text-sm">
        <strong>{counts.error}</strong> possible error{counts.error === 1 ? "" : "s"} · <strong>{counts.warn}</strong> to check ·{" "}
        <strong>{counts.ok}</strong> OK <span className="text-muted-foreground">· Rules as of November 1, 2026</span>
      </p>
      {first ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <SeverityBadge s={first.severity} />
          <span className="font-medium">{first.title}</span>
        </div>
      ) : null}

      <Paywall feature="audit-details" state={state}>
        <ul className="space-y-3">
          {findings.map((f) => (
            <li key={f.id} className="space-y-2 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge s={f.severity} />
                <span className="font-medium">{f.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">{f.detail}</p>
              <p className="text-xs text-muted-foreground">
                {f.expected !== undefined ? `Expected ${formatUSD(f.expected)} · ` : ""}
                {f.actual !== undefined ? `On statement ${formatUSD(f.actual)} · ` : ""}
                Rule: {f.ruleRef}
              </p>
              {f.letterTemplateId && f.severity !== "ok" ? (
                <Button variant="outline" size="sm" onClick={() => setLetterFor(f)}>
                  Draft letter
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </Paywall>

      <LetterDialog finding={letterFor} state={state} servicer={servicer} comparison={comparison} onClose={() => setLetterFor(null)} />
    </div>
  );
}
