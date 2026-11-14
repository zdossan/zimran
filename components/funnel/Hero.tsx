// Landing hero (owned by P2, plans/02-funnel.md Task 4). The hero disclaimer sits directly under the buttons.
import Link from "next/link";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { Disclaimer } from "@/components/legal/Disclaimer";
import { SampleButtons } from "@/components/funnel/SampleButtons";

export function Hero() {
  return (
    <section className="space-y-5 py-4 sm:py-8">
      <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        Your SAVE plan is ending. See your cheapest legal plan in 60 seconds. No login.
      </h1>
      <p className="text-lg text-muted-foreground">Then let us check your servicer&apos;s statements for errors.</p>
      <div className="space-y-3">
        <Link href="/check" className={cn(buttonVariants({ size: "lg" }))}>
          Start the free check
        </Link>
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">Or see a sample borrower:</p>
          <SampleButtons />
        </div>
      </div>
      <Disclaimer variant="hero" />
    </section>
  );
}
