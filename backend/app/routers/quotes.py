import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Lead, Quotation, BOMItem, Order
from app.bom_templates import get_bom_template, get_subsidy
from app.schemas import QuoteConfirm

router = APIRouter(prefix="/api/v1", tags=["Auto-BOM & Quotations"])


@router.get("/templates/bom")
def fetch_bom_template(
    capacity_kw: float = Query(..., description="System capacity in kW (1.0 to 5.0)"),
    system_type: str = Query(..., description="System type: 'On-Grid' or 'Off-Grid'"),
):
    """
    Fetch pre-engineered BOM template (Scene 2).
    Standardized kits for 1kW - 5kW in both On-Grid and Off-Grid packages.
    """
    template = get_bom_template(capacity_kw, system_type)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"BOM template not found for {capacity_kw} kW {system_type}. Valid capacities: 1.0, 2.0, 3.0, 4.0, 5.0"
        )

    return {
        "success": True,
        "data": template,
        "message": f"Pre-engineered {capacity_kw} kW {system_type} BOM template retrieved"
    }


@router.post("/quotes/generate")
def generate_quotation(
    lead_id: str = Query(..., description="Lead ID to generate quotation for"),
    db: Session = Depends(get_db)
):
    """
    Generate official quotation with auto-BOM for an approved lead.
    BUSINESS GATE: Site survey must be approved before quotation generation.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead '{lead_id}' not found"
        )

    if not lead.survey or not lead.survey.approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quotation is locked. Site survey must be completed and approved before quotation can be generated."
        )

    # Fetch pre-engineered template
    template = get_bom_template(lead.requested_capacity_kw, lead.system_type)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No pre-engineered BOM template available for {lead.requested_capacity_kw} kW {lead.system_type}"
        )

    # Create quotation record
    quote = Quotation(
        lead_id=lead.id,
        system_name=template["system_name"],
        capacity_kw=template["capacity_kw"],
        system_type=template["system_type"],
        total_amount=template["total_base_price"],
        subsidy_amount=template["estimated_subsidy"],
        net_customer_payable=template["net_customer_price"],
        advance_paid=0.0,
        remaining_balance=template["net_customer_price"],
        payment_status="unpaid",
        status="sent",
    )
    db.add(quote)
    db.flush()  # populate quote.id

    # Populate BOM items
    hardware_total = 0.0
    for item in template["items"]:
        cost = item["quantity"] * item["unit_cost"]
        hardware_total += cost
        bom_item = BOMItem(
            quotation_id=quote.id,
            item_name=item["item_name"],
            category=item["category"],
            quantity=item["quantity"],
            uom=item["uom"],
            unit_cost=item["unit_cost"],
            is_serialized=item["is_serialized"],
        )
        db.add(bom_item)

    lead.status = "quoted"
    db.commit()
    db.refresh(quote)

    return {
        "success": True,
        "data": {
            "quotation_id": quote.id,
            "lead_id": lead.id,
            "customer_name": lead.customer_name,
            "system_name": quote.system_name,
            "capacity_kw": quote.capacity_kw,
            "system_type": quote.system_type,
            "total_base_price": quote.total_amount,
            "subsidy_amount": quote.subsidy_amount,
            "net_customer_payable": quote.net_customer_payable,
            "items_count": len(template["items"]),
            "hardware_cost": hardware_total,
        },
        "message": "Quotation and Auto-BOM generated successfully"
    }


@router.post("/quotes/{lead_id}/confirm")
def confirm_order_and_record_payment(
    lead_id: str,
    payload: QuoteConfirm,
    db: Session = Depends(get_db)
):
    """
    Confirm order and record staged payment (Scene 2).
    Advance payment (minimum 20%) moves the job into the warehouse dispatch queue.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead '{lead_id}' not found"
        )

    if not lead.survey or not lead.survey.approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quotation is locked. Site survey must be approved before order confirmation."
        )

    # Fetch BOM template
    template = get_bom_template(lead.requested_capacity_kw, lead.system_type)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No pre-engineered BOM template for {lead.requested_capacity_kw} kW {lead.system_type}"
        )

    net_payable = template["net_customer_price"]
    min_advance = net_payable * 0.20  # Minimum 20% advance

    if payload.payment_type == "advance" and payload.amount_paid < min_advance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Advance payment must be at least 20% of net payable (minimum Rs.{min_advance:,.0f}). Received: Rs.{payload.amount_paid:,.0f}"
        )

    # Determine payment status
    remaining = max(0.0, net_payable - payload.amount_paid)
    payment_status = "full_paid" if remaining == 0 else "advance_paid"

    # Estimated installation date: 5 days from today
    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    est_install = (now + datetime.timedelta(days=5)).strftime("%Y-%m-%d")

    # Hardware cost sum
    hardware_cost = sum(i["quantity"] * i["unit_cost"] for i in template["items"])

    # Create Order
    order = Order(
        lead_id=lead.id,
        customer_name=lead.customer_name,
        system_name=template["system_name"],
        capacity_kw=template["capacity_kw"],
        total_amount=template["total_base_price"],
        advance_paid=payload.amount_paid,
        remaining_balance=remaining,
        payment_status=payment_status,
        warehouse_status="ready_for_dispatch",
        installation_status="scheduled",
        scheduled_install_date=est_install,
        hardware_cost=hardware_cost,
        labor_cost=11000.0,
    )
    db.add(order)

    lead.status = "confirmed"
    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "data": {
            "order_id": order.id,
            "lead_id": lead.id,
            "customer_name": order.customer_name,
            "system_name": order.system_name,
            "capacity_kw": order.capacity_kw,
            "total_amount": order.total_amount,
            "advance_paid": order.advance_paid,
            "remaining_balance": order.remaining_balance,
            "payment_status": order.payment_status,
            "warehouse_status": order.warehouse_status,
            "scheduled_install_date": order.scheduled_install_date,
        },
        "message": f"{payload.payment_type.capitalize()} payment of Rs.{payload.amount_paid:,.0f} received. Order moved to warehouse dispatch queue."
    }
