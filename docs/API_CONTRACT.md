# 🤝 API_CONTRACT.md — Frontend/Backend Integration Contract
**Project:** SunPower Solutions  
**Purpose:** Ensure ZERO mismatches, ZERO missing fields, and ZERO runtime errors between Backend (FastAPI) and Frontend (React).

---

## 1. Golden Rules for Zero-Error Integration

1. **Uniform Response Envelope:**
   Every single backend response (success or failure) follows this exact structure:
   ```json
   {
     "success": true,
     "data": { ... },
     "message": "Human-readable status or error message"
   }
   ```
2. **CORS is Pre-Configured in Backend:**
   Backend has origins allowed for `http://localhost:5173` (Vite) and `http://localhost:3000`.
3. **Date Formats:**
   All dates and timestamps are formatted as standard ISO strings: `YYYY-MM-DDTHH:mm:ssZ`.
4. **Interactive Swagger Inspector:**
   Frontend partner can always visit:  
   👉 `http://localhost:8000/docs`  
   to view schemas, test live requests, and copy exact JSON payloads.

---

## 2. Complete REST Endpoints Specification

---

### Endpoint 1: Create New Customer Lead
- **Method:** `POST /api/v1/leads`
- **Frontend Request Body:**
```json
{
  "customer_name": "Rajesh Sharma",
  "phone": "+91 98765 43210",
  "email": "sharma.solar@example.com",
  "address": "Plot 42, Civil Lines, Jaipur",
  "property_type": "Residential",
  "monthly_bill": 4500.0,
  "shadow_free_area_sqft": 350.0,
  "requested_capacity_kw": 3.0,
  "system_type": "On-Grid"
}
```
- **Backend Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "lead_101",
    "customer_name": "Rajesh Sharma",
    "phone": "+91 98765 43210",
    "status": "pending_survey",
    "recommended_capacity_kw": 3.0,
    "created_at": "2026-10-31T10:30:00Z"
  },
  "message": "Lead created successfully"
}
```

---

### Endpoint 2: Submit & Approve Technical Site Survey
- **Method:** `POST /api/v1/leads/{lead_id}/survey`
- **Frontend Request Body:**
```json
{
  "roof_tilt_deg": 22.5,
  "roof_direction": "South-Facing",
  "cable_distance_meters": 28.0,
  "shadow_obstruction": "None (Full Daylight)",
  "earthing_resistance_ohms": 3.8,
  "surveyor_name": "Manoj Kumar",
  "approved": true,
  "notes": "Optimal roof condition, 3kW mono-perc structure recommended"
}
```
- **Backend Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "survey_id": "surv_501",
    "lead_id": "lead_101",
    "approved": true,
    "quote_unlocked": true
  },
  "message": "Site survey approved. Quotation unlocked."
}
```

---

### Endpoint 3: Fetch Pre-Configured BOM Template
- **Method:** `GET /api/v1/templates/bom?capacity_kw=3.0&system_type=On-Grid`
- **Backend Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "system_name": "3 kW On-Grid Rooftop System",
    "capacity_kw": 3.0,
    "system_type": "On-Grid",
    "total_base_price": 185000.0,
    "estimated_subsidy": 78000.0,
    "net_customer_price": 107000.0,
    "items": [
      {
        "item_name": "Mono-PERC Solar Panels (540W)",
        "category": "Panels",
        "quantity": 6,
        "uom": "Nos",
        "unit_cost": 12000.0,
        "is_serialized": true
      },
      {
        "item_name": "Single Phase Grid-Tied Inverter 3.3kW",
        "category": "Inverter",
        "quantity": 1,
        "uom": "Nos",
        "unit_cost": 38000.0,
        "is_serialized": true
      },
      {
        "item_name": "Galvanized Mounting Structure (3kW)",
        "category": "Structure",
        "quantity": 1,
        "uom": "Set",
        "unit_cost": 14000.0,
        "is_serialized": false
      },
      {
        "item_name": "ACDB & DCDB Protection Boxes",
        "category": "Electrical",
        "quantity": 1,
        "uom": "Set",
        "unit_cost": 8500.0,
        "is_serialized": false
      },
      {
        "item_name": "Copper Chemical Earthing Kit & Rods",
        "category": "Safety",
        "quantity": 2,
        "uom": "Set",
        "unit_cost": 4200.0,
        "is_serialized": false
      }
    ]
  },
  "message": "BOM template fetched"
}
```

---

### Endpoint 4: Confirm Order & Record Staged Payment
- **Method:** `POST /api/v1/quotes/{lead_id}/confirm`
- **Frontend Request Body:**
```json
{
  "payment_type": "advance",
  "amount_paid": 30000.0,
  "payment_method": "UPI / Bank Transfer",
  "reference_id": "UPI-884920482"
}
```
- **Backend Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "order_id": "ord_901",
    "lead_id": "lead_101",
    "payment_status": "advance_paid",
    "remaining_balance": 77000.0,
    "warehouse_status": "ready_for_dispatch",
    "scheduled_install_date": "2026-11-04"
  },
  "message": "Advance payment received. Order sent to warehouse queue."
}
```

