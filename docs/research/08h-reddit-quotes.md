# 08h: Reddit borrower quotes for the pitch deck (Student Loan Copilot / Guardian)

## Method

- **Collected:** 2026-11-14, logged out, read-only. Nothing was clicked except navigation. No posting, voting or logging in.
- **Route:** Chrome DevTools MCP, one isolated background page, `www.reddit.com` new-style URLs. The first search URL opened on a "Prove your humanity" reCAPTCHA page. Going to `/r/StudentLoans/` instead passed an automatic JavaScript check with no CAPTCHA to solve, and every page after that loaded normally. I used subreddit feeds, post searches, comment searches (`&type=comments`, `sort=new`) and individual thread or comment pages.
- **Pages loaded:** 25. That is 14 searches, 9 threads or comment permalinks, 1 subreddit feed and the 1 CAPTCHA page.
- **Subreddits:** r/StudentLoans and r/PSLF. One r/Teachers comment search found nothing usable. I did not search r/nursing or r/personalfinance, to stay within the page budget.
- **Verbatim:** every quote is copied from the page snapshot with the author's spelling kept (for example "tired" for *tiered*, "accrew", "havent", "filed married filed separately"). I trimmed only at the ends and marked those trims with "…". No usernames or personal identifiers are included.
- **Dates:**
  - **Thread pages** show relative times ("22h ago", "2mo ago"). I converted these to dates counting back from 2026-11-14.
  - **Comment-search results** show no timestamp. For these I estimated the date from Reddit's sequential base-36 comment IDs, interpolating between comments whose dates I knew.
  - **Checks on the estimates:**
    - One comment was estimated at 2026-03-28, and its page showed "8mo ago".
    - Another was estimated at 2026-09-19, and its own text says the payment was made on 9/16 and posted on 9/18.
  - All dates are approximate (≈).

## Quote table

