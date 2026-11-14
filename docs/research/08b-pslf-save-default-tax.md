# 08b — PSLF, SAVE wind-down, default/collections, tax, pending changes

Research date: **2026-11-14**. Scope: everything except the RAP/IBR/Standard payment formulas (those are in `08a`).

## How to read this file

- **Verified** means I read the primary document myself: Federal Register text, eCFR, a court filing, IRS, Treasury, or the FSA Data Center file.
- **Secondary** means the fact comes from news, CRS, or law-firm and advocacy summaries. I name the outlet each time.
- **Confidence**: H = high, M = medium, L = low.
- **Access limits during this research.** ed.gov, studentaid.gov page text, nasfaa.org, Forbes, The College Investor and congress.gov all blocked automated reads (HTTP 403, or a JavaScript-only page). web.archive.org could not be reached. The shared web-search budget ran out partway through. Because of that, I could not read ED press releases directly. Where an ED statement matters, I quote it from the court filings, the CRS report or the news story that carries it, and say so.

### Key primary sources used

| ID | Source | URL |
|---|---|---|
| RISE | ED, "Reimagining and Improving Student Education — Federal Student Loan Program Final Regulations," 91 FR 23768 (May 1, 2026), eff. 2026-07-01 | https://www.federalregister.gov/documents/2026/05/01/2026-08556 |
| PSLF-25 | ED PSLF final rule ("substantial illegal purpose"), 90 FR 48966 (Oct 31, 2025), FR Doc 2025-19729 | https://www.federalregister.gov/documents/2025/10/31/2025-19729 |
| eCFR | 34 CFR 685.102, 685.209, 685.211, 685.219, 685.220 (eCFR current as of 2026-11-12) | https://www.ecfr.gov/current/title-34/subtitle-B/chapter-VI/part-685 |
| MO-91 | Joint Motion for Entry of Final Judgment, *Missouri v. Trump*, No. 4:24-cv-520-JAR (E.D. Mo. Dec. 9, 2025), ECF 91 | https://storage.courtlistener.com/recap/gov.uscourts.moed.211135/gov.uscourts.moed.211135.91.0.pdf |
| MO-102 | Order vacating SAVE rule (E.D. Mo. Mar. 10, 2026), ECF 102 | https://storage.courtlistener.com/recap/gov.uscourts.moed.211135/gov.uscourts.moed.211135.102.0.pdf |
| MO-116 | Order denying borrower intervention (E.D. Mo. July 30, 2026), ECF 116 | https://storage.courtlistener.com/recap/gov.uscourts.moed.211135/gov.uscourts.moed.211135.116.0.pdf |
| AFT-60/65/70 | *AFT v. ED*, No. 1:25-cv-802-RBW (D.D.C.): status reports of Jan 14, 2026 (ECF 60) and May 19, 2026 (ECF 65); order of Oct 15, 2026 (ECF 70) | https://storage.courtlistener.com/recap/gov.uscourts.dcd.278527/ (files .60.0.pdf, .65.0.pdf, .70.0.pdf) |
| HAVENS | Complaint, *Havens v. ED*, No. 1:26-cv-00816-LLA (D.D.C. filed Mar. 9, 2026) | https://infobytes.orrick.com/wp-content/uploads/2451000-2451066-https-ecf-dcd-uscourts-gov-doc1-045111955875.pdf |
| TR-PR | Treasury press release sb0419, "Historic Federal Student Assistance Partnership" (Mar. 19, 2026) | https://home.treasury.gov/news/press-releases/sb0419 |
| TR-FS | ED–Treasury fact sheet (Mar. 19, 2026) | https://home.treasury.gov/system/files/136/Fact-Sheet-Department-of-Education-and-Department-of-the-Treasury.pdf |
| TR-SORN | Treasury SORN ".033 — Federal Student Aid Portfolio … Records," FR Doc 2026-20494 (Oct. 7, 2026) | https://www.federalregister.gov/documents/2026/10/07/2026-20494 |
| PSLF-ICR | ED ICR notice on the PSLF form, FR Doc 2026-19368 (Sept. 22, 2026) | https://www.federalregister.gov/documents/2026/09/22/2026-19368 |
| FSA-DC | FSA Data Center, *Portfolio by Loan Status* and *DL Portfolio by Repayment Plan* (FY2026 Q3, i.e. as of June 30, 2026; files saved July 14, 2026) | https://studentaid.gov/sites/default/files/fsawg/datacenter/library/PortfoliobyLoanStatus.xls ; …/DLPortfoliobyRepaymentPlan.xls |
| CRS-PSLF | CRS LSB11472, "PSLF: Recent Legal Developments" (updated Aug. 31, 2026) | https://www.everycrsreport.com/reports/LSB11472.html |
| CRS-TR | CRS R48962, "Transition of Servicing Defaulted Federal Student Loans to the Department of the Treasury" (June 9, 2026) | https://www.everycrsreport.com/reports/R48962.html |
| CRS-IAA | CRS LSB11392, "Department of Education Interagency Agreements" (Feb. 4, 2026) | https://www.everycrsreport.com/reports/LSB11392.html |
| CRS-LATE | CRS IF13335, "Student Loans: Late Payment Trends…" (Oct. 23, 2026) | https://www.everycrsreport.com/reports/IF13335.html |
| IRC108 | 26 U.S.C. §108(f), with amendment notes for P.L. 119-21 §70119 | https://www.law.cornell.edu/uscode/text/26/108 |
| P501 | IRS Pub. 501 (2025), "Married Filing Separately — Special Rules" | https://www.irs.gov/publications/p501 |
| I1040 | 2025 Instructions for Form 1040 (including Schedule 1-A and the EIC separated-spouse rule) | https://www.irs.gov/instructions/i1040gi |
| I8812 | 2025 Instructions for Schedule 8812 | https://www.irs.gov/instructions/i1040s8 |
| I8962 | 2025 Instructions for Form 8962 (PTC) | https://www.irs.gov/instructions/i8962 |
| P590A | IRS Pub. 590-A (2025) | https://www.irs.gov/publications/p590a |
| IR-2025-103 | IRS 2026 inflation adjustments (Oct. 9, 2025) | https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill |

