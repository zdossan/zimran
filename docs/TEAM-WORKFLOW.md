# How the 4 of us build Student Loan Guardian in parallel

**Repo:** `github.com/zdossan/zimran`.

**Rule of thumb:** everyone owns one slice, only edits their own folders, and builds against the shared types (`lib/types.ts`) and mock data, so nobody waits on anybody.

## 1. Who does what
Pick the names in the team chat. Suggested matches:

| Slice | Plan file | Best fit | Owns |
|---|---|---|---|
| **Foundation** (first 25 min) | `plans/00-foundation.md` | Lead (the lead's Claude Code session) | Everything until the first push, then `lib/types.ts` only |
| **P1 Engine** | `plans/01-engine.md` | Strongest at logic and tests | `lib/engine/**`, `lib/actions/**`, `lib/config/rules.ts` |
| **P2 Funnel** | `plans/02-funnel.md` | Best at frontend/UI | `app/page.tsx`, `app/check/**`, `app/results/**`, `components/funnel/**` |
| **P3 Audit** | `plans/03-audit.md` | Lead (document-auditing experience) | `app/audit/**`, `app/api/audit/**`, `app/api/report/**`, `lib/audit/**`, `lib/letters/**`, `public/samples/**` |
| **P4 Pay, trust, pitch + integrator** | `plans/04-pay-trust-pitch.md` | Most comfortable with Stripe and with presenting | `app/api/checkout/**`, `app/api/billing-portal/**`, `app/checkout/**`, `lib/supabase/**`, `components/paywall/**`, `components/legal/**`, `docs/pitch/**` |

**Changing the shared types:** if you need a type changed in `lib/types.ts`, post it in the chat. Only the lead edits that file, as a tiny pull request merged right away, and everyone pulls.

**Dependencies:** the foundation installs them all, so nobody should need `npm install <new>`. If you really need one, ask the integrator (P4) to add it in a small pull request to `main`. That avoids lockfile conflicts.

## 2. Timeline (T0 = start)

| Time | Lead (Foundation → P3) | P1 | P2 | P4 |
|---|---|---|---|---|
| **T0–0:25** | Claude builds the foundation and pushes to `main` | Accept the GitHub invite, install Node 22 + Claude Code, read the spec and your plan | Same, plus sketch the results-page layout on paper | Create the Stripe test account and two prices ($9/mo, $79/yr); create the Anthropic key with a spend cap |
| **0:25** | Send `.env.local` to the team **privately** | `git pull` → `npm ci` → `git checkout -b feat/engine` → start Claude | `git checkout -b feat/funnel` → start Claude | `git checkout -b feat/pay-trust` → start Claude |
| **0:25–2:15** | Build P3 on `feat/audit` | Build | Build | Build, plus write the pitch kit while Claude codes |
| **Every ~40 min** | 5-minute check-in in chat: done / next / blocked / any type change | ← | ← | ← |
| **~2:15** | Open a pull request | Open a pull request | Open a pull request | Merge in order: **engine → audit → funnel → pay-trust**, then deploy |
| **2:15–3:15** | Everyone tests the full flow on their phone (§5); each person fixes bugs in their own slice | ← | ← | ← |
| **3:15–4:00** | Rehearse the 5-minute pitch twice with a stopwatch | ← | ← | ← |

## 3. Setup for each teammate (one time, ~10 min)
1. **GitHub access:** `zdossan` adds you as a collaborator on `zdossan/zimran`; accept the invite.
2. **Tools:** install Node 22 and Claude Code. If you can, also install the superpowers plugin, which provides the `executing-plans` skill.
3. **Get the code** after the foundation push:
   ```bash
   git clone https://github.com/zdossan/zimran.git && cd zimran
   npm ci
   git checkout -b feat/<engine|funnel|audit|pay-trust>
   ```
4. **Environment:** paste the `.env.local` the lead sends you privately into the repo root. It's gitignored. **Never commit it, and never paste it in a public channel.** Without it, everything still runs on mocks.
5. **Check it runs:** `npm run dev` → http://localhost:3000.

## 4. What to tell your Claude Code
Paste this, with your plan number filled in:

> Read `CLAUDE.md`, `docs/superpowers/specs/2026-11-14-student-loan-guardian-design.md`, and `docs/superpowers/plans/0X-<name>.md`. Implement the plan task by task (use the superpowers:executing-plans skill if available). Write each test first, run it, then implement. Only edit the paths my plan says I own. Do not change `lib/types.ts`, `package.json` or another slice's files; if you think you must, stop and tell me. Run `npm run build && npm test` before every commit. Commit after each task on my feature branch. When all tasks pass, push the branch and open a PR to `main`.

Tips:
- Let it work. Check in at each task boundary.
- If it starts editing outside your folders, stop it.
- If a task takes much longer than expected, ask in the chat before going deeper. The fallback is the simpler version in your plan.

## 5. Definition of done (per slice) and the final check
**Each slice:**
- `npm run build` and `npm test` pass;
- it works with mocks, and again after the neighbouring slices merge;
- its disclaimer is shown;
- the pull request touches only owned paths.

**Final full-flow check on the production URL** (everyone, on phone and desktop):
1. The single-parent sample (F2b) shows "Recommended: RAP" plus the "IBR grows your balance" callout.
2. Toggling dependents recomputes; married filing separately shows the net saving.
3. On `/audit`, the MOHELA sample shows the subsidy error ($93.21 expected vs $53.11 applied).
4. The paywall leads to Stripe; test card `4242 4242 4242 4242` → unlocked → the letter and the PDF report download.
5. State NY shows "Paid plans aren't available in your state yet."
6. No console errors, and nothing scrolls sideways at phone width.

## 6. Chat conventions (one group chat)
Start messages with one of these:
- `DONE:`
- `BLOCKED:`
- `TYPE CHANGE:` (types change only through the lead)
- `PR:` (with the link)
- `MERGED:`
- `DEPLOYED:` (with the URL)

## 7. Pitch roles (decide by 3:00)
- **Presenter:** the story, the problem and business slides. Usually P4.
- **Demo driver:** runs the 60-second flow live. Usually P2, who knows the UI best.
- **Q&A backup:**
  - P1 for "how do you know the math is right?" (22 of 22 official examples);
  - Lead/P3 for "why not ChatGPT?" and "how does the audit work?"
