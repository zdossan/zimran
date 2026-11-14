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

/** `glass` = translucent white for use on the indigo band; `light` (default) for light backgrounds. */
export function SampleButtons({ tone = "light" }: { tone?: "light" | "glass" }) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap gap-2">
      {SAMPLES.map((s) => (
        <Button
          key={s.label}
          type="button"
          variant="outline"
          className={tone === "glass" ? "h-10 rounded-xl border-white/30 bg-[#14142B]/25 font-semibold text-white hover:bg-[#14142B]/40 hover:text-white" : "h-10 rounded-xl font-semibold"}
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
