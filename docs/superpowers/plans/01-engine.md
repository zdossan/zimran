# P1 Engine: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pure TypeScript engine that computes RAP, IBR, 10-year Standard and Tiered Standard payments; checks which plans each borrower can use; simulates 12 months of balance change; picks a recommendation; compares joint and separate tax filing; and builds a dated action plan. It must reproduce all 22 published checks and the 8 test borrowers.

**Architecture:** Pure functions with no I/O, safe on both client and server. Each rule lives in its own file, and `lib/engine/index.ts` replaces the foundation stub.

**Tech Stack:** TypeScript (strict), Vitest.

**Spec:** `docs/superpowers/specs/2026-11-14-student-loan-guardian-design.md` §5.3–5.4.

**Reference:** `docs/research/engine_fixtures.py` (a Python reference that passes 22/22) and `docs/research/08a-rules-repayment-plans.md` §6.

**Branch:** `feat/engine`. You own `lib/engine/**`, `lib/actions/**` and `lib/config/rules.ts`. Edit nothing else.

## Global Constraints
- Follow the Global Constraints in `00-foundation.md`.
- Round to cents half-up at these four points: each plan's monthly payment, each month's interest, each match, and each waived amount. Use `round2(x) = Math.round(x * 100) / 100`.
- `rulesAsOf = "2026-11-01"` on every `PlanComparison`.
- The 2026 poverty line (48 states and DC) is `15960 + 5680 × (size − 1)`. For Alaska and Hawaii, use the same table and add the `ak-hi-approx` warning.
- **Multiple loans:** pool all eligible loans. Principal = the sum of balances. Rate = the balance-weighted average rate. Parent PLUS loans are left out, with the `parent-plus-unsupported` warning.

## Review Focus
- **AGI exactly on a band edge, $0, or negative:** $50,000.00 uses 4%, $50,000.01 uses 5%, and $0 gives a $10 payment. Treat a negative AGI as 0. Test in Task 1.
- **A loan disbursed exactly on 2026-07-01:** counts as a new loan, so IBR is unavailable and Tiered is available. Test in Task 4.
- **So many dependents the RAP payment goes negative:** the payment floors at $10. Test in Task 1.
- **Joint filer whose spouse also has eligible loans:** prorate by balance share, then apply the $10 floor again. Test in Task 1.
- **A plan whose balance grows while it's the cheapest per month:** don't recommend it; add the `balance-grows` warning. Test in Task 4.

---

### Task 1: Rule constants and the RAP payment

**Files:**
- Create: `lib/config/rules.ts`, `lib/engine/rap.ts`, `lib/engine/math.ts`
- Test: `lib/engine/__tests__/rap.test.ts`

**Interfaces:**
- Produces:
  - `round2(x: number): number`
  - `rapRate(agi: number): number | null` (null means the flat $120/yr)
  - `rapMonthly(agi: number, dependents: number, ownBal?: number, spouseBal?: number): number`
  - `RULES_AS_OF`, `FPL_2026`, `MFS_BRACKETS_2026`, `MFS_STD_DEDUCTION_2026 = 16100`

- [ ] **Step 1: Write the failing tests** (expected values verbatim from `engine_fixtures.py` part A):
  - `rapMonthly(55000, 0)` → `229.17`
  - `rapMonthly(55000, 0, 20000, 20000)` → `114.58`
  - `rapMonthly(27500, 0)` → `45.83`
  - `rapMonthly(45000, 0)` → `150.00`
  - `rapMonthly(95000, 0)` → `712.50`
  - `rapMonthly(65000, 2)` → `225.00`
  - `rapMonthly(25000, 1)` → `10.00`
  - `rapMonthly(50000, 0)` → `166.67`
  - `rapMonthly(50000.01, 0)` → `208.33`
  - `rapMonthly(0, 0)` → `10.00`
  - `rapMonthly(-5, 0)` → `10.00`
  - `rapMonthly(30000, 9)` → `10.00`
  - `rapMonthly(150000, 1)` → `1200.00`
  - `rapMonthly(80000, 1)` → `416.67`
