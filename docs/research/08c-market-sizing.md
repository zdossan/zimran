# 08c: Market sizing for Student Loan Copilot

Prepared 2026-11-14. Product: B2C web app for US federal student-loan borrowers. It picks the cheapest plan, gives a dated action plan and checks servicer statements. No login. $79/yr or $9/mo.

**Legend.** **V** = verified: I opened the primary file or document myself. **S** = secondary: I opened a news or blog source that cites the primary. **S\*** = secondary seen only in a search-result snippet, not opened. **Est.** = my own estimate, with the math shown.

**Data vintage check.** The latest FSA Data Center portfolio quarter is **FY2026 Q3, data as of 2026-06-30**. The server shows `Last-Modified: 2026-09-18` on PortfolioSummary.xls, PortfoliobyLoanStatus.xls, DLPortfoliobyRepaymentPlan.xls, DLPortfoliobyDelinquencyStatus.xls and servicer-portfolio-by-loan-status063026.xls (V). The College Investor reports that FSA posted the update on 2026-09-22 (S; [link](https://thecollegeinvestor.com/88850/9-3-million-federal-student-loan-borrowers-are-now-in-default/)). I did not open the fsapartners GENERAL-26-57 announcement.

**Data as of 2026-09-30 is not out yet.** I checked three ways:
- `servicer-portfolio-by-loan-status093026.xls` returns HTTP 404 (V).
- PortfolioSummary.xls ends at FY2026 Q3 (V).
- The College Investor wrote on 2026-11-11: "We won't see the next batch of federal student aid data until December" (S).

The age, debt-size and IDR-by-age files lag one quarter. They hold data as of **2026-03-31**, with Last-Modified 2026-06-18 (V).

All FSA files are at `https://studentaid.gov/sites/default/files/fsawg/datacenter/library/<file>` (the landing page is https://studentaid.gov/data-center/student/portfolio). FSA counts "recipients" at the loan level, so one person can appear in more than one status or plan.

---

## 1. FSA Data Center portfolio (latest quarter)

### 1a. Portfolio total (PortfolioSummary.xls, as of 2026-06-30) — V

| | $ outstanding | Recipients |
|---|---|---|
| Direct Loans | $1,564.8B | 38.3M |
| FFEL | $157.0B | 6.4M |
| Perkins | $2.7B | 0.8M |
| **Total (unduplicated)** | **$1,724.5B** | **42.3M** |

### 1b. By age (Portfolio-by-Age.xls; all programs, open loans; **as of 2026-03-31**) — V

| Age band | Borrowers | $ outstanding |
|---|---|---|
| 24 and younger | 6.2M | $85.6B |
| 25–34 | 14.0M | $465.8B |
| 35–49 | 15.0M | $685.1B |
| 50–61 | 6.4M | $312.8B |
| 62+ | 3.2M | $143.7B |
| Not reported | 0.1M | $3.3B |
| Sum | 44.9M | $1,696.3B |

- The sum is higher than 42.3M because this file counts *borrowers*, including parent PLUS borrowers, while the summary counts recipients.
- **Aged 25–49: 29.0M, or 65% of the total.**

IDR enrollment by age (IDRPortfolio-by-Age.xls, as of 2026-03-31; V):

| Age band | IDR borrowers | $ outstanding |
|---|---|---|
| 24 and younger | 0.3M | $6.0B |
| 25–34 | 4.8M | $233.7B |
| 35–49 | 5.7M | $382.5B |
| 50–61 | 1.4M | $104.7B |
| 62+ | 0.6M | $47.0B |

### 1c. By debt size (Portfolio-by-Debt-Size.xls, as of 2026-03-31) — V

| Balance | Borrowers | $ |
|---|---|---|
| <$5K | 6.9M | $18.9B |
| $5–10K | 7.2M | $52.5B |
| $10–20K | 9.2M | $132.5B |
| $20–40K | 9.5M | $270.8B |
| $40–60K | 4.2M | $206.4B |
| $60–80K | 2.6M | $177.4B |
| $80–100K | 1.4M | $127.7B |
| $100–200K | 2.6M | $354.3B |
| $200K+ | 1.2M | $355.8B |

- **Over $20K: 21.5M borrowers.**

Age × debt cross-tab (Portfolio-by-Age-Debt-Size.xls, "Data as of March 31, 2026"; V). Borrowers with more than $20K:

| Age band | Borrowers over $20K | Make-up |
|---|---|---|
| 25–34 | **6.47M** | 3.52 + 1.23 + 0.59 + 0.27 + 0.54 + 0.32 |
| 35–49 | **8.44M** | 3.11 + 1.84 + 1.23 + 0.68 + 1.10 + 0.48 |

### 1d. By repayment plan (DLPortfoliobyRepaymentPlan.xls, sheet "FedManagedPortbyRepaymentPlan", as of 2026-06-30) — V

This sheet covers Direct Loans plus ED-held FFEL in repayment, deferment or forbearance. Default, in-school and grace are excluded.

| Plan | Recipients | $ | Trend: 9/30/25 → 12/31/25 → 3/31/26 → 6/30/26 |
|---|---|---|---|
| **SAVE** (replaced REPAYE) | **6.52M** | $354.3B | 7.43 → 7.19 → 6.99 → **6.52M** |
| IBR | 3.99M | $244.9B | 3.27 → 3.41 → 3.64 → 3.99M |
| PAYE | 1.61M | $136.8B | 1.46 → 1.48 → 1.53 → 1.61M |
| ICR | 1.32M | $55.9B | flat |
| Standard (level, ≤10 yr) | 11.99M | $273.3B | 14.79 → 13.37 → 12.32 → 11.99M |
| Extended/level >10 yr | 1.54M | $80.1B | |
| Graduated ≤10 yr | 2.13M | $63.4B | |
| Graduated >10 yr | 0.65M | $37.4B | |
| Alternative | 0.39M | $12.0B | |
| Other / no plan | 0.09M | $9.2B | |
| **RAP** | **not listed** | | RAP launched 2026-07-01. The first counts are expected with the 9/30/2026 data (around Dec 2026) |
| **All IDR (SAVE+IBR+PAYE+ICR)** | **13.44M** | **$791.9B** | |

IBR by partial financial hardship (PFH), federally managed (V):

| IBR group | Recipients | $ |
|---|---|---|
| With PFH | 3.09M | $206.5B |
| Without PFH | 0.90M | $38.4B |

### 1e. By loan status (PortfoliobyLoanStatus.xls, as of 2026-06-30) — V

| Status | Federally managed (DL + ED-held FFEL) | Direct Loan only | All FFEL |
|---|---|---|---|
| In school | 5.2M / $96.7B | 5.21M / $96.7B | ~0 |
| Grace | 1.5M / $36.0B | 1.48M / $36.0B | ~0 |
| Repayment | **17.4M / $658.5B** | 16.99M / $638.7B | 2.57M / $66.5B |
| Deferment | 3.3M / $149.7B | 3.30M / $147.5B | 0.19M / $4.0B |
| Forbearance | **8.0M / $459.2B** | 7.98M / $449.7B | 0.66M / $15.8B |
| Default (>360 days) | **9.3M / $234.1B** | 7.55M / $187.8B | 3.19M / $69.3B |
| Other (bankruptcy, disability) | 0.2M / $8.9B | 0.16M / $8.4B | 0.06M / $1.4B |

Forbearance by type (DLbyForbearanceType.xls, 2026-06-30; V):

| Type | Recipients | $ |
|---|---|---|
| **Administrative** (this is where SAVE forbearance sits; the file note says SAVE borrowers were moved to forbearance in FY24 Q4) | **7.26M** | **$403.6B** |
| Discretionary | 0.65M | $39.5B |
| Mandatory administrative | 0.07M | $3.4B |
| Mandatory | 0.03M | $2.6B |

Delinquency of loans in repayment, federally managed (DLPortfoliobyDelinquencyStatus.xls, 2026-06-30; V):

| Stage | Recipients | $ |
|---|---|---|
| Current | 14.45M | $555.2B |
| 31–90 days | 1.18M | $38.2B |
| 91–180 days | 0.86M | $24.7B |
| 181–270 days | 0.77M | $21.0B |
| 271–360 days | 0.66M | $17.5B |
| Transferring to DMCS | 0.07M | $1.8B |

- **31+ days delinquent: about 3.54M recipients, or 15.7% of repayment dollars.**
- **181–360 days (late stage): 1.43M.** FSA says about 1.5M are at risk of default within six months (S, The College Investor).

### 1f. By servicer (servicer-portfolio-by-loan-status063026.xls, "Data as of June 30, 2026") — V

The file covers DL and ED-owned FFEL. It excludes defaulted loans, which sit with Debt Management and Collections / Treasury. Each cell is recipients / $.

| Servicer | Repayment | Forbearance | Deferment | In school + grace | Total $ |
|---|---|---|---|---|---|
| Nelnet | 5.64M / $216.7B | 3.10M / $168.3B | 1.11M / $49.4B | 1.77M / $36.0B | **$473.5B** |
| Aidvantage | 4.56M / $169.2B | 2.06M / $113.1B | 0.84M / $37.9B | 1.44M / $30.4B | $352.9B |
| MOHELA | 3.18M / $139.8B | 1.57M / $116.8B | 0.59M / $26.9B | 1.48M / $28.9B | $314.6B |
| Edfinancial | 3.10M / $100.6B | 1.26M / $57.8B | 0.67M / $26.9B | 1.26M / $28.2B | $214.4B |
| CRI | 1.65M / $32.0B | 0.09M / $3.0B | 0.27M / $8.6B | 0.77M / $9.2B | $52.9B |

Total $ includes "Other" (Nelnet $3.1B, Aidvantage $2.3B, MOHELA $2.2B, Edfinancial $0.9B, CRI $0.1B).

### 1g. PSLF (pslf-combined-report.xlsx, Last-Modified 2026-09-18) — V

Applications processed June 30, 2024 through Aug 31, 2026:

| Measure | Forms | Borrowers |
|---|---|---|
| Submitted | 5,740,000 | 2,375,000 |
| Processed | 3,720,000 | 1,802,000 |
| Pending | 338,000 | 261,000 |

- Forms that met the employment requirement: 3,719,600 in total.
  - Government: 2,109,500.
  - Nonprofit: 1,615,200.
  - One form can list more than one employer type.

Cumulative portfolio as of Aug-end 2026:
- **Borrowers with eligible employment and open loans: 2,748,300.**
- Their balance: $248.7B, an average of $90,500 per borrower.
- Qualifying payments (QP):

| QP count | Borrowers |
|---|---|
| 0 | 408,700 |
| 1–24 | 615,300 |
| 25–48 | 483,000 |
| 49–72 | 471,000 |
| 73–96 | 422,200 |
| **97–119 (close to forgiveness)** | **345,900** |
| 120+ | 2,300 |

Discharges, cumulative to Aug-end 2026:

| Program | Unique borrowers | $ discharged |
|---|---|---|
| **Combined** | **1,291,700** | **$96.4B** |
| PSLF | 560,500 | $44.0B |
| TEPSLF | 8,400 | $0.3B |
| Limited Waiver | 758,800 | $52.1B |

Average discharge: $74,600.

---

## 2. NY Fed Household Debt and Credit, 2026 Q3 — V

Files:
- `HHD_C_Report_2026Q3.xlsx`: https://www.newyorkfed.org/medialibrary/interactives/householdcredit/data/xls/HHD_C_Report_2026Q3.xlsx
- `HHDC_2026Q3.pdf`: https://www.newyorkfed.org/medialibrary/interactives/householdcredit/data/pdf/HHDC_2026Q3.pdf
- Landing page: https://www.newyorkfed.org/microeconomics/hhdc

The cover says "Released November 2026" and the PDF creation date is 2026-11-05. The College Investor covered it on 2026-11-11. The source is the NY Fed Consumer Credit Panel/Equifax. Note that this covers all student loans on credit reports, not only federal ones.

| Metric (2026 Q3) | Value | Sheet |
|---|---|---|
| Student-loan balance | **$1.656T** (+$5B q/q) | Page 3 |
| Share of balance 90+ days delinquent | **10.9%** (Q2 10.6%; Q3 2025 9.36%) | Page 12 |
| Flow into 30+ delinquency (4-quarter sum) | 7.95% | Page 13 |
| Flow into 90+ delinquency, all ages | **7.72%** (Q3 2025: 14.26%) | Page 14 |
| Dollars 90+ days late (Est.: 10.92% × $1,655.7B) | ≈ $181B | derived |

Transition into serious delinquency (90+) by age, 4-quarter moving sum (Page 28):

| Age | 2025 Q3 | 2026 Q2 | **2026 Q3** |
|---|---|---|---|
| 18–29 | 9.2% | 5.3% | **5.5%** |
| 30–39 | 12.8% | 6.5% | **6.6%** |
| 40–49 | 14.8% | 8.1% | **8.6%** |
| 50+ | 19.9% | 9.9% | **10.3%** |
| All | 14.3% | 7.4% | **7.7%** |

Student-loan balance by age, 2026 Q3 (Page 21):

| Age | Balance |
|---|---|
| 18–29 | $318B |
| 30–39 | $519B |
| 40–49 | $381B |
| 50–59 | $259B |
| 60–69 | $127B |
| 70+ | $43B |

---

## 3. Former SAVE borrowers and the IDR backlog

| Figure | Value | Source | Status |
|---|---|---|---|
| SAVE recipients | **6.52M** as of 2026-06-30 (7.43M at 9/30/25) | FSA repayment-plan file, above | V |
| SAVE enrollment when ED urged switching | "7.5 million" (March 2026) | ED spokesperson to Business Insider, 2026-10-27 ([Yahoo](https://www.yahoo.com/news/politics/articles/first-deadline-student-loan-borrowers-092502056.html)) | S |
| Already selected a new plan | "nearly 2 million" (late Oct) → "**more than 2 million**" (mid-Nov) | ED spokesperson to BI, 10-27; ED official to *Money*, 2026-11-13 ([AOL/Money](https://www.aol.com/articles/student-loan-borrowers-save-ever-174529000.html)) | S |
| Still need to decide | **≈4.5–5.5M** | Est., below | Est. |
| Moved off SAVE involuntarily | **0** so far | Student Loan Servicing Alliance (Scott Buchanan) via *Money*, 2026-11-13 | S |
| Notice timeline | 90-day notices started 2026-07-01. A final 30-day notice follows, then auto-placement into Standard or Tiered Standard (Tiered Standard does not count for PSLF). ED says every SAVE borrower will be notified by end-2026. | The College Investor, 2026-10-15 ([link](https://thecollegeinvestor.com/90574/save-borrowers-miss-90-day-deadline-get-final-30-day-notice/)) | S |
| Transfer timing | Per a 2026-11-09 filing (Public Goods Practice, D.D.C. docket gov.uscourts.dcd.290158), ED counsel "doesn't know when borrowers whose 30-day period has expired will be moved" | BI via AOL, 2026-11-10 ([link](https://www.aol.com/articles/student-loan-borrowers-waiting-pushed-100003000.html)) | S |

**How many still need to decide (Est.):**
- Upper bound: 7.5M (ED's March base) − 2.0M chosen = **5.5M** (this matches *Money*'s calculation).
- Lower bound: if the "2M" is counted against the 6.52M still in SAVE on 6/30, then 6.52M − 2.0M = **4.5M**.
- I use **5.0M** as the base. "Selected a plan" may include applications still in the IDR queue.

**IDR application backlog (court-ordered status reports, AFT v. Department of Education):**

| As of | Pending IDR applications | Source / status |
|---|---|---|
| ~June 2025 (peak) | 1,511,504 | S\* |
| Jan 2026 | 734,221 | S\* |
| 2026-02-28 | 576,609 | S\* |
| 2026-03-31 | 553,966 | S |
| **2026-04-30** | **530,295** | S, from the ED filing of 2026-05-13 via The College Investor, [archived copy](http://web.archive.org/web/20260514034115/https://thecollegeinvestor.com/80597/idr-backlog-falls-to-530295-in-april-2026/) |

April 2026 detail:
- 444,692 applications received.
- **456,594 decided** (401,561 approved, 55,033 denied).
- 0 IDR discharges.
- 11,500 PSLF discharges.
- About 88,000 PSLF Buyback applications pending, of which 18–19K are duplicates.

Later status reports (June–November 2026): **not found.** The College Investor wrote on 2026-10-30 that "the last time we had a status report... was back in May 2026."

**Processing time for IDR applications: not found.** ED reports counts, not durations. The PSLF Buyback wait is "roughly 2 years on average" (The College Investor estimate, 2026-10-30; S). AFT filed Weingarten v. McMahon, No. 1:26-cv-03826 (D.D.C.), on 2026-10-30 over Buyback delays (S).

---

## 4. Professions (PSLF-relevant)

| Figure | Value | Source | Status |
|---|---|---|---|
| Borrowers with certified PSLF-eligible employment and open loans | **2,748,300** (avg balance $90.5K) | FSA PSLF report, Aug-end 2026 | V |
| Federal, state and local government employment | **23.332M** (Oct 2026, preliminary, seasonally adjusted) | BLS CES series CES9000000001, via api.bls.gov | V |
| Nonprofit employment | **not found** (bls.gov returned 403) | | – |
| Registered nurses employed | 3,379,720 (May 2025) | BLS OEWS series OEUN000000000000029114101 | V |
| Elementary + middle + secondary teachers (excluding special ed, K and preK) | 3,073,690 (May 2025) = 1,388,390 + 620,090 + 1,065,210 | BLS OEWS | V |
| PK-12 teachers and support staff who **currently** owe student loans | **28%**; average current balance $56,900; 14% owe $105K+ | NEA brief, survey of 1,309 respondents, fielded 2020-10-30 to 12-14 ([PDF](https://www.nea.org/sites/default/files/2021-07/Student%20Loan%20Debt%20Brief%20PK-12%20Teachers%20SISP.pdf)) | V (but the survey is from 2020) |
| RNs with active student loans | **28%** (APNs 33%); Michigan only, 2022 survey, n = 9,570 | U-M study, *Health Affairs Scholar*, released 2026-01-26 ([EurekAlert](https://www.eurekalert.org/news-releases/1113876)) | S (one state) |
| RN median balance | $33,210 | U-M study | S\* |
| CRS / AACN national figures | **not found** in this pass | | – |

Derived estimates:
- Teachers with student debt ≈ 3.07M × 28% ≈ **0.86M**. OEWS includes private-school teachers, while the NEA sample was public-school only.
- RNs with student debt ≈ 3.38M × 28% ≈ **0.95M**. This rests on the Michigan proxy.
- Both groups overlap heavily with the 2.75M PSLF-certified count.

---

## 5. Bottom-up sizing

### Segment definitions (populations overlap; see the haircut below)

1. **Ex-SAVE borrowers who still need a decision:** **5.0M** (Est., range 4.5–5.5M; §3).
2. **PSLF-track public servants:** **2.75M** with certified employment (V). The most urgent subgroup is 345,900 borrowers at 97–119 qualifying payments.
3. **Defaulted borrowers:** **9.3M** federally managed recipients (V). Commercial-FFEL defaults are excluded.
4. **Aged 25–45, in active repayment, balance over $20K:** **5.77M** (Est.):
   - 25–34 over $20K: 6.47M.
   - 35–45 over $20K: 8.44M × 11/15 = 6.19M, assuming ages are spread evenly within 35–49.
   - Together: 12.66M.
   - Share in repayment: 17.4M / (17.4 + 3.3 + 8.0 + 9.3 + 0.2)M of out-of-school recipients = 45.5%.
   - Result: 12.66M × 45.5% = 5.77M.
   - Data dates: March 2026 for the age cross-tab, June 2026 for loan status. This group excludes the SAVE-forbearance and default groups by construction.
5. **Married borrowers facing the married-filing-separately (MFS) question:** **3.46M** (Est.):
   - Non-SAVE IDR enrollees: IBR 3.99M + PAYE 1.61M + ICR 1.32M = 6.92M.
   - Married share: **50% (assumption)**. The anchor is the 2022 SCF: interracial couples are 15% of families with student debt and 23% of couples with student debt, which implies couples are 15/23 ≈ 65% of families with student debt. That figure includes unmarried partners (Fed FEDS Note, 2025-06-26, [link](https://www.federalreserve.gov/econres/notes/feds-notes/introducing-new-detail-on-the-racial-composition-of-families-in-the-2022-survey-of-consumer-finances-20250626.html); S).
   - **A direct count of married borrowers was not found.** Married ex-SAVE borrowers sit in segment 1.

### Likelihood to pay

"Likelihood to pay" means the share of the *whole segment* that pays within 12 months. This is not a visitor-to-paid conversion rate.

The benchmark is RevenueCat's North America median for download-to-paid within 35 days: **2.6% of installs** (2026 report, per a secondary summary; S\*). The share of a whole population that pays is much lower, because only a fraction ever visits.

My chain: 10–30% of a segment visits × 2–5% of visitors pay = **0.2–1.5%**. I score segments higher where both the stakes and the deadline pressure are high (PSLF, ex-SAVE). I score defaulted borrowers lowest, because they have little ability to pay and the government launched a **free** Defaulted Loans Support Center on 2026-09-30 (S).

| Segment | # borrowers | Likelihood to pay, low / **base** / high | Price | Revenue at base (low–high) | Paying users at base |
|---|---|---|---|---|---|
| Ex-SAVE needing a decision | 5.0M | 0.5% / **1.0%** / 2.0% | $79/yr | **$3.95M** ($1.98–7.90M) | 50,000 |
| PSLF-track (certified) | 2.75M | 1.0% / **2.0%** / 4.0% | $79/yr | **$4.34M** ($2.17–8.69M) | 55,000 |
| Defaulted | 9.3M | 0.1% / **0.25%** / 0.5% | $79/yr | **$1.84M** ($0.73–3.67M) | 23,250 |
| Aged 25–45, active repayment, over $20K | 5.77M | 0.25% / **0.5%** / 1.0% | $79/yr | **$2.28M** ($1.14–4.56M) | 28,850 |
| Married IDR borrowers (MFS) | 3.46M | 0.5% / **1.0%** / 2.0% | $79/yr | **$2.73M** ($1.37–5.47M) | 34,600 |
| **Gross total** | 26.3M | | | **$15.1M** ($7.4–30.3M) | 191,700 |
| **Net of overlap (×0.8, assumption)** | ~21.0M | | | **≈ $12.1M ARR** ($5.9–24.2M) | ~153,000 |

### What $100M ARR requires

- $100M ÷ $79 = **1,265,823 paying annual subscribers.**
- If buyers prefer the monthly plan and stay about 3 months ($27 each), the target becomes about **3.7M payers a year**.

Share of each population needed at $79/yr:

| Population | Share needed |
|---|---|
| All 5 segments, after overlap (~21.0M) | **6.0%** |
| All 5 segments, gross (26.3M) | 4.8% |
| All 42.3M federal recipients | 3.0% |
| Ex-SAVE alone | 25.3% |
| PSLF alone | 46.0% |
| Defaulted alone | 13.6% |
| Aged 25–45 active, over $20K, alone | 21.9% |
| Married IDR alone | 36.6% |

**Verdict:** $100M ARR needs about 6% paid penetration of every targeted borrower. That is roughly **8x the base case** ($12M) and about 4x even the high case. A realistic B2C ceiling is **$5–25M ARR**.

The ex-SAVE demand is also a one-time spike. Every SAVE borrower is notified by end-2026, plus about 120 days to act, so the surge fades by about spring 2027. Recurring revenue must come from PSLF tracking, annual recertification and statement checks.

### Benchmarks (both are mostly B2B2C, paid by employers or associations)

**Savi** (company-reported, V on its own PDF; [NACo PDF, Jan 2026](https://www.naco.org/sites/default/files/2026-01/Savi%20Overview.pdf); [bysavi.com](https://www.bysavi.com/)):
- "3M+ borrowers reached".
- "$7.9B total debt managed".
- "$5B+ savings found".
- 10,000+ employer and association partners, including NEA.
- Est.: $7.9B ÷ $39,075 (the average balance Savi itself cites) ≈ **~200K actively managed borrowers** since 2017.
- Consumer price: **not found**. Savi also offers a free assistant on ChatGPT.

**Summer** (company-reported; [meetsummer.com](https://www.meetsummer.com/)):
- "$2.2B+ total projected lifetime savings" and "$45K average savings".
- Est.: about **49K borrowers served**.
- User count: **not found**.

**Implication:** Our base case of about 150–190K payers would roughly equal Savi's implied *deep-engagement* base after 9 years with employer distribution. Getting 1.27M paying consumers would be about 6x that.

---

## 6. What's solid vs shaky

**Solid (primary files opened, dated):**
- Portfolio of $1.7245T and 42.3M recipients, as of 6/30/26.
- SAVE at 6.52M and IDR at 13.44M / $792B.
- 9.3M in default / $234B.
- 17.4M in repayment, of which 3.54M are 31+ days late and 1.43M are 181–360 days late.
- 7.26M in administrative forbearance.
- The servicer split.
- The age and age × debt tables (data date 3/31/26, one quarter older).
- The PSLF report: 2.75M certified, 1.29M forgiven / $96.4B, as of Aug-end 2026.
- NY Fed Q3 2026: $1.656T, 10.9% at 90+, 7.72% flow, and the by-age flows.
- BLS employment counts.

**Medium (secondary but attributed to ED or named sources):**
- ED's "7.5M on SAVE" and "more than 2M have selected a plan". These are spokesperson quotes; there is no published table.
- Zero involuntary transfers so far (servicer trade group).
- The 530K IDR backlog is as of April 2026 and is over 6 months stale.
- NEA's 28% figure comes from a 2020 survey.

**Shaky (assumptions):**
- The 4.5–5.5M range for ex-SAVE borrowers still needing to decide (base mismatch: 7.5M versus 6.52M).
- 50% married share, a proxy from an SCF couples figure that includes partners.
- Uniform age spread used to cut 35–49 down to 35–45.
- The 45.5% repayment share applied to the 25–45 group.
- The 20% overlap haircut.
- All likelihood-to-pay rates. No category benchmark for finance was found; the 2.6% RevenueCat median is per install and secondary.
- Savi and Summer "user" figures are marketing claims, and my user counts are back-solved from them.

**Not found:**
- Any FSA data as of 9/30/2026, including the first RAP counts.
- IDR status reports after May 2026.
- IDR processing durations.
- Nonprofit employment counts.
- A direct count of married borrowers.
- A CRS or AACN national figure.
- Summer's user count and Savi's consumer price.

**Structural risks to demand:**
- Free alternatives exist: the StudentAid.gov Loan Simulator and plan selection, servicers, the new Defaulted Loans Support Center, and employer-paid Savi and Summer.
- The College Investor tells readers that "any company charging a fee to switch plans is a red flag". That is a trust and positioning headwind for a paid product.
