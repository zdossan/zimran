// A real result for the "single parent, 2 kids" sample, shown inside a product window — computed by the engine,
// never hard-coded, and clearly labelled "Sample".
import { computePlans } from "@/lib/engine";
import { SAMPLE_BORROWERS } from "@/lib/mocks";
import { AppWindow, SampleTag } from "@/components/brand/kit";
import { PLAN_FULL_NAME, PLAN_LABEL, RULES_DATE_LABEL, wholeUSD } from "@/components/funnel/labels";

export function PreviewCard() {
  const c = computePlans(SAMPLE_BORROWERS.F2b);
  const rec = c.results.find((r) => r.plan === c.recommended && r.available);
  if (!rec) return null;
  const change = rec.balanceChange12m ?? 0;
  const others = c.results.filter((r) => r.available && r.plan !== rec.plan);

  return (
    <AppWindow title="Owen · your results" className="w-full">
      <div data-testid="preview-card" className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Recommended plan</p>
          <SampleTag />
        </div>
        <p className="mt-4 text-xl font-medium tracking-tight sm:text-2xl">
          {PLAN_FULL_NAME[rec.plan]} ({PLAN_LABEL[rec.plan]})
        </p>
        <p className="mt-2 text-sm font-light text-slate-600">Estimated monthly payment</p>
        <p className="mt-1 text-6xl font-medium tracking-tight text-brand-700">{wholeUSD(rec.monthlyPayment)}</p>
        <p className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
          {change < 0 ? `↓ ${wholeUSD(-change)} this year` : change > 0 ? `↑ ${wholeUSD(change)} this year` : "Balance flat this year"}
        </p>
        <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
          {others.map((r) => (
            <div key={r.plan} className="flex items-center justify-between gap-3 text-[15px]">
              <span className="font-light text-slate-700">{PLAN_FULL_NAME[r.plan]}</span>
              <span className="shrink-0 font-medium text-slate-900">{wholeUSD(r.monthlyPayment)} / mo</span>
            </div>
          ))}
        </div>
        <p className="mt-6 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
          Single parent with 2 kids. Estimate · Rules as of {RULES_DATE_LABEL}. Your own numbers will differ.
        </p>
      </div>
    </AppWindow>
  );
}
