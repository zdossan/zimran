// "How it works" (one card, three steps), the two verbatim borrower quotes
// (docs/research/08h-reddit-quotes.md #2 and #10) and the closing call to action.
import Link from "next/link";
import { ClipboardList, FileSearch, LineChart, Quote } from "lucide-react";
import { Card, Eyebrow, buttonClass } from "@/components/brand/kit";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Answer six short questions",
    body: "Income, family, loans and where you work. No login, no email, never your FSA ID.",
  },
  {
    icon: LineChart,
    title: "Compare every plan",
    body: "RAP, IBR, 10-year and Tiered Standard side by side, with the rule behind each number.",
  },
  {
    icon: FileSearch,
    title: "Check your statement",
    body: "Upload a bill. We check your servicer's math and draft a letter you can send.",
  },
];

// Verbatim, author's spelling kept; trimmed only at the start ("…").
const QUOTES = [
  "…SAVE was 497 new IDR plan is 2157 a month. Trying to figure out if I should sell my house or take my child out of daycare and have my wife split a vehicle.",
  "…My interest subsidy should be 93.21/month. I received $53.11.",
];

// Each section is its own screen-sized "page" with the same container and rhythm.
const PAGE = "mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16";
const SECTION_HEAD =
  "mt-3 text-3xl font-normal leading-tight tracking-tight sm:text-4xl";

export function HowItWorks() {
  return (
    <>
      <section
        id="how-it-works"
        data-page="how"
        aria-labelledby="how-heading"
        className={`scroll-mt-24 ${PAGE}`}
      >
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 id="how-heading" className={SECTION_HEAD}>
            How it works
          </h2>
          <p className="mt-3 text-base font-light text-slate-600 sm:text-lg">
            Three steps, from quiz to letter.
          </p>
        </div>
        <Card className="mt-8 p-0 sm:p-0">
          <ol
            aria-label="Three steps"
            className="grid divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0"
          >
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="flex gap-4 p-5 sm:p-7">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-700 text-base font-medium text-white">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 text-base font-semibold">
                    {title}
                    <Icon aria-hidden className="size-4 text-brand-600" />
                  </h3>
                  <p className="mt-1.5 text-[15px] font-light leading-relaxed text-slate-600">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <section
        data-page="quotes"
        aria-labelledby="quotes-heading"
        className={PAGE}
      >
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Why it matters</Eyebrow>
          <h2 id="quotes-heading" className={SECTION_HEAD}>
            Borrowers are seeing this right now
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {QUOTES.map((q) => (
            <figure
              key={q}
              className="rounded-[24px] bg-white p-5 ring-1 ring-slate-900/5 sm:p-6"
            >
              <Quote aria-hidden className="size-5 text-brand-600" />
              <blockquote className="mt-2 text-base text-slate-800">
                “{q}”
              </blockquote>
              <figcaption className="mt-3 text-sm text-slate-500">
                — r/StudentLoans, 2026
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}

/** The closing call to action, the last page of the landing. */
export function ClosingCta() {
  return (
    <section data-page="cta" aria-label="Start the check" className={PAGE}>
      <div className="flex flex-col items-start gap-5 rounded-[28px] bg-brand-gradient p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div>
          <p className="text-2xl font-normal tracking-tight sm:text-3xl">
            Ready to see your numbers?
          </p>
          <p className="mt-1.5 text-base font-light text-white/85">
            Free to start. No account needed.
          </p>
        </div>
        <Link
          href="/check"
          className={buttonClass(
            "secondary",
            "w-full text-brand-900 ring-0 focus-visible:ring-white focus-visible:ring-offset-brand-900 sm:w-auto",
          )}
        >
          Start the 60-second check
        </Link>
      </div>
    </section>
  );
}
