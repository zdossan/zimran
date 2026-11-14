# Student Loan Guardian: design

| | |
|---|---|
| **Date** | 2026-11-14 |
| **Event** | Business Cup 2.0 (Zimran × AIESEC): a 24-hour build, then a 5-minute pitch |
| **Team** | 4 people, each running their own Claude Code session, building in parallel |
| **Status** | **Approved by the user on 2026-11-15** |
| **Repo** | `zdossan/zimran` (currently empty). This doc moves to `docs/superpowers/specs/` in the repo with the foundation commit |

**Research behind this design.** It is in `research/` (sibling of the repo checkout):
- `08-student-loan-deep-dive.md`: rules, market, legal, test borrowers;
- `08a-rules-repayment-plans.md`: exact regulatory text;
- `engine_fixtures.py`: the reference calculator, with 22 published checks that pass;
- `08e-servicer-errors-statements.md`: statement fields and the audit checklist;
- `08h-reddit-quotes.md`: borrower quotes.

The foundation commit copies these into `docs/research/` in the repo, so every teammate has them.

---

## 1. Intent: what and why

**What.** A no-login web app for US federal student-loan borrowers. It does two things:
- **Free:** the borrower answers a short quiz and sees the cheapest legal repayment plan. The numbers match StudentAid.gov's official calculator to the dollar. Every number comes with the rule behind it, plus warnings about traps.
- **Paid ("Guardian"):** the borrower uploads a servicer statement. The app finds billing errors under the new rules for the Repayment Assistance Plan (RAP), explains each one, and drafts the letter to send. It also gives a dated action plan.

**Why this product.**
- **The need is large and acute:**
  - 6.5M borrowers are being pushed off the cancelled SAVE plan;
  - 9.3M borrowers are in default;
  - RAP is a new plan with new rules (started 2026-07-01).
- **Servicers make documented errors.** CFPB and GAO findings back this up, and a Reddit borrower reported: "My interest subsidy should be 93.21/month. I received $53.11."
- **We can't win by picking the plan.** The free official calculator already does that. Our edge is **trustworthy, rule-cited math plus watching the borrower's statements**.

**Why now.** Business Cup is judged on these weights:

| Criterion | Weight |
|---|---|
| Works end to end, with real (not faked) core value | 40% |
| What we sell and why users come back | 20% |
| Who we sell to | 15% |
| Why it makes money | 15% |
| Originality | 10% |

The judges (Zimran) run quiz funnels into paid subscriptions, so the funnel shape matters.

**What success looks like (demo day).**
- A judge opens the deployed URL, with no login.
- Within 60 seconds they see a plan comparison that changes live when they toggle "+2 kids" and "file taxes separately".
- They click "Check a statement" and watch it **catch the RAP subsidy error** on a sample statement. A letter is drafted.
- They hit the paywall and complete a Stripe test checkout.
- Everything runs on real code paths. Nothing is hardcoded except clearly labeled sample documents.

## 2. Goals, non-goals, anti-goals

**Goals (MVP)**
1. A quiz → result flow with no login, saved under an anonymous Supabase session.
2. A **calculation engine** in TypeScript, ported from `engine_fixtures.py`:
   - plans: RAP, IBR (10% or 15%), 10-year Standard, Tiered Standard;
   - rules for which plans each borrower can use;
   - a joint-vs-separate tax-filing comparison, including an estimate of the extra tax from filing separately;
   - the first-month RAP benefits (interest waived, principal match).

   It **must pass all 22 published checks plus 8 test borrowers** as unit tests.
3. A results page:
   - the monthly payment for each plan, and the cheapest one;
   - "lowest monthly" vs "lowest total" explained;
   - live toggles for dependents and filing status;
   - trap warnings: a new loan after 2026-07-01 removes IBR; Tiered Standard doesn't count toward PSLF; RAP/IBR forgiveness is taxable from 2026;
   - a rule reference on every number.
4. A **statement audit**:
   - upload an image or PDF;
   - Claude reads it into fixed fields (vision + structured output);
   - fixed rules check the fields;
   - the results page shows findings, each with expected vs actual and the rule.

   Three to four **synthetic sample statements**, clearly labeled "SAMPLE", ship with the app. One of them reproduces the subsidy error.
