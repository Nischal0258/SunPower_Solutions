"""
schemas.py — Pydantic V2 Request/Response Models
Every API response uses the uniform envelope: { success, data, message }
"""

from __future__ import annotations

import datetime
from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


# ── Uniform Response Envelope ──────────────────────────────────────────────
class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T
    message: str = "Operation completed successfully"


# ── Lead Schemas ───────────────────────────────────────────────────────────
class LeadCreate(BaseModel):
    customer_name: str
    phone: str
    email: Optional[str] = None
    address: str
    property_type: str = "Residential"
    monthly_bill: float
    shadow_free_area_sqft: float
    requested_capacity_kw: float
    system_type: str = "On-Grid"

class SurveyOut(BaseModel):
    survey_id: Optional[str] = None
    lead_id: str
    roof_tilt_deg: float
    roof_direction: str
    cable_distance_meters: float
    shadow_obstruction: str
    earthing_resistance_ohms: float
    surveyor_name: str
    approved: bool
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class LeadOut(BaseModel):
    id: str
    customer_name: str
    phone: str
    email: Optional[str] = None
    address: str
    property_type: str
    monthly_bill: float
    shadow_free_area_sqft: float
    requested_capacity_kw: float
    system_type: str
    status: str
    created_at: datetime.datetime
    survey: Optional[SurveyOut] = None

    class Config:
        from_attributes = True


# ── Site Survey Schemas ────────────────────────────────────────────────────
class SurveyCreate(BaseModel):
    roof_tilt_deg: float
    roof_direction: str
    cable_distance_meters: float
    shadow_obstruction: str = "None"
    earthing_resistance_ohms: float
    surveyor_name: str
    approved: bool = False
    notes: Optional[str] = None


# ── BOM Template Schemas ───────────────────────────────────────────────────
class BomItemOut(BaseModel):
    item_name: str
    category: str
    quantity: int
    uom: str
    unit_cost: float
    is_serialized: bool

class BomTemplateOut(BaseModel):
    system_name: str
    capacity_kw: float
    system_type: str
    total_base_price: float
    estimated_subsidy: float
    net_customer_price: float
    items: list[BomItemOut]


# ── Quotation & Payment Schemas ────────────────────────────────────────────
class QuoteConfirm(BaseModel):
    payment_type: str = "advance"       # "advance" or "full"
    amount_paid: float
    payment_method: Optional[str] = None
    reference_id: Optional[str] = None

class OrderOut(BaseModel):
    order_id: str
    lead_id: str
    customer_name: str
    system_name: str
    capacity_kw: float
    total_amount: float
    advance_paid: float
    remaining_balance: float
    payment_status: str
    warehouse_status: str
    scheduled_install_date: Optional[str] = None

    class Config:
        from_attributes = True


# ── Dispatch & Serial Schemas ──────────────────────────────────────────────
class ScannedSerialIn(BaseModel):
    category: str
    item_name: str
    serial_number: str

class DispatchComplete(BaseModel):
    scanned_serials: list[ScannedSerialIn]
    dispatched_by: str

class WarrantyRecordOut(BaseModel):
    serial_number: str
    item_name: str
    customer_name: str
    duration_years: int
    warranty_start: str
    warranty_end: str
    status: str

    class Config:
        from_attributes = True

class DispatchResult(BaseModel):
    order_id: str
    dispatch_status: str
    warranty_activated: bool
    warranty_records: list[WarrantyRecordOut]


# ── Field Technician Schemas ───────────────────────────────────────────────
class FieldJobComplete(BaseModel):
    technician_name: str
    actual_capacity_kw: float
    roof_photo_url: str
    customer_signature_base64: str
    homeowner_feedback: Optional[str] = None
    work_duration_hours: float


# ── Support Ticket Schemas ─────────────────────────────────────────────────
class TicketCreate(BaseModel):
    serial_number: str
    customer_phone: str
    fault_code: str
    customer_notes: Optional[str] = ""

class SupportTicketOut(BaseModel):
    ticket_id: str
    serial_number: str
    customer_name: str
    customer_phone: str
    fault_code: str
    fault_description: str
    is_under_warranty: bool
    warranty_expiry: Optional[str] = None
    billing_amount: float
    billing_type: str
    assigned_technician: Optional[str] = None
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# ── Director Analytics Schemas ─────────────────────────────────────────────
class JobProfitDetail(BaseModel):
    id: str
    customer: str
    system: str
    capacity_kw: float
    revenue: float
    bom_cost: float
    labor_cost: float
    profit: float
    margin_pct: float
    status: str

class SubsidyPipeline(BaseModel):
    submitted: int
    discom_inspected: int
    disbursed: int
    total_subsidy_value_in_pipeline: float

class DirectorAnalyticsOut(BaseModel):
    month: str
    total_revenue: float
    total_hardware_cost: float
    total_labor_cost: float
    gross_profit: float
    gross_margin_pct: float
    active_projects: int
    completed_this_month: int
    subsidy_pipeline: SubsidyPipeline
    open_tickets: int
    recent_jobs: list[JobProfitDetail]


# ── AI Feature Schemas ─────────────────────────────────────────────────────
class AiBillAnalysisResult(BaseModel):
    monthly_units_kwh: float
    sanctioned_load_kw: float
    average_bill_amount: float
    recommended_capacity_kw: float
    estimated_subsidy_inr: float
    annual_savings_inr: float
    ai_summary: str

class AiRoofInspectionResult(BaseModel):
    panel_alignment_score: float
    shade_clearance_score: float
    earthing_visible: bool
    overall_score: float
    verdict: str
    recommendations: list[str]

class AiFaultDiagnosisResult(BaseModel):
    fault_code: str
    root_cause: str
    customer_explanation: str
    technician_checklist: list[str]
    severity: str
