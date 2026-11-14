"use client";
// Six-step quiz → BorrowerInput (owned by P2). No login, no email, never an FSA ID.
// Band header (progress, the question, answer chips) + one screen of fields per step; Continue pinned on phones.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, FileText, HeartHandshake, House, Landmark, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSessionData } from "@/lib/supabase/session";
import { Band, ON_BAND_FILL } from "@/components/brand/Band";
import { Choices } from "@/components/funnel/Choices";
import { saveFunnelNotes } from "@/components/funnel/notesStore";
import { wholeUSD } from "@/components/funnel/labels";
import { askJuly2014, CURRENT_YEAR, parseMoney, parsePercent, toBorrowerInput, validateStep } from "@/components/funnel/mapping";
import {
  EMPLOYER_OPTIONS, FILING_OPTIONS, JULY_2014_OPTIONS, PLAN_OPTIONS, STEP_QUESTIONS, US_STATES,
  type QuizAnswers, type QuizStep,
} from "@/components/funnel/quizTypes";
import type { Employer, FilingStatus } from "@/lib/types";

const SELECT = "h-12 w-full rounded-xl border border-input bg-card px-3 text-base";
const BIG_INPUT = "h-12 rounded-xl bg-card text-lg";
const YEARS = Array.from({ length: CURRENT_YEAR - 1979 }, (_, i) => CURRENT_YEAR - i);
const FILING_ICONS: Partial<Record<FilingStatus, typeof User>> = { single: User, hoh: House, mfj: Users, mfs: FileText };
const EMPLOYER_ICONS: Partial<Record<Employer, typeof User>> = { government: Landmark, nonprofit: HeartHandshake, private: Building2 };

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-bold">
        {label}
      </Label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** A large money input with a "$" prefix and the numeric keypad. */
function MoneyInput(props: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">
        $
      </span>
      <Input inputMode="decimal" autoComplete="off" {...props} className={`${BIG_INPUT} pl-7`} />
    </div>
  );
}

type Chip = { step: QuizStep; what: string; value: string };

/** Short echoes of the steps already answered; each one jumps back to its step. */
function answerChips(a: Partial<QuizAnswers>, step: QuizStep): Chip[] {
  const chips: Chip[] = [];
  const agi = parseMoney(a.agi);
  if (step > 1 && agi !== null) chips.push({ step: 1, what: "income", value: wholeUSD(agi) });
  const filing = FILING_OPTIONS.find((o) => o.value === a.filing);
  if (step > 2 && filing) chips.push({ step: 2, what: "filing", value: filing.label });
  if (step > 3 && a.state) chips.push({ step: 3, what: "household", value: `${a.dependents ?? 0} dependent${a.dependents === 1 ? "" : "s"} · ${a.state}` });
  const balance = parseMoney(a.balance);
  const rate = parsePercent(a.rate);
  if (step > 4 && balance !== null && rate !== null) chips.push({ step: 4, what: "loans", value: `${wholeUSD(balance)} at ${rate}%` });
  const employer = EMPLOYER_OPTIONS.find((o) => o.value === a.employer);
  if (step > 5 && employer) chips.push({ step: 5, what: "employer", value: employer.label });
  return chips;
}