5. A **dated action plan**, plus **letters** filled in from the borrower's data: plan-switch request, billing-error dispute, CFPB complaint draft.
   - **A one-page PDF "Guardian report"** (P3) sums up the audit: the findings with expected vs actual, the rule for each, and the next steps with dates.
   - It is the takeaway to show the servicer or attach to a complaint, the same role the doctor report played in last edition's winner (Preggo).
   - It is a paid feature.
6. **The paywall:**
   - a Stripe test Checkout ($9/mo or $79/yr) unlocks the audit details and letters;
   - the entitlement is stored against the anonymous session;
   - paid plans are not offered to borrowers in New York or California;
   - disclaimers appear site-wide (exact text in research `08` §H).
7. **Pitch materials:** a 5-minute deck, unit economics, 2–3 ad creatives that comply with ad policy, and a demo script.
8. A Vercel deploy from `main`.

**Non-goals (explicitly out)**
- Private loans.
- Parent PLUS or consolidation edge cases. Show a "not supported yet" note instead.
- Alaska and Hawaii poverty tables. Optional if trivial.
- Parsing the federal loan data file (`MyStudentData.txt`). Stretch only.
- Comparing statements month to month.
- Real email or SMS reminders. Show the calendar; an `.ics` download is a stretch.
- Real servicer integrations, FSA ID login, a native mobile app.
- PAYE and ICR enrollment advice.

**Anti-goals (would make the product fail even if it "works")**
- Anything that looks like a scam:
  - asking for the FSA ID or password;
  - "get your loans forgiven" language;
  - charging to "apply" or "enroll";
  - ED/FSA logos, or "Federal/National/U.S./StudentAid" in the name.
- Showing a wrong number confidently. Every number cites its rule, and when unsure, say so.
- A demo that dies if the live LLM call is slow or fails. Pre-extracted results for the bundled sample statements are the fallback.
- A "ChatGPT wrapper" feel. The AI only reads documents. The rules engine does every calculation, and the UI must show that.

## 3. Constraints

- **Hackathon rules:**
  - B2C only;
  - web only;
  - the live product works end to end in a browser with **no sign-up or login**;
  - required stack: Next.js, Supabase, an LLM API with vision, Vercel, Stripe test mode.
- **Time:**
  - about 25 minutes of foundation;
  - four features in parallel, 1–2 hours each;
  - about 1 hour of integration and rehearsal.
- **Legal** (research `08` §H):
  - federal law allows charging for software, but **never sell by phone**;
  - **New York** bans payment before the service is complete, so no paid plan there;
  - **California** requires DFPI registration, so no paid plan there either;
  - disclaimers go on the footer, results, paywall, letters and audit results.
- **Rules accuracy:** use 34 CFR 685.208–.209 as of 2026-11-01 and the 2026 HHS poverty guidelines. Show `RULES_AS_OF = "2026-11-01"` in the UI.
- **Git:** feature branches only, with pull requests to `main`. Nobody pushes to `main` directly except the foundation commit, and only after approval.

## 4. Approaches considered

| | Approach | Trade-off | Decision |
|---|---|---|---|
| **A** | **Agree the shared format first, then each person builds one slice end to end**: foundation (skeleton + `lib/types.ts` + mocks) by one session, then 4 owners each build one slice in their own folders against the shared format | About 25 minutes where only one thing happens. After that, near-zero merge conflicts, and each slice can be tested with mocks | **Chosen** (user picked A) |
| B | Split by layer (frontend / backend / AI / setup) | Familiar, but the frontend waits for the backend's endpoints and the AI waits for both; blocking eats a 1–2 hour slice | Rejected |
| C | Everyone builds a mini-app and the best one is kept | Wastes 3 of 4 people | Dropped |

## 5. Decided parts of the how

### 5.1 Stack
| Area | Choice |
|---|---|
| App | Next.js (App Router) + TypeScript (strict) + Tailwind + shadcn/ui |
| Tests | Vitest, for the engine and the audit rules |
| Persistence | Supabase: anonymous auth, plus two tables (`sessions_data`, `entitlements`) |
| Payments | Stripe Checkout in test mode, with a webhook or a success-URL entitlement write |
| AI | `@anthropic-ai/sdk` |
| Hosting | Vercel |

