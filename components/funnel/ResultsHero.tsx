// The results band: lead with the answer — plan, giant monthly number, two facts.
import type { PlanComparison } from "@/lib/types";
import { Band, GlassChip, ON_BAND_FILL } from "@/components/brand/Band";
import { PLAN_FULL_NAME, PLAN_LABEL, RULES_DATE_LABEL, wholeUSD } from "@/components/funnel/labels";

function balanceChip(change: number) {
  if (change < 0) return `↓ ${wholeUSD(-change)} this year`;
  if (change > 0) return `↑ ${wholeUSD(change)} this year`;
  return "Balance flat this year";
}

export function ResultsHero({ comparison, notes = [] }: { comparison: PlanComparison; notes?: string[] }) {
  const rec = comparison.results.find((r) => r.plan === comparison.recommended && r.available);

  return (
    <Band>
      {notes.map((n) => (
        <p key={n} className={`mb-4 rounded-xl ${ON_BAND_FILL} px-3 py-2 text-sm font-semibold`}>
          {n}
        </p>
      ))}
      {rec ? (
        <>
          <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-white/90">Your best plan: {PLAN_LABEL[rec.plan]}</h2>
          <p className="mt-2 font-extrabold leading-none tracking-[-0.04em]" style={{ fontSize: "clamp(2.75rem, 14vw, 4.5rem)" }}>
            <span data-testid="hero-number">{wholeUSD(rec.monthlyPayment)}</span>
            <span className="ml-1 text-lg font-bold tracking-normal text-white/80">/mo</span>
          </p>
          <p className="mt-2 text-lg font-bold">{PLAN_FULL_NAME[rec.plan]}</p>
          <div data-testid="hero-chips" className="mt-4 flex flex-wrap gap-2">
            <GlassChip>{balanceChip(rec.balanceChange12m ?? 0)}</GlassChip>
            {comparison.pslfTrack && rec.pslfQualifying ? <GlassChip>Counts toward PSLF ✓</GlassChip> : null}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-extrabold tracking-tight">We can&apos;t compare plans for these loans</h2>
          <p className="mt-2 max-w-xl text-white/80">None of the loans you entered are covered by RAP, IBR or the Standard plans in this check.</p>
        </>
      )}
      <p className="mt-4 text-xs font-semibold text-white/90">Estimate · Rules as of {RULES_DATE_LABEL}</p>
    </Band>
  );
}
