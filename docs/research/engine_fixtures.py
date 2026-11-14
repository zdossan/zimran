"""Reference calculator + test fixtures for Student Loan Copilot.

Rules: 34 CFR 685.208-.209 (eCFR as of 2026-11-01), HEA 455(q) / 493C as amended by
P.L. 119-21, 2026 HHS poverty guidelines (91 FR 1797). See research/08a-rules-repayment-plans.md.
Run: python3 research/engine_fixtures.py
"""
from math import ceil

# 2026 HHS poverty guidelines, 48 states + DC (AK/HI tables in 08a §4)
FPL_2026 = {"base": 15960, "step": 5680}
FPL_2025 = {"base": 15650, "step": 5500}  # used only to reproduce CRS R48727 Table 4


def fpl(family_size, table=FPL_2026):
    return table["base"] + table["step"] * (family_size - 1)


def rap_rate(agi):
    """Whole-AGI band rate; bands are 'more than X and not more than Y'."""
    if agi <= 10_000:
        return None  # base payment is a flat $120/yr
    if agi > 100_000:
        return 0.10
    return (ceil(agi / 10_000) - 1) / 100


def rap_monthly(agi, dependents, own_bal=None, spouse_bal=None):
    """34 CFR 685.209(b)(2), (f)(5), (g)(3). own_bal/spouse_bal only for MFJ with a spouse who has eligible loans."""
    base = 120 if agi <= 10_000 else rap_rate(agi) * agi
    pay = max(10.0, base / 12 - 50 * dependents)
    if own_bal is not None and spouse_bal:
        pay = max(10.0, pay * own_bal / (own_bal + spouse_bal))
    return pay


def ibr_monthly(agi, family_size, new_borrower, cap, own_bal=None, spouse_bal=None, table=FPL_2026):
    """34 CFR 685.209(b)(4), (f)(2)-(3), (g)(1). cap = 10-yr standard at IBR entry (None = uncapped)."""
    di = max(0.0, agi - 1.5 * fpl(family_size, table))
    pay = (0.10 if new_borrower else 0.15) * di / 12
    if cap is not None:
        pay = min(pay, cap)
    if own_bal is not None and spouse_bal:
        pay = pay * own_bal / (own_bal + spouse_bal)
    if pay < 5:
        return 0.0
    if pay < 10:
        return 10.0
    return pay


def amort(principal, annual_rate, months):
    i = annual_rate / 12
    return principal * i / (1 - (1 + i) ** -months)


def standard_10yr(principal, annual_rate):
    return max(50.0, amort(principal, annual_rate, 120))


def tiered_term_months(total_direct_principal):
    if total_direct_principal < 25_000:
        return 120
    if total_direct_principal < 50_000:
        return 180
    if total_direct_principal < 100_000:
        return 240
    return 300


def tiered_standard(total_direct_principal, annual_rate):
    """Only for borrowers with >=1 Direct Loan made on/after 2026-07-01 (34 CFR 685.208(b)(8), (c)(1))."""
    return max(50.0, amort(total_direct_principal, annual_rate, tiered_term_months(total_direct_principal)))


def rap_month_benefits(principal, annual_rate, payment, on_time=True, in_forbearance=False):
    """One on-time RAP month with no older unpaid interest: interest waiver (685.209(h)(4)) and principal match (685.209(o)(2))."""
    interest = principal * annual_rate / 12
    if not on_time:
        return {"interest": interest, "waived": 0.0, "principal_paid": max(0.0, payment - interest), "match": 0.0}
    applied_interest = min(payment, interest)
    waived = interest - applied_interest
    principal_paid = max(0.0, payment - interest)
    match = 0.0
    if not in_forbearance and principal_paid < 50:
        match = max(0.0, min(50.0, payment) - principal_paid)
    return {"interest": interest, "waived": waived, "principal_paid": principal_paid, "match": match,
            "principal_drop": principal_paid + match}


def check(label, got, want, tol=0.01):
    ok = abs(got - want) <= tol
    print(f"  [{'OK ' if ok else 'FAIL'}] {label}: got {got:,.2f}, expected {want:,.2f}")
    return ok


