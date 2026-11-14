# Foundation (lead): Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In about 25 minutes, put a deployable Next.js skeleton on `main`: the shared types, mock data, stub modules for every interface, and team rules, so that four people can build their slices in parallel without waiting on each other.

**Architecture:** One Next.js App Router app at the repo root (no `src/`). Shared types live in `lib/types.ts`. Every cross-slice function exists from minute 25 as a stub that returns mock data, and each owner later replaces only their own stub files.

**Tech Stack:**
- Next.js (latest, App Router), TypeScript strict, Tailwind, shadcn/ui
- Vitest and Testing Library
- `@anthropic-ai/sdk`, `zod`, `@supabase/supabase-js`, `stripe`, `recharts`, `pdf-lib`
- Vercel

**Spec:** `docs/superpowers/specs/2026-11-14-student-loan-guardian-design.md`. Until the first commit it lives at `research/design/`.

## Global Constraints
These apply to every plan, P1–P4 included.
- Never commit secrets. `.env.local` stays gitignored, and `.env.example` lists names only. The names are in spec §5.1a.
- `RULES_AS_OF = "2026-11-01"` is shown in the UI wherever a number is shown.
- Money: compute in floats and round to cents half-up (`Math.round(x * 100) / 100`). Display as `$1,234.56` via `formatUSD()` in `lib/format.ts`.
- **Copy that must never appear** in UI, letters or pitch:
  - "forgiveness guaranteed", "get your loans forgiven", "stop collections";
  - "Federal", "National", "U.S.", "Department" or "StudentAid" in the brand;
  - ED/FSA logos;
  - any field asking for an FSA ID or password.
- Claude model `claude-opus-5-5` is called server-side only.
- Each person edits only the paths they own (spec §5.2). `lib/types.ts` changes only with a message to the whole team.
- Branches are `feat/engine`, `feat/funnel`, `feat/audit` and `feat/pay-trust`. Pull requests go into `main`. Merge only when `npm run build` and `npx vitest run` both pass.

## Review Focus
- **A fresh clone with no `.env.local`:** `npm run dev` must still render every page from mocks. Test it in Task 4.
- **A stub that is never replaced:** the page must still work on mocks and show no crash. Covered by Task 2's typecheck plus Task 4's smoke run.
- **The NY §703 hero disclaimer variant:** it must exist in the stub's variant union (`"hero"`), even though spec §5.3's signature table forgot it. Added in Task 2.
- **Narrow phone width (390px):** the layout must not scroll sideways. Checked in Task 3.
- **Secrets accidentally staged:** `.gitignore` must cover `.env*` except `.env.example`. Checked in Task 4.

---

### Task 1: Scaffold the app and install every dependency once

All dependencies are installed here, so the four branches never conflict over `package.json` or the lockfile.

**Files:**
- Create: the Next.js scaffold, `vitest.config.ts`, `vercel.json`
- Modify: `package.json` (scripts)

- [ ] **Step 1:** Remove the empty `docs/` folder if it exists. In the repo root (only `.git` should be there), run `npx create-next-app@latest . --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes`.
- [ ] **Step 2:** Install the runtime packages: `npm i @anthropic-ai/sdk zod @supabase/supabase-js stripe recharts pdf-lib`.
- [ ] **Step 3:** Install the dev packages: `npm i -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/jest-dom`.
- [ ] **Step 4:** Set up shadcn with `npx shadcn@latest init -d`, then `npx shadcn@latest add button card input label select tabs badge alert checkbox switch separator progress dialog`.
- [ ] **Step 5:** Create `vitest.config.ts` with the `tsconfig-paths` and `react` plugins and `test.environment: "node"`. Component tests opt into jsdom with a `// @vitest-environment jsdom` comment. Add the script `"test": "vitest run"`.
- [ ] **Step 6:** Create `vercel.json` with `{ "regions": ["fra1"] }`.
- [ ] **Step 7:** Run `npm run build`. Expected: the build succeeds.

### Task 2: Shared types, mocks and interface stubs

**Files:**
- Create: `lib/types.ts`, `lib/format.ts`, `lib/mocks.ts`
- Create stubs:
  - `lib/engine/index.ts`
  - `lib/audit/index.ts`
  - `lib/letters/index.ts`
  - `lib/supabase/session.ts`
  - `lib/supabase/entitlement.ts`
  - `components/paywall/Paywall.tsx`
  - `components/legal/Disclaimer.tsx`
- Test: `lib/__tests__/contract.test.ts`

**Interfaces:**
- Produces `lib/types.ts`: **exactly spec §5.3, including the §5.4 additions** to `PlanComparison` (`bestFor12mBalance`, `pslfTrack`).
- Produces these stub signatures. P1–P4 replace the bodies; the signatures stay fixed.
  - `lib/engine/index.ts`:
    - `computePlans(input: BorrowerInput): PlanComparison`
    - `compareFiling(input: BorrowerInput & { spouseAgi: number }): FilingComparison`
    - `buildActionPlan(c: PlanComparison, today: Date): ActionItem[]`
  - `lib/audit/index.ts`:
    - `auditStatement(x: StatementExtraction, input?: BorrowerInput): AuditFinding[]`
    - `export const SAMPLE_IDS = ["mohela-subsidy-error", "edfinancial-ok", "nelnet-standard-placement"] as const`
  - `lib/letters/index.ts`: `renderLetter(id: LetterTemplateId, data: LetterData): string`, where `LetterData = { borrowerName?: string; servicer?: string; finding?: AuditFinding; comparison?: PlanComparison; today: Date }`
  - `lib/supabase/session.ts`:
    - `saveSessionData(key: "borrowerInput" | "comparison" | "audit", value: unknown): Promise<void>`
    - `loadSessionData<T>(key): Promise<T | null>`
    - The stub uses `localStorage`.
  - `lib/supabase/entitlement.ts`:
    - `getEntitlement(state?: string): Promise<Entitlement>`. The stub returns `{ pro: false, paidStateBlocked: state === "NY" || state === "CA" }`.
    - `isPaidStateBlocked(state: string): boolean`
  - `components/paywall/Paywall.tsx`: `<Paywall feature: "audit-details" | "letters" | "action-plan" | "report" state?: string>{children}</Paywall>`. The stub renders a locked card.
  - `components/legal/Disclaimer.tsx`: `<Disclaimer variant: "footer" | "hero" | "results" | "paywall" | "letter" | "audit" />`. The stub renders the footer text (research `08` §H 6.1) for every variant.