| # | Theme | Quote | Subreddit | Date | Link | Thread title |
|---|---|---|---|---|---|---|
| 1 | 1. SAVE ending / 90-day notice | "…the deadlines and all the information is so scattered it doesn't make sense. Some of my info is still saying the deadline is 2028, and some of my info is a vague "90 days" without a date." | r/StudentLoans | ≈2026-09-09 | https://www.reddit.com/r/StudentLoans/comments/1w5y550/comment/p9k5m6s/ | For those still riding out SAVE |
| 2 | 2. Payment shock | "…SAVE was 497 new IDR plan is 2157 a month. Trying to figure out if I should sell my house or take my child out of daycare and have my wife split a vehicle." | r/StudentLoans | ≈2026-11-13 | https://www.reddit.com/r/StudentLoans/comments/1xvce04/2157_a_month_payment/ (post body) | 2157 a month payment |
| 3 | 2. Wrong plan placement | "Now I received a letter from Mohela that states my loans are on a tired payment plan and my monthly payment for both loans are $1,200???" | r/StudentLoans | ≈2026-11-07 | https://www.reddit.com/r/StudentLoans/comments/1xqzovi/comment/19sbzrrr0j6lg/ | MOHELA—Urgent Assistance Needed Regarding Incorrect Student Loan Payment and Repayment Plan |
| 4 | 3. Calculators disagree (also 2) | "Switched from SAVE to Standard (within the 90 days.) the student aid website said our payment would be $814/mo. Submitted the application and now Nelnet says it's over $2k per month starting next month?!" | r/StudentLoans | ≈2026-11-13 | https://www.reddit.com/r/StudentLoans/comments/1xvlh3u/2000mo_on_standard/ (post body) | $2000/mo on Standard?! |
| 5 | 3. RAP vs IBR choice | "I could switch to RAP and save a little bit of cash but I just don't trust it and if God forbid I lost my public service job\PSLF, New IBR would be my closest route to alternative forgiveness by far." | r/StudentLoans | ≈2026-11-13 | https://www.reddit.com/r/StudentLoans/comments/1qxgtdt/comment/19sm10v0mrglf/ | Are people still being put in new ibr incorrectly ? |
| 6 | 4. Servicer unresponsive | "…After 2 hours on hold, they said it has to be my fault and I must have entered something wrong. 3 times." | r/StudentLoans | ≈2026-11-03 | https://www.reddit.com/r/StudentLoans/comments/1xa18up/comment/19s3zlzpl81nk/ | Have you dealt with a nightmarish student loan situation? I want to hear from you. |
| 7 | 4. Servicer data mismatch (also 6) | "…I already received a letter from Aidvantage about a month ago telling me my payment amount and due date (11/17), but "No Payment Due" is still showing up." | r/StudentLoans | ≈2026-11-14 | https://www.reddit.com/r/StudentLoans/comments/1xw334y/due_date_is_1117_but_aidvantage_page_says_no/ (post body) | Due Date is 11/17 But Aidvantage Page Says No Payment Due? |
| 8 | 5. PSLF count wrong | "In July FSA retroactively marked four months from earlier this year as ineligible after they had already been marked eligible and qualified (ECF submitted). It took us from 117 qualified payments to 113." | r/PSLF | ≈2026-11-10 | https://www.reddit.com/r/PSLF/comments/1xsxkz1/comment/19sg2gqpv19nl/ | Reconsideration Timeline |
| 9 | 5. Buyback backlog | "…I submitted a buyback request for 9 months about 2 years ago and still havent received a response." | r/PSLF | ≈2026-11-13 | https://www.reddit.com/r/PSLF/comments/1xrxbj7/comment/19sl70g5s6ehv/ | Anyone still not changing their plan from SAVE? |
| 10 | 6. RAP interest subsidy short | "…My interest subsidy should be 93.21/month. I received $53.11." | r/StudentLoans | ≈2026-09-22 | https://www.reddit.com/r/StudentLoans/comments/1wq5jw6/comment/pc5v4lb/ | Missing RAP interest subsidy is by design |
| 11 | 6. Forbearance without asking (also 5) | "I have the 120 months of public service credit but was forced into administrative forbearance without my permission making the last 14 of those months not eligible." | r/StudentLoans | ≈2026-09-26 | https://www.reddit.com/r/StudentLoans/comments/1wtcwph/comment/pczhgn1/ | SAVE didn't disappear |
| 12 | 7. Default fear | "I owe the federal government $37,000. I can't afford it even with the supposed income driven payments every time I log in pay, it's like I have accrew several thousand dollars in interest." | r/StudentLoans | ≈2026-08 (3mo ago) | https://www.reddit.com/r/StudentLoans/comments/1w11jr3/just_how_much_will_it_ruin_me_financially_to_let/ (post body) | Just how much will it ruin me financially to let my loans default? |
| 13 | 8. Willingness to pay | "…I'm looking for someone who can review my specific situation and walk me through the best actions to take. Willing to pay a modest fee for a one-time consultation." | r/StudentLoans | ≈2026-10-07 | https://www.reddit.com/r/StudentLoans/comments/1x3h3rw/looking_for_a_student_loan_consultant/ (post body) | Looking for a student loan consultant |
| 14 | 8. Paid help and distrust | "I paid both Gradfin and Savi for advice and I am not at all confident. I followed their advice , but with all the government changes, the advice quickly became obsolete." | r/StudentLoans | ≈2026-03 (8mo ago) | https://www.reddit.com/r/StudentLoans/comments/1s05vwc/comment/obrtmcc/ | 33yo dentist - 298k debt - advice |
| 15 | 9. Married filing separately | "I called them last Friday trying to see if they could open a link so I can filed married filed separately but she said that wasn't possible. She said to call back and request an administrative forbearance and file my taxes in January under married filed separately." | r/StudentLoans | ≈2026-11-03 | https://www.reddit.com/r/StudentLoans/comments/1xmvf41/comment/19s3c56a1uef7/ | SAVE Plan Update: MOHELA is sending final 30-day notices. Here's the timeline. |

### Notes on individual quotes

- **#3, #6, #15** come from comments by people describing their own accounts. They are not the thread OP, except where the table says "post body".
- **#15:** the same comment goes on to give a RAP vs IBR comparison (theme 3): "My loans would have been $1400 under RAP with loan end date of 2034 or $1700 under IBR with loan end date of 2036. How is IBR 2 years later when it is a 25 year plan while RAP is a 30 year plan."
- **#11:** the same comment ends: "The confusion in all of this is mind blowing. I'm willing to pay someone to help me figure this out." (theme 8)

## Reserve quotes (verbatim, not in the table)

