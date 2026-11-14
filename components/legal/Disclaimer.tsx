// Owned by P4 (plans/04-pay-trust-pitch.md). Exact per-variant text lives in ./texts.ts, pulled
// verbatim from docs/research/08-student-loan-deep-dive.md §H (team substitutions applied there).
import { cn } from "cn";
import { DISCLAIMERS } from "./texts";

export type DisclaimerVariant = "footer" | "hero" | "results" | "paywall" | "letter" | "audit";

// Spec: NY §703 requires the hero disclaimer block to render at >=12px, bold. Inline style keeps
// this guarantee independent of whatever default text size/weight the other variants use.
const HERO_STYLE = { fontSize: "14px", fontWeight: 700 } as const;

export function Disclaimer({ variant }: { variant: DisclaimerVariant }) {
  const isHero = variant === "hero";
  return (
    <p
      data-variant={variant}
      className={cn(
        "leading-relaxed text-muted-foreground",
        isHero ? "font-bold text-foreground" : "text-xs"
      )}
      style={isHero ? HERO_STYLE : undefined}
    >
      {DISCLAIMERS[variant]}
    </p>
  );
}
