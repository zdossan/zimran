"use client";
// "What if?" panel on the results page: dependents, filing status and spouse income re-run the engine instantly.
// They are hypotheticals — ResultsScreen never saves them; "Reset to my answers" brings back the saved ones.
import { useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { BorrowerInput, FilingStatus } from "@/lib/types";
import { buttonClass } from "@/components/brand/kit";
import { FILING_OPTIONS } from "@/components/funnel/quizTypes";
import { parseMoney } from "@/components/funnel/mapping";

const familySizeFor = (filing: FilingStatus, dependents: number) => 1 + (filing === "mfj" ? 1 : 0) + dependents;
const FIELD = "mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100";
const STEP_BUTTON = "grid size-11 place-items-center rounded-lg text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:opacity-40";

export function Toggles({
  input,
  onChange,
  changed = false,
  onReset,
}: {
  input: BorrowerInput;
  onChange: (next: BorrowerInput) => void;
  changed?: boolean;
  onReset?: () => void;
}) {
  const [spouseText, setSpouseText] = useState(input.spouseAgi !== undefined ? String(input.spouseAgi) : "");
  const update = (patch: Partial<BorrowerInput>) => {
    const next = { ...input, ...patch };
    onChange({ ...next, familySize: familySizeFor(next.filingStatus, next.dependents) });
  };
  const married = input.filingStatus === "mfj" || input.filingStatus === "mfs";

  return (
    <section aria-labelledby="whatif-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 id="whatif-heading" className="text-xl font-medium tracking-tight">
        What if?
      </h2>
      <p className="mt-1 text-sm text-slate-600">Try other answers. Nothing is saved.</p>
      {changed && onReset ? (
        <button type="button" onClick={onReset} className={buttonClass("ghost", "mt-3 -ml-3 px-3 text-sm")}>
          <RotateCcw aria-hidden className="size-4" />
          Reset to my answers
        </button>
      ) : null}

      <div className="mt-6 space-y-6">
        <div>
          <label htmlFor="toggle-filing" className="block text-sm font-semibold text-slate-900">
            Tax filing status
          </label>
          <select id="toggle-filing" className={FIELD} value={input.filingStatus} onChange={(e) => update({ filingStatus: e.target.value as FilingStatus })}>
            {FILING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {married ? (
          <div>
            <label htmlFor="toggle-spouse" className="block text-sm font-semibold text-slate-900">
              Your spouse&apos;s income (AGI)
            </label>
            <div className="relative">
              <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 mt-1 -translate-y-1/2 text-base text-slate-600">
                $
              </span>
              <input
                id="toggle-spouse"
                inputMode="decimal"
                autoComplete="off"
                placeholder="90,000"
                value={spouseText}
                className={`${FIELD} pl-7`}
                onChange={(e) => {
                  setSpouseText(e.target.value);
                  update({ spouseAgi: parseMoney(e.target.value) ?? undefined });
                }}
              />
            </div>
          </div>
        ) : null}

        <div>
          <p id="toggle-deps-label" className="text-sm font-semibold text-slate-900">
            Dependents
          </p>
          <div className="mt-2 inline-flex items-center gap-3 rounded-xl border border-slate-300 p-1" role="group" aria-labelledby="toggle-deps-label">
            <button type="button" aria-label="Remove a dependent" disabled={input.dependents <= 0} onClick={() => update({ dependents: input.dependents - 1 })} className={STEP_BUTTON}>
              <Minus aria-hidden className="size-5" />
            </button>
            <span className="w-8 text-center text-lg font-semibold" aria-live="polite">
              {input.dependents}
            </span>
            <button type="button" aria-label="Add a dependent" disabled={input.dependents >= 20} onClick={() => update({ dependents: input.dependents + 1 })} className={STEP_BUTTON}>
              <Plus aria-hidden className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