- Produces `lib/mocks.ts`:
  - `SAMPLE_BORROWERS: Record<"F1"|"F2a"|"F2b"|"F3a"|"F3b"|"F4"|"F5"|"F6", BorrowerInput>` with the inputs from research `08` §I.2.
    - **F4:** `filingStatus: "mfj"`, `agi: 60000`, `spouseAgi: 90000`, `dependents: 1`, `familySize: 3`, `hadBalanceOnJuly2014: true`, `employer: "government"`, one loan of $52,000 at 0.0653 disbursed 2012-09-01.
    - **F6:** `employer: "nonprofit"`, loans of $60,000 (2016-09-01) and $25,000 (2026-08-15), both at 0.07.
    - **F2b and F3b:** `filingStatus: "hoh"`.
    - All other borrowers: `employer: "private"`.
  - `MOCK_COMPARISON` (F2b);
  - `MOCK_FILING` (F4);
  - `MOCK_AUDIT` (the MOHELA subsidy error);
  - `MOCK_ENTITLEMENT`.

- [ ] **Step 1: Write the failing contract test.**
  - Import every stub and `lib/mocks.ts`.
  - Assert `computePlans(SAMPLE_BORROWERS.F2b).results.length === 4`.
  - Assert `MOCK_AUDIT.findings.some(f => f.expected === 93.21 && f.actual === 53.11)`.
  - Assert `formatUSD(1234.5) === "$1,234.50"`.
- [ ] **Step 2:** Run `npx vitest run lib/__tests__/contract.test.ts`. Expected: FAIL, because the modules are missing.
- [ ] **Step 3:** Write `lib/types.ts`, `lib/format.ts` (`formatUSD(n: number): string`) and `lib/mocks.ts`, plus the stubs that return the mocks.

  **Mock values** (from `engine_fixtures.py`):
  - **F2b:** RAP 129.17 with `balanceChange12m` −600; IBR 116.83 with +1198.08; STANDARD_10 454.19; TIERED unavailable ("needs a loan made on/after 2026-07-01"). `cheapestMonthly` = IBR, `bestFor12mBalance` = RAP, `recommended` = RAP.
  - **MOCK_AUDIT:** extraction `servicer: "MOHELA (SAMPLE)"`, `monthlyInterestAccrued: 181.00`, `lastPayment.amount: 87.79`, `subsidyApplied: 53.11`, `matchApplied: 50`. Finding `rap-subsidy` with `expected: 93.21`, `actual: 53.11`, `ruleRef: "34 CFR 685.209(h)(4)"`.
- [ ] **Step 4:** Run `npx vitest run && npx tsc --noEmit`. Expected: PASS.

### Task 3: App shell, placeholder routes and team rules

**Files:**
- Create:
  - `app/layout.tsx` (header with "Student Loan Guardian", `<Disclaimer variant="footer"/>`)
  - placeholder pages `app/page.tsx`, `app/check/page.tsx`, `app/results/page.tsx`, `app/audit/page.tsx`, `app/checkout/success/page.tsx`
  - `.env.example`, `CLAUDE.md`, `README.md`
  - `docs/research/` (copies of `08-*.md`, `08a…08h`, `engine_fixtures.py`)
  - `docs/superpowers/specs/` and `docs/superpowers/plans/` (the spec and the 5 plans)

- [ ] **Step 1:** Make each placeholder page render its owner tag, e.g. "Funnel: owned by P2". The results placeholder renders `MOCK_COMPARISON.recommended`.
- [ ] **Step 2: Write the team `CLAUDE.md`.** It contains:
  - the ownership table from spec §5.2;
  - the Global Constraints above;
  - "read your plan in `docs/superpowers/plans/` and the spec before coding";
  - "never edit `lib/types.ts` without telling the team";
  - "run `npm run build && npm test` before every PR".
- [ ] **Step 3:** Write `.env.example` with the 8 variable names from spec §5.1a, and make sure `.gitignore` has `.env*` and `!.env.example`.
- [ ] **Step 4:** Run `npm run dev`, open `/`, `/check`, `/results` and `/audit` at 390px width. Expected: every page renders, there's no sideways scroll, and the footer disclaimer is visible.

### Task 4: First commit, push and Vercel link (needs the user's go-ahead)

- [ ] **Step 1:** Run `git status`. Expected: no `.env.local` and no `.slg-secrets.env` staged.
- [ ] **Step 2:** On a fresh clone in a temporary folder with no `.env.local`, run `npm ci && npm run build && npm test`. Expected: PASS.
- [ ] **Step 3:** Ask the user. Only after an explicit "push", run `git add -A && git commit -m "chore: foundation skeleton, shared types, mocks, stubs, team rules" && git push -u origin main`.
- [ ] **Step 4:** Run `vercel link --yes --scope <lead's personal Vercel team>`, then `vercel --prod`. Expected: a production URL that renders `/` with the footer.
- [ ] **Step 5:** Post the four branch names and their plan file paths to the team.
