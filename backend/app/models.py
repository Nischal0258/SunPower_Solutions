import datetime
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base

def generate_id(prefix: str = "id") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}"

class Lead(Base):
    __tablename__ = "leads"

    id = Column(String, primary_key=True, default=lambda: generate_id("lead"))
    customer_name = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=False, index=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=False)
    property_type = Column(String, default="Residential")
    monthly_bill = Column(Float, nullable=False)
    shadow_free_area_sqft = Column(Float, nullable=False)
    requested_capacity_kw = Column(Float, nullable=False)
    system_type = Column(String, default="On-Grid")
    status = Column(String, default="new", index=True)  # new, survey_scheduled, survey_approved, quoted, confirmed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    survey = relationship("SiteSurvey", back_populates="lead", uselist=False, cascade="all, delete-orphan")
    quotations = relationship("Quotation", back_populates="lead", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="lead")


class SiteSurvey(Base):
    __tablename__ = "site_surveys"

    id = Column(String, primary_key=True, default=lambda: generate_id("surv"))
    lead_id = Column(String, ForeignKey("leads.id"), nullable=False, unique=True)
    roof_tilt_deg = Column(Float, nullable=False)
    roof_direction = Column(String, nullable=False)
    cable_distance_meters = Column(Float, nullable=False)
    shadow_obstruction = Column(String, default="None")
    earthing_resistance_ohms = Column(Float, nullable=False)
    surveyor_name = Column(String, nullable=False)
    approved = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lead = relationship("Lead", back_populates="survey")


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(String, primary_key=True, default=lambda: generate_id("quote"))
    lead_id = Column(String, ForeignKey("leads.id"), nullable=False)
    system_name = Column(String, nullable=False)
    capacity_kw = Column(Float, nullable=False)
    system_type = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    subsidy_amount = Column(Float, default=0.0)
    net_customer_payable = Column(Float, nullable=False)
    advance_paid = Column(Float, default=0.0)
    remaining_balance = Column(Float, default=0.0)
    payment_status = Column(String, default="unpaid")  # unpaid, advance_paid, full_paid
    status = Column(String, default="sent")  # draft, sent, confirmed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lead = relationship("Lead", back_populates="quotations")
    items = relationship("BOMItem", back_populates="quotation", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="quotation")


class BOMItem(Base):
    __tablename__ = "bom_items"

    id = Column(String, primary_key=True, default=lambda: generate_id("bom"))
    quotation_id = Column(String, ForeignKey("quotations.id"), nullable=False)
    item_name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Panels, Inverter, Battery, Structure, Electrical, Safety
    quantity = Column(Integer, nullable=False)
    uom = Column(String, default="Nos")
    unit_cost = Column(Float, nullable=False)
    is_serialized = Column(Boolean, default=False)

    quotation = relationship("Quotation", back_populates="items")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=lambda: generate_id("ord"))
    lead_id = Column(String, ForeignKey("leads.id"), nullable=False)
    quotation_id = Column(String, ForeignKey("quotations.id"), nullable=True)
    customer_name = Column(String, nullable=False)
    system_name = Column(String, nullable=False)
    capacity_kw = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    advance_paid = Column(Float, default=0.0)
    remaining_balance = Column(Float, default=0.0)
    payment_status = Column(String, default="advance_paid")
    warehouse_status = Column(String, default="ready_for_dispatch")  # pending_packing, ready_for_dispatch, dispatched
    installation_status = Column(String, default="scheduled")  # scheduled, in_progress, completed
    scheduled_install_date = Column(String, nullable=True)
    actual_install_date = Column(String, nullable=True)
    technician_name = Column(String, nullable=True)
    roof_photo_url = Column(String, nullable=True)
    customer_signature_base64 = Column(Text, nullable=True)
    homeowner_feedback = Column(Text, nullable=True)
    work_duration_hours = Column(Float, default=0.0)
    hardware_cost = Column(Float, default=0.0)
    labor_cost = Column(Float, default=11000.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lead = relationship("Lead", back_populates="orders")
    quotation = relationship("Quotation", back_populates="orders")
    assets = relationship("SerializedAsset", back_populates="order", cascade="all, delete-orphan")


class SerializedAsset(Base):
    __tablename__ = "serialized_assets"

    id = Column(String, primary_key=True, default=lambda: generate_id("asset"))
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    category = Column(String, nullable=False)
    item_name = Column(String, nullable=False)
    serial_number = Column(String, nullable=False, unique=True, index=True)
    dispatched_by = Column(String, nullable=True)
    dispatched_at = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("Order", back_populates="assets")


class WarrantyRecord(Base):
    __tablename__ = "warranty_records"

    id = Column(String, primary_key=True, default=lambda: generate_id("warr"))
    serial_number = Column(String, nullable=False, unique=True, index=True)
    item_name = Column(String, nullable=False)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    duration_years = Column(Integer, nullable=False)
    warranty_start = Column(DateTime, nullable=False)
    warranty_end = Column(DateTime, nullable=False)
    status = Column(String, default="ACTIVE")  # ACTIVE, EXPIRED


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(String, primary_key=True, default=lambda: generate_id("tkt"))
    serial_number = Column(String, nullable=False, index=True)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    fault_code = Column(String, nullable=False)
    fault_description = Column(Text, nullable=False)
    is_under_warranty = Column(Boolean, default=True)
    warranty_expiry = Column(String, nullable=True)
    billing_amount = Column(Float, default=0.0)
    billing_type = Column(String, default="FREE_WARRANTY_REPLACEMENT")  # FREE_WARRANTY_REPLACEMENT, OUT_OF_WARRANTY_PAID
    assigned_technician = Column(String, nullable=True)
    status = Column(String, default="open")  # open, dispatched, resolved
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
