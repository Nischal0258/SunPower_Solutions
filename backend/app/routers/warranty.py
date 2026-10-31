import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import WarrantyRecord, SupportTicket
from app.schemas import TicketCreate

router = APIRouter(prefix="/api/v1", tags=["Warranty Engine & Helpdesk"])


def map_ticket(t: SupportTicket) -> dict:
    return {
        "ticket_id": t.id,
        "serial_number": t.serial_number,
        "customer_name": t.customer_name,
        "customer_phone": t.customer_phone,
        "fault_code": t.fault_code,
        "fault_description": t.fault_description,
        "is_under_warranty": t.is_under_warranty,
        "warranty_expiry": t.warranty_expiry,
        "billing_amount": t.billing_amount,
        "billing_type": t.billing_type,
        "assigned_technician": t.assigned_technician,
        "status": t.status,
        "created_at": t.created_at.isoformat() if t.created_at else "",
    }


@router.get("/warranty/lookup")
def lookup_warranty(
    serial_number: str = Query(..., description="Serial number of Inverter, Battery, or Panel batch"),
    db: Session = Depends(get_db)
):
    """
    Instant Warranty Verification Engine (Scene 5).
    Searches by serial number and calculates elapsed time vs warranty period.
    Returns ACTIVE (< 2 yrs inverter/battery, < 20 yrs panels) vs EXPIRED status badge.
    """
    record = db.query(WarrantyRecord).filter(
        WarrantyRecord.serial_number == serial_number
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No warranty record found for serial number '{serial_number}'. Please check the serial number."
        )

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    is_active = record.warranty_end > now
    calculated_status = "ACTIVE" if is_active else "EXPIRED"

    # Update database record status if it was active but expired
    if record.status != calculated_status:
        record.status = calculated_status
        db.commit()

    diff_days = abs((record.warranty_end - now).days)

    return {
        "success": True,
        "data": {
            "serial_number": record.serial_number,
            "item_name": record.item_name,
            "customer_name": record.customer_name,
            "customer_phone": record.customer_phone,
            "duration_years": record.duration_years,
            "warranty_start": record.warranty_start.isoformat(),
            "warranty_end": record.warranty_end.isoformat(),
            "status": calculated_status,
            "is_active": is_active,
            "days_remaining": diff_days if is_active else 0,
            "days_expired": diff_days if not is_active else 0,
        },
        "message": f"Active warranty found. Expires {record.warranty_end.strftime('%b %d, %Y')}." if is_active else f"Warranty expired on {record.warranty_end.strftime('%b %d, %Y')}."
    }


@router.post("/tickets/create")
def create_support_ticket(
    payload: TicketCreate,
    db: Session = Depends(get_db)
):
    """
    Log breakdown complaint & trigger automated warranty billing (Scene 5).
    - If Under Warranty: Generates Rs.0 free replacement work order.
    - If Expired: Automatically generates repair invoice (Replacement hardware + Rs.1,500 technician fee).
    """
    # Lookup warranty record
    record = db.query(WarrantyRecord).filter(
        WarrantyRecord.serial_number == payload.serial_number
    ).first()

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

    is_under_warranty = False
    customer_name = "Customer"
    warranty_expiry_str = None

    if record:
        customer_name = record.customer_name
        is_under_warranty = record.warranty_end > now
        warranty_expiry_str = record.warranty_end.strftime("%Y-%m-%d")

    # Automated Billing Engine
    if is_under_warranty:
        billing_amount = 0.0
        billing_type = "FREE_WARRANTY_REPLACEMENT"
        assigned_tech = "Rajesh & Team"
        ticket_status = "dispatched"
        msg = f"Active warranty verified for '{payload.serial_number}'. Rs.0 free warranty replacement dispatched to Rajesh & Team."
    else:
        # Out-of-warranty: Hardware repair Rs.13,000 + Labor Rs.1,500
        billing_amount = 14500.0
        billing_type = "OUT_OF_WARRANTY_PAID"
        assigned_tech = "Manoj Kumar"
        ticket_status = "open"
        msg = f"Warranty expired for '{payload.serial_number}'. Auto-generated repair invoice of Rs.14,500 (Hardware Rs.13,000 + Labor Rs.1,500)."

    fault_desc = f"{payload.fault_code} - {payload.customer_notes}" if payload.customer_notes else payload.fault_code

    ticket = SupportTicket(
        serial_number=payload.serial_number,
        customer_name=customer_name,
        customer_phone=payload.customer_phone,
        fault_code=payload.fault_code,
        fault_description=fault_desc,
        is_under_warranty=is_under_warranty,
        warranty_expiry=warranty_expiry_str,
        billing_amount=billing_amount,
        billing_type=billing_type,
        assigned_technician=assigned_tech,
        status=ticket_status,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return {
        "success": True,
        "data": map_ticket(ticket),
        "message": msg
    }


@router.get("/tickets")
def list_tickets(
    status_filter: Optional[str] = Query(None, description="Filter by ticket status: 'open', 'dispatched', 'resolved'"),
    db: Session = Depends(get_db)
):
    """
    List all customer breakdown and maintenance tickets.
    """
    query = db.query(SupportTicket)
    if status_filter:
        query = query.filter(SupportTicket.status == status_filter)

    tickets = query.order_by(SupportTicket.created_at.desc()).all()
    return {
        "success": True,
        "data": [map_ticket(t) for t in tickets],
        "message": f"Found {len(tickets)} support tickets"
    }


@router.patch("/tickets/{ticket_id}/resolve")
def resolve_ticket(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    """
    Mark support ticket as resolved after technician inspection and customer signoff.
    """
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found"
        )

    ticket.status = "resolved"
    db.commit()
    db.refresh(ticket)

    return {
        "success": True,
        "data": map_ticket(ticket),
        "message": f"Ticket '{ticket_id}' marked as resolved."
    }
