# 🚀 SunPower Solutions — Frontend Developer Complete Handoff Kit
**Hackathon:** Odoo x GCET Hackathon (Oct 31 – Nov 1, 2026)  
**Target Solution:** Unified Solar Installation, Inventory, Field Service & Warranty Platform  
**Target Audience:** Frontend Engineer (React + TypeScript + Tailwind CSS)  

> **Hey! 👋** This single file contains **everything** you need to start building immediately with **zero backend dependencies**, **zero type errors**, and **zero confusion**. You can build the entire UI using the provided mock data store right now, and when the FastAPI backend is running, flipping one single toggle (`USE_MOCK = false`) connects everything live!

---

## 📌 Table of Contents
1. [Project Context & User Story](#1-project-context--user-story)
2. [5-Minute Quickstart (Commands to Run)](#2-5-minute-quickstart-commands-to-run)
3. [Recommended Project File Structure](#3-recommended-project-file-structure)
4. [Complete TypeScript Types (`src/types/solarTypes.ts`)](#4-complete-typescript-types-srctypessolartypests)
5. [Plug-and-Play Mock Data Store (`src/data/mockData.ts`)](#5-plug-and-play-mock-data-store-srcdatamockdatats)
6. [The 7 Screens / Navigation Views (UI Specifications)](#6-the-7-screens--navigation-views-ui-specifications)
7. [AI Feature Enhancements (Judges' Choice Multipliers)](#7-ai-feature-enhancements-judges-choice-multipliers)
8. [API Contract & Seamless Live Switching](#8-api-contract--seamless-live-switching)
9. [Error Prevention & Zero-Bug Checklist](#9-error-prevention--zero-bug-checklist)

---

## 1. Project Context & User Story

**SunPower Solutions** is a rooftop solar EPC installing ~40 systems/month across residential rooftops and commercial units. Their operational system has major friction points that our app solves:
- **Lead Leakage:** Enquiries get lost $\to$ *We provide an instant lead intake and feasibility checker.*
- **Quotation Errors:** Missing parts lead to margin erosion $\to$ *Selecting 1kW–5kW auto-populates exact Bill of Materials (BOM).*
- **Missing Serials & Warranty Chaos:** High-value inverters (₹45,000+) are lost on paper registers $\to$ *Mandatory barcode/serial scanning at warehouse dispatch, automatically activating 2-year and 20-year warranty clocks.*
- **Unstructured Field Handover:** Technicians upload photos randomly to WhatsApp $\to$ *Mobile-friendly field app with photo upload and customer on-screen digital signature.*
- **Monsoon Breakdown Disputes:** Inability to check warranty status $\to$ *Instant serial lookup: ₹0 free replacement if $<2$ years; auto-generated repair invoice if expired.*
- **Director Blindness:** No visibility into profit $\to$ *Executive Dashboard showing real-time Gross Margin ($\text{Revenue} - \text{BOM} - \text{Labor}$) and subsidy pipeline.*

---

## 2. 5-Minute Quickstart (Commands to Run)

Open your terminal in `c:\Users\Dell\Desktop\Solar\` and run:

```bash
# 1. Create Vite React + TypeScript app
npm create vite@latest frontend -- --template react-ts

# 2. Enter folder & install dependencies
cd frontend
npm install

# 3. Install UI icons, HTTP client, and digital signature canvas
npm install lucide-react axios react-signature-canvas
npm install -D @types/react-signature-canvas

# 4. Install Tailwind CSS v4 / v3
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Tailwind Configuration (`tailwind.config.js`):
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solar: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}
```

Add to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 3. Recommended Project File Structure

```text
frontend/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.tsx             # Top header with logo, role badge, mock toggle
│   │   ├── LeadIntakeModal.tsx    # Customer inquiry form + AI Bill Scan trigger
│   │   ├── SurveyApprovalModal.tsx# Technical roof survey form & approval gate
│   │   ├── SignaturePadModal.tsx  # Canvas for homeowner signoff on mobile
│   │   └── AiModal.tsx            # Modal for Bill OCR / Roof QA / Inverter Fault AI
│   ├── views/
│   │   ├── CrmLeadsView.tsx       # Tab 1: Leads, feasibility & survey triggers
│   │   ├── QuotationBomView.tsx   # Tab 2: 1-5kW system selector & auto-BOM parts list
│   │   ├── WarehouseDispatchView.tsx # Tab 3: Serial scanning & dispatch completion
│   │   ├── FieldTechMobileView.tsx   # Tab 4: Mobile-optimized checklist & customer signoff
│   │   ├── SupportWarrantyView.tsx   # Tab 5: Serial search, warranty badge & fault tickets
│   │   └── DirectorDashboardView.tsx # Tab 6: Real-time P&L, margins & subsidy funnel
│   ├── types/
│   │   └── solarTypes.ts          # Complete shared interfaces (provided below)
│   ├── data/
│   │   └── mockData.ts            # Plug-and-play mock data store (provided below)
│   ├── services/
│   │   └── api.ts                 # Axios client with fallback to mockData
│   ├── App.tsx                    # Main app with tab switching
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 4. Complete TypeScript Types (`src/types/solarTypes.ts`)

Save this exact code into `src/types/solarTypes.ts`:

```typescript
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
  survey?: SiteSurvey;
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
  customer_name: string;
  system_name: string;
  capacity_kw: number;
  total_amount: number;
  advance_paid: number;
  remaining_balance: number;
  payment_status: 'advance_paid' | 'full_paid';
  warehouse_status: 'pending_packing' | 'ready_for_dispatch' | 'dispatched';
  scheduled_install_date: string;
  scanned_serials?: ScannedSerial[];
}

export interface ScannedSerial {
  category: string;
  item_name: string;
  serial_number: string;
}

export interface WarrantyRecord {
  serial_number: string;
  item_name: string;
  customer_name: string;
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
  fault_description: string;
  is_under_warranty: boolean;
  warranty_expiry: string;
  billing_amount: number;
  billing_type: 'FREE_WARRANTY_REPLACEMENT' | 'OUT_OF_WARRANTY_PAID';
  assigned_technician?: string;
  status: 'open' | 'dispatched' | 'resolved';
  created_at: string;
}

export interface JobProfitDetail {
  id: string;
  customer: string;
  system: string;
  capacity_kw: number;
  revenue: number;
  bom_cost: number;
  labor_cost: number;
  profit: number;
  margin_pct: number;
  status: string;
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
```

---

## 5. Plug-and-Play Mock Data Store (`src/data/mockData.ts`)

Save this file into `src/data/mockData.ts`. It lets you build and test **100% of the UI immediately**:

```typescript
import {
  Lead,
  BomTemplate,
  OrderConfirmation,
  WarrantyRecord,
  SupportTicket,
  DirectorAnalytics,
} from '../types/solarTypes';

export const mockLeads: Lead[] = [
  {
    id: 'lead_101',
    customer_name: 'Rajesh Sharma',
    phone: '+91 98765 43210',
    email: 'sharma.rajesh@example.com',
    address: 'Plot 42, Civil Lines, Jaipur',
    property_type: 'Residential',
    monthly_bill: 4800,
    shadow_free_area_sqft: 380,
    requested_capacity_kw: 3.0,
    system_type: 'On-Grid',
    status: 'survey_approved',
    created_at: '2026-10-31T09:30:00Z',
    survey: {
      survey_id: 'surv_501',
      lead_id: 'lead_101',
      roof_tilt_deg: 22.5,
      roof_direction: 'South-Facing',
      cable_distance_meters: 28,
      shadow_obstruction: 'None (Full Sun)',
      earthing_resistance_ohms: 3.8,
      surveyor_name: 'Manoj Kumar',
      approved: true,
      notes: 'Optimal roof condition. Approved for 3kW Mono-PERC system.',
    },
  },
  {
    id: 'lead_102',
    customer_name: 'Kapoor Textiles Warehouse',
    phone: '+91 98290 11223',
    email: 'ops@kapoortextiles.in',
    address: 'F-12, Sitapura Industrial Area, Jaipur',
    property_type: 'Commercial',
    monthly_bill: 14500,
    shadow_free_area_sqft: 850,
    requested_capacity_kw: 5.0,
    system_type: 'Off-Grid',
    status: 'new',
    created_at: '2026-10-31T10:15:00Z',
  },
  {
    id: 'lead_103',
    customer_name: 'Dr. Sunita Verma',
    phone: '+91 94140 88776',
    email: 'dr.verma@gmail.com',
    address: 'B-14, Malviya Nagar, Jaipur',
    property_type: 'Residential',
    monthly_bill: 3200,
    shadow_free_area_sqft: 250,
    requested_capacity_kw: 2.0,
    system_type: 'On-Grid',
    status: 'confirmed',
    created_at: '2026-10-30T14:00:00Z',
  },
];

export const mockBomTemplates: Record<string, BomTemplate> = {
  '3_On-Grid': {
    system_name: '3 kW On-Grid Rooftop System',
    capacity_kw: 3.0,
    system_type: 'On-Grid',
    total_base_price: 185000,
    estimated_subsidy: 78000,
    net_customer_price: 107000,
    items: [
      {
        item_name: 'Mono-PERC Solar Panels (540W)',
        category: 'Panels',
        quantity: 6,
        uom: 'Nos',
        unit_cost: 12000,
        is_serialized: true,
      },
      {
        item_name: 'Single Phase Grid-Tied Inverter 3.3kW',
        category: 'Inverter',
        quantity: 1,
        uom: 'Nos',
        unit_cost: 38000,
        is_serialized: true,
      },
      {
        item_name: 'Galvanized Mounting Structure (3kW Elevated)',
        category: 'Structure',
        quantity: 1,
        uom: 'Set',
        unit_cost: 14000,
        is_serialized: false,
      },
      {
        item_name: 'ACDB & DCDB Protection Boxes (SPD + MCB)',
        category: 'Electrical',
        quantity: 1,
        uom: 'Set',
        unit_cost: 8500,
        is_serialized: false,
      },
      {
        item_name: 'Chemical Copper Earthing Kit with 2 Rods',
        category: 'Safety',
        quantity: 2,
        uom: 'Set',
        unit_cost: 4200,
        is_serialized: false,
      },
      {
        item_name: 'Solar DC Cable 4 sq.mm (UV Protected)',
        category: 'Electrical',
        quantity: 35,
        uom: 'Meters',
        unit_cost: 65,
        is_serialized: false,
      },
    ],
  },
  '5_Off-Grid': {
    system_name: '5 kW Off-Grid Heavy-Duty System',
    capacity_kw: 5.0,
    system_type: 'Off-Grid',
    total_base_price: 340000,
    estimated_subsidy: 0,
    net_customer_price: 340000,
    items: [
      {
        item_name: 'Bi-Facial Solar Panels (550W)',
        category: 'Panels',
        quantity: 10,
        uom: 'Nos',
        unit_cost: 13500,
        is_serialized: true,
      },
      {
        item_name: '5kW Hybrid MPPT Inverter',
        category: 'Inverter',
        quantity: 1,
        uom: 'Nos',
        unit_cost: 62000,
        is_serialized: true,
      },
      {
        item_name: 'Lithium Ferro Phosphate (LFP) Battery 5.12kWh',
        category: 'Battery',
        quantity: 2,
        uom: 'Nos',
        unit_cost: 65000,
        is_serialized: true,
      },
      {
        item_name: 'Heavy Duty Wind-Rated Mounting Structure',
        category: 'Structure',
        quantity: 1,
        uom: 'Set',
        unit_cost: 22000,
        is_serialized: false,
      },
      {
        item_name: 'Dual DCDB + AC Distribution Panel',
        category: 'Electrical',
        quantity: 1,
        uom: 'Set',
        unit_cost: 12500,
        is_serialized: false,
      },
    ],
  },
};

export const mockOrders: OrderConfirmation[] = [
  {
    order_id: 'ord_901',
    lead_id: 'lead_101',
    customer_name: 'Rajesh Sharma',
    system_name: '3 kW On-Grid Rooftop System',
    capacity_kw: 3.0,
    total_amount: 185000,
    advance_paid: 40000,
    remaining_balance: 67000,
    payment_status: 'advance_paid',
    warehouse_status: 'ready_for_dispatch',
    scheduled_install_date: '2026-11-04',
  },
  {
    order_id: 'ord_902',
    lead_id: 'lead_103',
    customer_name: 'Dr. Sunita Verma',
    system_name: '2 kW On-Grid Rooftop System',
    capacity_kw: 2.0,
    total_amount: 130000,
    advance_paid: 130000,
    remaining_balance: 0,
    payment_status: 'full_paid',
    warehouse_status: 'dispatched',
    scheduled_install_date: '2026-11-02',
    scanned_serials: [
      { category: 'Inverter', item_name: '2.2kW Inverter', serial_number: 'INV-2KW-8841-A' },
      { category: 'Panels', item_name: '540W Mono-PERC Batch', serial_number: 'LOT-PNL-2026-44' },
    ],
  },
];

export const mockWarranties: WarrantyRecord[] = [
  {
    serial_number: 'INV-3KW-9021-X',
    item_name: 'Single Phase Inverter 3.3kW',
    customer_name: 'Vikram Mehta (Installed June 2026)',
    duration_years: 2,
    warranty_start: '2026-06-15T00:00:00Z',
    warranty_end: '2028-06-15T00:00:00Z',
    status: 'ACTIVE',
  },
  {
    serial_number: 'INV-OLD-2024-99',
    item_name: '3kW Solar Inverter (Installed Jan 2024)',
    customer_name: 'Anil Agarwal (Installed 28 months ago)',
    duration_years: 2,
    warranty_start: '2024-01-10T00:00:00Z',
    warranty_end: '2026-01-10T00:00:00Z',
    status: 'EXPIRED',
  },
];

export const mockTickets: SupportTicket[] = [
  {
    ticket_id: 'tkt_401',
    serial_number: 'INV-3KW-9021-X',
    customer_name: 'Vikram Mehta',
    customer_phone: '+91 98290 55443',
    fault_code: 'ERR-F24: Inverter Grid Disconnect',
    fault_description: 'Inverter shuts down in afternoon storm; error F24 on LCD.',
    is_under_warranty: true,
    warranty_expiry: '2028-06-15T00:00:00Z',
    billing_amount: 0,
    billing_type: 'FREE_WARRANTY_REPLACEMENT',
    assigned_technician: 'Rajesh & Team',
    status: 'dispatched',
    created_at: '2026-10-31T08:00:00Z',
  },
  {
    ticket_id: 'tkt_402',
    serial_number: 'INV-OLD-2024-99',
    customer_name: 'Anil Agarwal',
    customer_phone: '+91 94140 12345',
    fault_code: 'ERR-F08: IGBT Overheating / Short',
    fault_description: 'Smell of burnt electronics after monsoon lightning strike.',
    is_under_warranty: false,
    warranty_expiry: '2026-01-10T00:00:00Z',
    billing_amount: 14500,
    billing_type: 'OUT_OF_WARRANTY_PAID',
    assigned_technician: 'Manoj Kumar',
    status: 'open',
    created_at: '2026-10-31T09:45:00Z',
  },
];

export const mockDirectorAnalytics: DirectorAnalytics = {
  month: 'October 2026',
  total_revenue: 7400000,
  total_hardware_cost: 4810000,
  total_labor_cost: 592000,
  gross_profit: 1998000,
  gross_margin_pct: 27.0,
  active_projects: 14,
  completed_this_month: 40,
  subsidy_pipeline: {
    submitted: 18,
    discom_inspected: 12,
    disbursed: 10,
    total_subsidy_value_in_pipeline: 2960000,
  },
  open_tickets: 2,
  recent_jobs: [
    {
      id: 'job_1',
      customer: 'Rajesh Sharma',
      system: '3 kW On-Grid',
      capacity_kw: 3.0,
      revenue: 185000,
      bom_cost: 121000,
      labor_cost: 11000,
      profit: 53000,
      margin_pct: 28.6,
      status: 'Completed',
    },
    {
      id: 'job_2',
      customer: 'Kapoor Textiles',
      system: '5 kW Off-Grid',
      capacity_kw: 5.0,
      revenue: 340000,
      bom_cost: 232000,
      labor_cost: 18000,
      profit: 90000,
      margin_pct: 26.5,
      status: 'Dispatched',
    },
    {
      id: 'job_3',
      customer: 'Dr. Sunita Verma',
      system: '2 kW On-Grid',
      capacity_kw: 2.0,
      revenue: 130000,
      bom_cost: 86000,
      labor_cost: 8500,
      profit: 35500,
      margin_pct: 27.3,
      status: 'In Progress',
    },
  ],
};
```

---

## 6. The 7 Screens / Navigation Views (UI Specifications)

Set up a top navigation bar with easy switching between the 6 operational personas plus the Director view:

### Screen 1: CRM & Lead Intake (Priya - Sales Rep)
- **Top Actions:** "+ New Inquiry" button, "⚡ Scan Bill with AI" button.
- **Lead List Cards / Table:**
  - Customer name, phone, address, property type.
  - Monthly bill & shadow-free roof area badge.
  - Requested kW and system type (`On-Grid` / `Off-Grid`).
  - Status Pills: `new` (gray), `survey_approved` (green), `quoted` (blue).
- **Feasibility Indicator:**
  - Auto-calculated: $\text{Recommended kW} = \text{Monthly Bill (₹)} \div 1500$.
  - Required roof area: $100\text{ sq.ft per kW}$.
  - Visual warning if roof area is smaller than needed.
- **Action Gate:** Clicking "Schedule / Approve Survey" opens the Survey Approval Modal.

### Screen 2: Site Survey Approval Gate
- **Input Fields:**
  - Roof Tilt ($\text{degrees}$, e.g. $22^\circ$)
  - Roof Direction (Dropdown: South-Facing, South-West, East, etc.)
  - Cable Run Distance (meters)
  - Earthing Resistance ($\Omega$, e.g. $3.8\,\Omega$ — must be $<5\,\Omega$)
  - Surveyor Name & Observations
- **Critical Business Rule:** **Quotation Generation is LOCKED** until this survey has `approved: true`. Show a clear locked padlock icon if unapproved.

### Screen 3: Auto-BOM Quotation & Staged Payment
- **System Selector Dropdown:**
  - `1 kW`, `2 kW`, `3 kW`, `4 kW`, `5 kW`
  - Radio toggle: `On-Grid` (with Subsidy) vs `Off-Grid` (with Batteries)
- **Automatic BOM Table:**
  - Instantly populates: Panels, Inverter, Mounting Structure, ACDB/DCDB, Earthing Rods, Cable meters.
  - Highlights serialized items with a purple badge (`[SERIAL REQUIRED]`).
- **Financial Breakdown:**
  - Total Base Price: e.g. ₹1,85,000
  - PM Surya Ghar Subsidy Deduction: -₹78,000
  - Net Customer Payable: ₹1,07,000
- **Staged Payment Action:**
  - Buttons: `Record Advance Payment (20% = ₹21,400)` or `Record Full Payment`.
  - On submit: Show success toast and trigger: *"Order moved to Warehouse Packing Queue"*.

### Screen 4: Warehouse Dispatch & Serial Scanner (Vikram)
- **Dispatch Queue:** Shows orders awaiting hardware allocation.
- **Mandatory Serial Entry Gate:**
  - Shows high-value components requiring unique barcodes (Inverter & Batteries).
  - Text input or mock barcode scanner button that fills serials (e.g., `INV-3KW-9021-X`).
  - Green checkmark appears when valid serial is entered.
- **Complete Dispatch Button:**
  - Disabled until all serialized parts have serial numbers assigned.
  - On click: triggers **Automated Warranty Clock Activation** (2-year Inverter/Battery, 20-year Panels).

### Screen 5: Field Technician Mobile Handover (Rajesh - Field Tech)
- **Responsive Viewport:** Make this view look great on mobile screens!
- **Job Checklist:**
  - [x] DC Isolator Switch tested
  - [x] Structure grounding & earthing $<5\,\Omega$ verified
  - [x] Bi-directional net meter wiring prepared
- **Photo Upload:**
  - Tech uploads finished rooftop photo (with "⚡ AI Roof QA" button).
- **Customer Acceptance Signature Pad:**
  - Uses `react-signature-canvas`.
  - Clear button + "Customer Sign on Glass".
  - Homeowner acceptance note: *"I confirm the 3kW solar system is installed and operational."*
  - "Complete Installation & Issue Certificate" button.

### Screen 6: Support Helpdesk & Warranty Engine (Ananya)
- **Instant Search Bar:** Search by serial number (e.g., `INV-3KW-9021-X` or `INV-OLD-2024-99`).
- **Instant Warranty Badge:**
  - 🟢 **ACTIVE WARRANTY** (Expires: Oct 2028) $\to$ **₹0 FREE REPLACEMENT WORK ORDER**
  - 🔴 **EXPIRED WARRANTY** (Expired: Jan 2026) $\to$ **AUTO-GENERATES REPAIR INVOICE (Hardware + ₹1,500 Labor)**
- **Fault Code Dropdown:**
  - `ERR-F24: Inverter Grid Disconnect`
  - `ERR-F08: IGBT Overheating / Short Circuit`
  - `ERR-B02: Battery Low Voltage Trip`
  - "⚡ Ask AI Diagnostics" button.
- **One-Click Ticket Dispatch:** Dispatches technician to address complaint.

### Screen 7: Director Executive Dashboard (Suresh - Managing Director)
- **KPI Summary Cards:**
  - Total Monthly Revenue (₹74.0 Lakhs)
  - Gross Profit & Net Margin (₹19.98 Lakhs | **27.0%**)
  - Active Installations (14 ongoing) | Completed (40 this month)
- **Subsidy Funnel Tracker (Visual Pipeline):**
  - `Paperwork Submitted (18)` $\to$ `DISCOM Inspected (12)` $\to$ `Subsidy Disbursed (10)`
  - Total Pipeline Value: ₹29.6 Lakhs
- **Job-by-Job Profitability Table:**
  - Customer, System, Revenue, Hardware BOM Cost, Labor Cost, Net Profit, Margin %.
  - Row colored soft green if margin $>25\%$.

---

## 7. AI Feature Enhancements (Judges' Choice Multipliers)

We will showcase 3 high-impact AI features powered by Gemini 2.5 Flash:

1. **AI Electricity Bill Scanner Modal (`AiModal.tsx`):**
   - User uploads a mock electricity bill image.
   - Shows simulated scanning animation.
   - Outputs: Units Consumed (420 kWh), Sanctioned Load (4 kW), Recommended Solar Size (**3.0 kW**), and PM Surya Ghar Subsidy (**₹78,000**).
   - "Apply to Lead Form" button auto-populates the inquiry form!
2. **AI Finished Roof Photo Quality Inspector:**
   - User uploads installed roof photo.
   - Gemini evaluates: Panel tilt alignment, shadow-free clearance, visible earthing indicator.
   - Returns score badge: `Installation Quality: 96/100 (Approved)`.
3. **AI Inverter Error Code Assistant:**
   - For any fault code (e.g. `ERR-F24`), Gemini displays:
     - Plain English root cause explanation for the homeowner.
     - Step-by-step diagnostic checklist for the technician.

---

## 8. API Contract & Seamless Live Switching

Create `src/services/api.ts` with a simple switch so you can build entirely with mock data now, and switch to live FastAPI in 1 second:

```typescript
import axios from 'axios';
import {
  mockLeads,
  mockBomTemplates,
  mockOrders,
  mockWarranties,
  mockTickets,
  mockDirectorAnalytics,
} from '../data/mockData';

// Set to false when FastAPI backend is running!
export const USE_MOCK = true;

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

export const solarService = {
  // Leads
  getLeads: async () => {
    if (USE_MOCK) return { success: true, data: mockLeads, message: 'Loaded from mock' };
    const res = await apiClient.get('/leads');
    return res.data;
  },

  // BOM Templates
  getBomTemplate: async (capacity_kw: number, system_type: string) => {
    if (USE_MOCK) {
      const key = `${capacity_kw}_${system_type}`;
      return { success: true, data: mockBomTemplates[key] || mockBomTemplates['3_On-Grid'], message: 'Loaded from mock' };
    }
    const res = await apiClient.get(`/templates/bom?capacity_kw=${capacity_kw}&system_type=${system_type}`);
    return res.data;
  },

  // Warranty Lookup
  lookupWarranty: async (serial: string) => {
    if (USE_MOCK) {
      const found = mockWarranties.find((w) => w.serial_number === serial);
      return { success: true, data: found || null, message: found ? 'Warranty found' : 'Serial not found' };
    }
    const res = await apiClient.get(`/warranty/lookup?serial_number=${serial}`);
    return res.data;
  },

  // Analytics Dashboard
  getAnalytics: async () => {
    if (USE_MOCK) return { success: true, data: mockDirectorAnalytics, message: 'Loaded from mock' };
    const res = await apiClient.get('/analytics/dashboard');
    return res.data;
  },
};
```

---

## 9. Error Prevention & Zero-Bug Checklist

To make sure your code has **zero bugs and runs cleanly for judging**:

1. **Null Safety with Optional Chaining:**  
   Always use optional chaining when rendering nested data, especially surveys and serial lists:
   ```tsx
   {lead.survey?.roof_tilt_deg ? `${lead.survey.roof_tilt_deg}°` : 'Pending Survey'}
   ```
2. **Handle Empty & Loading States:**  
   When rendering lists or search results, always provide friendly fallbacks:
   ```tsx
   {leads.length === 0 ? <p className="text-gray-400">No leads recorded yet.</p> : ...}
   ```
3. **Canvas Signature Pad Handling:**  
   Make sure to check if the signature pad has content before completing the job:
   ```tsx
   const sigPad = useRef<any>(null);
   const saveSignature = () => {
     if (sigPad.current && !sigPad.current.isEmpty()) {
       const dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
       // submit dataUrl
     }
   };
   ```
4. **Currency & Unit Formatting:**  
   Format currency cleanly using standard Indian Rupee notation:
   ```tsx
   const formatINR = (val: number) => '₹' + val.toLocaleString('en-IN');
   ```
5. **No CORS Headaches:**  
   Backend has CORS enabled with `allow_origins=["*"]`, so you won't encounter CORS blocking when switching to live mode.

---

🎉 **You are 100% equipped to start building! Let's build a winning solar platform!**