---

### Endpoint 5: Scan Serial Numbers & Complete Dispatch
- **Method:** `POST /api/v1/dispatch/{order_id}/complete`
- **Frontend Request Body:**
```json
{
  "scanned_serials": [
    {
      "category": "Inverter",
      "item_name": "3.3kW On-Grid Inverter",
      "serial_number": "INV-3KW-9021-X"
    },
    {
      "category": "Panels",
      "item_name": "540W Panel Master Batch",
      "serial_number": "PNL-LOT-2026-88"
    }
  ],
  "dispatched_by": "Vikram (Store Manager)"
}
```
- **Backend Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "order_id": "ord_901",
    "dispatch_status": "dispatched",
    "warranty_activated": true,
    "warranty_records": [
      {
        "serial_number": "INV-3KW-9021-X",
        "duration_years": 2,
        "warranty_end": "2028-10-31T10:30:00Z",
        "status": "ACTIVE"
      },
      {
        "serial_number": "PNL-LOT-2026-88",
        "duration_years": 20,
        "warranty_end": "2046-10-31T10:30:00Z",
        "status": "ACTIVE"
      }
    ]
  },
  "message": "Dispatch verified. 2-Year and 20-Year warranty clocks started."
}
```

---

### Endpoint 6: Field Technician Mobile Handover & Signature
- **Method:** `POST /api/v1/field/jobs/{order_id}/complete`
- **Frontend Request Body:**
```json
{
  "technician_name": "Rajesh & Team",
  "actual_capacity_kw": 3.0,
  "roof_photo_url": "https://example.com/uploads/roof_finish_901.jpg",
  "customer_signature_base64": "data:image/png;base64,iVBORw0KGgoAAAANSU...",
  "homeowner_feedback": "Installation clean, meter testing completed.",
  "work_duration_hours": 6.5
}
```
- **Backend Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "job_id": "job_901",
    "status": "completed",
    "completion_certificate_url": "/api/v1/certificates/job_901.pdf"
  },
  "message": "Job marked as completed. Digital certificate created."
}
```

---

### Endpoint 7: Warranty Lookup & Fault Ticket Generation
- **Method:** `POST /api/v1/tickets/create`
- **Frontend Request Body:**
```json
{
  "serial_number": "INV-3KW-9021-X",
  "customer_phone": "+91 98765 43210",
  "fault_code": "ERR-F24 (Inverter Zero Power / Grid Loss)",
  "customer_notes": "It is raining heavily and inverter screen has error code"
}
```
- **Backend Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ticket_id": "tkt_401",
    "serial_number": "INV-3KW-9021-X",
    "customer_name": "Rajesh Sharma",
    "is_under_warranty": true,
    "warranty_expiry": "2028-10-31T10:30:00Z",
    "billing_amount": 0.0,
    "billing_type": "FREE_WARRANTY_REPLACEMENT",
    "assigned_technician": "Manoj Kumar",
    "status": "dispatched"
  },
  "message": "Active warranty detected. ₹0 replacement work order dispatched."
}
```

---

### Endpoint 8: Director Executive Analytics & P&L
- **Method:** `GET /api/v1/analytics/dashboard`
- **Backend Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "month": "October 2026",
    "total_revenue": 7400000.0,
    "total_hardware_cost": 4810000.0,
    "total_labor_cost": 592000.0,
    "gross_profit": 1998000.0,
    "gross_margin_pct": 27.0,
    "active_projects": 14,
    "completed_this_month": 40,
    "subsidy_pipeline": {
      "submitted": 18,
      "discom_inspected": 12,
      "disbursed": 10,
      "total_subsidy_value_in_pipeline": 2960000.0
    },
    "open_tickets": 3,
    "recent_jobs": [
      {
        "customer": "Rajesh Sharma",
        "system": "3 kW On-Grid",
        "revenue": 185000.0,
        "cost": 132000.0,
        "profit": 53000.0,
        "margin_pct": 28.6
      }
    ]
  },
  "message": "Executive metrics calculated"
}
```
