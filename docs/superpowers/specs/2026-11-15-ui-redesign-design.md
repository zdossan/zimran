# UI redesign: "Bold fintech" (direction B)

**Date:** 2026-11-15 · **Branch:** `feat/redesign` (from `main` at 1560ce8, which has the engine, audit and funnel merged)
**Mockups:** `docs/superpowers/specs/2026-11-15-ui-redesign-mockups.html`. Open it in a browser. **Row B** is the chosen direction; rows A and C are the rejected ones.
**Research:** a 16-screenshot study of Summer, Savi, NerdWallet, StudentAid.gov, Lemonade, Monarch, Rocket Money and Wealthfront. The findings are summarized under Approaches.

## 1. Intent and why

The lead looked at the deployed preview and did not like the UI or UX. It reads like a wireframe:
- grey shadcn defaults;
- an accidental Times New Roman font everywhere;
- legal paragraphs right under the main button;
- a results page where the answer has the same weight as everything else.

The product is judged at a hackathon: 40% "it works" and 20% "it sells", by judges watching a projector. Its real users are stressed US borrowers on a phone. The lead chose **direction B, "Bold fintech"**: an indigo gradient header band, a giant number for the answer, and heavy sans-serif type. Think Wealthfront or Rocket Money.

Our story against StudentAid.gov's official calculator is that it shows two co-equal "winners" and never says which to pick. **Every page should lead with the answer.**

## 2. Goals

1. **One look on every page:**
   - an indigo gradient band at the top that contains the nav and the page's main message;
   - a soft lavender-grey background below it, with white rounded cards;
   - Manrope (heavy weights) for everything, with tabular numbers for money.
2. **Results page (`/results`), top to bottom, at 390px:**
   - The gradient band shows "Your best plan · {plan}", a giant `$129/mo` (whole dollars in the hero; cents in the rows), the full plan name, and glass chips. The balance-change chip ("↓ $600 this year") always shows. The "Counts toward PSLF ✓" chip shows **only when `pslfTrack` is true**, so a private-sector borrower never reads it as "you qualify for PSLF". *(my call)*
   - A white "why" card with the engine's `reason`, with the key phrase emphasised.
   - **Compare plans:** one expandable row per plan, built on native `<details>`. *(my call)*
     - The summary line shows the plan name, a "BEST" badge on the recommended plan, a small "Counts toward PSLF" or "No PSLF credit" label, $/mo, and the yearly balance change in green or red. There is no bare "N yrs".
     - Opening a row shows today's per-plan details: the "Under current rules, a balance left after N years of qualifying payments is forgiven (federally taxable)" line, first-month waiver and match, the engine's `notes`, the rule references and "Rules as of Nov 1, 2026".
     - Unavailable plans are greyed out, with their reason in the summary.
   - The SAVE deadline or other danger warnings as one alert, then the remaining warnings.
   - **Primary CTA:** a full-width button, "Get my dated action plan · from $9/mo". Tapping it reveals the existing `<Paywall feature="action-plan" state={…}>` inline directly below, with no dialog. *(my call)* §H requires prices up front, so the price is in the button label, and P4's card carries its own disclaimer, plan picker and checkout button. The test that looks for `[data-feature="action-plan"]` now taps the button first.
   - A secondary button, "Check a statement for errors".
   - The what-if box, the joint-vs-separate panel and the charts, all restyled.
   - The results disclaimer (`<Disclaimer variant="results"/>`), visible.
3. **Quiz (`/check`):**
   - Each step is one screen.
   - The gradient band holds a segmented progress bar (6 segments) and the step's question in large type.
   - Answers are big tappable tiles with lucide icons. *(my call)*
     - The four filing statuses use a 2×2 grid.
     - The three employer types use full-width tiles with their existing hints.
     - The July 2014 question (Yes, No, Not sure) and the current-plan question use full-width tiles or a large select.
     - No new answer options are added. `Employer` in `lib/types.ts` stays `private | government | nonprofit`.
     - Text inputs are large, use the numeric keypad and show a `$` prefix.
   - "Continue" is a full-width button pinned to the bottom of the screen on mobile.
   - A small chip echoes the previous answers (for example "$55,000 · Head of household") and taps back to that step.
4. **Landing (`/`):**
   - A gradient hero with the existing headline and sub-line, a large "Start the free check" CTA and the two sample buttons.
   - A static "preview card" beside the hero: a phone-style card showing a sample result ($129/mo RAP, ↓ $600 this year), clearly labelled "Sample".
   - The **hero disclaimer** directly under the CTAs (see Constraints).
   - Three honest stat tiles: "4 plans compared", "6 questions · no login" and "0 passwords asked". These are consistent with the kept headline "…in 60 seconds…". *(my call)*
   - At 390px the hero disclaimer card comes right after the CTAs, and the preview card and stat tiles come after the disclaimer. On desktop the preview card sits beside the hero text.
   - The three-step "How it works" and the two Reddit quotes as cards.
5. **Audit (`/audit`):** the same frame.
   - The gradient band shows the verdict: for example "1 possible error · subsidy $40.10 short", or "Everything we checked adds up".
   - Sample statements become tiles.
   - The upload is a large drop target.
   - Findings are cards with severity colours.
6. **Fix the font bug.** `app/globals.css` sets `--font-sans: var(--font-sans)`, which points at itself. Load Manrope with `next/font/google` and wire it in.
7. **Must work at 390px with no sideways scroll,** and at 1280px on a projector.

## 3. Non-goals

