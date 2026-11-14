# Q&A Prep — Student Loan Guardian

Anticipated judge questions, with honest answers.

## "Why not just use ChatGPT?"

ChatGPT can only reason over whatever text a user pastes into it — it doesn't run a verified rules engine, and it has no way to audit a servicer statement against the actual federal formulas. Our engine reproduces 22 of 22 published official worked examples (Federal Register regulatory impact analyses, ED fact sheets, FSA training slides, CRS tables) and matches StudentAid.gov's own live calculator to the dollar — specifically on monthly payment amounts. An LLM gives you an answer that sounds plausible; we give you a number that's been checked against the government's own published examples.

## "Why not the official StudentAid.gov calculator? It's free and already does guest-mode RAP, Tiered, and married-filing-separately."

It does, and we're not trying to replace it — we match it on monthly payments, to the dollar. What it doesn't do is audit a servicer's statement for billing errors or track a borrower's own deadlines (recertification, plan-closure dates). That's our actual differentiation: not plan selection, which is already free and solved, but catching the mistakes that happen after the plan is chosen.

One honest caveat: our "matches to the dollar" claim is scoped to monthly payments, not the official calculator's lifetime/"lowest total paid" projections — those depend on undocumented income-growth assumptions we deliberately did not try to reverse-engineer and replicate.

## "Savi already does this for $75/yr. Why would anyone pay you instead?"

Savi Essential is $75/yr ($50/yr for AARP members); Savi Pro is $175/yr. Savi's real edges are that they file the application on the borrower's behalf and have union/employer channel partnerships (NEA, AARP, Union Plus) we don't have. But Savi doesn't offer a verified statement audit — their value, like the official calculator's, is plan selection, which is already free and undifferentiated between them and us. Our differentiation against both is the same: we audit the statement after the plan is picked. That's the feature neither Savi nor StudentAid.gov has.

## "What's the actual path to $100M?"

Not student loans alone — household statement auditing more broadly. The founder's background is in billing-audit coding, which generalizes to medical bills and EOBs, a much larger and similarly error-prone category of consumer paperwork. That's a year-2-plus expansion, not something we're claiming to have built or validated for this hackathon. The $12M base case is what we're actually pitching today.

## "What's your legal risk?"

Real, and only partially addressed. What's already built: NY and CA are geo-gated out of paid plans (NY prohibits taking payment before service is completed; CA requires DFPI registration we don't have), we never sell by phone, we never ask for a borrower's FSA ID or password, and every disclaimer (hero, results, paywall, letter, audit copy) is live site-wide saying plainly that this is general information software, not personalized financial or legal advice. What's not resolved: a real launch — beyond a hackathon demo — needs a lawyer's sign-off on state-by-state debt-adjusting and credit-services-organization statutes before we'd take payment from users broadly. We're flagging that honestly rather than claiming it's solved.

## "What happens when the rules change?"

This is a structural risk we're honest about, not one we've solved. Every number on the site displays a dated "Rules as of [date]" marker and cites the specific regulation it's drawn from, so a stale estimate is at least visibly stale rather than silently wrong. For example: PAYE and ICR close 2028-06-30; IBR itself has no end date, though a loan taken out after 2026-07-01 removes IBR eligibility going forward. Our mitigation plan, not yet built, is a "change feed" that would notify an active subscriber when a rule affecting their plan changes — which doubles as a retention hook, not just a compliance patch.

## "How do you know the engine is accurate? What's the 22/22 number?"

It's a real automated test suite, not a marketing claim — `engine_fixtures.py` runs the engine against 22 published worked examples pulled from Federal Register regulatory impact analyses, ED fact sheets, FSA training slides, CRS tables, and a live StudentAid.gov calculator comparison, and all 22 pass. To restate the scope precisely: the "matches to the dollar" claim covers monthly payment calculations only — not the official calculator's lifetime/total-paid projections, which rely on income-growth assumptions StudentAid.gov doesn't document and we chose not to guess at.