- **Theme 1:** "My 90 days were up last week, and instead of getting the 30 day extension like many other have gotten, my letter says I've been put into forbearance until 2028." Source: r/StudentLoans, ≈2026-11-08, https://www.reddit.com/r/StudentLoans/comments/1xrc7kg/forbearance_until_2028/ (post body), thread "Forbearance until 2028?"
- **Theme 1:** "…Today, one day after my supposed deadline, I opened my email and saw a new 30-day deadline message." Source: r/StudentLoans, ≈2026-11-12, https://www.reddit.com/r/StudentLoans/comments/1xuizb3/nelnet_90day_save_deadline_expired_yesterday/ (post body), thread "Nelnet 90-day SAVE deadline expired yesterday. Received a 30-day notice today."
- **Theme 3:** "I'm so curious how they got that number for you. I make less than that and when I do it, it says 800+ a month." Source: r/StudentLoans, ≈2026-11-13, https://www.reddit.com/r/StudentLoans/comments/1xvce04/comment/19skzipadlkqq/, thread "2157 a month payment"
- **Theme 5:** "I got a canned response back that they were transitioning the buyback requests to the loan servicers and that there was nothing to do but wait. There was no way to determine where my request was in the queue." Source: r/PSLF, ≈2026-11-13, https://www.reddit.com/r/PSLF/comments/1xvmbze/comment/19slgca3vqwzo/, thread "Writing Congress about the SAVE/PSLF mess - what am I missing?"
- **Theme 6:** "…Nothing in the call leads me to believe we'll ever see this missing subsidy corrected (well over $1,000 in our case)." Source: r/StudentLoans, ≈2026-09-20, https://www.reddit.com/r/StudentLoans/comments/1wq5jw6/missing_rap_interest_subsidy_is_by_design/ (post body), thread "Missing RAP interest subsidy is by design"
- **Theme 7:** "They continue to reject my valid payment, and I'm approaching default on literally my first ever payment." Source: r/StudentLoans, ≈2026-11-03, https://www.reddit.com/r/StudentLoans/comments/1xa18up/comment/19s3zlzpl81nk/ (the same comment as #6)
- **Theme 7:** "We went ahead and paid because I was scared they were going to pull some bull shit and say we defaulted or something, and we are so close to our forgiveness payment count that we just want to get this over with." Source: r/StudentLoans, ≈2026-11-06, https://www.reddit.com/r/StudentLoans/comments/1xpfkms/comment/19s9m3majoteq/, thread "Wow! Amazing how 'efficient' Mohela is when they want their $$$$$$!!!!!"
- **Theme 8 (scam):** "I just recently tried to get in touch with them and the website redirects to some gambling site, and the phone number is no longer in service." Source: r/StudentLoans, ≈2026-09 (2mo ago), https://www.reddit.com/r/StudentLoans/comments/1wmpf8o/united_aid_group/ (post body), thread "United Aid Group?" The poster had paid this company to handle a Borrower Defense application.

## Best 8 for slides

1. **#2, payment shock:** "SAVE was 497 new IDR plan is 2157 a month. Trying to figure out if I should sell my house or take my child out of daycare…"
2. **#4, government calculator vs servicer:** "the student aid website said our payment would be $814/mo… now Nelnet says it's over $2k per month"
3. **#10, a statement-check catch:** "My interest subsidy should be 93.21/month. I received $53.11."
4. **#8, PSLF count goes backwards:** "It took us from 117 qualified payments to 113."
5. **#11, forbearance without consent:** "forced into administrative forbearance without my permission making the last 14 of those months not eligible."
6. **#1, chaos that a dated plan would fix:** "Some of my info is still saying the deadline is 2028, and some of my info is a vague "90 days" without a date."
7. **#13, willingness to pay:** "Willing to pay a modest fee for a one-time consultation."
8. **#14, why a one-time consultant isn't enough:** "I paid both Gradfin and Savi… with all the government changes, the advice quickly became obsolete."

If a slide needs a quote about servicer pain, #6 is the alternate ("After 2 hours on hold, they said it has to be my fault…").

## Gaps

- **Theme 7 (default):** the only clear first-person fear quote (#12) is about 3 months old. Most recent default talk is political or second-hand.
- **Theme 8 (scams):** I found one scam-victim post (a Borrower Defense "help" company). I found nobody complaining of being scammed by Savi; the Savi complaints are about value and outdated advice.
- **Other subreddits:** I found no usable quote from r/Teachers. I did not search r/nursing or r/personalfinance.
- **Counter-signal:** r/StudentLoans regulars often push back on paid advice. For example: "I don't consider anyone selling this advice to be "reputable," since it is widely available for free." (https://www.reddit.com/r/StudentLoans/comments/1x3h3rw/comment/pfb350p/, ≈2026-10-07). Pricing and positioning should expect this objection.
