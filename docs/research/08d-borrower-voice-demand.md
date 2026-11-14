# 08d — Borrower voice, triggers, willingness to pay, search demand

**Product:** Student Loan Copilot (B2C web app for US federal student-loan borrowers: cheapest plan RAP vs IBR vs Standard/Tiered Standard, dated action plan, servicer-statement checks; no login; $79/yr)
**Research date:** 2026-11-14 · **Method:** desk research only (no US interviews possible)
**Quote rule:** every quote below is copied verbatim from the source. "/" marks a line break in the original, and "…" marks where I cut the quote short. I did not paraphrase anything inside quotation marks. Reddit items are labelled **snippet**: they are search-engine excerpts that I could not open and check against the page.

---

## 0. Source status (what worked, what did not)

| Source | Status | What I got |
|---|---|---|
| **Bluesky public search API** (`api.bsky.app/xrpc/app.bsky.feed.searchPosts`) | Worked. This replaced Reddit as the main source of borrower posts. | 1,462 posts since 2025-07-01 across 16 queries. 510 are first-person and on topic. Most quotes below come from here. |
| Reddit (direct, via mirrors, and `allowed_domains:reddit.com` in WebSearch) | **Blocked** | Direct fetches and mirror fetches were denied, and WebSearch rejects reddit.com as a domain. I have 2 r/PSLF snippets, taken from search summaries. |
| Apple App Store review RSS | Worked for MOHELA (id 1082597420, 500 reviews from 2018 to 2026-09) | Nelnet, Aidvantage, Edfinancial and CRI have **no US App Store app**. The MOHELA app is effectively abandoned: reviewers say it "only support[s] the website". Chipper (id 1334827413) **no longer resolves** on the App Store. |
| Hacker News (Algolia API) | Worked, but thin | 2 usable comments. HN is not where borrowers talk. |
| CFPB complaint API | Counts available, **no narratives** | `complaint_what_happened` is missing from every record I tested (2019 to 2026). The API rejects the field as "not a valid choice", and the CSV export has no narrative column. So: **zero CFPB quotes, but strong volume data** (§2). |
| Trustpilot (servicers, Savi, Summer, Chipper, SLP) | **Unreachable** (socket closed / timeout) | I collected no Trustpilot reviews. |
| YouTube / TikTok comments | Not reachable (needs an API key or login) | None. |
| Google Trends | **HTTP 429** | Not obtained. I used Wikipedia pageviews as a weak timing proxy (§6). |
| Keyword volumes | seodata.dev (says it serves Google Ads API monthly averages for the US) | Volumes for all requested terms, labelled as estimates (§6). |
| WebSearch | 17 of the 25 allowed calls used | Used for FTC, policy and pricing facts, and the seodata pointer. |

---

## 1. Pain map

### 1a. At a glance

