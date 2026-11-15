// Choice cards: a visible native radio inside each tappable card, so arrow keys, focus and screen readers
// behave natively. `grid` lays short options out two per row on wider screens; `list` stacks them.
export function Choices<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  layout = "list",
  hideLegend = false,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string; hint?: string }[];
  value?: T;
  onChange: (v: T) => void;
  layout?: "list" | "grid" | "inline";
  /** The card title already asks this question visibly; keep the legend for screen readers only. */
  hideLegend?: boolean;
}) {
  return (
    <fieldset>
      <legend className={hideLegend ? "sr-only" : "mb-2 text-sm font-semibold text-slate-900"}>{legend}</legend>
      <div className={layout === "grid" ? "grid grid-cols-2 gap-2" : layout === "inline" ? "grid grid-cols-3 gap-2" : "space-y-2"}>
        {options.map((o) => (
          <label
            key={o.value}
            className="flex min-h-12 cursor-pointer items-start gap-2.5 rounded-xl border border-slate-300 bg-white p-3 transition duration-200 hover:border-slate-400 hover:bg-slate-50 has-[:checked]:border-brand-700 has-[:checked]:bg-brand-50 has-[:checked]:ring-1 has-[:checked]:ring-brand-700 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="mt-px size-[18px] shrink-0 accent-brand-700 focus-visible:outline-none"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-900">{o.label}</span>
              {o.hint ? <span className="mt-0.5 block text-xs text-slate-600">{o.hint}</span> : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