- [ ] **Step 2:** Run `npx vitest run lib/engine/__tests__/rap.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - The band rate applies to the **whole** AGI. Bands are "more than X, not more than Y": `ceil(agi / 10000) − 1` percent for 10k < agi ≤ 100k, and 10% above 100k.
  - `max(10, base/12 − 50·dependents)`.
  - If `spouseBal > 0`, then `max(10, pay · own / (own + spouse))`.
  - `round2` the result.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** Commit: `git commit -m "feat(engine): RAP payment + rule constants"`.

### Task 2: IBR, poverty line, amortization and Tiered Standard

**Files:**
- Create: `lib/engine/ibr.ts`, `lib/engine/amortize.ts`
- Test: `lib/engine/__tests__/ibr-amortize.test.ts`

**Interfaces:**
- Produces:
  - `fpl(size: number): number`
  - `ibrMonthly(agi: number, familySize: number, hadBalanceOnJuly2014: boolean, cap: number | null, ownBal?: number, spouseBal?: number, fplFn?: (n: number) => number): number`
  - `amortize(principal: number, annualRate: number, months: number): number`
  - `standard10(principal, rate): number` (the $50 minimum applies)
  - `tieredTermMonths(totalPrincipal): 120 | 180 | 240 | 300`
  - `tieredStandard(principal, rate): number`

- [ ] **Step 1: Write the failing tests:**
  - `ibrMonthly(45000, 1, false, null)` → `175.50`
  - `standard10(30000, 0.0653)` within 0.5 of `341`
  - `tieredStandard(30000, 0.0653)` within 0.5 of `262`
  - `amortize(10000, 0.06, 144)` → `97.59`
  - with the 2025 poverty line (`15650 + 5500·(n−1)`), rounded to dollars:
    - `ibrMonthly(50000, 1, false, null)` → `221`
    - `ibrMonthly(50000, 1, true, null)` → `332`
    - `ibrMonthly(100000, 3, false, null)` → `500`
  - floors:
    - a result of 4.99 → `0`
    - 5.00 → `10`
    - 9.99 → `10`
  - `tieredTermMonths(24999.99)` → `120`; `(25000)` → `180`; `(99999)` → `240`; `(100000)` → `300`
  - `tieredStandard(85000, 0.07)` → `659.00`
- [ ] **Step 2:** Run `npx vitest run lib/engine/__tests__/ibr-amortize.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - The rate is 10% when `hadBalanceOnJuly2014` is false, otherwise 15%.
  - Discretionary income = `max(0, agi − 1.5·fpl(size))`.
  - The cap is `min(calc, cap)`.
  - Then prorate by spouse balance.
  - Floors: under 5 → 0; 5 up to 10 → 10.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** Commit: `git commit -m "feat(engine): IBR, FPL, amortization, Tiered"`.

### Task 3: RAP monthly benefits and the 12-month simulation

**Files:**
- Create: `lib/engine/simulate.ts`
- Test: `lib/engine/__tests__/simulate.test.ts`

**Interfaces:**
- Produces:
  - `rapMonthBenefit(principal: number, rate: number, payment: number): RapMonthBenefit`
  - `simulate12(kind: PlanId, principal: number, rate: number, payment: number): number`, which returns `balanceChange12m`

**Algorithm.** The tests don't pin this down, so implement it exactly as written.

For each of 12 months:
1. `interest = round2(P·r/12)`.
2. **For RAP:**
   - `principalPaid = max(0, round2(pay − interest))`;
   - `match = principalPaid < 50 ? round2(min(50, pay) − principalPaid) : 0`;
   - `P −= principalPaid + match`.
   - Unpaid interest is waived and never accrues.
3. **For other plans:**
   - the payment covers this month's interest first;
   - any extra then pays down accrued unpaid interest;
   - anything left reduces `P`;
   - any shortfall is added to `accrued`.

The result is `round2((P_end + accrued_end) − P_start)`. Simple interest, with no capitalization inside the 12 months. Note in `PlanResult.notes` that IBR's interest waiver for subsidized loans is ignored, so the figure is conservative.

- [ ] **Step 1: Write the failing tests:**
  - `rapMonthBenefit(35000, 0.0653, 150)` → `{interest: 190.46, waived: 40.46, principalPaid: 0, match: 50, principalDrop: 50}`
  - `rapMonthBenefit(40000, 0.065, 229.17)` → `{interest: 216.67, principalPaid: 12.50, match: 37.50, principalDrop: 50}`
  - `rapMonthBenefit(25000, 0.0653, 10)` → `{waived: 126.04, match: 10, principalDrop: 10}`
  - `simulate12("RAP", 40000, 0.065, 129.17)` → `-600`
  - `simulate12("IBR", 40000, 0.065, 116.83)` → `1198.08`
  - `simulate12("RAP", 40000, 0.065, 229.17)` → `-600`
  - `simulate12("IBR", 25000, 0.0653, 0)` → `1632.48`
  - `simulate12("RAP", 25000, 0.0653, 10)` → `-120`
