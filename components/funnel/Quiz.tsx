"use client";
// Six-step quiz → BorrowerInput (owned by P2, plans/02-funnel.md Task 2). No login, no email, never an FSA ID.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { saveSessionData } from "@/lib/supabase/session";
import { Choices } from "@/components/funnel/Choices";
import { saveFunnelNotes } from "@/components/funnel/notesStore";
import { askJuly2014, CURRENT_YEAR, toBorrowerInput, validateStep } from "@/components/funnel/mapping";
import {
  EMPLOYER_OPTIONS, FILING_OPTIONS, JULY_2014_OPTIONS, PLAN_OPTIONS, STEP_TITLES, US_STATES,
  type QuizAnswers, type QuizStep,
} from "@/components/funnel/quizTypes";

const SELECT = "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-base md:text-sm";
const YEARS = Array.from({ length: CURRENT_YEAR - 1979 }, (_, i) => CURRENT_YEAR - i);

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
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
      className="space-y-5 rounded-xl border p-4 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        void onNext();
      }}
      noValidate
    >
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Step {step} of 6</p>
        <Progress value={(step / 6) * 100} aria-label={`Step ${step} of 6`} />
        <h2 ref={heading} tabIndex={-1} className="text-lg font-semibold outline-none">
          {STEP_TITLES[step]}
        </h2>
      </div>

      {step === 1 ? (
        <Field id="agi" label="Your adjusted gross income (AGI) last year" hint="Line 11 of your Form 1040. If you file jointly, enter only your own income here.">
          <Input id="agi" inputMode="decimal" autoComplete="off" placeholder="55,000" value={a.agi ?? ""} onChange={(e) => set("agi", e.target.value)} aria-describedby="agi-hint" />
        </Field>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <Choices name="filing" legend="How do you file your taxes?" options={FILING_OPTIONS} value={a.filing} onChange={(v) => set("filing", v)} />
          {married ? (
            <div className="space-y-4 rounded-lg bg-muted/50 p-3">
              <Field id="spouseAgi" label={`Your spouse's income (AGI)${a.filing === "mfs" ? " — optional" : ""}`} hint="Lets us compare filing jointly with filing separately.">
                <Input id="spouseAgi" inputMode="decimal" autoComplete="off" placeholder="90,000" value={a.spouseAgi ?? ""} onChange={(e) => set("spouseAgi", e.target.value)} aria-describedby="spouseAgi-hint" />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={a.spouseHasLoans ?? false} onChange={(e) => set("spouseHasLoans", e.target.checked)} />
                My spouse has federal student loans too
              </label>
              {a.spouseHasLoans ? (
                <Field id="spouseBalance" label="Your spouse's federal loan balance">
                  <Input id="spouseBalance" inputMode="decimal" autoComplete="off" placeholder="20,000" value={a.spouseBalance ?? ""} onChange={(e) => set("spouseBalance", e.target.value)} />
                </Field>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-sm font-medium" id="dependents-label">Dependents you claim on your tax return</p>
            <div className="flex items-center gap-3" role="group" aria-labelledby="dependents-label">
              <Button type="button" variant="outline" size="sm" aria-label="Remove a dependent" onClick={() => set("dependents", Math.max(0, (a.dependents ?? 0) - 1))}>
                −
              </Button>
              <span className="min-w-6 text-center text-lg font-semibold" aria-live="polite">{a.dependents ?? 0}</span>
              <Button type="button" variant="outline" size="sm" aria-label="Add a dependent" onClick={() => set("dependents", Math.min(20, (a.dependents ?? 0) + 1))}>
                +
              </Button>
            </div>
          </div>
          <Field id="state" label="State you live in">
            <select id="state" className={SELECT} value={a.state ?? ""} onChange={(e) => set("state", e.target.value)}>
              <option value="">Choose…</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </Field>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <Field id="balance" label="Total federal loan balance" hint="All your federal student loans added together.">
            <Input id="balance" inputMode="decimal" autoComplete="off" placeholder="40,000" value={a.balance ?? ""} onChange={(e) => set("balance", e.target.value)} aria-describedby="balance-hint" />
          </Field>
          <Field id="rate" label="Average interest rate (%)" hint="On your servicer's website or statement. A rough average is fine.">
            <Input id="rate" inputMode="decimal" autoComplete="off" placeholder="6.5" value={a.rate ?? ""} onChange={(e) => set("rate", e.target.value)} aria-describedby="rate-hint" />
          </Field>
          <Field id="firstLoanYear" label="Year of your first federal loan">
            <select id="firstLoanYear" className={SELECT} value={a.firstLoanYear ?? ""} onChange={(e) => set("firstLoanYear", Number(e.target.value))}>
              <option value="">Choose…</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
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
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5" checked={a.newLoanSinceJuly2026 ?? false} onChange={(e) => set("newLoanSinceJuly2026", e.target.checked)} />
            I took out a new federal loan or consolidated on or after July 1, 2026
          </label>
        </div>
      ) : null}

      {step === 5 ? (
        <Choices name="employer" legend="Who do you work for?" options={EMPLOYER_OPTIONS} value={a.employer} onChange={(v) => set("employer", v)} />
      ) : null}

      {step === 6 ? (
        <div className="space-y-4">
          <Field id="currentPlan" label="Your current plan">
            <select id="currentPlan" className={SELECT} value={a.currentPlan ?? ""} onChange={(e) => set("currentPlan", e.target.value as QuizAnswers["currentPlan"])}>
              <option value="">Choose…</option>
              {PLAN_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>
          {a.currentPlan === "SAVE" ? (
            <Field id="saveNoticeDate" label="Date on your servicer's SAVE notice (optional)" hint="We count your 90-day deadline from it.">
              <Input id="saveNoticeDate" type="date" value={a.saveNoticeDate ?? ""} onChange={(e) => set("saveNoticeDate", e.target.value)} aria-describedby="saveNoticeDate-hint" />
            </Field>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={() => (setError(""), setStep((s) => Math.max(1, s - 1) as QuizStep))} disabled={step === 1 || saving}>
          Back
        </Button>
        <Button type="submit" disabled={saving}>
          {step === 6 ? "See my plans" : "Next"}
        </Button>
      </div>
    </form>
  );
}
