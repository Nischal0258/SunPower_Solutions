import {
  Customer,
  Quotation,
  InventoryItem,
  StockMovement,
  InstallationProject,
  WarrantyRecord,
  ServiceTicket,
  Technician,
  BusinessTask,
  ActivityLog,
  SystemNotification
} from '../types';

const STORAGE_KEY = 'solarflow_app_data_v2';

export const TECHNICIANS: Technician[] = [
  { id: 'TECH-01', name: 'Ramesh Kumar', phone: '+91 98230 44102', email: 'ramesh.k@solarflow.in', activeProjects: 2, certifications: 'MNRE Certified Solar Rooftop Installer Level 3' },
  { id: 'TECH-02', name: 'Amit Sharma', phone: '+91 98451 88910', email: 'amit.s@solarflow.in', activeProjects: 3, certifications: 'Certified High-Voltage & Hybrid Inverter Specialist' },
  { id: 'TECH-03', name: 'Priya Patel', phone: '+91 97123 66540', email: 'priya.p@solarflow.in', activeProjects: 1, certifications: 'Electrical Inspector & Net Metering Liaison' },
  { id: 'TECH-04', name: 'Vikas Deshmukh', phone: '+91 99670 12349', email: 'vikas.d@solarflow.in', activeProjects: 2, certifications: 'Master Rooftop Structural & Fabrication Lead' }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Rajendra Joshi',
    phone: '+91 98201 54321',
    email: 'r.joshi@greentech.org',
    address: 'Plot 42, Baner Hills, Pashan Highway',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411045',
    enquiryDate: '2026-09-12',
    leadStatus: 'Converted',
    roofAreaSqFt: 1400,
    sanctionLoadKw: 10,
    notes: 'Three-phase sanctioned load. Requires shadow-free RCC elevated structure.',
    createdAt: '2026-09-12T10:30:00Z'
  },
  {
    id: 'CUST-002',
    name: 'Ananya Deshpande',
    phone: '+91 98112 33456',
    email: 'ananya.deshpande@gmail.com',
    address: 'Villa 18, Greenwood Estates, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    enquiryDate: '2026-09-28',
    leadStatus: 'Survey Scheduled',
    roofAreaSqFt: 950,
    sanctionLoadKw: 6,
    notes: 'Requested hybrid 5 kW system with 10 kWh battery backup due to frequent evening grid cuts.',
    createdAt: '2026-09-28T14:15:00Z'
  },
  {
    id: 'CUST-003',
    name: 'Suresh Singhania',
    phone: '+91 99200 88712',
    email: 'suresh@singhaniafabrics.com',
    address: 'GIDC Industrial Sector 3, Sanand',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '382110',
    enquiryDate: '2026-10-02',
    leadStatus: 'Converted',
    roofAreaSqFt: 3500,
    sanctionLoadKw: 25,
    notes: 'Commercial rooftop system. Tin shed mounting structure with walk-way clamps.',
    createdAt: '2026-10-02T09:00:00Z'
  },
  {
    id: 'CUST-004',
    name: 'Meera Nambiar',
    phone: '+91 94470 12890',
    email: 'meera.nambiar@outlook.com',
    address: '14/C Coconut Grove, Kakkanad',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682030',
    enquiryDate: '2026-10-15',
    leadStatus: 'Contacted',
    roofAreaSqFt: 800,
    sanctionLoadKw: 4,
    notes: 'Interested in On-grid net metering with KSEB subsidy enquiry.',
    createdAt: '2026-10-15T11:45:00Z'
  },
  {
    id: 'CUST-005',
    name: 'Balvinder Singh Gill',
    phone: '+91 98765 43210',
    email: 'balvinder.gill@farmfoods.in',
    address: 'Farmhouse 7, GT Road, Phase 2',
    city: 'Amritsar',
    state: 'Punjab',
    pincode: '143001',
    enquiryDate: '2026-10-22',
    leadStatus: 'New',
    roofAreaSqFt: 2200,
    sanctionLoadKw: 15,
    notes: 'Agricultural pump + cold room load. Needs off-grid hybrid setup.',
    createdAt: '2026-10-22T16:20:00Z'
  }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'INV-001',
    sku: 'SP-WAR-545M',
    name: 'Waaree 545W Mono PERC Half-Cut Panel',
    category: 'Solar Panels',
    model: 'WS-545-M10',
    brand: 'Waaree Energies',
    supplier: 'Waaree National Distribution',
    quantity: 68,
    minStockAlert: 20,
    unit: 'Pieces',
    unitPrice: 12800,
    location: 'Warehouse Bay A-1',
    serialNumberRequired: true,
    stockStatus: 'In Stock',
    warrantyPeriodYears: 20
  },
  {
    id: 'INV-002',
    sku: 'SP-TAT-550M',
    name: 'Tata Power 550W Bifacial Dual Glass Panel',
    category: 'Solar Panels',
    model: 'TP-550-BF',
    brand: 'Tata Power Solar',
    supplier: 'Tata Direct Depot',
    quantity: 14,
    minStockAlert: 25,
    unit: 'Pieces',
    unitPrice: 14200,
    location: 'Warehouse Bay A-2',
    serialNumberRequired: true,
    stockStatus: 'Low Stock',
    warrantyPeriodYears: 20
  },
  {
    id: 'INV-003',
    sku: 'INV-GRO-5KW',
    name: 'Growatt 5kW 3-Phase On-Grid Inverter',
    category: 'Inverters',
    model: 'MOD-5000TL3-X',
    brand: 'Growatt',
    supplier: 'Growatt Solar India Pvt Ltd',
    quantity: 8,
    minStockAlert: 4,
    unit: 'Units',
    unitPrice: 48500,
    location: 'Bay B - Electronics Rack 1',
    serialNumberRequired: true,
    stockStatus: 'In Stock',
    warrantyPeriodYears: 2
  },
  {
    id: 'INV-004',
    sku: 'INV-DEY-10KW',
    name: 'Deye 10kW Hybrid Three-Phase Inverter',
    category: 'Inverters',
    model: 'SUN-10K-SG04LP3',
    brand: 'Deye',
    supplier: 'Renewable Power Systems Ltd',
    quantity: 2,
    minStockAlert: 3,
    unit: 'Units',
    unitPrice: 142000,
    location: 'Bay B - High Value Vault',
    serialNumberRequired: true,
    stockStatus: 'Low Stock',
    warrantyPeriodYears: 2
  },
  {
    id: 'INV-005',
    sku: 'BAT-EXI-51V',
    name: 'Exide 5.12 kWh LiFePO4 Battery Bank',
    category: 'Batteries',
    model: 'SOLAR-LFP-51100',
    brand: 'Exide Solar',
    supplier: 'Exide Industries Depo',
    quantity: 5,
    minStockAlert: 2,
    unit: 'Units',
    unitPrice: 125000,
    location: 'Bay C - Climate Battery Room',
    serialNumberRequired: true,
    stockStatus: 'In Stock',
    warrantyPeriodYears: 2
  },
  {
    id: 'INV-006',
    sku: 'BAT-BYD-10K',
    name: 'BYD Battery-Box Premium LVS 10.2kWh',
    category: 'Batteries',
    model: 'LVS-10.2',
    brand: 'BYD',
    supplier: 'Global Solar Imports',
    quantity: 0,
    minStockAlert: 2,
    unit: 'Units',
    unitPrice: 245000,
    location: 'Bay C - Climate Battery Room',
    serialNumberRequired: true,
    stockStatus: 'Out of Stock',
    warrantyPeriodYears: 2
  },
  {
    id: 'INV-007',
    sku: 'STR-ALU-10KW',
    name: 'Anodized Aluminium Elevated Mounting Kit (10kW)',
    category: 'Mounting Structures',
    model: 'AL-ELEV-10K-RCC',
    brand: 'SolarTech Rails',
    supplier: 'Metals & Extrusions Corp',
    quantity: 12,
    minStockAlert: 5,
    unit: 'Sets',
    unitPrice: 28000,
    location: 'Bay D - Heavy Hardware',
    serialNumberRequired: false,
    stockStatus: 'In Stock',
    warrantyPeriodYears: 10
  },
  {
    id: 'INV-008',
    sku: 'ACC-DCDB-3P',
    name: '3-Phase DC Distribution Box (DCDB) with Type 2 SPD',
    category: 'Accessories',
    model: 'DCDB-3P-600V',
    brand: 'Hensel / SolarFlow',
    supplier: 'Power Electricals Wholesale',
    quantity: 18,
    minStockAlert: 6,
    unit: 'Units',
    unitPrice: 8500,
    location: 'Bay E - Accessories',
    serialNumberRequired: false,
    stockStatus: 'In Stock',
    warrantyPeriodYears: 1
  },
  {
    id: 'INV-009',
    sku: 'ACC-SOL-CBL4',
    name: 'Solar DC Cable 4 sq mm Twin-Core UV Resistant (100m)',
    category: 'Accessories',
    model: 'DC-CBL-4MM-100M',
    brand: 'Polycab Solar',
    supplier: 'Polycab Distributors',
    quantity: 26,
    minStockAlert: 10,
    unit: 'Rolls',
    unitPrice: 6200,
    location: 'Bay E - Cable Reels',
    serialNumberRequired: false,
    stockStatus: 'In Stock',
    warrantyPeriodYears: 5
  }
];

