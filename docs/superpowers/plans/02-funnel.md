# P2 Funnel (landing → quiz → results): Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A no-login funnel. A landing page leads to a 6-step quiz (or a one-click sample borrower), then to a results page. The results page shows every plan, the recommendation and its reason, the cheapest-monthly vs cheapest-overall callout, warnings, live toggles for dependents and filing status, and calls to action into the audit and the paywall.

**Architecture:**
- Client components call the pure engine functions directly; there's no API route.
- Answers are saved through `saveSessionData`.
- Until P1 merges, everything renders from the engine stubs and mocks. The stubs return `MOCK_COMPARISON` whatever the input, so build against the shapes.

**Tech Stack:** Next.js App Router, React client components, Tailwind, shadcn/ui, Recharts, Vitest + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-11-14-student-loan-guardian-design.md` §1 (demo success), §2 goal 3, §5.4 (recommendation), §5.6 (paywall placement).

**Branch:** `feat/funnel`. You own `app/page.tsx`, `app/check/**`, `app/results/**` and `components/funnel/**`. Edit nothing else.

## Global Constraints
- Follow the Global Constraints in `00-foundation.md`.
- No login and no email field anywhere. **Never** ask for an FSA ID or password.
- Every money figure on the results page sits next to its rule reference (`ruleRefs`) and the line "Rules as of Nov 1, 2026".
- Use `formatUSD()` from `lib/format.ts` for all money.
- Must work at 390px width.

## Review Focus
- **Money typed with commas, a "$", or blank:** `"55,000"` and `"$55,000"` become 55000. Blank blocks "Next" with an inline message. Test in Task 1.
- **"Not sure" on the July 2014 question:** treat it as `true` (15%, the conservative choice) and show a note that the result assumes loans from before July 2014. Test in Task 1.
- **Married filing jointly without a spouse AGI:** "Next" is blocked until it's filled in. Test in Task 1.
- **Opening `/results` directly with no saved answers:** show "Start the check" plus sample buttons, not a crash. Test in Task 3.
- **Toggling dependents to 0 or 6+:** the numbers recompute instantly and nothing breaks. Test in Task 3.

---

### Task 1: Quiz answers → `BorrowerInput` mapping

**Files:**
- Create: `components/funnel/quizTypes.ts`, `components/funnel/mapping.ts`
- Test: `components/funnel/__tests__/mapping.test.ts`

**Interfaces:**
- Produces:
  - `parseMoney(s: string): number | null`
  - `QuizAnswers`, with these fields:
    - `agi: string`
    - `filing: FilingStatus`
    - `spouseAgi?: string`
    - `spouseHasLoans: boolean`, `spouseBalance?: string`
    - `dependents: number`
    - `state: string`
    - `balance: string`, `rate: string` (percent)
    - `firstLoanYear: number`
    - `hadBalanceJuly2014: "yes" | "no" | "not_sure"`
    - `newLoanSinceJuly2026: boolean`
    - `employer: Employer`
    - `currentPlan`
    - `saveNoticeDate?: string`
  - `toBorrowerInput(a: QuizAnswers): { input: BorrowerInput; notes: string[] }`
  - `validateStep(step: 1..6, a: Partial<QuizAnswers>): string | null` (an error message, or null)
- Consumes: the `BorrowerInput` types from `lib/types.ts`.

**Mapping rules:**
- `familySize` = 1 + (1 if `filing === "mfj"`) + `dependents`.
- `loans` = one pooled `Loan` (`id: "pooled"`, type `"unsub"`, `rate` = percent ÷ 100, `disbursedOn` = `${firstLoanYear}-09-01`).
- If `newLoanSinceJuly2026`, add a second loan with `disbursedOn: "2026-08-15"` and balance 0.01.
- `"not_sure"` maps to `true`, plus a note.

- [ ] **Step 1: Write the failing tests:**
  - `parseMoney("55,000") === 55000`, `parseMoney("$55,000") === 55000`, `parseMoney("") === null`
  - mapping the F2b-like answers gives `familySize === 3`, `dependents === 2` and `rate === 0.065`
  - joint filing with 1 dependent gives `familySize === 3`
  - `"not_sure"` gives `hadBalanceOnJuly2014 === true` and one note
  - `validateStep` for the filing step with `filing: "mfj"` and no `spouseAgi` returns a non-null message
- [ ] **Step 2:** Run `npx vitest run components/funnel`. Expected: FAIL.
- [ ] **Step 3:** Implement as above.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** Commit: `git commit -m "feat(funnel): quiz → BorrowerInput mapping"`.

### Task 2: Quiz page `/check`

**Files:**
- Create: `app/check/page.tsx`, `components/funnel/Quiz.tsx`, `components/funnel/SampleButtons.tsx`

**Interfaces:**
- Consumes:
  - `toBorrowerInput` and `validateStep` (Task 1)
  - `saveSessionData("borrowerInput", input)` from `lib/supabase/session.ts`
  - `SAMPLE_BORROWERS` from `lib/mocks.ts`

**The six steps:**
1. Income
2. Filing status (plus spouse fields)
3. Dependents and state
4. Loans: balance, rate, first-loan year, July-2014 question, new-loan question
5. Employer type
6. Current plan and SAVE notice date

The page shows a progress bar and Back/Next buttons, and keeps answers in React state.

**Sample buttons:** "Try: single parent, 2 kids (F2b)" and "Try: married teacher (F4)". Each saves the matching `SAMPLE_BORROWERS` entry and goes to `/results`.

- [ ] **Step 1:** Build `Quiz` with `validateStep`. On finish, call `saveSessionData` and `router.push("/results")`.
- [ ] **Step 2:** Run `npm run dev`. Walk all 6 steps at 390px width. Expected: Next is blocked on an invalid step, and you land on `/results`.
- [ ] **Step 3:** Commit: `git commit -m "feat(funnel): quiz page with sample borrowers"`.

### Task 3: Results page `/results`

**Files:**
- Create:
  - `app/results/page.tsx`
  - `components/funnel/ResultsView.tsx`
  - `components/funnel/PlanCard.tsx`
  - `components/funnel/PaymentChart.tsx`
  - `components/funnel/FilingPanel.tsx`
  - `components/funnel/Toggles.tsx`
- Test: `components/funnel/__tests__/results.test.tsx`

**Interfaces:**
- Consumes:
  - `computePlans`, `compareFiling` and `buildActionPlan` from `lib/engine`
  - `loadSessionData`
  - `<Disclaimer variant="results"/>`
  - `<Paywall feature="action-plan" state={input.state}>`
- Produces: `ResultsView({ comparison: PlanComparison; filing?: FilingComparison; onChange(input: BorrowerInput): void })`.

**Layout, top to bottom:**
1. A "Recommended: {plan}" header with `reason`.
2. If `cheapestMonthly !== bestFor12mBalance`, a callout: "Lowest monthly: {A} {$}. Shrinks your debt fastest: {B}. Here's why we recommend {recommended}."
3. Four `PlanCard`s:
   - monthly payment, years to forgiveness, a PSLF badge, `balanceChange12m` ("+$1,198 this year" in red or "−$600" in green);
   - the `ruleRefs` as small text;
   - unavailable plans greyed out with `unavailableReason`.
4. `PaymentChart`: a Recharts bar chart of monthly payments, with a second series for `balanceChange12m`.
5. Toggles for dependents (−/+) and filing status (single / joint / separate). These re-run `computePlans`. If married, `FilingPanel` shows joint vs separate, the extra tax and the net saving, with the caveats in a collapsible.
6. Warnings as alerts. `danger` ones go first.
7. Calls to action:
   - "Check a statement for errors" → `/audit`;
   - "Get your dated action plan": the `buildActionPlan` list inside `<Paywall feature="action-plan">`.
8. `<Disclaimer variant="results"/>`.

- [ ] **Step 1: Write the failing test** (jsdom). Render `ResultsView` with `MOCK_COMPARISON` and assert that:
  - the text "Recommended: RAP" and "$129.17" are present;
  - the callout mentions "IBR";
  - a `balance-grows` warning title is rendered.

  Render it with `comparison = null` and assert that "Start the check" is present.
- [ ] **Step 2:** Run `npx vitest run components/funnel`. Expected: FAIL.
- [ ] **Step 3:** Implement the components as above. The page loads `borrowerInput`, runs the engine, and renders `ResultsView` or the empty state.
- [ ] **Step 4:** Run `npx vitest run components/funnel && npm run build`. Expected: PASS.
- [ ] **Step 5:** Commit: `git commit -m "feat(funnel): results page with toggles, chart, warnings"`.

### Task 4: Landing page `/`

**Files:**
- Modify: `app/page.tsx` (replace the placeholder)
- Create: `components/funnel/Hero.tsx`, `components/funnel/HowItWorks.tsx`

**Content:**
- **Hero headline:** "Your SAVE plan is ending. See your cheapest legal plan in 60 seconds. No login." Sub-line: "Then let us check your servicer's statements for errors."
- **Primary button:** "Start the free check" → `/check`.
- **Secondary:** sample buttons (reuse `SampleButtons`).
- `<Disclaimer variant="hero"/>` placed directly under the buttons.
- **How it works, 3 steps:** "Answer 6 questions", "See every plan with the rule behind each number", "Upload a statement — we flag errors and draft your letter".
- **Two verbatim Reddit quotes** from `docs/research/08h-reddit-quotes.md` (#2 "$497 → $2157" and #10 "should be 93.21… I received $53.11"), attributed as "— r/StudentLoans, 2026".

- [ ] **Step 1:** Implement the components above.
- [ ] **Step 2:** Run `npm run dev` and check `/` at 390px and 1280px. Expected: no sideways scroll, the disclaimer is visible near the buttons, and no banned phrases appear (`grep -ri "forgiv.*guarant\|StudentAid" components/funnel app/page.tsx` → only the "free at StudentAid.gov" line inside the Disclaimer component).
- [ ] **Step 3:** Run `npm run build && npx vitest run`. Expected: PASS.
- [ ] **Step 4:** Commit and open a pull request: `git commit -m "feat(funnel): landing page" && git push -u origin feat/funnel && gh pr create --base main --title "Funnel: landing, quiz, results" --body "Works on mocks; uses lib/engine when merged"`.
