import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Lead, SiteSurvey
from app.schemas import LeadCreate, SurveyCreate

router = APIRouter(prefix="/api/v1/leads", tags=["Leads & Feasibility"])


def map_survey(s: Optional[SiteSurvey]) -> Optional[dict]:
    if not s:
        return None
    return {
        "survey_id": s.id,
        "lead_id": s.lead_id,
        "roof_tilt_deg": s.roof_tilt_deg,
        "roof_direction": s.roof_direction,
        "cable_distance_meters": s.cable_distance_meters,
        "shadow_obstruction": s.shadow_obstruction,
        "earthing_resistance_ohms": s.earthing_resistance_ohms,
        "surveyor_name": s.surveyor_name,
        "approved": s.approved,
        "notes": s.notes,
    }


def map_lead(l: Lead) -> dict:
    return {
        "id": l.id,
        "customer_name": l.customer_name,
        "phone": l.phone,
        "email": l.email,
        "address": l.address,
        "property_type": l.property_type,
        "monthly_bill": l.monthly_bill,
        "shadow_free_area_sqft": l.shadow_free_area_sqft,
        "requested_capacity_kw": l.requested_capacity_kw,
        "system_type": l.system_type,
        "status": l.status,
        "created_at": l.created_at.isoformat() if l.created_at else "",
        "survey": map_survey(l.survey),
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    """
    Omnichannel lead intake endpoint (Scene 1).
    Captures customer info, bill, roof area, and performs initial feasibility check.
    """
    # Feasibility check: 1 kW requires ~100 sq.ft of shadow-free roof area
    required_area = payload.requested_capacity_kw * 100.0
    feasible = payload.shadow_free_area_sqft >= required_area

    # Calculate recommended capacity based on monthly bill: ₹1,500 bill ~ 1 kW
    recommended_kw = round(payload.monthly_bill / 1500.0, 1)
    if recommended_kw < 1.0:
        recommended_kw = 1.0
    elif recommended_kw > 5.0:
        recommended_kw = 5.0

    lead = Lead(
        customer_name=payload.customer_name,
        phone=payload.phone,
        email=payload.email,
        address=payload.address,
        property_type=payload.property_type,
        monthly_bill=payload.monthly_bill,
        shadow_free_area_sqft=payload.shadow_free_area_sqft,
        requested_capacity_kw=payload.requested_capacity_kw,
        system_type=payload.system_type,
        status="pending_survey" if feasible else "feasibility_flagged",
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)

    data = map_lead(lead)
    data["recommended_capacity_kw"] = recommended_kw
    data["roof_area_sufficient"] = feasible

    msg = "Lead created successfully" if feasible else "Lead created but roof area is below recommended size"
    return {"success": True, "data": data, "message": msg}


@router.get("")
def list_leads(
    status: Optional[str] = Query(None, description="Filter by status (new, pending_survey, survey_approved, quoted, confirmed)"),
    db: Session = Depends(get_db)
):
    """
    List all inquiries with optional status filtering.
    """
    query = db.query(Lead)
    if status:
        query = query.filter(Lead.status == status)
    
    leads = query.order_by(Lead.created_at.desc()).all()
    return {
        "success": True,
        "data": [map_lead(l) for l in leads],
        "message": f"Found {len(leads)} leads"
    }


@router.get("/{lead_id}")
def get_lead(lead_id: str, db: Session = Depends(get_db)):
    """
    Get detailed information for a specific customer inquiry.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID '{lead_id}' not found"
        )
    return {"success": True, "data": map_lead(lead), "message": "Lead details retrieved"}


@router.post("/{lead_id}/survey")
def submit_survey(lead_id: str, payload: SurveyCreate, db: Session = Depends(get_db)):
    """
    Submit and optionally approve technical site survey (Scene 1).
    CRITICAL BUSINESS GATE: Quotation generation is unlocked only when approved is True.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with ID '{lead_id}' not found"
        )

    # Check if survey already exists
    survey = db.query(SiteSurvey).filter(SiteSurvey.lead_id == lead_id).first()
    if survey:
        # Update existing
        survey.roof_tilt_deg = payload.roof_tilt_deg
        survey.roof_direction = payload.roof_direction
        survey.cable_distance_meters = payload.cable_distance_meters
        survey.shadow_obstruction = payload.shadow_obstruction
        survey.earthing_resistance_ohms = payload.earthing_resistance_ohms
        survey.surveyor_name = payload.surveyor_name
        survey.approved = payload.approved
        survey.notes = payload.notes
    else:
        # Create new survey
        survey = SiteSurvey(
            lead_id=lead_id,
            roof_tilt_deg=payload.roof_tilt_deg,
            roof_direction=payload.roof_direction,
            cable_distance_meters=payload.cable_distance_meters,
            shadow_obstruction=payload.shadow_obstruction,
            earthing_resistance_ohms=payload.earthing_resistance_ohms,
            surveyor_name=payload.surveyor_name,
            approved=payload.approved,
            notes=payload.notes,
        )
        db.add(survey)

    if payload.approved:
        lead.status = "survey_approved"

    db.commit()
    db.refresh(survey)
    db.refresh(lead)

    return {
        "success": True,
        "data": {
            "survey_id": survey.id,
            "lead_id": lead.id,
            "approved": survey.approved,
            "quote_unlocked": survey.approved,
            "lead_status": lead.status,
        },
        "message": "Site survey approved. Quotation unlocked." if survey.approved else "Site survey recorded but pending approval."
    }