---

## 1. PSLF

### 1a. Rules table

| Rule | Value | Source | As of | Conf. |
|---|---|---|---|---|
| Qualifying repayment plans (34 CFR 685.219(b)(28)) | (i) any IDR plan under §685.209 (so **IBR counts**); (ii) the **10-year Standard** plan, or the consolidation standard plan *with a 10-year term*; (iii) any other plan **except the Alternative plan**, if the monthly payment is ≥ the 10-year Standard payment; (iv) ICR, PAYE and REPAYE/SAVE, **only for payments received on or before 2028-06-30**; (v) **RAP** | RISE amendatory text, p. 23898; eCFR (unchanged as of 2026-11-12). Verified | 2026-11-12 | H |
| Does RAP count? | **Yes, but only on-time payments** (HEA §455(m)(1)(A)(v)). Deferment or forbearance months while enrolled in RAP **do not count**, and RAP months **cannot be bought back** or reconsidered | RISE preamble pp. 23844–45; §685.219(c)(2)(v), (g)(6). Verified | 2026-07-01 | H |
| Does Tiered Standard count? | **No.** ED says expressly that "the Tiered Standard repayment plan is not a PSLF-qualifying repayment plan." Possible edge case: prong (iii) covers any plan paying ≥ the 10-year Standard amount. Tiered Standard on a balance under $25k has a 10-year term and might meet that test. ED has not addressed this; treat it as **not counting** | RISE preamble p. 23845 (citing NPRM 91 FR 4284). Verified | 2026-05-01 | H (rule) / L (edge case) |
| Default plan for SAVE leavers who don't choose | Standard plan for loans made before 2026-07-01. For a *consolidation* loan, the standard term can run 10–30 years (§685.208(b)(2)), and a term over 10 years **does not qualify for PSLF** unless the payment is ≥ the 10-year amount | §685.210(a)(2) in RISE; §685.219(b)(28). Verified | 2026-07-01 | M-H |
| Employer: who qualifies | US government at any level (including the military); 501(c)(3); Tribal colleges; other nonprofits that provide a listed public service and are not a for-profit, union or partisan political group; AmeriCorps and Peace Corps. **Full-time** means an average of ≥30 hrs/week, and jobs can be combined. Contracted workers count where state law bars direct hiring | §685.219(b)(9),(11),(27). Verified (eCFR) | 2026-11-12 | H |
| 2025 "substantial illegal purpose" employer rule | Published 2025-10-31, effective 2026-07-01. **Vacated 2026-06-30** by D.D.C. (Judge Ali) and D. Mass. (Judge Joun), the day before it took effect | CRS-PSLF (verified CRS text); PSLF-ICR (FR: "On Tuesday, June 30, 2026, a Federal judge vacated the rule"). Verified | 2026-08-31 | H |
| Appeal status | ED appealed both judgments on **2026-08-27**. On about **2026-10-21** DOJ filed joint stipulations dismissing **2 of 3** appeals (D.C. Cir. and one 1st Cir. appeal). The **states' appeal (1st Cir.) was reported still pending** as of 2026-10-22, and experts expect it to be dropped. Vacatur stands in any case | Aug 27: CRS-PSLF (verified CRS). Oct 21 dismissals: Inside Higher Ed 2026-10-22; Forbes 2026-10-23 headline (secondary) | 2026-10-22 | H (Aug 27) / M (Oct 21) |
| Is the rule enforced today? | **No.** ED removed the employer attestation from the PSLF form "in order to comply with the court order. No other changes have been made at this time." | PSLF-ICR, FR 2026-09-22. Verified | 2026-09-22 | H |
| CFR text still contains the vacated provisions | eCFR §685.219(b)(30), (c)(4), (h)–(j) still print "substantial illegal purpose." **RISE (May 1, 2026) republished the whole §685.219 with that text**, so the CFR has not caught up with the vacatur | eCFR (verified); RISE pp. 23897–900 (verified) | 2026-11-12 | H (fact) / see Conflicts |
| Payment counting | 120 qualifying monthly payments after 2007-10-01, made while working full-time for a qualifying employer, on Direct loans, and not in default when applying. Lump-sum prepayment counts forward up to the next recertification (IDR) or 12 months (10-year Standard). Listed deferments and forbearances count *outside RAP* (cancer, economic hardship, military, post-active-duty, AmeriCorps, National Guard, DoD SLRP, administrative forbearance under §685.205(b)(8)/(9)) | §685.219(c). Verified | 2026-11-12 | H |
| Consolidation | Uses a **weighted average** of prior qualifying payments, which also covers Parent PLUS consolidation | §685.219(c)(3). Verified | 2026-11-12 | H |
| Forms and tracking | Form OMB 1845-0110 (PSLF & TEPSLF Certification & Application). File annually; it is required only at 120. A Reconsideration Request form also exists (ICR renewed 2026-07-31). The PSLF Help Tool is on StudentAid.gov | PSLF-ICR; FR 2026-15587. Verified | 2026-09-22 | H |
| Reconsideration | Within 90 days of a denial. The ban on employer-status appeals for "substantial illegal purpose" findings is moot after the vacatur | §685.219(g). Verified | 2026-11-12 | H |
| **PSLF Buyback** | For months in deferment or forbearance *not* in the counted list, while employed full-time at a qualifying employer, **excluding months in RAP**, the borrower can pay what they would have owed on a qualifying plan, or get credit if they would have owed $0 on IDR | §685.219(g)(6). Verified | 2026-11-12 | H |
| Buyback backlog | **83,370** pending on 2025-12-31 (1,930 decided that month). **~88,000** pending on 2026-04-30, including an estimated 18–19k duplicates; 6,870 decided in April (6,600 approved) | AFT-60, AFT-65 (sworn status reports). Verified | 2026-05-19 | H |
| Buyback backlog (later) | ~82,000 pending (ED to the *Washington Post*, Oct 2026). On **2026-10-30** AFT filed a new class action, *Weingarten v. McMahon*, alleging stalled buyback and removed credits | Secondary (search summaries of NASFAA item 40148, rollingout.com, College Investor). Not verified | 2026-10-30 | L-M |
| IDR application backlog | 734,221 pending (2025-12-31); **530,295 pending (2026-04-30)** | AFT-60, AFT-65. Verified | 2026-05-19 | H |
| PSLF discharge volume | 9,400 in Dec 2025; 11,500 in Apr 2026. Cumulative through Apr 2026: **~1.254 M borrowers, $93.4 B** | AFT-60/65 (verified); CRS-PSLF (verified CRS) | 2026-08-31 | H |
| IDR Account Adjustment | A one-time recount (2022–2024) that credited past periods toward IDR and PSLF. Mostly finished in 2024. Remaining fixes go through reconsideration or buyback | Background (pre-2026 ED material; not re-verified) | 2024 | M |
| **SAVE forbearance and PSLF/IDR** | The SAVE litigation forbearance is **not** on the counted list in §685.219(c)(2)(v) or §685.209(k)(4)(iv), so those months **do not count directly** toward PSLF or IDR forgiveness. For PSLF they **can be bought back** under §685.219(g)(6) if the borrower worked full-time for a qualifying employer and was not in RAP. **For IDR forgiveness there is no clear buyback**: the IDR catch-up provision §685.209(k)(6) came from the SAVE rule, which was vacated except for (k)(4)(iv) | Regulation logic verified (eCFR, MO-102). ED's public statement that SAVE forbearance months don't count but PSLF Buyback is available is from StudentAid.gov (2025), not re-verified | 2026-11-12 | H (PSLF) / M (IDR) |
| Retained piece of the SAVE rule | §685.209(k)(4)(iv), the list of deferments and forbearances that count toward IDR forgiveness, survives. The settlement restored it to stop disrupting IDR discharges | MO-102; AFT-60 p. 3. Verified | 2026-03-10 | H |
| Payments collected via AWG/TOP | An AWG or TOP amount equal to the 10-year Standard payment counts toward **IDR** forgiveness (RAP and IBR). It does **not** count for PSLF, which requires not being in default | eCFR §685.209(k)(5)(iii). Verified | 2026-11-12 | M-H |

