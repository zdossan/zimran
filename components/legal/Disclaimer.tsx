// Owned by P4 (plans/04-pay-trust-pitch.md). Exact per-variant text lives in ./texts.ts, pulled
// verbatim from docs/research/08-student-loan-deep-dive.md §H (team substitutions applied there).
import { cn } from "cn";
import { DISCLAIMERS } from "./texts";

export type DisclaimerVariant = "footer" | "hero" | "results" | "paywall" | "letter" | "audit";

// Spec: NY §703 requires the hero disclaimer block at >=12-point (16px), bold. Inline style keeps
// this guarantee independent of whatever default text size/weight the other variants use.
const HERO_STYLE = { fontSize: "16px", fontWeight: 700 } as const;

export function Disclaimer({ variant }: { variant: DisclaimerVariant }) {
  const isHero = variant === "hero";
  // hero and paywall carry deliberate line breaks in texts.ts — each line is its own disclosure
  // clause (e.g. hero's separate NY §703-cited statements, paywall's "what you're buying" /
  // "what you're not buying" / "auto-renewal" clauses) and renders as its own <p>. The other
  // variants are a single unbroken paragraph in the spec, so splitting is a no-op for them
  // (one line in, one <p> out).
  const lines = DISCLAIMERS[variant].split("\n");
  return (
    <div data-variant={variant} className="space-y-1">
      {lines.map((line, index) => (
        <p
          key={index}
          className={cn(
            "leading-relaxed text-muted-foreground",
            isHero ? "font-bold text-foreground" : "text-xs"
          )}
          style={isHero ? HERO_STYLE : undefined}
        >
          {line}
        </p>
      ))}
    </div>
  );
}
