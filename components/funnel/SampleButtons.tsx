"use client";
// One-click sample borrowers (owned by P2). They load made-up answers, not the visitor's, and open the results.
import { useRouter } from "next/navigation";
import { saveSessionData } from "@/lib/supabase/session";
import { saveFunnelNotes } from "@/components/funnel/notesStore";
import { SAMPLE_KEYS, SAMPLE_NOTE, SAMPLES, type SampleKey } from "@/components/funnel/samples";
import { buttonClass } from "@/components/brand/kit";

export { SAMPLE_NOTE };

/** Saves a sample borrower (with the "not your numbers" note) and opens /results. */
export function useOpenSample() {
  const router = useRouter();
  return async (key: SampleKey) => {
    await saveSessionData("borrowerInput", SAMPLES[key].input).catch(() => undefined);
    saveFunnelNotes([SAMPLE_NOTE]);
    router.push("/results");
  };
}

export function SampleButtons() {
  const open = useOpenSample();
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SAMPLE_KEYS.map((key) => (
        <button key={key} type="button" className={buttonClass("secondary", "text-sm")} onClick={() => void open(key)}>
          {SAMPLES[key].button}
        </button>
      ))}
    </div>
  );
}