---

## 2. SAVE wind-down

### 2a. Rules table

| Rule | Value | Source | As of | Conf. |
|---|---|---|---|---|
| Litigation chain | E.D. Mo. preliminary injunction 2024-06-24 → 8th Cir. injunction pending appeal 2024-08-09 (*Missouri v. Biden*, 112 F.4th 531) → 8th Cir. affirmed 2025-02-24 (128 F.4th 979) → mandate implemented 2025-04-14 → **settlement and joint motion for final judgment 2025-12-09** (ECF 91) → district court **dismissed as moot 2026-02-27** → 8th Cir. reversed and directed entry of judgment **2026-03-09** → **final order 2026-03-10** | MO-91, MO-102, HAVENS ¶2. Verified | 2026-03-10 | H |
| What the final order did | "the SAVE Plan Final Rule … will be vacated, with one exception … 34 C.F.R. § 685.209(k)(4)(iv) … That provision will remain in effect. Other than that exception, that SAVE Plan Final Rule is hereby VACATED in full." All previous orders vacated; case closed | MO-102 (quote). Verified | 2026-03-10 | H |
| Post-judgment | SAVE borrowers moved to intervene (2026-03-13); **denied as untimely 2026-07-30**. The same borrowers sued separately in *Havens v. ED*, D.D.C. 1:26-cv-00816 (filed 2026-03-09), asking for SAVE discharges and the right to re-enroll. **Status unknown** | MO-116, HAVENS. Verified | 2026-07-30 | H (filings) / L (Havens status) |
| Settlement terms (ED) | ED "will not enroll any new borrowers in the SAVE Plan, will deny any pending enrollment applications," and will move current SAVE borrowers to other plans within a limited time | ED Dec 2025 press release (quoted in search snippet; ed.gov blocked) | 2025-12-09 | M |
| Interest during SAVE forbearance | Interest **resumed accruing 2025-08-01**. The forbearance itself continues until the borrower changes plans or the notice deadline passes | ED press release July 9, 2025 (not re-fetched); the RISE preamble records commenters referring to "interest that has accrued since August 1, 2025" | 2025-08-01 | H |
| Notice waves | Servicers began sending exit notices **2026-07-01**, in waves. Nelnet: "is notifying nearly three million Nelnet borrowers, so we're reaching out in waves," with notices "between July 2026 and March 2027" (Nelnet FAQ on StudentAid.gov). ED's 2026-06-25 court filing put the **earliest deadline at 2026-09-29**. Each borrower's deadline runs from their own notice, so two borrowers at the same servicer can have different dates. A borrower can switch on StudentAid.gov without waiting for a notice | CNBC 2026-07-06; NY AG alert 2026-07-06 (secondary) | 2026-07-06 | M |
| 90-day window | "After a borrower receives this notice, they will have 90 days to select a new repayment plan." The notice states the date the SAVE forbearance ends | NY AG consumer alert 2026-07-06 (government, secondary to ED) | 2026-07-06 | M-H |
| Final 30-day notice | Borrowers who don't act within 90 days get a **final 30-day notice**. The first wave (early July notices) received theirs around October 2026. No public ED extension of the 90-day timeframe | Forbes 2026-10-16 headline; search summaries (secondary) | 2026-10-16 | M-L |
| If no choice is made | Placed automatically in the **Standard plan** (no loans made on or after 2026-07-01) or **Tiered Standard** (any loan made on or after 2026-07-01 that is in repayment). The borrower can still apply for IBR or RAP later. First wave: payment due around Oct–Nov 2026 | CNBC; NY AG ("will likely be automatically moved to the Standard Plan"); CRS-LATE ("must enroll in a different repayment plan or be placed in a standard repayment plan"). Consistent with §685.210(a)(2) default designation (verified) | 2026-10-23 | M-H |
| Options for SAVE leavers | Loans before 2026-07-01: IBR, RAP, PAYE or ICR (until 2028-07-01), Standard, Graduated, Extended. Loans or consolidations on or after 2026-07-01: **RAP or Tiered Standard only** | NY AG alert; §685.210 (RISE). Verified for the reg | 2026-07-01 | H |
| SAVE enrollment (official count) | **6.52 M recipients, $354.3 B** in SAVE on 2026-06-30 (FY26 Q3). Earlier: 6.99 M (2026-03-31), 7.19 M (2025-12-31), 7.94 M (2024-12-31). ED's settlement-time figure was ~7.5 M (secondary). **No official count after 2026-06-30 yet**; the FY26 Q4 file is not out | FSA-DC (verified) | 2026-06-30 | H |
| PAYE/ICR sunset | Borrowers must leave by 2028-07-01; non-choosers go to RAP, or IBR for RAP-ineligible loans | §685.209(c)(7)(iii) (RISE). Verified | 2026-07-01 | H |

