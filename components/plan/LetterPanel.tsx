"use client";
// A pre-filled letter the borrower copies, checks and sends themselves (lib/letters).
import { useState } from "react";
import type { LetterTemplateId, PlanComparison } from "@/lib/types";
import { renderLetter } from "@/lib/letters";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { buttonClass } from "@/components/brand/kit";

export const LETTER_NAME: Record<LetterTemplateId, string> = {
  plan_switch: "plan-switch letter",
  billing_dispute: "billing dispute letter",
  cfpb_complaint: "CFPB complaint letter",
};

export function LetterPanel({ id, comparison, servicer, now }: { id: LetterTemplateId; comparison: PlanComparison; servicer?: string; now: Date }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = open ? renderLetter(id, { comparison, servicer, today: now }) : "";

  return (
    <div className="space-y-3">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={buttonClass("secondary", "text-sm")}>
        Get the {LETTER_NAME[id]}
      </button>
      {open ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Fill in the blanks, check every fact, then send it yourself.</p>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-3 text-xs leading-relaxed text-slate-800">{text}</pre>
          <button
            type="button"
            className={buttonClass("primary", "text-sm")}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? "Copied" : "Copy letter"}
          </button>
          <Disclaimer variant="letter" />
        </div>
      ) : null}
    </div>
  );
}
