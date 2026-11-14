# P4 Payments, sessions, trust and pitch (plus integration): Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:**
- Anonymous Supabase sessions that persist answers and results.
- A Stripe test Checkout ($9/mo, $79/yr) that unlocks paid features through an entitlement verified on the server, with paid plans not offered in NY or CA.
- The exact legal disclaimers.
- The pitch kit: deck, unit economics, ad creatives, demo script and Q&A.
- Then merging all four branches and the final deploy.

**Architecture:**
- On first load the browser signs in anonymously and gets a Supabase user ID.
- Session data lives in `sessions_data`. Entitlements live in `entitlements`, and only the server writes them, using the service-role key after it retrieves the Stripe Checkout Session.
- There are no webhooks.

**Tech Stack:** `@supabase/supabase-js`, `stripe` (Node), Next.js route handlers, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-14-student-loan-guardian-design.md` §2 goals 6–8, §5.1a (accounts, env), §5.6 (payments and trust, identity call), §5.7 (integration).

**Branch:** `feat/pay-trust`. You own:
- `app/api/checkout/**`, `app/api/billing-portal/**`, `app/checkout/**`
- `lib/supabase/**`, `supabase/migrations/**`
- `components/paywall/**`, `components/legal/**`
- `docs/pitch/**`

You also merge the pull requests (Task 6).

## Global Constraints
- Follow the Global Constraints in `00-foundation.md`.
- **Disclaimer text** is copied **verbatim** from `docs/research/08-student-loan-deep-dive.md` §H "Exact disclaimer text":
  - footer = 6.1, hero = 6.2, results = 6.3, paywall = 6.4, letter = 6.5, audit = 6.6.
  - Replace the placeholders: `[RULES_DATE]` → "November 1, 2026"; `[CONSOLIDATION_LINK]` → the Direct Consolidation Loan page on StudentAid.gov. Open it in a browser and confirm it loads before shipping; if you can't find it, use `https://studentaid.gov`; leave out the DFPI line.
  - Paywall 6.4 changes per spec §5.6: the auto-renewal sentence becomes "Cancel anytime in one step via *Manage subscription* (Stripe billing portal)." and "We'll remind you before an annual renewal." is removed.
- **The hero block (6.2) is ≥12px bold** (spec: NY §703).
- **Paid plans are blocked when the borrower's state is `NY` or `CA`.** The paywall then shows exactly: "Paid plans aren't available in your state yet. You can use our free tools."
- **The acknowledgment checkbox starts unchecked, and checkout is disabled until it's ticked.**
- **The service-role key is only used in route handlers. It must never be imported into client components.**

## Review Focus
- **A user in NY or CA tries to pay:** the paywall shows the block message, and `/api/checkout` returns 403 even if called directly. Test in Task 3.
- **The user closes Stripe or presses Back:** nothing is unlocked, and the page shows "Payment cancelled — nothing was charged." Test in Task 3.
- **The success page is reloaded, or opened with another user's `session_id`:** the confirm route is idempotent and refuses when `client_reference_id ≠ current user`. Test in Task 3.
- **Supabase env vars are missing** (a fresh clone, or a teammate without keys): the session falls back to `localStorage`, and the paywall offers a labelled "Demo unlock (no payment configured)" button. Test in Task 1 and Task 2.
- **An entitlement faked in the browser:** `getEntitlement` reads only the server-written row (RLS lets the user select, not insert or update). Test in Task 2.

---

### Task 1: Supabase schema, anonymous session and persistence

**Files:**
- Create:
  - `supabase/migrations/0001_init.sql`
  - `lib/supabase/client.ts` (browser)
  - `lib/supabase/server.ts` (service role)
- Modify: `lib/supabase/session.ts` (replace the stub)
- Test: `lib/supabase/__tests__/session.test.ts`

**Interfaces:**
- Produces:
  - `getBrowserClient(): SupabaseClient | null` (null if the env vars are missing)
  - `ensureAnonSession(): Promise<string | null>` (the user ID)
  - `saveSessionData(key, value)` and `loadSessionData<T>(key)`, with the foundation's signatures
  - `getServiceClient(): SupabaseClient` (server only)

**The SQL:**
- `sessions_data(user_id uuid primary key references auth.users on delete cascade, borrower_input jsonb, comparison jsonb, audit jsonb, updated_at timestamptz default now())`, with RLS so a user can select, insert and update only their own row.
- `entitlements(user_id uuid primary key references auth.users on delete cascade, pro boolean not null default false, plan text check (plan in ('monthly','annual')), stripe_customer_id text, stripe_session_id text unique, updated_at timestamptz default now())`, with RLS letting a user **select** only their own row. Writes come only from the service role.

- [ ] **Step 1: Write the failing test** (jsdom, env vars unset). `saveSessionData("borrowerInput", SAMPLE_BORROWERS.F2b)` followed by `loadSessionData("borrowerInput")` round-trips through `localStorage`, and `getBrowserClient()` returns `null`.
- [ ] **Step 2:** Run `npx vitest run lib/supabase`. Expected: FAIL.
- [ ] **Step 3:** Implement as above.
  - With env vars present, call `ensureAnonSession()` (`supabase.auth.signInAnonymously()` if there's no session), then upsert `{ user_id, [column]: value }`.
  - The column map is `borrowerInput → borrower_input`, `comparison → comparison`, `audit → audit`.
- [ ] **Step 4:** Apply the migration in the Supabase dashboard's SQL editor, for project `student-loan-guardian`. Confirm that **Anonymous sign-ins** is on.
- [ ] **Step 5:** Run `npx vitest run lib/supabase && npm run build`. Expected: PASS.
- [ ] **Step 6:** Commit: `git commit -m "feat(supabase): anon session, schema, persistence"`.

### Task 2: Entitlement, paywall and disclaimers

**Files:**
- Modify (replace the stubs):
  - `lib/supabase/entitlement.ts`
  - `components/paywall/Paywall.tsx`
  - `components/legal/Disclaimer.tsx`
- Create: `components/legal/texts.ts`
- Test: `components/paywall/__tests__/paywall.test.tsx`, `components/legal/__tests__/disclaimer.test.tsx`

**Interfaces:**
- Produces:
  - `isPaidStateBlocked(state: string): boolean`
  - `getEntitlement(state?: string): Promise<Entitlement>`
  - `<Paywall feature state>{children}</Paywall>`
  - `<Disclaimer variant/>`
  - `DISCLAIMERS: Record<"footer"|"hero"|"results"|"paywall"|"letter"|"audit", string>`

**`getEntitlement`:**
- Reads the user's row from `entitlements`.
- With no Supabase, it reads `localStorage["slg_demo_unlock"] === "1"`.
- `paidStateBlocked` = `isPaidStateBlocked(state)`.

**`Paywall`:**
- If the user is entitled, render `children`.
- Otherwise show a lock card containing:
  - the feature's name;
  - the paywall text;
  - a Monthly ($9) / Annual ($79, "save 27%") choice;
  - the unchecked acknowledgment checkbox;
  - a "Continue to secure checkout" button that calls `POST /api/checkout`.
- If the state is blocked, show the block message instead of the plans.
- Without Stripe keys (the checkout route reports `{ configured: false }`), show "Demo unlock (no payment configured)", which sets `slg_demo_unlock`.

- [ ] **Step 1: Write the failing tests:**
  - `isPaidStateBlocked("NY")` and `("ca")` → true; `("TX")` → false;
  - with `getEntitlement` mocked to `{ pro: true }`, `<Paywall>` renders its child;
  - with `{ pro: false }`, the checkout button is disabled until the checkbox is clicked;
  - with the state `"NY"`, the block message is shown;
  - each `<Disclaimer variant>` renders its key phrase:

    | Variant | Key phrase |
    |---|---|
    | footer | "independent company" |
    | hero | "may not be the best or only option" |
    | results | "These are estimates, not guarantees" |
    | paywall | "What you're buying" and "Manage subscription" |
    | letter | "Template only" |
    | audit | "flag *possible* discrepancies" (ignoring markdown asterisks) |
- [ ] **Step 2:** Run `npx vitest run components/paywall components/legal`. Expected: FAIL.
- [ ] **Step 3:** Implement as above. Put the texts verbatim in `texts.ts`.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** Commit: `git commit -m "feat(trust): entitlement, paywall, exact disclaimers"`.

### Task 3: Stripe Checkout, confirmation and billing portal

**Files:**
- Create:
  - `app/api/checkout/route.ts`
  - `app/api/checkout/confirm/route.ts`
  - `app/api/billing-portal/route.ts`
  - `app/checkout/success/page.tsx`
  - `app/checkout/cancel/page.tsx`
  - `lib/stripe.ts`
- Test: `app/api/checkout/__tests__/checkout.test.ts` (with `vi.mock("stripe")`)

**Interfaces:**
- `POST /api/checkout`:
  - body: `{ plan: "monthly"|"annual", state?: string }`, plus the header `Authorization: Bearer <supabase access token>`;
  - returns `{ url }`, or 403 `{ error: "state_blocked" }`, or `{ configured: false }` when `STRIPE_SECRET_KEY` is missing;
  - creates the Checkout Session with `mode: "subscription"`, `line_items: [{ price: STRIPE_PRICE_MONTHLY | STRIPE_PRICE_ANNUAL, quantity: 1 }]`, `client_reference_id: userId`, `success_url: ${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}` and `cancel_url: ${origin}/checkout/cancel`.
- `POST /api/checkout/confirm`:
  - body `{ session_id }` plus the bearer token;
  - retrieves the session and requires `status === "complete"` and `client_reference_id === userId`;
  - upserts `entitlements { user_id, pro: true, plan, stripe_customer_id: session.customer, stripe_session_id }` (idempotent on `stripe_session_id`);
  - returns `{ pro: true }`.
- `POST /api/billing-portal`: returns `{ url }` from `stripe.billingPortal.sessions.create({ customer, return_url: origin + "/results" })`.

- [ ] **Step 1: Write the failing tests:**
  - checkout with `state: "NY"` returns 403;
  - with no `STRIPE_SECRET_KEY` it returns `{ configured: false }`;
  - confirm with a mocked session whose `client_reference_id` differs from the user returns 403;
  - calling confirm twice with the same `session_id` upserts once (the mock upsert is called with the same key) and returns `{ pro: true }` both times.
- [ ] **Step 2:** Run `npx vitest run app/api/checkout`. Expected: FAIL.
- [ ] **Step 3: Implement.** `lib/stripe.ts` exports `getStripe(): Stripe | null`.
  - The success page calls confirm, then shows "You're unlocked" with links back to `/results` and `/audit`.
  - The cancel page shows "Payment cancelled — nothing was charged."
- [ ] **Step 4: Dashboard setup** (test mode):
  - Create the product "Student Loan Guardian" with recurring prices of $9/month and $79/year, and put the price IDs in env.
  - In Settings → Billing → Customer portal, save the default config.
- [ ] **Step 5: Manual end-to-end check.** Pay with test card `4242 4242 4242 4242`. Expected: redirect to success, then unlocked. The audit details on `/audit` become visible.
- [ ] **Step 6:** Run `npx vitest run && npm run build`. Expected: PASS.
- [ ] **Step 7:** Commit: `git commit -m "feat(pay): Stripe checkout, confirm, billing portal"`.

### Task 4: Pitch kit

**Files:** create in `docs/pitch/`:
- `deck.md`
- `unit-economics.md`
- `ad-creatives.md`
- `demo-script.md`
- `qa-prep.md`

All numbers come from `docs/research/08-student-loan-deep-dive.md` §K and §G. **Use none of the "Avoid in the deck" items listed there.**

- [ ] **Step 1: `deck.md`, 9 slides:**
  1. **Hook:** the Reddit quote "SAVE was 497 new IDR plan is 2157 a month…", with its link.
  2. **The problem:** 6.52M still in SAVE, 9.3M in default, 10.9% of balances 90+ days late; GAO found that 4 of 5 servicers missed the accuracy standard.
  3. **Live demo:** a placeholder for the 60-second flow.
  4. **Why not ChatGPT or the official calculator:** the engine reproduces 22/22 official examples and matches StudentAid.gov to the dollar on monthly payments; the AI only reads documents; we audit statements and track deadlines, which neither of them does.
  5. **The customer:** Maya, the teacher filing separately, saves about $4,045/yr net (spec §5.4, F4).
  6. **What we sell:** free plan check; Guardian at $9/mo or $79/yr; why users come back every month.
  7. **The market:** an honest base case of about $12M ARR; expansion into household statement audits (medical EOBs, using the founder's edge) for the $100M path.
  8. **Unit economics:** LTV $85, CAC $60 (1.4×) in the base case; the lever is audit retention above 40%, which takes it to 3×.
  9. **Trust and legal:** never the FSA ID; NY and CA not offered paid plans; exact disclaimers. Then the team.
- [ ] **Step 2: `unit-economics.md`.** Copy the §G LTV/CAC table and formulas verbatim, plus the "3:1 needs CAC ≤ $28" lever.
- [ ] **Step 3: `ad-creatives.md`.** Three creatives (Meta, TikTok, Google search). Each is educational, says "estimate" on any example figure, includes "Not affiliated with the Dept. of Education. Applying is free at StudentAid.gov", and makes no personal-attribute claims ("Your SAVE…") and no "$X off" promises.
- [ ] **Step 4: `demo-script.md`.** The 60-second judge flow from spec §1 (success criteria), plus a 5-minute pitch timing.
- [ ] **Step 5: `qa-prep.md`.** Answers to: why not ChatGPT; why not the official calculator; Savi at $75; the $100M path; legal risk; what happens when the rules change; accuracy (the 22/22 tests).
- [ ] **Step 6:** Commit: `git commit -m "docs(pitch): deck, unit economics, ads, demo script, Q&A"`, then `git push -u origin feat/pay-trust` and `gh pr create --base main --title "Payments, sessions, trust, pitch kit"`.

### Task 5: Environment variables and deploy

- [ ] **Step 1:** With the Vercel project linked by the foundation, add each variable in spec §5.1a: `vercel env add <NAME> production` and `vercel env add <NAME> preview`. Values come from the team's private channel.
- [ ] **Step 2:** Run `vercel --prod`. Expected: the deploy succeeds, `/` loads, and the anonymous session row appears in Supabase after the quiz.

### Task 6: Merge and run the full flow

- [ ] **Step 1:** Merge in this order: `feat/engine` → `feat/audit` → `feat/funnel` → `feat/pay-trust`. Before each merge, run `gh pr checkout <n> && npm ci && npm run build && npx vitest run`, which must PASS.
- [ ] **Step 2:** On the production URL, at 390px and on desktop, check:
  1. the F2b sample shows "Recommended: RAP", with the IBR "balance grows" callout;
  2. the dependents toggle recomputes;
  3. married filing separately shows the net saving;
  4. the audit's MOHELA sample shows the `rap-subsidy` error title;
  5. the paywall leads to Stripe, the test card works, and the details, letter and PDF unlock;
  6. state NY shows the block message;
  7. there are no console errors.
- [ ] **Step 3:** Rehearse the demo script twice, with a stopwatch, and note fixes in each owner's chat.