export function Quiz() {
  const router = useRouter();
  const [step, setStep] = useState<QuizStep>(1);
  const [a, setA] = useState<Partial<QuizAnswers>>({ dependents: 0, spouseHasLoans: false, newLoanSinceJuly2026: false, state: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus();
  }, [step]);

  const set = <K extends keyof QuizAnswers>(k: K, v: QuizAnswers[K]) => setA((prev) => ({ ...prev, [k]: v }));
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
    saveFunnelNotes(notes);
    router.push("/results");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onNext();
      }}
      noValidate
    >
      <Band>
        <div className="flex gap-1.5" aria-hidden>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <i key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-white" : "bg-white/25"}`} />
          ))}
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-white/90">Step {step} of 6</p>
        <h2 ref={heading} tabIndex={-1} className="mt-1 text-3xl font-extrabold leading-tight tracking-tight outline-none sm:text-4xl">
          {STEP_QUESTIONS[step]}
        </h2>
        {step === 1 ? <p className="mt-2 text-white/90">Six short questions. No login, no email, and we never ask for your FSA ID.</p> : null}
        {answerChips(a, step).length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {answerChips(a, step).map((c) => (
              <button
                key={c.step}
                type="button"
                aria-label={`Edit ${c.what}: ${c.value}`}
                onClick={() => goTo(c.step)}
                className={`rounded-xl ${ON_BAND_FILL} px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#14142B]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A2475]`}
              >
                {c.value} ✎
              </button>
            ))}
          </div>
        ) : null}
      </Band>

      <div className="mx-auto max-w-xl space-y-5">
        {step === 1 ? (
          <Field id="agi" label="Your adjusted gross income (AGI) last year" hint="Line 11 of your Form 1040. If you file jointly, enter only your own income here.">
            <MoneyInput id="agi" placeholder="55,000" value={a.agi ?? ""} onChange={(e) => set("agi", e.target.value)} aria-describedby="agi-hint" />
          </Field>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <Choices name="filing" legend="How do you file your taxes?" hideLegend layout="grid" icons={FILING_ICONS} options={FILING_OPTIONS} value={a.filing} onChange={(v) => set("filing", v)} />
            {married ? (
              <div className="space-y-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
                <Field id="spouseAgi" label={`Your spouse's income (AGI)${a.filing === "mfs" ? " — optional" : ""}`} hint="Lets us compare filing jointly with filing separately.">
                  <MoneyInput id="spouseAgi" placeholder="90,000" value={a.spouseAgi ?? ""} onChange={(e) => set("spouseAgi", e.target.value)} aria-describedby="spouseAgi-hint" />
                </Field>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" className="size-4 accent-primary" checked={a.spouseHasLoans ?? false} onChange={(e) => set("spouseHasLoans", e.target.checked)} />
                  My spouse has federal student loans too
                </label>
                {a.spouseHasLoans ? (
                  <Field id="spouseBalance" label="Your spouse's federal loan balance">
                    <MoneyInput id="spouseBalance" placeholder="20,000" value={a.spouseBalance ?? ""} onChange={(e) => set("spouseBalance", e.target.value)} />
                  </Field>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-bold" id="dependents-label">
                Dependents you claim on your tax return
              </p>
              <div className="flex items-center gap-4" role="group" aria-labelledby="dependents-label">
                <Button type="button" variant="outline" className="size-12 rounded-xl text-xl" aria-label="Remove a dependent" onClick={() => set("dependents", Math.max(0, (a.dependents ?? 0) - 1))}>
                  −
                </Button>
                <span className="min-w-8 text-center text-3xl font-extrabold" aria-live="polite">
                  {a.dependents ?? 0}
                </span>
                <Button type="button" variant="outline" className="size-12 rounded-xl text-xl" aria-label="Add a dependent" onClick={() => set("dependents", Math.min(20, (a.dependents ?? 0) + 1))}>
                  +
                </Button>
              </div>
            </div>
            <Field id="state" label="State you live in">
              <select id="state" className={SELECT} value={a.state ?? ""} onChange={(e) => set("state", e.target.value)}>
                <option value="">Choose…</option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-5">
            <Field id="balance" label="Total federal loan balance" hint="All your federal student loans added together.">
              <MoneyInput id="balance" placeholder="40,000" value={a.balance ?? ""} onChange={(e) => set("balance", e.target.value)} aria-describedby="balance-hint" />
            </Field>
            <Field id="rate" label="Average interest rate (%)" hint="On your servicer's website or statement. A rough average is fine.">
              <Input id="rate" inputMode="decimal" autoComplete="off" placeholder="6.5" className={BIG_INPUT} value={a.rate ?? ""} onChange={(e) => set("rate", e.target.value)} aria-describedby="rate-hint" />
            </Field>
            <Field id="firstLoanYear" label="Year of your first federal loan">
              <select id="firstLoanYear" className={SELECT} value={a.firstLoanYear ?? ""} onChange={(e) => set("firstLoanYear", Number(e.target.value))}>
                <option value="">Choose…</option>
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
                legend="Did you owe any federal student loans on July 1, 2014?"
                options={JULY_2014_OPTIONS}
                value={a.hadBalanceJuly2014}
                onChange={(v) => set("hadBalanceJuly2014", v)}
              />
            ) : null}
            <label className="flex items-start gap-2 rounded-2xl bg-card p-4 text-sm font-medium shadow-sm ring-1 ring-border">
              <input type="checkbox" className="mt-0.5 size-4 accent-primary" checked={a.newLoanSinceJuly2026 ?? false} onChange={(e) => set("newLoanSinceJuly2026", e.target.checked)} />
              I took out a new federal loan or consolidated on or after July 1, 2026
            </label>
          </div>
        ) : null}

        {step === 5 ? (
          <Choices name="employer" legend="Who do you work for?" hideLegend icons={EMPLOYER_ICONS} options={EMPLOYER_OPTIONS} value={a.employer} onChange={(v) => set("employer", v)} />
        ) : null}

        {step === 6 ? (
          <div className="space-y-5">
            <Field id="currentPlan" label="Your current plan">
              <select id="currentPlan" className={SELECT} value={a.currentPlan ?? ""} onChange={(e) => set("currentPlan", e.target.value as QuizAnswers["currentPlan"])}>
                <option value="">Choose…</option>
                {PLAN_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>
            {a.currentPlan === "SAVE" ? (
              <Field id="saveNoticeDate" label="Date on your servicer's SAVE notice (optional)" hint="We count your 90-day deadline from it.">
                <Input id="saveNoticeDate" type="date" className={BIG_INPUT} value={a.saveNoticeDate ?? ""} onChange={(e) => set("saveNoticeDate", e.target.value)} aria-describedby="saveNoticeDate-hint" />
              </Field>
            ) : null}
          </div>
        ) : null}

        {/* Sticky, not fixed: it pins to the bottom of the screen while the form is in view and releases
            before the footer disclaimer. The error lives here so it is always next to Next. */}
        <div
          data-testid="quiz-actions"
          className="sticky bottom-0 z-10 -mx-4 space-y-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
        >
          {error ? (
            <p role="alert" className="rounded-xl bg-[#FDECEF] px-3 py-2 text-sm font-semibold text-[#C81E4F]">
              {error}
            </p>
          ) : null}
          <div className="mx-auto flex max-w-xl gap-2">
            <Button type="button" variant="outline" size="lg" className="h-12 rounded-2xl px-5" onClick={() => goTo(Math.max(1, step - 1) as QuizStep)} disabled={step === 1 || saving}>
              Back
            </Button>
            <Button type="submit" size="lg" className="h-12 flex-1 rounded-2xl text-base font-extrabold" disabled={saving}>
              {step === 6 ? "See my plans" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