| Theme | Severity (1–5) | Why this score | Best quote (verbatim) |
|---|---|---|---|
| SAVE ending / notice letters | **5** | About 7M borrowers had to leave SAVE: 90-day notices from 2026-07-01, then a final 30-day notice, then automatic placement on Standard/Tiered Standard. Notices arrived in waves, or not at all. | "I had a bit of a panic attack after checking my mail and seeing a nastygram from my student loan servicer." ([Bluesky, 2026-10-06](https://bsky.app/profile/darkrose.bsky.social/post/3mxa2oq7o3s2u)) |
| Servicer errors & unresponsiveness | **5** | 16,470 CFPB federal-servicing complaints in 12 months. "Received bad information about your loan" alone accounts for 26% of them. Borrowers report 1–3+ hour holds and wrong bills. | "Everytime I’ve called EdFinancial Services in the last month, the call is DROPPED AFTER 2 HOURS ON HOLD!" ([Bluesky, 2026-09-04](https://bsky.app/profile/madmaymermaid.bsky.social/post/3muo3qx37xk2e)) |
| Payment shock | **5** | SAVE to RAP/IBR doubles or triples payments. CAP's modelled average is +$2,163/yr. Several posts report $1,200–$1,500/mo. | "my student loan payment DOUBLED to $1500 a month. Do I pay for stupidly expensive daycare or do I pay my loan?" ([Bluesky, 2026-11-01](https://bsky.app/profile/msbishop.bsky.social/post/3mzb2exs5bk2c)) |
| Confusion choosing a plan (RAP vs IBR) | **4** | The choice can be irreversible: IBR→RAP is one-way, and RAP forgiveness takes 30 years versus 20/25 for IBR. Borrowers trade monthly cost against total years with no tool to compare them. | "I love that my student loan company didn't tell me I qualified for an IBR until 28 days before it kicked in and I'd already applied for a RAP" ([Bluesky, 2026-08-19](https://bsky.app/profile/loser-girl-dot-net.bsky.social/post/3mtgt26ldgs2b)) |
| PSLF counts wrong | **4** | Each case is high-stakes (tens of thousands of dollars). About 90,000 buyback applications are stuck (AFT lawsuit, 2026-10-30). Counts disappear and reappear. | "13 months of my loan payment counts has disappeared from my PSLF repayment count on the fed website." ([Bluesky, 2026-08-10](https://bsky.app/profile/stinah.bsky.social/post/3msqj32nnuc2c)) |
| Default & collections fear | **4** | About 10M borrowers are in default (news reports). Involuntary collections were paused 2026-01-16. Reports from Oct 2026 say private debt collectors will be brought in after the midterms. Some borrowers are flagged "in default" by mistake. | "the DoE says my loans are in default and $8k behind, even though I'm perfectly current with my servicer." ([Bluesky, 2025-12-10](https://bsky.app/profile/mpbmke.com/post/3m7lvto5us22h)) |
| Distrust & scams | **3** (but critical for go-to-market) | Real servicer outreach looks like a scam, and scams look like servicers. FTC cases show $8.8M–$45.9M taken per operation. A paid third-party tool starts out distrusted. | "i thought it was a scam but i submitted an application to switch to one of the new student loan repayment plans" ([Bluesky, 2026-09-05](https://bsky.app/profile/veilofbeing.bsky.social/post/3muqkyfzaps2i)) |

### 1b. Quotes by theme

#### A. Confusion choosing a plan (RAP vs IBR) — severity 4

| # | Verbatim quote | Source | Date |
|---|---|---|---|
| A1 | "The IBR is $164 more a month than RAP but RAP adds 10 more years to my payment plan. I am broke & want to save the money today, but I don't want to pay for forever either 😭" | [Bluesky](https://bsky.app/profile/bexcommunicated.bsky.social/post/3mu5oaz4vzk22) | 2026-08-28 |
| A2 | "I love that my student loan company didn't tell me I qualified for an IBR until 28 days before it kicked in and I'd already applied for a RAP" | [Bluesky](https://bsky.app/profile/loser-girl-dot-net.bsky.social/post/3mtgt26ldgs2b) | 2026-08-19 |
| A3 | "Is there someone who can explain to be what is going on with student loans and pslf like I am a toddler?" | [Bluesky](https://bsky.app/profile/kyt-thatsme.bsky.social/post/3munqx52ofk2y) | 2026-09-04 |
| A4 | "Talked to Aidvantage today-the 90-day window supersedes deferment I had under SAVE, so I must switch to RAP before Nov. (more than doubles my stulo payment) and start paying in Dec. instead of next July." | [Bluesky](https://bsky.app/profile/generalmusician.bsky.social/post/3mu5im6hyt224) | 2026-08-28 |
| A5 | "Submitted it and my servicer says my payment is more than double what the site said. I called and they said there is a known issue with the online application..." | [Bluesky](https://bsky.app/profile/tomahawkd70.bsky.social/post/3mpad6qdyi22s) | 2026-06-27 |
| A6 | "Nelnet giving me a cheaper cost on my student loan than the studentaid.gov site when I called them." | [Bluesky](https://bsky.app/profile/hausofbawdy.blacksky.app/post/3myktlzwmjk2l) | 2026-10-23 |
| A7 | "The RAP is the only one that can be used for PSLF. My estimated payment on that one is $1500/month." *(a borrower misconception: IBR and the 10-year Standard plan also qualify for PSLF)* | [Bluesky](https://bsky.app/profile/absp.bsky.social/post/3mpx6orhc4c24) | 2026-07-06 |

What this shows: borrowers get **conflicting numbers** from the servicer, from StudentAid.gov, and from the confirmation they receive after applying (A5, A6). They also lack a frame for **monthly cost vs total years** (A1, A2). Product fit: a side-by-side of total cost and years, plus "what you'll see on your next bill", answers the exact question they are asking.

#### B. SAVE ending / notice letters — severity 5

| # | Verbatim quote | Source | Date |
|---|---|---|---|
| B1 | "I had a bit of a panic attack after checking my mail and seeing a nastygram from my student loan servicer." | [Bluesky](https://bsky.app/profile/darkrose.bsky.social/post/3mxa2oq7o3s2u) | 2026-10-06 |
| B2 | "I had a SAVE plan, have thought I'd be on a new plan out paying again at some point, and honestly I have no idea when that's actually supposed to start" | [Bluesky](https://bsky.app/profile/handandler.bsky.social/post/3myala23bfs23) (23 likes) | 2026-10-19 |
| B3 | "Today was the first 90 day deadline for borrowers to get off of SAVE and surprise surprise it’s chaos and several servicers are pushing that date back by 30 days. / I still haven’t received my 90 day notice from NelNet (they are all sending them out in waves)." | [Bluesky](https://bsky.app/profile/findingtangle.bsky.social/post/3mwrj76msys2i) | 2026-09-30 |
| B4 | "In July I kept waiting for my servicer to send me the 90 day change notice, but it didn't come." | [Bluesky](https://bsky.app/profile/girlmeetsbrass.bsky.social/post/3mwexyz6vlk22) | 2026-09-25 |
| B5 | "aidvantage trying to bully me into changing off of the SAVE plan and then the entire rest of the email is that I really don't have to do anything for ~45 more days" | [Bluesky](https://bsky.app/profile/littlelistmaker.bsky.social/post/3mxzk4ak3p22b) | 2026-10-16 |
| B6 | "Just realized I've been playing chicken with Nelnet. … they've been begging me to pick a new one... and I've been ignoring them." | [Bluesky](https://bsky.app/profile/rubyffxiv.bsky.social/post/3mwmxhhj7gs2h) | 2026-09-29 |
| B7 | "So I got my "third notice" that I need to move off the SAVE plan - isn't it still under litigation? … Does anyone have any clear resources that can help? I am an SDEA/NEA member." | [Bluesky](https://bsky.app/profile/learnforalifetime.com/post/3mpjt2pt3os2r) | 2026-06-30 |

What this shows: the letter causes panic (B1), while vague, staggered and contradictory deadlines cause paralysis and avoidance (B2–B6). The real need is "**what is MY date and what do I do before it**", which maps directly to the product's dated action plan.

#### C. Servicer errors and unresponsiveness — severity 5

| # | Verbatim quote | Source | Date |
|---|---|---|---|
| C1 | "I called for assistance on several occasions and they put you on a wait for over 3 plus hours then hang up on you. No problem sending bills you can’t pay but also won’t communicate!" | [App Store review, MOHELA app](https://apps.apple.com/us/app/mohela/id1082597420) (★1, "This company is trash") | 2026-07-07 |
| C2 | "Log in and my payment is 5 times what was quoted!!! They had put me on the standard repayment plan! I called my servicer and they confirmed it was an error, but now my heart is in my throat!" | [Bluesky](https://bsky.app/profile/nakatomiplaza.bsky.social/post/3mw4f3g7bkc2l) | 2026-09-22 |
| C3 | "mohela just put my accounts back into in-school deferment that i very much took out of it ON PURPOSE / my reward? an hour+ on hold to get someone able to undo that." | [Bluesky](https://bsky.app/profile/robbinsa.me/post/3mwei7wqb5c2y) | 2026-09-25 |
| C4 | "The Dept of Ed and Aidvantage again have no idea how much I actually owe them, this time in the wake of the SAVE decision. / My amount and theirs differ by literally $400. Their math is wrong." | [Bluesky](https://bsky.app/profile/rickiep00h.bsky.social/post/3mttp3sml2c2i) | 2026-08-24 |
| C5 | "First email I saw this morning was from my student loan servicer, with my bill for Nov. Which was suddenly $900 more than it should be." | [Bluesky](https://bsky.app/profile/brynna42.bsky.social/post/3mz6mkhwslk2g) | 2026-10-31 |
| C6 | "Me: 2 months for EdFinancial to process payment plan change, still haven't processed my autopay request. / Husband: 3 months and Mohela has not processed the payment plan change request, can't enroll in autopay." | [Bluesky](https://bsky.app/profile/astronomay.bsky.social/post/3mwbnk7doc22v) | 2026-09-24 |
| C7 | "Aidvantage admitted their error marking two of my loans “delinquent” (5 times!) despite repeated overpayments / Their error dropped my credit score more than 100 points" | [Bluesky](https://bsky.app/profile/raewalker.bsky.social/post/3luq2vfa6c22d) | 2025-07-24 |
| C8 | "App doesn’t let you sign in and if you call YOU WILL be on hold for 3-5 hours" | [App Store review, MOHELA app](https://apps.apple.com/us/app/mohela/id1082597420) (★1, "Useless") | 2025-03-05 |
| C9 | "Whether it's Amazon or MOHELA, trying to get an actual human on the phone, past the asinine and near-useless voice recognition systems, can be very difficult." | [Hacker News](https://news.ycombinator.com/item?id=40834597) | 2024-06-30 |

Context: Sen. Warren said MOHELA "has reportedly sent false notices to borrowers that they’re overdue on payments" ([Bluesky, 2026-08-28](https://bsky.app/profile/warren.senate.gov/post/3mu65acqfws2b), 1,199 likes). Quotes C2, C4, C5 and C7 are exactly the cases where a **statement check** pays off: the wrong plan applied, a wrong amount, a wrong status.

#### D. PSLF counts wrong — severity 4

| # | Verbatim quote | Source | Date |
|---|---|---|---|
| D1 | ""your estimated hold time is one hour and five minutes" / I'm sorry, what?! Are you serious MOHELA? / This is because 13 months of my loan payment counts has disappeared from my PSLF repayment count on the fed website." | [Bluesky](https://bsky.app/profile/stinah.bsky.social/post/3msqj32nnuc2c) | 2026-08-10 |
| D2 | "I've been told they are running about 600 days behind on processing those, which has effectively kept me locked in to my government job because I don't trust them to get the payment count right." | [Bluesky](https://bsky.app/profile/gwillmac.bsky.social/post/3mxu6h26ky22b) | 2026-10-14 |
| D3 | "the reason why my payment count was stuck at 34 payments needing to be paid is because when I signed up for the PSLF my loans were consolidated and the system saw it as a new loan, none of which I was informed of at the time." | [Bluesky](https://bsky.app/profile/coffeeblack.bsky.social/post/3mw2ejozhe426) | 2026-09-21 |
| D4 | "only a third of my payments over the last two years count as a full payment for PSLF. utterly ridiculous." | [Bluesky](https://bsky.app/profile/vox-magica.bsky.social/post/3mqu5rq4yhc22) (16 likes) | 2026-07-17 |
| D5 | "I've been waiting for over a year and a half on my PSLF buyback request - including with a Congressional inquiry to no avail. And now my monthly payment is doubling starting in December." | [Bluesky](https://bsky.app/profile/davidjones.nyc/post/3myn47idf4k2v) | 2026-10-24 |
| D6 | "knowing I made 120 payment and not having records while my count is stuck at 118 is just another ADHD tax." | [Bluesky](https://bsky.app/profile/drszuckerman.bsky.social/post/3muitrsyyxs27) | 2026-09-02 |
| D7 | **snippet:** "FSA/StudentAid.gov was missing 15 months of payments I made to Mohela from July 2024 to October 2025" | r/PSLF via search snippet ([mirror link](https://r.datuan.dev/r/PSLF/s/8AOJZQovpg); unverified) | 2026-02-23 |
| D8 | **snippet:** "I'm missing June, September, and October." | r/PSLF comment via search snippet ([thread](https://www.reddit.com/r/PSLF/comments/1g71btu/has_anyone_received_clarification_re_missing_june/)) | ≈2024-10 (inferred from the post ID) |

Context: AFT sued ED on 2026-10-30 over "nearly 90,000 PSLF buyback apps … stuck in limbo" ([Bluesky, AFT President](https://bsky.app/profile/rweingarten.bsky.social/post/3mz4hzfpcuk2n)). Product fit: a month-by-month PSLF ledger that the borrower keeps themselves (D6: "not having records") and that flags missing months, plus a template dispute letter.

#### E. Default and collections fear — severity 4

| # | Verbatim quote | Source | Date |
|---|---|---|---|
| E1 | "My student loan said I need to get on a payment plan by Nov 11 or else they will do it for me and garnish my wages if I start to default. / Guess unemployment will be my next option." | [Bluesky](https://bsky.app/profile/bluej4u.bsky.social/post/3mzlw4lpiw22u) | 2026-11-05 |
| E2 | "Got a message I needed to recertify my income, even though that's not due until April, and the DoE says my loans are in default and $8k behind, even though I'm perfectly current with my servicer." | [Bluesky](https://bsky.app/profile/mpbmke.com/post/3m7lvto5us22h) | 2025-12-10 |
| E3 | "So my student loan account said I’m in Default, next page showed I owe $0 for this month (no default)." | [Bluesky](https://bsky.app/profile/danithedem.bsky.social/post/3mygh2z6sjc2v) | 2026-10-22 |
| E4 | "I was told by studentaid.gov to stop paying my PSLF loans because under the (now 18-months-long) pending buyback application AND the forgiveness application I submitted after 120 payments, the government now owes me $ / but now I'm thousands in default awaiting the resolution of either" | [Bluesky](https://bsky.app/profile/bizirker.bsky.social/post/3mya7fgbhhs25) | 2026-10-19 |
| E5 | "Trying to recertify IBR so I don't get a payment I can't make and so I don't get garnished to death but the student loan site won't even take re-cert apps." | [Bluesky](https://bsky.app/profile/adamstwitchell.bsky.social/post/3ltzshwhqgc23) | 2025-07-15 |
| E6 | "How come Nelnet is tanking my previously stellar credit score??" | [Bluesky](https://bsky.app/profile/kelpington.bsky.social/post/3myu7rjofbc2l) | 2026-10-27 |

Context: news in Oct 2026 said the administration plans to hire private debt collectors for about 10M defaulted borrowers after the midterms. Example: "The Trump admin is moving forward on plans to impose financial penalties on Americans in default …" ([Bluesky, news account, 2026-10-19](https://bsky.app/profile/kylegriffin1.bsky.social/post/3mya6ozflcc2x), 2,473 likes). ED announced a delay of involuntary collections on 2026-01-16 (per search results citing [ed.gov](https://www.ed.gov/about/news/press-release/us-department-of-education-delays-involuntary-collections-amid-ongoing-student-loan-repayment-improvements); the page returned 403 to my fetch).

#### F. Payment shock — severity 5

| # | Verbatim quote | Source | Date |
|---|---|---|---|
| F1 | "I was in SAVE - but that went away - and my student loan payment DOUBLED to $1500 a month. Do I pay for stupidly expensive daycare or do I pay my loan?" | [Bluesky](https://bsky.app/profile/msbishop.bsky.social/post/3mzb2exs5bk2c) | 2026-11-01 |
| F2 | "My last student loan payments were $404 (IBR, not SAVE) then $204 (SAVE). Then litigation held my payments in forbearance for years. My new student loan payment is $1200 at a minimum." | [Bluesky](https://bsky.app/profile/bobertonbluesky.bsky.social/post/3munvobqcb22y) | 2026-09-04 |
| F3 | "I cannot have my spouse's income ignored, which means my payment went from $10/mo to $436/mo ON THE SAME PLAN." | [Bluesky](https://bsky.app/profile/rickiep00h.bsky.social/post/3mrq5rcufak2f) | 2026-07-28 |
| F4 | "jfc my amount due for my student loan repayments jumped up $700 a month and my brilliant loan servicer only felt the need to tell me about that a few days before the payment is due" | [Bluesky](https://bsky.app/profile/squirrelsquirrel.bsky.social/post/3mq3i7optzs2t) | 2026-07-07 |
| F5 | "Can someone please explain how my income went down, yet my payments went up, and the new balance jumped up by almost $30k due to their new interest rate, all in 5 minutes..." | [Bluesky](https://bsky.app/profile/there-be-monsters.bsky.social/post/3mwxv4uxlbc2k) | 2026-10-03 |
| F6 | "my payment under RAP is $200+/month more than it was with SAVE." | [Bluesky](https://bsky.app/profile/generalmusician.bsky.social/post/3mv7jqiujf22n) | 2026-09-11 |
| F7 | "My student loan payments doubled after SAVE. I’m in the lowest IDR plan. I can’t afford them. I put in for forbearance so I have time to figure things out and don’t qualify." | [Bluesky](https://bsky.app/profile/msbishop.bsky.social/post/3mzp4gbqenc27) | 2026-11-07 |

Modelled context: CAP estimates SAVE borrowers moving to RAP pay **$2,163/yr more on average** ([americanprogress.org](https://americanprogress.org/article/the-devil-is-in-the-details-trump-student-loan-changes-raise-costs-and-weaken-safety-net-for-borrowers/)). TICAS models a family of four going from $36 on SAVE to $440 on RAP ([ticas.org](https://ticas.org/affordability-2/reconciliation-2025-student-loans/)); both figures come from search summaries. Note that F3 (spouse income) and F7 (forbearance as the fallback) are exactly the **filing-status** and **forbearance trap** mistakes in §4.

#### G. Distrust and scams — severity 3 (critical for go-to-market)

| # | Verbatim quote | Source | Date |
|---|---|---|---|
| G1 | "i thought it was a scam but i submitted an application to switch to one of the new student loan repayment plans to decrease my monthly payment 🙃" | [Bluesky](https://bsky.app/profile/veilofbeing.bsky.social/post/3muqkyfzaps2i) | 2026-09-05 |
| G2 | "I just got yet ANOTHER call from a scam about student loan forgiveness. … They have my name, address, and email (probably from one of a million data thefts)." | [Bluesky](https://bsky.app/profile/firebunicorn.bsky.social/post/3mw5aunynxs22) | 2026-09-22 |
| G3 | "lmao i got scammed and now my student loan debt is worse" | [Bluesky](https://bsky.app/profile/marcybones64.bsky.social/post/3muqe7wjvhk2n) (71 likes) | 2026-09-05 |
| G4 | "Does anyone know about this loan company called Aidvantage? They've been calling my cell phone number for two months … There is no way to leave them a voice mail or an email because they insist on a login or an account number." | [Bluesky](https://bsky.app/profile/lpcprof.bsky.social/post/3mxc62evyhs2v) | 2026-10-07 |
| G5 | "No one knows anything, and it's extremely close to a scam." | [Bluesky](https://bsky.app/profile/rickiep00h.bsky.social/post/3mttp3sw6o22i) | 2026-08-24 |
| G6 | "Student loan company wants to be the ones in charge of autopay, so they're offering a discount on the interest rate if I give them access to my bank account (not happening)." | [Bluesky](https://bsky.app/profile/markahix.bsky.social/post/3mxyqrngs3s2p) | 2026-10-16 |
| G7 | "I hate that my student loan goes through pay dot gov instead of nelnet specifically bc it feels like another scam set up by this admin" | [Bluesky](https://bsky.app/profile/hackedmotionart.bsky.social/post/3mxpovfeqj223) | 2026-10-12 |
| G8 | "PSLF itself is on shaky ground under this administration and you will see physicians unwilling to sacrifice career potential for a program that won't trust will be there to forgive their debt." | [Hacker News](https://news.ycombinator.com/item?id=48674132) | 2026-06-25 |

What this shows: even the government and servicers are read as scams (G1, G4, G7). A $79 third-party tool will be suspected by default. It needs explicit anti-scam design: no calls, never asks for the FSA ID, no "enrollment fee", and a "we never submit anything for you" stance.

---

## 2. Quantitative backdrop: CFPB complaint volumes (no narratives available)

Query: `product=Student loan • Federal student loan servicing`. Retrieved 2026-11-14 via the public API.

- **16,470 complaints from 2025-11-01 to 2026-11-14.** By company: **MOHELA 6,529 (40%)**, Nelnet 3,270, Maximus Federal Services (the default/collections contractor) 2,386, "Servicer under contract with FSA" 1,501, EdFinancial 1,446, Central Research Inc 509.
- **Top sub-issues:** "Received bad information about your loan" **4,306 (26%)**; "Trouble with how payments are being handled" 2,921; "Problem with forgiveness, cancellation, or discharge" 2,090; "Account status incorrect" (credit report) 1,725; "Problem with customer service" 1,110; "Problem with your payment plan" 567; "Don't agree with the fees charged" 487.
- **Monthly totals (federal servicing):** baseline about 600–1,100 per month in mid-2024, then **Jan-2025 1,877 (forgiveness sub-issue 564) → Mar-2025 3,128 (peak)** → Jan-2026 1,723 → **Mar-2026 1,694** (SAVE formally ended in March 2026) → Jul-2026 1,493 (RAP launch and 90-day notices) → Sep/Oct-2026 about 1,200 each. Complaints have stayed about 1.5–2× above the mid-2024 level.
- Caveat: this query also returns some credit-report issue categories. The counts are as the API returns them.

---

## 3. Triggers and behavior

### 3a. What triggers action

| Trigger | Evidence (verbatim where quoted) | Timing / implication |
|---|---|---|
| **Notice letter / "ACTION REQUIRED" email** | "a nastygram from my student loan servicer" (B1); "got a letter from my student loan servicer with the heading "ACTION REQUIRED - PLEASE CONTACT US AT YOUR EARLIEST CONVENIENCE" with not other information." ([2026-10-02](https://bsky.app/profile/tallguyduke.bsky.social/post/3mwvfgfrfb22t)) | 90-day SAVE notices began 2026-07-01, the first deadlines were about 2026-09-29/30, then a final 30-day notice ([TCI via Bluesky, 2026-10-15](https://bsky.app/profile/thecollegeinvestor.com/post/3mxwqlkgyyc2c)). This is the #1 moment of panic. |
| **First bill / payment due date** | "my first student loan payment is due on the 5th … until I was scared into picking an IDR" ([2026-11-02](https://bsky.app/profile/elviralor13.bsky.social/post/3mzdjhfhigk2u)); "My student loan payment is due a week from tomorrow & MOHELA still has not updated the portal with my payment amount" ([2026-10-27](https://bsky.app/profile/lifeofap.bsky.social/post/3myuxifsofc2s)) | Nov–Dec 2026 is when many ex-SAVE borrowers see their first bills. The "bill shock" moment fits a statement check. |
| **Recertification / tax season** | "an email from Nelnet yelling at you to recertify … by the end of July or else your payment plan jumps to $500/month" ([2026-06-02](https://bsky.app/profile/helenmarie95.bsky.social/post/3mndim4zkpk2s)); "before filing my taxes from last year so then I can apply for buyback and forgiveness" ([2026-09-06](https://bsky.app/profile/melanienewport.bsky.social/post/3muv3b5uhhk2x)) | Recertification uses AGI, so the filing-status decision happens in Jan–Apr. Treasury-offset fear (refund seizure) also peaks at tax time. |
| **Collections / default notice** | E1 ("garnish my wages"), E2–E3 (status shown as default by mistake) | Post-midterm collections (Nov 2026 onward) is a likely spike. |
| **Life events: new job, baby, marriage** | Baby: F1 ("daycare or … my loan"). New job: "I started working … as a contractor … three years later finally became a fed … It also fucked me for some PSLF, since I can't count those three." ([2026-08-11](https://bsky.app/profile/sokudoningyou.bsky.social/post/3msrgqviyw22p)). Marriage: F3 (spouse's income counted). | These are low-frequency but high-intent moments. PSLF eligibility of the employer, family size and filing status all change. |
| **Servicer phone calls** (often ignored) | "nelnet keeps calling me saying i have to select a plan…" ([2026-09-17](https://bsky.app/profile/freyja-lynx.dev/post/3mvq6qgniqc24)); B6 "playing chicken with Nelnet" | Outreach by phone triggers **avoidance**, not action. |

**Dominant behavior:** avoidance or procrastination until a hard date, then a panicked choice. Forbearance is often the default escape: "I asked for forbearance and it was easy as that" ([2026-06-30](https://bsky.app/profile/taddelay.bsky.social/post/3mpjwudh7z22v)); F1 and F7 do the same.

### 3b. Where people go for answers

| Channel | Evidence |
|---|---|
| **Servicer phone line** (default, but painful) | 1–3+ hour holds, dropped calls (C1, C3, C8, D1); different answers from different reps ("when you call you get different answers from different people when asked the same question", [MOHELA App Store review, 2024-08-30](https://apps.apple.com/us/app/mohela/id1082597420)). |
| **StudentAid.gov** (Loan Simulator, IDR form) | Its numbers conflict with the servicer's (A5, A6); the form fails ("the studentaid.gov form isn't behaving", [2025-07-30](https://bsky.app/profile/bookreadingguy.bsky.social/post/3lv6nwbhzdc2b)). |
| **Reddit r/PSLF, r/StudentLoans** | "I get all my info from /r/PSLF and highly recommend joining that sub." ([2026-09-24](https://bsky.app/profile/dmbmeg.bsky.social/post/3mwbvzgyp222d)). TISLA's president and r/PSLF moderators answer threads there (seen in search results). |
| **Facebook groups** (by occupation) | "The Facebook group I'm in for people trying to get PSLF is like document everything 7 ways." (D6). Student Loan Planner runs "Facebook Groups by Occupation" (site navigation). |
| **Unions** (NEA, AFT) | B7 ("I am an SDEA/NEA member"). AFT runs a borrower survey and filed the PSLF buyback class action on 2026-10-30. |
| **Congressional offices** | "Getting @duckworth.senate.gov 's office involved in my student loans for the second time in a calendar year" (C4); D5 "Congressional inquiry". |
| **Employer / city / AARP benefits** | Summer is "completely free … Your employer, city, or organization covers the cost" ([meetsummer.com/individuals](https://www.meetsummer.com/individuals)). Savi is offered through employers, NACo counties, AARP and NACAC. "AARP is offering sessions on how to deal with it" ([2026-05-19](https://bsky.app/profile/beth4158.bsky.social/post/3mm7pczgekd2x)). |
| **Creators / content sites** | The College Investor, Student Loan Sherpa and Tate Law dominate "IBR vs RAP" results. Borrowers share TCI links (e.g. [2026-01-12](https://bsky.app/profile/mrs-frazzled.bsky.social/post/3mcar6rcdps27)). **TikTok/YouTube evidence: not obtainable.** |
| **Servicer self-help video** | "they forced me to watch a video that was made with some AI guy "explaining" how to get my IDR back" ([2026-10-16](https://bsky.app/profile/docseuss.bsky.social/post/3mxzl7mq4zk2q), 28 likes) |

### 3c. Who they trust

- **Low trust in ED and servicers.**
  - The Data for Progress/TICAS poll (Dec 2025) reports 58% have little trust that the federal government will keep loans affordable. Among borrowers who contacted their servicer, 24% received inaccurate information ([PDF](https://ticas.org/wp-content/uploads/2025/12/DFP-Topline-Polling-Results_12.3.25.pdf); figures from the search snippet, as the PDF could not be text-extracted).
  - Credible (2026): four in five say their servicer did not adequately communicate the changes ([credible.com](https://www.credible.com/refinance-student-loans/student-loan-changes-statistics); search snippet).
  - Student Debt Crisis Center: trust in ED communications declined, while trust in nonprofits rose ([studentdebtcrisis.org](https://www.studentdebtcrisis.org/post/new-report-reveals-alarming-trends-among-americans-with-student-debt-amidst-a-federal-student-loan-s); snippet).
- **Higher trust in peers** (r/PSLF, occupation Facebook groups), **unions** (AFT/NEA), **nonprofit advocates** (TISLA, NCLC's Student Loan Borrower Assistance, SBPC/Protect Borrowers, Student Debt Crisis Center) and **elected officials**.
- **Implication:** credibility comes from being transparent ("here is the formula, here is the ED source"), from endorsement by peers or unions, and from never touching credentials.

---

## 4. Costly mistakes

| Mistake | Cost | Source |
|---|---|---|
| **Staying in forbearance (incl. SAVE forbearance) instead of a qualifying IDR plan** | Months do not count toward PSLF/IDR. SAVE interest restarted 2025-08-01. Recovering the months requires a buyback, with about 90,000 applications backlogged and waits of 600+ days. Historically, Navient's forbearance steering "added up to $4 billion in interest charges" (Jan 2010–Mar 2015). | [CFPB press release, 2017-01-18](https://www.consumerfinance.gov/about-us/newsroom/cfpb-sues-nations-largest-student-loan-company-navient-failing-borrowers-every-stage-repayment/) (verified); [Bankrate](https://www.bankrate.com/loans/student-loans/save-plan-interest-accrual-resumes-in-august) / [NerdWallet](https://www.nerdwallet.com/article/loans/student-loans/save-student-loan-plan-blocked-what-borrowers-face-now) (snippets); AFT lawsuit 2026-10-30 ([AFT via Bluesky](https://bsky.app/profile/aft.org/post/3mz4cukamkk2r)) |
| **Not recertifying IDR on time** | The payment reverts to the Standard amount (one reported case: $200 → $1,400 in one month). "More than 50% of borrowers fail to recertify their IDR plan each year." | [GSA Office of Evaluation Sciences](https://oes.gsa.gov/projects/idr-re-certification) (snippet); [SBPC recertification complaint memo](https://protectborrowers.org/wp-content/uploads/2022/04/SBPC-IDR-Complaint-Memo-Annual-Recertification.pdf); [Credit.com anecdote](https://www.credit.com/blog/how-one-womans-student-loan-payment-jumped-from-200-to-1400-126031/?amp) |
| **Missing the SAVE 90-day / final 30-day window** | Automatic placement on Standard or Tiered Standard, the costliest monthly options. | [The College Investor](https://thecollegeinvestor.com/90574/save-borrowers-miss-90-day-deadline-get-final-30-day-notice/) (via search; site returned 403 to direct fetch) |
| **Picking RAP vs IBR without modelling both** | IBR→RAP is one-way. RAP forgiveness takes 30 years vs 20/25 for IBR. RAP has no Standard-payment cap and a $10 minimum. IBR must be chosen by 2028-07-01. Example: A2, who now pays $300/mo for 30 years instead of $380/mo for 10. | [TCI RAP vs IBR](https://thecollegeinvestor.com/60115/rap-vs-ibr/); [Student Loan Sherpa](https://studentloansherpa.com/ibr-vs-rap/); [Tate Law](https://www.tateesq.com/learn/federal-student-loan-payment-increase) |
| **Consolidating at the wrong time** | PSLF/IDR count shows zero or resets after consolidation (D3: stuck at 34). For **Parent PLUS**, consolidation had to disburse by about 2026-06-30 to keep the ICR→IBR path. Any new Direct loan or consolidation after 2026-07-01 can end ICR/IBR access, and Parent PLUS is excluded from RAP, leaving Tiered Standard only. | [NCLC Student Loan Borrower Assistance: zero PSLF payments after consolidating](https://studentloanborrowerassistance.org/is-your-account-showing-zero-qualifying-payments-for-pslf-after-consolidating-dont-panic/); [NCLC SLBA Parent PLUS](https://studentloanborrowerassistance.org/do-you-have-parent-plus-loans-act-now-to-lower-your-payments-before-options-disappear/); [Tate Law](https://www.tateesq.com/learn/missed-parent-plus-consolidation-deadline) (cites 34 CFR 685.209(d)(5)) |
| **Wrong tax filing status (jointly vs separately)** | Filing jointly puts the spouse's income into the payment (F3: $10 → $436/mo). Filing separately can cost more in tax than it saves: one example is about $6,886/yr extra tax, and a $500k surgeon is about $22,000/yr. It can also forfeit credits such as the EITC. | [Student Loan Planner, married couples & PSLF](https://www.studentloanplanner.com/married-couples-pslf/); [Student Loan Sherpa](https://studentloansherpa.com/tag/jointly/) |
| **Paying extra while pursuing PSLF** | Extra principal goes against a balance that would have been forgiven. PSLF forgives the remainder after 120 qualifying payments; paying extra does not shorten the clock. *(Derived from program rules; I found no quantified source.)* | [StudentAid.gov PSLF](https://studentaid.gov/manage-loans/forgiveness-cancellation/public-service) |
| **Paying "doc prep" / debt-relief scam fees** | NERD Solutions / ED REF: at least **$8.8M**, fees "as high as **$1,400**" (FTC TRO, 2026-04-16). Superior Servicing: **more than $45.9M** taken (FTC order, 2026-07-21). Prosperity Benefit Services: **$20.3M** (FTC, Jun 2024). These services are free at StudentAid.gov. | [FTC 2026-04](https://ftc.gov/news-events/news/press-releases/2026/04/ftc-stops-operation-allegedly-targeted-people-seeking-student-loan-debt-relief) (verified); [FTC 2026-07](https://www.ftc.gov/news-events/news/press-releases/2026/07/student-loan-forgiveness-scammer-permanently-banned-debt-relief-industry-telemarketing) (verified); Prosperity's $20.3M is from a search summary citing the FTC (I did not open the release); older context: [NASFAA on two FTC cases totalling $12M](https://www.nasfaa.org/news-item/30662/FTC_Stopped_Two_Student_Loan_Debt_Relief_Schemes_That_Defrauded_12_Million_From_Borrowers) (snippet, date not checked) |
| **Letting loans default** | Treasury offset of tax refunds and federal benefits, wage garnishment of up to 15%, credit damage. Collections were paused 2026-01-16, but a restart with private collectors was reported for after the midterms. About 10–12M borrowers are delinquent or in default. | [SBPC on AWG](https://protectborrowers.org/what-we-do/federal-student-loans/default-collections/awg); [ED press release](https://www.ed.gov/about/news/press-release/us-department-of-education-delays-involuntary-collections-amid-ongoing-student-loan-repayment-improvements) (via search); [NPR/Michigan Public, 2025-12-23](https://www.michiganpublic.org/2025-12-23/federal-student-loans-are-changing-heres-what-to-expect-in-2026) |
| **Trusting the servicer's number without checking** | 24% of borrowers who contacted their servicer got inaccurate information (DFP/TICAS). 26% of CFPB federal-servicing complaints are "Received bad information about your loan". Reported false overdue notices from MOHELA (Aug 2026). | §2; §3c; [Warren](https://bsky.app/profile/warren.senate.gov/post/3mu65acqfws2b) |

**Top 5 by cost × frequency:**
1. Forbearance trap / lost PSLF months
2. RAP-vs-IBR mis-pick, which cannot be undone
3. Not recertifying, or missing the SAVE window
4. Consolidation timing (Parent PLUS especially)
5. Paying scam fees

---

## 5. Willingness to pay (what borrowers already pay for)

| Product / spend | Price | Model / notes | Source |
|---|---|---|---|
| **Student Loan Planner** consult | **$395–$595 one-time** | "The fee for our one time service can ranges between 395 and 595 depending on the service you selected". The fee is invoiced after the call and owed "regardless of the outcome of the call and your satisfaction with it". It also earns refinancing referral bonuses. | [studentloanplanner.com/consult](https://www.studentloanplanner.com/consult/) (accessed 2026-11-14) |
| **Savi** | DIY free; Essential **≈$90/yr**; Pro **≈$200/yr** (2022). Partner rates: $70/$150 (NACo), $75/$180 (Esusu). The Univ. of Arizona (2026) still says "typically $90/year". | It has pivoted to employer-paid distribution: the homepage says "more employers trust Savi than any other solution" and claims "$187 Average Monthly Savings". The homepage also mentions "Savi's student loan expertise" being added "to the Upwise experience", which suggests a merger or acquisition (my inference). | [Juno 2022](https://joinjuno.com/financial-literacy/student-loans/savi-student-loan-review-2022), [UA HR 2026](https://hr.arizona.edu/news/2026/lower-your-student-loan-payments-savi), [NACo](https://www.naco.org/sites/default/files/2026-01/Savi%20Overview.pdf) (snippets); [bysavi.com](https://www.bysavi.com/) |
| **Summer** | **$0 to the individual** | "It’s completely free / Your employer, city, or organization covers the cost." It claims "Employees save an average of $300/month" with a money-back guarantee to employers. **There is no direct-to-consumer price.** | [meetsummer.com/individuals](https://www.meetsummer.com/individuals) |
| **Chipper** | Was "Free for now", with a planned subscription later (pre-2023 review) | **Likely defunct:** the App Store id 1334827413 lookup returned 0 results on 2026-11-14, and withchipper.com redirects to a parked `/lander` page. This is inferred, not confirmed. | [Money Crashers](https://www.moneycrashers.com/chipper-app-review/) (snippet); my own checks |
| Free competitor apps | $0 | Student Loan Planner app (launched 2025-11, 15 ratings); The College Investor "Student Loan Calculator" app (launched 2026-07-10, 0 ratings) | iTunes Search API |
| **Doc-prep / debt-relief scams** | Fees "as high as $1,400" (NERD); totals of $8.8M, $20.3M and $45.9M per operation | This is evidence of **latent willingness to pay under fear** when someone offers to "handle it". It is also why a paid tool is distrusted. | FTC (see §4) |
| Attorneys (e.g. Tate Law) | Not obtained | They rank highly on SEO for RAP/IBR/Parent PLUS. | — |

**Complaints about the paid products:** **not obtainable.** Trustpilot was unreachable, none of these products has an App Store presence with reviews, and Chipper is delisted. On Bluesky, 1,462 student-loan posts contain essentially **no organic mentions of Savi, Summer, Chipper or Student Loan Planner** (searched directly). The one positive vendor-hosted testimonial was Summer's: "when my loan servicer just provided 3-hour hold times" (undated, [meetsummer.com](https://www.meetsummer.com/individuals)). **Read-out:** the paid-help category has low consumer awareness. Incumbents moved to employer-paid B2B2C, so B2C at $79/yr has little direct competition but also **no proven B2C price anchor** beyond one-off $395–$595 consults.

---

## 6. Search demand

**Tool:** [seodata.dev](https://www.seodata.dev). It states its figures are "Monthly average for US, from the Google Ads API". Pages and API were queried 2026-11-14; the "updated" date per keyword is shown. **All volumes are estimates.** Google Ads volumes are 12-month averages, so they **understate brand-new terms** such as RAP, which launched 2026-07-01.

| Keyword (requested) | Est. US monthly searches | Notable related terms (est.) | CPC (est.) |
|---|---|---|---|
| "RAP vs IBR" / "IBR vs RAP" | **0 reported (below threshold / too new)** | "repayment assistance plan" **60,500**; "what is repayment assistance plan" 1,900; "rap student loan" 1,000; "repayment assistance plan student loan" 880; "rap plan student loans" 590 | "repayment assistance plan student loan" $41.97; "what is the repayment assistance plan" $78.34 |
| "SAVE plan ending" | **110** | "save plan" **33,100** (upd. 2026-11-11); "save plan student loans" 18,100; "save plan updates" 6,600; "save plan forbearance" 4,400 | "save plan" $16.01 |
| "student loan default" | **12,100** (upd. 2026-08-30) | "defaulted student loans" 12,100; "student loan wage garnishment" **9,900**; "student loan garnishments" 2,900 | $30.10 |
| "PSLF count wrong" | **0 reported** | "pslf payment count" 320; "pslf counter" 390; "pslf status" 720; "**pslf buyback**" **8,100**; "pslf" / "public service loan forgiveness" **74,000** each | "pslf" $6.64 |
| "student loan forgiveness" | **246,000** (upd. 2026-10-18) | "student.loan forgiveness" 450,000; "apply for student loan forgiveness" 12,100; "student debt relief" 6,600 | $5.19 |
| "repayment assistance plan calculator" | **720** (upd. 2026-10-08) | "income-driven repayment plan calculator" 2,400; "student loan income based repayment calculator" 1,900; "save plan calculator" 1,600; "student loan calculator" **60,500** | $2.84 (IDR calculator $14.91) |
| "IDR application" | **1,300** | "student loan idr application" 320 | $12.56 |
| *Extra:* "income based repayment plan" | 22,200 ("income based repayment" 8,100) | | $31.48 |
| *Extra (navigational):* servicer names | **nelnet 1,000,000** (includes other Nelnet businesses); **mohela 823,000**; **aidvantage 550,000**; **edfinancial 450,000** | "student loans mohela" 74,000; "edfinancial services" 40,500 | $7–$23 |
| *Extra:* "student loan help" / "student loan forgiveness scam" | 1,000 / 320 | | $45.26 / – |

**Reading:**
1. The demand is **navigational** (several million monthly searches for servicer names: people logging in to pay or check) and **head-term "forgiveness"** (246k).
2. Problem-specific long tails such as "count wrong" and "RAP vs IBR" barely register in Google Ads volumes. Content supply suggests real interest anyway: TCI, Sherpa, SoFi, Credible, NerdWallet and Tate all published "IBR vs RAP" pages.
3. High CPCs ($30–$78) on default and RAP terms mean paid search will be expensive, because debt-relief marketers bid on them. That favours SEO and community over SEM.

**Timing spikes.** Google Trends was not obtainable (HTTP 429). The proxies below are weak.
- **CFPB complaint volume** (federal servicing, §2): peaks in **Jan 2025, Mar 2025 (largest), Jan 2026, Mar 2026**, and a smaller bump in **Jul 2026** (RAP launch and 90-day notices).
- **Wikipedia pageviews** (Wikimedia API, monthly; overall traffic is declining, so only the shape is meaningful):
  - *Public Service Loan Forgiveness* spikes **Mar 2025 (4,425)** and **Mar 2026 (2,212 vs ≈1,000 baseline)**.
  - *Student loan default in the US* peaks **Apr 2025 (838 vs ≈200)**, matching the collections-restart announcement.
  - *Income-driven repayment* peaks Mar 2025 (1,088) and Jul 2025 (734).
  - *MOHELA* rises Jul–Sep 2026 (71–84 vs ≈25).
- **Calendar to plan around:**
  - 2026-07-01: RAP launch, 90-day SAVE notices begin
  - 2026-09-29/30: first 90-day deadlines, then 30-day final notices
  - Nov–Dec 2026: first ex-SAVE bills come due
  - Post-midterm (Nov 2026 onward): reported restart of collections
  - Jan–Apr: tax season, recertification, filing-status decisions, Treasury-offset fear
  - 2028-07-01: last date to choose IBR; legacy plans sunset

---

## 7. Implications for Student Loan Copilot (short)

1. **Lead with the deadline + bill moment.** "Got a SAVE/plan-change letter or a new bill? Find out your date and your cheapest plan in 3 minutes." Quotes B1–B6 and F1–F7 are the hook.
2. **Show both axes: monthly payment AND total years/cost** for RAP vs IBR vs Standard/Tiered Standard, with a one-way-door warning (A1, A2).
3. **The statement check is a real wedge.** 26% of complaints are about bad information, and quotes C2, C4, C5, C7 and E2–E3 show wrong plans, amounts and statuses. Add a PSLF month-by-month ledger and dispute templates (D1–D8).
4. **Anti-scam trust design is mandatory:** no calls, never ask for the FSA ID, never "submit for you", cite ED sources inline, and seek union/advocate endorsement (G1–G7, §3c).
5. **Price anchors:** a free employer benefit (Summer/Savi) at the low end, $395–$595 consults at the high end, and scam fees up to $1,400 showing fear-driven WTP. $79/yr sits in a gap with no visible B2C competitor. Distribution should run through communities (r/PSLF, occupation Facebook groups, unions) and SEO, not SEM.

---

### Appendix: raw data locations (local, untracked)
- Bluesky corpus: `/tmp/slc_data/bsky/posts.json` (1,462 posts; temporary)
- MOHELA App Store RSS: `/tmp/slc_data/mohela_*.json`
- CFPB aggregates: `/tmp/slc_data/agg.json`; seodata pages: `/tmp/slc_data/seo/`
