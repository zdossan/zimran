import { Hero } from "@/components/funnel/Hero";
import { ClosingCta, HowItWorks } from "@/components/funnel/HowItWorks";
import { SampleCards } from "@/components/funnel/SampleCards";
import { Faq } from "@/components/funnel/Faq";
import { Eyebrow } from "@/components/brand/kit";

export default function Home() {
  return (
    <>
      <Hero />
      <section
        id="samples"
        data-page="samples"
        aria-labelledby="samples-heading"
        className="scroll-mt-24"
      >
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Try it</Eyebrow>
            <h2
              id="samples-heading"
              className="mt-3 text-3xl font-normal leading-tight tracking-tight sm:text-4xl"
            >
              See it with a sample borrower
            </h2>
            <p className="mt-3 text-base font-light text-slate-600 sm:text-lg">
              Made-up borrowers, real rules engine.
            </p>
          </div>
          <div className="mt-6 md:mt-8">
            <SampleCards />
          </div>
        </div>
      </section>
      <HowItWorks />
      <Faq />
      <ClosingCta />
    </>
  );
}
