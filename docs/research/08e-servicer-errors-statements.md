# 08e — Servicer errors, billing statements, and the federal loan data file

Prepared 2026-11-14 for the Student Loan Copilot "statement checker" feature.

**Labels used below**
- **Verified**: I read the primary document or data myself in this session (PDF text, sample-statement image, or raw API output).
- **Secondary**: news, advocacy, or a search-engine summary. The primary source was not opened, or it blocked fetching.
- Every date is the publication date unless marked otherwise. CFPB API numbers were pulled on 2026-11-14.

---

## 0. Bottom line

1. **Statement errors are well documented, and some are on the statement itself.** The CFPB found "deceptive billing statements": wrong payment amounts caused by wrong poverty guidelines, family size, income, or missing spousal debt, plus wrong due dates. ED penalised MOHELA for late statements. GAO reports that since February 2025 ED no longer checks servicer accuracy at all.
2. **Complaint volume is high and concentrated.** The CFPB database holds 21,281 student-loan complaints for 2025 and 17,630 for 2026 through mid-November. MOHELA accounts for about 37% of them. The well-known "31% untimely" figure comes almost entirely from **MOHELA and the generic "Servicer under contract with FSA" bucket**. Nelnet, Aidvantage/Maximus and CRI answer about 100% of complaints on time.
3. **Statements show money fields, not program fields.** All three sample statements I could read show the amount due, due date, per-loan balance, rate, and how the payment was split between principal and interest. **None shows a PSLF or IDR count or a recertification date.** Only Nelnet shows the **repayment plan name**. All published samples predate RAP, so the labels for the RAP interest waiver and principal match are **unknown**.
4. **The data file fills most of the gaps.** The StudentAid.gov "Download My Aid Data" file (MyStudentData.txt) includes the repayment plan, plan begin date, scheduled amount, **IDR anniversary (recertification) date**, **PSLF cumulative matched months**, loan status history, rates, disbursements and the current servicer. It has **no IDR-forgiveness count** and **no payment-by-payment history**. The current official layout is still dated Oct 31, 2022 (posted 2023-02-16). Two 2026 third-party guides say the download still works.

---

## 1. Evidence table: documented servicer errors, 2023–2026