const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'SM-101',
    productId: 'INV-001',
    productName: 'Waaree 545W Mono PERC Half-Cut Panel',
    type: 'Stock In',
    quantity: 100,
    date: '2026-10-01',
    reference: 'PO-2026-441',
    notes: 'Bulk factory consignment received from Surat'
  },
  {
    id: 'SM-102',
    productId: 'INV-001',
    productName: 'Waaree 545W Mono PERC Half-Cut Panel',
    type: 'Reserved',
    quantity: 18,
    date: '2026-10-18',
    reference: 'PRJ-2026-042',
    notes: 'Reserved for Joshi 10kW residential rooftop'
  },
  {
    id: 'SM-103',
    productId: 'INV-004',
    productName: 'Deye 10kW Hybrid Three-Phase Inverter',
    type: 'Stock Out',
    quantity: 1,
    date: '2026-10-24',
    reference: 'PRJ-2026-042',
    notes: 'Dispatched for Baner site installation'
  }
];

const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'QUO-001',
    quotationNumber: 'QT-2026-089',
    customerId: 'CUST-001',
    customerName: 'Rajendra Joshi',
    customerPhone: '+91 98201 54321',
    customerAddress: 'Plot 42, Baner Hills, Pashan Highway, Pune',
    systemType: 'Hybrid',
    capacityKw: 10,
    items: [
      { id: 'QI-1', name: 'Waaree 545W Mono PERC Half-Cut Panel', category: 'Solar Panels', quantity: 18, unit: 'Pieces', unitPrice: 12800, total: 230400 },
      { id: 'QI-2', name: 'Deye 10kW Hybrid Three-Phase Inverter', category: 'Inverters', quantity: 1, unit: 'Units', unitPrice: 142000, total: 142000 },
      { id: 'QI-3', name: 'Exide 5.12 kWh LiFePO4 Battery Bank', category: 'Batteries', quantity: 2, unit: 'Units', unitPrice: 125000, total: 250000 },
      { id: 'QI-4', name: 'Anodized Aluminium Elevated Mounting Kit (10kW)', category: 'Mounting Structures', quantity: 1, unit: 'Sets', unitPrice: 28000, total: 28000 },
      { id: 'QI-5', name: '3-Phase DCDB & ACDB Array Protection Boxes', category: 'Accessories', quantity: 1, unit: 'Sets', unitPrice: 16500, total: 16500 },
      { id: 'QI-6', name: 'UV Protected DC/AC Cabling & Earthing Kit (Copper)', category: 'Accessories', quantity: 1, unit: 'Lot', unitPrice: 22000, total: 22000 },
      { id: 'QI-7', name: 'Complete Installation, Testing & Net-Meter Liaison', category: 'Accessories', quantity: 1, unit: 'Service', unitPrice: 35000, total: 35000 }
    ],
    subtotal: 723900,
    taxRatePercent: 13.8, // Solar GST composite
    taxAmount: 99898,
    grandTotal: 823798,
    status: 'Approved',
    createdAt: '2026-09-20',
    validUntil: '2026-10-20',
    notes: 'Approved with 30% advance received. Net metering application submitted to MSEDCL.',
    convertedToProjectId: 'PRJ-2026-042'
  },
  {
    id: 'QUO-002',
    quotationNumber: 'QT-2026-094',
    customerId: 'CUST-002',
    customerName: 'Ananya Deshpande',
    customerPhone: '+91 98112 33456',
    customerAddress: 'Villa 18, Greenwood Estates, Whitefield, Bengaluru',
    systemType: 'Hybrid',
    capacityKw: 6,
    items: [
      { id: 'QI-11', name: 'Tata Power 550W Bifacial Dual Glass Panel', category: 'Solar Panels', quantity: 11, unit: 'Pieces', unitPrice: 14200, total: 156200 },
      { id: 'QI-12', name: 'Growatt 5kW 3-Phase Inverter with Smart Dongle', category: 'Inverters', quantity: 1, unit: 'Units', unitPrice: 58000, total: 58000 },
      { id: 'QI-13', name: 'Exide 5.12 kWh LiFePO4 Battery Bank', category: 'Batteries', quantity: 1, unit: 'Units', unitPrice: 125000, total: 125000 },
      { id: 'QI-14', name: 'HDG Aluminium Elevated Roof Structure', category: 'Mounting Structures', quantity: 1, unit: 'Sets', unitPrice: 21000, total: 21000 },
      { id: 'QI-15', name: 'Installation, Net Metering Approvals & Testing', category: 'Accessories', quantity: 1, unit: 'Service', unitPrice: 28000, total: 28000 }
    ],
    subtotal: 388200,
    taxRatePercent: 13.8,
    taxAmount: 53571,
    grandTotal: 441771,
    status: 'Sent',
    createdAt: '2026-10-18',
    validUntil: '2026-11-18',
    notes: 'Client reviewing quotation. Follow up scheduled for Monday.'
  },
  {
    id: 'QUO-003',
    quotationNumber: 'QT-2026-101',
    customerId: 'CUST-003',
    customerName: 'Suresh Singhania',
    customerPhone: '+91 99200 88712',
    customerAddress: 'GIDC Industrial Sector 3, Sanand, Ahmedabad',
    systemType: 'On-grid',
    capacityKw: 25,
    items: [
      { id: 'QI-21', name: 'Waaree 545W Mono PERC Half-Cut Panel', category: 'Solar Panels', quantity: 46, unit: 'Pieces', unitPrice: 12500, total: 575000 },
      { id: 'QI-22', name: 'Growatt 25kW 3-Phase Commercial Inverter', category: 'Inverters', quantity: 1, unit: 'Units', unitPrice: 168000, total: 168000 },
      { id: 'QI-23', name: 'Trapezoidal Sheet Clamping Structure (25kW)', category: 'Mounting Structures', quantity: 1, unit: 'Sets', unitPrice: 42000, total: 42000 },
      { id: 'QI-24', name: 'Commercial ACDB / DCDB Panels with Surge Suppression', category: 'Accessories', quantity: 1, unit: 'Sets', unitPrice: 32000, total: 32000 },
      { id: 'QI-25', name: 'Industrial Turnkey Installation & CEIG Inspection', category: 'Accessories', quantity: 1, unit: 'Service', unitPrice: 75000, total: 75000 }
    ],
    subtotal: 892000,
    taxRatePercent: 13.8,
    taxAmount: 123096,
    grandTotal: 1015096,
    status: 'Draft',
    createdAt: '2026-10-25',
    validUntil: '2026-11-25',
    notes: 'Engineering team finalizing single-line diagram (SLD) before presenting to client.'
  }
];

