"""
bom_templates.py — Pre-Engineered Bill of Materials Templates
Covers 1 kW to 5 kW for both On-Grid and Off-Grid solar systems.
"""

# Subsidy lookup table (PM Surya Ghar Muft Bijli Yojana)
# Central Government subsidies for residential rooftop solar
SUBSIDY_TABLE = {
    1.0: 30000,    # ₹30,000 for 1 kW
    2.0: 60000,    # ₹60,000 for 2 kW
    3.0: 78000,    # ₹78,000 for 3 kW (reduced rate above 3kW)
    4.0: 78000,    # ₹78,000 cap for 4 kW
    5.0: 78000,    # ₹78,000 cap for 5 kW
}

def get_subsidy(capacity_kw: float, system_type: str) -> float:
    """Off-Grid systems are not eligible for PM Surya Ghar subsidy."""
    if system_type == "Off-Grid":
        return 0.0
    return SUBSIDY_TABLE.get(capacity_kw, 0.0)


# ── On-Grid BOM Templates ─────────────────────────────────────────────────

ON_GRID_TEMPLATES = {
    1.0: {
        "system_name": "1 kW On-Grid Rooftop System",
        "items": [
            {"item_name": "Mono-PERC Solar Panels (540W)", "category": "Panels", "quantity": 2, "uom": "Nos", "unit_cost": 12000, "is_serialized": True},
            {"item_name": "Single Phase Grid-Tied Inverter 1.1kW", "category": "Inverter", "quantity": 1, "uom": "Nos", "unit_cost": 22000, "is_serialized": True},
            {"item_name": "Galvanized Mounting Structure (1kW)", "category": "Structure", "quantity": 1, "uom": "Set", "unit_cost": 6000, "is_serialized": False},
            {"item_name": "ACDB & DCDB Protection Box", "category": "Electrical", "quantity": 1, "uom": "Set", "unit_cost": 5500, "is_serialized": False},
            {"item_name": "Chemical Copper Earthing Kit", "category": "Safety", "quantity": 1, "uom": "Set", "unit_cost": 4200, "is_serialized": False},
            {"item_name": "Solar DC Cable 4 sq.mm (UV Protected)", "category": "Electrical", "quantity": 15, "uom": "Meters", "unit_cost": 65, "is_serialized": False},
        ],
    },
    2.0: {
        "system_name": "2 kW On-Grid Rooftop System",
        "items": [
            {"item_name": "Mono-PERC Solar Panels (540W)", "category": "Panels", "quantity": 4, "uom": "Nos", "unit_cost": 12000, "is_serialized": True},
            {"item_name": "Single Phase Grid-Tied Inverter 2.2kW", "category": "Inverter", "quantity": 1, "uom": "Nos", "unit_cost": 28000, "is_serialized": True},
            {"item_name": "Galvanized Mounting Structure (2kW)", "category": "Structure", "quantity": 1, "uom": "Set", "unit_cost": 10000, "is_serialized": False},
            {"item_name": "ACDB & DCDB Protection Boxes", "category": "Electrical", "quantity": 1, "uom": "Set", "unit_cost": 7000, "is_serialized": False},
            {"item_name": "Chemical Copper Earthing Kit with 2 Rods", "category": "Safety", "quantity": 1, "uom": "Set", "unit_cost": 4200, "is_serialized": False},
            {"item_name": "Solar DC Cable 4 sq.mm (UV Protected)", "category": "Electrical", "quantity": 25, "uom": "Meters", "unit_cost": 65, "is_serialized": False},
        ],
    },
    3.0: {
        "system_name": "3 kW On-Grid Rooftop System",
        "items": [
            {"item_name": "Mono-PERC Solar Panels (540W)", "category": "Panels", "quantity": 6, "uom": "Nos", "unit_cost": 12000, "is_serialized": True},
            {"item_name": "Single Phase Grid-Tied Inverter 3.3kW", "category": "Inverter", "quantity": 1, "uom": "Nos", "unit_cost": 38000, "is_serialized": True},
            {"item_name": "Galvanized Mounting Structure (3kW Elevated)", "category": "Structure", "quantity": 1, "uom": "Set", "unit_cost": 14000, "is_serialized": False},
            {"item_name": "ACDB & DCDB Protection Boxes (SPD + MCB)", "category": "Electrical", "quantity": 1, "uom": "Set", "unit_cost": 8500, "is_serialized": False},
            {"item_name": "Chemical Copper Earthing Kit with 2 Rods", "category": "Safety", "quantity": 2, "uom": "Set", "unit_cost": 4200, "is_serialized": False},
            {"item_name": "Solar DC Cable 4 sq.mm (UV Protected)", "category": "Electrical", "quantity": 35, "uom": "Meters", "unit_cost": 65, "is_serialized": False},
        ],
    },
    4.0: {
        "system_name": "4 kW On-Grid Rooftop System",
        "items": [
            {"item_name": "Mono-PERC Solar Panels (540W)", "category": "Panels", "quantity": 8, "uom": "Nos", "unit_cost": 12000, "is_serialized": True},
            {"item_name": "Three Phase Grid-Tied Inverter 4.4kW", "category": "Inverter", "quantity": 1, "uom": "Nos", "unit_cost": 45000, "is_serialized": True},
            {"item_name": "Heavy Duty Galvanized Mounting Structure (4kW)", "category": "Structure", "quantity": 1, "uom": "Set", "unit_cost": 18000, "is_serialized": False},
            {"item_name": "ACDB & DCDB Protection Boxes (SPD + MCB)", "category": "Electrical", "quantity": 1, "uom": "Set", "unit_cost": 10000, "is_serialized": False},
            {"item_name": "Chemical Copper Earthing Kit with 2 Rods", "category": "Safety", "quantity": 2, "uom": "Set", "unit_cost": 4200, "is_serialized": False},
            {"item_name": "Solar DC Cable 4 sq.mm (UV Protected)", "category": "Electrical", "quantity": 40, "uom": "Meters", "unit_cost": 65, "is_serialized": False},
        ],
    },
    5.0: {
        "system_name": "5 kW On-Grid Rooftop System",
        "items": [
            {"item_name": "Mono-PERC Solar Panels (540W)", "category": "Panels", "quantity": 10, "uom": "Nos", "unit_cost": 12000, "is_serialized": True},
            {"item_name": "Three Phase Grid-Tied Inverter 5.5kW", "category": "Inverter", "quantity": 1, "uom": "Nos", "unit_cost": 52000, "is_serialized": True},
            {"item_name": "Heavy Duty Galvanized Mounting Structure (5kW)", "category": "Structure", "quantity": 1, "uom": "Set", "unit_cost": 22000, "is_serialized": False},
            {"item_name": "Dual ACDB & DCDB Protection Panel", "category": "Electrical", "quantity": 1, "uom": "Set", "unit_cost": 12000, "is_serialized": False},
            {"item_name": "Chemical Copper Earthing Kit with 3 Rods", "category": "Safety", "quantity": 2, "uom": "Set", "unit_cost": 4200, "is_serialized": False},
            {"item_name": "Solar DC Cable 4 sq.mm (UV Protected)", "category": "Electrical", "quantity": 50, "uom": "Meters", "unit_cost": 65, "is_serialized": False},
        ],
    },
}


