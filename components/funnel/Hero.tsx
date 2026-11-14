// Landing hero on the indigo band. The hero disclaimer (NY §703: near the CTA) follows the buttons directly,
// in its own white card, never collapsed. The preview card sits beside the text on desktop, after it on phones.
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { Band } from "@/components/brand/Band";
import { SampleButtons } from "@/components/funnel/SampleButtons";
import { PreviewCard } from "@/components/funnel/PreviewCard";

export function Hero() {
  return (
    <Band>
      <div className="grid items-start gap-8 py-2 lg:grid-cols-[1.15fr_1fr] lg:py-6">
        <div className="space-y-5">
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
            Your SAVE plan is ending. See your cheapest legal plan in 60 seconds. No login.
          </h1>
          <p className="text-lg text-white/85">Then let us check your servicer&apos;s statements for errors.</p>
          <div className="space-y-3">
            <Link
              href="/check"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 text-base font-extrabold text-primary shadow-[0_12px_28px_-12px_rgba(0,0,0,0.45)] transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#4840BB] sm:w-auto"
            >
              Start the free check
              <ArrowRight aria-hidden className="size-5" />
            </Link>
            <div className="space-y-1.5">
              <p className="text-sm text-white/90">Or see a sample borrower:</p>
              <SampleButtons tone="glass" />
            </div>
          </div>
          <div className="rounded-2xl bg-card p-4 text-foreground shadow-sm">
            <Disclaimer variant="hero" />
          </div>
        </div>
        <PreviewCard />
      </div>
    </Band>
  );
}