### 2b. What this means for the engine

- Model a SAVE borrower's timeline as: notice date (unknown, so ask the user) → +90 days → final 30-day notice → auto-placement in Standard or Tiered Standard → first bill.
- Interest has accrued since 2025-08-01 and is **not** subsidized. When the forbearance ends, the accrued interest is a separate balance and **may capitalize**. Check capitalization treatment against `08a` and the servicer statement.

---

## 3. Default and collections

### 3a. Rules table

| Rule | Value | Source | As of | Conf. |
|---|---|---|---|---|
| Default trigger | 270 days delinquent = default. Involuntary collection is possible after 360 days | CRS-LATE; CRS-TR. Verified CRS | 2026-10-23 | H |
| Rehabilitation: payments | **9 voluntary, reasonable and affordable monthly payments within 20 days of the due date over 10 consecutive months** | §685.211(f)(1). Verified | 2026-11-12 | H |
| Rehab payment formula | Before 2027-07-01: equal to "the payment required under any eligible income-driven repayment plan," **minimum $5**. **From 2027-07-01: minimum $10** for Direct Loans (FFEL stays at $5). ED may calculate it from IRS data (FTI) with the borrower's consent. If $0 under IDR, the rehab payment is the minimum | §685.211(f)(1)(i) (RISE); RISE preamble p. 23778. Verified | 2026-11-12 | H |
| Rehab alternative amount | If the borrower objects, ED recalculates from income and expenses on an ED form (Loan Rehabilitation: Reasonable and Affordable Payments form; ICR renewed 2026-07-23) | §685.211(f)(3); FR 2026-14932. Verified | 2026-11-12 | H |
| Rehab limit | **Once** for rehabs before 2027-07-01. **Two times per loan from 2027-07-01** (OBBBA/"Working Families Tax Cuts Act" §82003; HEA §428F(a)(5)). Only *completed* rehabs count toward the limit | §685.211(f)(12); RISE p. 23775. Verified | 2026-11-12 | H |
| AWG during rehab | Garnishment continues until the **5th** qualifying rehab payment, then is lifted. This AWG suspension is available once, or twice from 2027-07-01 | §685.211(f)(11). Verified | 2026-11-12 | H |
| Title IV eligibility | 6 consecutive on-time voluntary payments restore aid eligibility (once) | §685.102(b) "satisfactory repayment arrangement" (1). Verified | 2026-11-12 | H |
| After rehab | The default record is removed from credit reports. ED may move the borrower straight into IDR if they applied on a single application (rehab on or after 2026-07-01) | §685.211(f)(8), (f)(14). Verified | 2026-11-12 | H |
| Consolidation out of default | Allowed if the borrower **(a) makes 3 consecutive voluntary, on-time, full, reasonable and affordable payments**, *or* **(b) agrees to repay the new consolidation loan on an IDR plan**. A loan under a **judgment** or an active **AWG order** cannot be consolidated unless the judgment is vacated or the order lifted. A defaulted Direct Consolidation Loan cannot be reconsolidated on its own; that borrower must rehabilitate | §685.102(b) (2); §685.220(d)(1)–(2). Verified | 2026-11-12 | H |
| Consolidation after 2026-07-01 | A new consolidation loan is a loan made on or after 2026-07-01, so its only plans are **RAP or Tiered Standard**. The "agree to IDR" route therefore means **RAP**. Parent PLUS consolidations are not RAP-eligible and must use the 3-payment route | §685.210(a)(1)(ii) (RISE). Verified; the Parent PLUS inference is M | 2026-07-01 | M-H |
| TOP history | ED restarted Treasury Offset on **2025-05-05** (ED press release 2025-04-21) | CRS-TR fn. (verified CRS) | 2025-05-05 | H |
| **Pause of involuntary collections** | Announced **2026-01-16**: ED will "delay the implementation of involuntary collections on federal student loans, including Administrative Wage Garnishment and the Treasury Offset Program." ED stated "The temporary delay will enable the Department to implement major student loan repayment reforms." **No restart date given.** Defaults are still reported to credit bureaus | ED press release 2026-01-16 (ed.gov returns 403). Quote via CRS-TR ("enable the Department to implement major student loan repayment reforms" — verified CRS), CNBC 2026-01-16, and an ED-domain search snippet | 2026-01-16 | H (fact) / M (exact wording) |
| **Latest official status** | ED spokesperson: **"Involuntary collections remain paused."** Stateline/Jolt (2026-11-12): "a restart has not been announced"; ED did not respond to comment. **No ED or Treasury restart date exists in any primary source I found** | Yahoo Finance 2026-10-29 (ED quote, secondary); Jolt Journal / Stateline 2026-11-12 | 2026-11-12 | M-H |
| Reported restart signals (unconfirmed) | Treasury reportedly preparing to hire private collectors "possibly as soon as November" 2026. Officials reportedly split between waiting until after the midterms and restarting before the 2027-04-15 tax deadline. TISLA's Betsy Mayotte expects 2027. One blog says Treasury opened a "Defaulted Loans Support Center" on 2026-09-30 | Debt Discipline 2026-10-28 (citing IBTimes); Forbes 2026-10-19 headline; Jolt 2026-11-12. **Unverified** | 2026-11-12 | L |
| **Treasury takeover** | **2026-03-19 interagency agreement (Economy Act, 31 USC 1535; DCIA, 31 USC 3701–3720E).** Phase 1: Treasury "will assume operational responsibility for collecting on defaulted Federal student loan debt," revokes ED's 2001 exemption from Cross-Servicing referral, and absorbs FSA's Default Resolution Group and DMCS. Later phases cover servicing support for non-defaulted loans and other FSA functions (FAFSA "and more"), "to the extent practicable and permitted by law." ED keeps policy and statutory duties. **No timeline in the IAA** | TR-PR, TR-FS (verified); CRS-TR ("does not set forth a specific timeline") | 2026-06-09 | H |
| Treasury data access | Treasury SORN .033 (2026-10-07; routine uses effective 2026-11-06) covers NSLDS, DMCS and EDMAPS data for Treasury oversight of the student-aid portfolio | TR-SORN. Verified | 2026-11-06 | H |
| Treasury PCA procurement | Fiscal Service SAM.gov notice 2033H626N00002, "Default Resolution Agency Service Education Debt" (2026-03-20) | CRS-TR fn. 32 (verified CRS) | 2026-03-20 | H |
| Notice periods once collections restart | TOP: written notice, then offset and credit reporting can start after 65 days. AWG: written notice; hearing request within 30 days; up to 15% of disposable pay | Jolt 2026-11-12 citing StudentAid.gov (secondary) | 2026-11-12 | M |
| **Borrowers in default (official)** | **9.3 M recipients / $234.1 B** in the federally managed portfolio (Direct + ED-held FFEL), "cumulative in default" at **2026-06-30**. Direct Loans alone: 7.55 M / $187.8 B. Trend: 7.7 M (2025-12-31) → 9.0 M (2026-03-31) → 9.3 M (2026-06-30). Commercially held FFEL defaults are **excluded** | FSA-DC *Portfolio by Loan Status*, FY26 Q3 (verified) | 2026-06-30 | H |
| Default count (ED/Treasury statements) | "more than 9 million borrowers in default" (fact sheet). CRS: 7.8 M / $179 B at 2025-12-31 | TR-FS; CRS-TR. Verified | 2026-03-19 | H |

