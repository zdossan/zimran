# 08f: Student Loan Copilot, competitors and go-to-market

Prepared 2026-11-14 by a skeptical GTM review for Business Cup 2.0 (Zimran).
Scope: the official tool, competitors, ad-platform rules, benchmarks, free channels, LTV/CAC.

**Evidence labels**
- **[V] Verified:** read today (2026-11-14) on the primary source: the page itself, a live tool session, the PDF, or the HTTP response.
- **[S] Secondary:** from a third-party write-up, or a search-result summary we could not open ourselves.
- **[E] Estimate:** our own assumption or inference. Always labeled.

All URLs were accessed 2026-11-14 unless a date says otherwise. Research limits: the WebSearch budget ran out partway through. Similarweb, Business of Apps, Trustpilot and Adjust blocked or rate-limited fetches. Gaps caused by this are marked "n/a" and not filled with guesses.

---

## 0. Bottom line

1. **The free official tool already does most of the "decision" part, with no login.** Our earlier brief (`07-student-loan-idea-explained.md`, section 10) said it "needs a login" and has "no file jointly vs separately comparison". **Both statements are wrong.** The tool has a "Continue Without Logging In" button and a Married Filing Separately option. It also labels plans "Lowest Monthly Payment" and "Lowest Total Paid". [V]
2. **Savi already sells B2C at our price and does more.** Savi Essential costs $75/yr for non-members and $50/yr for AARP members, and Savi files the paperwork for you. Unions and employers are largely taken: NEA, AARP and Union Plus (AFL-CIO) work with Savi, and AFT works with Summer. [V/S]
3. **The only defensible feature is the monthly statement audit, and it is unproven.** No competitor we could verify checks servicer statements against the RAP rules. The candidate checks are: was interest waived, did the principal fall by at least $50, did the PSLF count go up.
4. **Ad platforms will accept an education-and-calculator framing.** They will reject forgiveness promises, dollar-reduction promises, before/after debt figures and anything that looks like the government. Meta and TikTok are likely to force restricted targeting: age 18–65+, no gender, no ZIP code, no lookalikes. Stripe prohibits "offering government services without authorization or value-add". [V]
5. **Base-case unit economics fail a paid-ads-first plan.** Blended LTV is about $85 against a CAC of about $60, so LTV:CAC is about 1.4x and payback takes about 12 months. The earlier $178 LTV assumed 2.5 paid years, and that assumption is not supported by benchmarks. [E, built from benchmarks in section 4]

---

## 1. The official StudentAid.gov tool ("Repayment Calculator", formerly "Loan Simulator")

**Status [V].** `https://studentaid.gov/loan-simulator/` now returns **HTTP 301 → `https://studentaid.gov/repayment-calculator/`** (checked with curl headers on 2026-11-14). The article "Compare Repayment Plans With Our Repayment Calculator" says "(formerly called Loan Simulator)" and is marked **"Published: August 2026"**: https://studentaid.gov/articles/repayment-calculator/

### Capability table

| Question | Answer | Evidence |
|---|---|---|
| Handles **RAP**? | **Yes.** In our guest run (single, AGI $55,000, 0 dependents, Ohio, $40,000 at 6.5%), RAP came out at **$229/mo**, labeled "Lowest Monthly Payment". This matches our own engine's $229. | [V] Live session in Chrome on 2026-11-14, https://studentaid.gov/repayment-calculator/plan-options |
| Handles **Tiered Standard**? | **Yes.** The same run showed Tiered Standard at **$348/mo**, labeled "Lowest Total Paid". | [V] Same session. The article also mentions RAP and Tiered Standard under "Consolidation On". |
| **Married filing separately**? | **Yes.** The Tax Filing Status dropdown offers Single, Married Filing Jointly, **Married Filing Separately**, Head of Household and Qualifying Surviving Spouse. The help text says: "If you're married, your filing status determines if your spouse's income and loans are included." The form also has fields for the spouse's loan balance and interest rate. | [V] Same session. Landing-page accordion and form field names (`fsa_Input_LoanBalance_SpouseInfoModal`). |
| **FSA ID login required**? | **No.** "Get Started" opens a modal with **"Continue Without Logging In"** and "Log In". Guest mode is a single form: filing status, AGI, dependents, other dependents, state, loan balance, average interest rate, and an optional disbursement date. | [V] Same session. The article says: "If you don't log in … you can enter your loan details manually." |
| **Gives recommendations**? | **Partly.** It labels the "Lowest Monthly Payment" and "Lowest Total Paid" plans. The article says it "will show you your recommended plans first". Users can sort by payment, total paid or fastest payoff. Toggles: "PSLF On" and "Consolidation On". Plans retiring by July 1, 2028 are flagged "Plan Ends". | [V] Article (Aug 2026) and live session |
| **Action steps**? | **Minimal.** An "Apply" button leads to the online IDR application. Ineligible plans link to "Learn how you could become eligible". There is no dated plan, no reminders, no deadline tracking, no letter templates and no statement checks. | [V] Article section 7, live session |
| **Guest-mode weakness** | With no disbursement date entered, guest results marked **IBR, Standard, PAYE and ICR "Ineligible"**. They showed only RAP and Tiered Standard, which are the plans for loans made on or after July 1, 2026. A modal warned: "These results only provide a partial picture… If you have existing student loans, logging in will provide more accurate estimates." Entering a 2018 disbursement date did **not** change the output in our session. This may have been a UI refresh problem, so treat it as **not conclusive**. | [V] Observation; interpretation [E] |