- No change to engine numbers, audit rules, routes, data flow, session storage or what the copy means. The recommendation, reasons, warnings and rule references stay exactly as they are.
- No edits to P4's files while PR #4 is open: `components/paywall/**`, `components/legal/**`, `lib/supabase/**`, `lib/stripe.ts`, `app/checkout/**`, `app/api/checkout/**`, `app/api/billing-portal/**`. Their look changes only through the shared theme tokens and where we place them.
- No dark mode, no animation library, no new npm packages. Manrope comes from `next/font/google` and the icons from `lucide-react`.
- No lifestyle photos or illustrations beyond lucide icons and the static preview card.

## 4. Anti-goals (failure even if it works)

- **Salesy or untrue claims.** No made-up user counts, ratings or press logos (we have none). No urgency other than the borrower's real SAVE deadline. Nothing like "guaranteed" or "get your loans forgiven".
- **Collapsing or shrinking the required disclaimers** (see Constraints).
- **Losing "Rules as of Nov 1, 2026" and the rule references next to money.** They may move into the compare rows or a "See the rules" disclosure, but must stay on the page next to the figures.
- **Looking like the government:** no flag banner, condensed type or ED blue.
- **Breaking the funnel's tested behaviour.** That covers validation, sample banners, what-ifs never being saved, the no-loans state, and the empty `/results` state.

## 5. Constraints

- **Disclaimers (legal research `docs/research/08-student-loan-deep-dive.md` §H, aligned to NY §703):**
  - The **hero block must sit near the call-to-action in bold, at least 12pt (16px)**. It renders as `<Disclaimer variant="hero"/>`, and its text and styling are P4's. Our job is to place it directly under the CTAs, in its own white card on the gradient or right under the band, and never collapsed.
  - The results and audit disclaimers stay visible on their pages.
  - The footer disclaimer stays on every page (layout).
  - **Known gap, P4's to fix:** PR #4's `Disclaimer.tsx` renders the hero block at an inline `14px` (its comment reads the rule as "12px"). §H asks for at least 12pt, which is 16px, in bold. The redesign does **not** override P4's styling (no `!important` wrappers). The lead raises this with the P4 teammate.
- **Sequencing:** *(my call)*
  - Build on `main` against today's Paywall and Disclaimer stubs, designing for PR #4's real card: title, disclaimer, Monthly/Annual picker, the acknowledgement checkbox and "Continue to secure checkout".
  - The redesign PR merges **after** PR #4. Before merging, rebase onto `main` with PR #4 included, then re-check landing, results, the audit page and the checkout pages at 390px and 1280px with the real components.
- **Ownership:** `app/layout.tsx`, `app/globals.css` and `components/ui/**` are lead-owned, and the lead asked for this redesign. The funnel (P2) and audit (P3) files are the lead's own work. P4 files are off-limits (see Non-goals).
- **Theme tokens:**
  - Change the shadcn tokens in `app/globals.css` so `--primary` becomes indigo `#4840BB` (white text is about 7.7:1), and set the background, ink, muted text and radius.
  - P4's paywall and checkout buttons then pick up the new look with no edits.
  - P4's pages (`/checkout/success`, `/checkout/cancel`) must still look correct under the new layout header.
- **Colours:**
  - Gradient: `#6A61F0` → `#4840BB` → `#2A2475`.
  - Page background `#F5F6FB`, ink `#14142B`, muted text `#6E6E8F`.
  - "Shrinks" green and "grows" red must pass AA (4.5:1) as small text on white.
  - Deadline alert: `#9A4A00` on `#FFF1E6`.
  - The chart colours must be re-run through the dataviz validator (`validate_palette.js`) before shipping.
- **Stack:** Next.js 16.4 App Router, React 19.3, Tailwind 4.3, shadcn on Base UI, Recharts 3, Vitest with Testing Library. Read `node_modules/next/dist/docs/` before using any Next API.
- **Tests:** `npm run build && npm test` must pass. Copy and markup changes update the existing tests; they must not delete the behaviours those tests protect.

## 6. Approaches considered

From the research, three directions were mocked at 390px with real numbers (see the mockup file):
- **A, "Calm money app":** cream background, serif headlines, evergreen accent, compact table. Trustworthy and human, but quieter on a projector.
- **B, "Bold fintech": chosen by the lead.** Indigo gradient, giant number, heavy sans-serif, app-style rows and tiles. The most striking for judges. Its risk is reading as salesy, which the anti-goals handle.
- **C, "Polish only":** keep today's layout and fix the font and colour. The least work, but it still looks like a template.

Within B, two calls were made for the build:
- **Keep the quiz's 6 steps** (multi-field steps 2 and 4 stay as single screens) rather than one question per screen. This keeps the landing page's "Answer 6 questions" promise, the `validateStep` contract and its tests.
- **Keep both charts**, restyled, below the compare rows. Judges respond to visuals; the rows carry the exact numbers.

## 7. Decided parts of the how

- Lead with the answer on results and audit, using the giant-number hero.
- Use the same gradient band and nav on landing, quiz, results and audit. The layout header must read as part of the band on those pages and still look right on other pages (checkout).
- Tiles and rows use lucide icons, not emoji.
- Required disclaimers stay visible and keep their placement rules.
- Branch `feat/redesign`, one PR. Nothing is merged without the lead.

## 8. Left to the builder

- How the band and the layout header join technically: for example, a per-page band directly under a header with the same colour, or the header reading the route.
- Desktop layout details at 1280px, such as a two-column hero on the landing page, provided the answer still comes first and nothing scrolls sideways.
- The exact icon for each option, spacing, shadow and radius values, and the hover and focus styles (focus must stay visible).
- The quiz header content for the multi-field steps (2 and 4), the Back button, where the cheapest-plan callout, sample banner and spouse-income alert sit on the new results page, and the audit band before a result exists.
- Chart colours within the palette, validated as above.
