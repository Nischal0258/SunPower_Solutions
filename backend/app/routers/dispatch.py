import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order, SerializedAsset, WarrantyRecord
from app.schemas import DispatchComplete

router = APIRouter(prefix="/api/v1/dispatch", tags=["Warehouse & Serial Dispatch"])


def map_order(order: Order) -> dict:
    return {
        "order_id": order.id,
        "lead_id": order.lead_id,
        "customer_name": order.customer_name,
        "system_name": order.system_name,
        "capacity_kw": order.capacity_kw,
        "total_amount": order.total_amount,
        "advance_paid": order.advance_paid,
        "remaining_balance": order.remaining_balance,
        "payment_status": order.payment_status,
        "warehouse_status": order.warehouse_status,
        "scheduled_install_date": order.scheduled_install_date,
    }


@router.get("/queue")
def get_dispatch_queue(db: Session = Depends(get_db)):
    """
    Fetch orders waiting in warehouse for barcode scanning and dispatch (Scene 3).
    """
    orders = db.query(Order).filter(
        Order.warehouse_status.in_(["ready_for_dispatch", "pending_packing"])
    ).order_by(Order.created_at.desc()).all()

    return {
        "success": True,
        "data": [map_order(o) for o in orders],
        "message": f"Found {len(orders)} orders awaiting dispatch",
    }


@router.post("/{order_id}/complete")
def complete_dispatch_and_activate_warranty(
    order_id: str,
    payload: DispatchComplete,
    db: Session = Depends(get_db)
):
    """
    Verify & assign serial numbers for high-value components and complete dispatch (Scene 3).
    MANDATORY GATE: Requires serial numbers for Inverters (and Batteries if present).
    AUTOMATION: Initiates the 2-year (Inverter/Battery) and 20-year (Panels) warranty clocks.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' not found"
        )

    if order.warehouse_status == "dispatched":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order '{order_id}' has already been dispatched."
        )

    # Validation: Must provide at least one serialized item (Inverter)
    if not payload.scanned_serials:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mandatory serial numbers required. Please scan or enter serial numbers for inverters/batteries before dispatch."
        )

    has_inverter = any("inverter" in s.category.lower() or "inverter" in s.item_name.lower() for s in payload.scanned_serials)
    if not has_inverter:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Inverter serial number. Every rooftop solar package requires a serialized inverter."
        )

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    warranty_records = []

    for item in payload.scanned_serials:
        # Check if serial number is already in use
        existing_asset = db.query(SerializedAsset).filter(
            SerializedAsset.serial_number == item.serial_number
        ).first()
        if existing_asset:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Duplicate serial number '{item.serial_number}' is already registered to order '{existing_asset.order_id}'."
            )

        # 1. Record Serialized Asset
        asset = SerializedAsset(
            order_id=order.id,
            category=item.category,
            item_name=item.item_name,
            serial_number=item.serial_number,
            dispatched_by=payload.dispatched_by,
            dispatched_at=now,
        )
        db.add(asset)

        # 2. Determine Warranty Duration
        # Inverters & Batteries = 2 Years; Panels = 20 Years
        is_panel = "panel" in item.category.lower() or "panel" in item.item_name.lower()
        duration_years = 20 if is_panel else 2
        warranty_end = now + datetime.timedelta(days=365 * duration_years)

        # 3. Auto-Activate Warranty Clock
        warranty = WarrantyRecord(
            serial_number=item.serial_number,
            item_name=item.item_name,
            customer_name=order.customer_name,
            customer_phone=order.lead.phone if order.lead else "",
            duration_years=duration_years,
            warranty_start=now,
            warranty_end=warranty_end,
            status="ACTIVE",
        )
        db.add(warranty)

        warranty_records.append({
            "serial_number": item.serial_number,
            "item_name": item.item_name,
            "customer_name": order.customer_name,
            "duration_years": duration_years,
            "warranty_start": now.isoformat(),
            "warranty_end": warranty_end.isoformat(),
            "status": "ACTIVE",
        })

    # Update Order warehouse status
    order.warehouse_status = "dispatched"
    order.installation_status = "scheduled"

    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "data": {
            "order_id": order.id,
            "dispatch_status": "dispatched",
            "warranty_activated": True,
            "warranty_records": warranty_records,
        },
        "message": f"Dispatch completed by {payload.dispatched_by}. {len(warranty_records)} warranty clock(s) auto-activated."
    }
