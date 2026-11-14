# Student Loan Copilot: deep dive (rules, market, pain, competitors, legal, test fixtures)

**Prepared:** 2026-11-14.

**Inputs:** seven parallel research passes, plus a reference calculator.

| File | Topic |
|---|---|
| `08a` | Repayment-plan rules |
| `08b` | PSLF, SAVE, default, tax |
| `08c` | Market sizing |
| `08d` | Borrower voice and search demand |
| `08e` | Servicer errors and statements |
| `08f` | Competitors and go-to-market |
| `08g` | Legal and trust |
| `engine_fixtures.py` | Reference calculator |

**Tags:**
- **V**: read in the primary source (statute, CFR, Federal Register, FSA Data Center file, court filing, regulator page) or the official tool.
- **S**: secondary (news, advocacy, or a search snippet).
- **E**: our estimate, with the math shown.

"As of" dates are shown wherever a fact can change.

## Bottom line (blunt)

1. **The engine can be legally correct.** `engine_fixtures.py` reproduces **22 of 22** published worked examples: the Federal Register, ED's fact sheet, FSA's training slides, CRS and ED's amortization formula. It also matches StudentAid.gov's own calculator in a live test: $229/mo for RAP at $55k AGI.
2. **"Which plan is cheapest, with no login" is not original.** The free official Repayment Calculator already does guest mode, RAP, Tiered Standard and married-filing-separately (tested live 2026-11-14). Savi sells direct for $75/yr and *files the application for you*.
3. **The only defensible paid product is ongoing auditing.** That means checking statements and the federal loan file against RAP's interest-waiver and principal-match rules, guarding the PSLF count, and keeping a calendar of the borrower's own deadlines. No verified competitor does this, but **demand for it is unproven**.
4. **$100M ARR is not credible for a consumer-only student-loan product.** The bottom-up base case is about **$12M ARR** (range $6–24M). The base-case LTV:CAC is **1.4x**.
5. **Two states gate paid launch.** New York bans taking any payment before the service is fully completed, so the subscription can't be sold there. California requires registration with its financial regulator (DFPI) before charging. Both need geo-gating.
6. **Hackathon verdict:** still a strong *demo* (40% "works" and 15% "who" both score well), but originality and money are weaker than the first report claimed. Pitch it as **"Student Loan Guardian"**: a free plan check that matches the official calculator, plus a paid monthly audit and deadline guard. Show the base-case economics honestly. See J for the pivot options.

---

## A. Corrections to the first report