---

## 4. Tax

### 4a. Rules table

| Rule | Value | Source | As of | Conf. |
|---|---|---|---|---|
| ARPA §9675 exclusion | Excluded **any** student-loan discharge from 2021-01-01 through 2025-12-31. **Expired.** P.L. 119-21 rewrote §108(f)(5): "Prior to amendment, par. (5) related to special rule for discharges in 2021 through 2025" | IRC108 amendment notes. Verified | 2026-11-12 | H |
| IDR/RAP forgiveness after 2025-12-31 | **Federally taxable** as cancellation-of-debt income unless another exclusion applies, mainly **insolvency** (§108(a)(1)(B), Form 982). The **discharge date** controls, so a borrower eligible in 2025 but discharged in 2026 is taxable | §108(f) as amended. Verified | 2026-11-12 | H |
| What P.L. 119-21 made permanent | §108(f)(5): **death and total-and-permanent-disability discharges** (federal and private education loans) excluded **permanently** for discharges after 2025-12-31, with an **SSN-on-return requirement** (§70119) | IRC108 text and notes. Verified | 2026-11-12 | H |
| PSLF | **Tax-free** under §108(f)(1): a discharge "pursuant to a provision of such loan under which all or part of the indebtedness … would be discharged if the individual worked for a certain period of time in certain professions for any of a broad class of employers." Permanent | IRC108 (verified text). Applying it to PSLF is long-standing IRS/ED treatment | 2026-11-12 | H |
| Other permanent exclusions | §108(f)(4): NHSC and state health loan repayment programs. Borrower-defense and closed-school discharges are treated as non-taxable under IRS revenue procedures | IRC108 (verified for (f)(4)); revenue procedures not re-verified | — | M |
| Bills to restore the IDR exclusion | **Not verified.** I found no enacted change after P.L. 119-21, but the search budget ran out before I could check pending bills | — | 2026-11-14 | L |
| 1099-C for 2026 IDR discharges | Unknown whether and how ED will issue them (due by 2027-01-31) | — | — | L |
| State conformity | **Low-quality secondary data only.** Most often named as taxing IDR forgiveness: **Mississippi, Indiana, North Carolina, Wisconsin, Arkansas** (sources conflict on **California** and **Minnesota**; Mississippi is reported to tax PSLF too). No broad wage income tax: TX, FL, NV, WA, WY, SD, AK, TN, NH. With the federal exclusion gone, states that start from federal AGI will generally tax IDR forgiveness unless they have their own exclusion | Aggregator pages (College Investor, cpavalidated, Forbes 2025-12-30 headline). Unverified | 2026 | L |

