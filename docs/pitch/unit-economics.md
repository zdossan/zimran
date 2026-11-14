# Unit Economics — Student Loan Guardian

Three cases, computed bottom-up from the actual Guardian pricing ($9/mo or $79/yr).

## The table

| Case | LTV | CAC | LTV:CAC | Payback |
|---|---|---|---|---|
| Best | $122 | $25 | 4.9x | Day 0 |
| Base | $85 | $60 | 1.4x | About month 12 |
| Worst | $54 | $167 | 0.3x | Never |

## Base-case math

**Inputs:**
- 70% of buyers choose the annual plan ($79/yr); 30% choose monthly ($9/mo).
- Payment processing fees: $2.59 on a $79 charge.
- Refunds: ~6% of purchases.
- Running (hosting/infra/support) cost: ~$2/yr per paying user.
- Annual-plan renewal curve: 25% renew the first year, then 55% / 63% / 65% in subsequent years.
- Monthly-plan retention curve: 55% renew after month 1, then 80%/month thereafter.

**Annual LTV:**
- Year 1 net revenue per annual buyer: $79 − $2.59 (fees) − refund drag ≈ **$69.67**.
- Applying the 25% → 55% → 63% → 65% renewal curve, the expected number of paid years per annual buyer is **1.53 paid years**.
- Annual LTV ≈ **$109**.

**Monthly LTV:**
- Applying the 55%-then-80% monthly retention curve, the expected number of paid months per monthly buyer is **≈3.7 paid months**.
- Monthly LTV ≈ **$31**.

**Blended LTV:**
- 0.7 × $109 (annual) + 0.3 × $31 (monthly) = **$85**.

**CAC:**
- Paid acquisition at **$1.50/click**.
- **2.5%** of visitors who click convert to a paying customer.
- CAC = $1.50 ÷ 0.025 = **$60**.

**Result:** $85 LTV ÷ $60 CAC = **1.4x**, with payback around month 12 — a real but unexciting base case.

## The lever

> **3:1 needs CAC ≤ $28.**

That requires roughly **5.4% of visits converting to a purchase** at the same $1.50/click — about **2x the industry average** conversion rate for a paid acquisition funnel in this category. We don't assume we'll get there; it's the target that makes the business work at scale.

## Four ways to move the lever

1. **Push annual renewal above 40%** through the recurring statement-audit habit. This is the single decisive variable — it's what separates the best case from the worst case in the table above, more than CAC does.
2. **A $129-149 Pro tier** for borrowers with more complex situations (multiple loans, PSLF tracking, self-employment income) — raises blended LTV directly.
3. **A one-time $39-49 "Plan + letters" product** for borrowers who want a single decision made and documented, not a subscription — captures buyers who'd otherwise bounce off the subscription ask entirely.
4. **B2B2C in year 2** — employer and union benefits channels (the same kind of partnership Savi uses with NEA, AARP, and Union Plus) to cut CAC toward the best case instead of the worst case.
