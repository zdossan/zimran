# "Bold fintech" UI redesign: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the landing page, quiz, results and audit pages in direction B. That means an indigo gradient band, a giant answer number, heavy sans-serif type (Manrope) and app-style rows and tiles, with every page leading with the answer. No logic, numbers or tested behaviour changes.

**Architecture:**
- New theme tokens and a Manrope font in the lead-owned `app/globals.css` and `app/layout.tsx`.
- A shared full-bleed `Band` component in `components/brand/` that every page uses for its top section.
- The funnel (`components/funnel/**`) and audit (`components/audit/**`) components are restructured around it.
- P4's `Paywall` and `Disclaimer` are only placed differently, never edited.

**Tech stack:** Next.js 16.4 App Router, React 19.3, Tailwind 4.3, shadcn on Base UI, Recharts 3, lucide-react, Vitest with Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-11-15-ui-redesign-design.md`. The mockups are in `docs/superpowers/specs/2026-11-15-ui-redesign-mockups.html` (row B).

## Global constraints

- **Files you may edit:** `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `app/check/**`, `app/results/**`, `app/audit/**`, `components/brand/**` (new), `components/funnel/**`, `components/audit/**`, `lib/__tests__/theme.test.ts` (new).
- **Never edit** `components/paywall/**`, `components/legal/**`, `lib/supabase/**`, `lib/stripe.ts`, `app/checkout/**`, `app/api/**`, `lib/engine/**`, `lib/types.ts` or `lib/mocks.ts`.
- **Packages:** no new npm packages. Manrope comes from `next/font/google`, and icons come from `lucide-react` (already installed). Read `node_modules/next/dist/docs/` for `next/font` before using it.
- **Colours:**
  - Gradient: `radial-gradient(120% 90% at 10% 0%, #6A61F0 0%, #4840BB 45%, #2A2475 100%)`. White text measures at least 4.58:1 on every stop.
  - Primary `#4840BB`, page background `#F5F6FB`, ink `#14142B`, muted text `#6E6E8F`, cards `#FFFFFF`.
  - Balance-change text: shrinks `#0B7A3B` (5.44:1), grows `#C81E4F` (5.59:1), always with a +/− sign.
  - Deadline alert: `#9A4A00` on `#FFF1E6`.
- **Chart colours** (validated with the dataviz `validate_palette.js` on `#FFFFFF`: all checks pass):
  - Balance chart: shrinks `#4840BB`, grows `#E0245E`. A red/green pair fails for colourblind readers (ΔE 1.9).
  - Payment chart: the recommended plan's bar is `#4840BB`, the others are `#8A86C8` (3.32:1), and the recommended bar carries a text label.
- **Money:** always format with `formatUSD()` from `lib/format.ts`. Whole dollars appear only in the results hero, the landing preview card and chart labels, through `wholeUSD()` in `components/funnel/labels.ts`. "Rules as of Nov 1, 2026" (`RULES_DATE_LABEL`) stays next to plan numbers.
- **Copy:**
  - Never use "forgiveness guaranteed", "get your loans forgiven" or "stop collections".
  - No invented user counts, ratings or press mentions.
  - Never ask for an FSA ID or password.
- **Disclaimers:**
  - `<Disclaimer variant="hero"/>` comes directly after the landing CTAs, in its own card, never collapsed.
  - The `results` and `audit` variants stay visible.
  - The footer variant stays in the layout.
- **Layout:** pages must work at 390px with no sideways scroll, and at 1280px.
- **Tests:** component tests start with `// @vitest-environment jsdom`. `npm run build && npm test` must pass.
- **Commits:** the lead's rule is no commit or push without the lead's explicit go-ahead for that commit. Leave the work staged until then.

## Review focus

