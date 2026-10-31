import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Order
from app.schemas import FieldJobComplete

router = APIRouter(prefix="/api/v1/field", tags=["Field Operations & Handover"])


def map_field_job(order: Order) -> dict:
    return {
        "job_id": order.id,
        "order_id": order.id,
        "customer_name": order.customer_name,
        "system_name": order.system_name,
        "capacity_kw": order.capacity_kw,
        "warehouse_status": order.warehouse_status,
        "installation_status": order.installation_status,
        "scheduled_install_date": order.scheduled_install_date,
        "actual_install_date": order.actual_install_date,
        "technician_name": order.technician_name,
        "roof_photo_url": order.roof_photo_url,
        "customer_signature_recorded": bool(order.customer_signature_base64),
        "homeowner_feedback": order.homeowner_feedback,
        "work_duration_hours": order.work_duration_hours,
        "customer_phone": order.lead.phone if order.lead else "",
        "customer_address": order.lead.address if order.lead else "",
    }


@router.get("/jobs")
def get_field_jobs(
    status_filter: Optional[str] = Query(None, description="Filter by installation status: 'scheduled', 'in_progress', 'completed'"),
    db: Session = Depends(get_db)
):
    """
    List field installation jobs (Scene 4).
    Mobile-optimized view for field technicians.
    """
    query = db.query(Order).filter(Order.warehouse_status == "dispatched")
    if status_filter:
        query = query.filter(Order.installation_status == status_filter)

    jobs = query.order_by(Order.created_at.desc()).all()
    return {
        "success": True,
        "data": [map_field_job(j) for j in jobs],
        "message": f"Found {len(jobs)} field jobs"
    }


@router.get("/jobs/{order_id}")
def get_field_job_detail(order_id: str, db: Session = Depends(get_db)):
    """
    Get detailed installation checklist and requirements for a field job.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Field job / Order '{order_id}' not found"
        )
    return {"success": True, "data": map_field_job(order), "message": "Job details retrieved"}


@router.post("/jobs/{order_id}/complete")
def complete_field_handover(
    order_id: str,
    payload: FieldJobComplete,
    db: Session = Depends(get_db)
):
    """
    Mobile field handover: upload roof photo, log duration, capture homeowner signature on glass (Scene 4).
    MANDATORY GATE: Customer digital signature is required for official job sign-off.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' not found"
        )

    if order.warehouse_status != "dispatched":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot complete installation. Order '{order_id}' has not been dispatched from the warehouse yet."
        )

    # Mandatory signature gate
    if not payload.customer_signature_base64 or len(payload.customer_signature_base64.strip()) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Digital customer signature is mandatory. Homeowner must sign on screen before completion."
        )

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

    order.installation_status = "completed"
    order.actual_install_date = now.strftime("%Y-%m-%d")
    order.technician_name = payload.technician_name
    order.roof_photo_url = payload.roof_photo_url
    order.customer_signature_base64 = payload.customer_signature_base64
    order.homeowner_feedback = payload.homeowner_feedback
    order.work_duration_hours = payload.work_duration_hours

    db.commit()
    db.refresh(order)

    certificate_id = f"CERT-{order.id.upper()}"

    return {
        "success": True,
        "data": {
            "job_id": order.id,
            "status": "completed",
            "completion_certificate_id": certificate_id,
            "completion_certificate_url": f"/api/v1/certificates/{order.id}",
            "completed_at": now.isoformat(),
            "technician": payload.technician_name,
            "capacity_verified_kw": payload.actual_capacity_kw,
        },
        "message": f"Installation handed over successfully. Digital certificate {certificate_id} created."
    }
