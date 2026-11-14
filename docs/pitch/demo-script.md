# Demo Script — Student Loan Guardian

## The 60-second judge flow (spec §1, success criteria)

This is exactly what a judge does, with no login, on the deployed URL:

1. **Open the deployed URL.** No login wall.
2. **Within 60 seconds, see a plan comparison** — built from a sample household's income, loan balance, and family info.
3. **Toggle "+2 kids."** The comparison recalculates live — household size changes IDR payment estimates across plans.
4. **Toggle "file taxes separately."** The comparison recalculates live again — this is the exact lever that makes Maya's scenario (slide 5 of the deck) worth an estimated $4,045/yr net.
5. **Click "Check a statement."** Watch the audit catch the RAP subsidy error on a sample statement.
6. **A letter is drafted** from that finding — pre-filled, ready to review and send.
7. **Hit the paywall.** Attempt to unlock the full action plan / letter / ongoing audits.
8. **Complete a Stripe test checkout.** Use Stripe's published test card; the checkout flow is the real one, running against Stripe's test mode.

**The one rule that matters:** every step above runs on real code paths. Nothing is hardcoded except the clearly labeled sample documents (the sample statement, the sample household). If a judge changes an input, the output changes for real.

## Narrating the flow (what to say while clicking)

- *(Opening the URL)* "No signup. This is what any borrower sees in the first ten seconds."
- *(Plan comparison appears)* "Five federal repayment plans, computed live — this engine reproduces 22 of 22 published official worked examples and matches StudentAid.gov to the dollar on monthly payments."
- *(Toggling +2 kids)* "Household size changes every IDR plan's payment — watch the numbers move."
- *(Toggling file separately)* "This is the lever almost nobody checks: filing status. For this household, it's worth real money — flagged as an estimate, same as every number on this screen."
- *(Statement check)* "Now the other half of the product — we don't just pick a plan, we check the bill. Watch this: RAP's interest subsidy is short by $40.10 on this sample statement."
- *(Letter drafted)* "That becomes a letter the borrower reviews and sends themselves. We never contact the servicer for them."
- *(Paywall + checkout)* "And here's the business model — Stripe test checkout, live, right now."

## 5-minute pitch timing

Budget against the 9 deck slides (`docs/pitch/deck.md`):

| Slide | Content | Time |
|---|---|---|
| 1 | Hook (Reddit quote) | 0:20 |
| 2 | The problem (stats) | 0:35 |
| 3 | Live demo (the 60-second flow above) | 1:00 |
| 4 | Why not ChatGPT / the official calculator | 0:30 |
| 5 | The customer (Maya) | 0:40 |
| 6 | What we sell | 0:25 |
| 7 | The market | 0:30 |
| 8 | Unit economics | 0:30 |
| 9 | Trust, legal, and team | 0:30 |
| **Total** | | **5:00** |

Notes:
- The live demo slide is the single largest time block on purpose — judges should see the real product running longer than they hear us talk about it.
- If running short on time, compress slides 6-7 (what we sell / market) first — the demo, the differentiation (slide 4), and the customer story (slide 5) are the parts that must not get cut.