### 4b. What married filing separately (MFS) costs

| Item | MFS treatment | Source | Conf. |
|---|---|---|---|
| Brackets | 2026 MFS thresholds are **exactly half of MFJ**: 10% to $12,400; 12% to $50,400; 22% to $105,700; 24% to $201,775; 32% to $256,225; 35% to **$384,350**; 37% above. (Single and MFS are the same through 32%. MFS 37% starts at half the MFJ $768,700) | IR-2025-103 (single/MFJ verified). MFS = ½ MFJ is derived; check Rev. Proc. 2025-32 Table 3 | H/M |
| Standard deduction | MFS $16,100 (2026) / $15,750 (2025), exactly half of MFJ. If one spouse itemizes, the other must too | IR-2025-103; P501. Verified | H |
| Student loan interest deduction | **Not allowed** for MFS | P501. Verified | H |
| AOTC / Lifetime Learning credits | **Not allowed** | P501. Verified | H |
| Child & dependent care credit | **Not allowed in most cases**. The dependent-care FSA exclusion drops to **$2,500**. Exception for legally separated or living-apart spouses | P501. Verified | H |
| EITC | Not allowed for MFS **unless** the ARPA separated-spouse rule applies: a qualifying child lived with you more than half the year **and** you lived apart from your spouse the last 6 months, or are legally separated and not in the same household at year-end. MFS with no qualifying child: never | I1040 (line 27). Verified | H |
| Premium Tax Credit | Married people **must file jointly** to claim the PTC. Exceptions: married persons living apart who qualify as head of household, or **victims of domestic abuse or spousal abandonment** (max 3 years) | I8962. Verified | H |
| Adoption credit / exclusion | **Not allowed in most cases** | P501. Verified | H |
| Child Tax Credit | Phase-out begins at MAGI **$200,000 for MFS** (all non-joint filers) vs **$400,000 MFJ**. 2025 CTC is $2,200 per child ($1,700 refundable). Each child can be claimed by only one spouse | I8812; I1040. Verified | H |
| Saver's credit | Income limits are half the joint limits | P501. Verified | H |
| Roth IRA | If you lived with your spouse at any time in the year: **no Roth contribution once MAGI ≥ $10,000** (phase-out $0–$10k). Traditional IRA deduction phases out over $0–$10k if either spouse has a workplace plan | P590A (2025 and 2026). Verified | H |
| OBBBA deductions (tips, overtime, senior $6k) | "If you are married, you must file a joint return." Car-loan interest deduction: no joint-filing requirement is stated | I1040 (Schedule 1-A summary). Verified | H |
| SALT cap | $20,000 MFS / $40,000 MFJ (2025). Phase-down starts at $250k MFS / $500k MFJ, floor $5k / $10k | I1040. Verified | H |
| Other | Capital-loss limit $1,500. Up to 85% of Social Security taxable if you lived together. No credit for the elderly or disabled. AMT exemption is half the joint amount. No $25k passive-rental allowance if you lived together | P501. Verified | H |
| Community-property states | AZ, CA, ID, LA, NV, NM, TX, WA, WI. On MFS returns community income is generally **split 50/50** (Pub 555, Form 8958), so the borrower's MFS AGI can include half of the spouse's wages. That undercuts the IDR benefit of filing separately. ED's handling (for example, alternative income documentation) is **unverified** | P501 (list verified); Pub 555 rule M | M |

