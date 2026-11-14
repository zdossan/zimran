"use client";
// One-click sample borrowers (owned by P2). They load made-up answers, not the visitor's.
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveSessionData } from "@/lib/supabase/session";
import { SAMPLE_BORROWERS } from "@/lib/mocks";
import { saveFunnelNotes } from "@/components/funnel/notesStore";
import type { BorrowerInput } from "@/lib/types";

export const SAMPLE_NOTE = "Sample borrower — these are not your numbers. Start the check to see yours.";

const SAMPLES: { label: string; input: BorrowerInput }[] = [
  { label: "Try: single parent, 2 kids", input: SAMPLE_BORROWERS.F2b },
  { label: "Try: married teacher", input: SAMPLE_BORROWERS.F4 },
];

export function SampleButtons() {
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-2">
      {SAMPLES.map((s) => (
        <Button
          key={s.label}
          type="button"
          variant="outline"
          onClick={async () => {
            await saveSessionData("borrowerInput", s.input).catch(() => undefined);
            saveFunnelNotes([SAMPLE_NOTE]);
            router.push("/results");
          }}
        >
          {s.label}
        </Button>
      ))}
    </div>
  );
}