const INITIAL_PROJECTS: InstallationProject[] = [
  {
    id: 'PRJ-001',
    projectId: 'PRJ-2026-042',
    quotationId: 'QUO-001',
    quotationNumber: 'QT-2026-089',
    customerId: 'CUST-001',
    customerName: 'Rajendra Joshi',
    customerPhone: '+91 98201 54321',
    customerAddress: 'Plot 42, Baner Hills, Pashan Highway, Pune',
    capacityKw: 10,
    systemType: 'Hybrid',
    technicianId: 'TECH-01',
    technicianName: 'Ramesh Kumar',
    surveyDate: '2026-09-24',
    installationDate: '2026-10-24',
    completionDate: '2026-10-29',
    stage: 'Completed',
    progressPercent: 100,
    installedProducts: [
      {
        id: 'IP-1',
        productCategory: 'Solar Panels',
        productName: 'Waaree 545W Mono PERC Half-Cut Panel',
        model: 'WS-545-M10',
        serialNumbers: [
          'SP-WAR-9901-2026', 'SP-WAR-9902-2026', 'SP-WAR-9903-2026', 'SP-WAR-9904-2026',
          'SP-WAR-9905-2026', 'SP-WAR-9906-2026', 'SP-WAR-9907-2026', 'SP-WAR-9908-2026'
        ],
        deliveryDate: '2026-10-22',
        warrantyYears: 20
      },
      {
        id: 'IP-2',
        productCategory: 'Inverters',
        productName: 'Deye 10kW Hybrid Three-Phase Inverter',
        model: 'SUN-10K-SG04LP3',
        serialNumbers: ['INV-DEY-10K-4489'],
        deliveryDate: '2026-10-22',
        warrantyYears: 2
      },
      {
        id: 'IP-3',
        productCategory: 'Batteries',
        productName: 'Exide 5.12 kWh LiFePO4 Battery Bank',
        model: 'SOLAR-LFP-51100',
        serialNumbers: ['BAT-EXI-51-7712', 'BAT-EXI-51-7713'],
        deliveryDate: '2026-10-22',
        warrantyYears: 2
      }
    ],
    photos: [
      {
        id: 'PH-1',
        url: '/src/assets/images/solar_rooftop_installation_1793436857441.jpg',
        caption: '18x Monocrystalline Solar Array Installed on RCC elevated purlins with clean DC conduits',
        uploadedAt: '2026-10-26T16:30:00Z',
        phase: 'Mounting'
      },
      {
        id: 'PH-2',
        url: '/src/assets/images/solar_inverter_battery_setup_1793436858572.jpg',
        caption: 'Deye 10kW Hybrid Inverter & Dual Exide LiFePO4 Battery bank commissioned with AC/DC DB boxes',
        uploadedAt: '2026-10-28T14:15:00Z',
        phase: 'Completion'
      }
    ],
    customerApproved: true,
    approvalSignature: 'Rajendra Joshi (Digital Verification OTP #882194)',
    approvalNotes: 'System tested on full load. Generation recorded 48.5 units on Day 1. Handover certificate signed.',
    approvalDate: '2026-10-29',
    createdAt: '2026-09-22T08:00:00Z'
  },
  {
    id: 'PRJ-002',
    projectId: 'PRJ-2026-045',
    quotationId: 'QUO-002',
    quotationNumber: 'QT-2026-094',
    customerId: 'CUST-002',
    customerName: 'Ananya Deshpande',
    customerPhone: '+91 98112 33456',
    customerAddress: 'Villa 18, Greenwood Estates, Whitefield, Bengaluru',
    capacityKw: 6,
    systemType: 'Hybrid',
    technicianId: 'TECH-02',
    technicianName: 'Amit Sharma',
    surveyDate: '2026-10-28',
    installationDate: '2026-11-04',
    stage: 'Material Ready',
    progressPercent: 50,
    installedProducts: [],
    photos: [
      {
        id: 'PH-3',
        url: '/src/assets/images/solar_technician_survey_1793436857911.jpg',
        caption: 'Lead Technician Amit Sharma completing shading analysis and roof tilt survey',
        uploadedAt: '2026-10-28T11:00:00Z',
        phase: 'Survey'
      }
    ],
    customerApproved: false,
    createdAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'PRJ-003',
    projectId: 'PRJ-2026-046',
    customerId: 'CUST-003',
    customerName: 'Suresh Singhania',
    customerPhone: '+91 99200 88712',
    customerAddress: 'GIDC Industrial Sector 3, Sanand, Ahmedabad',
    capacityKw: 25,
    systemType: 'On-grid',
    technicianId: 'TECH-04',
    technicianName: 'Vikas Deshmukh',
    surveyDate: '2026-11-02',
    installationDate: '2026-11-15',
    stage: 'Survey Pending',
    progressPercent: 20,
    installedProducts: [],
    photos: [],
    customerApproved: false,
    createdAt: '2026-10-26T15:00:00Z'
  }
];

