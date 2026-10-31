"""
test_phase4_analytics.py — Verification test suite for Phase 4.
Validates:
  1. Executive Dashboard endpoint response envelope
  2. Financial Math Integrity:
     - Gross Profit = Total Revenue - Total Hardware Cost - Total Labor Cost
     - Gross Margin % = (Gross Profit / Total Revenue) * 100
  3. Job-by-Job Profitability Math:
     - Profit per job = Revenue - BOM Cost - Labor Cost
     - Margin % per job = (Profit / Revenue) * 100
  4. Government Subsidy Pipeline metrics (Submitted -> Inspected -> Disbursed)
  5. Open Support Tickets synchronization
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

PASS = "[PASS]"
FAIL = "[FAIL]"
results = []


def check(name: str, condition: bool, detail: str = ""):
    status = PASS if condition else FAIL
    results.append((name, status))
    print(f"  {status} {name}" + (f" -- {detail}" if detail else ""))


def run_phase4_tests():
    print("\n" + "=" * 70)
    print("  SunPower Solutions -- Phase 4 Director Analytics & P&L")
    print("=" * 70 + "\n")

    # ── Test 1: Dashboard Endpoint Structure ────────────────────────────
    print("[1] Executive Dashboard Endpoint")
    r = client.get("/api/v1/analytics/dashboard")
    check("GET /api/v1/analytics/dashboard returns 200", r.status_code == 200)
    body = r.json()
    check("Response envelope success=True", body["success"] is True)

    data = body["data"]
    required_keys = [
        "month", "total_revenue", "total_hardware_cost", "total_labor_cost",
        "gross_profit", "gross_margin_pct", "active_projects", "completed_this_month",
        "subsidy_pipeline", "open_tickets", "recent_jobs"
    ]
    for k in required_keys:
        check(f"Key '{k}' present in dashboard data", k in data)

    # ── Test 2: Financial Math Integrity ────────────────────────────────
    print("\n[2] Financial Math Integrity")
    rev = data["total_revenue"]
    hw = data["total_hardware_cost"]
    labor = data["total_labor_cost"]
    profit = data["gross_profit"]
    margin = data["gross_margin_pct"]

    expected_profit = round(rev - hw - labor, 2)
    expected_margin = round((profit / rev * 100.0), 1)

    check("Gross Profit = Revenue - HW - Labor", abs(profit - expected_profit) < 1.0, f"Profit: Rs.{profit:,.2f}")
    check("Gross Margin % = (Profit / Revenue) * 100", abs(margin - expected_margin) < 0.2, f"Margin: {margin}%")
    check("Healthy Margin (> 20%)", margin > 20.0, f"Actual: {margin}%")

    # ── Test 3: Job-by-Job Profit Breakdown ─────────────────────────────
    print("\n[3] Job-by-Job Profitability Breakdown")
    jobs = data["recent_jobs"]
    check("Recent jobs list is populated", len(jobs) >= 3, f"Jobs count: {len(jobs)}")

    all_jobs_math_valid = True
    for job in jobs:
        j_rev = job["revenue"]
        j_bom = job["bom_cost"]
        j_labor = job["labor_cost"]
        j_profit = job["profit"]
        j_margin = job["margin_pct"]

        exp_j_profit = round(j_rev - j_bom - j_labor, 2)
        exp_j_margin = round((j_profit / j_rev * 100.0), 1) if j_rev > 0 else 0.0

        if abs(j_profit - exp_j_profit) > 1.0 or abs(j_margin - exp_j_margin) > 0.2:
            all_jobs_math_valid = False
            print(f"       Failed for job {job['id']} ({job['customer']})")

    check("Every individual job satisfies: Profit = Revenue - BOM - Labor", all_jobs_math_valid)

    # ── Test 4: Subsidy Tracking Funnel ─────────────────────────────────
    print("\n[4] Subsidy Tracking Funnel")
    sub = data["subsidy_pipeline"]
    check("Subsidy pipeline submitted count >= 18", sub["submitted"] >= 18, f"Submitted: {sub['submitted']}")
    check("Subsidy pipeline inspected count >= 12", sub["discom_inspected"] >= 12, f"Inspected: {sub['discom_inspected']}")
    check("Subsidy pipeline disbursed count >= 10", sub["disbursed"] >= 10, f"Disbursed: {sub['disbursed']}")
    check("Total subsidy value calculated (> Rs.20L)", sub["total_subsidy_value_in_pipeline"] > 2000000.0, f"Value: Rs.{sub['total_subsidy_value_in_pipeline']:,.2f}")

    # ── Test 5: Open Support Tickets ────────────────────────────────────
    print("\n[5] Support Tickets Count")
    check("Open tickets metric is an integer", isinstance(data["open_tickets"], int))
    check("Completed this month >= 36", data["completed_this_month"] >= 36, f"Count: {data['completed_this_month']}")

    # ── Summary ─────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    passed = sum(1 for _, s in results if s == PASS)
    total = len(results)
    print(f"  RESULTS: {passed}/{total} checks passed")
    if passed == total:
        print("  Phase 4 COMPLETE -- Director Analytics & P&L verified!")
    else:
        print("  WARNING: Some checks failed. Review output above.")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    run_phase4_tests()
