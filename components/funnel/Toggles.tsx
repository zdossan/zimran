"use client";
// Live what-ifs on the results page: dependents, filing status and spouse income re-run the engine instantly.
// They are hypotheticals — ResultsScreen never saves them; "Reset to my answers" brings back the saved ones.
import { useState } from "react";
import type { BorrowerInput, FilingStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FILING_OPTIONS } from "@/components/funnel/quizTypes";
import { parseMoney } from "@/components/funnel/mapping";

const familySizeFor = (filing: FilingStatus, dependents: number) => 1 + (filing === "mfj" ? 1 : 0) + dependents;

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
    <section aria-labelledby="whatif-heading" className="space-y-3 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="whatif-heading" className="font-semibold">
          What if…
        </h3>
        {changed && onReset ? (
          <Button type="button" variant="outline" size="sm" onClick={onReset}>
            Reset to my answers
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">Try changes here. Your saved answers stay as they are.</p>
      <div className="flex flex-wrap items-end gap-6">
        <div className="space-y-1.5">
          <p id="toggle-deps-label" className="text-sm font-medium">
            Dependents
          </p>
          <div className="flex items-center gap-3" role="group" aria-labelledby="toggle-deps-label">
            <Button type="button" variant="outline" size="sm" aria-label="Remove a dependent" disabled={input.dependents <= 0} onClick={() => update({ dependents: input.dependents - 1 })}>
              −
            </Button>
            <span className="min-w-6 text-center text-lg font-semibold" aria-live="polite">
              {input.dependents}
            </span>
            <Button type="button" variant="outline" size="sm" aria-label="Add a dependent" disabled={input.dependents >= 20} onClick={() => update({ dependents: input.dependents + 1 })}>
              +
            </Button>
          </div>
        </div>
        <div className="min-w-48 flex-1 space-y-1.5">
          <Label htmlFor="toggle-filing">Tax filing status</Label>
          <select
            id="toggle-filing"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-base md:text-sm"
            value={input.filingStatus}
            onChange={(e) => update({ filingStatus: e.target.value as FilingStatus })}
          >
            {FILING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {married ? (
          <div className="min-w-48 flex-1 space-y-1.5">
            <Label htmlFor="toggle-spouse">Your spouse&apos;s income (AGI)</Label>
            <Input
              id="toggle-spouse"
              inputMode="decimal"
              autoComplete="off"
              placeholder="90,000"
              value={spouseText}
              onChange={(e) => {
                setSpouseText(e.target.value);
                update({ spouseAgi: parseMoney(e.target.value) ?? undefined });
              }}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