- [ ] **Step 2:** Run `npx vitest run lib/engine/__tests__/simulate.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement as above.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** Commit: `git commit -m "feat(engine): RAP benefits + 12-month simulation"`.

### Task 4: `computePlans`: eligibility, recommendation, warnings, rule references

**Files:**
- Create: `lib/engine/compute.ts`, `lib/engine/eligibility.ts`, `lib/engine/recommend.ts`
- Modify: `lib/engine/index.ts` (replace the stub; re-export everything)
- Test: `lib/engine/__tests__/compute.test.ts`

**Interfaces:**
- Consumes: Tasks 1–3, and `lib/types.ts`.
- Produces: `computePlans(input: BorrowerInput): PlanComparison`.

**Rules:**
- **New loan:** any loan with `disbursedOn >= "2026-07-01"`. Then only RAP and Tiered are available. IBR and STANDARD_10 get `unavailableReason: "A loan made on or after July 1, 2026 limits you to RAP or Tiered Standard"`.
- **No new loan:** Tiered is unavailable, with the reason `"Only for borrowers with a loan made on or after July 1, 2026"`.
- **Joint filing:** if `filingStatus === "mfj"`, the AGI used is `agi + (spouseAgi ?? 0)`.
- **PSLF-qualifying plans:** RAP, IBR and STANDARD_10. Never TIERED.
- `pslfTrack` = `employer !== "private"`.
- **Recommendation:** follows spec §5.4 exactly (the PSLF track, the balance-doesn't-grow filter, the tie-break). `reason` names the rule used.

**Rule references:**

| Plan | `ruleRefs` |
|---|---|
| RAP | `["34 CFR 685.209(b)(2)","34 CFR 685.209(f)(5)","34 CFR 685.209(h)(4)","34 CFR 685.209(o)(2)"]` |
| IBR | `["34 CFR 685.209(b)(4)","34 CFR 685.209(f)(3)","34 CFR 685.209(b)(13)(ii)"]` |
| STANDARD_10 | `["34 CFR 685.208(b)(1)"]` |
| TIERED | `["34 CFR 685.208(c)(1)","HEA §455(d)(7)(A)"]` |

**Warning IDs:**
- `new-loan-kills-ibr` (danger: shown when no new loan exists yet and the borrower isn't on a fixed plan; it warns them before they take one)
- `tiered-not-pslf` (danger, when on the PSLF track and Tiered is available)
- `idr-forgiveness-taxable` (info: "RAP/IBR forgiveness is federally taxable from 2026; PSLF is tax-free")
- `balance-grows` (warn)
- `parent-plus-unsupported`
- `ak-hi-approx`
- `save-deadline` (danger, when `currentPlan === "SAVE"`)

- [ ] **Step 1: Write the failing table test** over `SAMPLE_BORROWERS` from `lib/mocks.ts`. Assert each row's `[RAP, IBR, STANDARD_10, TIERED]` monthly payments (`null` = unavailable), `cheapestMonthly` and `recommended`:

  | Borrower | RAP | IBR | STANDARD_10 | TIERED | `cheapestMonthly` | `recommended` |
  |---|---|---|---|---|---|---|
  | F1 | 150.00 | 175.50 | 397.95 | null | RAP | RAP |
  | F2a | 229.17 | 258.83 | 454.19 | null | RAP | RAP |
  | F2b | 129.17 | 116.83 | 454.19 | null | IBR | RAP |
  | F3a | 229.17 | 388.25 | 454.19 | null | RAP | RAP |
  | F3b | 129.17 | 175.25 | 454.19 | null | RAP | RAP |
  | F4 (joint) | 1200.00 | 591.24 | 591.24 | null | IBR (tie → IBR) | IBR |
  | F5 | 10.00 | 0.00 | 284.25 | null | IBR | RAP |
  | F6 | 466.67 | null | null | 659.00 | RAP | RAP |

  Also assert:
  - F2b has a `balance-grows` warning;
  - F6 has `tiered-not-pslf`;
  - every result has non-empty `ruleRefs`;
  - `rulesAsOf === "2026-11-01"`.
- [ ] **Step 2:** Run `npx vitest run lib/engine/__tests__/compute.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `eligibility.ts`, `recommend.ts` and `compute.ts` as above. Fill `firstMonth` for RAP and `balanceChange12m` for every available plan.
- [ ] **Step 4:** Run `npx vitest run`. Expected: all engine and contract tests PASS.
- [ ] **Step 5:** Commit: `git commit -m "feat(engine): computePlans with eligibility, recommendation, warnings"`.

### Task 5: `compareFiling`: joint vs separate tax filing, with the tax estimate