### 4c. Rule of thumb for the "file separately" toggle

Federal MFS cost ≈ **bracket penalty** + **value of lost items**. Then compare it to the annual IDR or RAP payment saved by excluding the spouse's income (the formula is in `08a`).

1. **Bracket penalty (exact for ordinary income).** Assumptions: MFJ brackets and standard deduction are exactly 2× MFS, and both spouses take the standard deduction. Let H and L be the two spouses' MFS taxable incomes, H ≥ L, using AGI − $16,100 and **allowing L to go negative**. Then:

   `penalty = Σ_i Δr_i × min(H − b_i, b_i − L)` over every MFS bracket threshold b_i strictly between L and H.

   Thresholds and rate steps for 2026: b = 0 (Δr 10%), 12,400 (2%), 50,400 (10%), 105,700 (2%), 201,775 (8%), 256,225 (3%), 384,350 (2%).

   I checked this numerically against a full bracket computation and it matched in every case. Examples:
   - H = $120k, L = $40k → **$1,326**
   - H = $200k, L = $0 → **$7,174**
   - Both spouses in the same bracket → **$0**

   Shortcut: if both spouses' taxable incomes fall in the same bracket, the bracket cost is $0.
2. **Add lost items**, using the borrower's actual numbers:
   - student loan interest deduction: up to $2,500 × marginal rate;
   - AOTC up to $2,500 or LLC up to $2,000;
   - child and dependent care credit, plus the lost FSA tax break;
   - EITC (unless separated);
   - PTC (it can be thousands);
   - adoption credit;
   - Roth eligibility (an inconvenience, not a tax cost);
   - CTC, if the MFS MAGI of the claiming spouse is over $200k;
   - OBBBA tips, overtime and senior deductions.
3. **State tax.** Run the state return both ways. Some states force MFS if the federal return is MFS, and community-property states split income.
4. **Honest UI copy.** "Filing separately raises your federal tax by about $X this year (estimate). It lowers your RAP or IBR payment by about $Y. Net: $Y − X." Show "lost credits" line by line. IRS Pub 501 itself says: "you should figure your tax both ways."

---

## 5. Pending changes (next 12 months)

| Item | Status | Likely date | Source | Conf. |
|---|---|---|---|---|
| PSLF employer-rule appeals | 2 of 3 appeals dismissed about 2026-10-21. The states' 1st Cir. appeal is reportedly pending and expected to be dropped. The rule is vacated and ED removed the form attestation. A **re-proposal** is possible in principle; no plan has been reported | Dismissal of the last appeal: any time | Inside Higher Ed 2026-10-22; CRS-PSLF; PSLF-ICR | M |
| *AFT v. ED* (IDR processing, PSLF buyback), D.D.C. 25-cv-802 | Monthly status reports continue. **Status conference 2026-11-23, 11:00** | 2026-11-23 | AFT-70 (verified) | H |
| *Weingarten v. McMahon* (AFT class action: buyback delays, removed credits) | Filed 2026-10-30 | Early motions in winter 2026–27 | Secondary (NASFAA 40148 title; rollingout) | M-L |
| *Havens v. ED* (SAVE borrowers seeking SAVE discharges / re-enrollment), D.D.C. 26-cv-816 | Filed 2026-03-09. Status unknown | Unknown | HAVENS | L (status) |
| SAVE exits | Notice waves continue (Nelnet to March 2027). Final 30-day notices and auto-placements roll monthly | Through about Q1–Q2 2027 | CNBC; NY AG | M |
| Involuntary collections restart (AWG/TOP), now via Treasury Cross-Servicing | **No official date.** Reports range from "as soon as Nov 2026" (PCA hiring) and "before 2027-04-15" to "2027" (expert) | Unknown; most likely 2027 | Yahoo/ED quote; Debt Discipline; Jolt | L |
| Treasury IAA, later phases (non-default servicing, FAFSA) | Announced, with no timeline. The D. Mass. suits challenging ED's IAAs (filed March 2025, amended complaints Nov 2025 and Jan 2026) may reach the Treasury IAA | Unknown | TR-FS; CRS-TR; CRS-IAA | M |
| Second rehabilitation, $10 rehab minimum, two AWG suspensions | Final rule | **2027-07-01** | RISE; §685.211 | H |
| First tax season with taxable IDR forgiveness (2026 discharges) | Law is final | Jan–Apr 2027 (1099-C by 2027-01-31, if issued) | IRC108 | H (law) / L (1099-C) |
| ICR/PAYE sunset; PSLF credit for ICR/PAYE ends | Statute and rule final | 2028-06-30 / 2028-07-01 (outside 12 months, but drives plan advice now) | RISE; §685.219(b)(28)(iv) | H |
| RISE "professional degree / professional student" definition, reported **stay** | **Could not verify** any stay or court order. The FR shows no postponement notice for "professional student" after 2026-05-01. CRS R48768 (Feb 2026) covers only the proposal | Unknown | FR API search (none found) | L |
| Bills: restore the §108(f)(5) IDR exclusion; RAP changes | **Not verified** (search budget exhausted; congress.gov blocked) | — | — | L |
| Unified Agenda (ED), 2026-08-14 | Published; I could not read the loan items (reginfo.gov unreachable) | — | FR 2026-16596 | L |

---

## Dated timeline

