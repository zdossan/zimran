// "Questions borrowers ask us" (rette.ai-style FAQ: heading and CTA on the left, + accordion on the right).
// Answers must stay true to the product and the legal texts.
import Link from "next/link";
import { Plus } from "lucide-react";
import { Eyebrow, buttonClass } from "@/components/brand/kit";
import { PRICE_FROM, RULES_DATE_LABEL } from "@/components/funnel/labels";

const QA = [
  {
    q: "Is Owen free?",
    a: `The plan check and the statement check are free. The dated action plan, letters, reminders and report cost ${PRICE_FROM} or $79 a year, and you can cancel anytime. Applying for a repayment plan is always free at StudentAid.gov.`,
  },
  {
    q: "Do you need my FSA ID?",
    a: "No. We never ask for your FSA ID or password, and you should never share it with anyone. You apply for plans yourself on StudentAid.gov or through your servicer.",
  },
  {
    q: "Is Owen part of the government?",
    a: "No. Owen is an independent company. We are not affiliated with the U.S. Department of Education, Federal Student Aid, or any loan servicer.",
  },
  {
    q: "How does Owen make money?",
    a: "From the optional subscription, and nothing else. We don't take commissions from servicers or lenders, and nobody pays us to recommend a plan.",
  },
  {
    q: "How accurate are the numbers?",
    a: `They're estimates from what you enter and the federal rules as of ${RULES_DATE_LABEL}. Every number shows the rule it comes from. Check with your servicer before you act.`,
  },
  {
    q: "What happens to the statement I upload?",
    a: "It's sent to our AI provider (Anthropic) to read the numbers, then checked against the rules. We don't store the file.",
  },
  {
    q: "Can I use Owen in New York or California?",
    a: "Yes, the free tools work everywhere. Paid plans aren't available in New York or California yet.",
  },
];

export function Faq() {
  return (
    <section data-page="faq" aria-labelledby="faq-heading" className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
      <div className="space-y-5">
        <Eyebrow>FAQ</Eyebrow>
        <h2 id="faq-heading" className="text-3xl font-normal leading-tight tracking-tight sm:text-4xl">
          Questions borrowers ask us
        </h2>
        <p className="hidden text-base font-light text-slate-600 sm:block sm:text-lg">Still unsure? The free check takes about a minute and needs no account.</p>
        <Link href="/check" className={buttonClass("primary", "hidden sm:inline-flex")}>
          Try the free check
        </Link>
      </div>
      <div className="divide-y divide-slate-200 border-y border-slate-200">
        {QA.map(({ q, a }) => (
          <details key={q} className="group">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[15px] font-medium sm:min-h-14 sm:text-base text-slate-900 [&::-webkit-details-marker]:hidden">
              <span>{q}</span>
              <Plus aria-hidden className="size-5 shrink-0 text-brand-700 transition-transform group-open:rotate-45" />
            </summary>
            <p className="pb-5 pr-8 text-[15px] font-light leading-relaxed text-slate-700">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
