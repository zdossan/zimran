// A phone-style preview of a real result for the "single parent, 2 kids" sample — computed by the engine,
// never hard-coded, and clearly labelled "Sample".
import { computePlans } from "@/lib/engine";
import { SAMPLE_BORROWERS } from "@/lib/mocks";
import { PLAN_LABEL, PLAN_SHORT, wholeUSD } from "@/components/funnel/labels";

export function PreviewCard() {
  const c = computePlans(SAMPLE_BORROWERS.F2b);
  const rec = c.results.find((r) => r.plan === c.recommended && r.available);
  if (!rec) return null;
  const change = rec.balanceChange12m ?? 0;
  const others = c.results.filter((r) => r.available && r.plan !== rec.plan);

  return (
    <div data-testid="preview-card" className="mx-auto w-full max-w-sm rounded-[28px] bg-card p-5 text-foreground shadow-2xl ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-primary">Sample</span>
        <span className="text-xs font-semibold text-muted-foreground">Single parent, 2 kids</span>
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Your best plan · {PLAN_LABEL[rec.plan]}</p>
      <p className="mt-1 font-extrabold leading-none tracking-[-0.04em] text-primary">
        <span className="text-5xl">{wholeUSD(rec.monthlyPayment)}</span>
        <span className="ml-1 text-base font-bold tracking-normal text-muted-foreground">/mo</span>
      </p>
      <p className="mt-3 inline-block rounded-lg bg-[#E8F5EE] px-2 py-1 text-xs font-bold text-[#0B7A3B]">
        {change < 0 ? `↓ ${wholeUSD(-change)} this year` : `↑ ${wholeUSD(change)} this year`}
      </p>
      <ul className="mt-4 space-y-1.5 border-t pt-3 text-sm">
        {others.map((r) => (
          <li key={r.plan} className="flex justify-between text-muted-foreground">
            <span>{PLAN_SHORT[r.plan]}</span>
            <span className="font-semibold">
              {wholeUSD(r.monthlyPayment)}/mo · {(r.balanceChange12m ?? 0) > 0 ? "grows" : "shrinks"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
