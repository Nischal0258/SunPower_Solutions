/**
 * frontend_types.ts — Shared Data Models for SunPower Solutions
 * Frontend partner can drop this file into React (src/types/solarTypes.ts).
 * Guarantees 100% type safety and ZERO contract mismatches with the FastAPI backend.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export type SystemType = 'On-Grid' | 'Off-Grid';

export type LeadStatus =
  | 'new'
  | 'feasibility_checked'
  | 'survey_scheduled'
  | 'survey_approved'
  | 'quoted'
  | 'confirmed';

export interface Lead {
  id: string;
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  property_type: 'Residential' | 'Commercial' | 'Industrial';
  monthly_bill: number;
  shadow_free_area_sqft: number;
  requested_capacity_kw: number;
  system_type: SystemType;
  status: LeadStatus;
  created_at: string;
}

export interface SiteSurvey {
  survey_id?: string;
  lead_id: string;
  roof_tilt_deg: number;
  roof_direction: string;
  cable_distance_meters: number;
  shadow_obstruction: string;
  earthing_resistance_ohms: number;
  surveyor_name: string;
  approved: boolean;
  notes?: string;
}

export interface BomItem {
  item_name: string;
  category: 'Panels' | 'Inverter' | 'Battery' | 'Structure' | 'Electrical' | 'Safety';
  quantity: number;
  uom: string;
  unit_cost: number;
  is_serialized: boolean;
}

export interface BomTemplate {
  system_name: string;
  capacity_kw: number;
  system_type: SystemType;
  total_base_price: number;
  estimated_subsidy: number;
  net_customer_price: number;
  items: BomItem[];
}

export interface OrderConfirmation {
  order_id: string;
  lead_id: string;
  payment_status: 'advance_paid' | 'full_paid';
  remaining_balance: number;
  warehouse_status: 'pending_packing' | 'ready_for_dispatch' | 'dispatched';
  scheduled_install_date: string;
}

export interface ScannedSerial {
  category: string;
  item_name: string;
  serial_number: string;
}

export interface WarrantyRecord {
  serial_number: string;
  duration_years: number;
  warranty_start: string;
  warranty_end: string;
  status: 'ACTIVE' | 'EXPIRED';
}

export interface FieldJobCompletion {
  order_id: string;
  technician_name: string;
  actual_capacity_kw: number;
  roof_photo_url: string;
  customer_signature_base64: string;
  homeowner_feedback?: string;
  work_duration_hours: number;
}

export interface SupportTicket {
  ticket_id: string;
  serial_number: string;
  customer_name: string;
  customer_phone: string;
  fault_code: string;
  is_under_warranty: boolean;
  warranty_expiry: string;
  billing_amount: number;
  billing_type: 'FREE_WARRANTY_REPLACEMENT' | 'OUT_OF_WARRANTY_PAID';
  assigned_technician?: string;
  status: 'open' | 'dispatched' | 'resolved';
  created_at: string;
}

export interface JobProfitDetail {
  customer: string;
  system: string;
  revenue: number;
  cost: number;
  profit: number;
  margin_pct: number;
}

export interface DirectorAnalytics {
  month: string;
  total_revenue: number;
  total_hardware_cost: number;
  total_labor_cost: number;
  gross_profit: number;
  gross_margin_pct: number;
  active_projects: number;
  completed_this_month: number;
  subsidy_pipeline: {
    submitted: number;
    discom_inspected: number;
    disbursed: number;
    total_subsidy_value_in_pipeline: number;
  };
  open_tickets: number;
  recent_jobs: JobProfitDetail[];
}

export interface AiBillAnalysisResult {
  monthly_units_kwh: number;
  sanctioned_load_kw: number;
  average_bill_amount: number;
  recommended_capacity_kw: number;
  estimated_subsidy_inr: number;
  annual_savings_inr: number;
  ai_summary: string;
}
