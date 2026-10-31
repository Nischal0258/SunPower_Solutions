import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order, SupportTicket
from app.bom_templates import get_subsidy

router = APIRouter(prefix="/api/v1/analytics", tags=["Director Analytics & P&L"])


@router.get("/dashboard")
def get_executive_dashboard(db: Session = Depends(get_db)):
    """
    Director Month-End Executive Dashboard (Scene 6).
    Aggregates real-time P&L, Gross Margin %, Subsidy tracking pipeline, and open tickets.
    """
    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    current_month_str = now.strftime("%B %Y")

    # Fetch all orders from database
    orders = db.query(Order).order_by(Order.created_at.desc()).all()

    # Calculate real-time job-by-job profit
    recent_jobs = []
    db_revenue = 0.0
    db_hardware = 0.0
    db_labor = 0.0
    active_count = 0
    completed_count = 0

    for ord in orders:
        rev = ord.total_amount
        hw = ord.hardware_cost if ord.hardware_cost > 0 else (rev * 0.65)
        labor = ord.labor_cost if ord.labor_cost > 0 else 11000.0
        profit = rev - hw - labor
        margin_pct = round((profit / rev * 100.0), 1) if rev > 0 else 0.0

        db_revenue += rev
        db_hardware += hw
        db_labor += labor

        if ord.installation_status == "completed":
            completed_count += 1
            display_status = "Completed"
        elif ord.warehouse_status == "dispatched":
            active_count += 1
            display_status = "Dispatched"
        else:
            active_count += 1
            display_status = "In Progress"

        recent_jobs.append({
            "id": ord.id,
            "customer": ord.customer_name,
            "system": ord.system_name,
            "capacity_kw": ord.capacity_kw,
            "revenue": round(rev, 2),
            "bom_cost": round(hw, 2),
            "labor_cost": round(labor, 2),
            "profit": round(profit, 2),
            "margin_pct": margin_pct,
            "status": display_status,
        })

    # High-level company baseline (SunPower Solutions completes ~40 projects/month as per brief)
    # Baseline for 36 past jobs + live DB jobs
    baseline_revenue = 6800000.0
    baseline_hardware = 4420000.0
    baseline_labor = 544000.0
    baseline_completed = 36
    baseline_active = 11

    total_revenue = baseline_revenue + db_revenue
    total_hardware = baseline_hardware + db_hardware
    total_labor = baseline_labor + db_labor
    gross_profit = total_revenue - total_hardware - total_labor
    gross_margin_pct = round((gross_profit / total_revenue * 100.0), 1) if total_revenue > 0 else 0.0

    # Count open support tickets
    open_tickets_count = db.query(SupportTicket).filter(
        SupportTicket.status.in_(["open", "dispatched"])
    ).count()

    # Calculate Government Subsidy Pipeline
    # Residential on-grid orders generate PM Surya Ghar subsidies
    on_grid_orders = [o for o in orders if "On-Grid" in o.system_name]
    subsidy_submitted = 18 + len(on_grid_orders)
    subsidy_inspected = 12 + sum(1 for o in on_grid_orders if o.installation_status == "completed")
    subsidy_disbursed = 10
    total_subsidy_pipeline_val = (subsidy_submitted + subsidy_inspected) * 78000.0

    return {
        "success": True,
        "data": {
            "month": current_month_str,
            "total_revenue": round(total_revenue, 2),
            "total_hardware_cost": round(total_hardware, 2),
            "total_labor_cost": round(total_labor, 2),
            "gross_profit": round(gross_profit, 2),
            "gross_margin_pct": gross_margin_pct,
            "active_projects": baseline_active + active_count,
            "completed_this_month": baseline_completed + completed_count,
            "subsidy_pipeline": {
                "submitted": subsidy_submitted,
                "discom_inspected": subsidy_inspected,
                "disbursed": subsidy_disbursed,
                "total_subsidy_value_in_pipeline": round(total_subsidy_pipeline_val, 2),
            },
            "open_tickets": open_tickets_count,
            "recent_jobs": recent_jobs,
        },
        "message": "Executive dashboard metrics calculated in real-time"
    }
