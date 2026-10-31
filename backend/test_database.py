"""
test_database.py — Verification script for Phase 1.
Validates: table creation, seed data integrity, relationships, and warranty status logic.
"""

import sys
import os
import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal, Base
from app.models import (
    Lead, SiteSurvey, Quotation, BOMItem, Order,
    SerializedAsset, WarrantyRecord, SupportTicket,
)
from app.bom_templates import get_bom_template

PASS = "[PASS]"
FAIL = "[FAIL]"
results = []


def check(name: str, condition: bool, detail: str = ""):
    status = PASS if condition else FAIL
    results.append((name, status))
    print(f"  {status} {name}" + (f" -- {detail}" if detail else ""))


def run_tests():
    print("\n" + "=" * 70)
    print("  SunPower Solutions -- Phase 1 Database Verification")
    print("=" * 70 + "\n")

    db = SessionLocal()

    # ── Table Creation ──────────────────────────────────────────────────
    print("[1] Table Creation")
    table_names = Base.metadata.tables.keys()
    expected_tables = [
        "leads", "site_surveys", "quotations", "bom_items",
        "orders", "serialized_assets", "warranty_records", "support_tickets",
    ]
    for t in expected_tables:
        check(f"Table '{t}' exists", t in table_names)

    # ── Seed Data Counts ────────────────────────────────────────────────
    print("\n[2] Seed Data Counts")
    lead_count = db.query(Lead).count()
    check("Leads seeded", lead_count == 5, f"Expected 5, got {lead_count}")

    survey_count = db.query(SiteSurvey).count()
    check("Surveys seeded", survey_count == 4, f"Expected 4, got {survey_count}")

    order_count = db.query(Order).count()
    check("Orders seeded", order_count == 3, f"Expected 3, got {order_count}")

    asset_count = db.query(SerializedAsset).count()
    check("Serialized assets seeded", asset_count == 4, f"Expected 4, got {asset_count}")

    warranty_count = db.query(WarrantyRecord).count()
    check("Warranty records seeded", warranty_count == 5, f"Expected 5, got {warranty_count}")

    # ── Relationships ───────────────────────────────────────────────────
    print("\n[3] Relationship Integrity")
    lead_a = db.query(Lead).filter(Lead.id == "lead_101").first()
    check("Lead -> Survey (1:1)", lead_a is not None and lead_a.survey is not None)
    if lead_a and lead_a.survey:
        check("Survey approved for lead_101", lead_a.survey.approved is True)

    lead_b = db.query(Lead).filter(Lead.id == "lead_102").first()
    check("Lead B has no survey (new lead)", lead_b is not None and lead_b.survey is None)

    order_c = db.query(Order).filter(Order.id == "ord_903").first()
    check("Order -> Assets relationship", order_c is not None and len(order_c.assets) == 2, f"Expected 2 assets, got {len(order_c.assets) if order_c else 0}")

    # ── Warranty Status Logic ───────────────────────────────────────────
    print("\n[4] Warranty Status Verification")
    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

    # Active warranty (Vikram Mehta — installed 4 months ago)
    active_w = db.query(WarrantyRecord).filter(
        WarrantyRecord.serial_number == "INV-3KW-9021-X"
    ).first()
    check(
        "Active warranty: INV-3KW-9021-X (Vikram Mehta)",
        active_w is not None and active_w.status == "ACTIVE" and active_w.warranty_end > now,
        f"Expires {active_w.warranty_end.strftime('%Y-%m-%d')}" if active_w else "",
    )

    # Expired warranty (Anil Agarwal — installed 28 months ago)
    expired_w = db.query(WarrantyRecord).filter(
        WarrantyRecord.serial_number == "INV-OLD-2024-99"
    ).first()
    check(
        "Expired warranty: INV-OLD-2024-99 (Anil Agarwal)",
        expired_w is not None and expired_w.status == "EXPIRED" and expired_w.warranty_end < now,
        f"Expired {expired_w.warranty_end.strftime('%Y-%m-%d')}" if expired_w else "",
    )

    # ── BOM Template Engine ─────────────────────────────────────────────
    print("\n[5] BOM Template Engine")
    bom_3kw = get_bom_template(3.0, "On-Grid")
    check("3kW On-Grid BOM template exists", bom_3kw is not None)
    if bom_3kw:
        check("BOM has items", len(bom_3kw["items"]) >= 5, f"{len(bom_3kw['items'])} items")
        check("BOM price > 0", bom_3kw["total_base_price"] > 0, f"Rs.{bom_3kw['total_base_price']:,.0f}")
        check("Subsidy = Rs.78,000 for 3kW On-Grid", bom_3kw["estimated_subsidy"] == 78000)
        check("Net price = Base - Subsidy", bom_3kw["net_customer_price"] == bom_3kw["total_base_price"] - 78000)

    bom_5kw_off = get_bom_template(5.0, "Off-Grid")
    check("5kW Off-Grid BOM template exists", bom_5kw_off is not None)
    if bom_5kw_off:
        check("Off-Grid subsidy = Rs.0", bom_5kw_off["estimated_subsidy"] == 0)
        has_battery = any(i["category"] == "Battery" for i in bom_5kw_off["items"])
        check("Off-Grid BOM includes Battery", has_battery)

    # All 10 combinations
    all_templates_valid = True
    for kw in [1.0, 2.0, 3.0, 4.0, 5.0]:
        for st in ["On-Grid", "Off-Grid"]:
            t = get_bom_template(kw, st)
            if t is None:
                all_templates_valid = False
                print(f"    {FAIL} Missing template: {kw} kW {st}")
    check("All 10 BOM templates (1-5kW x On/Off-Grid) exist", all_templates_valid)

    # ── Summary ─────────────────────────────────────────────────────────
    db.close()
    print("\n" + "=" * 70)
    passed = sum(1 for _, s in results if s == PASS)
    total = len(results)
    print(f"  RESULTS: {passed}/{total} checks passed")
    if passed == total:
        print("  Phase 1 COMPLETE — Database & Seed verified successfully!")
    else:
        print("  WARNING: Some checks failed. Review output above.")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    run_tests()
