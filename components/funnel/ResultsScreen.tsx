"use client";
// Loads the saved answers, runs the engine, and owns the what-if toggles (owned by P2).
import { useEffect, useMemo, useState } from "react";
import type { BorrowerInput, FilingComparison, PlanComparison } from "@/lib/types";
import { compareFiling, computePlans } from "@/lib/engine";
import { loadSessionData } from "@/lib/supabase/session";
import { loadFunnelNotes } from "@/components/funnel/notesStore";
import { ResultsView } from "@/components/funnel/ResultsView";

/** Just enough shape-checking that stale or hand-edited storage can't crash the page. */
function looksLikeInput(v: unknown): v is BorrowerInput {
  const o = v as Partial<BorrowerInput> | null;
  return !!o && typeof o.agi === "number" && typeof o.dependents === "number" && typeof o.filingStatus === "string" && Array.isArray(o.loans);
}

function run(input: BorrowerInput | null): { comparison: PlanComparison | null; filing?: FilingComparison } {
  if (!input) return { comparison: null };
  try {
    const comparison = computePlans(input);
    const married = input.filingStatus === "mfj" || input.filingStatus === "mfs";
    const filing = married && input.spouseAgi !== undefined ? compareFiling({ ...input, spouseAgi: input.spouseAgi }) : undefined;
    return { comparison, filing };
  } catch {
    return { comparison: null };
  }
}

export function ResultsScreen() {
  // `saved` is what the borrower answered; `input` is the current what-if. What-ifs are never saved.
  const [saved, setSaved] = useState<BorrowerInput | null | undefined>(undefined);
  const [input, setInput] = useState<BorrowerInput | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    loadSessionData<unknown>("borrowerInput")
      .then((v) => {
        const ok = looksLikeInput(v) ? v : null;
        setNotes(loadFunnelNotes());
        setSaved(ok);
        setInput(ok);
      })
      .catch(() => setSaved(null));
  }, []);

  const { comparison, filing } = useMemo(() => run(input), [input]);
  const changed = !!saved && !!input && JSON.stringify(saved) !== JSON.stringify(input);

  if (saved === undefined) {
    return (
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Loading your results…
      </p>
    );
  }

  return (
    <ResultsView
      comparison={comparison}
      filing={filing}
      notes={notes}
      onChange={setInput}
      changed={changed}
      version={version}
      onReset={() => {
        setInput(saved);
        setVersion((n) => n + 1);
      }}
    />
  );
}