| # | First report said | What's right | Source (as of) | Conf. |
|---|---|---|---|---|
| A1 | "IBR closes 2028-07-01" (00 report, 07 doc) | **PAYE and ICR close on 2028-06-30; IBR has no end date.** But **any new Direct Loan, including a new consolidation loan, made on or after 2026-07-01 takes IBR away for all of that borrower's loans.** After that only Tiered Standard or RAP are open. PAYE/ICR borrowers who don't choose by 2028-07-01 go to RAP, or to IBR if their loans can't use RAP. | 34 CFR 685.209(d)(5), (c)(7); HEA §455(d)(1), (d)(7), (g)(3) ([eCFR](https://www.ecfr.gov/current/title-34/subtitle-B/chapter-VI/part-685/subpart-B/section-685.209); [20 USC 1087e](https://www.law.cornell.edu/uscode/text/20/1087e)) (2026-11-01) | High V |
| A2 | "Under RAP the balance falls by at least $50 every month" | **Wrong.** The match lifts that month's principal reduction only to **min($50, payment made)**. It applies only for an **on-time, full payment, not in deferment or forbearance**, and not for prepaid months. At the $10 minimum payment, principal falls by $10. Missed or late month: no match, no interest waiver. Statute: *"the lesser of— (I) $50; or (II) the total amount paid by the borrower for such month … minus (ii) the total amount … applied to such total outstanding principal balance."* | HEA §455(q)(2)(B); 34 CFR 685.209(o)(2)–(3) (2026-11-01) | High V |
| A3 | Example used IBR at 10% only | **IBR is 15% (forgiveness after 25 years) unless the borrower is a "new borrower"**: no outstanding balance when they took a loan between 2014-07-01 and 2026-06-30 (10%, 20 years). Recomputed at 15% ($55k AGI, $40k at 6.5%): single → IBR **$388.25** vs RAP $229.17. With 2 kids → IBR **$175.25** vs RAP $129.17. **So the "kids flip the answer" story only holds for post-2014 new borrowers** (IBR $116.83 < RAP $129.17). | 34 CFR 685.209(b)(13)(ii); HEA §493C(e); `engine_fixtures.py` F2–F3 | High V |
| A4 | Tiered Standard missing | Tiered terms are 10/15/20/25 years for balances <$25k / <$50k / <$100k / ≥$100k. Payments are fixed and fully amortizing, with a $50 minimum. **The plan is open only to borrowers with at least one Direct Loan made on or after 2026-07-01.** It is the default for new loans. SAVE borrowers who don't choose go to **Standard, or Tiered Standard if they have a new loan**. **Tiered Standard does not count toward PSLF.** | 34 CFR 685.208(b)(8), (c)(1), 685.210(a)(2); HEA §455(d)(7)(B); ED press release 2026-03-27 (via web.archive.org) | High V; SAVE mapping Med |
| A5 | "Collections restart likely in 2027" | **No official restart date exists.** ED paused garnishment and tax-refund offsets on **2026-01-16**. An ED spokesperson said **"Involuntary collections remain paused"** (to Yahoo Finance, 2026-10-29); Stateline reported on 11-12 that no restart had been announced. The Treasury–ED agreement of **2026-03-19** makes Treasury collect defaulted loans through its Cross-Servicing program in Phase 1, with **no timeline**. Defaults are still reported to credit bureaus. | [Treasury release](https://home.treasury.gov/news/press-releases/sb0419) + [fact sheet](https://home.treasury.gov/system/files/136/Fact-Sheet-Department-of-Education-and-Department-of-the-Treasury.pdf) (V); [CRS R48962](https://www.everycrsreport.com/reports/R48962.html) (V, quoting ED); Yahoo/Stateline (S) | High on "no date" |
| A6 | Official tool "needs an FSA ID login; no married-filing-separately comparison" (07 doc) | **Wrong.** The [Repayment Calculator](https://studentaid.gov/repayment-calculator/) offers **"Continue Without Logging In"**, a **Married Filing Separately** option with spouse-loan fields, **RAP and Tiered Standard**, and PSLF and consolidation toggles. It labels "Lowest Monthly Payment" and "Lowest Total Paid". Its weakness: guest mode shows a "partial picture" for existing borrowers, and it has no dated plan, letters or statement checks. | Live test 2026-11-14 (08f) | High V |
| A7 | "Servicers ignore 31% of complaints" | **Misleading.** It is 30.4% in 2025 and 31.6% in 2026 YTD, but **96–98% of late responses are MOHELA plus CFPB's generic "Servicer under contract with FSA" label.** MOHELA alone: **63.1%** not on time in 2026. Nelnet, Aidvantage and EdFinancial are near 0–9%. | CFPB complaint API, pulled 2026-11-14 (08e) | High V |
| A8 | "29M borrowers forced to decide now"; "$1.2B serviceable market" | Overstated. **6.52M** were still in SAVE on 2026-06-30. **More than 2M** have already chosen a plan (ED to *Money*, 2026-11-13), which leaves about **4.5–5.5M** still to decide (E). Plus **9.3M in default** and **2.75M on the PSLF track**. Base revenue is about **$12M ARR**, not a $1.2B serviceable market. | FSA Data Center (V); 08c | High (counts); E (revenue) |
| A9 | LTV ≈ $178 (assumed 2.5 paid years) | Benchmarks support about **1.5 paid years** on annual plans (year-1 retention on annual plans ≈ 28%, per RevenueCat SOSA 2026). **Base blended LTV is $85; CAC is $60; LTV:CAC is 1.4x.** | 08f §6 | E (benchmarked) |
| A10 | "Savi $50–175/yr, mostly via employers" | Savi sells **direct**: Essential **$75/yr** ($50 for AARP members) and Pro **$175/yr**. Essential **files the application for you**. NEA, AARP and Union Plus (AFL-CIO, 15M members) already partner with Savi; AFT partners with Summer. | [bysavi.com](https://www.bysavi.com/borrowers), [AARP](https://www.aarp.org/money/personal-finance/student-loan/) (V) | High |
| A11 | Taxable IDR forgiveness was "K, verify" | **Confirmed:** IDR/RAP forgiveness of debt discharged after 2025-12-31 is federally taxable (the ARPA §9675 exclusion expired). PSLF stays tax-free (IRC §108(f)(1)). | [26 USC 108](https://www.law.cornell.edu/uscode/text/26/108) (V); 08b | High |
| A12 | "Default count 9.3M (secondary)" | Now verified: **9.3M borrowers, $234.1B** at 2026-06-30. | [FSA Portfolio by Loan Status](https://studentaid.gov/sites/default/files/fsawg/datacenter/library/PortfoliobyLoanStatus.xls) (V) | High |

**Also fix in `07-student-loan-idea-explained.md`:** rows A1, A2, A6 and A10. The "$595 vs $79" anchor should now be "$75 Savi Essential vs ours".

---

## B. Rules table (engine parameters)

All CFR references are to 34 CFR Part 685, eCFR version as of 2026-11-01. Formula text is quoted in `08a`.

| ID | Rule | Value | Source | As of | Conf. |
|---|---|---|---|---|---|
| RAP-1 | Base payment | AGI ≤ $10,000 → **$120/yr**. Otherwise the band rate × **whole** AGI (bands are "more than X, not more than Y"): (10k,20k] 1% … (90k,100k] 9%, **>$100k 10%**. $50,000.00 is 4%; $50,000.01 is 5%. | §685.209(b)(2); HEA §455(q)(4) | 2026-11-01 | High V |
| RAP-2 | Monthly payment | **max($10, base ÷ 12 − $50 × dependents)**. The final payment may be below $10. There is no $0 payment. | §685.209(f)(5), (g)(3)(ii) | 2026-11-01 | High V |
| RAP-3 | Dependent | An IRC §152 dependent **claimed on the borrower's return**. If married filing separately, only the borrower's own return counts. This is **not** IBR family size: the borrower and spouse don't count. | §685.209(b)(3) | 2026-11-01 | High V |
| RAP-4 | Interest waiver | Interest not covered by an **on-time payment of the amount due** is not charged. Late, partial or missed months get no waiver. Interest from before entering RAP is not waived. | §685.209(h)(4); HEA §455(q)(2)(A) | 2026-11-01 | High V |
| RAP-5 | Principal match | If on time, not in deferment or forbearance, not a prepaid month, and principal paid < $50: **match = min(50, payment) − principal paid**. Tested on the **total** principal across RAP loans. | §685.209(o)(2)–(3); HEA §455(q)(2)(B) | 2026-11-01 | High V |
| RAP-6 | Married filing jointly | Joint AGI. If the spouse has eligible loans: payment × (own principal+interest ÷ couple's principal+interest), then the $10 floor again. Separated, or unable to access the spouse's income → own AGI. | §685.209(e), (g)(3)(i) | 2026-11-01 | High V |
| RAP-7 | Married filing separately | Own AGI and own dependents only; the spouse's loans are excluded. | HEA §455(q)(4)(A); §685.209(b)(3), (e) | 2026-11-01 | High V |
| RAP-8 | Forgiveness | **360 qualifying payments over at least 30 years**, with the last payment under RAP. Qualifying payments include on-time RAP, Tiered Standard, IBR, ICR/PAYE/REPAYE (before 2028-07-01), any payment of at least the 10-yr standard amount, and some deferment/forbearance months before 2026-07-01 (the statute says before 2025-07-04; conflict). | §685.209(k)(7)–(8) | 2026-11-01 | High V (date conflict) |
| RAP-9 | Recertification | Annual, automatic with IRS-data consent. If missed, the payment becomes the 10-yr standard amount on each loan's balance when it entered repayment. | §685.209(l)(4), (l)(9)(iv) | 2026-11-01 | High V |
| RAP-10 | Eligible loans | Direct Sub, Unsub, Grad PLUS, and consolidations that are not "excepted", **including defaulted loans**. **Parent PLUS and consolidations of Parent PLUS are excluded.** All RAP-eligible loans must be in RAP together. | §685.209(d)(4); HEA §455(d)(7)(E) | 2026-11-01 | High V |
| RAP-11 | Switching | Borrowers with only pre-2026 loans can switch between RAP, IBR and fixed plans **at any time**. Borrowers with a new loan can switch only between Tiered Standard and RAP. RAP payments **don't** count toward IBR forgiveness. (A secondary claim that IBR→RAP is one-way conflicts with this; the regulation wins.) | §685.209(i), (k)(4)(i)(A); §685.210(b) | 2026-11-01 | High V |
| IBR-1 | Formula | **min(rate × max(0, AGI − 1.5 × FPL) ÷ 12, cap)**. Rate is **10%** for a new borrower and **15%** otherwise. | §685.209(b)(4), (f)(2)–(3); HEA §493C | 2026-11-01 | High V |
| IBR-2 | "New borrower" | No outstanding Direct or FFEL balance when they took a loan dated 2014-07-01 to 2026-06-30, and no new loan on or after 2026-07-01. Consolidating pre-2014 loans after 2014 does not make someone new (Med). | §685.209(b)(13)(ii); HEA §493C(e) | 2026-11-01 | High V |
| IBR-3 | Poverty guideline | The HHS guideline for the borrower's state and family size. ED uses the **current-year** guideline (its 2026 examples match the 2026 table). The exact switch date in Jan–Jun is unconfirmed. | §685.209(b)(14); 91 FR 1797; ED ICR notice 91 FR 34815 | 2026-06-09 | Med-High |
| IBR-4 | Family size | Borrower; spouse **only if filing jointly**; children receiving >50% support (including unborn); other dependents living with the borrower who receive >50% support. | §685.209(b)(9) | 2026-11-01 | High V |
| IBR-5 | Cap | The 10-yr standard payment on balances and rates **at IBR entry** (fixed). | §685.209(f)(3)(ii); HEA §493C(b)(6) | 2026-11-01 | High V |
| IBR-6 | Floors | Under $5 → $0; $5 to under $10 → $10. | §685.209(g)(1)(iii) | 2026-11-01 | High V |
| IBR-7 | Forgiveness | 240 months for new borrowers; 300 for others. SAVE-forbearance months don't count. | §685.209(k)(1)–(2) | 2026-11-01 | High V |
| IBR-8 | Married | Filing jointly: combined AGI, prorated by balance if the spouse has eligible loans. Filing separately: own AGI and debt only. | §685.209(e), (g)(1); HEA §493C(d) | 2026-11-01 | High V |
| IBR-9 | Partial financial hardship | **Removed** from 2025-07-04 by statute; ED's systems dropped it on 2025-12-22. | P.L. 119-21 §82001(f)(2); GEN-25-04 | 2025-12-22 | High V |
| IBR-10 | Missed recertification | Payment resets to the cap, and unpaid interest capitalizes. | §685.209(l)(9)(i), (j)(2) | 2026-11-01 | High V |
| FIX-1 | 10-yr Standard | M = P·i ÷ (1 − (1+i)^−120), i = rate ÷ 12, $50 minimum. Open with no end date to borrowers with **no** loan made on or after 2026-07-01. Graduated and Extended (>$30k) are also open. | §685.208(b)(1)–(7) | 2026-11-01 | High V |
| FIX-2 | Tiered Standard | <$25k → 10 yrs; <$50k → 15; <$100k → 20; ≥$100k → 25, based on **total Direct principal** at entry. Fixed and fully amortizing, $50 minimum. **Only borrowers with a loan made on or after 2026-07-01.** **Not PSLF-qualifying.** | §685.208(b)(8), (c)(1); HEA §455(d)(7)(A) | 2026-11-01 | High V |
| LEG-1 | PAYE / ICR | Running through **2028-06-30** for existing enrollees. Non-choosers → RAP, or IBR for RAP-ineligible loans, from 2028-07-01. Whether new enrollment is open is unclear (Jan 2025 rule cutoff 2027-07-01 vs RISE text 2024-07-01): **don't recommend new PAYE/ICR enrollment.** | §685.209(c)(4)–(7); 90 FR 3695 | 2026-11-01 | High / Low (cutoff) |
| ELIG-1 | New loan on or after 2026-07-01 | **Tiered Standard or RAP only, for ALL Direct Loans.** A new consolidation counts as a new loan. Parent PLUS-derived loans → Tiered Standard only. | HEA §455(d)(1), (d)(7), (g)(3) | 2025-07-04 | High V |
| ELIG-2 | Parent PLUS | Unconsolidated: fixed plans only. Consolidated before 2025-07-01: ICR until 2028-06-30, and **IBR after at least one ICR/PAYE/IBR payment made between 2025-07-04 and 2028-06-30**. Never RAP. | §685.209(b)(6), (c)(5) | 2026-11-01 | High V (whether a $0 payment counts: Low) |
| ELIG-3 | Defaulted loans | The regulation lets defaulted loans enter IBR and RAP; the preamble says RAP comes "after the default is resolved". | §685.209(d)(2), (d)(4), (m); §685.211(d) | 2026-11-01 | Med (conflict) |
| PSLF-1 | Qualifying plans | **RAP (on-time payments), IBR, 10-yr Standard**, a consolidation Standard with a 10-yr term, any plan paying at least the 10-yr standard amount, and ICR/PAYE/SAVE payments through 2028-06-30. **Tiered Standard does not count.** RAP months in deferment or forbearance don't count and can't be bought back. | HEA §455(m)(1)(A)(v); 91 FR 23835, 23844 | 2026-05-01 | High V |
| PSLF-2 | Employer rule ("substantial illegal purpose") | Final rule 2025-10-31; **vacated 2026-06-30** by D. Mass. and D.D.C. ED appealed 2026-08-27; two of three appeals were dismissed around Oct 21. The **attestation was removed from the PSLF form** (FR 2026-09-22). The CFR still prints the text. | [FR 2025-19729](https://www.federalregister.gov/documents/2025/10/31/2025-19729); [FR 2026-19368](https://www.federalregister.gov/documents/2026/09/22/2026-19368); [CRS LSB11472](https://www.everycrsreport.com/reports/LSB11472.html) | 2026-10-21 | High V (appeals S) |
| PSLF-3 | Count tracking | Counts show on StudentAid.gov and in the federal loan file (`MyStudentData.txt`, "PSLF cumulative matched months"), **not on servicer statements**. Buyback can cover SAVE-forbearance months. About **88,000** buyback requests were pending on 2026-04-30 (18–19k duplicates). | AFT v. ED court filings (V); 08e | 2026-04-30 | High |
| SAVE-1 | Status | The SAVE rule was **vacated 2026-03-10** (E.D. Mo. 4:24-cv-520, ECF 102). Interest has accrued since 2025-08-01. | [ECF 102](https://storage.courtlistener.com/recap/gov.uscourts.moed.211135/gov.uscourts.moed.211135.102.0.pdf) | 2026-03-10 | High V |
| SAVE-2 | Notices | Waves since 2026-07-01, by servicer (Nelnet's run through 2027-03). **90 days** from the borrower's own notice, then a **final 30-day notice**, then auto-placement into **Standard, or Tiered Standard if they have a new loan**. They can switch to RAP or IBR later. | ED 2026-03-27 (via web.archive.org); [College Investor 2026-10-15](https://thecollegeinvestor.com/90574/save-borrowers-miss-90-day-deadline-get-final-30-day-notice/) | 2026-10-15 | Med-High |
| DEF-1 | Collections | **Paused since 2026-01-16; "remain paused" (2026-10-29); no restart date.** Treasury will take over (Phase 1, Cross-Servicing), no timeline. | See A5 | 2026-11-12 | High |
| DEF-2 | Rehabilitation | 9 payments within 10 months at the IDR-formula amount (minimum $5), **once per loan**. From **2027-07-01**: a second rehabilitation, and a $10 minimum. Consolidation out of default isn't available under wage garnishment or a judgment. | §685.211(f); RISE rule; 08a M11 | 2026-11-01 | Med-High |
| TAX-1 | Forgiveness tax | **IDR/RAP forgiveness after 2025-12-31 is taxable federally** (insolvency is the main exception). **PSLF is tax-free.** Death and disability exclusion made permanent (P.L. 119-21 §70119). States vary: commonly named as taxing are MS, IN, NC, WI, AR (Low). | IRC §108(f); 08b | 2026-11-01 | High V (states Low) |
| TAX-2 | Filing-separately cost | **Bracket penalty = Σ Δrate × min(H − b, b − L)** over separate-return thresholds b ($12,400; $50,400; $105,700; $201,775; $256,225; $384,350) between the spouses' taxable incomes L and H. **Plus** what a separate return loses: student-loan interest deduction, education credits, child-care credit (and the dependent-care FSA limit drops to $2,500), EITC (except separated spouses), Premium Tax Credit, Roth IRA eligibility, the new tips/overtime/senior deductions, and the CTC phase-out starting at $200k. Community-property states split income 50/50. | [IRS Pub 501](https://www.irs.gov/publications/p501); [IRS 2026 inflation adjustments](https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill) | 2026 tax year | High V (method) |
| TAX-3 | Employer student-loan benefit (§127) | Made **permanent** by P.L. 119-21 and indexed: **$5,400 for 2027**. | [Rev. Proc. 2026-35 §3.17](https://www.irs.gov/pub/irs-drop/rp-26-35.pdf) | 2026-10 | High V |
| FPL-2026 | Poverty guidelines (48 states + DC) | 1 person $15,960; 2 $21,640; 3 $27,320; 4 $33,000; +$5,680 each extra. 150%: $23,940 / $32,460 / $40,980 / $49,500. Alaska and Hawaii tables in `08a` §4. | [91 FR 1797](https://www.federalregister.gov/documents/2026/01/15/2026-00755/annual-update-of-the-hhs-poverty-guidelines) | 2026-01-15 | High V |

**Pending in the next 12 months** (watch list; each feeds the alert feature):
- **PSLF employer rule:** the last appeal is likely to be dropped.
- **AFT v. ED** (IDR and buyback backlog): status conference **2026-11-23**. A new AFT buyback class action was filed 2026-10-30.
- **SAVE notices:** continuing into 2027.
- **Collections restart via Treasury:** date unknown.
- **Spring 2027:** the first tax season with taxable IDR forgiveness.
- **2027-07-01:** second-rehabilitation rules start.
- **2028-07-01:** ICR and PAYE end.
- **Open questions:** the PAYE/ICR new-enrollment cutoff, which deferment months count toward RAP, and whether defaulted borrowers can enter RAP directly (`08a` §7).
- **Unverified:** a stay on RISE's "professional degree" definition, and any bills to restore the tax exclusion.

---

## C. Market sizing

### Counts

FSA Data Center xls files were opened directly. Data are as of 2026-06-30 unless noted. The data as of 2026-09-30 is not out yet (expected December).

| Metric | Value | Source | Status |
|---|---|---|---|
| Federal portfolio | **42.3M** recipients, **$1,724.5B** | [FSA Data Center](https://studentaid.gov/data-center/student/portfolio) | V |
| By age (as of 2026-03-31) | ≤24: 6.2M · **25–34: 14.0M** · **35–49: 15.0M** · 50–61: 6.4M · 62+: 3.2M | FSA Portfolio by Age | V |
| IDR enrollees aged 25–49 | 10.5M | FSA | V |
| By plan | SAVE **6.52M** (7.43M in Sep 2025) · IBR 3.99M · PAYE 1.61M · ICR 1.32M · all IDR 13.44M ($792B) · Standard (≤10 yr) 11.99M · Extended 1.54M · Graduated 2.78M · RAP not yet listed | FSA Portfolio by Repayment Plan | V |
| By status | Repayment 17.4M (3.54M 31+ days late) · Forbearance 8.0M (7.26M administrative, mostly SAVE) · **Default 9.3M / $234B** · Deferment 3.3M · In school 5.2M · Grace 1.5M | [FSA Portfolio by Loan Status](https://studentaid.gov/sites/default/files/fsawg/datacenter/library/PortfoliobyLoanStatus.xls) | V |
| By servicer ($) | Nelnet $473.5B · Aidvantage $352.9B · MOHELA $314.6B · EdFinancial $214.4B · CRI $52.9B | FSA Portfolio by Servicer | V |
| PSLF (end Aug 2026) | **2.75M** with certified employment (average balance $90.5K) · **345,900** at 97–119 payments · forgiven: 1.29M borrowers, $96.4B | FSA `pslf-combined-report.xlsx` | V |
| Delinquency (Q3 2026) | Balance $1.656T. **10.9%** of balances 90+ days late. Yearly flow into serious delinquency 7.72% (14.26% a year earlier). By age: 30–39: 6.6%; 40–49: 8.6% | [NY Fed HHDC Q3 2026](https://www.newyorkfed.org/medialibrary/interactives/householdcredit/data/pdf/HHDC_2026Q3.pdf) | V |
| Ex-SAVE already chose a plan | **"More than 2 million"** | ED official to *Money*, 2026-11-13 ([AOL/Money](https://www.aol.com/articles/student-loan-borrowers-save-ever-174529000.html)) | S |
| Ex-SAVE still to decide | **4.5–5.5M** (base 5.0M). ED's 7.5M and FSA's 6.52M use different bases | E | E |
| IDR applications pending | 734,221 (2025-12-31) → **530,295 (2026-04-30)**; 456,594 decided in April. No processing-time data found | ED filings in AFT v. ED, via [College Investor (archived)](http://web.archive.org/web/20260514034115/https://thecollegeinvestor.com/80597/idr-backlog-falls-to-530295-in-april-2026/) | S (court data) |
| Professions | About 0.86M K-12 teachers with loans (NEA 28% × BLS teacher count, 2020 survey) · about 0.95M RNs (28% one-state study × 3.38M) · 23.3M government employees | NEA brief; BLS | E |

### Bottom-up: $79/yr

| Segment | Borrowers | Pays (base) | Revenue (base) |
|---|---|---|---|
| Ex-SAVE still deciding | 5.0M | 1.0% | $3.95M |
| PSLF-track (certified employment) | 2.75M | 2.0% | $4.34M |
| Defaulted | 9.3M | 0.25% | $1.84M |
| Aged 25–45, in repayment, balance >$20K | 5.77M | 0.5% | $2.28M |
| Married borrowers on IBR, PAYE or ICR | 3.46M | 1.0% | $2.73M |
| **Total** | 26.3M gross | | **$15.1M gross → about $12.1M after a 20% overlap cut** (range $6–24M) |

- **$100M ARR needs 1.27M payers:** 6% of all targeted borrowers, 3% of all 42.3M, 25% of ex-SAVE alone, or 46% of the PSLF track.
- **Benchmarks:**
  - Savi claims "3M+ borrowers reached" and "$7.9B debt managed", which implies about 200K actively managed after 9 years, mainly through employers.
  - Student Loan Planner: 24,000+ clients.
- **The ex-SAVE spike is one-time** and fades by about spring 2027.

---

## D. Borrower pain map

### D.1 Reddit quotes for the deck

- **How collected:** verbatim from r/StudentLoans and r/PSLF on 2026-11-14, logged out, in a real browser through Chrome DevTools. Details and 8 reserve quotes are in `08h-reddit-quotes.md`.
- **Dates:** marked ≈ (converted from Reddit's relative times). All are 2026.
- **Checked:** #3 and #10 were re-checked word for word against their links.
- **Privacy:** no usernames.
- ★ marks the best 8 for slides.

| # | Theme | Quote (verbatim) | Sub · date | Link |
|---|---|---|---|---|
| 1 ★ | SAVE notice chaos | "…the deadlines and all the information is so scattered it doesn't make sense. Some of my info is still saying the deadline is 2028, and some of my info is a vague "90 days" without a date." | r/StudentLoans · ≈09-09 | [link](https://www.reddit.com/r/StudentLoans/comments/1w5y550/comment/p9k5m6s/) |
| 2 ★ | Payment shock | "…SAVE was 497 new IDR plan is 2157 a month. Trying to figure out if I should sell my house or take my child out of daycare and have my wife split a vehicle." | r/StudentLoans · ≈11-13 | [link](https://www.reddit.com/r/StudentLoans/comments/1xvce04/2157_a_month_payment/) |
| 3 | Wrong plan placement | "Now I received a letter from Mohela that states my loans are on a tired payment plan and my monthly payment for both loans are $1,200???" | r/StudentLoans · ≈11-07 | [link](https://www.reddit.com/r/StudentLoans/comments/1xqzovi/comment/19sbzrrr0j6lg/) |
| 4 ★ | Official estimate ≠ servicer bill | "Switched from SAVE to Standard (within the 90 days.) the student aid website said our payment would be $814/mo. Submitted the application and now Nelnet says it's over $2k per month starting next month?!" | r/StudentLoans · ≈11-13 | [link](https://www.reddit.com/r/StudentLoans/comments/1xvlh3u/2000mo_on_standard/) |
| 5 | RAP vs IBR distrust | "I could switch to RAP and save a little bit of cash but I just don't trust it and if God forbid I lost my public service job\PSLF, New IBR would be my closest route to alternative forgiveness by far." | r/StudentLoans · ≈11-13 | [link](https://www.reddit.com/r/StudentLoans/comments/1qxgtdt/comment/19sm10v0mrglf/) |
| 6 | Servicer unresponsive | "…After 2 hours on hold, they said it has to be my fault and I must have entered something wrong. 3 times." | r/StudentLoans · ≈11-03 | [link](https://www.reddit.com/r/StudentLoans/comments/1xa18up/comment/19s3zlzpl81nk/) |
| 7 | Data mismatch | "…I already received a letter from Aidvantage about a month ago telling me my payment amount and due date (11/17), but "No Payment Due" is still showing up." | r/StudentLoans · ≈11-14 | [link](https://www.reddit.com/r/StudentLoans/comments/1xw334y/due_date_is_1117_but_aidvantage_page_says_no/) |
| 8 ★ | PSLF count dropped | "In July FSA retroactively marked four months from earlier this year as ineligible after they had already been marked eligible and qualified (ECF submitted). It took us from 117 qualified payments to 113." | r/PSLF · ≈11-10 | [link](https://www.reddit.com/r/PSLF/comments/1xsxkz1/comment/19sg2gqpv19nl/) |
| 9 | Buyback backlog | "…I submitted a buyback request for 9 months about 2 years ago and still havent received a response." | r/PSLF · ≈11-13 | [link](https://www.reddit.com/r/PSLF/comments/1xrxbj7/comment/19sl70g5s6ehv/) |
| 10 ★ | **RAP subsidy error (statement-check use case)** | "…My interest subsidy should be 93.21/month. I received $53.11." The same comment gives its own math: monthly interest $181.00, payment $87.79, so $181.00 − $87.79 = $93.21 | r/StudentLoans · ≈09-22 | [link](https://www.reddit.com/r/StudentLoans/comments/1wq5jw6/comment/pc5v4lb/) |
| 11 ★ | Forbearance without consent cost PSLF months | "I have the 120 months of public service credit but was forced into administrative forbearance without my permission making the last 14 of those months not eligible." | r/StudentLoans · ≈09-26 | [link](https://www.reddit.com/r/StudentLoans/comments/1wtcwph/comment/pczhgn1/) |
| 12 | Default fear | "I owe the federal government $37,000. I can't afford it even with the supposed income driven payments every time I log in pay, it's like I have accrew several thousand dollars in interest." | r/StudentLoans · ≈2026-08 | [link](https://www.reddit.com/r/StudentLoans/comments/1w11jr3/just_how_much_will_it_ruin_me_financially_to_let/) |
| 13 ★ | Willing to pay | "…I'm looking for someone who can review my specific situation and walk me through the best actions to take. Willing to pay a modest fee for a one-time consultation." | r/StudentLoans · ≈10-07 | [link](https://www.reddit.com/r/StudentLoans/comments/1x3h3rw/looking_for_a_student_loan_consultant/) |
| 14 ★ | Paid help went stale | "I paid both Gradfin and Savi for advice and I am not at all confident. I followed their advice , but with all the government changes, the advice quickly became obsolete." | r/StudentLoans · ≈2026-03 | [link](https://www.reddit.com/r/StudentLoans/comments/1s05vwc/comment/obrtmcc/) |
| 15 | Married filing separately | "I called them last Friday trying to see if they could open a link so I can filed married filed separately but she said that wasn't possible. She said to call back and request an administrative forbearance and file my taxes in January under married filed separately." | r/StudentLoans · ≈11-03 | [link](https://www.reddit.com/r/StudentLoans/comments/1xmvf41/comment/19s3c56a1uef7/) |

**What the Reddit quotes add to the pitch:**
- **#10 is a real, quantified RAP-subsidy shortfall**, posted by a MOHELA borrower. It is the first evidence of the exact error class our statement check targets. Section E said there was no documented case; now there is one anecdotal case.
- **#4 and #14 support the "rules go stale" angle:** the official estimate and the servicer bill don't match, and paid advice goes out of date when the rules change.
- **#13 shows willingness to pay,** but r/StudentLoans regulars often argue against paying for help (`08h`). Expect that objection.

### D.2 Supplementary quotes (Bluesky and App Store)

These are verbatim, with links and dates. CFPB stopped returning complaint narratives, so complaint counts are used instead.

| Theme | Verbatim quotes | Sev. |
|---|---|---|
| **SAVE ending / notices** | "In July I kept waiting for my servicer to send me the 90 day change notice, but it didn't come." ([Bluesky, 2026-09-25](https://bsky.app/profile/girlmeetsbrass.bsky.social/post/3mwexyz6vlk22)) · "I had a bit of a panic attack after checking my mail and seeing a nastygram from my student loan servicer." ([2026-10-06](https://bsky.app/profile/darkrose.bsky.social/post/3mxa2oq7o3s2u)) | 5 |
| **Payment shock / wrong placement** | "Log in and my payment is 5 times what was quoted!!! They had put me on the standard repayment plan!" ([2026-09-22](https://bsky.app/profile/nakatomiplaza.bsky.social/post/3mw4f3g7bkc2l)) · "my student loan payment DOUBLED to $1500 a month. Do I pay for stupidly expensive daycare or do I pay my loan?" ([2026-11-01](https://bsky.app/profile/msbishop.bsky.social/post/3mzb2exs5bk2c)) | 5 |
| **Servicer errors and unresponsiveness** | "Everytime I've called EdFinancial Services in the last month, the call is DROPPED AFTER 2 HOURS ON HOLD!" ([2026-09-04](https://bsky.app/profile/madmaymermaid.bsky.social/post/3muo3qx37xk2e)) · "they put you on a wait for over 3 plus hours then hang up on you. No problem sending bills you can't pay but also won't communicate!" ([MOHELA App Store review, 2026-07-07](https://apps.apple.com/us/app/mohela/id1082597420)) · "the DoE says my loans are in default and $8k behind, even though I'm perfectly current with my servicer." ([2025-12-10](https://bsky.app/profile/mpbmke.com/post/3m7lvto5us22h)) | 5 |
| **RAP vs IBR confusion** | "I love that my student loan company didn't tell me I qualified for an IBR until 28 days before it kicked in and I'd already applied for a RAP" ([2026-08-19](https://bsky.app/profile/loser-girl-dot-net.bsky.social/post/3mtgt26ldgs2b)) · "The IBR is $164 more a month than RAP but RAP adds 10 more years to my payment plan." ([2026-08-28](https://bsky.app/profile/bexcommunicated.bsky.social/post/3mu5oaz4vzk22)) | 4 |
| **PSLF counts** | "13 months of my loan payment counts has disappeared from my PSLF repayment count on the fed website." ([2026-08-10](https://bsky.app/profile/stinah.bsky.social/post/3msqj32nnuc2c)) · "…kept me locked in to my government job because I don't trust them to get the payment count right." ([2026-10-14](https://bsky.app/profile/gwillmac.bsky.social/post/3mxu6h26ky22b)) | 4 |
| **Distrust / scams** | "i thought it was a scam but i submitted an application to switch to one of the new student loan repayment plans" ([2026-09-05](https://bsky.app/profile/veilofbeing.bsky.social/post/3muqkyfzaps2i)) | 3 (but it decides whether a paid tool converts) |

**Triggers:**
- the SAVE 90-day notice, then the final 30-day notice;
- the first new bill (Nov–Dec 2026 for ex-SAVE borrowers);
- recertification and tax season;
- default and collections letters;
- life events: a new job (PSLF), a baby, a marriage.

**Behavior:** people ignore servicer mail until a hard deadline, then panic and fall back on forbearance. They trust peers, unions and nonprofits more than ED or servicers. One poll (DFP/TICAS, Dec 2025, search snippet, S) found 24% of borrowers who contacted their servicer got inaccurate information.

**Most costly mistakes** (sources in `08d`):
1. **Forbearance instead of a qualifying plan.** No PSLF credit, and the buyback backlog is about 88k. CFPB found Navient's forbearance steering cost borrowers up to $4B in interest.
2. **Choosing RAP or IBR without comparing both,** e.g. RAP's 30-year forgiveness vs IBR's 20–25.
3. **Missing recertification or the SAVE window.** The payment resets to the cap or Standard.
4. **Consolidating at the wrong time.** This now includes taking a new loan or consolidation after 2026-07-01, which kills IBR (A1).
5. **Paying scam fees:** NERD Solutions fees up to $1,400; Superior Servicing took more than $45.9M.

**Search demand** (Google Ads monthly averages via seodata.dev, **E**):

| Keyword | Est. monthly US searches |
|---|---|
| student loan forgiveness | 246,000 |
| PSLF | 74,000 |
| repayment assistance plan | **60,500** |
| save plan | 33,100 |
| student loan default | 12,100 |
| wage garnishment | 9,900 |
| IDR calculator | 2,400 |
| repayment assistance plan calculator | 720 |
| RAP vs IBR | ~0 (too new for 12-month averages) |

Servicer brand names are searched far more: MOHELA about 823k, Aidvantage about 550k. **Cost per click is $30–78** on default and RAP terms.

---

## E. Servicer errors and what a statement can show

### Evidence

| Error | Who | When | Source | V? |
|---|---|---|---|---|
| "Deceptive billing statements": **wrong payment amounts** (wrong poverty guideline, family size, income, missing spousal debt), wrong due dates, over-debits, IDR processing >90 days, improper IDR denials | Several servicers | Dec 2024 | [CFPB Supervisory Highlights 36](https://files.consumerfinance.gov/f/documents/cfpb_supervisory-highlights-special-ed-student-lending-issue-36-winter_2024-12.pdf) | V |
| 2.5M borrowers got **late statements**; 800k+ became delinquent; ED withheld $7.2M. ED requires statements ≥21 days before the due date | MOHELA | Oct 2023 | [NPR](https://www.npr.org/2023/10/31/1209464901/education-department-punishes-student-loan-servicer-billing-mistakes-mohela) / ED text via repost | V (repost) |
| FSA **stopped monitoring servicer accuracy** in Feb 2025; staff fell from 1,433 to 777. Before that, 4 of 5 servicers missed the accuracy standard. GAO warns of "incorrect billing amounts" | FSA / all servicers | Mar 2026 | [GAO-26-108534](https://files.gao.gov/reports/GAO-26-108534/index.html) | V |
| Payments "applied to the wrong loan", plan switches ignored, wrongful forbearance, PSLF miscounts | Several servicers | 2025 | [CFPB Consumer Response report](https://files.consumerfinance.gov/f/documents/cfpb_2025-cr-annual-report_2026-03.pdf) | V |
| Misallocated payments, forbearance steering, recertification failures. $100M redress + $20M penalty, banned from Direct Loans | Navient | Sep 2024 | [CFPB](https://www.consumerfinance.gov/about-us/newsroom/cfpb-bans-navient-from-federal-student-loan-servicing-and-orders-the-company-to-pay-120-million-for-wide-ranging-student-lending-failures/) | V |
| About 6,000 borrowers told the **wrong IDR amount**; false delinquency notices (MOHELA); RAP applications stalled | ED / MOHELA | 2026 | [Newsweek](https://www.newsweek.com/student-loan-update-thousands-of-borrowers-told-to-pay-incorrect-amount-12255318), [Forbes](https://www.forbes.com/sites/adamminsky/2026/06/22/student-loan-repayment-applications-are-messing-up-just-as-major-changes-arrive/) | S |
| RAP **interest subsidy under-applied**: the borrower calculated a $93.21 subsidy ($181.00 interest − $87.79 payment) but received $53.11. **One anecdotal case**; no official report yet. RAP is only 4.5 months old | MOHELA borrower | ≈2026-09-22 | [r/StudentLoans](https://www.reddit.com/r/StudentLoans/comments/1wq5jw6/comment/pc5v4lb/) (D #10) | V (quote re-checked); the error itself is unverified |

### CFPB complaints

Pulled from the CFPB API on 2026-11-14.

| | 2025 | 2026 YTD |
|---|---|---|
| All student-loan complaints | 21,281 (30.4% not on time) | 17,630 (31.6% not on time) |
| MOHELA | 7,850 (58.5% not on time) | **6,471 (63.1%)** |
| Nelnet | 4,295 (0.2%) | 3,131 (0.1%) |
| Aidvantage | 2,498 (0%) | 2,117 (0%) |
| EdFinancial | 1,629 (8.6%) | 1,286 (1.2%) |
| CRI | 260 | 480 |

**Top 2026 issues:** "received bad information" 25.3%; payment handling 16.9%; forgiveness 10.3%.

### What sample statements show (from `08e`)

| Field | MOHELA | Nelnet | EdFinancial |
|---|---|---|---|
| Amount due, due date, monthly payment, per-loan principal, rate, disbursement date | Y | Y | Y |
| Repayment plan name | N | **Y** | N |
| Loan status (repayment / forbearance) | **Y** | N | N |
| Unpaid / capitalized interest per loan | partial | accrued | **Y** |
| Payment split between principal and interest | account-level | per group | per loan |
| PSLF count, IDR count, recertification date | **N** | **N** | **N** |
| RAP waiver / match line | **unknown: no RAP-era sample exists** | | |

### What can be checked

| Check | Needs | From a statement alone? | Conf. |
|---|---|---|---|
| Payment ≠ plan formula | Statement + user's AGI, family size or dependents, filing status | Yes, with user input | Med (RAP), Med-Low (IBR, because of the cap and FFEL) |
| RAP interest charged although the payment was on time | Two consecutive statements (interest and balance lines) | Partly | Med-Low (line labels unknown) |
| Missing RAP principal match | Two statements (principal before and after) + payment date | Partly | Med-Low |
| Payment misapplied (interest vs principal, or across loans) | Per-loan split (Nelnet, EdFinancial) | Yes | Med |
| Statement < 21 days before the due date | Statement date + due date | Yes | High |
| Wrong plan placement (e.g. put on Standard) | Plan name (Nelnet only), or a payment equal to the Standard amount | Partly | Med |
| Arithmetic (totals don't add up) | Statement | Yes | High |
| PSLF count not increasing | `MyStudentData.txt` month to month | **No** (use the data file) | Med |
| Recertification date approaching or missed | `MyStudentData.txt` (IDR anniversary date) | **No** (use the data file) | Med-High |
| Forbearance applied without a request | Status (MOHELA) + user | Weak | Low (ED ordered many forbearances itself) |

**The federal loan data file**

- **Availability:** "Download My Aid Data" → `MyStudentData.txt` is **probably still available**. Two 2026 guides describe it (Summer, Feb 2026; Patrick Henry CC, Jul 2026). StudentAid.gov itself couldn't be checked because it needs a login.
- **Format:** plain text, one `name:value` per line. The [official layout](https://fsapartners.ed.gov/knowledge-center/library/nslds-user-resources/2023-02-16/download-my-aid-data-file-layout) dates from 2022–23.
- **What it has:** loan type, disbursement dates, rates, principal and interest, plan code and start date, scheduled payment, **IDR anniversary (recertification) date**, **PSLF cumulative matched months**, status history and servicer.
- **What it lacks:** an IDR forgiveness count and payment-by-payment history. How RAP is coded is unknown.
- **Product implication:** the monthly audit = **statement + data file**.

---

## F. Competitors

| Name | Price | Model | Features | Gaps vs us |
|---|---|---|---|---|
| **StudentAid.gov Repayment Calculator** | Free | Government | **Guest mode**; RAP, Tiered, IBR/PAYE/ICR; **married filing separately** with spouse loans; PSLF and consolidation toggles; "Lowest Monthly / Lowest Total" labels; IRS import when logged in; Apply button (V, live 2026-11-14) | No dated plan, reminders, letters or statement checks. Guest mode gives a "partial picture" for existing borrowers (marked IBR/Standard "Ineligible" in our run) |
| **Savi** | Free assessment; **Essential $75/yr** ($50 AARP); **Pro $175/yr** ($150 AARP) | Direct + employers and unions (NEA, AARP, Union Plus 15M members, MetLife, TIAA) | **Files applications for you**, AI assistant (May 2025), forgiveness help | No statement audit verified. RAP coverage unclear in FAQ. Already holds the union channel |
| **Summer** | $0 to individuals | Employers, cities, unions only (AFT, NYC) | Enrollment, forgiveness applications, experts | Not available direct to consumers |
| **Student Loan Planner** | $595 consult ($495 with discount) | Direct service + refinance affiliate income | Custom plan from credentialed advisers; free RAP, IBR, MFS calculators | One-time, for high balances ($20k–$1M); no monitoring |
| **TISLA** | Free | Nonprofit | Email counseling and dispute help | Slow, limited capacity, no tool |
| **Tate Law calculators** | Free (law-firm lead generation) | Lead generation | IBR vs RAP; **married RAP calculator showing both filing statuses and their tax cost** | No spouse-loan proration in IBR vs RAP; no monitoring |
| College Investor, Student Loan Sherpa, Juno, SoFi, others | Free | Content / affiliate | RAP calculators and articles | Calculators only |
| Candidly (Cait AI), Payitoff → Array | Enterprise | B2B | Employer and recordkeeper tools | Not consumer |
| Chipper | — | — | — | **Likely defunct** (domain doesn't resolve; App Store 404) |

**What none of them do (verified):**
- audit monthly statements against RAP's waiver and match rules;
- watch the PSLF count month to month from the borrower's own data file;
- keep a dated calendar of *that borrower's* deadlines (SAVE window, recertification date, 2028 sunset, rehab windows).

**Blunt verdict:**

| Differentiator | Verdict |
|---|---|
| No-login decision | Weak |
| Filing-separately toggle | Weak |
| Dated action plan | Weak to moderate (easy to copy; Savi files for you) |
| **Statement and data-file audit** | **The only potentially strong angle, but unproven** |
| Price $79/yr | Weak against Savi Essential at $75 |

---

## G. Go-to-market, CAC/LTV, ad policy

### Ad-policy risks

| Platform | Rule | Rejected or limited |
|---|---|---|
| **Google Ads** | Debt settlement and debt management ads in the US are limited to approved nonprofit credit counselors ([15189135](https://support.google.com/adspolicy/answer/15189135)). Misrepresentation and government-impersonation bans; "Not a government website" label on some search ads ([6020955](https://support.google.com/adspolicy/answer/6020955)) | "Lower your student loan payment" may be read as debt management; seals, "official", "federal program update", "forgiveness guaranteed" |
| **Meta** | Forced into the **Financial products and services special ad category**: ages 18–65+, no gender, 15-mile minimum radius, no ZIP codes, no lookalikes ([dev docs](https://developers.facebook.com/docs/marketing-api/audiences/special-ad-category)). Bans "misleading content related to student loan consolidation, forgiveness, or refinancing" ([policy](https://transparency.meta.com/policies/ad-standards/deceptive-content/prohibited-financial-products-and-services/)), "promises to eliminate or reduce debt by a particular amount", and implying "vulnerable financial status" | "Cut your payment by $300", "*Your* SAVE plan is ending", "Are you drowning in debt?", before/after balances, lead forms asking for the balance |
| **TikTok** | Educational loans count as credit, so **no targeting by age, gender, ZIP, marital or parental status** ([HEC policy](https://ads.tiktok.com/resources/help/article/housing-employment-credit-hec-ad-policy?lang=en)). No exaggerated results or misleading before/after comparisons | Targeting parents or married people, even though family status drives our answer |
| **Stripe** | Restricts "government services without authorization or value-add" ([restricted list](https://stripe.com/legal/restricted-businesses)) | Must clearly be value-add software, never "we apply for you" |

**Likely fine:** an educational calculator; hypothetical examples labeled "estimate"; "Not affiliated with the Dept. of Education. Applying is free at StudentAid.gov"; the price stated upfront.

### Benchmarks

| Metric | Value | Source |
|---|---|---|
| Web funnel: reach the paywall / buy | 13% / **3%** of sessions; median web revenue per customer about $67 at month 12; annual plans refunded about 18× more than weekly | [FunnelFox State of Web2App](https://funnelfox.com/state-of-web2app/) (Jan 2026), V |
| Trial → paid (North America) | 34.2% | [RevenueCat SOSA 2026](https://www.revenuecat.com/state-of-subscription-apps-2026/), V |
| Year-1 retention, annual / monthly plans | **28% / 8%** | RevenueCat SOSA 2026, V |
| Refunds (hard paywall) | about 5.8% | RevenueCat SOSA 2025, V |
| Search cost per click on student-loan terms | **$30–78** | seodata.dev (E) |
| Finance app install cost | $2.33–2.92 (older), $10–35 (fintech iOS) | Liftoff/Adjust, Adapty (S) |

### Channels

- **SEO:** the head terms are owned by Tate Law, The College Investor, Student Loan Sherpa, SLP, SoFi and news sites. Only long-tail programmatic pages are realistic, on a 6–12 month horizon.
- **Unions:** mostly taken (NEA/AARP/Union Plus → Savi; AFT → Summer). No deal found with nurses' unions.
- **Employers:** §127 is permanent, $5,400 for 2027, but it is a B2B2C year-2 play, outside the hackathon's consumer-only rule.
- **Creators:** small (Debt Free Millennials 117K; College Investor about 26.8K; SLP 23.1K on YouTube).

### LTV/CAC

Math in `08f` §6; renewal rates benchmarked to RevenueCat 2026.

- **Inputs:** 70% of buyers on annual plans; fees $2.59 on $79; refunds 6%; running cost $2/yr.
- **Renewals:** 25% first annual renewal, then 55/63/65%. Monthly plan: 55%, then 80% per month.
- **Annual LTV** = $69.67 in year 1 + renewals → **1.53 paid years → $109**.
- **Monthly LTV:** about 3.7 paid months → **$31**.
- **Blended LTV:** 0.7 × 109 + 0.3 × 31 = **$85** (12-month value $57).
- **CAC** = $1.50 per click (assumed) ÷ 2.5% of visits buying = **$60**.

| Case | LTV | CAC | LTV:CAC | Payback |
|---|---|---|---|---|
| Best | $122 | $25 | 4.9x | Day 0 |
| **Base** | **$85** | **$60** | **1.4x** | About month 12 |
| Worst | $54 | $167 | 0.3x | Never |

- **3:1 needs CAC ≤ $28:** about 5.4% of visits buying at $1.50 per click, roughly 2× the FunnelFox average.
- **Levers:**
  1. Annual renewal >40% through the audit habit. This is the decisive variable.
  2. A $129–149 Pro tier.
  3. A one-time $39–49 "Plan + letters" product.
  4. B2B2C in year 2.

---

## H. Legal: do's, don'ts, exact disclaimers

Summary of `08g`. Not legal advice; get counsel before paid launch.

| Law | Requirement | Applies to us? | Source | Conf. |
|---|---|---|---|---|
| FTC Telemarketing Sales Rule, advance-fee ban (16 CFR 310.4(a)(5)) | No fee before debt relief is performed, **when sold by phone** | **Only if we sell by phone.** Calls prompted by our own ads are *not* exempt for debt relief (310.6(b)(5)(i)) | [FTC TSR](https://www.ftc.gov/legal-library/browse/rules/telemarketing-sales-rule) | High V |
| FTC Act §5 + Impersonation Rule (16 CFR Part 461) | No deception; no implied government affiliation | Yes | ftc.gov | High V |
| CFPA / unfair, deceptive or abusive practices (12 USC 5481(15)(A)(viii)(II), 5531, 5536) | Personalized plan advice is likely a "financial advisory service" | **Probably yes.** CFPB enforcement has been nearly dormant since Jan 2025, but **state AGs can enforce** (12 USC 5552) | law.cornell.edu | Med-High |
| GLBA privacy / FTC Safeguards Rule | Written security program, privacy notice, FTC breach notice | Treat as **yes** (a paid advisory service creates a "customer relationship") | ecfr.gov | Med |
| **New York FSL Art. 7 (§§701–705), "student debt consultants"** | Covers anyone who will "advise the borrower which student loan repayment plan … to consider". **No payment "before the full completion of all such services"**; written contract acknowledged by a NY notary; 5-business-day cancellation; $10k per violation, private right of action with treble damages | **Yes. A subscription can't comply. Make NY free-only.** | [nysenate.gov FIS A7](https://www.nysenate.gov/legislation/laws/FIS/A7); [DFS](https://www.dfs.ny.gov/consumers/student_protection) | High V |
| **California, 10 CCR §§1002, 1010, 1012** (operative 2025-02-15) | "Student debt relief services" include "assessing suitability or providing advice" and "preparing documents". **DFPI registration** before charging; show the registration number | **Yes. Register or block CA paid plans.** | [10 CCR 1002](https://www.law.cornell.edu/regulations/california/10-CCR-1002); [DFPI](https://dfpi.ca.gov/regulated-industries/covered-persons/student-debt-relief-services/) | High V |
| Washington RCW 18.28.010 (debt adjusting) | "Counseling … of the indebtedness" for a fee; $25 initial-charge cap | Unclear for software; get local counsel | [RCW 18.28.010](https://app.leg.wa.gov/RCW/default.aspx?cite=18.28.010) | Low-Med |
| Unauthorized practice of law / DoNotPay order (2025-02-11) | Self-help templates are fine; no "AI lawyer" claims | Yes (marketing) | [FTC DoNotPay](https://www.ftc.gov/legal-library/browse/cases-proceedings/donotpay) | High V |
| Note | Cal. Civ. Code §1788.100 is the Borrower Bill of Rights for **servicers**. No California "free help" disclosure statute was found | — | 08g | — |

### Enforcement precedents

These show what gets companies shut down.

| Case | Year | What they did | Amount |
|---|---|---|---|
| NERD Solutions | 2026 (TRO) | Cold calls, posing as ED, monthly fees up to $1,400 | ≥$8.8M |
| Superior Servicing | 2026 (permanent ban) | Advance fees up to $899, told borrowers to stop paying their servicers | >$45.9M |
| Student Loan Pro (CFPB) | 2024 | Fees up to $795 to file free ED forms | ~$3.5M |
| Arete | — | Took over FSA logins | $43.3M judgment |
| Mission Hills | — | Used FSA IDs | >$23M |
| Operation Game of Loans | 2017 | Sweep of student-loan relief schemes | >$95M |

Sources: [FTC 2026-07](https://www.ftc.gov/news-events/news/press-releases/2026/07/student-loan-forgiveness-scammer-permanently-banned-debt-relief-industry-telemarketing), [FTC 2026-04](https://www.ftc.gov/news-events/news/press-releases/2026/04/ftc-stops-operation-allegedly-targeted-people-seeking-student-loan-debt-relief), [CFPB](https://www.consumerfinance.gov/about-us/newsroom/cfpb-bans-student-loan-pro-and-owner-for-fee-harvesting-scheme/).

### Never do

- Take, store or use FSA IDs, or log in as the user.
- Sell by phone in any form.
- Charge to "enroll", "apply", "consolidate" or "file".
- Promise forgiveness or specific savings.
- Imply government affiliation: no ED/FSA logos, and no "Federal", "National", "U.S.", "Department" or "StudentAid" in the name, domain or ads (18 USC §709).
- Call ourselves a servicer or accept loan payments.
- Tell users to stop paying their servicer.
- Take a power of attorney, or say users can't do it themselves.
- Market credit repair.
- Call or text without written consent, or buy leads.
- Post fake reviews.
- Sell or share user data.
- **Charge NY residents; charge CA residents before DFPI registration.**
- Make "AI lawyer" claims.

### Do

- Make the free plan check genuinely useful.
- Link StudentAid.gov everywhere.
- Show prices upfront.
- One-click cancellation and a renewal reminder.
- An unchecked acknowledgment box at checkout.
- Date-stamp every rule.
- Redact PII before anything goes to the LLM.
- No ad pixels on upload pages.

### Exact disclaimer text

Drafts from `08g` §6, aligned to New York §703, the strictest verified wording.

**Footer (every page):**
> **Student Loan Copilot is an independent company. We are not affiliated with, endorsed by, or acting for the U.S. Department of Education, Federal Student Aid, or any loan servicer, and we are not a loan servicer or lender.** You can apply for federal repayment plans, consolidation, and forgiveness **for free at StudentAid.gov or through your loan servicer**. You never have to pay anyone for that. We sell software that helps you compare options and organize your own next steps; we never contact your servicer or apply for you. Our tools give general information, not legal, tax, or financial advice, and are not a substitute for the advice of an attorney. Never share your FSA ID username or password with anyone, including us. Estimates use federal rules as of [RULES_DATE].

**Ad and hero block** (NY §703; ≥12-pt bold, near the call to action):
> **What we do: Student Loan Copilot is software. It estimates which federal repayment plan may cost you least, gives you a dated checklist and letter templates you send yourself, and flags possible errors in statements you upload. We do not contact your servicer or file anything for you.**
> **You can apply for a federal Direct Consolidation Loan from the U.S. Department of Education at no cost: [CONSOLIDATION_LINK].**
> **Our service may not be the best or only option for you.**
> **Other federal repayment options, including income-driven plans that do not require consolidation, may be available to you.**
> **Consider contacting your student loan servicer before you sign any legal document about your student loan.**

**Results page:**
> **These are estimates, not guarantees.** They are based on the information you entered and on federal student loan rules as of **[RULES_DATE]**. Rules, plan availability, and court decisions can change. Only the U.S. Department of Education and your servicer decide your actual payment, eligibility, and forgiveness. Before you act, check your numbers with the Repayment Calculator on StudentAid.gov or with your servicer. **Applying for any repayment plan is free at StudentAid.gov or through your servicer.** Student Loan Copilot is not affiliated with the U.S. Department of Education. This is general information, not legal, tax, or financial advice; forgiven amounts and plan choices can have tax effects, so consider a tax professional.

**Paywall:**
> **What you're buying:** access to Student Loan Copilot's software for **[1 month for $9 / 1 year for $79]**: plan comparison, your dated action plan and reminders, letter templates, and statement checks.
> **What you're not buying:** a repayment plan, consolidation, forgiveness, or anyone acting for you. **Those applications are free at StudentAid.gov or through your servicer, and you can do everything this tool suggests on your own without paying us.** We don't guarantee any savings, approval, or forgiveness.
> **Auto-renewal:** your subscription renews automatically at **$[9/month | 79/year]** until you cancel. Cancel anytime online in one step at [Settings → Cancel]. We'll remind you before an annual renewal.
> ☐ *(unchecked)* I understand that Student Loan Copilot is not affiliated with the U.S. Department of Education, that I can apply for repayment plans for free at StudentAid.gov or through my servicer, and that my subscription renews automatically at [price/period] until I cancel.
> *(NY, and CA before registration:)* "Student Loan Copilot's paid plans aren't available in [New York / California] yet. You can use our free tools."

**Letter templates:**
> **Template only. You fill it in, check it, and send it yourself.** Student Loan Copilot does not send letters, does not represent you, and is not a law firm. This template is general information, **not legal advice, and not a substitute for the advice of an attorney**. Check every fact and date before sending, keep a copy, and use your servicer's official address or secure message center. Do not include your FSA ID password, and include only the identifiers your servicer requests. For free help, contact your servicer, the Federal Student Aid Ombudsman through StudentAid.gov, or a local legal aid office. Not affiliated with the U.S. Department of Education or your servicer. Based on rules as of [RULES_DATE].

**Statement-check results:**
> We flag *possible* discrepancies by comparing your statement with the information you provided and with federal rules as of [RULES_DATE]. A flag is not a finding that your servicer made an error, and it does not affect your credit report. Confirm with your servicer, using the template if you like. If the issue isn't resolved, you can contact the Federal Student Aid Ombudsman for free.

---

## I. Engine test fixtures

**Script:** `python3 research/engine_fixtures.py`. Part A reproduces the published examples; part B prints the fixtures.

**Settings:** 2026 HHS poverty guideline (48 states/DC), amounts in cents, cap = 10-yr standard at IBR entry.

### I.1 Published anchors (all 22 pass)

| Check | Inputs | Expected (published) | Engine |
|---|---|---|---|
| Federal Register RIA, 91 FR 23866 | Couple, AGI $27,500 each, $20k each, 0 dependents | Married filing jointly $229 combined; separately $46 each | $229.17 → $114.58 each prorated; $45.83 each |
| ED fact sheet 2026-06-09 | Single, AGI $45k, $35k debt | RAP $150; prior IDR $176; $40 interest waived; $50 match | $150.00; $175.50; $40.46; $50.00 |
| ED fact sheet | $30,000 | 10-yr $341; Tiered (15 yr) $262 | $341.10; $261.83 (6.53% inferred) |
| FSA slides 2026-03 | AGI $95k, 0 deps / $65k, 2 deps / $25k, 1 dep | $712.50 / $225.00 / $10.00 | Match |
| FSA slides | Payment $205 with $5 to principal / payment $10 with $0 to principal | Match $45 / $10 | Match |
| ED 2026 ICR notice | $10,000 at 6%, 144 months | $97.59 | $97.59 |
| CRS R48727 Table 4 (2025 FPL, no cap) | Single, 50k / single 1 dep, 80k / married 1 dep, 100k and 150k | RAP $167; new IBR $221; old IBR $332; RAP $417; new IBR $500; RAP $1,200 | Match |
| Band edges | AGI $50,000.00 / $50,000.01 / $0 | $166.67 / $208.33 / $10.00 | Match |
| Live StudentAid.gov calculator (08f) | Single, AGI $55k, 0 deps, $40k at 6.5% | RAP $229; Tiered $348 | RAP $229.17 (Tiered $348.44 at 15 years) |

### I.2 Fixtures

All borrowers are in the 48 states/DC.

| ID | Inputs | RAP | IBR | 10-yr Standard | Tiered | Notes |
|---|---|---|---|---|---|---|
| **F1** ED anchor | Single, AGI $45,000, 0 deps, family 1, $35,000 at 6.53%, disbursed 2016–2020 with no prior balance (new borrower), private employer | **$150.00** | 10%: **$175.50** | $397.95 | n/a (no post-2026 loan) | Month 1 on RAP: interest $190.46, **waived $40.46**, principal $0, **match $50** |
| **F2a** kids flip, before | Single, AGI $55,000, 0 deps, family 1, $40,000 at 6.5%, disbursed 2015–2019 (new borrower) | **$229.17** ✓ cheapest | 10%: $258.83 | $454.19 | n/a | RAP: $12.50 principal + **$37.50 match** |
| **F2b** kids flip, after | Same, head of household, **2 deps, family 3** | $129.17 | 10%: **$116.83** ✓ lowest monthly | $454.19 | n/a | **The flip.** But IBR leaves about **$1,198/yr of unpaid interest** (unsubsidized), while RAP cuts principal by $600/yr. The engine must show both "lowest monthly" and "lowest total" |
| **F3a** pre-2014 IBR | Single, AGI $55,000, 0 deps, $40,000 at 6.5%, disbursed 2009–2013 (balance on 2014-07-01) | **$229.17** ✓ | **15%: $388.25** | $454.19 | n/a | Corrects the first report's 10%-only example |
| **F3b** pre-2014 IBR + kids | Same, HoH, 2 deps, family 3 | **$129.17** ✓ | 15%: $175.25 | $454.19 | n/a | **No flip at 15%** |
| **F4** filing separately (Maya) | Married teacher, **own AGI $60,000, spouse AGI $90,000** (spouse has no loans), 1 child on her return. Family size 3 if filing jointly, 2 if separately. $52,000 at 6.53%, disbursed 2012–2016 (not new, 15%). Public school (PSLF) | Jointly: $1,200.00 · **Separately: $200.00** | 15% jointly: $591.24 (capped) · 15% separately: $344.25 | $591.24 | n/a | Best joint option $591.24 → best separate option **$200.00 (RAP)**: saves **$4,695/yr**. Filing-separately tax cost: **bracket penalty $650/yr** (verified by full bracket calculation) + lost student-loan interest deduction (≈$530, E) + child-care credit if paying daycare (≈$600, E) ≈ **$1,800/yr**. **Net ≈ +$2,900/yr.** RAP and IBR both qualify for PSLF; Tiered would not |
| **F5** low income | Head of household, AGI $12,000, 1 dep, family 2, $25,000 at 6.53%, disbursed 2017–2021 (new borrower), retail | **$10.00** (floor: 1% × 12,000 ÷ 12 − 50 < 10) | 10%: **$0.00** (income below 150% FPL) | $284.25 | n/a | RAP month: interest $136.04, **waived $126.04, match $10**, principal −$10. IBR $0: about **$1,632/yr** of unpaid interest accrues; forgiveness after 20 yrs on IBR vs 30 on RAP |
| **F6** new loan after 2026-07-01 | Single, AGI $80,000, 0 deps, total Direct $85,000 at 7.0% ($60k from 2016–2020 + $25k grad loan 2026-08), nonprofit hospital | **$466.67** (7%) | **not available** (new loan kills IBR for all loans) | not available | **$659.00** (20 yrs, $50k–<$100k) | Tiered isn't PSLF-qualifying, so for this PSLF borrower **only RAP keeps PSLF**. Action plan should warn **before** taking a new loan or consolidation |

**Engine rules the fixtures enforce:**
- RAP rate applies to the whole AGI.
- $10 floors.
- Dependents (RAP) ≠ family size (IBR).
- The IBR cap is fixed at entry.
- 10% vs 15% by the 2014 test.
- A new loan on or after 2026-07-01 removes IBR and the legacy fixed plans.
- The match is min(50, payment) − principal paid, only for on-time months.

---

## J. Kill risks, ranked

| # | Risk | Why it kills | Severity | Mitigation / test |
|---|---|---|---|---|
| 1 | **No differentiation for the "decision"** | The free official calculator has guest mode, RAP, Tiered and filing-separately; Tate shows filing-separately tax cost; Savi files for you at $75/yr. Judges or users who know StudentAid.gov will ask "why pay?" | **High** | Lead with **audit + deadline guard**. Make the free plan check match the official tool to the cent (a trust signal), then sell what it can't do |
| 2 | **Unit economics** | Base LTV:CAC 1.4x. Search clicks cost $30–78. Meta and TikTok block targeting on family status. Head SEO terms are taken | **High** | Prove >40% annual renewal through the monthly audit. Add a one-time $39–49 product. Use organic, community and creator channels. Present the base case honestly |
| 3 | **$100M ARR not credible as a consumer student-loan product** | Base about $12M ARR; $100M needs 25% of ex-SAVE or 46% of PSLF borrowers. Ex-SAVE demand fades by spring 2027 | **High** (15% of the rubric) | Frame the engine as a **household-statement auditor**: student loans first, then medical bills/EOBs (the founder's coding edge), then other recurring bills. Or name the employer channel as year 2 (but the hackathon is consumer-only) |
| 4 | **State law gates paid launch** | NY bans prepayment and requires a notarized contract; CA requires DFPI registration; WA is ambiguous | **Med-High** (gates launch, not the hackathon) | Geo-gate paid plans out of NY and CA; legal opinion before launch |
| 5 | **The audit is unproven** | No RAP-era statement samples. PSLF count and recertification date aren't on statements. Monthly uploads are friction. Only one anecdotal RAP-subsidy error so far (Reddit, D #10); no official report | **Med-High** | Audit the **statement + `MyStudentData.txt`** together. Start with high-confidence checks: 21-day rule, arithmetic, payment vs formula, PSLF count delta, recertification date. Collect real RAP statements in the first weeks |
| 6 | **Trust and scam stigma** | StudentAid.gov: "You never have to pay a company to apply for a repayment plan." The College Investor calls a fee to switch plans a "red flag". Users suspect even ED's own applications are scams | **Med** | Free core; never "apply"; disclaimers in H; never ask for an FSA ID; show the math and the regulation citation |
| 7 | **Policy volatility and liability** | Open questions (PAYE cutoff, which deferment months count, defaulted borrowers entering RAP), Treasury's move, court rulings. A wrong recommendation could cost users thousands | **Med** | Rule versions with dates, a change feed (also a retention hook), confidence labels, conservative defaults |
| 8 | **Seasonality** | The ex-SAVE spike is one-time | **Med** | Year-round hooks: recertification dates, PSLF tracking, tax season (filing separately), 2028 sunset |

**Pivot options if the team decides the risk is too high** (ranked):
1. **Same engine, audit-first: "Student Loan Guardian".** Free plan check; paid monthly audit and deadline guard.
2. **Widen to a household-statement auditor:** student loans + medical bills/EOBs. This reuses the founder's billing-audit edge and gives a credible $100M story.
3. Go back to the medical bill/EOB checker as the core (see `00-final-report.md`).

---

## K. Deck-ready statistics

| # | Statistic | Source (year) | Link | Status |
|---|---|---|---|---|
| 1 | **42.3M** federal student-loan borrowers owe **$1.72 trillion** | FSA Data Center (data 2026-06-30) | [link](https://studentaid.gov/data-center/student/portfolio) | Verified |
| 2 | **29.0M** borrowers are aged 25–49 | FSA Portfolio by Age (2026-03-31) | [link](https://studentaid.gov/data-center/student/portfolio) | Verified |
| 3 | **6.52M** borrowers were still in SAVE on June 30; ED says "more than 2 million" have since chosen a new plan | FSA (2026-06-30); ED to *Money* (2026-11-13) | [FSA](https://studentaid.gov/data-center/student/portfolio) · [Money/AOL](https://www.aol.com/articles/student-loan-borrowers-save-ever-174529000.html) | Verified / Secondary |
| 4 | **9.3M** borrowers in default, owing **$234B** | FSA Portfolio by Loan Status (2026-06-30) | [link](https://studentaid.gov/sites/default/files/fsawg/datacenter/library/PortfoliobyLoanStatus.xls) | Verified |
| 5 | **10.9%** of student-loan balances are 90+ days delinquent | NY Fed Household Debt & Credit, Q3 2026 | [link](https://www.newyorkfed.org/medialibrary/interactives/householdcredit/data/pdf/HHDC_2026Q3.pdf) | Verified |
| 6 | **2.75M** borrowers are on the PSLF track; **345,900** are within 23 payments of forgiveness | FSA PSLF report (Aug 2026) | [link](https://studentaid.gov/data-center/student/portfolio) | Verified |
| 7 | **530,295** income-driven applications pending (April 2026) | ED court filing, AFT v. ED (2026) | [link](http://web.archive.org/web/20260514034115/https://thecollegeinvestor.com/80597/idr-backlog-falls-to-530295-in-april-2026/) | Secondary (court data) |
| 8 | **4 of 5** servicers missed FSA's accuracy standard, and FSA stopped monitoring accuracy in Feb 2025 | GAO-26-108534 (Mar 2026) | [link](https://files.gao.gov/reports/GAO-26-108534/index.html) | Verified |
| 9 | Regulators found servicers sending "deceptive billing statements" with **wrong payment amounts** | CFPB Supervisory Highlights 36 (Dec 2024) | [link](https://files.consumerfinance.gov/f/documents/cfpb_supervisory-highlights-special-ed-student-lending-issue-36-winter_2024-12.pdf) | Verified |
| 10 | MOHELA failed to respond on time to **63%** of its 2026 CFPB complaints | CFPB complaint database (2026 YTD) | [link](https://www.consumerfinance.gov/data-research/consumer-complaints/) | Verified (our API pull) |
| 11 | About **60,500** monthly US searches for "repayment assistance plan" | seodata.dev / Google Ads averages (Nov 2026) | [link](https://www.seodata.dev) | Estimate |
| 12 | Student-loan "relief" scammers took **$45.9M** (Superior Servicing) and **$8.8M+** (NERD Solutions) | FTC (2026) | [Jul](https://www.ftc.gov/news-events/news/press-releases/2026/07/student-loan-forgiveness-scammer-permanently-banned-debt-relief-industry-telemarketing) · [Apr](https://www.ftc.gov/news-events/news/press-releases/2026/04/ftc-stops-operation-allegedly-targeted-people-seeking-student-loan-debt-relief) | Verified |
| 13 | Income-driven/RAP forgiveness is **federally taxable again from 2026**; PSLF stays tax-free | IRC §108(f) (2026) | [link](https://www.law.cornell.edu/uscode/text/26/108) | Verified |
| 14 | Our engine reproduces **22/22** official worked examples and matches StudentAid.gov's calculator to the dollar | `engine_fixtures.py` (2026-11-14) | repo | Verified (internal) |

**Avoid in the deck:**
- "31% of complaints ignored" without the MOHELA caveat.
- "Balance falls at least $50/month".
- "IBR ends 2028".
- "29M forced to decide now".
- Any savings claim not labeled as an estimate.
