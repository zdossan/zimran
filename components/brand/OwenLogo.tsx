// The Owen wordmark (from the brand pack, public/brand/logo*.svg), inline so it stays crisp at any size and
// each instance gets its own gradient id. `tone="dark"` is the on-dark version (white letters, light ring).
import { useId } from "react";

const RING = "M30,0 A30,30 0 1 1 1.81,19.74";
const LETTERS = ["M85,0 L103,60 L125,0 L147,60 L165,0", "M190,30 H250 A30,30 0 1 0 239.28,52.98", "M275,60 V26 A26,26 0 0 1 327,26 V60"];

export function OwenLogo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const id = `owen-ring-${useId().replace(/:/g, "")}`;
  const [from, to, ink] = tone === "dark" ? ["#6A61F0", "#EEEDFC", "#FFFFFF"] : ["#4840BB", "#6A61F0", "#14142B"];
  return (
    <svg viewBox="-10 -10 346 80" role="img" aria-label="Owen" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <g fill="none" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round">
        <path d={RING} stroke={`url(#${id})`} />
        {LETTERS.map((d) => (
          <path key={d} d={d} stroke={ink} />
        ))}
      </g>
    </svg>
  );
}