| # | Error | Who | When | Source (URL) | Verified? |
|---|---|---|---|---|---|
| E1 | **Deceptive billing statements**: servicers gave "inaccurate monthly payment amounts due to both system weaknesses and miscalculations", including "misapplying federal poverty guidelines, using the wrong family size or income, or failing to include spousal debt". The statements also showed **incorrect due dates**, such as dates before Oct 1, 2023, and repayment dates for borrowers with pending or approved borrower-defense claims. | Federal student loan servicers (not named) | Return to repayment, fall 2023. Published Dec 2024. | CFPB, *Supervisory Highlights: Special Edition Student Lending, Issue 36 (Winter 2024)*, §2.5.2. https://files.consumerfinance.gov/f/documents/cfpb_supervisory-highlights-special-ed-student-lending-issue-36-winter_2024-12.pdf | **Verified** (PDF text read) |
| E2 | Same report: **Reg E violations**, where servicers debited more than the authorised amount, sometimes "the entire outstanding loan balance", or debited from the wrong bank account. **IDR applications took more than 90 days** in many files, so interest accrued. Servicers **improperly denied IDR applications** (sufficient income documents treated as missing; eligible loans treated as ineligible) and gave **inaccurate denial reasons**. Average hold times were **40–58 minutes**, and **over 41%** of callers hung up before reaching an agent. | Federal servicers (not named) | 2023–24. Published Dec 2024. | Same PDF, §§2.5.1, 2.5.3–2.5.7 | **Verified** |
| E3 | ED **withheld $7.2M** of MOHELA's October payment. MOHELA did not send timely statements to **2.5M borrowers**, some only 7 days before the due date, and **800,000+ became delinquent** as a result. A "small number" of borrowers got incorrect payment amounts. Other, unnamed servicers also sent wrong amounts and put borrower-defense borrowers back into repayment. ED ordered forbearance for those affected. | MOHELA (and unnamed others) | Oct 30, 2023 | ED press release, reposted by CAPPS: https://cappsonline.org/u-s-department-of-education-announces-withholding-of-payment-to-student-loan-servicer-as-part-of-accountability-measures-for-harmed-borrowers/. Coverage: https://www.npr.org/2023/10/31/1209464901/education-department-punishes-student-loan-servicer-billing-mistakes-mohela. The ed.gov original returned 403. | **Verified via repost** of ED text, consistent with wide coverage |
| E4 | ED said **more than 300,000 borrowers** received **incorrect SAVE payment information**, fewer than 1% of the 28M returning to repayment. Affected borrowers were put in administrative forbearance. | Servicers (not named) | Oct 19, 2023 | CBS MoneyWatch: https://www.cbsnews.com/news/student-loan-repayment-wrong-information-save-idr-plan/ | Secondary (news quoting ED) |
| E5 | **CFPB v. Navient** order: **$100M redress plus a $20M penalty**, and a **permanent ban on Direct Loan servicing**. Alleged conduct: steering borrowers into forbearance instead of IDR, inadequate IDR **recertification notices**, **misallocating payments across loans and misapplying payments to loans** (causing late fees, interest and credit damage), and credit errors for borrowers with disability discharges. | Navient | Sept 12, 2024 | CFPB: https://www.consumerfinance.gov/about-us/newsroom/cfpb-bans-navient-from-federal-student-loan-servicing-and-orders-the-company-to-pay-120-million-for-wide-ranging-student-lending-failures/ | **Verified** (press release read) |
| E6 | ED **stopped assigning new accounts to MOHELA**. Reasons given: failing to process **460,000+ IDR applications**, continuing to apply interest, wrongly flagging borrowers for negative credit reporting, and delaying forgiveness. | MOHELA | Oct 2024 (WaPo, Oct 16, 2024) | Search summary of WaPo coverage. Also in SBPC fact sheet (E13). | Secondary |
| E7 | **Massachusetts AG settlement with Nelnet, $1.8M**. Nelnet's IDR **recertification notices** did not meet federal rules (2013–2017), so borrowers fell out of affordable plans. | Nelnet | Jan 11, 2024 | mass.gov (title seen in search): https://www.mass.gov/news/major-student-loan-servicer-nelnet-to-pay-18-million-for-alleged-failure-to-sufficiently-communicate-with-borrowers-about-maintaining-access-to-affordable-payments | Secondary (page not opened) |
| E8 | Earlier context, before 2023: **Navient multistate settlement of $1.85B** (Jan 13, 2022), and the **NY AG settlement with PHEAA/FedLoan** over **inaccurate PSLF payment counts** and improper denials (Apr 2022). | Navient; PHEAA | 2022 | https://www.attorneygeneral.gov/?p=26050 ; https://ag.ny.gov/sites/default/files/2022.04.21_nyag-pheaa_settlement_agreement_nyag_0.pdf | Secondary (search results) |
| E9 | **AFT v. ED** (D.D.C. 1:25-cv-00802), about the IDR and PSLF backlog. ED status reports showed **1,985,726 pending IDR applications** as of Apr 30, 2025. The case settled in Oct 2025 with six months of status reports. Later reports: **553,966 pending IDR** in the Mar 2026 report and **88,170 PSLF Buyback** applications pending in the Feb 2026 filing. | ED and its servicers | Filed 2025. Reports May 2025 – Mar 2026. | SBPC (May 16, 2025): https://protectborrowers.org/new-court-filing-reveals-backlog-of-2-million-borrower-payment-plan-applications/ ; case page: https://clearinghouse.net/case/46244/ ; NASFAA items (403 to fetch) | Secondary (summaries of court filings) |
| E10 | **IDR forgiveness payment counts removed** from StudentAid.gov and servicer accounts after the SAVE injunction. ED: "your IDR payment count and payment history are temporarily unavailable". PSLF counts stayed visible on StudentAid.gov. | FSA / MOHELA | July 10, 2025 | CNN via Yahoo: https://www.yahoo.com/news/student-loan-servicer-pauses-payment-140519014.html | Secondary (news quoting ED) |
| E11 | **GAO-26-108534**: FSA **stopped assessing servicer accuracy and call quality in Feb 2025** ("lack of staff capacity"). FSA staff fell from 1,433 to 777 FTE (Jan–Dec 2025). Before the halt, **4 of 5 servicers missed the accuracy standard** in at least one of two assessed quarters, and about **$850K** was withheld. ED's auditor found **material weaknesses** in loan data, including errors in servicer-reported loan status histories. GAO warns this could cause "incorrect billing amounts or wrong repayment statuses". ED disagreed with the recommendation. | FSA; all USDS servicers | Published Mar 5, 2026 | https://files.gao.gov/reports/GAO-26-108534/index.html | **Verified** (report page read via fetch) |
| E12 | **CFPB Consumer Response Annual Report 2025**. Borrowers said servicers "delayed crediting payments or applied their payment to the wrong loan" and "ignored requests to switch repayment plans or incorrectly placed them in forbearance". They said servicers "did not accurately count the number of qualifying payments" for PSLF and that loans were "force-placed in forbearance, which negatively impacted their payment count". Some reported autopay withdrawals continuing after payoff. **31% got no timely response or no response.** | Servicers (not named) | Covers 2025. Published Mar 2026. | https://files.consumerfinance.gov/f/documents/cfpb_2025-cr-annual-report_2026-03.pdf (§4.8, pp. 49–53) | **Verified** (PDF text read) |
| E13 | SBPC "Repeat Offenders 2026" fact sheets, which cite ED performance data: **MOHELA sent 280,000 incorrect billing notices** during return to repayment. **EdFinancial sent 15,370** billing notices with incorrect information, and **76,009 EdFinancial accounts were flagged for servicing errors, with only 1,480 borrowers notified**. ED withheld **$2M from Maximus (2024)** and **$13K from Nelnet** for late bills. All four big servicers got the maximum timeliness penalty in the last review. | MOHELA, EdFinancial, Maximus, Nelnet | Published June 2026 | https://protectborrowers.org/wp-content/uploads/2026/06/Servicer-Report-fact-sheets.pdf | Secondary (advocacy group; PDF read, underlying ED data not seen) |
| E14 | **SAVE→RAP transition, 2026.** ED said about **6,000 borrowers** got an **incorrect IDR payment** because of a processing error affecting borrowers who updated family size manually. They were told to reapply. | FSA (servicer not named) | ~July 2026 | Newsweek: https://www.newsweek.com/student-loan-update-thousands-of-borrowers-told-to-pay-incorrect-amount-12255318 | Secondary (news quoting ED press secretary) |
| E15 | **MOHELA sent false "seriously delinquent / nearing default" notices** to borrowers in good standing during the SAVE→Standard transition. Some showed past-due amounts over $10,000. Bloomberg Government: "fewer than 6,000 borrowers in good standing". Democratic senators sent a letter. | MOHELA | ~Aug 2026 | Newsweek: https://www.newsweek.com/student-loan-update-answers-demanded-after-major-error-impacts-borrowers-12392727 | Secondary |
| E16 | **RAP application failures**: an application screen "loads indefinitely", a customer-service rep blamed a "system glitch", and the paper form had not yet been updated for RAP. Borrowers also reported "incorrect monthly bills and account statuses". ED said it was "not aware of any widespread technical issues". 1.5M borrowers had left SAVE by Sept 14. First SAVE transition deadline: Sept 29, 2026. | FSA / servicers | Sept 28, 2026 | Business Insider via Yahoo: https://www.yahoo.com/news/politics/articles/major-deadline-student-loan-borrowers-191925441.html | Secondary |
| E17 | The IDR application **did not adjust a married borrower's payment for the spouse's federal loans**, and borrowers got error messages when choosing a plan. | FSA application | June 22, 2026 | Forbes (403 to fetch): https://www.forbes.com/sites/adamminsky/2026/06/22/student-loan-repayment-applications-are-messing-up-just-as-major-changes-arrive/ | Secondary (search snippet only) |