1. **Four-digit answers** (for example $1,250/mo for a single filer on $150k) must fit in the hero at 390px without overflowing. Checked in Task 7, step 2.
2. **No eligible loans** (Parent PLUS only): the hero must say "We can't compare plans for these loans" and show no "$0" giant number and no CTA. Tested in Task 2.
3. **Keyboard users:** quiz tiles built on visually hidden radio buttons must keep a visible focus ring and arrow-key movement, and the pinned Continue must not cover the last tile at 390px. Tested in Task 4 and checked in Task 7.
4. **A borrower in New York** opens the action-plan CTA: the revealed paywall must get `state="NY"` so P4's block message can show. Tested in Task 2.
5. **P4's pages** (`/checkout/success`, `/checkout/cancel`) under the new indigo header must stay readable (no white-on-white). Checked in Task 7.

---

### Task 1: Theme tokens, Manrope, layout header and the `Band` component

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`
- Create: `components/brand/Band.tsx`
- Test: `lib/__tests__/theme.test.ts`, `components/brand/__tests__/band.test.tsx`

**Interfaces:**
- Produces:
  - `export const GRADIENT: string`, the gradient value from Global constraints.
  - `export function Band({ children, className }: { children: ReactNode; className?: string }): JSX.Element`. It is a full-bleed `<section data-band>` with `style={{ background: GRADIENT }}`, white text, and an inner `mx-auto max-w-5xl px-4` container. It sits flush under the header, so it cancels `main`'s top padding.
  - `export function GlassChip({ children }: { children: ReactNode }): JSX.Element`, a translucent white pill for use on the band.

- [ ] **Step 1: Write the failing tests.**
  - `theme.test.ts` reads `app/globals.css` from disk and asserts:
    - it does **not** match `/--font-sans:\s*var\(--font-sans\)/`;
    - it matches `/--font-sans:\s*var\(--font-manrope\)/`;
    - it matches `/--primary:\s*#4840BB/i`;
    - it matches `/--background:\s*#F5F6FB/i`.
  - `band.test.tsx` renders `<Band><p>hi</p></Band>` and asserts:
    - `getByText("hi")` is inside `[data-band]`;
    - that element's `style.background` contains `radial-gradient`;
    - `GRADIENT` contains `#4840BB`.