**Past (anchors)**
- 2024-06-24: E.D. Mo. preliminary injunction against SAVE forgiveness.
- 2024-08-09: 8th Cir. injunction; SAVE forbearance begins.
- 2025-02-24: 8th Cir. affirms.
- 2025-05-05: Treasury Offset restarts.
- 2025-07-04: P.L. 119-21 enacted.
- 2025-08-01: Interest resumes on SAVE loans.
- 2025-10-31: PSLF employer rule published.
- 2025-12-09: SAVE settlement and joint motion.
- 2025-12-31: ARPA tax exclusion ends.
- 2026-01-16: ED pauses AWG and TOP.
- 2026-02-27: SAVE case dismissed as moot.
- 2026-03-09: 8th Cir. reverses; *Havens* filed.
- 2026-03-10: SAVE rule vacated.
- 2026-03-19: ED–Treasury IAA.
- 2026-05-01: RISE final rule.
- 2026-06-30: PSLF employer rule vacated (D.D.C. and D. Mass.).
- 2026-07-01: RISE effective (RAP, Tiered Standard); first SAVE exit notices.
- 2026-07-30: Borrower intervention in the SAVE case denied.
- 2026-08-27: ED appeals the PSLF judgments.
- 2026-09-22: PSLF form attestation removed.
- 2026-09-29: Earliest SAVE exit deadline.
- 2026-10-07: Treasury SORN .033.
- ~2026-10-21: Two PSLF appeals dismissed.
- 2026-10-30: *Weingarten v. McMahon* filed.

**Upcoming**
- **2026-11-23**: *AFT v. ED* status conference (D.D.C.).
- **Nov 2026 – Mar 2027**: SAVE notice waves, 30-day final notices and auto-placements continue.
- **Nov 2026 – 2027 (unconfirmed)**: Treasury private-collector hiring and collections restart; no official date.
- **By 2027-01-31**: 1099-C forms for 2026 discharges, if ED issues them.
- **2027-04-15**: Tax deadline. First returns with taxable IDR forgiveness. Reported target for restarting collections (unconfirmed).
- **2027-07-01**: Second rehabilitation allowed; $10 Direct Loan rehab minimum.
- **Anytime**: dismissal or decision of the states' 1st Cir. PSLF appeal; *Havens* rulings; IAA litigation in D. Mass.
- **2028-06-30 / 07-01**: ICR/PAYE PSLF credit ends and the plans sunset.

---

## Conflicts and unknowns

1. **Collections restart date.** No ED or Treasury document sets one. ED's latest quoted line is "Involuntary collections remain paused" (Yahoo Finance, 2026-10-29). Restart dates in the press ("November 2026," "before April 15, 2027," "2027") are anonymous-source reports or expert guesses. *More authoritative: ED's statement.* The engine should treat AWG and TOP as "paused, can restart with 30-day (AWG) or 65-day (TOP) notice."
2. **Default counts.** FSA Data Center: 9.3 M / $234 B at 2026-06-30 (federally managed). CRS: 7.8 M / $179 B at 2025-12-31. Treasury: "more than 9 million" (March 2026). Debt Discipline: 9.2 M / $180 B (mixes dates). *More authoritative: FSA-DC, dated.*
3. **PSLF employer rule.** The courts vacated the Oct 2025 rule, but **RISE (May 2026) republished §685.219 with the same text**, and the eCFR still shows it. ED treats it as unenforceable: the form attestation was removed "to comply with the court order." Whether the vacatur reaches the RISE-republished text has not been addressed publicly. *Practically: not in force.*
4. **State of the third PSLF appeal.** Inside Higher Ed (2026-10-22): pending. A CollegeLens page updated 2026-11-04 says "appeal pending" (probably stale). I could not confirm a later dismissal.
5. **What SAVE non-choosers get.** NY AG says "will likely be" moved to Standard. CNBC and others say Standard or Tiered Standard depending on loan dates. CRS says "a standard repayment plan." I found no ED primary text. For consolidation loans, "standard" may mean a 10–30-year term, with PSLF consequences.
6. **SAVE notice schedule by servicer.** Only Nelnet's schedule is known (July 2026 – March 2027). MOHELA, Aidvantage, EdFinancial and CRI schedules are unknown.
7. **The 30-day "final notice"** comes from Forbes (2026-10-16), not from ED text.
8. **IDR catch-up payments (§685.209(k)(6)).** They still appear in eCFR but came from the vacated SAVE rule. Whether ED honors them for SAVE-forbearance months is unknown. PSLF buyback is unaffected.
9. **Remaining SAVE borrowers now.** Official data stops at 6.52 M (2026-06-30). ED's "~7.5 M" and Kantrowitz's "6.9 M" are older.
10. **Tiered Standard and PSLF.** ED says it doesn't count. Prong (iii) of the qualifying-plan definition could arguably cover a 10-year Tiered Standard payment. Unresolved.
11. **Treasury "Defaulted Loans Support Center" (2026-09-30).** One blog only; unverified.
12. **RISE "professional degree" stay.** I could not verify that any stay exists.
13. **Bills restoring the tax exclusion or changing RAP.** Not checked; the search budget was exhausted.
14. **State tax treatment.** Only low-quality aggregator lists, which conflict on CA and MN. Check each state's revenue department before shipping state logic.
15. **Community-property states and IDR on MFS.** ED's current handling is unverified.
16. **Exact wording of the 2026-01-16 ED press release.** ed.gov blocked automated access. The quoted fragments come from CRS, CNBC and an ED-domain search snippet.
