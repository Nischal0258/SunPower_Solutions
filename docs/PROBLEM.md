# 📄 PROBLEM.md — Solar Installation Management System (SunPower Solutions)
**Hackathon:** Odoo x GECT Hackathon (Oct 31 – Nov 1)  
**Client Profile:** SunPower Solutions (Rooftop Solar EPC Company)  
**Target Solution:** Unified Solar Installation, Inventory, Field Service & Warranty Platform  

---

## 1. Executive Summary & Problem Context
SunPower Solutions is a fast-growing rooftop solar engineering and installation company completing ~40 projects/month across residential rooftops and small commercial units. 

Despite strong market demand driven by green energy adoption and government subsidies (e.g., PM Surya Ghar Muft Bijli Yojana), SunPower's operational backbone is severely broken:
- **Lead Leakage:** Enquiries coming in via WhatsApp, phone calls, and disparate web forms are dropped or delayed.
- **Manual Quotation Errors:** Quotes are typed manually from scratch; technicians and sales reps frequently omit critical mounting hardware, safety earthing kits, or AC/DC distribution boxes, eroding profit margins.
- **Inventory & Traceability Black Hole:** High-value serialized items (Inverters ₹45,000+, Battery packs ₹60,000+) are tracked on loose paper registers. By the time a customer files a warranty claim 18–36 months later, serial number records cannot be found.
- **Disconnected Field Operations:** Installation crews of 15 technicians operate with paper site registers and WhatsApp group photo uploads. Handover proofs, client signoffs, and safety checks are unstructured.
- **Reactive, Chaotic After-Sales:** When monsoon breakdowns occur, support staff cannot immediately determine warranty eligibility, leading to customer disputes and unbilled replacement costs.
- **Executive Blindness:** The Director has zero real-time visibility into job profitability, technician labor allocation, inventory consumption, and pending subsidy approvals.

---

## 2. Core Stakeholders & User Personas

| Persona | Role | Primary Pain Points | What the System Must Provide |
| :--- | :--- | :--- | :--- |
| **Priya (Sales Rep)** | Captures inquiries & issues quotes | Loses leads across WhatsApp/calls; manual BOM estimation leads to wrong pricing. | Instant lead capture dashboard, AI bill & roof area feasibility calculator, 1-click template quotation. |
| **Rajesh (Surveyor / Field Tech)** | Site survey & on-roof installation | Relies on paper registers; photos lost on phone storage; manual client acceptance. | Mobile-first field app: shadow/tilt inputs, finished roof photo upload, digital signature capture on glass. |
| **Vikram (Warehouse Manager)** | Inventory dispatch & asset tracking | Dispatches ₹1.5L+ kits without automated serial verification; manual entry errors. | Barcode/Serial number scanning gate; automated linkage of serial numbers to Customer Order; 1-click dispatch. |
| **Ananya (Support & Warranty Desk)** | Post-installation complaints & RMA | Customer calls with fault codes; takes days to verify purchase date and warranty status. | 5-second customer/serial lookup; automated warranty engine (Free if $<2$ yrs, Auto-invoiced if expired); ticket lifecycle. |
| **Suresh (Managing Director)** | Business strategy & finance | Unknown margins per job; subsidy paperwork bottleneck; no aggregated P&L view. | Real-time Executive Dashboard: Profit per job (Revenue minus BOM & Labor), subsidy pipeline, low stock alerts. |

---

## 3. Explicit Problem Statement Requirements (From Source Brief)

1. **System Packages Supported:**
   - **Solar Panel Sets (Hardware):** Panels, connectors, wiring, earthing kits.
   - **On-Grid Systems (1 kW to 5 kW):** String inverter, AC/DC distribution boxes, bi-directional meter prep, safety earthing, structure stands.
   - **Off-Grid Systems (1 kW to 5 kW):** Everything in On-Grid + Battery bank + Charge controller.
   - **Installation Service:** Site survey, roof mounting, wiring, safety testing & commissioning.

2. **The 6 Critical Operational Scenes:**
   - **Scene 1 (Rooftop Inquiry):** Web form capture $\to$ Feasibility check (roof shadow-free area, monthly power bill) $\to$ Technician site visit booking (tilt, azimuth, cable run) $\to$ Survey approval gate before quotation.
   - **Scene 2 (The Kit & Auto-BOM):** Selecting system size (e.g., 3 kW On-Grid) automatically populates exact parts list (BOM). Staged payment (Advance / Full). Warehouse dispatch trigger & crew scheduling without phone calls.
   - **Scene 3 (Dispatch & Serial Number Scanning):** Mandatory barcode/serial scan of inverters, batteries, and controllers before truck departs. Delivery confirmation auto-starts warranty clock (2 years for inverter/battery, 20 years for panels).
   - **Scene 4 (On-Roof Technician Mobile Handover):** Tech logs start/stop time, confirms kW capacity, uploads roof installation photos, customer signs on screen.
   - **Scene 5 (Rainy Season Breakdown & Warranty Engine):** Search customer/serial $\to$ display active warranty status. Under warranty = ₹0 replacement; Expired = Auto-generated invoice with parts + labor.
   - **Scene 6 (Director Month-End Review):** Job-level profitability (Gross Margin = Sales Price - Hardware Cost - Labor Cost), inventory status, subsidy paperwork tracking, technician payouts.

---

## 4. Implicit & Enterprise Requirements (Winning Edge for Judges)

- **Auditability:** Complete timestamped audit trail from Inquiry $\to$ Survey $\to$ BOM $\to$ Dispatch $\to$ Install $\to$ Warranty Claim.
- **Zero-Error Data Contract:** Seamless handoff between Sales, Warehouse, Field, and Support.
- **AI-Powered Value Multipliers:**
  - AI Electricity Bill OCR & kW Recommender (Parses bill image $\to$ suggests ideal kW size and PM Surya Ghar subsidy estimate).
  - AI Vision Roof Quality Inspection (Checks photo for clean layout, alignment, and secure mounting).
  - AI Inverter Error Diagnostic (Translates technical error code into technician instructions and customer explanation).
