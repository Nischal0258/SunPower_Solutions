"""
seed_data.py — Populates the database with realistic hackathon demo records.

Demo Scenarios:
  Customer A (Rajesh Sharma)  : 3kW On-Grid, survey approved, ready for BOM quotation.
  Customer B (Kapoor Textiles): 5kW Off-Grid, new lead — awaiting site survey.
  Customer C (Vikram Mehta)   : 3kW On-Grid, installed 4 months ago → ACTIVE 2-year warranty.
                                Demonstrates ₹0 free replacement on monsoon breakdown.
  Customer D (Anil Agarwal)   : 3kW On-Grid, installed 28 months ago → EXPIRED warranty.
                                Demonstrates auto-generated paid repair invoice.
  Customer E (Dr. Sunita Verma): 2kW On-Grid, order fully paid, dispatched, install in progress.
"""

import datetime
import sys
import os

# Add project root to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal, Base
from app.models import (
    Lead, SiteSurvey, Quotation, BOMItem, Order,
    SerializedAsset, WarrantyRecord, SupportTicket,
)


def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if data already exists
        existing = db.query(Lead).first()
        if existing:
            print("[SEED] Database already has data. Skipping seed. Delete sunpower.db to re-seed.")
            return

        now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

        # ────────────────────────────────────────────────────────────────────
        # Customer A: Rajesh Sharma — 3kW On-Grid, Survey Approved
        # ────────────────────────────────────────────────────────────────────
        lead_a = Lead(
            id="lead_101",
            customer_name="Rajesh Sharma",
            phone="+91 98765 43210",
            email="sharma.rajesh@example.com",
            address="Plot 42, Civil Lines, Jaipur",
            property_type="Residential",
            monthly_bill=4800.0,
            shadow_free_area_sqft=380.0,
            requested_capacity_kw=3.0,
            system_type="On-Grid",
            status="survey_approved",
            created_at=now - datetime.timedelta(days=2),
        )
        survey_a = SiteSurvey(
            id="surv_501",
            lead_id="lead_101",
            roof_tilt_deg=22.5,
            roof_direction="South-Facing",
            cable_distance_meters=28.0,
            shadow_obstruction="None (Full Sun)",
            earthing_resistance_ohms=3.8,
            surveyor_name="Manoj Kumar",
            approved=True,
            notes="Optimal roof condition. Approved for 3kW Mono-PERC system.",
        )
        db.add(lead_a)
        db.add(survey_a)

        # ────────────────────────────────────────────────────────────────────
        # Customer B: Kapoor Textiles — 5kW Off-Grid, New Lead
        # ────────────────────────────────────────────────────────────────────
        lead_b = Lead(
            id="lead_102",
            customer_name="Kapoor Textiles Warehouse",
            phone="+91 98290 11223",
            email="ops@kapoortextiles.in",
            address="F-12, Sitapura Industrial Area, Jaipur",
            property_type="Commercial",
            monthly_bill=14500.0,
            shadow_free_area_sqft=850.0,
            requested_capacity_kw=5.0,
            system_type="Off-Grid",
            status="new",
            created_at=now - datetime.timedelta(hours=6),
        )
        db.add(lead_b)

        # ────────────────────────────────────────────────────────────────────
        # Customer C: Vikram Mehta — ACTIVE Warranty (installed 4 months ago)
        # ────────────────────────────────────────────────────────────────────
        lead_c = Lead(
            id="lead_103",
            customer_name="Vikram Mehta",
            phone="+91 98290 55443",
            email="vikram.mehta@example.com",
            address="A-22, Vaishali Nagar, Jaipur",
            property_type="Residential",
            monthly_bill=5200.0,
            shadow_free_area_sqft=400.0,
            requested_capacity_kw=3.0,
            system_type="On-Grid",
            status="confirmed",
            created_at=now - datetime.timedelta(days=130),
        )
        survey_c = SiteSurvey(
            id="surv_502",
            lead_id="lead_103",
            roof_tilt_deg=18.0,
            roof_direction="South-West",
            cable_distance_meters=22.0,
            shadow_obstruction="Minor (tree trimmed)",
            earthing_resistance_ohms=4.1,
            surveyor_name="Rajesh",
            approved=True,
            notes="Tree branch trimmed. Approved.",
        )

        install_date_c = now - datetime.timedelta(days=120)  # ~4 months ago

        order_c = Order(
            id="ord_903",
            lead_id="lead_103",
            customer_name="Vikram Mehta",
            system_name="3 kW On-Grid Rooftop System",
            capacity_kw=3.0,
            total_amount=185000.0,
            advance_paid=185000.0,
            remaining_balance=0.0,
            payment_status="full_paid",
            warehouse_status="dispatched",
            installation_status="completed",
            scheduled_install_date=install_date_c.strftime("%Y-%m-%d"),
            actual_install_date=install_date_c.strftime("%Y-%m-%d"),
            technician_name="Rajesh & Team",
            hardware_cost=121000.0,
            labor_cost=11000.0,
        )

        # Active warranty records (installed 4 months ago → well within 2-year window)
        warranty_c_inv = WarrantyRecord(
            id="warr_c1",
            serial_number="INV-3KW-9021-X",
            item_name="Single Phase Grid-Tied Inverter 3.3kW",
            customer_name="Vikram Mehta",
            customer_phone="+91 98290 55443",
            duration_years=2,
            warranty_start=install_date_c,
            warranty_end=install_date_c + datetime.timedelta(days=730),
            status="ACTIVE",
        )
        warranty_c_pnl = WarrantyRecord(
            id="warr_c2",
            serial_number="PNL-LOT-2026-C1",
            item_name="Mono-PERC Solar Panels (540W) Batch",
            customer_name="Vikram Mehta",
            customer_phone="+91 98290 55443",
            duration_years=20,
            warranty_start=install_date_c,
            warranty_end=install_date_c + datetime.timedelta(days=7300),
            status="ACTIVE",
        )

        asset_c1 = SerializedAsset(
            id="asset_c1",
            order_id="ord_903",
            category="Inverter",
            item_name="Single Phase Grid-Tied Inverter 3.3kW",
            serial_number="INV-3KW-9021-X",
            dispatched_by="Vikram (Store Manager)",
            dispatched_at=install_date_c,
        )
        asset_c2 = SerializedAsset(
            id="asset_c2",
            order_id="ord_903",
            category="Panels",
            item_name="Mono-PERC Solar Panels (540W) Batch",
            serial_number="PNL-LOT-2026-C1",
            dispatched_by="Vikram (Store Manager)",
            dispatched_at=install_date_c,
        )

        db.add_all([lead_c, survey_c, order_c, warranty_c_inv, warranty_c_pnl, asset_c1, asset_c2])

        # ────────────────────────────────────────────────────────────────────
        # Customer D: Anil Agarwal — EXPIRED Warranty (installed 28 months ago)
        # ────────────────────────────────────────────────────────────────────
        lead_d = Lead(
            id="lead_104",
            customer_name="Anil Agarwal",
            phone="+91 94140 12345",
            email="anil.a@example.com",
            address="C-9, Lal Kothi Scheme, Jaipur",
            property_type="Residential",
            monthly_bill=3800.0,
            shadow_free_area_sqft=300.0,
            requested_capacity_kw=3.0,
            system_type="On-Grid",
            status="confirmed",
            created_at=now - datetime.timedelta(days=860),
        )
        survey_d = SiteSurvey(
            id="surv_503",
            lead_id="lead_104",
            roof_tilt_deg=20.0,
            roof_direction="South-Facing",
            cable_distance_meters=30.0,
            shadow_obstruction="None",
            earthing_resistance_ohms=3.5,
            surveyor_name="Manoj Kumar",
            approved=True,
            notes="Standard installation.",
        )

        install_date_d = now - datetime.timedelta(days=850)  # ~28 months ago

        order_d = Order(
            id="ord_904",
            lead_id="lead_104",
            customer_name="Anil Agarwal",
            system_name="3 kW On-Grid Rooftop System",
            capacity_kw=3.0,
            total_amount=180000.0,
            advance_paid=180000.0,
            remaining_balance=0.0,
            payment_status="full_paid",
            warehouse_status="dispatched",
            installation_status="completed",
            scheduled_install_date=install_date_d.strftime("%Y-%m-%d"),
            actual_install_date=install_date_d.strftime("%Y-%m-%d"),
            technician_name="Manoj Kumar & Team",
            hardware_cost=118000.0,
            labor_cost=10000.0,
        )

        # Expired warranty (2-year inverter warranty ran out ~4 months ago)
        warranty_d_inv = WarrantyRecord(
            id="warr_d1",
            serial_number="INV-OLD-2024-99",
            item_name="3kW Solar Inverter",
            customer_name="Anil Agarwal",
            customer_phone="+91 94140 12345",
            duration_years=2,
            warranty_start=install_date_d,
            warranty_end=install_date_d + datetime.timedelta(days=730),
            status="EXPIRED",
        )
        # Panel warranty is still active (20 years)
        warranty_d_pnl = WarrantyRecord(
            id="warr_d2",
            serial_number="PNL-LOT-2024-D1",
            item_name="Mono-PERC Solar Panels Batch",
            customer_name="Anil Agarwal",
            customer_phone="+91 94140 12345",
            duration_years=20,
            warranty_start=install_date_d,
            warranty_end=install_date_d + datetime.timedelta(days=7300),
            status="ACTIVE",
        )

        asset_d1 = SerializedAsset(
            id="asset_d1",
            order_id="ord_904",
            category="Inverter",
            item_name="3kW Solar Inverter",
            serial_number="INV-OLD-2024-99",
            dispatched_by="Vikram (Store Manager)",
            dispatched_at=install_date_d,
        )

        db.add_all([lead_d, survey_d, order_d, warranty_d_inv, warranty_d_pnl, asset_d1])

        # ────────────────────────────────────────────────────────────────────
        # Customer E: Dr. Sunita Verma — 2kW On-Grid, Dispatched, Install In Progress
        # ────────────────────────────────────────────────────────────────────
        lead_e = Lead(
            id="lead_105",
            customer_name="Dr. Sunita Verma",
            phone="+91 94140 88776",
            email="dr.verma@gmail.com",
            address="B-14, Malviya Nagar, Jaipur",
            property_type="Residential",
            monthly_bill=3200.0,
            shadow_free_area_sqft=250.0,
            requested_capacity_kw=2.0,
            system_type="On-Grid",
            status="confirmed",
            created_at=now - datetime.timedelta(days=5),
        )
        survey_e = SiteSurvey(
            id="surv_504",
            lead_id="lead_105",
            roof_tilt_deg=25.0,
            roof_direction="South-East",
            cable_distance_meters=18.0,
            shadow_obstruction="None",
            earthing_resistance_ohms=3.2,
            surveyor_name="Rajesh",
            approved=True,
            notes="Clean roof. Ready for 2kW system.",
        )

        order_e = Order(
            id="ord_905",
            lead_id="lead_105",
            customer_name="Dr. Sunita Verma",
            system_name="2 kW On-Grid Rooftop System",
            capacity_kw=2.0,
            total_amount=130000.0,
            advance_paid=130000.0,
            remaining_balance=0.0,
            payment_status="full_paid",
            warehouse_status="dispatched",
            installation_status="in_progress",
            scheduled_install_date=(now + datetime.timedelta(days=2)).strftime("%Y-%m-%d"),
            technician_name="Rajesh & Team",
            hardware_cost=86000.0,
            labor_cost=8500.0,
        )

        dispatch_date_e = now - datetime.timedelta(days=1)
        asset_e1 = SerializedAsset(
            id="asset_e1",
            order_id="ord_905",
            category="Inverter",
            item_name="Single Phase Grid-Tied Inverter 2.2kW",
            serial_number="INV-2KW-8841-A",
            dispatched_by="Vikram (Store Manager)",
            dispatched_at=dispatch_date_e,
        )
        warranty_e_inv = WarrantyRecord(
            id="warr_e1",
            serial_number="INV-2KW-8841-A",
            item_name="Single Phase Grid-Tied Inverter 2.2kW",
            customer_name="Dr. Sunita Verma",
            customer_phone="+91 94140 88776",
            duration_years=2,
            warranty_start=dispatch_date_e,
            warranty_end=dispatch_date_e + datetime.timedelta(days=730),
            status="ACTIVE",
        )

        db.add_all([lead_e, survey_e, order_e, asset_e1, warranty_e_inv])

        # ────────────────────────────────────────────────────────────────────
        # Commit all
        # ────────────────────────────────────────────────────────────────────
        db.commit()
        print("[SEED] DONE - Database seeded successfully!")
        print("       -> 5 Leads (A: survey_approved, B: new, C: confirmed, D: confirmed, E: confirmed)")
        print("       -> 4 Site Surveys")
        print("       -> 3 Orders (C: completed, D: completed, E: in_progress)")
        print("       -> 4 Serialized Assets with serial numbers")
        print("       -> 5 Warranty Records (C: ACTIVE, D: EXPIRED inv + ACTIVE panels, E: ACTIVE)")
        print("       -> Demo-ready for Scenes 1-6!")

    except Exception as e:
        db.rollback()
        print(f"[SEED] ERROR during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
