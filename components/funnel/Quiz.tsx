"use client";
// Six-step quiz → BorrowerInput (owned by P2). No login, no email, never an FSA ID.
// One card per step (layout from the owner's Bolt prototype): progress on top, the question and why we ask,
// the fields, sample borrowers that pre-fill the quiz, and a sticky Back / Continue bar with the error inside.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  Pencil,
  Plus,
} from "lucide-react";
import { saveSessionData } from "@/lib/supabase/session";
import { buttonClass } from "@/components/brand/kit";
import { Choices } from "@/components/funnel/Choices";
import { saveFunnelNotes } from "@/components/funnel/notesStore";
import { wholeUSD } from "@/components/funnel/labels";
import {
  askJuly2014,
  CURRENT_YEAR,
  parseMoney,
  parsePercent,
  toBorrowerInput,
  validateStep,
} from "@/components/funnel/mapping";
import {
  EMPLOYER_OPTIONS,
  FILING_OPTIONS,
  JULY_2014_OPTIONS,
  PLAN_OPTIONS,
  STEP_HINTS,
  STEP_QUESTIONS,
  US_STATES,
  type QuizAnswers,
  type QuizStep,
} from "@/components/funnel/quizTypes";
import {
  SAMPLE_ANSWERS,
  SAMPLE_KEYS,
  SAMPLE_NOTE,
  SAMPLES,
  type SampleKey,
} from "@/components/funnel/samples";

const INPUT =
  "min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-base text-slate-900 placeholder:text-slate-500 transition focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-100";
const YEARS = Array.from(
  { length: CURRENT_YEAR - 1979 },
  (_, i) => CURRENT_YEAR - i,
);
const EMPTY: Partial<QuizAnswers> = {
  dependents: 0,
  spouseHasLoans: false,
  newLoanSinceJuly2026: false,
  state: "",
};

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-900"
      >
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** A money input with a "$" prefix and the numeric keypad. */
function MoneyInput({
  id,
  value,
  onChange,
  placeholder,
  hinted,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  hinted?: boolean;
}) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-slate-600"
      >
        $
      </span>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hinted ? `${id}-hint` : undefined}
        className={`${INPUT} pl-8`}
      />
    </div>
  );
}

function CheckRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 bg-white p-3 transition hover:bg-slate-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-5 shrink-0 accent-brand-700 focus-visible:outline-none"
      />
      <span className="text-sm font-medium text-slate-900">{label}</span>
    </label>
  );
}

type Chip = { step: QuizStep; what: string; value: string };

/** Short echoes of the steps already answered; each one jumps back to its step. */
function answerChips(a: Partial<QuizAnswers>, step: QuizStep): Chip[] {
  const chips: Chip[] = [];
  const agi = parseMoney(a.agi);
  if (step > 1 && agi !== null)
    chips.push({ step: 1, what: "income", value: wholeUSD(agi) });
  const filing = FILING_OPTIONS.find((o) => o.value === a.filing);
  if (step > 2 && filing)
    chips.push({ step: 2, what: "filing", value: filing.label });
  if (step > 3 && a.state)
    chips.push({
      step: 3,
      what: "household",
      value: `${a.dependents ?? 0} dependent${a.dependents === 1 ? "" : "s"} · ${a.state}`,
    });
  const balance = parseMoney(a.balance);
  const rate = parsePercent(a.rate);
  if (step > 4 && balance !== null && rate !== null)
    chips.push({
      step: 4,
      what: "loans",
      value: `${wholeUSD(balance)} at ${rate}%`,
    });
  const employer = EMPLOYER_OPTIONS.find((o) => o.value === a.employer);
  if (step > 5 && employer)
    chips.push({ step: 5, what: "employer", value: employer.label });
  return chips;
}