def published_checks():
    print("A. Reproduce published examples")
    r = []
    # WE-1 Federal Register 91 FR 23866: couple, AGI 27,500 each, $20k debt each, no dependents
    r.append(check("WE-1 RAP MFJ combined (FR: $229)", rap_monthly(55_000, 0), 229.17))
    r.append(check("WE-1 RAP MFJ each after proration", rap_monthly(55_000, 0, 20_000, 20_000), 114.58))
    r.append(check("WE-1 RAP MFS each (FR: $46)", rap_monthly(27_500, 0), 45.83))
    # WE-2 ED fact sheet 2026-06-09: single, AGI 45,000 -> RAP $150, prior IDR $176
    r.append(check("WE-2 RAP (ED: $150)", rap_monthly(45_000, 0), 150.00))
    r.append(check("WE-2 IBR/PAYE 10% (ED: $176)", ibr_monthly(45_000, 1, True, None), 175.50))
    # WE-3 ED fact sheet: $30,000 -> 10-yr $341, Tiered 15-yr $262 (rate 6.53% inferred in 08a)
    r.append(check("WE-3 10-yr standard (ED: $341)", standard_10yr(30_000, 0.0653), 341.0, tol=0.5))
    r.append(check("WE-3 Tiered 15-yr (ED: $262)", tiered_standard(30_000, 0.0653), 262.0, tol=0.5))
    # WE-5 FSA slides: AGI 95k/0 dep, 65k/2 dep, 25k/1 dep
    r.append(check("WE-5a RAP AGI 95k (FSA: $712.50)", rap_monthly(95_000, 0), 712.50))
    r.append(check("WE-5b RAP AGI 65k, 2 dep (FSA: $225)", rap_monthly(65_000, 2), 225.00))
    r.append(check("WE-5c RAP AGI 25k, 1 dep (FSA: $10)", rap_monthly(25_000, 1), 10.00))
    # WE-7 FSA slides: match = min(50, payment) - principal portion
    r.append(check("WE-7a match, pay 205 / $5 principal (FSA: $45)", max(0, min(50, 205) - 5), 45.0))
    r.append(check("WE-7b match, pay 10 / $0 principal (FSA: $10)", max(0, min(50, 10) - 0), 10.0))
    # WE-10 ED 2026 ICR notice amortizer: $10,000 @ 6%, 144 months -> $97.59
    r.append(check("WE-10 amortizer (ED: $97.59)", amort(10_000, 0.06, 144), 97.59))
    # WE-9 CRS R48727 Table 4 (2025 FPL, no cap, whole dollars)
    r.append(check("CRS single 50k RAP ($167)", round(rap_monthly(50_000, 0)), 167, tol=0))
    r.append(check("CRS single 50k new IBR ($221)", round(ibr_monthly(50_000, 1, True, None, table=FPL_2025)), 221, tol=0))
    r.append(check("CRS single 50k orig IBR 15% ($332)", round(ibr_monthly(50_000, 1, False, None, table=FPL_2025)), 332, tol=0))
    r.append(check("CRS single 1 dep 80k RAP ($417)", round(rap_monthly(80_000, 1)), 417, tol=0))
    r.append(check("CRS married 1 dep 100k new IBR ($500)", round(ibr_monthly(100_000, 3, True, None, table=FPL_2025)), 500, tol=0))
    r.append(check("CRS married 1 dep 150k RAP ($1,200)", round(rap_monthly(150_000, 1)), 1200, tol=0))
    # WE-11 boundaries
    r.append(check("Boundary AGI 50,000.00 -> 4%", rap_monthly(50_000.00, 0), 166.67))
    r.append(check("Boundary AGI 50,000.01 -> 5%", rap_monthly(50_000.01, 0), 208.33))
    r.append(check("Boundary AGI 0 -> $10", rap_monthly(0, 0), 10.00))
    print(f"  {sum(r)}/{len(r)} published checks pass\n")
    return all(r)


