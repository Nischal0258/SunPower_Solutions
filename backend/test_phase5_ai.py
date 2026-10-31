"""
test_phase5_ai.py — Verification test suite for Phase 5 (Gemini AI Multipliers).
Validates:
  1. Multimodal AI Electricity Bill OCR & kW Recommender
  2. Computer Vision Roof Quality & Earthing Inspector
  3. Inverter Error Code Diagnostic Assistant across critical fault scenarios:
     - ERR-F24 (Grid Disconnect / Monsoon Voltage Drop)
     - ERR-F08 (IGBT Short / Lightning Strike)
     - ERR-ISO (Insulation Resistance Low / Moisture Ground Fault)
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


def run_phase5_tests():
    print("\n" + "=" * 70)
    print("  SunPower Solutions -- Phase 5 Gemini AI Multipliers")
    print("=" * 70 + "\n")

    # ── Test 1: AI Electricity Bill Analyzer ───────────────────────────
    print("[1] AI Electricity Bill OCR & Solar kW Recommender")
    r_bill = client.post("/api/v1/ai/analyze-bill")
    check("POST /api/v1/ai/analyze-bill returns 200", r_bill.status_code == 200)
    bill_data = r_bill.json()["data"]
    check("Extracted monthly units > 0", bill_data["monthly_units_kwh"] > 0, f"{bill_data['monthly_units_kwh']} kWh")
    check("Recommended solar size calculated", bill_data["recommended_capacity_kw"] in [1.0, 2.0, 3.0, 4.0, 5.0], f"{bill_data['recommended_capacity_kw']} kW")
    check("PM Surya Ghar subsidy calculated", bill_data["estimated_subsidy_inr"] > 0, f"Rs.{bill_data['estimated_subsidy_inr']:,.0f}")
    check("Annual savings > 0", bill_data["annual_savings_inr"] > 0, f"Rs.{bill_data['annual_savings_inr']:,.0f}/year")
    check("25-year lifetime savings calculated", bill_data["lifetime_25yr_savings_inr"] > 0)
    check("AI summary text generated", len(bill_data["ai_summary"]) > 50)

    # ── Test 2: AI Roof Installation Photo Inspector ───────────────────
    print("\n[2] Computer Vision Roof Installation Quality Inspector")
    r_roof = client.post("/api/v1/ai/inspect-roof-photo")
    check("POST /api/v1/ai/inspect-roof-photo returns 200", r_roof.status_code == 200)
    roof_data = r_roof.json()["data"]
    check("Panel alignment score >= 90", roof_data["panel_alignment_score"] >= 90)
    check("Shade clearance score >= 90", roof_data["shade_clearance_score"] >= 90)
    check("Earthing visible is True", roof_data["earthing_visible"] is True)
    check("Overall score >= 90", roof_data["overall_score"] >= 90, f"Score: {roof_data['overall_score']}")
    check("Verdict is APPROVED", "APPROVED" in roof_data["verdict"])
    check("Recommendations list provided", len(roof_data["recommendations"]) >= 2)

    # ── Test 3: AI Inverter Fault Code Assistant ───────────────────────
    print("\n[3] AI Inverter Error Code Diagnostic Assistant")

    # Scenario 3a: ERR-F24 (Grid Outage / Monsoon Disconnect)
    r_f24 = client.post(
        "/api/v1/ai/diagnose-fault",
        json={"fault_code": "ERR-F24", "customer_notes": "Raining heavily, inverter display shows F24"}
    )
    check("Diagnose ERR-F24 returns 200", r_f24.status_code == 200)
    f24_data = r_f24.json()["data"]
    check("Root cause identifies Grid Loss", "Grid" in f24_data["root_cause"])
    check("Customer explanation calms the homeowner", "safe" in f24_data["customer_explanation"].lower() or "voltage" in f24_data["customer_explanation"].lower())
    check("Technician checklist contains AC voltage check", any("AC" in step for step in f24_data["technician_checklist"]))

    # Scenario 3b: ERR-F08 (IGBT Short / Lightning Strike)
    r_f08 = client.post(
        "/api/v1/ai/diagnose-fault",
        json={"fault_code": "ERR-F08", "customer_notes": "Smell of burning electronics"}
    )
    check("Diagnose ERR-F08 returns 200", r_f08.status_code == 200)
    f08_data = r_f08.json()["data"]
    check("Root cause identifies IGBT / Thermal Overload", "IGBT" in f08_data["root_cause"] or "Overheating" in f08_data["root_cause"])
    check("Severity is Critical", "Critical" in f08_data["severity"])

    # Scenario 3c: ERR-ISO (Insulation / Earthing Resistance Ground Fault)
    r_iso = client.post(
        "/api/v1/ai/diagnose-fault",
        json={"fault_code": "ERR-ISO-LOW", "customer_notes": "Moisture on roof"}
    )
    check("Diagnose ERR-ISO returns 200", r_iso.status_code == 200)
    iso_data = r_iso.json()["data"]
    check("Root cause identifies Insulation / Ground Leakage", "Insulation" in iso_data["root_cause"] or "Ground" in iso_data["root_cause"])
    check("Technician checklist mentions earthing / connectors", any("earthing" in step.lower() or "mc4" in step.lower() or "tester" in step.lower() for step in iso_data["technician_checklist"]))

    # ── Summary ─────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    passed = sum(1 for _, s in results if s == PASS)
    total = len(results)
    print(f"  RESULTS: {passed}/{total} checks passed")
    if passed == total:
        print("  Phase 5 COMPLETE -- Gemini AI Multipliers verified!")
    else:
        print("  WARNING: Some checks failed. Review output above.")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    run_phase5_tests()
