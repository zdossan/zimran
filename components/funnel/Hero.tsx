// Landing hero — the first screen: headline with the promise in our indigo, one main button, a one-line trust
// row, and (desktop) the engine-computed sample result in a product window. Fits one screen on phones and
// fills the first screen on desktop. The hero legal box was removed at the owner's request (2026-11-15).
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Badge, buttonClass } from "@/components/brand/kit";
import { PreviewCard } from "@/components/funnel/PreviewCard";
import { StatTiles } from "@/components/funnel/StatTiles";

export function Hero() {
  return (
    <section data-page="hero" className="relative -mt-20 overflow-hidden pt-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_60%_at_85%_25%,var(--color-brand-100),transparent_70%),radial-gradient(40%_40%_at_10%_0%,var(--color-brand-50),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-8 sm:px-6 md:pt-14 lg:min-h-[calc(100svh-5.5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:py-10">
        <div>
          <Badge tone="primary" className="text-xs sm:text-sm">For federal student loan borrowers</Badge>
          <h1 className="mt-5 text-[30px] font-normal leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-[56px]">
            Your SAVE plan is ending. <span className="text-brand-700">See your cheapest legal plan in 60 seconds.</span> No login.
          </h1>
          <p className="mt-5 max-w-lg text-base font-light text-slate-600 sm:text-lg">Then let us check your servicer&apos;s statements for errors.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link href="/check" className={buttonClass("primary", "w-full px-8 py-3.5 sm:w-auto")}>
              Start the free check
              <ArrowRight aria-hidden className="size-5" />
            </Link>
            <Link href="/#samples" className="inline-flex min-h-11 items-center justify-center gap-1.5 text-[15px] font-medium text-brand-800 hover:underline sm:justify-start">
              See a sample borrower
              <ArrowDown aria-hidden className="size-4" />
            </Link>
          </div>
          <StatTiles />
        </div>
        {/* Desktop only: on phones the sample section right below shows the same borrower. */}
        <div className="hidden lg:block">
          <PreviewCard />
        </div>
      </div>
    </section>
  );
}