**How the app calls Claude:**
- **Model:** `claude-opus-5-5`.
- **Output:** strict JSON through `client.messages.parse({ ..., output_config: { format: zodOutputFormat(StatementSchema) } })`, read from `response.parsed_output`.
- **Input:** images go in as `image` blocks; PDFs as `document` blocks (base64).
- **Effort:** `output_config.effort: "low"` or `"medium"`, because this is extraction.
- **Safety:** enable server-side refusal fallbacks by default (`fallbacks: "default"` with beta `server-side-fallback-2026-07-01`). Always check `stop_reason` before using the result.
- **API key:** server-side only, in an API route; never in the browser.

### 5.1a Accounts and environment
Everything is free at hackathon scale except the Anthropic API.

| Service | Account | Plan | Notes |
|---|---|---|---|
| **Vercel** | the lead's personal team, not a company team | Hobby (free, non-commercial) | Deploy with `vercel --prod` from the lead's checkout. If `zdossan` connects the repo in their own Vercel account, Git auto-deploy works too. Region: `fra1` (Frankfurt), next to the database |
| **Supabase** | a **personal** organization, not a company org | Free | Project `student-loan-guardian` in `eu-central-1` (Frankfurt). **Anonymous sign-ins** turned on in the dashboard |
| **Stripe** | new account, test mode only | free | Two test prices ($9/mo, $79/yr). No CLI and no webhooks: the entitlement is written on the success URL after a server-side check of the Checkout Session |
| **Anthropic** | API key from the console, with a monthly spend cap | pay as you go (~$0.02 per statement check) | Key stays server-side |