**Gaps (searched, not found):**
- **ED OIG, 2023–2026**: no OIG audit of MOHELA's PSLF work, IDR implementation, or return to repayment turned up within the search budget. The latest relevant OIG audit found is from Feb 2019. It found **32%** of FSA monitoring reports on IDR calculations contained incorrect calculations (secondary, via NASFAA and NPR coverage). AFT and SBPC petitioned OIG to audit MOHELA in Mar 2024 and again in May 2025 (https://protectborrowers.org/wp-content/uploads/2025/05/OIG-Letters-on-MOHELA.pdf).
- **CFPB Supervisory Highlights 2025–2026**: no student-loan edition after Issue 36 was found.
- **FSA penalties in 2025–2026**: the only figures found are GAO's ~$850K for accuracy shortfalls, plus GAO's note that FSA **waived** penalties for the period it stopped assessing.
- **RAP-specific errors** (principal match not posted, interest waiver not applied, wrong RAP amount): **no documented case** as of 2026-11-14. Blog posts about checking a "first RAP statement" (e.g., studentloancalcs.com) are illustrative, not evidence. Given E11 (no accuracy checks) and E14–E16, errors are plausible but not yet documented.

---

## 2. CFPB complaint volumes (product = "Student loan")

Source: CFPB Consumer Complaint Database API. Example query: `https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1/?product=Student%20loan&company=MOHELA&date_received_min=2026-01-01&date_received_max=2026-11-14&size=0`. Pulled 2026-11-14. The most recent complaint returned was received 2026-11-13. The aggregation totals reconcile exactly (company_response and timely buckets sum to hits.total), so I treat them as **Verified**.

