"use client";
// "See it with a sample borrower": two made-up borrowers as compact cards — who they are (chips), the engine's
// real answer (highlighted), one main action to open their results, and a link to walk through the quiz.
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import type { BorrowerInput, Employer } from "@/lib/types";
import { computePlans } from "@/lib/engine";
import { Card, SampleTag, buttonClass } from "@/components/brand/kit";
import { useOpenSample } from "@/components/funnel/SampleButtons";
import { SAMPLE_KEYS, SAMPLES } from "@/components/funnel/samples";
import { FILING_OPTIONS } from "@/components/funnel/quizTypes";
import {
  PLAN_FULL_NAME,
  RULES_DATE_LABEL,
  wholeUSD,
} from "@/components/funnel/labels";

const EMPLOYER_SHORT: Record<Employer, string> = {
  government: "Public service",
  nonprofit: "Nonprofit",
  private: "Private employer",
};

function facts(b: BorrowerInput): string[] {
  const balance = b.loans.reduce((sum, l) => sum + l.balance, 0);
  const rate = b.loans[0] ? `${+(b.loans[0].rate * 100).toFixed(2)}%` : "";
  return [
    `${wholeUSD(b.agi)} income`,
    FILING_OPTIONS.find((o) => o.value === b.filingStatus)?.label ??
      b.filingStatus,
    ...(b.spouseAgi !== undefined ? [`Spouse ${wholeUSD(b.spouseAgi)}`] : []),
    `${b.dependents} dependent${b.dependents === 1 ? "" : "s"}`,
    `${wholeUSD(balance)} at ${rate}`,
    EMPLOYER_SHORT[b.employer],
    ...(b.currentPlan === "SAVE" ? ["On SAVE"] : []),
  ];
}

export function SampleCards() {
  const open = useOpenSample();
  return (
    <>
      <ul
        aria-label="Sample borrowers"
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {SAMPLE_KEYS.map((key) => {
          const s = SAMPLES[key];
          const c = computePlans(s.input);
          const rec = c.results.find(
            (r) => r.plan === c.recommended && r.available,
          );
          const change = rec?.balanceChange12m ?? 0;
          const titleId = `sample-${key}-title`;
          return (
            <li
              key={key}
              className="flex w-[86%] shrink-0 snap-center md:w-auto"
            >
              <Card
                data-testid={`sample-card-${key}`}
                className="flex flex-1 flex-col p-4 sm:p-7"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                    <Users aria-hidden className="size-5" />
                  </span>
                  <h3
                    id={titleId}
                    className="min-w-0 flex-1 text-lg font-medium tracking-tight"
                  >
                    {s.title}
                  </h3>
                  <SampleTag />
                </div>
                <ul
                  aria-label="About this borrower"
                  className="mt-3 flex flex-wrap gap-1.5"
                >
                  {facts(s.input).map((f) => (
                    <li
                      key={f}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 sm:px-2.5 sm:py-1 sm:text-[13px]"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
                {rec ? (
                  <>
                    <div className="mt-4 flex items-end justify-between gap-4 rounded-2xl bg-brand-50 p-3.5 sm:p-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                          Best plan
                        </p>
                        <p className="mt-1 font-medium leading-snug text-slate-900">
                          {PLAN_FULL_NAME[rec.plan]}
                        </p>
                        <p
                          className={`mt-1 text-sm ${change > 0 ? "text-red-800" : "text-emerald-800"}`}
                        >
                          {change < 0
                            ? `↓ ${wholeUSD(-change)} this year`
                            : change > 0
                              ? `↑ ${wholeUSD(change)} this year`
                              : "Balance flat this year"}
                        </p>
                      </div>
                      <p
                        data-testid="sample-payment"
                        className="shrink-0 text-3xl font-medium tracking-tight text-brand-700"
                      >
                        {wholeUSD(rec.monthlyPayment)}
                        <span className="text-base font-normal text-slate-600">
                          /mo
                        </span>
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Estimate · Rules as of {RULES_DATE_LABEL}
                    </p>
                  </>
                ) : null}
                <div className="mt-auto flex flex-col gap-0.5 pt-4 sm:flex-row sm:items-center sm:gap-5">
                  <button
                    type="button"
                    aria-describedby={titleId}
                    onClick={() => void open(key)}
                    className={buttonClass("primary", "w-full sm:w-auto")}
                  >
                    See their results
                    <ArrowRight aria-hidden className="size-4" />
                  </button>
                  <Link
                    href={`/check?sample=${key}`}
                    aria-describedby={titleId}
                    className="inline-flex min-h-11 items-center justify-center text-[15px] font-medium text-brand-800 hover:underline"
                  >
                    Walk through it in the quiz
                  </Link>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-center text-sm text-slate-500 md:hidden">
        Swipe to see the other sample →
      </p>
    </>
  );
}