FIXTURES = [
    {
        "id": "F1", "name": "ED fact-sheet single borrower (published anchor)",
        "agi": 45_000, "filing": "single", "dependents": 0, "family_size": 1, "state": "48 states/DC",
        "balance": 35_000, "rate": 0.0653, "disbursed": "2016-09 to 2020-01 (no balance before)",
        "new_borrower": True, "has_post_2026_loan": False, "employer": "private",
    },
    {
        "id": "F2a", "name": "Kids flip, no kids (IBR new borrower 10%)",
        "agi": 55_000, "filing": "single", "dependents": 0, "family_size": 1, "state": "48 states/DC",
        "balance": 40_000, "rate": 0.065, "disbursed": "2015-08 to 2019-05 (no balance before)",
        "new_borrower": True, "has_post_2026_loan": False, "employer": "private",
    },
    {
        "id": "F2b", "name": "Kids flip, same borrower with 2 kids (head of household)",
        "agi": 55_000, "filing": "head of household", "dependents": 2, "family_size": 3, "state": "48 states/DC",
        "balance": 40_000, "rate": 0.065, "disbursed": "2015-08 to 2019-05 (no balance before)",
        "new_borrower": True, "has_post_2026_loan": False, "employer": "private",
    },
    {
        "id": "F3a", "name": "Pre-2014 borrower (IBR 15%), single",
        "agi": 55_000, "filing": "single", "dependents": 0, "family_size": 1, "state": "48 states/DC",
        "balance": 40_000, "rate": 0.065, "disbursed": "2009-09 to 2013-05 (balance on 2014-07-01)",
        "new_borrower": False, "has_post_2026_loan": False, "employer": "private",
    },
    {
        "id": "F3b", "name": "Pre-2014 borrower (IBR 15%), 2 kids: no flip",
        "agi": 55_000, "filing": "head of household", "dependents": 2, "family_size": 3, "state": "48 states/DC",
        "balance": 40_000, "rate": 0.065, "disbursed": "2009-09 to 2013-05 (balance on 2014-07-01)",
        "new_borrower": False, "has_post_2026_loan": False, "employer": "private",
    },
    {
        "id": "F4", "name": "Married teacher (Maya): MFJ vs MFS, spouse has no loans",
        "agi": 60_000, "spouse_agi": 90_000, "filing": "married", "dependents": 1, "state": "48 states/DC",
        "family_size_mfj": 3, "family_size_mfs": 2,
        "balance": 52_000, "rate": 0.0653, "disbursed": "2012-09 to 2016-05 (balance on 2014-07-01)",
        "new_borrower": False, "has_post_2026_loan": False, "employer": "public school (PSLF-eligible)",
    },
    {
        "id": "F5", "name": "Low income: $10 minimum and principal match",
        "agi": 12_000, "filing": "head of household", "dependents": 1, "family_size": 2, "state": "48 states/DC",
        "balance": 25_000, "rate": 0.0653, "disbursed": "2017-09 to 2021-05 (no balance before)",
        "new_borrower": True, "has_post_2026_loan": False, "employer": "private (retail)",
    },
    {
        "id": "F6", "name": "Took a new loan on/after 2026-07-01: IBR lost for ALL loans",
        "agi": 80_000, "filing": "single", "dependents": 0, "family_size": 1, "state": "48 states/DC",
        "balance": 85_000, "rate": 0.07, "disbursed": "2016-2020 ($60k) + 2026-08 grad loan ($25k)",
        "new_borrower": True, "has_post_2026_loan": True, "employer": "nonprofit hospital (PSLF-eligible)",
    },
]


def run_fixture(f):
    print(f"{f['id']} {f['name']}")
    std = standard_10yr(f["balance"], f["rate"])
    if f["id"] == "F4":
        mfj_agi = f["agi"] + f["spouse_agi"]
        rows = {
            "RAP (MFJ, joint AGI 150k, 1 dep)": rap_monthly(mfj_agi, f["dependents"]),
            "RAP (MFS, own AGI 60k, child on her return)": rap_monthly(f["agi"], f["dependents"]),
            "IBR 15% (MFJ, family 3)": ibr_monthly(mfj_agi, f["family_size_mfj"], False, std),
            "IBR 15% (MFS, family 2)": ibr_monthly(f["agi"], f["family_size_mfs"], False, std),
            "10-yr Standard": std,
        }
    elif f["has_post_2026_loan"]:
        rows = {
            "RAP": rap_monthly(f["agi"], f["dependents"]),
            f"Tiered Standard ({tiered_term_months(f['balance']) // 12} yrs)": tiered_standard(f["balance"], f["rate"]),
            "IBR": None,
            "10-yr Standard": None,
        }
    else:
        rows = {
            "RAP": rap_monthly(f["agi"], f["dependents"]),
            f"IBR {'10%' if f['new_borrower'] else '15%'} (cap = 10-yr std)": ibr_monthly(
                f["agi"], f["family_size"], f["new_borrower"], std),
            "10-yr Standard": std,
            "Tiered Standard": None,
        }
    for k, v in rows.items():
        print(f"    {k:<48} {'not available' if v is None else f'${v:,.2f}/mo'}")
    rap = rows.get("RAP") or rows.get("RAP (MFS, own AGI 60k, child on her return)")
    b = rap_month_benefits(f["balance"], f["rate"], rap)
    print(f"    RAP month 1: interest ${b['interest']:,.2f}, waived ${b['waived']:,.2f}, "
          f"principal paid ${b['principal_paid']:,.2f}, match ${b['match']:,.2f}, "
          f"balance falls ${b['principal_drop']:,.2f}")
    print()
    return rows


if __name__ == "__main__":
    ok = published_checks()
    print("B. Engine test fixtures (monthly payment, 2026 FPL, 48 states/DC)\n")
    for f in FIXTURES:
        run_fixture(f)
    raise SystemExit(0 if ok else 1)
