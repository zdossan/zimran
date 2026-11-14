@AGENTS.md

# Student Loan Guardian — team rules (read before coding)

Hackathon build (Business Cup 2.0). 4 people, each with their own Claude Code, building in parallel.
- Spec: `docs/superpowers/specs/2026-11-14-student-loan-guardian-design.md`
- Your plan: `docs/superpowers/plans/0X-*.md` (00 foundation, 01 engine, 02 funnel, 03 audit, 04 pay/trust/pitch)
- How we work: `docs/TEAM-WORKFLOW.md`
- Research (rules, numbers, disclaimer texts): `docs/research/`

## Ownership — only edit the paths you own
| Owner | Branch | Owns |
|---|---|---|
| P1 Engine | `feat/engine` | `lib/engine/**`, `lib/actions/**`, `lib/config/rules.ts` |
| P2 Funnel | `feat/funnel` | `app/page.tsx`, `app/check/**`, `app/results/**`, `components/funnel/**` |
| P3 Audit | `feat/audit` | `app/audit/**`, `app/api/audit/**`, `app/api/report/**`, `components/audit/**`, `lib/audit/**`, `lib/letters/**`, `public/samples/**`, `scripts/make-samples.ts` |
| P4 Pay/Trust/Pitch | `feat/pay-trust` | `app/api/checkout/**`, `app/api/billing-portal/**`, `app/checkout/**`, `lib/supabase/**`, `lib/stripe.ts`, `supabase/migrations/**`, `components/paywall/**`, `components/legal/**`, `docs/pitch/**` |
| Lead | — | `lib/types.ts`, `lib/mocks.ts`, `lib/format.ts`, `app/layout.tsx`, `components/ui/**` (shadcn — ask the lead to add a component), `vitest.setup.ts`, config files |

- **`lib/types.ts` is the shared contract.** Never change it yourself — post `TYPE CHANGE:` in the team chat; only the lead merges it.
- **Stubs:** every cross-slice function already exists as a stub returning mocks (`lib/mocks.ts`). Replace only *your own* stubs; keep their signatures.
- **No new npm packages** without asking (they cause lockfile conflicts). Everything in the plans is already installed.
- **Never push to `main`.** Work on your branch, open a PR. P4 merges in order: engine → audit → funnel → pay-trust.

## Global constraints (all slices)
- Never commit secrets. `.env.local` is gitignored; `.env.example` lists the names. Everything must run on mocks without keys.
- Show "Rules as of November 1, 2026" (`RULES_AS_OF` in `lib/types.ts`) wherever numbers are shown.
- Money: round to cents half-up with `round2()`; display with `formatUSD()` (both in `lib/format.ts`). Never re-define them; import them.
- Component tests: add `// @vitest-environment jsdom` at the top; jest-dom matchers and cleanup are already set up in `vitest.setup.ts`.
- `next.config.ts` has `cacheComponents` off on purpose: dynamic pages (`searchParams`, `new Date()`) build without Suspense wrappers.
- Never write: "forgiveness guaranteed", "get your loans forgiven", "stop collections"; never use "Federal / National / U.S. / Department / StudentAid" in the brand; no ED/FSA logos; **never ask for an FSA ID or password**.
- Claude API: model `claude-opus-5-5`, server-side only (load the `claude-api` skill before writing the call).
- Must work at 390px phone width.

## Before every commit / PR
```bash
npm run build && npm test
```
Write the failing test first, watch it fail, then implement (TDD). Commit after each plan task.
