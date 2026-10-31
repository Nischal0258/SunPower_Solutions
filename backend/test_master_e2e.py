"""
test_master_e2e.py — Complete End-to-End Master Test Suite for SunPower Solutions.
Simulates the entire operational journey through all 6 Scenes + AI Multipliers:

  Scene 1: AI Bill Scan -> Lead Intake -> Technical Site Survey Gate (Quotation Unlocked)
  Scene 2: Pre-Engineered 3kW On-Grid BOM -> Quotation -> 20% Advance Payment Received
  Scene 3: Warehouse Dispatch -> Mandatory Barcode Scanning -> 2-Yr & 20-Yr Warranty Clocks
  Scene 4: Field Installation -> AI Roof Quality Inspection -> Customer Signature On Glass
  Scene 5: Monsoon Breakdown -> Warranty Lookup -> AI Fault Diagnosis -> Rs.0 Free Work Order
  Scene 6: Director Executive Dashboard -> Real-Time P&L, 26%+ Margin, Subsidy Funnel
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


def step(num: int, title: str):
    print(f"\n{'='*70}\n  SCENE {num}: {title}\n{'='*70}")


def check(name: str, condition: bool, detail: str = ""):
    status = PASS if condition else FAIL
    results.append((name, status))
    print(f"  {status} {name}" + (f" -- {detail}" if detail else ""))


def run_master_e2e():
    print("\n" + "#" * 70)
    print("  SUNPOWER SOLUTIONS -- COMPLETE MASTER E2E LIFECYCLE TEST")
    print("#" * 70)

    # ────────────────────────────────────────────────────────────────────
    # SCENE 1: Rooftop Inquiry & Feasibility Gate
    # ────────────────────────────────────────────────────────────────────
    step(1, "Rooftop Inquiry, AI Bill Scan & Survey Approval Gate")

    # Step 1a: Customer scans bill with AI
    r_ai_bill = client.post("/api/v1/ai/analyze-bill")
    check("AI Bill Scan returns recommended kW", r_ai_bill.status_code == 200)
    ai_kw = r_ai_bill.json()["data"]["recommended_capacity_kw"]
    check("AI recommends 3-4 kW for average household", ai_kw in [3.0, 4.0], f"Recommended: {ai_kw} kW")

    # Step 1b: Lead Intake
    lead_payload = {
        "customer_name": "Devendra Singhania",
        "phone": "+91 97850 44332",
        "email": "singhania.dev@example.com",
        "address": "Villa 12, Queens Road, Jaipur",
        "property_type": "Residential",
        "monthly_bill": 5200.0,
        "shadow_free_area_sqft": 420.0,
        "requested_capacity_kw": 3.0,
        "system_type": "On-Grid",
    }
    r_lead = client.post("/api/v1/leads", json=lead_payload)
    check("Lead created (201 Created)", r_lead.status_code == 201)
    lead_id = r_lead.json()["data"]["id"]

    # Step 1c: Check Quotation Lock Gate (Survey NOT yet approved)
    r_locked = client.post(f"/api/v1/quotes/generate?lead_id={lead_id}")
    check("Quotation generation LOCKED before survey approval (HTTP 400)", r_locked.status_code == 400)

    # Step 1d: Field Technician submits & approves Site Survey
    survey_payload = {
        "roof_tilt_deg": 22.5,
        "roof_direction": "South-Facing",
        "cable_distance_meters": 26.0,
        "shadow_obstruction": "Zero Shade",
        "earthing_resistance_ohms": 3.6,
        "surveyor_name": "Manoj Kumar",
        "approved": True,
        "notes": "Excellent reinforced concrete roof. Unshaded azimuth.",
    }
    r_survey = client.post(f"/api/v1/leads/{lead_id}/survey", json=survey_payload)
    check("Survey approved by technician", r_survey.status_code == 200 and r_survey.json()["data"]["approved"] is True)
    check("Quotation unlocked flag is True", r_survey.json()["data"]["quote_unlocked"] is True)

    # ────────────────────────────────────────────────────────────────────
    # SCENE 2: The Kit, Auto-BOM & Staged Payment
    # ────────────────────────────────────────────────────────────────────
    step(2, "Pre-Engineered Auto-BOM & Staged Payment Confirmation")

    # Step 2a: Retrieve BOM Template
    r_bom = client.get("/api/v1/templates/bom?capacity_kw=3.0&system_type=On-Grid")
    check("Pre-Engineered 3kW On-Grid BOM retrieved", r_bom.status_code == 200)
    bom_data = r_bom.json()["data"]
    check("PM Surya Ghar Central Subsidy = Rs.78,000", bom_data["estimated_subsidy"] == 78000)
    check("Net customer payable calculated correctly", bom_data["net_customer_price"] == bom_data["total_base_price"] - 78000)

    # Step 2b: Generate Official Quotation
    r_quote = client.post(f"/api/v1/quotes/generate?lead_id={lead_id}")
    check("Official Quotation generated (200 OK)", r_quote.status_code == 200)

    # Step 2c: Record Staged Advance Payment (30,000 INR > 20% advance)
    pay_payload = {
        "payment_type": "advance",
        "amount_paid": 30000.0,
        "payment_method": "NEFT / Bank Transfer",
        "reference_id": "NEFT-HDFC-88992211",
    }
    r_pay = client.post(f"/api/v1/quotes/{lead_id}/confirm", json=pay_payload)
    check("Advance payment received (200 OK)", r_pay.status_code == 200)
    order_id = r_pay.json()["data"]["order_id"]
    check("Order queued for warehouse packing (ready_for_dispatch)", r_pay.json()["data"]["warehouse_status"] == "ready_for_dispatch")

    # ────────────────────────────────────────────────────────────────────
    # SCENE 3: Warehouse Dispatch & Serial Number Barcode Engine
    # ────────────────────────────────────────────────────────────────────
    step(3, "Warehouse Dispatch & Serial Number Barcode Scanning")

    # Step 3a: Verify order in dispatch queue
    r_queue = client.get("/api/v1/dispatch/queue")
    check("Order present in dispatch queue", any(o["order_id"] == order_id for o in r_queue.json()["data"]))

    # Step 3b: Scan barcode serial numbers
    inv_serial = f"INV-3KW-SINGHANIA-{order_id[:6]}"
    pnl_serial = f"PNL-LOT-SINGHANIA-{order_id[:6]}"
    dispatch_payload = {
        "scanned_serials": [
            {"category": "Inverter", "item_name": "3.3kW Single Phase Inverter", "serial_number": inv_serial},
            {"category": "Panels", "item_name": "540W Mono-PERC Master Lot", "serial_number": pnl_serial},
        ],
        "dispatched_by": "Vikram (Warehouse Manager)",
    }
    r_dispatch = client.post(f"/api/v1/dispatch/{order_id}/complete", json=dispatch_payload)
    check("Dispatch completed successfully", r_dispatch.status_code == 200)
    dispatch_data = r_dispatch.json()["data"]
    check("Warranty clocks activated flag is True", dispatch_data["warranty_activated"] is True)

    warr_records = dispatch_data["warranty_records"]
    inv_warr = next((w for w in warr_records if w["serial_number"] == inv_serial), None)
    pnl_warr = next((w for w in warr_records if w["serial_number"] == pnl_serial), None)
    check("Inverter 2-Year Warranty Clock started", inv_warr is not None and inv_warr["duration_years"] == 2)
    check("Panels 20-Year Performance Clock started", pnl_warr is not None and pnl_warr["duration_years"] == 20)

    # ────────────────────────────────────────────────────────────────────
    # SCENE 4: Field Technician Handover & Customer Acceptance
    # ────────────────────────────────────────────────────────────────────
    step(4, "On-Roof Field Handover, AI Quality Check & Customer Signature")

    # Step 4a: Field crew checks assigned jobs
    r_jobs = client.get("/api/v1/field/jobs")
    check("Job appears in field tech queue", any(j["order_id"] == order_id for j in r_jobs.json()["data"]))

    # Step 4b: AI Roof Quality Inspection
    r_ai_roof = client.post("/api/v1/ai/inspect-roof-photo")
    check("AI Vision Quality Check completed", r_ai_roof.status_code == 200)
    check("Roof installation score >= 90", r_ai_roof.json()["data"]["overall_score"] >= 90)

    # Step 4c: Customer signs on screen
    mock_canvas_sig = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
    handover_payload = {
        "technician_name": "Rajesh & Team",
        "actual_capacity_kw": 3.0,
        "roof_photo_url": "https://storage.sunpower.in/installs/singhania_roof.jpg",
        "customer_signature_base64": mock_canvas_sig + "A" * 30,
        "homeowner_feedback": "Fast installation, inverter commissioned and generating power.",
        "work_duration_hours": 6.0,
    }
    r_handover = client.post(f"/api/v1/field/jobs/{order_id}/complete", json=handover_payload)
    check("Installation signed off on screen (200 OK)", r_handover.status_code == 200)
    check("Digital completion certificate issued", r_handover.json()["data"]["completion_certificate_id"].startswith("CERT-"))

    # ────────────────────────────────────────────────────────────────────
    # SCENE 5: Rainy Season Breakdown & Warranty Engine
    # ────────────────────────────────────────────────────────────────────
    step(5, "Rainy Season Breakdown & Automated Warranty Billing")

    # Step 5a: Customer calls support with inverter error
    r_lookup = client.get(f"/api/v1/warranty/lookup?serial_number={inv_serial}")
    check("Instant Warranty Lookup returns 200", r_lookup.status_code == 200)
    check("Warranty is ACTIVE with days remaining", r_lookup.json()["data"]["status"] == "ACTIVE")

    # Step 5b: Support diagnoses fault with AI Assistant
    r_ai_fault = client.post(
        "/api/v1/ai/diagnose-fault",
        json={"fault_code": "ERR-F24", "customer_notes": "Heavy rains and grid disconnected"}
    )
    check("AI Fault Diagnostic translates error code", r_ai_fault.status_code == 200)
    check("Technician checklist provided by AI", len(r_ai_fault.json()["data"]["technician_checklist"]) >= 3)

    # Step 5c: Automated Billing Engine creates Rs.0 Free Replacement
    ticket_payload = {
        "serial_number": inv_serial,
        "customer_phone": "+91 97850 44332",
        "fault_code": "ERR-F24: Grid Loss",
        "customer_notes": "Heavy thunderstorm in Jaipur",
    }
    r_ticket = client.post("/api/v1/tickets/create", json=ticket_payload)
    check("Support ticket generated", r_ticket.status_code == 200)
    tkt_data = r_ticket.json()["data"]
    check("Active warranty recognized", tkt_data["is_under_warranty"] is True)
    check("Billing amount is exactly Rs.0", tkt_data["billing_amount"] == 0.0)
    check("Billing type = FREE_WARRANTY_REPLACEMENT", tkt_data["billing_type"] == "FREE_WARRANTY_REPLACEMENT")

    # ────────────────────────────────────────────────────────────────────
    # SCENE 6: Director Month-End Executive Dashboard
    # ────────────────────────────────────────────────────────────────────
    step(6, "Director Executive Dashboard & Real-Time P&L")

    r_dash = client.get("/api/v1/analytics/dashboard")
    check("Dashboard loads in real time (200 OK)", r_dash.status_code == 200)
    dash_data = r_dash.json()["data"]

    check("Monthly Revenue > Rs.70 Lakhs", dash_data["total_revenue"] > 7000000.0, f"Rs.{dash_data['total_revenue']:,.2f}")
    check("Gross Margin > 25%", dash_data["gross_margin_pct"] >= 25.0, f"Margin: {dash_data['gross_margin_pct']}%")
    check("Subsidy Pipeline value tracked (> Rs.25 Lakhs)", dash_data["subsidy_pipeline"]["total_subsidy_value_in_pipeline"] > 2500000.0)
    check("Devendra Singhania job appears in recent jobs P&L", any("Singhania" in j["customer"] for j in dash_data["recent_jobs"]))

    # ────────────────────────────────────────────────────────────────────
    # FINAL SUMMARY
    # ────────────────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    passed = sum(1 for _, s in results if s == PASS)
    total = len(results)
    print(f"  MASTER E2E RESULTS: {passed}/{total} checks passed")
    if passed == total:
        print("  ALL 6 SCENES + AI VERIFIED! 100% OPERATIONAL PIPELINE! SUCCESS!")
    else:
        print("  WARNING: Some checks failed. Review output above.")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    run_master_e2e()