// Calculate precise warranty end date from delivery date
export function computeWarrantyDates(deliveryDateStr: string, years: number) {
  const delivery = new Date(deliveryDateStr);
  const start = new Date(delivery);
  const end = new Date(delivery);
  end.setFullYear(delivery.getFullYear() + years);
  
  const now = new Date();
  let status: 'Active' | 'Expiring Soon' | 'Expired' = 'Active';

  const daysRemaining = (end.getTime() - now.getTime()) / (1000 * 3600 * 24);
  if (daysRemaining <= 0) {
    status = 'Expired';
  } else if (daysRemaining <= 60) {
    status = 'Expiring Soon';
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    status
  };
}

const INITIAL_WARRANTIES: WarrantyRecord[] = [
  {
    id: 'WAR-001',
    serialNumber: 'SP-WAR-9901-2026',
    productCategory: 'Solar Panels',
    productName: 'Waaree 545W Mono PERC Half-Cut Panel',
    model: 'WS-545-M10',
    customerId: 'CUST-001',
    customerName: 'Rajendra Joshi',
    customerPhone: '+91 98201 54321',
    customerAddress: 'Plot 42, Baner Hills, Pune',
    projectId: 'PRJ-2026-042',
    deliveryDate: '2026-10-22',
    warrantyYears: 20, // Strict rule: 20 years for panels
    warrantyStartDate: '2026-10-22',
    warrantyEndDate: '2046-10-22',
    status: 'Active',
    claimsCount: 0
  },
  {
    id: 'WAR-002',
    serialNumber: 'INV-DEY-10K-4489',
    productCategory: 'Inverters',
    productName: 'Deye 10kW Hybrid Three-Phase Inverter',
    model: 'SUN-10K-SG04LP3',
    customerId: 'CUST-001',
    customerName: 'Rajendra Joshi',
    customerPhone: '+91 98201 54321',
    customerAddress: 'Plot 42, Baner Hills, Pune',
    projectId: 'PRJ-2026-042',
    deliveryDate: '2026-10-22',
    warrantyYears: 2, // Strict rule: 2 years for inverters
    warrantyStartDate: '2026-10-22',
    warrantyEndDate: '2028-10-22',
    status: 'Active',
    claimsCount: 0
  },
  {
    id: 'WAR-003',
    serialNumber: 'BAT-EXI-51-7712',
    productCategory: 'Batteries',
    productName: 'Exide 5.12 kWh LiFePO4 Battery Bank',
    model: 'SOLAR-LFP-51100',
    customerId: 'CUST-001',
    customerName: 'Rajendra Joshi',
    customerPhone: '+91 98201 54321',
    customerAddress: 'Plot 42, Baner Hills, Pune',
    projectId: 'PRJ-2026-042',
    deliveryDate: '2026-10-22',
    warrantyYears: 2, // Strict rule: 2 years for batteries
    warrantyStartDate: '2026-10-22',
    warrantyEndDate: '2028-10-22',
    status: 'Active',
    claimsCount: 0
  },
  {
    id: 'WAR-004',
    serialNumber: 'INV-GRO-5K-1120',
    productCategory: 'Inverters',
    productName: 'Growatt 5kW On-Grid Inverter',
    model: 'MOD-5000TL3-X',
    customerId: 'CUST-004',
    customerName: 'Meera Nambiar',
    customerPhone: '+91 94470 12890',
    customerAddress: '14/C Coconut Grove, Kakkanad, Kochi',
    projectId: 'PRJ-2024-019',
    deliveryDate: '2024-11-10',
    warrantyYears: 2,
    warrantyStartDate: '2024-11-10',
    warrantyEndDate: '2026-11-10', // Expiring in ~10 days
    status: 'Expiring Soon',
    claimsCount: 1
  }
];