**Definitions**
- *timely = No*: the company did not respond within 15 days.
- *"Untimely response"* is a final outcome: the company never gave a timely response.
- The database counts **published** complaints only. The annual report counts every complaint received, which is why it reports about 23,700 for 2025.

### 2a. Totals

| | 2025 (Jan 1–Dec 31) | 2026 YTD (Jan 1–Nov 13) |
|---|---|---|
| All student-loan complaints | **21,281** | **17,630** |
| Federal student loan servicing / private | 17,699 / 3,582 | 14,300 / 3,330 |
| timely = No | 6,460 (**30.4%**) | 5,574 (**31.6%**) |
| Outcome "Untimely response" | 3,242 (15.2%) | 4,997 (28.3%) |
| Closed with monetary relief | 90 (0.4%) | 38 (0.2%) |
| Closed with non-monetary relief | 249 | 229 |

The CFPB's own 2025 report gives about 23,700 received, 91% sent to companies, companies responding to 69%, and **31% with no timely response or no response**. Federal complaints rose 24% against the prior two-year monthly average. Credit-report problems rose 296%, and "Struggling to repay" rose 54% (Verified, PDF §4.8). The Student Loan Ombudsman report for Jul 2024–Jun 2025 gives about **18,400 federal complaints (+36%, the highest ever)**, of which about **25% got untimely responses**, compared with 10% the year before. **91%** of borrowers who answered the follow-up survey said the response did not address their concerns (Verified: https://files.consumerfinance.gov/f/documents/cfpb_pelo-annual-report_2026-01.pdf).

### 2b. By company

| Company (CFPB name) | 2025 | 2026 YTD | timely = No, 2025 | timely = No, 2026 | Top sub-issues (2026) |
|---|---|---|---|---|---|
| **MOHELA** | **7,850** | **6,471** | 4,590 (**58.5%**) | 4,083 (**63.1%**). Outcome "Untimely" 3,575 (55.2%) | Bad information 1,807; payments handled 1,658; customer service 565; forgiveness 692; payment plan 205 |
| **Nelnet, Inc.** | 4,295 | 3,131 | 10 (0.2%) | 3 (0.1%) | Bad information 839; account status incorrect (credit) 496; payments handled 329; forgiveness 264 |
| **Maximus Federal Services (Aidvantage + default servicing)** | 2,498 | 2,117 | 0 | 0 | Bad information 630; payments handled 263; account status 251; forgiveness 229 |
| Servicer under contract with Federal Student Aid (generic) | 1,637 | 1,376 | 1,637 (**100%**) | 1,376 (**100%**) | 2025–26 combined: bad info 506; payments 383; forgiveness 787 |
| **EdFinancial Services** | 1,629 | 1,286 | 140 (8.6%) | 15 (1.2%) | Bad information 297; account status 225; payments handled 196; forgiveness 129 |
| **Central Research Inc (CRI)** | 260 | 480 (↑85%) | 0 | 1 (0.2%) | Account status incorrect 144; bad info 79; payments handled 72 |
| **Navient Solutions** | 732 | 413 | 0 | 0 | 2025–26 combined: bad info 358; payments 107; forgiveness 110. Split 561 federal / 584 private. |
| **ECSI** (filed as Heartland Payment Systems; Perkins and campus loans) | 74 | 68 | 8 of 142 for 2025–26 (5.6%) | — | Payments handled 38; bad info 37 |
| AES/PHEAA | 186 | 186 | — | — | not pulled |
| SLM Corp (Sallie Mae, private) | 565 | 615 | — | — | not pulled |

**Key reads**
- MOHELA plus the generic "Servicer under contract with FSA" bucket account for **96% (2025)** and **98% (2026)** of all timely = No student-loan complaints. The "31% untimely" headline is a MOHELA/FSA-routing problem, not an industry-wide one.
- MOHELA's 2026 complaints still unresolved: 927 "In progress" plus 3,575 "Untimely".
- MOHELA has about **37%** of all student-loan complaints in both years, while it services about 7M of roughly 39M USDS accounts (SBPC, Dec 2025). That is about 2x its share.

### 2c. Top issues, all student-loan complaints

