// Honest facts only — no invented user counts, ratings or press.
import { ListChecks, ShieldCheck, Timer } from "lucide-react";

const TILES = [
  { icon: ListChecks, text: "4 plans compared", sub: "RAP, IBR, 10-year and Tiered Standard" },
  { icon: Timer, text: "6 questions · no login", sub: "No email, no account" },
  { icon: ShieldCheck, text: "0 passwords asked", sub: "We never ask for your FSA ID" },
];

export function StatTiles() {
  return (
    <section aria-label="At a glance" className="grid gap-3 sm:grid-cols-3">
      {TILES.map(({ icon: Icon, text, sub }) => (
        <div key={text} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
            <Icon aria-hidden className="size-5" />
          </span>
          <div>
            <p className="font-extrabold">{text}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