const INITIAL_SERVICE_TICKETS: ServiceTicket[] = [
  {
    id: 'SRV-001',
    ticketNumber: 'SRV-2026-104',
    customerId: 'CUST-004',
    customerName: 'Meera Nambiar',
    customerPhone: '+91 94470 12890',
    customerAddress: '14/C Coconut Grove, Kakkanad, Kochi',
    projectId: 'PRJ-2024-019',
    productSerial: 'INV-GRO-5K-1120',
    productName: 'Growatt 5kW On-Grid Inverter',
    productCategory: 'Inverters',
    isWarrantyEligible: true, // In warranty until 2026-11-10
    issueDescription: 'Error Code 201 showing on LCD. Inverter tripping during peak 1 PM generation hours.',
    priority: 'High',
    status: 'Assigned',
    assignedTechnicianId: 'TECH-02',
    assignedTechnicianName: 'Amit Sharma',
    scheduledVisitDate: '2026-11-01',
    createdAt: '2026-10-29T10:15:00Z',
    resolutionNotes: 'Firmware diagnostic kit dispatched with technician Amit Sharma.'
  },
  {
    id: 'SRV-002',
    ticketNumber: 'SRV-2026-098',
    customerId: 'CUST-001',
    customerName: 'Rajendra Joshi',
    customerPhone: '+91 98201 54321',
    customerAddress: 'Plot 42, Baner Hills, Pune',
    projectId: 'PRJ-2026-042',
    productSerial: 'INV-DEY-10K-4489',
    productName: 'Deye 10kW Hybrid Inverter',
    productCategory: 'Inverters',
    isWarrantyEligible: true,
    issueDescription: 'Customer requested Wi-Fi dongle re-pairing to home mesh router after password change.',
    priority: 'Low',
    status: 'Resolved',
    assignedTechnicianId: 'TECH-01',
    assignedTechnicianName: 'Ramesh Kumar',
    scheduledVisitDate: '2026-10-30',
    createdAt: '2026-10-29T14:30:00Z',
    resolvedAt: '2026-10-30T16:00:00Z',
    resolutionNotes: 'Re-configured solar portal cloud app on customer iPhone. Remote telemetry now live.'
  }
];

const INITIAL_TASKS: BusinessTask[] = [
  {
    id: 'TSK-01',
    title: 'Follow up with Ananya Deshpande on Quotation #QT-2026-094',
    category: 'Quotation',
    dueDate: 'Today, 2:00 PM',
    priority: 'High',
    actionType: 'approve_quote',
    targetId: 'QUO-002',
    completed: false,
    targetDescription: 'Review subsidy option and answer battery warranty questions.'
  },
  {
    id: 'TSK-02',
    title: 'Assign technician for Sanand 25kW industrial site survey',
    category: 'Installation',
    dueDate: 'Today, 4:30 PM',
    priority: 'Urgent',
    actionType: 'assign_tech',
    targetId: 'PRJ-003',
    completed: false,
    targetDescription: 'Suresh Singhania needs structural roof load certification.'
  },
  {
    id: 'TSK-03',
    title: 'Reorder Tata Power 550W Bifacial Panels (Stock critical: 14 units)',
    category: 'Inventory',
    dueDate: 'Tomorrow',
    priority: 'Urgent',
    actionType: 'reorder',
    targetId: 'INV-002',
    completed: false,
    targetDescription: 'Minimum threshold is 25 units. 2 upcoming projects require 40 units.'
  },
  {
    id: 'TSK-04',
    title: 'Dispatch Amit Sharma for Kochi Inverter Error 201 service visit',
    category: 'Service',
    dueDate: 'Nov 01, 2026',
    priority: 'High',
    actionType: 'resolve_ticket',
    targetId: 'SRV-001',
    completed: false,
    targetDescription: 'Meera Nambiar - Under warranty until Nov 10, 2026.'
  }
];

