// One-line trust row under the hero button. Honest facts only — no invented user counts, ratings or press.
import { ListChecks, ShieldCheck, Timer } from "lucide-react";

const ITEMS = [
  { icon: ListChecks, text: "4 plans compared" },
  { icon: Timer, text: "6 questions · no login" },
  { icon: ShieldCheck, text: "0 passwords asked" },
];

export function StatTiles() {
  return (
    <ul aria-label="At a glance" className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
      {ITEMS.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-center gap-1.5">
          <Icon aria-hidden className="size-4 text-brand-600" />
          {text}
        </li>
      ))}
    </ul>
  );
}
