# Student Loan Guardian — Pitch Deck

9 slides. Each slide has the on-screen content and a short speaker note.

---

## Slide 1 — Hook

**On screen:**

> "…SAVE was 497 new IDR plan is 2157 a month. Trying to figure out if I should sell my house or take my child out of daycare and have my wife split a vehicle."
>
> — r/StudentLoans, [reddit.com/r/StudentLoans/comments/1xvce04/2157_a_month_payment](https://www.reddit.com/r/StudentLoans/comments/1xvce04/2157_a_month_payment/)

**Speaker note:** That's not a hypothetical. That's one of millions of borrowers who woke up this year to a payment that quadrupled, with no idea which of five federal repayment plans actually fits their household. We built Student Loan Guardian so nobody has to guess their way into selling a car.

---

## Slide 2 — The problem

**On screen:**

- **6.52M** borrowers were still parked in SAVE as of June 30, 2026 — a plan courts are unwinding — with no clear replacement chosen. *(FSA Data Center)*
- **9.3M** borrowers are in default, owing **$234B**. *(FSA Portfolio by Loan Status)*
- **10.9%** of all student-loan balances are 90+ days delinquent. *(NY Fed Household Debt & Credit, Q3 2026)*
- GAO found **4 of 5 servicers missed FSA's own accuracy standard** — and FSA stopped monitoring accuracy in February 2025. *(GAO-26-108534)*

**Speaker note:** This isn't a knowledge gap borrowers can Google their way out of. The plans changed, the servicers are inaccurate, and the regulator stopped checking. Borrowers are on their own against a system that is, by the government's own audit, failing to grade its own homework.

---

## Slide 3 — Live demo

**On screen:** *(placeholder — live demo runs here; see `docs/pitch/demo-script.md` for the full 60-second flow)*

- No login. Open URL → plan comparison in under 60 seconds.
- Toggle "+2 kids" and "file taxes separately" — numbers update live.
- Click "Check a statement" → catch a RAP subsidy error on a sample statement → letter drafted.
- Hit the paywall → complete a Stripe test checkout.
- Every step runs on real code paths. Nothing is hardcoded except clearly labeled sample documents.

**Speaker note:** Everything you're about to see is the actual product, not slides pretending to be a product.

---

## Slide 4 — Why not ChatGPT or the official calculator

**On screen:**

- Our engine reproduces **22 of 22** published official worked examples — Federal Register regulatory impact analyses, ED fact sheets, FSA training slides, CRS tables — and matches StudentAid.gov's own live calculator **to the dollar on monthly payments**. (We do *not* claim to match its lifetime/"lowest total paid" projections — those depend on undocumented income-growth assumptions we deliberately don't replicate.)
- ChatGPT can only read what you paste in. It doesn't run a verified rules engine, and it can't audit a servicer statement against the actual federal formulas.
- Neither ChatGPT nor the official calculator **audits a statement for billing errors** or **tracks a borrower's own deadlines**. That's where we actually differentiate — not plan selection, which is already free and solved.

**Speaker note:** We're not trying to out-calculate StudentAid.gov — we match it. We're trying to do the thing it doesn't do: catch the servicer's mistakes and keep you from missing a recertification deadline.

---

## Slide 5 — The customer

**On screen: Maya**

- Married public-school teacher, PSLF-track. Her AGI $60,000; spouse AGI $90,000 (spouse has no loans). One child. $52,000 balance at 6.53%.
- Filing jointly, her best option is IBR at $591.24/mo (ties the 10-year Standard plan).
- Filing separately, her best option is RAP at $200.00/mo — a $391.24/mo gross saving.
- After the ~$650/yr tax cost of filing separately: **Maya saves an estimated $4,045/yr net** — the exact number our live demo will show on screen for her inputs.

**Speaker note:** Maya isn't a composite we invented for the deck. She's the exact scenario our engine computes right now, live, in the next room's demo. This is the kind of decision — plan vs. filing status vs. kids — that no calculator surfaces for you by default.

---

## Slide 6 — What we sell

**On screen:**

- **Free:** plan comparison, instant statement check.
- **Guardian — $9/mo or $79/yr:** full action plan with dates, letter templates, recurring statement audits, deadline reminders.
- **Why they come back every month:** recertification deadlines, annual income changes, new kids, marriage/filing-status changes, and rule updates (PAYE/ICR closing 2028-06-30) all reopen the question — and every statement is worth re-checking for errors, not just once.

**Speaker note:** This isn't a one-time calculator people use and churn from. The audit habit — "did my servicer bill me right this month" — is the retention engine.

---

## Slide 7 — The market

**On screen:**

- Base case: **~$12M ARR** (range $6-24M), bottom-up across five borrower segments: ex-SAVE borrowers still deciding, PSLF-track borrowers, borrowers in default, 25-45 year-olds with balances over $20k, and married borrowers on IBR/PAYE/ICR.
- The $100M path: expand into household statement audits beyond student loans — medical bills and EOBs — using the founder's billing-audit coding background. A year-2+ direction, not a hackathon claim.

**Speaker note:** We're sizing this honestly off real borrower segments, not a top-down TAM slide. The bigger number is a real adjacency, but it's not what we're pitching for today.

---

## Slide 8 — Unit economics

**On screen:**

| Case | LTV | CAC | LTV:CAC | Payback |
|---|---|---|---|---|
| Best | $122 | $25 | 4.9x | Day 0 |
| **Base** | **$85** | **$60** | **1.4x** | About month 12 |
| Worst | $54 | $167 | 0.3x | Never |

- The lever: pushing annual-renewal rate above 40% through the audit habit takes this to **3:1 at CAC ≤ $28**.
- Full formulas and all four growth levers: `docs/pitch/unit-economics.md`.

**Speaker note:** The base case works but isn't a slam dunk. The one variable that moves it from "fine" to "great" is renewal — which is exactly what the audit feature is built to drive.

---

## Slide 9 — Trust, legal, and team

**On screen:**

- We never ask for an FSA ID or password.
- NY and CA are not offered paid plans today (NY bans prepayment before service completion; CA requires DFPI registration) — geo-gated at checkout.
- Every disclaimer on the site (hero, results, paywall, letter, audit) ships verbatim, site-wide, already live.
- We never say "forgiveness guaranteed," "get your loans forgiven," or "stop collections." No ED/FSA logos. No "Federal / National / U.S. / Department / StudentAid" in our name.

**Speaker note:** We built the guardrails in before we built the growth loops. [Team introductions.]