const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'ACT-01',
    type: 'project',
    title: 'Project PRJ-2026-042 Commissioned & Handed Over',
    description: '10 kW Hybrid installation for Rajendra Joshi completed with customer sign-off.',
    timestamp: 'Yesterday at 5:15 PM',
    actor: 'Ramesh Kumar (Lead Installer)'
  },
  {
    id: 'ACT-02',
    type: 'quotation',
    title: 'Quotation QT-2026-094 Sent to Customer',
    description: '₹4,41,771 proposal for 6 kW hybrid setup dispatched to Ananya Deshpande.',
    timestamp: '2 days ago',
    actor: 'Sunil Rao (Sales Eng.)'
  },
  {
    id: 'ACT-03',
    type: 'inventory',
    title: 'Stock Reserved for Whitefield Project',
    description: '11x Tata Power 550W panels and Growatt 5kW unit reserved.',
    timestamp: '3 days ago',
    actor: 'Store Manager'
  },
  {
    id: 'ACT-04',
    type: 'warranty',
    title: '4 Warranty Certificates Issued for Project #042',
    description: '20-year panel and 2-year inverter/battery warranties registered.',
    timestamp: 'Yesterday at 6:00 PM',
    actor: 'Compliance Desk'
  }
];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'NOT-1',
    title: 'Low Stock Alert: Tata 550W Panels',
    message: 'Only 14 panels remaining in Bay A-2. Reorder suggested.',
    type: 'warning',
    date: 'Just now',
    read: false,
    linkTab: 'inventory'
  },
  {
    id: 'NOT-2',
    title: 'Warranty Expiring Soon: Meera Nambiar',
    message: 'Growatt Inverter (INV-GRO-5K-1120) warranty expires on Nov 10, 2026.',
    type: 'info',
    date: '2 hours ago',
    read: false,
    linkTab: 'warranties'
  },
  {
    id: 'NOT-3',
    title: 'Quotation Approved',
    message: 'Rajendra Joshi approved Quotation #QT-2026-089 (₹8,23,798).',
    type: 'action',
    date: 'Yesterday',
    read: true,
    linkTab: 'quotations'
  }
];

export interface AppStateData {
  customers: Customer[];
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  quotations: Quotation[];
  projects: InstallationProject[];
  warranties: WarrantyRecord[];
  tickets: ServiceTicket[];
  tasks: BusinessTask[];
  activities: ActivityLog[];
  notifications: SystemNotification[];
}