**Environment variables** (`.env.example` lists them; real values go only in each person's `.env.local` and in Vercel's settings, **never in git**, and are shared privately):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`
- `ANTHROPIC_API_KEY`

**When a key is missing:** every slice must still run with mocks. If `ANTHROPIC_API_KEY` is absent, the audit uses the cached extractions. If the Stripe keys are absent, the paywall shows a "demo unlock" button labelled as such.

### 5.2 Ownership (who touches what)
| Owner | Feature | Owns these paths | Must not edit |
|---|---|---|---|
| **Foundation** (lead's session, about 25 min) | Skeleton, shared format, mocks, layout, footer disclaimer, env template, team `CLAUDE.md` | everything initially; afterwards only `lib/types.ts` changes, and only with a team-wide notice | — |
| **P1** | Calculation engine and action-plan generator | `lib/engine/**`, `lib/actions/**`, `lib/config/rules.ts` | UI, API routes |
| **P2** | Landing page, quiz, results | `app/page.tsx`, `app/check/**`, `app/results/**`, `components/funnel/**` | engine internals |
| **P3** | Statement audit and letters | `app/audit/**`, `app/api/audit/**`, `app/api/report/**`, `components/audit/**`, `lib/audit/**`, `lib/letters/**`, `public/samples/**` | engine internals, funnel pages |
| **P4** | Payments, sessions, trust, pitch | `app/api/checkout/**`, `app/api/billing-portal/**`, `app/checkout/**`, `lib/supabase/**`, `lib/stripe.ts`, `supabase/migrations/**`, `components/paywall/**`, `components/legal/**`, `docs/pitch/**` | engine, audit rules |

### 5.3 The shared format (`lib/types.ts`)
The foundation session writes this file. It changes only with a team-wide notice.

```ts
export type FilingStatus = 'single' | 'hoh' | 'mfj' | 'mfs';
export type LoanType = 'sub' | 'unsub' | 'gradplus' | 'consolidation' | 'parentplus';
export type PlanId = 'RAP' | 'IBR' | 'STANDARD_10' | 'TIERED';
export type Employer = 'private' | 'government' | 'nonprofit';

export interface Loan { id: string; type: LoanType; balance: number; rate: number; disbursedOn: string } // ISO date
export interface BorrowerInput {
  agi: number;                 // borrower AGI
  spouseAgi?: number;          // used when filing jointly
  spouseEligibleBalance?: number; // spouse's RAP/IBR-eligible loans (for proration when filing jointly)
  filingStatus: FilingStatus;
  dependents: number;          // IRC §152 dependents on the borrower's return (RAP)
  familySize: number;          // IBR family size (spouse counts only when filing jointly)
  state: string;               // 2-letter code; AK/HI note only
  loans: Loan[];
  hadBalanceOnJuly2014: boolean; // IBR "new borrower" test (true → 15%)
  employer: Employer;          // PSLF eligibility hint
  currentPlan?: 'SAVE' | 'IBR' | 'PAYE' | 'ICR' | 'STANDARD' | 'RAP' | 'TIERED' | 'UNKNOWN';
  saveNoticeDate?: string;     // ISO; drives the 90-day deadline
}
export interface RapMonthBenefit { interest: number; waived: number; principalPaid: number; match: number; principalDrop: number }
export interface PlanResult {
  plan: PlanId; available: boolean; unavailableReason?: string;
  monthlyPayment: number; forgivenessYears?: number; pslfQualifying: boolean;
  firstMonth?: RapMonthBenefit;          // RAP only
  balanceChange12m?: number;             // + grows / − shrinks (for "lowest monthly ≠ cheapest")
  ruleRefs: string[]; notes: string[];
}
export interface Warning { id: string; severity: 'info' | 'warn' | 'danger'; title: string; body: string; ruleRef?: string }
export interface PlanComparison {
  input: BorrowerInput; results: PlanResult[];
  cheapestMonthly: PlanId;          // lowest monthlyPayment among available plans
  bestFor12mBalance: PlanId;        // most negative balanceChange12m (shrinks debt fastest)
  pslfTrack: boolean;               // employer is government or nonprofit
  recommended: PlanId; reason: string;   // see §5.4 "Recommendation rule"
  warnings: Warning[]; rulesAsOf: string;
}
export interface FilingComparison { mfj: PlanComparison; mfs: PlanComparison; mfsExtraTaxPerYear: number; netAnnualSavingMfs: number; caveats: string[] }
export interface ActionItem { id: string; dueDate?: string; title: string; detail: string; letterTemplateId?: LetterTemplateId }
export type LetterTemplateId = 'plan_switch' | 'billing_dispute' | 'cfpb_complaint';

export interface StatementExtraction {
  isSample: boolean; servicer: string; statementDate: string; dueDate: string;
  amountDue: number; planName?: string; loanStatus?: string;
  principalBalance: number; interestRate?: number;
  lastPayment?: { date: string; amount: number; toInterest: number; toPrincipal: number; subsidyApplied?: number; matchApplied?: number };
  monthlyInterestAccrued?: number;
  fieldConfidence: Record<string, number>; // 0..1
}
export interface AuditFinding {
  id: string; severity: 'ok' | 'warn' | 'error'; title: string; detail: string;
  expected?: number; actual?: number; ruleRef: string; letterTemplateId?: LetterTemplateId;
}
export interface AuditResult { extraction: StatementExtraction; findings: AuditFinding[]; rulesAsOf: string }
export interface Entitlement { pro: boolean; plan?: 'monthly' | 'annual'; paidStateBlocked: boolean }
```

**Function signatures each owner exports:**

| Owner | Signature |
|---|---|
| P1 | `computePlans(input: BorrowerInput): PlanComparison` |
| P1 | `compareFiling(input: BorrowerInput & { spouseAgi: number }): FilingComparison` |
| P1 | `buildActionPlan(c: PlanComparison, today: Date): ActionItem[]` |
| P3 | `auditStatement(x: StatementExtraction, input?: BorrowerInput): AuditFinding[]` (pure function) |
| P3 | `extractStatement(file): Promise<StatementExtraction>` (server-side) |
| P3 | `renderLetter(id: LetterTemplateId, data): string` |
| P4 | `getEntitlement(): Promise<Entitlement>` |
| P4 | `<Paywall feature=…>` component |
| P4 | `<Disclaimer variant="footer" \| "results" \| "paywall" \| "letter" \| "audit"/>` |

**Mocks.** `lib/mocks.ts` provides a `PlanComparison` (test borrower F2b), a `FilingComparison` (F4), an `AuditResult` (the subsidy-error sample) and an `Entitlement`. Each slice runs against these mocks until the real implementations merge.

### 5.4 Engine rules to implement (P1)
Source of truth: `research/08a` §6 formulas and `research/engine_fixtures.py`.

**RAP**
- The rate band applies to the **whole** AGI: AGI ≤ $10k → $120/yr; (10k, 20k] → 1%; … ; > $100k → 10%.
- Monthly payment = max($10, base ÷ 12 − $50 × dependents).
- When filing jointly and the spouse has eligible loans: multiply by the borrower's share of the couple's balance, then apply the $10 floor again.
- Interest not covered by an on-time payment is waived.
- Principal match = min(50, payment) − principal paid, but only when principal paid is below $50.
- Forgiveness after 360 payments.
- Counts toward PSLF.

**IBR**
- Rate × max(0, AGI − 1.5 × poverty line(family size)) ÷ 12. The rate is 15% if the borrower **had a balance on 2014-07-01**, otherwise 10%.
- Capped at the 10-year Standard payment.
- A result under $5 becomes $0; $5 to under $10 becomes $10.
- Forgiveness after 20 or 25 years.
- **Unavailable** if any loan was disbursed on or after 2026-07-01.

**10-year Standard and Tiered Standard**
- 10-year Standard: amortize over 120 months, $50 minimum.
- Tiered Standard: available **only** if a loan was disbursed on or after 2026-07-01. Term by balance: <$25k → 10 years, <$50k → 15, <$100k → 20, otherwise 25. It does **not** count toward PSLF.

**2026 poverty line (48 states and DC):** $15,960 for one person, plus $5,680 for each additional person.

**Recommendation rule** *(my call, settled during the builder check)*
- **"Lowest total" means the 12-month balance change only** (`balanceChange12m`). This is a simple month-by-month simulation over 12 months using each plan's payment, the RAP interest waiver and principal match, and normal interest accrual under IBR and Standard.
- **No lifetime projection.** StudentAid.gov's "Lowest Total Paid" depends on income-growth assumptions that aren't documented, and we won't invent them.
- **The "matches the official calculator to the dollar" claim covers monthly payments only.**

How `recommended` is chosen:
1. **PSLF track** (employer is government or nonprofit): pick the lowest `monthlyPayment` among available **PSLF-qualifying** plans (RAP, IBR, 10-year Standard; never Tiered). Reason: each extra dollar paid only reduces the balance PSLF will forgive tax-free.
2. **Not on the PSLF track:** pick the lowest `monthlyPayment` among available plans whose `balanceChange12m ≤ 0` (the balance doesn't grow).
   - If none qualify, pick the lowest monthly payment and add a `danger` warning: "your balance will grow by $X this year."
   - If `cheapestMonthly` lets the balance grow while another plan shrinks it (test borrower F2b), say so in `reason` and in a warning. Example: "IBR is $12 less per month, but your balance grows about $1,198/yr; RAP shrinks it about $600/yr."
3. **Tie-break** when monthly payments are within $1:
   - prefer the plan with the more negative `balanceChange12m`;
   - then the PSLF-qualifying one;
   - then the order RAP, IBR, STANDARD_10, TIERED.

   Example: F4 filing jointly, where IBR $591.24 equals 10-year Standard $591.24, so IBR wins.
4. **`reason` is one plain sentence that names the rule used.** The UI shows it under the recommendation.

**Extra tax from filing separately:** use the bracket method in `research/08` §B TAX-2, with the separate-return thresholds 12,400 / 50,400 / 105,700 / 201,775 / 256,225 / 384,350 and the separate-return standard deduction of $16,100. Also list the items a separate return loses, as caveats.

**Tests:** the 22 published checks and the 8 test borrowers from `engine_fixtures.py` become Vitest cases with the same expected values (to the cent). F4 (Maya) must show joint IBR $591.24 vs separate RAP $200.00, and an extra tax of $650 from the brackets.

### 5.5 Audit checks to implement (P3)
Each check returns an `AuditFinding` with the rule it applies.

| # | Check | Uses | Rule |
|---|---|---|---|
| 1 | Statement sent ≥ 21 days before the due date | statement date, due date | ED servicer contract (research `08e`) |
| 2 | Arithmetic: amount due vs installment/past due | fields | — |
| 3 | RAP interest subsidy: on an on-time payment, `subsidy = interest accrued − min(payment, interest accrued)`; compare with the subsidy the statement applied | last payment, interest accrued | 34 CFR 685.209(h)(4) |
| 4 | RAP principal match: if principal paid < $50, `expected match = min(50, payment) − principal paid` | last payment | 685.209(o)(2) |
| 5 | Payment amount vs the RAP formula | `BorrowerInput` (optional) | 685.209(f)(5) |
| 6 | Plan name, where shown: flag "STANDARD" if the borrower expected RAP or IBR | plan name | 685.210 |

**Sample statements.** P3 makes 3–4 synthetic statements, one per layout (MOHELA-, Nelnet- and EdFinancial-like; see `08e` §3b for the fields). Each is stamped "SAMPLE — NOT A REAL STATEMENT", in PNG and PDF. The demo sample reproduces the Reddit case: interest $181.00, payment $87.79, subsidy applied $53.11 where $93.21 was expected.

**Demo resilience.** Store pre-computed `StatementExtraction` JSON for each bundled sample. Use it if the live extraction fails or takes longer than 15 seconds, and say on screen that cached sample data was used.

### 5.6 Payments and trust (P4)
- **Paywall placement:**
  - free: plan comparison, warnings, and the first audit finding's title;
  - **paid:** full audit details, letters, the dated action plan and its calendar export.
- **Plans:** Stripe test prices of $9/mo and $79/yr, plus an unchecked acknowledgment checkbox (text in `08` §H).
- **Identity** *(my call, settled during the builder check)*:
  - The funnel stays **strictly anonymous**, with no email step in the quiz.
  - The entitlement is tied to the browser's anonymous Supabase session.
  - Stripe Checkout collects the email for the receipt; we don't use it for login.
  - **Cancellation:** a "Manage subscription" link opens the Stripe customer portal (test mode).
  - Adjust the research paywall text: "Cancel anytime in one step via *Manage subscription* (Stripe billing portal)." Drop "We'll remind you before an annual renewal". Stripe's receipt emails cover it in the demo.
  - The deck says restore-by-email and accounts come next.
  - **Why not an email step:** it adds friction against the no-sign-up rule, and it would load P4, already the heaviest slice.
- **Geo-gate:** if the quiz answer for state is NY or CA, the paywall shows "Paid plans aren't available in your state yet. You can use our free tools."
- **Disclaimers:** use the exact texts from research `08` §H: footer, ad/hero block, results, paywall, letters, audit.
- **Pitch** (`docs/pitch/`):
  - deck outline (problem → demo → why not ChatGPT → market → business → team);
  - unit economics (base LTV $85, CAC $60, 1.4×, and the lever to reach 3×);
  - 3 ad creatives within Meta/Google/TikTok policy;
  - a 60-second demo script.

### 5.7 Timeline and integration
1. **T+0 to T+25 min:** the foundation is committed to `main`. Each owner pulls it and starts their branch `feat/engine`, `feat/funnel`, `feat/audit` or `feat/pay-trust`.
2. **T+25 min to T+2h:** parallel build. Each owner's Claude Code plans its own slice and may use subagents inside its own folders.
3. **Merge order:** engine → audit → funnel → pay-trust. P4 integrates; each pull request needs passing tests and a build.
4. **T+2h to T+3h:** end-to-end run on the Vercel preview, fixes, then a full demo rehearsal with the deck.

**Definition of done for each feature:**
- it builds and its tests pass;
- it works with mocks and with the real neighbours once they merge;
- its disclaimer variant is in place;
- the pull request has no edits outside the owned paths.

## 6. Calls I made (check these)
1. **Team roles:** all four people code, and P4 also owns the pitch materials. The user accepted this with approach A.
2. **Recommendation and "lowest total"** (§5.4):
   - 12-month balance change only, with no lifetime projection;
   - PSLF-track users get the lowest payment among PSLF-qualifying plans;
   - everyone else gets the lowest payment that doesn't grow the balance.
3. **Identity** (§5.6): strictly anonymous, per-browser entitlement, cancellation through the Stripe portal, no email step.
4. **Model:** `claude-opus-5-5` for extraction, effort low or medium, with refusal fallbacks on.
5. **Demo resilience:** cached extractions for the bundled sample statements.
6. **The official-calculator match claim** is limited to monthly payments.

## 7. Left to the builders
- UI look, copy and component choices within shadcn/Tailwind.
- The internal structure of each owner's folder.
- The exact Supabase schema columns beyond the two tables.
- Whether the Stripe entitlement is written by a webhook or on the success URL (whichever is faster to make reliable).
- How the synthetic statements are produced: HTML → screenshot, a PDF library, or a design tool.
- Chart library: Recharts or plain SVG.