| Issue › sub-issue | 2025 | % | 2026 YTD | % |
|---|---|---|---|---|
| Dealing with your lender or servicer (total) | 12,059 | 56.7% | 10,217 | 58.0% |
| › Received bad information about your loan | 4,122 | 19.4% | 4,467 | **25.3%** |
| › **Trouble with how payments are being handled** | 3,960 | **18.6%** | 2,981 | 16.9% |
| › Problem with customer service | 1,693 | 8.0% | 1,177 | 6.7% |
| › Don't agree with the fees charged | 1,099 | 5.2% | 579 | 3.3% |
| › Need information about loan balance or terms | 877 | 4.1% | 784 | 4.4% |
| Struggling to repay your loan (total) | 4,293 | 20.2% | 3,305 | 18.7% |
| › Problem with forgiveness, cancellation, or discharge | 2,422 | 11.4% | 1,822 | 10.3% |
| › Problem with your payment plan | 711 | 3.3% | 502 | 2.8% |
| Incorrect information on your report (total) | 2,138 | 10.0% | 2,613 | 14.8% |
| › Account status incorrect | 1,037 | 4.9% | 1,702 | 9.7% |
| Improper use of your report | 1,364 | 6.4% | 240 | 1.4% |
| Company's investigation into an existing problem | 640 | 3.0% | 708 | 4.0% |

**Statement-relevant share.** "Payments handled", "bad information", "fees" and "balance/terms" together make up **47% (2025)** and **50% (2026)** of complaints. This is an upper bound on statement-related problems, because the categories are self-selected and broad.

**Not checked.** I tried to count complaint narratives mentioning "Repayment Assistance Plan" or "billing statement", but the API returned HTTP 400 for every `search_term` query I tried, so those counts are not available.

**Other complaint counts.** SBPC lists "complaints filed in 2025" as MOHELA 41,364, Nelnet 75,697, Maximus 14,266, EdFinancial 17,020 and CRI 1,822. These are **not** CFPB numbers. The source is not stated, and they are probably FSA Feedback System counts. Treat them as secondary.

---

## 3. What a monthly billing statement contains

### 3a. Sources found per servicer

| Servicer | What I found | Date of sample | URL | Status |
|---|---|---|---|---|
| **MOHELA** (Direct Loans) | "Sample Installment Bill" (image PDF, read as an image) plus the "How to Read Your Bill/Statement" field glossary (DLBillBacker.pdf). Also interest-bill and interest-notice samples. | Sample values dated 07-26-16. The glossary mentions SAVE and post-7/1/2023 capitalization rules, so it was updated in 2023 or later. | Page: https://www.mohela.com/DL/resourceCenter/StudentLoanBill.aspx ; PDFs: https://mohela.studentaid.gov/DL/secure/borrower/viewPdfFile.aspx?Filename=InstallmentBillExample.pdf and `...Filename=DLBillBacker.pdf` | **Verified** |
| **Nelnet** | "A Guide to Your Nelnet/Federal Student Aid Billing Statement", an annotated 2-page sample, read as images. | Statement date 9/2/2024 | https://nelnet.studentaid.gov/mma-cms-data/loan-info/Clients/Nelnet/documents/pdfs/Nelnet-Statement-Guide.pdf | **Verified** |
| **EdFinancial** | "Understanding Your Monthly Billing Statement" page plus an annotated 2-page sample PDF, read as images. | Sample dated March 10, 2024 (billing cycle shows 2022). PDF created 2024-03-27. | https://edfinancial.studentaid.gov/billing-and-statements/understanding-your-monthly-billing-statement ; https://edfinancial.studentaid.gov/wp-content/uploads/Edfinancial-Billing-Statement-Example-1.pdf | **Verified** |
| **Aidvantage** | **No sample statement found.** Only the "About payments" allocation rules and a **Payment Glossary** that defines statement terms. | n/a | https://images.aidvantage.studentaid.gov/in-repayment/about-payments/ (served as PDF) | Glossary verified; **no sample statement findable** |
| **CRI** | **Nothing findable.** The site is a JS app and returned empty to the fetcher, and a site-restricted search found no statement guide. | n/a | https://cri.studentaid.gov/ | **Not found** |

### 3b. Fields matrix (Y = shown on the statement, N = not shown, ? = unknown)