export class DataService {
  private static load(): AppStateData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback to initial
    }

    const defaultData: AppStateData = {
      customers: INITIAL_CUSTOMERS,
      inventory: INITIAL_INVENTORY,
      stockMovements: INITIAL_STOCK_MOVEMENTS,
      quotations: INITIAL_QUOTATIONS,
      projects: INITIAL_PROJECTS,
      warranties: INITIAL_WARRANTIES,
      tickets: INITIAL_SERVICE_TICKETS,
      tasks: INITIAL_TASKS,
      activities: INITIAL_ACTIVITIES,
      notifications: INITIAL_NOTIFICATIONS
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  }

  private static save(data: AppStateData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // Reset to initial demo data
  public static resetToDefaults(): AppStateData {
    localStorage.removeItem(STORAGE_KEY);
    return this.load();
  }

  // Customers
  public static getCustomers(): Customer[] {
    return this.load().customers;
  }

  public static getCustomerById(id: string): Customer | undefined {
    return this.load().customers.find(c => c.id === id);
  }

  public static saveCustomer(customer: Omit<Customer, 'id' | 'createdAt'> & { id?: string }): { success: boolean; customer?: Customer; error?: string } {
    const data = this.load();
    
    // Check duplicate phone or email (excluding current customer if editing)
    const normalizedPhone = customer.phone.replace(/[\s\-\+]/g, '');
    const duplicate = data.customers.find(c => 
      c.id !== customer.id && (
        c.phone.replace(/[\s\-\+]/g, '') === normalizedPhone ||
        (customer.email && c.email.toLowerCase() === customer.email.toLowerCase())
      )
    );

    if (duplicate) {
      return { success: false, error: 'A customer with this phone number or email address already exists in SolarFlow.' };
    }

    if (customer.id) {
      // Edit
      const index = data.customers.findIndex(c => c.id === customer.id);
      if (index !== -1) {
        data.customers[index] = { ...data.customers[index], ...customer };
        this.save(data);
        return { success: true, customer: data.customers[index] };
      }
    }

    // New Customer
    const newId = `CUST-${String(data.customers.length + 1).padStart(3, '0')}`;
    const newCustomer: Customer = {
      ...customer,
      id: newId,
      createdAt: new Date().toISOString()
    };
    data.customers.unshift(newCustomer);

    // Log Activity
    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'customer',
      title: `New Customer Added: ${newCustomer.name}`,
      description: `${newCustomer.city}, ${newCustomer.state} · ${newCustomer.leadStatus} Lead`,
      timestamp: 'Just now',
      actor: 'Current User'
    });

    this.save(data);
    return { success: true, customer: newCustomer };
  }

  public static deleteCustomer(id: string): boolean {
    const data = this.load();
    const customer = data.customers.find(c => c.id === id);
    if (!customer) return false;

    data.customers = data.customers.filter(c => c.id !== id);
    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'customer',
      title: `Customer Deleted: ${customer.name}`,
      description: `Customer record removed from active ledger`,
      timestamp: 'Just now',
      actor: 'Current User'
    });
    this.save(data);
    return true;
  }

  // Inventory
  public static getInventory(): InventoryItem[] {
    return this.load().inventory;
  }

  public static saveInventoryItem(item: Omit<InventoryItem, 'id' | 'stockStatus'> & { id?: string }): { success: boolean; item?: InventoryItem; error?: string } {
    if (item.quantity < 0) {
      return { success: false, error: 'Stock quantity cannot be negative.' };
    }

    const data = this.load();
    let stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (item.quantity === 0) stockStatus = 'Out of Stock';
    else if (item.quantity <= item.minStockAlert) stockStatus = 'Low Stock';

    if (item.id) {
      const idx = data.inventory.findIndex(i => i.id === item.id);
      if (idx !== -1) {
        const oldQty = data.inventory[idx].quantity;
        data.inventory[idx] = { ...data.inventory[idx], ...item, stockStatus };
        
        if (oldQty !== item.quantity) {
          data.stockMovements.unshift({
            id: `SM-${Date.now()}`,
            productId: data.inventory[idx].id,
            productName: data.inventory[idx].name,
            type: item.quantity > oldQty ? 'Stock In' : 'Stock Out',
            quantity: Math.abs(item.quantity - oldQty),
            date: new Date().toISOString().split('T')[0],
            reference: 'Manual Adjustment',
            notes: 'Stock updated via Inventory Manager'
          });
        }

        this.save(data);
        return { success: true, item: data.inventory[idx] };
      }
    }

    const newId = `INV-${String(data.inventory.length + 1).padStart(3, '0')}`;
    const newItem: InventoryItem = {
      ...item,
      id: newId,
      stockStatus
    };
    data.inventory.push(newItem);

    data.stockMovements.unshift({
      id: `SM-${Date.now()}`,
      productId: newId,
      productName: newItem.name,
      type: 'Stock In',
      quantity: newItem.quantity,
      date: new Date().toISOString().split('T')[0],
      reference: 'Initial Stocking',
      notes: 'New catalog SKU registered'
    });

    this.save(data);
    return { success: true, item: newItem };
  }

  public static deleteInventoryItem(id: string): boolean {
    const data = this.load();
    data.inventory = data.inventory.filter(i => i.id !== id);
    this.save(data);
    return true;
  }

  public static getStockMovements(): StockMovement[] {
    return this.load().stockMovements;
  }

  // Quotations
  public static getQuotations(): Quotation[] {
    return this.load().quotations;
  }

  public static saveQuotation(quote: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'> & { id?: string }): Quotation {
    const data = this.load();
    if (quote.id) {
      const idx = data.quotations.findIndex(q => q.id === quote.id);
      if (idx !== -1) {
        data.quotations[idx] = { ...data.quotations[idx], ...quote };
        this.save(data);
        return data.quotations[idx];
      }
    }

    const nextNum = String(data.quotations.length + 90).padStart(3, '0');
    const newQuote: Quotation = {
      ...quote,
      id: `QUO-${String(data.quotations.length + 1).padStart(3, '0')}`,
      quotationNumber: `QT-2026-${nextNum}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    data.quotations.unshift(newQuote);

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'quotation',
      title: `Quotation ${newQuote.quotationNumber} Created`,
      description: `${newQuote.capacityKw} kW ${newQuote.systemType} system for ${newQuote.customerName} (₹${newQuote.grandTotal.toLocaleString('en-IN')})`,
      timestamp: 'Just now',
      actor: 'Current User'
    });

    this.save(data);
    return newQuote;
  }

  public static updateQuotationStatus(id: string, status: Quotation['status']): Quotation | undefined {
    const data = this.load();
    const quote = data.quotations.find(q => q.id === id);
    if (!quote) return undefined;

    quote.status = status;
    this.save(data);
    return quote;
  }

  // Convert approved quotation to Installation Project
  public static convertQuotationToProject(quoteId: string, technicianId?: string): InstallationProject | undefined {
    const data = this.load();
    const quote = data.quotations.find(q => q.id === quoteId);
    if (!quote) return undefined;

    quote.status = 'Approved';
    const nextProjNum = String(data.projects.length + 47).padStart(3, '0');
    const projectId = `PRJ-2026-${nextProjNum}`;
    quote.convertedToProjectId = projectId;

    const tech = TECHNICIANS.find(t => t.id === technicianId) || TECHNICIANS[0];

    const todayStr = new Date().toISOString().split('T')[0];
    const newProject: InstallationProject = {
      id: `PRJ-${String(data.projects.length + 1).padStart(3, '0')}`,
      projectId,
      quotationId: quote.id,
      quotationNumber: quote.quotationNumber,
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      customerAddress: quote.customerAddress,
      capacityKw: quote.capacityKw,
      systemType: quote.systemType,
      technicianId: tech.id,
      technicianName: tech.name,
      surveyDate: todayStr,
      installationDate: '',
      stage: 'Survey Pending',
      progressPercent: 20,
      installedProducts: [],
      photos: [],
      customerApproved: false,
      createdAt: new Date().toISOString()
    };

    data.projects.unshift(newProject);

    // Update customer lead status to Converted
    const cust = data.customers.find(c => c.id === quote.customerId);
    if (cust) {
      cust.leadStatus = 'Converted';
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `Project ${projectId} Initiated`,
      description: `Generated from approved quotation ${quote.quotationNumber} for ${quote.customerName}`,
      timestamp: 'Just now',
      actor: 'Current User'
    });

    this.save(data);
    return newProject;
  }

  // Installation Projects
  public static getProjects(): InstallationProject[] {
    return this.load().projects;
  }

  public static getProjectById(id: string): InstallationProject | undefined {
    return this.load().projects.find(p => p.id === id || p.projectId === id);
  }

  public static saveProject(project: Partial<InstallationProject> & { id: string }): InstallationProject | undefined {
    const data = this.load();
    const idx = data.projects.findIndex(p => p.id === project.id);
    if (idx === -1) return undefined;

    data.projects[idx] = { ...data.projects[idx], ...project };
    this.save(data);
    return data.projects[idx];
  }

  public static updateProjectStage(id: string, stage: InstallationProject['stage']): InstallationProject | undefined {
    const data = this.load();
    const p = data.projects.find(proj => proj.id === id || proj.projectId === id);
    if (!p) return undefined;

    p.stage = stage;
    switch (stage) {
      case 'Survey Pending': p.progressPercent = 10; break;
      case 'Survey Completed': p.progressPercent = 30; break;
      case 'Material Ready': p.progressPercent = 50; break;
      case 'Installation Scheduled': p.progressPercent = 65; break;
      case 'Installation In Progress': p.progressPercent = 80; break;
      case 'Completed': 
        p.progressPercent = 100;
        p.completionDate = new Date().toISOString().split('T')[0];
        break;
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `${p.projectId} Stage Updated: ${stage}`,
      description: `Project progress now at ${p.progressPercent}% for ${p.customerName}`,
      timestamp: 'Just now',
      actor: 'Current User'
    });

    this.save(data);
    return p;
  }

  // Warranties
  public static getWarranties(): WarrantyRecord[] {
    return this.load().warranties;
  }

  public static lookupWarranty(serial: string): WarrantyRecord | undefined {
    const clean = serial.trim().toLowerCase();
    return this.load().warranties.find(w => w.serialNumber.toLowerCase() === clean);
  }

  public static registerWarranty(record: Omit<WarrantyRecord, 'id' | 'warrantyStartDate' | 'warrantyEndDate' | 'status' | 'claimsCount'>): WarrantyRecord {
    const data = this.load();
    const { startDate, endDate, status } = computeWarrantyDates(record.deliveryDate, record.warrantyYears);

    const newRecord: WarrantyRecord = {
      ...record,
      id: `WAR-${String(data.warranties.length + 1).padStart(3, '0')}`,
      warrantyStartDate: startDate,
      warrantyEndDate: endDate,
      status,
      claimsCount: 0
    };

    data.warranties.unshift(newRecord);
    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'warranty',
      title: `Warranty Registered: ${record.serialNumber}`,
      description: `${record.productName} for ${record.customerName} (${record.warrantyYears} Years)`,
      timestamp: 'Just now',
      actor: 'Current User'
    });

    this.save(data);
    return newRecord;
  }

  // Service Tickets
  public static getServiceTickets(): ServiceTicket[] {
    return this.load().tickets;
  }

  public static saveServiceTicket(ticket: Omit<ServiceTicket, 'id' | 'ticketNumber' | 'createdAt'> & { id?: string }): ServiceTicket {
    const data = this.load();
    if (ticket.id) {
      const idx = data.tickets.findIndex(t => t.id === ticket.id);
      if (idx !== -1) {
        data.tickets[idx] = { ...data.tickets[idx], ...ticket };
        this.save(data);
        return data.tickets[idx];
      }
    }

    const nextNum = String(data.tickets.length + 105).padStart(3, '0');
    const newTicket: ServiceTicket = {
      ...ticket,
      id: `SRV-${String(data.tickets.length + 1).padStart(3, '0')}`,
      ticketNumber: `SRV-2026-${nextNum}`,
      createdAt: new Date().toISOString()
    };

    data.tickets.unshift(newTicket);
    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'service',
      title: `New Ticket: ${newTicket.ticketNumber}`,
      description: `${newTicket.priority} Priority · ${newTicket.customerName} - ${newTicket.issueDescription.substring(0, 45)}...`,
      timestamp: 'Just now',
      actor: 'Current User'
    });

    this.save(data);
    return newTicket;
  }

  public static updateTicketStatus(id: string, status: ServiceTicket['status'], resolutionNotes?: string): ServiceTicket | undefined {
    const data = this.load();
    const t = data.tickets.find(ticket => ticket.id === id);
    if (!t) return undefined;

    t.status = status;
    if (resolutionNotes !== undefined) {
      t.resolutionNotes = resolutionNotes;
    }
    if (status === 'Resolved' || status === 'Closed') {
      t.resolvedAt = new Date().toISOString();
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'service',
      title: `${t.ticketNumber} Marked as ${status}`,
      description: `${t.customerName} · ${t.productName || 'Solar System'}`,
      timestamp: 'Just now',
      actor: 'Current User'
    });

    this.save(data);
    return t;
  }

  // Tasks
  public static getTasks(): BusinessTask[] {
    return this.load().tasks;
  }

  public static toggleTask(id: string): boolean {
    const data = this.load();
    const task = data.tasks.find(t => t.id === id);
    if (!task) return false;
    task.completed = !task.completed;
    this.save(data);
    return true;
  }

  // Activities & Notifications
  public static getActivities(): ActivityLog[] {
    return this.load().activities;
  }

  public static getNotifications(): SystemNotification[] {
    return this.load().notifications;
  }

  public static markNotificationRead(id: string): void {
    const data = this.load();
    const notif = data.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save(data);
    }
  }

  public static markAllNotificationsRead(): void {
    const data = this.load();
    data.notifications.forEach(n => { n.read = true; });
    this.save(data);
  }
}