**Files:**
- Create: `lib/engine/filing.ts`, `lib/engine/mfsTax.ts`
- Test: `lib/engine/__tests__/filing.test.ts`

**Interfaces:**
- Produces:
  - `mfsBracketPenalty(agiA: number, agiB: number): number`
  - `compareFiling(input: BorrowerInput & { spouseAgi: number }): FilingComparison`

**Rules:**
- **Joint:** `familySize = 2 + dependents`, AGI = `agi + spouseAgi`, prorate by `spouseEligibleBalance`.
- **Separate:** `familySize = 1 + dependents`, the borrower's own AGI, no proration.
- **Bracket penalty:**
  - H and L = each spouse's AGI − 16,100, with H the larger;
  - penalty = Σ Δrate × min(H − b, b − L) for every separate-return threshold b with L < b < H. Treat 0 as a threshold with a 10% step;
  - thresholds and steps: 12,400 (+2%), 50,400 (+10%), 105,700 (+2%), 201,775 (+8%), 256,225 (+3%), 384,350 (+2%).
- `netAnnualSavingMfs = round2((mfj.recommended payment − mfs.recommended payment) × 12 − mfsExtraTaxPerYear)`.
- **`caveats`** lists what a separate return loses: the student-loan interest deduction, education credits, the child-care credit (and a $2,500 cap on a dependent-care FSA), the EITC (with exceptions), the premium tax credit, Roth IRA eligibility, the new tips/overtime/senior deductions, the Child Tax Credit phase-out starting at $200k, and community-property states.

- [ ] **Step 1: Write the failing tests:**
  - `mfsBracketPenalty(60000, 90000)` → `650`
  - `mfsBracketPenalty(60000, 60000)` → `0`
  - `compareFiling(F4 with spouseAgi 90000)`:
    - `mfj.recommended === "IBR"` with payment `591.24`
    - `mfs.recommended === "RAP"` with payment `200.00`
    - `mfsExtraTaxPerYear === 650`
    - `netAnnualSavingMfs === 4044.88`
    - `caveats.length >= 6`
- [ ] **Step 2:** Run `npx vitest run lib/engine/__tests__/filing.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement as above.
- [ ] **Step 4:** Run the same command. Expected: PASS.
- [ ] **Step 5:** Commit: `git commit -m "feat(engine): MFJ vs MFS comparison with bracket penalty"`.

### Task 6: `buildActionPlan`: the dated action items

**Files:**
- Create: `lib/actions/buildActionPlan.ts`
- Modify: `lib/engine/index.ts` (re-export)
- Test: `lib/actions/__tests__/actions.test.ts`

**Interfaces:**
- Produces: `buildActionPlan(c: PlanComparison, today: Date): ActionItem[]`, sorted by `dueDate` ascending, with undated items last.

**Items (IDs fixed):**

| ID | When | Due | Detail |
|---|---|---|---|
| `apply-recommended` | always | today + 7 days | Title: "Apply for {plan} at StudentAid.gov or through your servicer (free)". `letterTemplateId: "plan_switch"`, for when the servicer doesn't act |
| `save-90-day` | `currentPlan === "SAVE"` and `saveNoticeDate` is set | `saveNoticeDate` + 90 days | — |
| `pslf-certify` | `pslfTrack` | today + 30 days | — |
| `recertify` | always | today + 365 days | Recertify income, or consent to IRS data sharing |
| `filing-status` | `filingStatus` is `mfj` or `mfs` | next April 15 | — |
| `no-new-loans` | a no-new-loan warning exists | undated | — |

- [ ] **Step 1: Write the failing tests.** Use `today = 2026-11-15` and the F2b comparison with `currentPlan: "SAVE"` and `saveNoticeDate: "2026-09-01"`:
  - `save-90-day.dueDate === "2026-11-30"`
  - `apply-recommended.dueDate === "2026-11-22"`
  - `recertify.dueDate === "2027-11-15"`
  - items are sorted by date
  - no item title contains "forgive" together with "guarantee"
- [ ] **Step 2:** Run `npx vitest run lib/actions`. Expected: FAIL.
- [ ] **Step 3:** Implement with ISO date strings (`YYYY-MM-DD`) computed in UTC.
- [ ] **Step 4:** Run `npx vitest run && npm run build`. Expected: PASS.
- [ ] **Step 5:** Commit and open a pull request: `git commit -m "feat(actions): dated action plan" && git push -u origin feat/engine`, then `gh pr create --base main --title "Engine: plans, filing comparison, action plan" --body "22/22 published checks + F1–F6 fixtures pass"`.