- [ ] **Step 2:** Run `npx vitest run lib/__tests__/theme.test.ts components/brand`. Expected: FAIL (no module, and the CSS doesn't match).
- [ ] **Step 3: Implement.**
  - `globals.css`:
    - `--font-sans: var(--font-manrope)` and `--font-heading: var(--font-manrope)`;
    - `:root` tokens: background, foreground, card, primary/primary-foreground, ring, muted-foreground and border (`#E4E4F0`) from Global constraints, with `--radius: 1rem`;
    - `font-variant-numeric: tabular-nums` on `body`.
  - `layout.tsx`:
    - load `Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["500","600","700","800"] })` and drop Geist Sans;
    - the header is an indigo bar (`#2A2475` or the gradient) with white text;
    - below 640px it shows only the brand and "Check a statement", so it never wraps at 390px; at 640px and up, both links show.
  - `Band.tsx` as specified under Interfaces.
- [ ] **Step 4:** Run the Step 2 command, then `npx vitest run`. Expected: PASS, and the existing tests are still green.
- [ ] **Step 5:** Stage the files. Commit only after the lead's go-ahead: `feat(theme): Manrope, indigo tokens, Band`.

### Task 2: Results hero, compare rows and the action-plan CTA

**Files:**
- Create: `components/funnel/ResultsHero.tsx`, `components/funnel/PlanRow.tsx`, `components/funnel/ActionPlanCta.tsx`
- Modify: `components/funnel/ResultsView.tsx`, `components/funnel/labels.ts`
- Delete: `components/funnel/PlanCard.tsx` (replaced by `PlanRow`)
- Test: `components/funnel/__tests__/results.test.tsx`

**Interfaces:**
- Consumes: `Band` and `GlassChip` (Task 1); `PLAN_LABEL`, `RULES_DATE_LABEL`, `signedUSD` and `shortDate` (existing `labels.ts`).
- Produces:
  - `labels.ts`:
    - `wholeUSD(n: number): string` ("$129", "$1,250");
    - `PLAN_FULL_NAME: Record<PlanId, string>` = RAP "Repayment Assistance Plan", IBR "Income-Based Repayment", STANDARD_10 "10-year Standard Plan", TIERED "Tiered Standard Plan";
    - `PRICE_FROM = "$9/mo"`.
  - `ResultsHero({ comparison }: { comparison: PlanComparison })`:
    - A `Band` with an `h2` whose text is `Your best plan: {PLAN_LABEL}`, the giant `wholeUSD(payment)` in `<span data-testid="hero-number">` followed by "/mo", and `PLAN_FULL_NAME`.
    - `<div data-testid="hero-chips">` holds:
      - the balance chip ("↓ {wholeUSD} this year" / "↑ {wholeUSD} this year" / "Balance flat this year");
      - plus "Counts toward PSLF ✓" **only if** `comparison.pslfTrack && rec.pslfQualifying`.
    - When no plan is available, the `h2` reads "We can't compare plans for these loans", with no number and no chips.
  - `PlanRow({ r, recommended }: { r: PlanResult; recommended: boolean })`:
    - `<section aria-label="{PLAN_LABEL} plan">` wrapping `<details>`.
    - The `<summary>` shows the label, a "BEST" badge when recommended, "Counts toward PSLF" or "No PSLF credit", `formatUSD(monthlyPayment)` and the signed balance change, coloured with the Global constraints text colours.
    - The body holds the existing forgiveness line ("Under current rules, a balance left after {N} years of qualifying payments is forgiven (federally taxable)."), the first-month waiver and match (only when either is above $0), the `notes`, and `Rules: {ruleRefs joined " · "} · Rules as of {RULES_DATE_LABEL}`.
    - Unavailable plans show "Not available: {reason}" in the summary.
  - `ActionPlanCta({ state, actions }: { state: string; actions: ActionItem[] })`:
    - a full-width primary button "Get my dated action plan · from $9/mo" with `aria-expanded`;
    - tapping it reveals `<Paywall feature="action-plan" state={state}>`, wrapping the existing dated action list, inline below.
  - `ResultsView` keeps its props and test IDs (`cheapest-callout`, `spouse-income-missing`, `filing-panel`). The new order is: notes → `ResultsHero` → spouse alert → "why" card (the `reason`; the callout replaces it when cheapest ≠ recommended) → "Compare plans" (`PlanRow` × 4) → danger warnings → `ActionPlanCta` → "Check a statement for errors" → charts → `Toggles` → `FilingPanel` → other warnings → `<Disclaimer variant="results"/>`.

- [ ] **Step 1: Update and add the failing tests in `results.test.tsx`.**
  - Replace every `/Recommended: RAP/` heading query with `/Your best plan: RAP/`, and `/Recommended:/` with `/Your best plan:/`.
  - Add these tests:
    - `hero shows the whole-dollar answer and the balance chip`: render `MOCK_COMPARISON` and expect `getByTestId("hero-number")` to have the text "$129", then `within(getByTestId("hero-chips"))` to contain "↓ $600 this year" and **not** "Counts toward PSLF ✓".
    - `hero shows the PSLF chip only on a PSLF track`: render `computePlans(SAMPLE_BORROWERS.F4)` and expect the hero chips to contain "Counts toward PSLF ✓".
    - `RAP row carries BEST, cents and the rules`: `within(card(/^RAP plan/))` contains "BEST", "$129.17", "34 CFR 685.209(f)(5)" and "Rules as of Nov 1, 2026".
    - `no eligible loans: no giant number and no CTA`: with `computePlans({ ...F1, loans: [] })`, expect the heading "We can't compare plans for these loans", `queryByTestId("hero-chips")` to be null, and `queryByRole("button", { name: /dated action plan/ })` to be null.
    - `the action-plan CTA reveals the paywall with the borrower's state`. Mock `@/components/paywall/Paywall` to render `<div data-feature={feature} data-state={state}>{children}</div>`. Render a comparison whose `input.state` is `"NY"`. Before the click, `[data-feature="action-plan"]` is null. Click "Get my dated action plan · from $9/mo". After the click, it exists with `data-state="NY"` and the button has `aria-expanded="true"`.
  - Change the existing test "puts the dated action plan behind the action-plan paywall" to click the CTA first.
- [ ] **Step 2:** Run `npx vitest run components/funnel/__tests__/results.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** the three components and the new `ResultsView` order. The hero number uses `clamp()` sizing (about 44–72px) so that four-digit amounts fit at 390px. Delete `PlanCard.tsx`.
- [ ] **Step 4:** Run `npx vitest run components/funnel`. Expected: PASS, including the existing toggle, what-if, sample, spouse and filing-panel tests.
- [ ] **Step 5:** Stage the files. Commit after the go-ahead: `feat(results): giant-number hero, compare rows, action-plan CTA`.

### Task 3: Results secondary sections restyle (charts, what-if, filing panel, warnings)

**Files:**
- Modify: `components/funnel/PaymentChart.tsx`, `components/funnel/Toggles.tsx`, `components/funnel/FilingPanel.tsx`, `components/funnel/ResultsView.tsx` (warning styles only)
- Test: `components/funnel/__tests__/results.test.tsx`

**Interfaces:**
- Produces: `export const CHART_COLORS = { recommended: "#4840BB", other: "#8A86C8", shrinks: "#4840BB", grows: "#E0245E" } as const` in `PaymentChart.tsx`.

- [ ] **Step 1: Write the failing tests:**
  - `chart colours are the validated palette`: import `CHART_COLORS` and `toEqual` the object above.
  - `danger warnings come first and are marked`: render `MOCK_COMPARISON`. The `[data-severity]` alerts, in order, start with `data-severity="danger"` and the SAVE deadline title.
- [ ] **Step 2:** Run `npx vitest run components/funnel/__tests__/results.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Charts use `CHART_COLORS`, with the existing end labels and padded domain kept. The recommended bar's x-axis label reads "{short} · best".
  - Toggles and the filing panel become white `rounded-2xl` cards, keeping their labels, IDs and behaviour.
  - Warnings render with `data-severity`. Danger alerts use the deadline colours from Global constraints; the others are white cards.
- [ ] **Step 4:** Run `npx vitest run components/funnel`. Expected: PASS.
- [ ] **Step 5:** Stage the files. Commit after the go-ahead: `style(results): charts, what-if, filing, warnings`.

### Task 4: Quiz in band style (tiles, segmented progress, pinned Continue, answer chips)

**Files:**
- Modify: `components/funnel/Quiz.tsx`, `components/funnel/Choices.tsx`, `components/funnel/quizTypes.ts`, `app/check/page.tsx`
- Test: `components/funnel/__tests__/quiz.test.tsx`

**Interfaces:**
- Consumes: `Band` (Task 1); `validateStep`, `toBorrowerInput` and `askJuly2014` (unchanged).
- Produces:
  - `quizTypes.ts`: `STEP_QUESTIONS: Record<QuizStep, string>` = 1 "What was your income last year?", 2 "How do you file your taxes?", 3 "Who's in your household?", 4 "Tell us about your loans", 5 "Who do you work for?", 6 "What plan are you on now?".
  - `Choices<T>(…, layout?: "list" | "grid", icons?: Partial<Record<T, LucideIcon>>)`:
    - the native radio is visually hidden (`sr-only`) inside each tile label, so `getByRole("radio", { name })` still works;
    - the tile shows a visible focus ring through `has-[:focus-visible]`;
    - `grid` means two columns.
  - The quiz band:
    - six progress segments, "Step N of 6", and an `h2` (the existing focus target) whose text is `STEP_QUESTIONS[step]`;
    - on step 1 only, the line "Six short questions. No login, no email, and we never ask for your FSA ID.";
    - answer chips for completed steps, each `<button aria-label="Edit {what}: {value}">` that jumps to that step. For example, "Edit income: $55,000" goes to step 1 and "Edit filing: Head of household" goes to step 2.
  - Filing uses `layout="grid"` with icons; employer and July 2014 use `list`. Field labels stay as they are (the tests rely on them).
  - Continue and Back are `fixed inset-x-0 bottom-0` below 640px and static from 640px up. The form gets bottom padding so the last field stays visible.
  - `app/check/page.tsx` keeps the `h1` "Find your cheapest legal plan" as `sr-only` and keeps the sample section below the quiz.

- [ ] **Step 1: Update and add the failing tests in `quiz.test.tsx`.**
  - The first test's heading query becomes `{ name: "What was your income last year?" }`.
  - Add `answer chips jump back to their step`: enter "$55,000", go next, choose "Head of household", go next. Expect a button named "Edit income: $55,000". Clicking it shows the heading "What was your income last year?", with the input still holding "$55,000".
  - Add `tiles stay real radio buttons`: on step 2, `getAllByRole("radio")` has length 4 and every one has the `sr-only` class.
- [ ] **Step 2:** Run `npx vitest run components/funnel/__tests__/quiz.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** as specified under Interfaces. The mapping and validation logic stay untouched.
- [ ] **Step 4:** Run `npx vitest run components/funnel`. Expected: PASS, including the six-step walkthrough, the July 2014 skip, spouse validation and the sample-button tests.
- [ ] **Step 5:** Stage the files. Commit after the go-ahead: `feat(quiz): band header, tiles, answer chips, pinned continue`.

### Task 5: Landing page (gradient hero, preview card, stat tiles, quotes)

**Files:**
- Modify: `components/funnel/Hero.tsx`, `components/funnel/HowItWorks.tsx`, `app/page.tsx`
- Create: `components/funnel/PreviewCard.tsx`, `components/funnel/StatTiles.tsx`
- Test: `components/funnel/__tests__/landing.test.tsx`

**Interfaces:**
- Consumes: `Band`, `GlassChip` (Task 1); `computePlans` (`lib/engine`); `SAMPLE_BORROWERS.F2b` (`lib/mocks`); `wholeUSD` (Task 2).
- Produces:
  - `PreviewCard()`: a white phone-style card labelled "Sample", built from `computePlans(SAMPLE_BORROWERS.F2b)` and never hard-coded. It shows "Your best plan · RAP", `wholeUSD(129.17)` = "$129" with "/mo", and "↓ $600 this year".
  - `StatTiles()`: three tiles reading "4 plans compared", "6 questions · no login" and "0 passwords asked".
  - `Hero`, on the band:
    - the existing `h1` and sub-line;
    - a large white "Start the free check" link to `/check`;
    - `SampleButtons` restyled as glass buttons.
    - Then **immediately** `<Disclaimer variant="hero"/>` in a white card.
    - The preview card sits beside the text at 1024px and up, and after the disclaimer card below that.
  - `HowItWorks`: three white step cards with lucide icons, and the two quotes as cards (text unchanged).

- [ ] **Step 1: Add the failing tests in `landing.test.tsx`:**
  - `stat tiles are honest and consistent with the headline`: expect "4 plans compared", "6 questions · no login" and "0 passwords asked", and `queryByText(/2 minutes/)` to be null.
  - `the preview card shows the sample's real engine result`: `getByText("Sample")`, plus `getByText("$129")` inside the preview card (`data-testid="preview-card"`).
  - Keep the existing headline, CTA, disclaimer-order, quotes and banned-phrase tests unchanged.
- [ ] **Step 2:** Run `npx vitest run components/funnel/__tests__/landing.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** as specified under Interfaces.
- [ ] **Step 4:** Run `npx vitest run components/funnel`. Expected: PASS.
- [ ] **Step 5:** Stage the files. Commit after the go-ahead: `feat(landing): gradient hero, preview card, stat tiles`.

### Task 6: Audit page (verdict, sample tiles, drop target, finding cards)

**Files:**
- Create: `components/audit/AuditVerdict.tsx`
- Modify: `app/audit/page.tsx`, `components/audit/AuditView.tsx`, `components/audit/FindingsList.tsx`, `components/audit/ExtractedFields.tsx` (styles only)
- Test: `components/audit/__tests__/AuditVerdict.test.tsx`, `components/audit/__tests__/AuditView.test.tsx`

**Interfaces:**
- Produces:
  - `verdictFor(findings: AuditFinding[]): { headline: string; detail: string }`. The rules are:
    - errors > 0: headline `"{n} possible error(s)"`, detail = the first error's `title`;
    - else warnings > 0: headline `"Nothing wrong found"`, detail `"{w} thing(s) to check"`;
    - else: headline `"Everything we checked adds up"`, detail `"We checked {k} things against the rules."`.
  - `AuditVerdict({ findings })`: a gradient card (not full-bleed) with an `h2` set to the headline and the detail beneath.
  - The page band holds the existing `h1` and intro.
  - Sample statements become white tiles, keeping their buttons and accessible names.
  - The upload becomes a large dashed drop zone *around* the existing labelled input. Its label "Or upload your statement", its hint ID and its 4 MB limit all stay.

- [ ] **Step 1: Write the failing tests.**
  - `AuditVerdict.test.tsx`: `verdictFor(auditStatement(SAMPLE_EXTRACTIONS["mohela-subsidy-error"]))` gives `{ headline: "1 possible error", detail: "Your RAP interest subsidy looks short by $40.10" }`.
  - The EdFinancial sample gives the headline "Everything we checked adds up".
  - A list with only warnings gives "Nothing wrong found" and "1 thing to check".
  - In `AuditView.test.tsx`, add: after "Check the MOHELA statement sample" with the existing mocked fetch, `findByRole("heading", { name: "1 possible error" })`.
- [ ] **Step 2:** Run `npx vitest run components/audit`. Expected: FAIL.
- [ ] **Step 3: Implement** as specified under Interfaces. Findings become white cards with severity colours; behaviour is unchanged.
- [ ] **Step 4:** Run `npx vitest run components/audit app/api/audit lib/audit`. Expected: PASS.
- [ ] **Step 5:** Stage the files. Commit after the go-ahead: `feat(audit): verdict card, sample tiles, drop zone`.

### Task 7: Full verification at 390px and 1280px

**Files:** none (verification only; fixes go back into the owning task's files).

- [ ] **Step 1:** Run `npm run build && npm test`, plus `npx eslint app components lib/__tests__`. Expected: everything passes.
- [ ] **Step 2: Browser check.** Run `npx next start -p 3125` and use chrome-devtools at 390×844 and 1280×900. For every page, `document.documentElement.scrollWidth` must equal the viewport width.
  - `/`: the hero disclaimer card sits directly after the CTAs, and there's no seam between the header and the band.
  - `/check`: walk all 6 steps. Tab through the tiles (a visible focus ring, arrow keys move), and confirm the pinned Continue never covers the last option.
  - `/results`:
    - the single-parent sample (RAP $129);
    - the married teacher (PSLF chip, filing panel);
    - a single filer with AGI $150,000 set in `localStorage` (four-digit hero, $1,250, fits without wrapping);
    - `loans: []` (no-plans hero).
  - `/audit`: the MOHELA sample shows the "1 possible error" verdict.
  - `/checkout/success` and `/checkout/cancel`: P4's pages are readable under the indigo header.
- [ ] **Step 3:** Save screenshots of `/`, `/check`, `/results` and `/audit` at both widths to the job scratch folder for the lead.

### Task 8: After PR #4 merges, rebase and re-check with the real paywall and disclaimers

This is blocked until PR #4 (`feat/pay-trust`) is merged into `main`.

- [ ] **Step 1:** `git fetch origin && git rebase origin/main`. Resolve conflicts in favour of P4's versions of P4's files.
- [ ] **Step 2:** Run `npm run build && npm test`. Expected: PASS. P4's tests are included.
- [ ] **Step 3:** Repeat Task 7, step 2, for `/` (the real hero disclaimer at its real size), `/results` (open the CTA, see the real card with its plan picker and acknowledgement checkbox; with `state="NY"`, see P4's block message) and `/checkout/*`.
- [ ] **Step 4:** Ask the lead for the go-ahead to push `feat/redesign` and open the PR.