export function Quiz({ initialSample }: { initialSample?: SampleKey }) {
  const router = useRouter();
  const [step, setStep] = useState<QuizStep>(1);
  const [a, setA] = useState<Partial<QuizAnswers>>(() =>
    initialSample ? { ...SAMPLE_ANSWERS[initialSample] } : EMPTY,
  );
  // The sample stays "on" only while every answer is untouched; then the results carry the Sample banner.
  const [sample, setSample] = useState<SampleKey | null>(initialSample ?? null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // The heading remounts per step (key={step}), so focus always moves and screen readers announce the
    // new question; scrolling explicitly covers browsers that don't scroll on focus (iOS Safari taps).
    heading.current?.focus();
    heading.current?.scrollIntoView?.({ block: "start" });
  }, [step]);

  const set = <K extends keyof QuizAnswers>(k: K, v: QuizAnswers[K]) => {
    setA((prev) => ({ ...prev, [k]: v }));
    setSample(null);
  };
  const loadSample = (key: SampleKey) => {
    setA({ ...SAMPLE_ANSWERS[key] });
    setSample(key);
    setError("");
  };
  const married = a.filing === "mfj" || a.filing === "mfs";
  const goTo = (s: QuizStep) => {
    setError("");
    setStep(s);
  };

  async function onNext() {
    const problem = validateStep(step, a);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    if (step < 6) {
      setStep((s) => (s + 1) as QuizStep);
      return;
    }
    setSaving(true);
    const { input, notes } = toBorrowerInput(a as QuizAnswers);
    await saveSessionData("borrowerInput", input).catch(() => undefined);
    saveFunnelNotes(sample ? [SAMPLE_NOTE, ...notes] : notes);
    router.push("/results");
  }

  const chips = answerChips(a, step);

  return (
    <div className="mx-auto max-w-2xl px-4 pt-3 sm:px-6 sm:pt-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-base font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back to home
        </Link>
        <p className="text-base font-semibold text-slate-700">
          Step {step} of 6
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={1}
        aria-valuemax={6}
        aria-valuenow={step}
        className="mt-2 flex gap-2"
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors duration-300 ${i <= step ? "bg-brand-700" : "bg-slate-200"}`}
          />
        ))}
      </div>
      {chips.length ? (
        <ul
          aria-label="Your answers so far"
          className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {chips.map((c) => (
            <li key={c.step} className="shrink-0">
              <button
                type="button"
                aria-label={`Edit ${c.what}: ${c.value}`}
                onClick={() => goTo(c.step)}
                className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3.5 text-sm font-medium text-slate-800 ring-1 ring-slate-300 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              >
                {c.value}
                <Pencil aria-hidden className="size-3.5 text-slate-500" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onNext();
        }}
        noValidate
      >
        <div className="mt-3 rounded-[28px] bg-white p-4 shadow-[0_18px_50px_-24px_rgba(42,36,117,0.25)] ring-1 ring-slate-900/5 sm:p-8">
          <h2
            key={step}
            ref={heading}
            tabIndex={-1}
            className="scroll-mt-24 text-[22px] font-medium leading-snug tracking-tight outline-none sm:text-3xl"
          >
            {STEP_QUESTIONS[step]}
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">{STEP_HINTS[step]}</p>
          {step === 1 ? (
            <p className="mt-1 text-xs font-medium text-brand-800">
              Six short questions. No login, no email, and we never ask for your
              FSA ID.
            </p>
          ) : null}

          <div className="mt-4 space-y-4">
            {step === 1 ? (
              <Field
                id="agi"
                label="Your adjusted gross income (AGI) last year"
                hint="Line 11 of your Form 1040. If you file jointly, enter only your own income here."
              >
                <MoneyInput
                  id="agi"
                  placeholder="55,000"
                  value={a.agi ?? ""}
                  onChange={(v) => set("agi", v)}
                  hinted
                />
              </Field>
            ) : null}

            {step === 2 ? (
              <>
                <Choices
                  name="filing"
                  legend="How do you file your taxes?"
                  hideLegend
                  layout="grid"
                  options={FILING_OPTIONS}
                  value={a.filing}
                  onChange={(v) => set("filing", v)}
                />
                {married ? (
                  <div className="space-y-3 rounded-2xl bg-sky-50 p-3.5">
                    <div
                      className={
                        a.spouseHasLoans ? "grid grid-cols-2 gap-3" : ""
                      }
                    >
                      <Field
                        id="spouseAgi"
                        label={`Spouse's income (AGI)${a.filing === "mfs" ? " — optional" : ""}`}
                      >
                        <MoneyInput
                          id="spouseAgi"
                          placeholder="90,000"
                          value={a.spouseAgi ?? ""}
                          onChange={(v) => set("spouseAgi", v)}
                        />
                      </Field>
                      {a.spouseHasLoans ? (
                        <Field id="spouseBalance" label="Spouse's loan balance">
                          <MoneyInput
                            id="spouseBalance"
                            placeholder="20,000"
                            value={a.spouseBalance ?? ""}
                            onChange={(v) => set("spouseBalance", v)}
                          />
                        </Field>
                      ) : null}
                    </div>
                    <CheckRow
                      id="spouseHasLoans"
                      label="My spouse has federal student loans too"
                      checked={a.spouseHasLoans ?? false}
                      onChange={(v) => set("spouseHasLoans", v)}
                    />
                  </div>
                ) : null}
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="space-y-2">
                  <p
                    className="text-sm font-semibold text-slate-900"
                    id="dependents-label"
                  >
                    Dependents you claim on your tax return
                  </p>
                  <p className="text-xs text-slate-600">
                    Children or others who live with you and rely on you for
                    support.
                  </p>
                  <div
                    className="inline-flex items-center gap-4 rounded-xl border border-slate-300 bg-white p-1.5"
                    role="group"
                    aria-labelledby="dependents-label"
                  >
                    <button
                      type="button"
                      aria-label="Remove a dependent"
                      onClick={() =>
                        set("dependents", Math.max(0, (a.dependents ?? 0) - 1))
                      }
                      className="grid size-11 place-items-center rounded-lg text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                    >
                      <Minus aria-hidden className="size-5" />
                    </button>
                    <span
                      className="w-10 text-center text-xl font-semibold"
                      aria-live="polite"
                    >
                      {a.dependents ?? 0}
                    </span>
                    <button
                      type="button"
                      aria-label="Add a dependent"
                      onClick={() =>
                        set("dependents", Math.min(20, (a.dependents ?? 0) + 1))
                      }
                      className="grid size-11 place-items-center rounded-lg text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                    >
                      <Plus aria-hidden className="size-5" />
                    </button>
                  </div>
                </div>
                <Field id="state" label="State you live in">
                  <select
                    id="state"
                    className={INPUT}
                    value={a.state ?? ""}
                    onChange={(e) => set("state", e.target.value)}
                  >
                    <option value="">Choose a state</option>
                    {US_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            ) : null}

            {step === 4 ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field id="balance" label="Total federal loan balance">
                    <MoneyInput
                      id="balance"
                      placeholder="40,000"
                      value={a.balance ?? ""}
                      onChange={(v) => set("balance", v)}
                    />
                  </Field>
                  <Field id="rate" label="Average interest rate (%)">
                    <input
                      id="rate"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="6.5"
                      className={INPUT}
                      value={a.rate ?? ""}
                      onChange={(e) => set("rate", e.target.value)}
                    />
                  </Field>
                </div>
                <Field
                  id="firstLoanYear"
                  label="Year of your first federal loan"
                >
                  <select
                    id="firstLoanYear"
                    className={INPUT}
                    value={a.firstLoanYear ?? ""}
                    onChange={(e) =>
                      set("firstLoanYear", Number(e.target.value))
                    }
                  >
                    <option value="">Choose a year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </Field>
                {askJuly2014(a.firstLoanYear) ? (
                  <Choices
                    name="july2014"
                    legend="Did you owe federal loans on July 1, 2014?"
                    layout="inline"
                    options={JULY_2014_OPTIONS}
                    value={a.hadBalanceJuly2014}
                    onChange={(v) => set("hadBalanceJuly2014", v)}
                  />
                ) : null}
                <CheckRow
                  id="newLoan"
                  label="New federal loan or consolidation on or after July 1, 2026"
                  checked={a.newLoanSinceJuly2026 ?? false}
                  onChange={(v) => set("newLoanSinceJuly2026", v)}
                />
              </>
            ) : null}

            {step === 5 ? (
              <Choices
                name="employer"
                legend="Who do you work for?"
                hideLegend
                options={EMPLOYER_OPTIONS}
                value={a.employer}
                onChange={(v) => set("employer", v)}
              />
            ) : null}

            {step === 6 ? (
              <>
                <Field id="currentPlan" label="Your current plan">
                  <select
                    id="currentPlan"
                    className={INPUT}
                    value={a.currentPlan ?? ""}
                    onChange={(e) =>
                      set(
                        "currentPlan",
                        e.target.value as QuizAnswers["currentPlan"],
                      )
                    }
                  >
                    <option value="">Choose a plan</option>
                    {PLAN_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </Field>
                {a.currentPlan === "SAVE" ? (
                  <Field
                    id="saveNoticeDate"
                    label="Date on your servicer's SAVE notice (optional)"
                    hint="We count your 90-day deadline from it."
                  >
                    <input
                      id="saveNoticeDate"
                      type="date"
                      className={INPUT}
                      value={a.saveNoticeDate ?? ""}
                      onChange={(e) => set("saveNoticeDate", e.target.value)}
                      aria-describedby="saveNoticeDate-hint"
                    />
                  </Field>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        {step === 1 ? (
          <section aria-labelledby="quiz-samples-heading" className="mt-5">
            <h3
              id="quiz-samples-heading"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
            >
              Or try a sample borrower
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {SAMPLE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={sample === key}
                  onClick={() => loadSample(key)}
                  className={buttonClass(
                    "secondary",
                    `px-4 text-sm ${sample === key ? "text-brand-900 ring-2 ring-brand-700" : ""}`,
                  )}
                >
                  {sample === key ? (
                    <Check aria-hidden className="size-4" />
                  ) : null}
                  {SAMPLES[key].button}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {/* Sticky, not fixed: it pins to the bottom of the screen while the quiz is in view and releases
            before the footer. Just the two buttons, no strip behind them (owner's call). The error lives
            here so it is always next to Continue. */}
        <div
          data-testid="quiz-actions"
          className="sticky bottom-0 z-10 mt-2 space-y-2 py-3"
        >
          {error ? (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800"
            >
              {error}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className={buttonClass("secondary")}
              onClick={() => goTo(Math.max(1, step - 1) as QuizStep)}
              disabled={step === 1 || saving}
            >
              <ArrowLeft aria-hidden className="size-4" />
              Back
            </button>
            <button
              type="submit"
              className={buttonClass("primary", "flex-1 sm:flex-none")}
              disabled={saving}
            >
              {step === 6 ? "See my plans" : "Continue"}
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
