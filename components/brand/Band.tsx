// The indigo gradient band every page opens with (docs/superpowers/specs/2026-11-15-ui-redesign-design.md).
// Anchored bottom-right so its top edge is BAND_TOP — the header colour — and the two read as one surface.
import type { ReactNode } from "react";

export const BAND_TOP = "#2A2475";
export const GRADIENT = "radial-gradient(120% 90% at 90% 100%, #6A61F0 0%, #4840BB 45%, #2A2475 100%)";

/**
 * Full-bleed band under the header. Cancels <main>'s top padding so it sits flush.
 * Sized in container units of <body> (a size container, see app/layout.tsx): 100vw would include the
 * desktop scrollbar and let the page scroll sideways.
 */
export function Band({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      data-band
      className={`-mt-8 mb-8 text-white ${className}`}
      style={{ background: GRADIENT, width: "100cqw", marginInline: "calc(50% - 50cqw)" }}
    >
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-6">{children}</div>
    </section>
  );
}

/** Dark translucent fill for small white text on the band: a white glass fill drops below 4.5:1 near the glow. */
export const ON_BAND_FILL = "border border-white/25 bg-[#14142B]/25";

/** Translucent pill for facts shown on the band. */
export function GlassChip({ children }: { children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-xl ${ON_BAND_FILL} px-3 py-1.5 text-sm font-bold text-white`}>
      {children}
    </span>
  );
}
