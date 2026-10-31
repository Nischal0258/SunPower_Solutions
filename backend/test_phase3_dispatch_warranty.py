"""
test_phase3_dispatch_warranty.py — Verification test suite for Phase 3.
Validates:
  1. Warehouse Dispatch Queue listing
  2. Mandatory Serial Scanning Validation (Inverter/Battery check)
  3. Automatic 2-Year & 20-Year Warranty Clock Activation
  4. Field Job Listing & Mobile View
  5. Mandatory Digital Signature Gate for Field Handover
  6. Instant Warranty Verification Engine (Active vs Expired)
  7. Automated Helpdesk Billing Engine (Rs.0 Free Replacement vs Rs.14,500 Paid Invoice)
  8. Ticket Resolution Workflow
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


def run_phase3_tests():
    print("\n" + "=" * 70)
    print("  SunPower Solutions -- Phase 3 Dispatch & Warranty Engine")
    print("=" * 70 + "\n")

    # ── Test 1: Warehouse Dispatch Queue ────────────────────────────────
    print("[1] Warehouse Dispatch Queue")
    r_queue = client.get("/api/v1/dispatch/queue")
    check("GET /api/v1/dispatch/queue returns 200", r_queue.status_code == 200)
    queue_orders = r_queue.json()["data"]
    check("Queue contains orders ready for dispatch", len(queue_orders) >= 1, f"Count: {len(queue_orders)}")
    target_order = queue_orders[0]
    target_order_id = target_order["order_id"]
    print(f"       Target Order for Dispatch: {target_order_id} ({target_order['customer_name']})")

    # ── Test 2: Mandatory Serial Scanning Validation ────────────────────
    print("\n[2] Serial Scanning Gate & Validation")
    # Attempt dispatch with empty serials
    r_empty = client.post(
        f"/api/v1/dispatch/{target_order_id}/complete",
        json={"scanned_serials": [], "dispatched_by": "Vikram (Store Manager)"}
    )
    check("Empty serial numbers rejected (HTTP 400)", r_empty.status_code == 400)

    # Attempt dispatch missing Inverter serial
    r_no_inv = client.post(
        f"/api/v1/dispatch/{target_order_id}/complete",
        json={
            "scanned_serials": [{"category": "Structure", "item_name": "Stand", "serial_number": "STD-01"}],
            "dispatched_by": "Vikram"
        }
    )
    check("Missing inverter serial rejected (HTTP 400)", r_no_inv.status_code == 400)

    # ── Test 3: Complete Dispatch & Auto-Activate Warranty Clocks ───────
    print("\n[3] Dispatch Completion & Warranty Clock Activation")
    valid_serials = [
        {"category": "Inverter", "item_name": "3.3kW Grid Inverter", "serial_number": f"INV-TEST-{target_order_id[:8]}"},
        {"category": "Panels", "item_name": "Mono-PERC 540W Batch", "serial_number": f"PNL-LOT-{target_order_id[:8]}"},
    ]
    r_dispatch = client.post(
        f"/api/v1/dispatch/{target_order_id}/complete",
        json={"scanned_serials": valid_serials, "dispatched_by": "Vikram (Store Manager)"}
    )
    check("Valid dispatch accepted (HTTP 200)", r_dispatch.status_code == 200)
    dispatch_res = r_dispatch.json()["data"]
    check("Warehouse status updated to dispatched", dispatch_res["dispatch_status"] == "dispatched")
    check("Warranty clocks activated flag is True", dispatch_res["warranty_activated"] is True)

    w_records = dispatch_res["warranty_records"]
    inv_w = next((w for w in w_records if "INV" in w["serial_number"]), None)
    pnl_w = next((w for w in w_records if "PNL" in w["serial_number"]), None)
    check("Inverter 2-Year Warranty record created", inv_w is not None and inv_w["duration_years"] == 2)
    check("Panels 20-Year Warranty record created", pnl_w is not None and pnl_w["duration_years"] == 20)

    # ── Test 4: Field Installation Jobs ─────────────────────────────────
    print("\n[4] Field Installation Jobs")
    r_jobs = client.get("/api/v1/field/jobs")
    check("GET /api/v1/field/jobs returns 200", r_jobs.status_code == 200)
    jobs = r_jobs.json()["data"]
    check("Dispatched order appears in field jobs list", any(j["order_id"] == target_order_id for j in jobs))

    # ── Test 5: Mandatory Digital Signature Gate for Field Handover ─────
    print("\n[5] Field Handover & Digital Signature Gate")
    # Attempt complete handover without customer signature
    r_no_sig = client.post(
        f"/api/v1/field/jobs/{target_order_id}/complete",
        json={
            "technician_name": "Rajesh & Team",
            "actual_capacity_kw": 3.0,
            "roof_photo_url": "https://example.com/photos/roof_complete.jpg",
            "customer_signature_base64": "",  # Empty signature
            "homeowner_feedback": "Satisfied with work",
            "work_duration_hours": 5.5,
        }
    )
    check("Missing signature rejected (HTTP 400)", r_no_sig.status_code == 400)
    check("Signature requirement in error message", "signature is mandatory" in r_no_sig.json()["detail"].lower())

    # Valid handover with digital signature
    mock_signature = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    r_sig = client.post(
        f"/api/v1/field/jobs/{target_order_id}/complete",
        json={
            "technician_name": "Rajesh & Team",
            "actual_capacity_kw": 3.0,
            "roof_photo_url": "https://example.com/photos/roof_complete.jpg",
            "customer_signature_base64": mock_signature,
            "homeowner_feedback": "Excellent installation, net meter sync complete.",
            "work_duration_hours": 5.5,
        }
    )
    check("Valid handover with signature accepted (HTTP 200)", r_sig.status_code == 200)
    job_res = r_sig.json()["data"]
    check("Job status marked completed", job_res["status"] == "completed")
    check("Completion certificate ID issued", job_res["completion_certificate_id"].startswith("CERT-"))

    # ── Test 6: Instant Warranty Verification Engine ────────────────────
    print("\n[6] Instant Warranty Verification Engine (Scene 5)")
    # Test 6a: Active Warranty (Vikram Mehta)
    r_w_active = client.get("/api/v1/warranty/lookup?serial_number=INV-3KW-9021-X")
    check("Lookup active warranty returns 200", r_w_active.status_code == 200)
    active_data = r_w_active.json()["data"]
    check("Status is ACTIVE", active_data["status"] == "ACTIVE")
    check("Days remaining > 0", active_data["days_remaining"] > 0, f"Remaining: {active_data['days_remaining']} days")

    # Test 6b: Expired Warranty (Anil Agarwal - installed 28 months ago)
    r_w_exp = client.get("/api/v1/warranty/lookup?serial_number=INV-OLD-2024-99")
    check("Lookup expired warranty returns 200", r_w_exp.status_code == 200)
    exp_data = r_w_exp.json()["data"]
    check("Status is EXPIRED", exp_data["status"] == "EXPIRED")
    check("Days expired > 0", exp_data["days_expired"] > 0, f"Expired: {exp_data['days_expired']} days ago")

    # Test 6c: Unknown Serial
    r_w_unknown = client.get("/api/v1/warranty/lookup?serial_number=UNKNOWN-SERIAL-999")
    check("Non-existent serial returns 404", r_w_unknown.status_code == 404)

    # ── Test 7: Automated Breakdown Billing Engine ──────────────────────
    print("\n[7] Automated Breakdown Billing Engine (Rs.0 vs Paid Invoice)")
    # Case A: Active Warranty -> Rs.0 Free Replacement Work Order
    r_tkt_active = client.post(
        "/api/v1/tickets/create",
        json={
            "serial_number": "INV-3KW-9021-X",
            "customer_phone": "+91 98290 55443",
            "fault_code": "ERR-F24: Inverter Grid Disconnect",
            "customer_notes": "Heavy rains and inverter stopped generating",
        }
    )
    check("Create ticket for active warranty returns 200", r_tkt_active.status_code == 200)
    tkt_active_data = r_tkt_active.json()["data"]
    check("Active warranty flag is True", tkt_active_data["is_under_warranty"] is True)
    check("Billing amount = Rs.0 (FREE_WARRANTY_REPLACEMENT)", tkt_active_data["billing_amount"] == 0.0)
    check("Billing type = FREE_WARRANTY_REPLACEMENT", tkt_active_data["billing_type"] == "FREE_WARRANTY_REPLACEMENT")

    # Case B: Expired Warranty -> Auto-Generated Paid Repair Invoice (Rs.14,500)
    r_tkt_exp = client.post(
        "/api/v1/tickets/create",
        json={
            "serial_number": "INV-OLD-2024-99",
            "customer_phone": "+91 94140 12345",
            "fault_code": "ERR-F08: IGBT Short Circuit",
            "customer_notes": "Inverter burned out after thunderstorm",
        }
    )
    check("Create ticket for expired warranty returns 200", r_tkt_exp.status_code == 200)
    tkt_exp_data = r_tkt_exp.json()["data"]
    check("Expired warranty flag is False", tkt_exp_data["is_under_warranty"] is False)
    check("Auto-generated billing = Rs.14,500 (Parts Rs.13,000 + Labor Rs.1,500)", tkt_exp_data["billing_amount"] == 14500.0)
    check("Billing type = OUT_OF_WARRANTY_PAID", tkt_exp_data["billing_type"] == "OUT_OF_WARRANTY_PAID")

    # ── Test 8: Ticket Resolution Workflow ──────────────────────────────
    print("\n[8] Ticket Resolution Workflow")
    ticket_id = tkt_active_data["ticket_id"]
    r_resolve = client.patch(f"/api/v1/tickets/{ticket_id}/resolve")
    check("PATCH resolve ticket returns 200", r_resolve.status_code == 200)
    check("Ticket status is resolved", r_resolve.json()["data"]["status"] == "resolved")

    # ── Summary ─────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    passed = sum(1 for _, s in results if s == PASS)
    total = len(results)
    print(f"  RESULTS: {passed}/{total} checks passed")
    if passed == total:
        print("  Phase 3 COMPLETE -- Dispatch, Field & Warranty Engine verified!")
    else:
        print("  WARNING: Some checks failed. Review output above.")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    run_phase3_tests()