| Field | MOHELA | Nelnet | EdFinancial | Aidvantage (glossary only) | CRI |
|---|---|---|---|---|---|
| Total / current amount due | Y ("Current Due", "Total Principal and Interest Due"; also per loan) | Y ("Current Amount Due"; per loan group "Amount Due") | Y ("Current Amount Due"; per loan "Total Payment Due") | Y ("Current Amount Due", "Total Payment Due") | ? |
| Past-due amount | Y | Y | Y | Y | ? |
| Due date | Y ("Date Due") | Y ("Current Statement Due Date"; per group) | Y ("Current Statement Due Date") | not a glossary term | ? |
| Statement / bill date | Y ("Date Billed") | Y ("Statement Date") | Y ("Statement Date") | not defined ("Billing Cycle" only) | ? |
| Regular monthly payment | Y ("Monthly Installment Amount" per loan) | Y ("Regular Monthly Payment Amount") | Y ("Regular Monthly Payment Amount"; per loan) | Y ("Monthly Payment Amount") | ? |
| **Repayment plan name** | **N** (not on sample or in field glossary) | **Y** ("Repayment Plan: STANDARD" per group, plus "Loan Term (payments remaining)") | **N** | **N** | ? |
| Per-loan principal balance | Y ("Balance", which may include capitalized interest) | Y ("Outstanding Principal Balance" per group; "Original Principal Amount") | Y ("Unpaid Principal", "Original Principal", "Principal Reduction" per loan) | Y ("Unpaid Principal", "Original Principal") | ? |
| Interest rate | Y ("Int Rate" per loan) | Y (per group) | Y (per loan, plus "Interest Type" F/V) | only inside the daily-interest formula | ? |
| Unpaid / accrued interest | **Partial**: "Outstanding Accrued Interest" is defined in the glossary but **not on the sample bill** | Y ("Daily Interest", "Accrued Interest on [date]", "Estimated Interest on [due date]") | Y ("Unpaid Interest" per loan) | Y ("Accrued Interest", "Unpaid Interest", "Approximate Daily Interest") | ? |
| Capitalized interest | N (folded into "Balance") | N | Y ("Capitalized Interest" per loan) | Y | ? |
| Payment breakdown (principal vs interest) | Y ("Principal Paid Since Last Statement", "Interest Paid Since Last Statement", "Fees Paid"), account-level only | Y ("Applied to Interest", "Applied to Principal" per group, plus cumulative totals) | Y ("Applied to Interest", "Applied to Principal" per loan, plus life-of-loan totals) | Partial ("Principal Reduction") | ? |
| Per-loan allocation of the payment | N (account totals only) | Y (per group) | Y (per loan) | ? | ? |
| Loan type / program | Y ("Loan Program", e.g., DLSTFD, DLUNST) | Y ("Loan Type", e.g., DIRECT PLUS) | Y ("Loan Program") | "Loan ID" only | ? |
| Loan status (REPAY / FORB / DEFER) | **Y** (per-loan "Status") | N | N | N | ? |
| Disbursement / loan date | Y ("First Disb") | Y ("First Disbursement Date") | Y ("Loan Date") | Y ("Disbursement Date") | ? |
| Last payment date and amount | Y | Y | Y | Y ("Last Payment Effective Date") | ? |
| Autopay status / next debit | N on sample (a 0.25% reduction is mentioned on the back) | Y ("Next Auto Debit $ on date") | Y ("Auto Pay ENROLLED/NOT ENROLLED") | ? | ? |
| **PSLF qualifying-payment count** | **N** | **N** | **N** | **N** | ? |
| **IDR forgiveness count** | **N** | **N** | **N** | **N** | ? |
| **Recertification / IDR anniversary date** | **N** (mentioned only in the paid-ahead rules text) | **N** | **N** | **N** | ? |
| RAP interest-waiver / principal-match line | ? (no RAP-era sample) | ? | ? | ? | ? |

**Online account only.** These are on StudentAid.gov, not on any sample statement: the PSLF count (ED spokesperson, July 2025), the IDR count (removed 2025, E10), and recertification deadlines. EdFinancial's guide says account notifications live in the online account. A search summary also says the StudentAid.gov dashboard shows "current repayment plan, next due date, next payment amount" (secondary).

**Caveat.** All samples predate July 1, 2026. Servicers may have added RAP-specific lines. **I found no published RAP-era sample statement for any servicer.**

---

## 4. Detectable-from-statement checklist

"Statement has it?" refers to the three verified samples: MOHELA (M), Nelnet (N) and EdFinancial (E).

