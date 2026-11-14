// Big tappable tiles built on real radio inputs (visually hidden), so arrow keys, focus and screen
// readers behave natively. `grid` lays short options out 2×2; `list` stacks full-width tiles.
import type { LucideIcon } from "lucide-react";

export function Choices<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  layout = "list",
  icons,
  hideLegend = false,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string; hint?: string }[];
  value?: T;
  onChange: (v: T) => void;
  layout?: "list" | "grid";
  icons?: Partial<Record<T, LucideIcon>>;
  /** The band already asks this question visibly; keep the legend for screen readers only. */
  hideLegend?: boolean;
}) {
  return (
    <fieldset>
      <legend className={hideLegend ? "sr-only" : "mb-3 text-sm font-bold"}>{legend}</legend>
      <div className={layout === "grid" ? "grid grid-cols-2 gap-3" : "space-y-2"}>
        {options.map((o) => {
          const Icon: LucideIcon | undefined = icons?.[o.value];
          return (
            <label
              key={o.value}
              className={`group flex cursor-pointer rounded-2xl bg-card p-4 text-sm shadow-sm ring-1 ring-border transition has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:ring-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 ${
                layout === "grid" ? "min-h-24 flex-col justify-between gap-3" : "items-center gap-3"
              }`}
            >
              <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
              {Icon ? (
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary group-has-[:checked]:bg-white/20 group-has-[:checked]:text-white">
                  <Icon aria-hidden className="size-5" />
                </span>
              ) : null}
              <span>
                <span className="font-bold">{o.label}</span>
                {o.hint ? <span className="block text-xs opacity-75">{o.hint}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