### Other official facts useful for the product [V]
- **SAVE transition.** Source: "SAVE Plan Borrowers: FAQs…", published October 2026, https://studentaid.gov/articles/save/
  - Servicers started sending 90-day notices on **July 1, 2026**, and will notify every SAVE borrower "before the end of 2026".
  - A final 30-day notice follows. If the borrower still does nothing, they are auto-enrolled in **Standard**, or in **Tiered Standard** if they have a loan disbursed on or after July 1, 2026.
- **Tiered Standard does not count toward PSLF.** The same FAQ says payments on it "do not count toward PSLF".
- **Autopay discount.** Borrowers "enrolled in auto pay by **Dec. 31, 2026**" get a **1% interest rate reduction through June 30, 2028** (same FAQ). This is a real dated action item for our plan.
- **Free-help warning.** The same FAQ says: *"Help from your federal loan servicer is free. You never have to pay a company to apply for a repayment plan or manage your federal student loans."* The scams article (https://studentaid.gov/articles/scams/) lists "Act now to qualify before the program closes" as a suspicious claim. It also mentions FTC action in **July 2026** against a scheme that took **$45.9M**. **Positioning implication:** a paid product must be clearly *software and analysis*, never a paid enrollment service.

---

## 2. Competitors

Traffic note: Similarweb timed out and refused automated access. Business of Apps and Trustpilot returned 403 or closed the connection. Visit estimates are therefore **n/a**, and company-stated scale is shown instead (company claims, not audited).

| Name | Price | Model | Features | Gaps (vs Copilot) | Traffic / scale |
|---|---|---|---|---|---|
| **StudentAid.gov Repayment Calculator** | Free | Government | RAP, Tiered Standard, IBR/PAYE/ICR, MFS, PSLF and consolidation toggles, IRS income import, Apply button [V] | No dated plan, reminders, letters or statement checks. Guest mode shows "partial picture" results for existing borrowers [V/E] | n/a (government site) |
| **Savi** (bysavi.com) | Free assessment. **Essential $75/yr** (AARP members $50), **Pro $175/yr** (AARP members $150) per AARP page [V]. Esusu page (Aug 13, 2025): $75 / $180 [V]. MMA doc (2025): $70 / $150 [S] | **B2B2C plus direct.** "10,000+ partners". Homepage logos include **NEA, AARP, MetLife, TIAA, UPMC, NACo, Bilt** [V]. **Union Plus** (AFL-CIO, "15 million union members") gives free AI-assistant access (press release May 15, 2025) [V] | "Scanning 150+ forgiveness and repayment plans, estimating savings, automating enrollment, and tracking ongoing updates". Paperwork filing; ">98% of submitted federal student loan applications are accepted"; Loan Sync; AI assistant (also a free lite version in the ChatGPT Store); webinars, chat and phone support [V] | Homepage does not mention RAP or SAVE [V]. No servicer-statement audit found [V, absence]. Claims "$187 avg monthly savings" and "$5B+ savings found" are company claims [V] | ~119–126 Trustpilot reviews (score not retrieved) [S] |
| **Summer** (meetsummer.com) | **$0 to individuals.** "Your employer, city, or organization covers the cost" [V] | **B2B2C only.** "Currently only available through partnerships, like your employer, city, or union." Logos: **AFT**, NYC.gov, City of Akron, City of Alexandria, Asurion, Banc of California, and others [V] | Enrollment in federal and state repayment plans, forgiveness applications, expert access, college-savings advice, employer-contribution tracking [V]. Blog (Apr 1, 2026): RAP likely cheaper for household income under $70K [V] | Not sold direct to consumers, so not a B2C rival. But it owns the AFT and city channel. No statement audit found [V, absence] | "$2.2B+ projected lifetime savings", "$45K avg savings" (company claims) [V] |
| **Student Loan Planner** | **$595 one-time consult**, $495 with the ChooseFI discount [S: SLP page and ChooseFI review updated Sep 10, 2026]. Paid newsletter "SLP Insiders" (price n/a) [V] | B2C service plus affiliate income (refinance bonuses up to $1,250) [V] | Custom plan from CFP/CFA/CSLP professionals; free RAP, IBR and **MFS** calculators; quiz [V/S] | Expensive and one-time. Targets $20K–$1M balances. No ongoing monitoring [V/E] | "24,000+ clients", "16 consultants" [V]. YouTube 23.1K subscribers [V] |
| **TISLA** (The Institute of Student Loan Advisors) | **Free** to consumers [S] | 501(c)(3). Funded by grants, donations and fee-for-service sales to employers, colleges and associations. Example: Washington State Dental Association partnership, Jan 14, 2026 [S] | Email-based 1:1 counseling and dispute resolution [S] | Limited capacity, slow (email), no tool. tisla.com is a parked domain; the real site is freestudentloanadvice.org (not fetched) [V/S] | "Worked with 16,000 individual borrowers" in a year (Marketplace, Jun 13, 2025) [S] |
| **Chipper** | Historically free, with planned tiers of "a few dollars per month" (2020 review) [S] | B2C app | Forgiveness and IDR applications, round-ups [S] | **Likely defunct [E]:** chipper.app does not resolve (DNS ENOTFOUND) and App Store id1334827413 returns 404 [V]. Last news: Oct 2023, "140,000+ customers" [S] | n/a |
| **Candidly** | n/a (enterprise) | **B2B**: employers, 401(k)/403(b) recordkeepers [V] | "Cait" multi-agent AI (Jul 23, 2025) covering IDR, PSLF, consolidation, §127 benefits, 529 plans and SECURE 2.0 student-loan match [V] | Employer channel only. RAP not mentioned in the launch [V] | "$2.3B projected student debt impact in 2025" (Feb 2026) [S] |
| **Payitoff** | n/a | **B2B** API | n/a | payitoff.io now **301-redirects to array.com/products/student-loan-aid** [V]. This suggests it was absorbed into Array, an embedded-finance vendor [E] | n/a |
| **Fynn** | n/a | n/a | n/a | **Not verified.** fynn.com does not resolve, and the search budget was exhausted | n/a |
| **Tate Law** (tateesq.com) free calculators | Free calculators; paid "assessment is a video call with Stanley" (price n/a) [V] | Lead generation for a law firm [V] | IBR vs RAP, RAP vs Tiered Standard, and a RAP calculator for married borrowers that shows **both filing statuses and their tax cost** [V/S] | IBR-vs-RAP tool skips spouse-loan proration and PSLF eligibility. No plan or monitoring [V] | n/a |
| **Student Loan Sherpa** | Free | Content and affiliate | RAP calculator, separate Old IBR and New IBR calculators [S] | Calculators only. The site returned 403 to us | n/a |
| **The College Investor** | Free | Content and affiliate | RAP calculator, several RAP-vs-IBR articles. Says the cheaper plan flips at roughly $80–90K AGI [S] | Calculators and articles only | YouTube ~26.8K subscribers [V] |
| **NerdWallet** | Free | Content and affiliate | Articles on the OBBBA changes [S] | **No RAP calculator found.** The guessed URL returned 404 and search did not surface one [V/S] | n/a |
| **degreecalc.com** | Free | Ads | General college ROI, loan and "Loan Forgiveness" calculators [V] | Not a RAP decision tool [V] | n/a |
| Others ranking for RAP queries | Free | Content | Juno (ibr-rap calculator), SoFi, ChooseFI, fedratecalc, policyrisk, ustax.tools [S] | Calculators only | n/a |
| **AI assistants** | Mixed | Mixed | Savi AI Assistant (May 2025; free via Union Plus; ChatGPT Store lite version) [V]. Candidly Cait (Jul 2025, through employers) [V]. Third-party ChatGPT app "Student loan repayment math" on the Finology engine, launch date unverified [S]. StudentAid.gov has an on-site virtual assistant ("Initiate Chat" button on the calculator page) [V] | **No 2026 B2C AI student-loan launch found** [S, limited search]. The College Investor found ChatGPT recommending the closed SAVE plan [S] | n/a |

### What none of them do (blunt)

These are absences among the tools we could verify. They are not proof that nobody does them.

1. **No statement audit.** Nobody audits monthly servicer statements against plan rules (RAP interest waiver, $50 minimum principal reduction or matching payment, IDR or PSLF count increments). Savi's "ongoing monitoring" means **application status updates** (per the AARP page), not statement math.
2. **No personal deadline calendar.** Nobody turns the borrower's own deadlines into a calendar: the servicer 90-day notice, the 30-day final notice, the autopay 1% discount by Dec 31, 2026, annual recertification, and the July 1, 2028 closure of PAYE/ICR.
3. **No guest-mode legacy-borrower check.** No free, no-login tool reliably checks IBR eligibility for existing (pre-July 2026) borrowers. The official guest mode showed IBR as "Ineligible" in our run, though that observation is not conclusive.

### Differentiation verdict

| Claimed differentiator | Verdict | Why |
|---|---|---|
| No-login decision | **Weak** | The official tool has "Continue Without Logging In" and labels the cheapest plan [V]. |
| MFS toggle | **Weak** | The official tool has MFS [V]. Tate Law shows both filing statuses with the tax cost [S]. SLP has an MFS calculator [S]. |
| Dated action plan | **Weak to moderate** | Real gap in the official tool, but easy to copy. Savi Essential at $75/yr **files the application for you**, which beats a to-do list. |
| Statement error check | **Potentially strong, unproven** | No verified competitor offers it, and it is the only feature that justifies a *recurring* fee. Risks: statement formats differ by servicer; RAP launched only on July 1, 2026, so the error rate is unknown; users must upload monthly. |
| Price ($79/yr) | **Weak** | It is above Savi Essential ($75, or $50 for AARP members) and offers less paperwork help. Comparing it with SLP's $595 is not like-for-like. |

**Overall verdict: weak as a "decision" product, plausible only as a "RAP statement watchdog".** Make the plan comparison the free hook, and make the audit, alerts and dispute letters the paid product. Do not pitch "no login + MFS" to judges as unique: a judge who opens studentaid.gov will see both in 30 seconds.

---

## 3. Ad-platform rules (US)

### Policy table

| Platform | Rule (source, date) | What gets rejected or limited | Source |
|---|---|---|---|
| **Google Ads** | **Debt services.** Debt settlement and debt management ads need certification. In the US they are allowed only from "an approved non-profit budget and credit counseling agency, as defined by 11 U.S. Code § 111". A Debt Services Application is required. Student loans are not named. [V] No dates on page ("©2026") | If reviewers read "lower your student loan payment" as *debt management* (negotiating reduced periodic payments), for-profit ads will be disapproved. Our product does not negotiate with creditors, so the argument is that it is out of scope, but expect manual review [E] | https://support.google.com/adspolicy/answer/15189135 |
| Google Ads | **Financial products and services.** Ads must show the physical address, all fees, and links to accreditation where affiliation is claimed. Credit repair is not allowed. Loan modification: no guaranteed outcomes, no upfront fees (unless provided by a law firm), no discouraging contact with the lender. [V] | Hidden fees, guaranteed results, "we'll talk to your servicer for you" plus upfront fee | https://support.google.com/adspolicy/answer/2464998 |
| Google Ads | **Government documents and official services.** Ads for "direct acquisition" of government documents or services are limited to certified governments and authorized providers. In-scope categories include "health and welfare assistance programs and benefits". Student aid is **not named**. Search ads that appear to target government-document searches get an automatic **"Not a government website"** label. [V] | Bidding on or ad copy that implies obtaining a government service ("Apply for IDR here", "FSA ID help", "studentaid" keywords) risks restriction or disapproval [E] | https://support.google.com/adspolicy/answer/13156083 |
| Google Ads | **Financial services verification.** The page's country list does not include the US (as fetched), so it is apparently not required for US targeting today. [V, absence] | n/a for the US today. Re-check before launch | https://support.google.com/adspolicy/answer/15332527 |
| Google Ads | **Misrepresentation.** No "make it seem like you're supported by another brand, organization or government entity when you're not". No "claims that entice the user with an improbable result". [V] | Seals, "official", "federal program update", "forgiveness guaranteed" | https://support.google.com/adspolicy/answer/6020955 |
| **Meta** | **Special Ad Category "Financial products and services".** Required for US financial-products campaigns from **Jan 14, 2025** (the page also says Jan 21). Age is "generally fixed to include ages 18 through 65+". Gender "cannot be chosen". Minimum 15-mile radius, **no ZIP codes**, no location exclusion. No behavior or demographic targeting, no detailed-targeting exclusions, interests only from an approved list. **"Lookalike audiences are unavailable."** [V] Covers credit offers plus "banking, investment, insurance, and more" (Jon Loomer, modified Mar 1, 2025) [S] | Whether a student-loan *software* product must declare the category is a judgment call. Assume **yes**: Meta can force it, and undeclared ads get rejected [E]. Result: no targeting of "parents", "teachers aged 25–40" or similar audiences | https://developers.facebook.com/docs/marketing-api/audiences/special-ad-category ; https://www.jonloomer.com/special-ad-categories-meta-ads/ |
| Meta | **Ad Standards: Financial and Insurance Products and Services** (change log latest Oct 29, 2026). Target 18+. No requests for PII or financial info. Licensing may be required. **Prohibited:** "misleading content related to student loan consolidation, forgiveness, or refinancing", meaning "deceptive practices, such as overstating the benefits to the user". **Exempt:** "Education or skill-building content about applying for or managing loans". [V] | "Get your loans forgiven", overstated savings, hidden subscription terms | https://transparency.meta.com/policies/ad-standards/restricted-goods-services/financial-services/ |
| Meta | **Prohibited Financial Products and Services:** "Student loan consolidation, forgiveness or refinancing services that use deceptive practices… overstating the benefits to the user or not disclosing terms upfront". [V] | Same as above, plus a paywall price that is not disclosed upfront | https://transparency.meta.com/policies/ad-standards/deceptive-content/prohibited-financial-products-and-services/ |
| Meta | **Community Standards: Fraud and scams / Prohibited commercial practices** (change log Oct 29, 2026). Bans "Promises to eliminate or reduce debt by a particular amount in a set period of time", "Promises to stop all debt collections or lawsuits", "False offers of money from government grants or programs", and recruiting while "impersonating a government entity". [V] | "Cut your payment by $300 in 60 seconds", "Stop wage garnishment", "Claim your federal relief" | https://transparency.meta.com/policies/community-standards/fraud-and-scams/ ; https://transparency.meta.com/policies/community-standards/prohibited-commercial-practices/ |
| Meta | **Personal attributes:** "ads must not contain content that asserts or implies personal attributes", including "vulnerable financial status". Lead ads must not ask "how much debt someone has" without permission. [V] | "Are *you* drowning in student debt?", "*Your* SAVE plan is ending", lead forms asking for the balance | https://transparency.meta.com/policies/ad-standards/deceptive-content/ |
| **TikTok** | **Financial services, US** ("Last updated: September 2026"). Allowed if the advertiser complies with law and disclosures, is "licensed by local and regional authorities", and targets 18+. **Prohibited:** credit repair, get-rich-quick schemes, payday loans and others. Debt relief and student loans are **not addressed** for the US. [V] | Credit-repair framing. Possible licensing questions for "debt" products [E] | https://ads.tiktok.com/help/article/tiktok-ads-policy-financial-services |
| TikTok | **Housing, Employment, Credit (HEC)** ("Last updated: April 2026"). Credit explicitly includes "educational loans". Age, gender, ZIP code and **marital or parental status** "cannot target audiences". Advertisers self-declare with the Special Ad Category toggle. [V] | If classified as HEC: no targeting of parents or married people, even though family status drives our RAP-vs-IBR answer | https://ads.tiktok.com/resources/help/article/housing-employment-credit-hec-ad-policy?lang=en |
| TikTok | **Misleading and false content** ("Last updated: November 2026"). Ads "must not promise or exaggerate results". Before-and-after comparisons are prohibited where they distort results. Example of a disallowed financial claim: "Get money in 10 seconds". No false endorsements. [V] | Before/after balances, "instant" savings, fake government endorsement | https://ads.tiktok.com/help/article/tiktok-ads-policy-misleading-and-false-content |
| **Stripe** (paywall) | **Restricted businesses** (updated 2026-09-22). Prohibited: "Debt settlement, debt negotiation, and debt consolidation"; "credit repair, and counseling services"; "**Offering government services without authorization or value-add**"; "Offering government services with misleading claims". [V] | A product that looks like "pay us to apply for your IDR plan" risks Stripe account closure. Keep it clearly value-add analysis software [E] | https://stripe.com/legal/restricted-businesses |

### Creative claims likely rejected (all platforms) [E, mapped to rules above]
- "Get your student loans **forgiven**" / "You qualify for forgiveness" (Meta misleading forgiveness; Google improbable result; StudentAid scam list).
- "**Cut your payment by $X** in 60 seconds" / "Save $38,000" as a promise (Meta "reduce debt by a particular amount in a set period"; TikTok exaggerated results).
- **Before/after debt figures** ("$48,000 → $0", "$612/mo → $129/mo" without an "example" label and assumptions) (TikTok before/after; Meta overstating benefits).
- **Government look:** eagle or seal, "Federal Student Aid", "Dept. of Education notice", "Official SAVE update", red-white-blue letter mockups, "studentaid" in the display URL or keywords (Google Misrepresentation and Government-docs; Meta impersonation).
- **Fake urgency** copied from scam lists: "Act now before the program closes", "Your account is flagged", "Pre-approved for relief" (StudentAid scams article).
- "**Stop wage garnishment / collections**" (Meta "stop all debt collections").
- "**Are you behind / in default?**" second-person assertions (Meta personal attributes).
- Lead forms or landing pages asking for **FSA ID credentials** or a **debt amount** before consent (Meta; StudentAid "never share your StudentAid.gov username or password").
- "We **enroll** you in RAP for $79" (Stripe value-add rule; StudentAid "you never have to pay a company to apply").

### What is likely allowed [E]
- Education plus calculator framing: "SAVE is closing. See whether RAP or IBR costs less for your situation. Free estimate in 60 seconds."
- Hypothetical, labeled examples: "Example: single, $55K income, $40K loan → RAP $229/mo vs Tiered Standard $348/mo (estimate)". These match the official tool's output today [V].
- Clear disclosures on the ad and landing page: "Not affiliated with the U.S. Department of Education. Applying for repayment plans is free at StudentAid.gov. Copilot is $79/yr analysis software."
- Factual deadlines without fear: "Servicers are sending 90-day plan-choice notices through end of 2026" [V source above].
- Feature-led: "Upload your servicer statement and check that the RAP interest waiver was applied."

---

## 4. Benchmarks

| Metric | Value | Source (date) | Label |
|---|---|---|---|
| Finance category reporting | RevenueCat buckets **Finance into "Utilities"** ("Weather, Reference, Utilities, Finance, Tools") and gives no Finance-only numbers | RevenueCat SOSA 2026 Utilities page (images dated Mar 2026; 2025 data), https://www.revenuecat.com/state-of-subscription-apps-2026-utilities/ | V |
| Download → trial (D30) | Utilities **6.5%**, Business 9.1%, North America 7.1% | SOSA 2026, https://www.revenuecat.com/state-of-subscription-apps-2026/ | V |
| Trial → paid | North America **34.2%**. By trial length: ≤4 days 25.5%, 5–9 days 37.4%, 17–32 days 42.5%. Utilities: "wide variance", no median | SOSA 2026 (as above) | V |
| Download → paid (D35) | Hard paywall **10.7%** vs freemium 2.1% (insights page: 11% vs 2%) | SOSA 2026; https://www.revenuecat.com/sosa-26-insights | V |
| Realized LTV per payer, year 1 | Global median **$23** (top quartile $44); North America **$32**; Business $35.48 | SOSA 2026 | V |
| Year-1 retention, all plans | Low-priced apps **36%**, high-priced **23%** | sosa-26-insights | V |
| Annual plans | "Active renewal" **83.4%** overall. **First annual renewal median 23–40% by category** (Productivity 23%, Business 40%). Second renewal 44–64%, third 56–70%. Year-1 retention, annual plans: 31% → **28%** (2023→2024 cohorts). 35% of all annual cancellations happen in month 1 | SOSA 2026 part 2 (~May 2026), https://www.revenuecat.com/sosa-2026-insights-part-2 | V (definitions of "active renewal" vs "first renewal" differ) |
| Monthly plans | Active renewal **39.2%**. First renewals (weekly/monthly) 53–61%. Year-1 retention **8%** (2024 cohort). Monthly-plan retention: 10.8% for low-priced apps vs 6.1% for high-priced | SOSA 2026 part 2; sosa-26-insights | V |
| Trial cancellations on day 0 | 3-day trials 55.4%, 7-day 39.8% | SOSA 2026 part 2 | V |
| Refund rates (app stores) | Education 4.86%, Health & Fitness 4.71%, Business/Gaming 2.67–2.88%, Travel 1.51%. **Hard paywall 5.8%** vs freemium 3.4%. Commentary: "2 to 5% of payers" | SOSA 2025 (~Mar 2025), https://www.revenuecat.com/state-of-subscription-apps-2025/ | V |
| Web share of revenue | 3.2% global, 4.9% North America | SOSA 2026 | V |
| **Web quiz funnel** | **13% of users reach the paywall**; **3% of sessions purchase** (implied paywall conversion about 23%). Web funnel 3.0% vs in-app funnel 1.5% | FunnelFox *State of Web2App 2026* (Jan 2026, 2025 data), https://funnelfox.com/state-of-web2app/ | V (vendor data, unaudited) |
| Quiz first-screen drop | Only 47.5% reach screen 2 | FunnelFox blog, https://blog.funnelfox.com/onboarding-funnel-optimization/ | V (vendor) |
| Web refunds | About 92% of refunds happen in month 1; median refund 1.6 days after purchase; **annual plans refund about 18× more than weekly** | FunnelFox State of Web2App 2026 | V |
| Web payment failures | 30–50% of initiated payments fail; retries recover up to 17.5% | FunnelFox State of Web2App 2026 | V |
| Web LTV | Blended median about **$67** by month 12 | FunnelFox State of Web2App 2026 | V |
| Web revenue by offer | No-trial 56.8%, paid trial 28.9%, free trial 14.3% | FunnelFox State of Web2App 2026 | V |
| Finance CPI | 2022: **$2.33**. 2021: CPI $2.45, cost per registration **$7.96** | Liftoff Finance Apps Reports 2021/2022 (via search) | S (dated) |
| Finance CPI 2025 | Global $1.13 (from $1.51). North America **$2.92** (from $7.03 in 2024) | Adjust *Finance App Insights 2025* (via search; page returned 429) | S |
| Fintech CPI / CPA ranges | Fintech CPI iOS $10–35, Android $5–15; fintech CPA $8–12. Subscription apps: "fully loaded CAC typically 2–3x the CPI". Fintech payback 6–24 months | Adapty CAC blog (modified 2026-02-06), https://adapty.io/blog/customer-acquisition-cost/ | S (aggregated, no per-number source) |
| Meta finance CPI, US | $8.32 | superads.ai (date ranges inconsistent) | S, low confidence |
| Cost per subscriber | About $158–161 (install→subscription 1.4–2.7%) | Liftoff subscription-app analysis, year unverified (via search) | S, low confidence |

**Gap:** we found no verified 2025–2026 benchmark for **CPC or cost per quiz-start on student-loan or finance web funnels**. The CPC used in section 6 is an **assumption** [E].

---

## 5. Free channels

### SEO
- **"RAP vs IBR"** (WebSearch tool snapshot, 2026-11-14; the engine is not specified and may differ from Google) [S]. Ranking pages:
  - Tate Law (calculator plus article)
  - The College Investor (4+ URLs)
  - Student Loan Sherpa
  - Student Loan Planner
  - SoFi
  - Juno
  - ChooseFI
  - Gerald
  - ustax.tools
  - davemanuel.com
- **"SAVE plan ending what to do"** (same snapshot) [S]:
  - News: WTOP, BestColleges, The Week/Yahoo, Spectrum, Civic Media.
  - Nonprofits: Student Loan Borrower Assistance (NCLC), Protect Borrowers.
  - Commercial: **Summer**, Bright Horizons, MoneyLion, NerdWallet, LendKey, Tuition.io, CollegeAve.
- **Verdict [E]:** the head terms are saturated by high-authority, already-indexed incumbents. A new domain will not rank for them before the SAVE wave peaks (all notices go out by end of 2026). The realistic SEO plays are long-tail and programmatic:
  - "RAP vs IBR married filing separately"
  - "RAP payment with 2 kids $60k"
  - "auto-enrolled Tiered Standard what now"
  - "RAP interest not waived on statement"
  - "Aidvantage/Nelnet/MOHELA RAP statement wrong"
  
  These need 6–12 months to pay off. That makes SEO a year-2 channel, not a hackathon-to-launch channel.

### Unions (largely taken)

| Organization | Partner | Evidence |
|---|---|---|
| **NEA** (teachers) | Savi | Savi homepage logo [V]; Savi press release May 15, 2025 lists "MetLife, AARP, NEA, TIAA" [V] |
| **AFT** (teachers) | Summer | Summer homepage logo [V] |
| **Union Plus** (founded by the AFL-CIO, "15 million union members") | Savi | Free Savi AI access for members (press release, May 15, 2025) [V] |
| **AARP** | Savi | Co-branded pricing page [V] |
| Nurses' unions (National Nurses United, NUHW) | No Savi or Summer partnership found [S, absence] | Kaiser/NUHW negotiated a loan-repayment benefit (listed at $30,000) run by **Scholarship America** [S]. In Aug 2026, NNU, AFT, AFSCME and the AFL-CIO sued the Department of Education over graduate loan caps (the RISE rule) [S]. Opening [E]: nurses' locals are not visibly locked up, but they buy *benefits*, not $79 subscriptions. |

### Employers: IRC §127
- **P.L. 119-21 (OBBBA) made the §127 tax-free student-loan-payment exclusion permanent.** It removed the Dec 31, 2025 sunset and indexes the $5,250 limit for inflation after 2026. Sources: Mercer, Aug 12, 2025, https://www.mercer.com/en-us/insights/law-and-policy/obbba-makes-tax-free-student-loan-reimbursements-permanent/ [S]. The provision is reportedly §70412 of the Act [S].
- **2027 indexed limit: $5,400** (IRS Rev. Proc. 2026-35, §3.17: "For taxable years beginning in 2027, the amount that can be excluded … under § 127(a) for educational assistance is $5,400.") https://www.irs.gov/pub/irs-drop/rp-26-35.pdf [V]. The cap is shared with tuition assistance [S].
- **Implication [E]:** this creates a durable employer *payment* benefit. The vendors that capture it are Savi, Summer, Candidly and Bright Horizons EdAssist, which offer contribution administration, retirement matching and paperwork filing. Gusto's help center also has a Savi integration article [S]. A $79 consumer app is not what an HR buyer purchases. For us this is year 2+, needing a B2B2C wrapper ("free for your employees, $X per employee per month").

### Creators
YouTube subscriber counts, read from the channel pages on 2026-11-14 [V]:
- Debt Free Millennials: **117K**
- The College Investor: about **26.8K**
- Student Loan Planner: **23.1K**

TikTok follower counts were not verified: the search budget was exhausted and TikTok was not fetched.

"Paying off debt has become a content category" (Ypulse, Feb 10, 2026) [S].

**Implication [E]:** the student-loan *advice* creators are small, credibility-sensitive (they promote free tools and the official tool) and often affiliated with competitors (SLP, Tate Law). Expect them to recommend the free official tool unless the statement audit is genuinely novel. Paid creator whitelisting (Spark Ads, Meta partnership ads) will still be subject to the special-category limits in section 3.

---

## 6. LTV/CAC (math shown)

### Inputs

| Input | Best | Base | Worst | Basis |
|---|---|---|---|---|
| Annual price | $79 | $79 | $79 | Plan |
| Monthly price | $9 | $9 | $9 | Plan |
| Annual share of buyers | 80% | 70% | 50% | [E] |
| Payment fees | 2.9% + $0.30 → **$2.59** on $79, **$0.56** on $9 | same | same | Stripe standard US card pricing [E, not re-verified today] |
| COGS (LLM statement checks plus hosting) | $2/yr or $0.17/mo | same | same | [E] |
| Year-1 refunds | 4% | **6%** | 10% | Hard paywall 5.8% (SOSA 2025). Web annual plans refund the most (FunnelFox) |
| Annual first renewal (r1) | 40% | **25%** | 15% | SOSA 2026 first annual renewal 23–40% by category; Year-1 annual retention 28%. Base is set below the median because the plan *decision* is a one-off need [E] |
| Later annual renewals | 64/70/70% | 55/63/65% | 44/56/56% | SOSA 2026 second renewal 44–64%, third 56–70% |
| Monthly: first renewal, then monthly retention | 61%, then 85% | **55%, then 80%** | 45%, then 75% | SOSA first renewals 53–61%. Implied month-12 retention 12% / **5.9%** / 2.5%, against benchmarks of 6.1–10.8% and 8% |
| CPC to the quiz | $1.00 | **$1.50** | $2.50 | **[E] assumption, not benchmarked** |
| Session → purchase | 4.0% | **2.5%** | 1.5% | FunnelFox average 3% [V]. Base is lower because the finance price point and trust deficit hurt conversion [E] |

### Formulas
- **Annual year-1 contribution** = 79 − 2.59 − (refund × 79) − 2. Base: 79 − 2.59 − 4.74 − 2 = **$69.67**.
- **Annual LTV** (5-year horizon) = Y1 + Σ survivalₖ × renewal contribution. Renewal contribution = 79 − 2.59 − 0.79 (1% refund) − 2 = $73.62. Base expected paid years = 1 + 0.25 + 0.25×0.55 + 0.25×0.55×0.63 + 0.25×0.55×0.63×0.65 = **1.53**, giving **$109**.
- **Monthly LTV** = net₍ₘ₎ × [(1 − refund) + Σ survival]. net₍ₘ₎ = 9 − 0.56 − 0.17 = $8.27. Base expected paid months ≈ **3.7**, giving **$31**.
- **Blended LTV** = mix × annual + (1 − mix) × monthly. Base: 0.7 × 109 + 0.3 × 31 = **$85**.
- **CAC** = CPC ÷ (session → purchase). Base: 1.50 ÷ 0.025 = **$60**.

### Results (computed by a script)

| Case | Blended LTV (5 yr) | 12-month LTV | Day-0 cash per payer | CAC | LTV:CAC | Payback |
|---|---|---|---|---|---|---|
| **Best** | $122 | $64 | $59 | $25 | **4.9x** | Immediate (day 0) |
| **Base** | **$85** | **$57** | $51 | **$60** | **1.4x** | **About month 12** (needs the first annual renewals) |
| **Worst** | $54 | $44 | $37 | $167 | **0.3x** | Never |

Gross margin ≈ (79 − 2.59 − 2) / 79 = **94% before refunds, about 88% after 6% refunds** [E].

Sanity check: our base 12-month LTV of $57 sits between the RevenueCat North America year-1 RLTV per payer ($32, apps) and the FunnelFox web median ($67 at month 12) [V]. The earlier claim of "$178 LTV = $79 × 2.5 years × 90%" needs **2.5 paid years**. Benchmarks show a median annual-plan year-1 retention of about 28%, which implies about 1.5 paid years [V/E].

### What has to be true for paid ads to work [E]
- A 3:1 LTV:CAC at base LTV needs **CAC ≤ $28**. At a $1.50 CPC that means **≥5.4% session-to-purchase**, almost 2× FunnelFox's average. Alternatively, CPC must be ≤ $0.71 at 2.5% conversion.
- Levers:
  1. Raise annual-plan renewal above about 40% by making the monthly statement audit habit-forming. This is the decisive variable.
  2. Raise price or add tiers: $129–149/yr "Pro" with dispute letters and an MFS tax analysis.
  3. Add a one-time "Plan + letters" product ($39–49) that does not depend on renewal.
  4. In year 2, move to B2B2C (employers, credit unions, nurses' locals) with near-zero CAC.
- **Pitch framing for Zimran judges:** the paid-social funnel is viable **only** in the best case. Present the base case honestly (1.4x) and show the audit-retention lever as the experiment that moves it.

---

## Source list (primary unless marked)
- StudentAid.gov: https://studentaid.gov/articles/repayment-calculator/ (Aug 2026) · https://studentaid.gov/repayment-calculator/ (live session 2026-11-14) · https://studentaid.gov/articles/save/ (Oct 2026) · https://studentaid.gov/articles/scams/
- Savi: https://www.bysavi.com/ · https://www.bysavi.com/borrowers · AARP offer https://www.aarp.org/money/personal-finance/student-loan/ · Esusu https://esusurent.com/blog/esusu-and-savi/ (Aug 13, 2025) · press release https://www.silicon.co.uk/press-release/savi-launches-the-first-at-scale-student-loan-ai-assistant-giving-relief-to-millions-of-borrowers (May 15, 2025)
- Summer: https://www.meetsummer.com/ · https://www.meetsummer.com/for-individuals · https://www.meetsummer.com/post/the-save-plan-is-ending-what-you-need-to-do-next (Apr 1, 2026)
- Student Loan Planner: https://www.studentloanplanner.com/ · pricing via https://choosefi.com/review/student-loan-planner [S]
- TISLA [S]: https://www.wsda.org/news/blog/2026/01/14/wsda-partners-with-tisla-for-free-student-loan-counseling---education · https://www.marketplace.org/story/2025/06/13/one-womans-quest-to-offer-free-student-loan-advice
- Chipper [S]: https://www.moneycrashers.com/chipper-app-review/ · Candidly: https://getcandidly.com/candidly-introduces-cait-multi-agent-ai-assistant-delivers-comprehensive-financial-guidance-for-student-debt-and-college-planning/ (Jul 23, 2025)
- Tate Law: https://www.tateesq.com/calculator/ibr-vs-rap · https://go.tateesq.com/calculators/rap-married/ [S]
- Google Ads: answers 15189135, 2464998, 13156083, 15332527, 6020955, 6368711 (support.google.com/adspolicy/answer/…)
- Meta: transparency.meta.com pages listed in section 3 · https://developers.facebook.com/docs/marketing-api/audiences/special-ad-category
- TikTok: ads.tiktok.com pages listed in section 3
- Stripe: https://stripe.com/legal/restricted-businesses (updated 2026-09-22)
- RevenueCat: https://www.revenuecat.com/state-of-subscription-apps-2026/ · …-2026-utilities/ · /sosa-26-insights · /sosa-2026-insights-part-2 · /state-of-subscription-apps-2025/
- FunnelFox: https://funnelfox.com/state-of-web2app/ · https://blog.funnelfox.com/onboarding-funnel-optimization/
- Adapty: https://adapty.io/blog/customer-acquisition-cost/ [S] · Liftoff and Adjust via search [S]
- IRS: https://www.irs.gov/pub/irs-drop/rp-26-35.pdf · Mercer (Aug 12, 2025) [S]
- YouTube channel pages: youtube.com/@StudentLoanPlanner, /@thecollegeinvestor, /@debtfreemillennials