# ── Off-Grid BOM Templates (adds Battery + Charge Controller) ──────────────

OFF_GRID_TEMPLATES = {
    1.0: {
        "system_name": "1 kW Off-Grid Solar System",
        "items": [
            {"item_name": "Mono-PERC Solar Panels (540W)", "category": "Panels", "quantity": 2, "uom": "Nos", "unit_cost": 12000, "is_serialized": True},
            {"item_name": "1kW Hybrid MPPT Inverter", "category": "Inverter", "quantity": 1, "uom": "Nos", "unit_cost": 28000, "is_serialized": True},
            {"item_name": "Lithium Ferro Phosphate (LFP) Battery 2.56kWh", "category": "Battery", "quantity": 1, "uom": "Nos", "unit_cost": 35000, "is_serialized": True},
            {"item_name": "Galvanized Mounting Structure (1kW)", "category": "Structure", "quantity": 1, "uom": "Set", "unit_cost": 6000, "is_serialized": False},
            {"item_name": "ACDB & DCDB Protection Box", "category": "Electrical", "quantity": 1, "uom": "Set", "unit_cost": 6500, "is_serialized": False},
            {"item_name": "Chemical Copper Earthing Kit", "category": "Safety", "quantity": 1, "uom": "Set", "unit_cost": 4200, "is_serialized": False},
        ],
    },
    2.0: {
        "system_name": "2 kW Off-Grid Solar System",
        "items": [
            {"item_name": "Mono-PERC Solar Panels (540W)", "category": "Panels", "quantity": 4, "uom": "Nos", "unit_cost": 12000, "is_serialized": True},
            {"item_name": "2kW Hybrid MPPT Inverter", "category": "Inverter", "quantity": 1, "uom": "Nos", "unit_cost": 38000, "is_serialized": True},
            {"item_name": "Lithium Ferro Phosphate (LFP) Battery 2.56kWh", "category": "Battery", "quantity": 2, "uom": "Nos", "unit_cost": 35000, "is_serialized": True},
            {"item_name": "Galvanized Mounting Structure (2kW)", "category": "Structure", "quantity": 1, "uom": "Set", "unit_cost": 10000, "is_serialized": False},
            {"item_name": "ACDB & DCDB Protection Boxes", "category": "Electrical", "quantity": 1, "uom": "Set", "unit_cost": 8000, "is_serialized": False},
            {"item_name": "Chemical Copper Earthing Kit with 2 Rods", "category": "Safety", "quantity": 1, "uom": "Set", "unit_cost": 4200, "is_serialized": False},
        ],
    },
    3.0: {
        "system_name": "3 kW Off-Grid Solar System",
        "items": [
            {"item_name": "Mono-PERC Solar Panels (540W)", "category": "Panels", "quantity": 6, "uom": "Nos", "unit_cost": 12000, "is_serialized": True},
            {"item_name": "3kW Hybrid MPPT Inverter", "category": "Inverter", "quantity": 1, "uom": "Nos", "unit_cost": 48000, "is_serialized": True},
            {"item_name": "Lithium Ferro Phosphate (LFP) Battery 5.12kWh", "category": "Battery", "quantity": 1, "uom": "Nos", "unit_cost": 65000, "is_serialized": True},
            {"item_name": "Galvanized Mounting Structure (3kW)", "category": "Structure", "quantity": 1, "uom": "Set", "unit_cost": 14000, "is_serialized": False},
            {"item_name": "ACDB & DCDB Protection Boxes (SPD + MCB)", "category": "Electrical", "quantity": 1, "uom": "Set", "unit_cost": 9500, "is_serialized": False},
            {"item_name": "Chemical Copper Earthing Kit with 2 Rods", "category": "Safety", "quantity": 2, "uom": "Set", "unit_cost": 4200, "is_serialized": False},
        ],
    },
    4.0: {
        "system_name": "4 kW Off-Grid Solar System",
        "items": [
            {"item_name": "Mono-PERC Solar Panels (540W)", "category": "Panels", "quantity": 8, "uom": "Nos", "unit_cost": 12000, "is_serialized": True},
            {"item_name": "5kW Hybrid MPPT Inverter", "category": "Inverter", "quantity": 1, "uom": "Nos", "unit_cost": 58000, "is_serialized": True},
            {"item_name": "Lithium Ferro Phosphate (LFP) Battery 5.12kWh", "category": "Battery", "quantity": 2, "uom": "Nos", "unit_cost": 65000, "is_serialized": True},
            {"item_name": "Heavy Duty Mounting Structure (4kW)", "category": "Structure", "quantity": 1, "uom": "Set", "unit_cost": 18000, "is_serialized": False},
            {"item_name": "Dual DCDB + AC Distribution Panel", "category": "Electrical", "quantity": 1, "uom": "Set", "unit_cost": 11000, "is_serialized": False},
            {"item_name": "Chemical Copper Earthing Kit with 2 Rods", "category": "Safety", "quantity": 2, "uom": "Set", "unit_cost": 4200, "is_serialized": False},
        ],
    },
    5.0: {
        "system_name": "5 kW Off-Grid Heavy-Duty System",
        "items": [
            {"item_name": "Bi-Facial Solar Panels (550W)", "category": "Panels", "quantity": 10, "uom": "Nos", "unit_cost": 13500, "is_serialized": True},
            {"item_name": "5kW Hybrid MPPT Inverter", "category": "Inverter", "quantity": 1, "uom": "Nos", "unit_cost": 62000, "is_serialized": True},
            {"item_name": "Lithium Ferro Phosphate (LFP) Battery 5.12kWh", "category": "Battery", "quantity": 2, "uom": "Nos", "unit_cost": 65000, "is_serialized": True},
            {"item_name": "Heavy Duty Wind-Rated Mounting Structure", "category": "Structure", "quantity": 1, "uom": "Set", "unit_cost": 22000, "is_serialized": False},
            {"item_name": "Dual DCDB + AC Distribution Panel", "category": "Electrical", "quantity": 1, "uom": "Set", "unit_cost": 12500, "is_serialized": False},
            {"item_name": "Chemical Copper Earthing Kit with 3 Rods", "category": "Safety", "quantity": 2, "uom": "Set", "unit_cost": 4200, "is_serialized": False},
        ],
    },
}


def get_bom_template(capacity_kw: float, system_type: str) -> dict | None:
    """
    Returns a complete BOM template dict with pricing and subsidy calculation.
    Returns None if no template matches the requested capacity/type.
    """
    templates = ON_GRID_TEMPLATES if system_type == "On-Grid" else OFF_GRID_TEMPLATES
    template = templates.get(capacity_kw)

    if template is None:
        return None

    # Calculate total base price
    total_base_price = sum(
        item["quantity"] * item["unit_cost"] for item in template["items"]
    )

    subsidy = get_subsidy(capacity_kw, system_type)
    net_price = total_base_price - subsidy

    return {
        "system_name": template["system_name"],
        "capacity_kw": capacity_kw,
        "system_type": system_type,
        "total_base_price": total_base_price,
        "estimated_subsidy": subsidy,
        "net_customer_price": net_price,
        "items": template["items"],
    }
