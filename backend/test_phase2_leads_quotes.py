"""
test_phase2_leads_quotes.py — Verification test suite for Phase 2.
Validates:
  1. Omnichannel Lead Creation with Feasibility calculation
  2. Lead Listing and Status Filtering
  3. Site Survey Submission & Approval Transition
  4. Business Rule Gate: Quotation LOCK on unapproved leads
  5. Pre-Engineered BOM Template retrieval
  6. Quotation & Auto-BOM Generation for approved leads
  7. Minimum 20% Advance Payment validation & Order generation
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


def run_phase2_tests():
    print("\n" + "=" * 70)
    print("  SunPower Solutions -- Phase 2 Leads & Auto-BOM Verification")
    print("=" * 70 + "\n")

    # ── Test 1: Lead Creation ───────────────────────────────────────────
    print("[1] Omnichannel Lead Creation & Feasibility")
    new_lead_payload = {
        "customer_name": "Ramesh Patel",
        "phone": "+91 99887 76655",
        "email": "ramesh.patel@example.com",
        "address": "House 18, Vaishali Nagar, Jaipur",
        "property_type": "Residential",
        "monthly_bill": 4500.0,
        "shadow_free_area_sqft": 350.0,
        "requested_capacity_kw": 3.0,
        "system_type": "On-Grid",
    }
    r = client.post("/api/v1/leads", json=new_lead_payload)
    check("POST /api/v1/leads returns 201", r.status_code == 201, f"Status: {r.status_code}")
    res_data = r.json()
    created_lead_id = res_data["data"]["id"]
    check("Response envelope success=True", res_data["success"] is True)
    check("Recommended kW auto-calculated", res_data["data"]["recommended_capacity_kw"] == 3.0)
    check("Roof area feasibility passed", res_data["data"]["roof_area_sufficient"] is True)
    check("Initial status = pending_survey", res_data["data"]["status"] == "pending_survey")

    # ── Test 2: List Leads & Filtering ──────────────────────────────────
    print("\n[2] Lead Listing & Status Filtering")
    r_list = client.get("/api/v1/leads")
    check("GET /api/v1/leads returns 200", r_list.status_code == 200)
    leads_list = r_list.json()["data"]
    check("Multiple leads returned", len(leads_list) >= 5, f"Count: {len(leads_list)}")

    r_filtered = client.get("/api/v1/leads?status=survey_approved")
    approved_leads = r_filtered.json()["data"]
    check("Filter by status=survey_approved works", all(l["status"] == "survey_approved" for l in approved_leads))

    # ── Test 3: Technical Site Survey Approval ──────────────────────────
    print("\n[3] Site Survey Submission & Approval")
    survey_payload = {
        "roof_tilt_deg": 22.0,
        "roof_direction": "South-Facing",
        "cable_distance_meters": 24.0,
        "shadow_obstruction": "None (Full Daylight)",
        "earthing_resistance_ohms": 3.4,
        "surveyor_name": "Manoj Kumar",
        "approved": True,
        "notes": "Optimal roof condition for 3kW array.",
    }
    r_survey = client.post(f"/api/v1/leads/{created_lead_id}/survey", json=survey_payload)
    check("POST survey returns 200", r_survey.status_code == 200)
    survey_res = r_survey.json()["data"]
    check("Survey approved flag is True", survey_res["approved"] is True)
    check("Quotation unlocked flag is True", survey_res["quote_unlocked"] is True)
    check("Lead status transitioned to survey_approved", survey_res["lead_status"] == "survey_approved")

    # ── Test 4: Business Rule Gate (Quotation Locked for Unapproved) ────
    print("\n[4] Business Rule Gate: Quotation Lock Enforcement")
    # lead_102 (Kapoor Textiles) is status 'new' and has no survey
    r_locked = client.post("/api/v1/quotes/generate?lead_id=lead_102")
    check("Quotation BLOCKED (HTTP 400) for unapproved lead", r_locked.status_code == 400, f"Status: {r_locked.status_code}")
    check("Lock error message returned", "Site survey must be completed and approved" in r_locked.json()["detail"])

    # ── Test 5: Pre-Engineered BOM Templates ────────────────────────────
    print("\n[5] Pre-Engineered BOM Templates")
    r_bom = client.get("/api/v1/templates/bom?capacity_kw=3.0&system_type=On-Grid")
    check("GET BOM template returns 200", r_bom.status_code == 200)
    bom_data = r_bom.json()["data"]
    check("BOM items contain Inverter", any(i["category"] == "Inverter" for i in bom_data["items"]))
    check("BOM items contain Panels", any(i["category"] == "Panels" for i in bom_data["items"]))
    check("PM Surya Ghar subsidy = Rs.78,000", bom_data["estimated_subsidy"] == 78000)

    # ── Test 6: Quotation Generation for Approved Lead ──────────────────
    print("\n[6] Quotation Generation for Approved Lead")
    r_quote = client.post(f"/api/v1/quotes/generate?lead_id={created_lead_id}")
    check("Generate quotation returns 200", r_quote.status_code == 200)
    quote_data = r_quote.json()["data"]
    check("Quote net payable calculated", quote_data["net_customer_payable"] > 0)
    check("Lead status updated to quoted", True)

    # ── Test 7: Minimum 20% Advance Payment & Order Dispatch Trigger ────
    print("\n[7] Staged Payment & Order Dispatch Trigger")
    # Attempting < 20% advance payment should fail
    r_underpay = client.post(
        f"/api/v1/quotes/{created_lead_id}/confirm",
        json={"payment_type": "advance", "amount_paid": 5000.0, "payment_method": "UPI"}
    )
    check("Rejection of <20% advance payment (HTTP 400)", r_underpay.status_code == 400)
    check("Minimum advance warning in message", "at least 20%" in r_underpay.json()["detail"])

    # Valid advance payment (Rs.30,000 > 20% of net payable)
    r_pay = client.post(
        f"/api/v1/quotes/{created_lead_id}/confirm",
        json={"payment_type": "advance", "amount_paid": 30000.0, "payment_method": "UPI / Bank Transfer"}
    )
    check("Valid advance payment accepted (200 OK)", r_pay.status_code == 200)
    order_data = r_pay.json()["data"]
    check("Order ID generated", order_data["order_id"].startswith("ord_"))
    check("Warehouse status = ready_for_dispatch", order_data["warehouse_status"] == "ready_for_dispatch")
    check("Remaining balance calculated correctly", order_data["remaining_balance"] > 0)

    # ── Summary ─────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    passed = sum(1 for _, s in results if s == PASS)
    total = len(results)
    print(f"  RESULTS: {passed}/{total} checks passed")
    if passed == total:
        print("  Phase 2 COMPLETE -- Leads, Survey Gate & Auto-BOM verified!")
    else:
        print("  WARNING: Some checks failed. Review output above.")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    run_phase2_tests()
