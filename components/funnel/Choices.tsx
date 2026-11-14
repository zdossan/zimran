// Native radio buttons styled as tappable cards — keyboard (arrow keys) and screen-reader behaviour come for free.
export function Choices<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string; hint?: string }[];
  value?: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      {options.map((o) => (
        <label
          key={o.value}
          className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
        >
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="mt-0.5" />
          <span>
            <span className="font-medium">{o.label}</span>
            {o.hint ? <span className="block text-xs text-muted-foreground">{o.hint}</span> : null}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