| # | Check | Fields needed | Statement has it? | Other input | Confidence | Evidence that this error happens |
|---|---|---|---|---|---|---|
| C1 | **Wrong payment amount compared with the plan formula** | Plan name, monthly payment, (for IBR) balance at plan entry and the Standard cap | Payment: M, N, E all. Plan name: **N only**. | User gives AGI, family size or dependents, filing status and spouse's loans. Plan from the user or the data file (`Loan Repayment Plan Type Code`). | **Medium for RAP** (simple formula). **Low–medium for IBR/ICR** (needs balance at entry, spousal debt, poverty line). Present as "possible discrepancy, ask servicer" when off by more than ~$10. The servicer may have used a different tax year. | E1 (wrong poverty guideline, family size, income, spousal debt); E4; E14 (6,000 in 2026); E17 |
| C2 | **Unpaid interest charged or capitalized under RAP when the payment was less than interest** | Plan = RAP, interest accrued this cycle, payment applied to interest, change in unpaid interest, capitalized interest | **E: yes** (Unpaid Interest, Capitalized Interest, Applied to Interest). **N: mostly** (accrued interest, applied to interest; no capitalized line). **M: no** (unpaid interest not on the sample). | **Two consecutive statements**; plan confirmation | **Medium** (EdFinancial and Nelnet layouts), **low** (MOHELA). Unknown how servicers will label the waiver. | No RAP-specific case documented yet. Mis-accrual history: E6 (MOHELA "continued applying interest"); E11 (accuracy unchecked) |
| C3 | **Missing RAP principal match** (principal should fall by at least the lesser of $50 or the payment on an on-time payment) | Per-loan principal before and after, payment applied to principal, payment date vs due date | Principal: M, N, E. Applied to principal: N, E (M at account level). | Two consecutive statements | **Medium–low.** Match posting timing and labels are unknown. Flag only after 2 cycles. | None documented yet (gap) |
| C4 | **Wrong plan name or placement** (e.g., moved to Standard after SAVE, or RAP selected but not applied) | Plan name; payment roughly equal to 10-year amortization | Plan name: **N only**. Others: a **proxy** (payment matches the Standard amortization of the balance). | User's chosen plan and application date; data file plan code and plan begin date | **High** where the plan is shown (Nelnet) or the data file is uploaded. **Medium** via the proxy. | E12 ("ignored requests to switch repayment plans"); E15; E16 |
| C5 | **PSLF or IDR count not increasing** | Count per month | **Not on any statement** | StudentAid.gov PSLF tracker screenshot, or monthly data-file diff of `Loan PSLF Cumulative Matched Months` (IDR count has no field and was hidden in 2025) | **Not feasible from a statement.** Medium–low via the data file (whether the field is populated is unverified). | E8 (PHEAA miscounts); E12 (PSLF miscounts and forced forbearance) |
| C6 | **Payment misapplied** (interest vs principal, or across loans) | Payment received, applied to interest, applied to principal, per-loan allocation, rates; the servicer's published allocation rule (overpayment to the highest-rate loan first) | M: account-level split only. **N, E: per group or per loan.** | Payment confirmation from the user's bank | **Medium–high** for arithmetic (split adds up; interest applied ≤ accrued; overpayment went to the highest-rate loan). **Medium** for cross-loan allocation. | E5 (Navient misallocation); E12 ("applied their payment to the wrong loan"); E2 (wrong-account debits) |
| C7 | **Forbearance applied without request** | Loan status, or a $0 amount due with "forbearance" text | **M: per-loan Status (FORB).** N and E: not on the sample (may appear in the notices box). | User says whether they requested it | **Medium–low.** Many 2023–26 forbearances were ED-ordered (SAVE litigation, servicer remedies), so present this as "check", not "error". | E12 ("incorrectly placed them in forbearance", "force-placed"); E5 |
| C8 | **Late recertification** | Recertification or anniversary date | **Not on any statement** | User input, or data file `Loan Repayment Plan IDR Plan Anniversary Date` | **Low** from a statement. A consequence such as a sudden jump to a Standard-like payment can be seen through C4. **Medium** with the data file. | E5 (Navient recert notices); E7 (Nelnet recert notices) |

**Extra checks the statement supports well (high confidence, no user data needed):**
- **Statement-to-due-date gap of at least 21 days.** ED requires statements at least 21 days before the due date. This is the exact MOHELA failure in E3. Fields: Date Billed or Statement Date, and Date Due (M, N, E all have them).
- **Internal arithmetic.** Total due = past due + current due. Per-loan amounts add up to the total. The principal/interest split adds up to the payment received.
- **Daily-interest sanity check.** Daily interest ≈ principal × rate / 365 (Aidvantage's own formula; Nelnet prints "Daily Interest").
- **Rate and balance cross-check against the data file.** Per-loan rate vs `Loan Interest Rate` / `Actual` / `Statutory`, which also shows whether the 0.25% autopay discount was applied. Principal vs `Loan Outstanding Principal Balance` (allow for the as-of date).

**Verdict.**
- **Feasible from a statement alone:** the 21-day gap, arithmetic consistency, misapplied payments (C6), interest sanity, and (on Nelnet) plan placement (C4).
- **Feasible with user inputs:** wrong amount vs formula (C1). For RAP, the waiver and match checks (C2, C3) need two consecutive statements.
- **Not feasible from a statement:** PSLF/IDR counts (C5) and recertification timing (C8). These need the data file or a StudentAid.gov screenshot.
- **Design implication:** combine a statement upload with a MyStudentData.txt upload.

---

## 5. The federal loan data file (Download My Aid Data → MyStudentData.txt)

### 5a. Is it still available?
- **Likely yes, as of 2026.** The Summer help article (updated **Feb 6, 2026**) gives the steps: StudentAid.gov → View My Loans → "Download My Aid Data" → Continue. It says the file downloads as **MyStudentData.txt** (https://summer.zendesk.com/hc/en-us/articles/4405115480723-How-do-I-download-my-loan-information-from-Federal-Student-Aid-FSA). A Patrick Henry CC guide (uploaded **July 2026**) gives the path My Aid → "Download My Aid Data", directly to the right of the Loans/Grants tabs (https://www.patrickhenry.edu/wp-content/uploads/2026/07/Accessing-Your-NSLDS-Data.pdf). Both are **secondary**. I could not verify on StudentAid.gov itself because it needs a login.

### 5b. Official layout
- **FSA Partners:** "Download My Aid Data File Layout", posted **2023-02-16**. The PDF is dated **Oct 31, 2022** and replaces the Dec 23, 2018 version (https://fsapartners.ed.gov/knowledge-center/library/nslds-user-resources/2023-02-16/download-my-aid-data-file-layout ; PDF: https://fsapartners.ed.gov/sites/default/files/2023-02/DownloadMyAidDataFileLayout.pdf). **Verified.** **No later version was found**; older MyStudentData layouts (2013–2018) are marked historical.
- **Format:** ASCII plain text of `name:value` pairs, **one per line**. Pairs are not fixed-position and not tagged. Order is fixed within each subsection, so parsers rely on order plus name. The loan section allows up to 350 loans. Each loan has 1–50 status records, plus disbursement, discharge, consolidation and contact records. Data source: NSLDS. Note: "Download My Aid Data reports whatever values have been supplied by the loan holder", so the file is servicer-reported, not ground truth. GAO (E11) flagged errors in servicer-reported status histories.

### 5c. Fields relevant to Copilot (Loan section, from the layout and its Appendix A sample)

| Need | In file? | Field(s) |
|---|---|---|
| Loan type | **Yes** | `Loan Type Code` / `Description` (e.g., D0 = Direct Stafford Subsidized); per-type totals |
| Disbursement dates | **Yes** | `Loan Date`, `Loan Disbursement Date` / `Amount` (repeating), `Loan Repayment Begin Date` |
| Interest rates | **Yes** | `Loan Interest Rate Type Code` (F/V), `Loan Interest Rate`, `Loan Actual Interest Rate`, `Loan Statutory Interest Rate` |
| Balances | **Yes** | `Loan Outstanding Principal Balance` and `Loan Outstanding Interest Balance` (each with an as-of date), `Capitalized Interest`; student-level totals |
| **Repayment plan** | **Yes** | `Loan Repayment Plan Type Code` / `Description` (sample: SF = STANDARD REPAYMENT), `Plan Begin Date`, `Plan Scheduled Amount` |
| **Recertification date** | **Yes** | `Loan Repayment Plan IDR Plan Anniversary Date` |
| **PSLF count** | **Yes (field exists)** | `Loan PSLF Cumulative Matched Months`. Whether it matches the StudentAid.gov PSLF tracker is unverified. |
| **IDR forgiveness count** | **No** | No field |
| Payment history | **Partial** | `Loan Most Recent Payment Effective Date`, `Loan Next Payment Due Date`, `Loan Cumulative Payment Amount`. No payment-by-payment history and no principal/interest split. |
| Forbearance / deferment history | **Yes** | Repeating `Loan Status` / `Description` / `Effective Date`; `Current Loan Status`; `DelinqDate` |
| Current servicer | **Yes** | `Loan Contact Type: Current ED Servicer`, name, address, phone, email |
| Discharges | **Yes** | Discharge type, date, amounts applied to principal and interest |
| RAP-specific values | **Unknown** | The 2022 layout does not list plan-code values, so how RAP is coded is unverified |

**Use in the product.** Let the borrower upload MyStudentData.txt once a month. Diff `PSLF Cumulative Matched Months`, plan code, status records and balances, and cross-check them against the uploaded statement. This covers C4, C5 (PSLF only), C7 and C8, which statements cannot.

---

## 6. Method and limits
- WebSearch: 20 queries, the full budget. Most evidence was taken directly from primary PDFs, sample-statement images, and the CFPB API.
- The CFPB API was queried through a fetch tool. Direct curl requests were blocked by Akamai. Every bucket total reconciles.
- Sites that blocked fetching: ed.gov (403), Forbes, NASFAA and The College Investor (403). Their items are marked secondary.
- **Not done:** keyword counts of CFPB complaint narratives (API HTTP 400); a CRI statement guide; an Aidvantage sample statement; any 2023–26 ED OIG report; any RAP-era sample statement.
