import {
  SystemType,
  CustomerOrder,
  CustomerOrderStatus,
  HelpdeskTicket,
  HelpdeskMessage,
  CustomerPersona,
  DEMO_CUSTOMERS,
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
,
  FeasibilityReport,
  HardwareDispatchRecord,
  CommissioningData
} from '../types';

const STORAGE_KEY = 'sunpower_app_data_v2';

export const TECHNICIANS: Technician[] = [
  { id: 'TECH-01', name: 'Ramesh Kumar', phone: '+91 98230 44102', email: 'ramesh.k@sunpower.in', activeProjects: 2, certifications: 'MNRE Certified Solar Rooftop Installer Level 3' },
  { id: 'TECH-02', name: 'Amit Sharma', phone: '+91 98451 88910', email: 'amit.s@sunpower.in', activeProjects: 3, certifications: 'Certified High-Voltage & Hybrid Inverter Specialist' },
  { id: 'TECH-03', name: 'Priya Patel', phone: '+91 97123 66540', email: 'priya.p@sunpower.in', activeProjects: 1, certifications: 'Electrical Inspector & Net Metering Liaison' },
  { id: 'TECH-04', name: 'Vikas Deshmukh', phone: '+91 99670 12349', email: 'vikas.d@sunpower.in', activeProjects: 2, certifications: 'Master Rooftop Structural & Fabrication Lead' }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Aarav Mehta',
    phone: '+91 98201 54321',
    email: 'aarav.mehta@gmail.com',
    address: 'Plot 42, Baner Hills, Pashan Highway',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411045',
    enquiryDate: '2026-09-12',
    leadStatus: 'Commissioned',
    roofAreaSqFt: 1400,
    sanctionLoadKw: 10,
    monthlyBill: 8500,
    notes: 'Three-phase sanctioned load. 10 kW Hybrid Solar System commissioned.',
    createdAt: '2026-09-12T10:30:00Z'
  },
  {
    id: 'CUST-002',
    name: 'Pooja Sharma',
    phone: '+91 98112 33456',
    email: 'pooja.sharma@gmail.com',
    address: 'Villa 24, Palm Meadows, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    enquiryDate: '2026-09-28',
    leadStatus: 'Site Survey',
    roofAreaSqFt: 950,
    sanctionLoadKw: 6,
    monthlyBill: 4500,
    notes: 'Requested 5 kW on-grid system. Site survey dispatched with lead technician.',
    createdAt: '2026-09-28T14:15:00Z'
  },
  {
    id: 'CUST-003',
    name: 'Vikram Rao',
    phone: '+91 98223 77889',
    email: 'vikram.rao@gmail.com',
    address: 'Plot 88, Jubilee Hills, Road No. 36',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033',
    enquiryDate: '2026-10-02',
    leadStatus: 'Order Placed',
    roofAreaSqFt: 1800,
    sanctionLoadKw: 15,
    monthlyBill: 16000,
    notes: 'Commercial 15 kW array order placed. Pending Manager approval & technician dispatch.',
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
    brand: 'Hensel / SunPower',
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
    customerName: 'Pooja Sharma',
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
    customerName: 'Vikram Rao',
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
    id: 'PRJ-2026-042',
    projectId: 'PRJ-2026-042',
    quotationId: 'QUO-001',
    quotationNumber: 'QT-2026-089',
    customerId: 'CUST-001',
    customerName: 'Aarav Mehta',
    customerPhone: '+91 98201 54321',
    customerAddress: 'Plot 42, Baner Hills, Pashan Highway, Pune',
    capacityKw: 10,
    systemType: 'Hybrid',
    technicianId: 'TECH-01',
    technicianName: 'Rajesh Sharma',
    surveyDate: '2026-09-24',
    installationDate: '2026-10-24',
    completionDate: '2026-10-29',
    stage: 'Commissioned & Closed',
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
        productName: 'Growatt 10kW Hybrid Three-Phase Inverter',
        model: 'SPF-10000-ES',
        serialNumbers: ['INV-GW-10K-4489'],
        deliveryDate: '2026-10-22',
        warrantyYears: 2
      },
      {
        id: 'IP-3',
        productCategory: 'Batteries',
        productName: 'Pylontech 4.8 kWh LiFePO4 Battery Bank',
        model: 'US5000',
        serialNumbers: ['BAT-PY-48-7712', 'BAT-PY-48-7713'],
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
        caption: 'Growatt 10kW Hybrid Inverter & Pylontech Battery bank commissioned with AC/DC DB boxes',
        uploadedAt: '2026-10-28T14:15:00Z',
        phase: 'Completion'
      }
    ],
    customerApproved: true,
    approvalSignature: 'Aarav Mehta [Digital Verification Touch Signed]',
    approvalNotes: 'System tested on full load. Handover completed and DISCOM net meter energized.',
    approvalDate: '2026-10-29',
    createdAt: '2026-09-22T08:00:00Z'
  },
  {
    id: 'PRJ-2026-045',
    projectId: 'PRJ-2026-045',
    quotationId: 'QUO-002',
    quotationNumber: 'QT-2026-094',
    customerId: 'CUST-002',
    customerName: 'Pooja Sharma',
    customerPhone: '+91 98112 33456',
    customerAddress: 'Villa 18, Greenwood Estates, Whitefield, Bengaluru',
    capacityKw: 5,
    systemType: 'On-grid',
    stage: 'Order Placed',
    progressPercent: 15,
    installedProducts: [],
    photos: [],
    customerApproved: false,
    createdAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'PRJ-2026-049',
    projectId: 'PRJ-2026-049',
    customerId: 'CUST-003',
    customerName: 'Rohan Kulkarni',
    customerPhone: '+91 98330 91823',
    customerAddress: 'B-402, Rohan Tarang, Wakad, Pune',
    capacityKw: 7,
    systemType: 'Hybrid',
    technicianId: 'TECH-01',
    technicianName: 'Rajesh Sharma',
    surveyDate: '2026-11-01',
    stage: 'Survey Assigned',
    progressPercent: 25,
    installedProducts: [],
    photos: [],
    customerApproved: false,
    createdAt: '2026-10-22T11:00:00Z'
  },
  {
    id: 'PRJ-2026-046',
    projectId: 'PRJ-2026-046',
    customerId: 'CUST-003',
    customerName: 'Vikram Rao',
    customerPhone: '+91 99200 88712',
    customerAddress: 'Plot 88, Jubilee Hills, Road No. 36, Hyderabad',
    capacityKw: 15,
    systemType: 'On-grid',
    technicianId: 'TECH-01',
    technicianName: 'Rajesh Sharma',
    surveyDate: '2026-10-30',
    stage: 'Survey Submitted',
    progressPercent: 40,
    feasibilityReport: {
      surveyorName: 'Rajesh Sharma (Lead Field Technician)',
      surveyDate: '2026-10-30',
      roofType: 'Concrete Flat',
      tiltAngleDeg: 24,
      azimuthOrientation: 'South-Facing (Optimal 180°)',
      shadingObstacles: false,
      shadingNotes: 'Clear rooftop horizon. RCC slab load bearing verified.',
      earthingResistanceOhms: 2.1,
      photos: [
        '/src/assets/images/solar_rooftop_installation_1793436857441.jpg',
        '/src/assets/images/solar_technician_survey_1793436857911.jpg'
      ],
      verdict: 'Feasible / Approved for Solar',
      notes: 'RCC roof is in prime structural condition. 28x Waaree 545W panels recommended.'
    },
    installedProducts: [],
    photos: [
      {
        id: 'PH-46-1',
        url: '/src/assets/images/solar_technician_survey_1793436857911.jpg',
        caption: 'Lead Technician Rajesh Sharma verifying roof tilt angle and South azimuth orientation',
        uploadedAt: '2026-10-30T11:00:00Z',
        phase: 'Survey'
      }
    ],
    customerApproved: false,
    createdAt: '2026-10-26T15:00:00Z'
  },
  {
    id: 'PRJ-2026-044',
    projectId: 'PRJ-2026-044',
    customerId: 'CUST-004',
    customerName: 'Sanjay Deshpande',
    customerPhone: '+91 98450 12390',
    customerAddress: 'Survey No. 45, Bavdhan, Pune',
    capacityKw: 10,
    systemType: 'Hybrid',
    technicianId: 'TECH-01',
    technicianName: 'Rajesh Sharma',
    surveyDate: '2026-10-28',
    stage: 'Feasibility Approved',
    progressPercent: 50,
    feasibilityReport: {
      surveyorName: 'Rajesh Sharma (Lead Field Technician)',
      surveyDate: '2026-10-28',
      roofType: 'Tin / Metal Sheet',
      tiltAngleDeg: 20,
      azimuthOrientation: 'South-East (135°)',
      shadingObstacles: false,
      shadingNotes: 'Trapezoidal metal sheet with aluminium clamp brackets.',
      earthingResistanceOhms: 2.4,
      photos: [
        '/src/assets/images/solar_rooftop_installation_1793436857441.jpg'
      ],
      verdict: 'Feasible / Approved for Solar',
      notes: 'Feasibility verified and approved by Manager. Order unlocked for warehouse staging.'
    },
    installedProducts: [],
    photos: [],
    customerApproved: false,
    createdAt: '2026-10-25T09:00:00Z'
  },
  {
    id: 'PRJ-2026-047',
    projectId: 'PRJ-2026-047',
    customerId: 'CUST-005',
    customerName: 'Anil Kulkarni',
    customerPhone: '+91 98220 54190',
    customerAddress: 'Row House 12, Aundh, Pune',
    capacityKw: 8,
    systemType: 'Hybrid',
    technicianId: 'TECH-01',
    technicianName: 'Rajesh Sharma',
    surveyDate: '2026-10-25',
    installationDate: '2026-11-01',
    stage: 'Hardware Dispatched',
    progressPercent: 65,
    hardwareDispatch: {
      dispatchDate: '2026-10-31',
      moduleSerials: 'PV-WA-540-9901..9916',
      inverterSerial: 'INV-GW-8000-4491',
      batterySerial: 'BAT-PY-48100-2401',
      truckNo: 'MH-12-RN-8831',
      driverName: 'Ramesh Patil (+91 98230 44912)',
      notes: 'Dispatched from central warehouse.'
    },
    installedProducts: [],
    photos: [],
    customerApproved: false,
    createdAt: '2026-10-22T14:00:00Z'
  },
  {
    id: 'PRJ-2026-048',
    projectId: 'PRJ-2026-048',
    customerId: 'CUST-006',
    customerName: 'Meera Nambiar',
    customerPhone: '+91 97410 88912',
    customerAddress: 'Plot 104, HSR Layout Sector 2, Bengaluru',
    capacityKw: 10,
    systemType: 'Hybrid',
    technicianId: 'TECH-01',
    technicianName: 'Rajesh Sharma',
    surveyDate: '2026-10-20',
    installationDate: '2026-10-29',
    stage: 'Installation & Handover Completed',
    progressPercent: 85,
    hardwareDispatch: {
      dispatchDate: '2026-10-27',
      moduleSerials: 'PV-WA-540-8801..8820',
      inverterSerial: 'INV-GW-10K-9902',
      batterySerial: 'BAT-PY-48100-5511',
      truckNo: 'KA-01-MJ-2024',
      driverName: 'Suresh Gowda',
      notes: 'Delivered to site.'
    },
    commissioningData: {
      commissioningDate: '2026-10-31',
      testPowerOutputKw: 9.8,
      photos: [
        '/src/assets/images/solar_rooftop_installation_1793436857441.jpg',
        '/src/assets/images/solar_inverter_battery_setup_1793436858572.jpg'
      ],
      customerSignature: 'Meera Nambiar [Digital Touch Signed]',
      signatoryName: 'Meera Nambiar',
      handoverNotes: 'System synchronized with grid, live test 9.8 kW verified, customer orientation completed.',
      approvedByDirector: false
    },
    installedProducts: [],
    photos: [
      {
        id: 'PH-48-1',
        url: '/src/assets/images/solar_rooftop_installation_1793436857441.jpg',
        caption: '18x Waaree panels installed on elevated structure',
        uploadedAt: '2026-10-31T11:00:00Z',
        phase: 'Completion'
      }
    ],
    customerApproved: true,
    approvalSignature: 'Meera Nambiar [Digital Touch Signed]',
    createdAt: '2026-10-18T10:00:00Z'
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
    title: 'Follow up with Pooja Sharma on Quotation #QT-2026-094',
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
    targetDescription: 'Vikram Rao needs structural roof load certification.'
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
    description: '₹4,41,771 proposal for 6 kW hybrid setup dispatched to Pooja Sharma.',
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
  customerOrders?: CustomerOrder[];
  helpdeskTickets?: HelpdeskTicket[];
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


export const INITIAL_CUSTOMER_ORDERS: CustomerOrder[] = [
  {
    id: 'ORD-2026-088',
    customerId: 'CUST-001',
    customerName: 'Aarav Mehta',
    customerEmail: 'aarav.mehta@gmail.com',
    contactNumber: '+91 98201 54321',
    installationAddress: 'Plot 42, Baner Hills, Pashan Highway',
    city: 'Pune',
    state: 'Maharashtra',
    systemType: 'Hybrid',
    capacityKw: 10,
    grossCost: 880000,
    centralSubsidy: 78000,
    stateSubsidy: 12000,
    netPayable: 790000,
    status: 'Commissioned',
    progressPercent: 100,
    projectId: 'PRJ-2026-042',
    quotationId: 'QUO-2026-001',
    assignedTechnicianName: 'Rajesh & Team',
    assignedTechnicianPhone: '+91 98600 55891',
    selectedAddons: ['5.12 kWh LiFePO4 Battery Storage Expansion'],
    documentUrl: 'Official Handover & Net-Metering Certificate',
    timestamp: '2026-10-24',
    notes: '10 kW Residential Hybrid Solar System with 10.24kWh reserve storage'
  },
  {
    id: 'ORD-2026-092',
    customerId: 'CUST-002',
    customerName: 'Pooja Sharma',
    customerEmail: 'pooja.sharma@gmail.com',
    contactNumber: '+91 98112 33456',
    installationAddress: 'Villa 24, Palm Meadows, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    systemType: 'On-grid',
    capacityKw: 5,
    grossCost: 310000,
    centralSubsidy: 78000,
    stateSubsidy: 10000,
    netPayable: 222000,
    status: 'Technician Dispatched / Survey Scheduled',
    progressPercent: 35,
    projectId: 'PRJ-2026-044',
    quotationId: 'QUO-2026-003',
    assignedTechnicianName: 'Rajesh & Team',
    assignedTechnicianPhone: '+91 98600 55891',
    scheduledSurveyDate: '2026-11-03',
    selectedAddons: ['7.4 kW Smart EV Fast Charger'],
    documentUrl: 'Order Confirmation & Survey Docket',
    timestamp: '2026-10-29',
    notes: '5 kW On-Grid Rooftop System with Net-Metering liaison under BESCOM'
  },
  {
    id: 'ORD-2026-095',
    customerId: 'CUST-003',
    customerName: 'Vikram Rao',
    customerEmail: 'vikram.rao@gmail.com',
    contactNumber: '+91 98223 77889',
    installationAddress: 'Plot 88, Jubilee Hills, Road No. 36',
    city: 'Hyderabad',
    state: 'Telangana',
    systemType: 'On-grid',
    capacityKw: 15,
    grossCost: 930000,
    centralSubsidy: 78000,
    stateSubsidy: 12000,
    netPayable: 840000,
    status: 'Pending Approval',
    progressPercent: 15,
    projectId: 'PRJ-2026-045',
    quotationId: 'QUO-2026-005',
    assignedTechnicianName: 'Rajesh & Team',
    assignedTechnicianPhone: '+91 98600 55891',
    selectedAddons: ['Annual Solar O&M Care Plan'],
    documentUrl: 'Order Confirmation & Feasibility Request',
    timestamp: '2026-10-30',
    notes: '15 kW Commercial Rooftop Solar Array awaiting Manager review and technician assignment'
  }
];

export const INITIAL_HELPDESK_TICKETS: HelpdeskTicket[] = [
  {
    id: 'TKT-2026-101',
    customerId: 'CUST-002',
    customerName: 'Pooja Sharma',
    customerEmail: 'pooja.sharma@gmail.com',
    customerPhone: '+91 98112 33456',
    customerAddress: 'Villa 18, Greenwood Estates, Whitefield, Bengaluru',
    orderId: 'ORD-2026-092',
    subject: 'Net-metering bi-directional meter installation status',
    category: 'Installation',
    status: 'In Progress',
    priority: 'High',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        senderName: 'Pooja Sharma',
        text: 'Hello, the hardware has arrived at my Whitefield site. When will the BESCOM official inspection for the bi-directional meter take place?',
        timestamp: '11:20 AM'
      },
      {
        id: 'msg-2',
        sender: 'agent',
        senderName: 'Rohan Mehra (Support Lead)',
        text: 'Hello Ananya, our lead technician Rajesh has filed the online docket with the BESCOM division office today. The joint inspection is scheduled for Tuesday morning at 10:30 AM.',
        timestamp: '02:45 PM'
      }
    ],
    createdAt: '2026-10-30T05:50:00Z',
    updatedAt: '2026-10-30T09:15:00Z'
  },
  {
    id: 'TKT-2026-102',
    customerId: 'CUST-001',
    customerName: 'Rajendra Joshi',
    customerEmail: 'customer@gmail.com',
    customerPhone: '+91 98201 54321',
    customerAddress: 'Plot 42, Baner Hills, Pashan Highway, Pune',
    orderId: 'ORD-2026-088',
    subject: 'PM Surya Ghar direct benefit subsidy transfer timeline',
    category: 'Subsidy',
    status: 'Resolved',
    priority: 'Normal',
    messages: [
      {
        id: 'msg-3',
        sender: 'customer',
        senderName: 'Rajendra Joshi',
        text: 'How many days after net-meter synchronization will the ₹78,000 central subsidy be credited to my bank account?',
        timestamp: 'Yesterday'
      },
      {
        id: 'msg-4',
        sender: 'agent',
        senderName: 'Rohan Mehra (Support Lead)',
        text: 'Hi Rajendra, National Portal DBT processing takes approximately 30 to 45 business days after MSEDCL signs off the commissioning certificate. Your bank details and Aadhaar match have already been verified.',
        timestamp: 'Yesterday'
      }
    ],
    createdAt: '2026-10-29T10:15:00Z',
    updatedAt: '2026-10-29T11:30:00Z'
  }
];

export class DataService {
  private static load(): AppStateData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.customerOrders || parsed.customerOrders.length === 0) {
          parsed.customerOrders = INITIAL_CUSTOMER_ORDERS;
        }
        if (!parsed.helpdeskTickets || parsed.helpdeskTickets.length === 0) {
          parsed.helpdeskTickets = INITIAL_HELPDESK_TICKETS;
        }
        // Ensure new 8-stage lifecycle demo projects are always populated
        if (!parsed.projects || parsed.projects.length < INITIAL_PROJECTS.length || !parsed.projects.some((p: any) => p.id === 'PRJ-2026-047')) {
          parsed.projects = INITIAL_PROJECTS;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
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
      return { success: false, error: 'A customer with this phone number or email address already exists in SunPower.' };
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

  /**
   * Customer Self-Registration with Automatic Persona & Profile Initialization
   */
  public static registerCustomer(payload: {
    name: string;
    email: string;
    phone: string;
    address: string;
    propertyType: 'Residential' | 'Commercial';
    monthlyBill: number;
    password?: string;
  }): { success: boolean; customer: Customer; error?: string } {
    const data = this.load();
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanPhone = payload.phone.trim();

    // Check duplicate
    const existing = data.customers.find(
      c => c.email.toLowerCase() === cleanEmail || c.phone === cleanPhone
    );
    if (existing) {
      return { success: true, customer: existing };
    }

    const newId = `CUST-${String(data.customers.length + 1).padStart(3, '0')}`;
    const city = payload.address.includes(',') ? payload.address.split(',')[1].trim() : 'Pune';
    const state = payload.address.includes('Karnataka') ? 'Karnataka' : payload.address.includes('Telangana') ? 'Telangana' : 'Maharashtra';

    // Estimate capacity from bill (approx 1 kW per ₹900 - ₹1000 monthly bill)
    const estimatedKw = Math.max(3, Math.min(25, Math.round(payload.monthlyBill / 900)));
    const estimatedRoof = estimatedKw * 100;

    const newCust: Customer = {
      id: newId,
      name: payload.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      address: payload.address.trim(),
      city,
      state,
      pincode: '411045',
      enquiryDate: new Date().toISOString().split('T')[0],
      leadStatus: 'Hot',
      monthlyBill: payload.monthlyBill,
      propertyType: payload.propertyType,
      sanctionLoadKw: estimatedKw,
      roofAreaSqFt: estimatedRoof,
      notes: `Registered via Self Sign-Up. Property: ${payload.propertyType}, Avg Monthly Bill: ₹${payload.monthlyBill.toLocaleString('en-IN')}`,
      createdAt: new Date().toISOString()
    };

    data.customers.unshift(newCust);

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'customer',
      title: `New Customer Registration: ${newCust.name}`,
      description: `Self-registered customer with ${newCust.propertyType} property. Avg Bill: ₹${payload.monthlyBill}.`,
      timestamp: new Date().toISOString(),
      actor: newCust.name
    });

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `New Customer Registered: ${newCust.name}`,
      message: `${newCust.name} (${cleanEmail}) registered via portal.`,
      type: 'info',
      date: 'Just now',
      read: false,
      linkTab: 'customers'
    });

    this.save(data);
    return { success: true, customer: newCust };
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

    const assignedTech = technicianId ? TECHNICIANS.find(t => t.id === technicianId) : undefined;

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
      technicianId: assignedTech?.id,
      technicianName: assignedTech?.name,
      surveyDate: '',
      installationDate: '',
      stage: 'Order Placed',
      progressPercent: 15,
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

    // Link or create CustomerOrder for customer portal
    if (!data.customerOrders) data.customerOrders = [...INITIAL_CUSTOMER_ORDERS];
    const existingOrder = data.customerOrders.find(o => o.quotationId === quote.id || o.customerId === quote.customerId);
    if (!existingOrder) {
      data.customerOrders.unshift({
        id: `ORD-2026-${nextProjNum}`,
        customerId: quote.customerId,
        customerName: quote.customerName,
        customerEmail: cust?.email || `${quote.customerName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        contactNumber: quote.customerPhone,
        installationAddress: quote.customerAddress,
        city: cust?.city || 'Pune',
        state: cust?.state || 'Maharashtra',
        systemType: quote.systemType,
        capacityKw: quote.capacityKw,
        grossCost: quote.grandTotal,
        centralSubsidy: quote.capacityKw >= 3 ? 78000 : quote.capacityKw * 30000,
        stateSubsidy: 10000,
        netPayable: Math.max(0, quote.grandTotal - (quote.capacityKw >= 3 ? 78000 : quote.capacityKw * 30000) - 10000),
        status: 'Order Placed',
        progressPercent: 15,
        projectId: newProject.projectId,
        quotationId: quote.id,
        timestamp: new Date().toISOString().split('T')[0],
        notes: `Turnkey Solar project converted from quote ${quote.quotationNumber}. Pending Manager survey assignment.`
      });
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `Project ${projectId} Initiated`,
      description: `Generated from approved quotation ${quote.quotationNumber} for ${quote.customerName}. Initial status: Pending Survey Assignment.`,
      timestamp: 'Just now',
      actor: 'Sales Team'
    });

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `New Project: ${projectId}`,
      message: `Quotation ${quote.quotationNumber} converted to active project. Awaiting Manager survey assignment.`,
      type: 'action',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
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


  // ==========================================================================
  // CUSTOMER ORDERS & REAL-TIME CROSS-ROLE ORDER MANAGEMENT
  // ==========================================================================

  public static getCustomerOrders(customerId?: string): CustomerOrder[] {
    const data = this.load();
    const orders = data.customerOrders || INITIAL_CUSTOMER_ORDERS;
    if (customerId) {
      return orders.filter(o => o.customerId === customerId);
    }
    return orders;
  }

  public static placeCustomerOrder(payload: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    contactNumber: string;
    installationAddress: string;
    city?: string;
    state?: string;
    systemType: SystemType;
    capacityKw: number;
    grossCost: number;
    centralSubsidy: number;
    stateSubsidy: number;
    netPayable: number;
    selectedAddons?: string[];
    notes?: string;
  }): CustomerOrder {
    const data = this.load();
    const orderNum = Math.floor(100 + Math.random() * 900);
    const orderId = `ORD-2026-0${orderNum}`;
    const prjId = `PRJ-2026-0${orderNum}`;
    const quoId = `QUO-2026-0${orderNum}`;
    const now = new Date().toISOString();
    const dateStr = now.split('T')[0];

    const newOrder: CustomerOrder = {
      id: orderId,
      customerId: payload.customerId,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      contactNumber: payload.contactNumber,
      installationAddress: payload.installationAddress,
      city: payload.city || 'Pune',
      state: payload.state || 'Maharashtra',
      systemType: payload.systemType,
      capacityKw: payload.capacityKw,
      grossCost: payload.grossCost,
      centralSubsidy: payload.centralSubsidy,
      stateSubsidy: payload.stateSubsidy,
      netPayable: payload.netPayable,
      status: 'Pending Approval',
      progressPercent: 15,
      projectId: prjId,
      quotationId: quoId,
      assignedTechnicianName: 'Rajesh & Team',
      assignedTechnicianPhone: '+91 98600 55891',
      selectedAddons: payload.selectedAddons || [],
      documentUrl: 'Order Confirmation & Advance Invoice',
      timestamp: dateStr,
      notes: payload.notes || `${payload.capacityKw} kW ${payload.systemType} Turnkey Order`
    };

    if (!data.customerOrders) data.customerOrders = [...INITIAL_CUSTOMER_ORDERS];
    data.customerOrders.unshift(newOrder);

    // 1. Automatically create associated InstallationProject in operations
    const newProject: InstallationProject = {
      id: prjId,
      projectId: prjId,
      quotationId: quoId,
      quotationNumber: quoId,
      customerId: payload.customerId,
      customerName: payload.customerName,
      customerPhone: payload.contactNumber,
      customerAddress: payload.installationAddress,
      capacityKw: payload.capacityKw,
      systemType: payload.systemType,
      technicianId: 'TECH-001',
      technicianName: 'Rajesh & Team',
      surveyDate: dateStr,
      stage: 'Survey Pending',
      progressPercent: 15,
      installedProducts: [
        {
          id: `IP-${Date.now()}-1`,
          productCategory: 'Solar Panels',
          productName: `${Math.ceil((payload.capacityKw * 1000) / 545)}x 545W Mono PERC Panels`,
          model: 'Waaree Bifacial 545W',
          serialNumbers: [],
          deliveryDate: dateStr,
          warrantyYears: 20
        },
        {
          id: `IP-${Date.now()}-2`,
          productCategory: 'Inverters',
          productName: `Growatt ${payload.capacityKw}kW ${payload.systemType} Inverter`,
          model: 'Growatt SPH Series',
          serialNumbers: [],
          deliveryDate: dateStr,
          warrantyYears: 5
        }
      ],
      photos: [],
      customerApproved: false,
      createdAt: now
    };
    data.projects.unshift(newProject);

    // 2. Automatically create associated Quotation in Sales & Ops
    const taxAmt = Math.round(payload.grossCost * 0.138);
    const newQuotation: Quotation = {
      id: quoId,
      quotationNumber: quoId,
      customerId: payload.customerId,
      customerName: payload.customerName,
      customerPhone: payload.contactNumber,
      customerAddress: payload.installationAddress,
      systemType: payload.systemType,
      capacityKw: payload.capacityKw,
      subtotal: payload.grossCost,
      taxRatePercent: 13.8,
      taxAmount: taxAmt,
      grandTotal: payload.grossCost + taxAmt,
      status: 'Approved',
      items: [
        {
          id: `QI-${Date.now()}-1`,
          name: `Waaree 545W Mono PERC Half-Cut Array (${Math.ceil((payload.capacityKw * 1000) / 545)} Panels)`,
          category: 'Solar Panels',
          quantity: Math.ceil((payload.capacityKw * 1000) / 545),
          unit: 'Pieces',
          unitPrice: 12800,
          total: Math.ceil((payload.capacityKw * 1000) / 545) * 12800
        },
        {
          id: `QI-${Date.now()}-2`,
          name: `Growatt ${payload.capacityKw}kW ${payload.systemType} Inverter with Smart BMS`,
          category: 'Inverters',
          quantity: 1,
          unit: 'Unit',
          unitPrice: payload.systemType === 'On-grid' ? 48500 : 88000,
          total: payload.systemType === 'On-grid' ? 48500 : 88000
        }
      ],
      createdAt: now,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: payload.notes || 'Contracted turnkey solar installation with PM Surya Ghar subsidy pre-clearance.'
    };
    data.quotations.unshift(newQuotation);

    // 3. Operational priority task for Lead Field Technician / Ops
    data.tasks.unshift({
      id: `TASK-${Date.now()}`,
      title: `Schedule Feasibility Survey for ${payload.customerName}`,
      category: 'Installation',
      dueDate: dateStr,
      priority: 'Urgent',
      actionType: 'inspect',
      targetId: prjId,
      completed: false,
      targetDescription: `${payload.capacityKw} kW ${payload.systemType} at ${payload.installationAddress}`
    });

    // 4. Log in activity timeline
    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `New Solar Order: ${payload.customerName}`,
      description: `Booked ${payload.capacityKw} kW ${payload.systemType} (Net: ₹${payload.netPayable.toLocaleString('en-IN')})`,
      timestamp: 'Just now',
      actor: `${payload.customerName} (Online Portal)`
    });

    // 5. High-priority system notification for Operations & Admin
    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `New Order Placed: ${payload.customerName}`,
      message: `${payload.capacityKw} kW ${payload.systemType} order placed. Net amount: ₹${payload.netPayable.toLocaleString('en-IN')}. Site survey pending.`,
      type: 'action',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
    });

    this.save(data);
    return newOrder;
  }


  // ==========================================================================
  // STRICT 8-STAGE END-TO-END PROJECT LIFECYCLE STATE MACHINE
  // ==========================================================================

  /**
   * Stage 2: Manager selects technician and clicks "Assign Technician"
   * Transitions status to 'Survey Assigned'
   */
  public static assignTechnicianToSurvey(
    projectId: string,
    technicianId: string,
    scheduledDate: string,
    notes?: string
  ): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    const tech = TECHNICIANS.find(t => t.id === technicianId) || TECHNICIANS[0];
    if (!proj) return false;

    proj.stage = 'Survey Assigned';
    proj.progressPercent = 25;
    proj.technicianId = tech.id;
    proj.technicianName = tech.name;
    proj.surveyDate = scheduledDate;
    if (notes) {
      proj.approvalNotes = (proj.approvalNotes ? proj.approvalNotes + ' | ' : '') + `Manager notes: ${notes}`;
    }

    // Sync matching customer order
    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id || o.customerId === proj.customerId);
      if (order) {
        order.status = 'Survey Assigned';
        order.progressPercent = 25;
        order.assignedTechnicianName = tech.name;
        order.assignedTechnicianPhone = tech.phone;
        order.scheduledSurveyDate = scheduledDate;
      }
    }

    // Auto-advance customer lead status
    const customer = data.customers.find(c => c.id === proj.customerId || (c.email && c.email.toLowerCase() === proj.customerPhone.toLowerCase()));
    if (customer) {
      customer.leadStatus = 'Site Survey';
    }

    // Log Activity
    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `Survey Assigned: ${proj.projectId}`,
      description: `Manager assigned technician ${tech.name} for site survey on ${scheduledDate}.`,
      timestamp: new Date().toISOString(),
      actor: 'Dr. Singhania (Operations Manager)'
    });

    // Notify Field Technician
    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `New Survey Assigned: ${proj.projectId}`,
      message: `Site survey assigned for ${proj.customerName} on ${scheduledDate}.`,
      type: 'action',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
    });

    this.save(data);
    return true;
  }

  /**
   * Stage 3: Technician opens survey task on-site
   * Transitions status to 'Survey In Progress'
   */
  public static startSurvey(projectId: string): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    if (!proj) return false;

    proj.stage = 'Survey In Progress';
    proj.progressPercent = 35;

    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id);
      if (order) {
        order.status = 'Survey In Progress';
        order.progressPercent = 35;
      }
    }

    this.save(data);
    return true;
  }

  /**
   * Stage 4: Technician completes technical feasibility form & submits report
   * Transitions status to 'Survey Submitted'
   */
  public static submitFeasibilityReport(
    projectId: string,
    report: Omit<FeasibilityReport, 'id' | 'submittedAt'>
  ): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    if (!proj) return false;

    const fullReport: FeasibilityReport = {
      ...report,
      id: `FR-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'Submitted'
    };

    proj.feasibilityReport = fullReport;
    proj.stage = 'Survey Submitted';
    proj.progressPercent = 45;

    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id);
      if (order) {
        order.status = 'Survey Submitted';
        order.progressPercent = 45;
      }
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `Feasibility Report Submitted: ${proj.projectId}`,
      description: `Technician ${report.technicianName || report.surveyorName || 'Field Crew'} submitted technical report (Tilt: ${report.roofTiltDeg || report.tiltAngleDeg}°, Azimuth: ${report.roofAzimuth || report.azimuthOrientation}, Roof: ${report.roofType}).`,
      timestamp: new Date().toISOString(),
      actor: report.technicianName || report.surveyorName || 'Lead Technician'
    });

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `Feasibility Review Required: ${proj.projectId}`,
      message: `Feasibility report submitted by ${report.technicianName || report.surveyorName || 'Lead Technician'}. Awaiting Manager review.`,
      type: 'action',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
    });

    this.save(data);
    return true;
  }

  /**
   * Stage 5: Manager approves completed feasibility report
   * Transitions status to 'Feasibility Approved' (Unlocks Warehouse Dispatch)
   */
  public static approveFeasibilityReport(projectId: string, directorNotes?: string): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    if (!proj) return false;

    proj.stage = 'Feasibility Approved';
    proj.progressPercent = 55;
    if (proj.feasibilityReport) {
      proj.feasibilityReport.status = 'Approved';
      if (directorNotes) proj.feasibilityReport.directorReviewNotes = directorNotes;
    }

    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id);
      if (order) {
        order.status = 'Feasibility Approved';
        order.progressPercent = 55;
      }
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `Feasibility Approved: ${proj.projectId}`,
      description: `Operations Manager approved technical feasibility report for ${proj.customerName}. Warehouse hardware dispatch unlocked.`,
      timestamp: new Date().toISOString(),
      actor: 'Dr. Singhania (Operations Manager)'
    });

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `Hardware Dispatch Unlocked: ${proj.projectId}`,
      message: `Feasibility approved. Warehouse staff may now scan & dispatch hardware components.`,
      type: 'info',
      date: 'Just now',
      read: false,
      linkTab: 'warehouse'
    });

    this.save(data);
    return true;
  }

  /**
   * Stage 5 (Alternative): Manager requests re-survey
   * Transitions status back to 'Survey Assigned' with notes
   */
  public static requestResurvey(projectId: string, reason: string): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    if (!proj) return false;

    proj.stage = 'Survey Assigned';
    proj.progressPercent = 25;
    if (proj.feasibilityReport) {
      proj.feasibilityReport.status = 'Re-survey Requested';
      proj.feasibilityReport.directorReviewNotes = reason;
    }
    proj.approvalNotes = `Re-survey Requested: ${reason}`;

    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id);
      if (order) {
        order.status = 'Survey Assigned';
        order.progressPercent = 25;
      }
    }

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `Re-survey Requested: ${proj.projectId}`,
      message: `Operations Manager requested re-survey: "${reason}". Please re-visit site to gather updated specs.`,
      type: 'warning',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
    });

    this.save(data);
    return true;
  }

  /**
   * Stage 6: Warehouse enters manual serial numbers & clicks "Dispatch Hardware"
   * Transitions status to 'Hardware Dispatched'
   */
  public static dispatchWarehouseHardware(
    projectId: string,
    dispatch: Omit<HardwareDispatchRecord, 'dispatchedAt'>
  ): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    if (!proj) return false;

    const record: HardwareDispatchRecord = {
      ...dispatch,
      dispatchedAt: new Date().toISOString()
    };

    proj.hardwareDispatch = record;
    proj.stage = 'Hardware Dispatched';
    proj.progressPercent = 70;

    // Register warranties for dispatched equipment
    if (dispatch.inverterSerial) {
      data.warranties.unshift({
        id: `WAR-${Date.now()}-1`,
        serialNumber: dispatch.inverterSerial,
        productCategory: 'Inverters',
        productName: 'Solar Hybrid Inverter',
        model: 'SPF-5000-ES',
        customerId: proj.customerId,
        customerName: proj.customerName,
        customerPhone: proj.customerPhone,
        customerAddress: proj.customerAddress,
        projectId: proj.projectId,
        deliveryDate: new Date().toISOString().split('T')[0],
        warrantyYears: 2,
        warrantyStartDate: new Date().toISOString().split('T')[0],
        warrantyEndDate: new Date(Date.now() + 2 * 365 * 86400000).toISOString().split('T')[0],
        status: 'Active',
        claimsCount: 0
      });
    }

    if (dispatch.batterySerial) {
      data.warranties.unshift({
        id: `WAR-${Date.now()}-2`,
        serialNumber: dispatch.batterySerial,
        productCategory: 'Batteries',
        productName: 'LiFePO4 Storage Battery',
        model: 'LFP-5120',
        customerId: proj.customerId,
        customerName: proj.customerName,
        customerPhone: proj.customerPhone,
        customerAddress: proj.customerAddress,
        projectId: proj.projectId,
        deliveryDate: new Date().toISOString().split('T')[0],
        warrantyYears: 2,
        warrantyStartDate: new Date().toISOString().split('T')[0],
        warrantyEndDate: new Date(Date.now() + 2 * 365 * 86400000).toISOString().split('T')[0],
        status: 'Active',
        claimsCount: 0
      });
    }

    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id);
      if (order) {
        order.status = 'Hardware Dispatched';
        order.progressPercent = 70;
      }
    }

    // Auto-advance customer lead status
    const customer = data.customers.find(c => c.id === proj.customerId);
    if (customer) {
      customer.leadStatus = 'Installation';
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'inventory',
      title: `Hardware Dispatched: ${proj.projectId}`,
      description: `Warehouse dispatched hardware for ${proj.customerName} (Modules: ${dispatch.moduleSerialRange}, Inverter: ${dispatch.inverterSerial}).`,
      timestamp: new Date().toISOString(),
      actor: dispatch.dispatchedBy || 'Vikram Singh (Warehouse)'
    });

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `Hardware En Route: ${proj.projectId}`,
      message: `Hardware has been dispatched by warehouse. Field technician may begin rooftop mounting.`,
      type: 'info',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
    });

    this.save(data);
    return true;
  }

  /**
   * Stage 7: Technician enters test power output, 2 photos, and collects Customer digital signature
   * Transitions status to 'Installation & Handover Completed' (Pending Final Commissioning)
   */
  public static submitInstallationCommissioning(
    projectId: string,
    dataInput: Omit<CommissioningData, 'completionDate'>
  ): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    if (!proj) return false;

    const commData: CommissioningData = {
      ...dataInput,
      completionDate: new Date().toISOString()
    };

    proj.commissioningData = commData;
    proj.customerApproved = true;
    proj.approvalSignature = dataInput.customerSignature;
    proj.approvalDate = new Date().toISOString().split('T')[0];
    proj.stage = 'Installation & Handover Completed';
    proj.progressPercent = 85;

    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id);
      if (order) {
        order.status = 'Installation & Handover Completed';
        order.progressPercent = 85;
      }
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `Installation & Handover Completed: ${proj.projectId}`,
      description: `Technician completed physical installation and captured customer digital acceptance signature. Test output: ${dataInput.testPowerOutputKw} kW.`,
      timestamp: new Date().toISOString(),
      actor: 'Rajesh & Team (Field Tech)'
    });

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `Commissioning Sign-Off Required: ${proj.projectId}`,
      message: `Customer ${proj.customerName} signed on-site handover. Operations Manager review required to close project.`,
      type: 'action',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
    });

    this.save(data);
    return true;
  }

  /**
   * Stage 8: Operations Manager approves final commissioning and closes project
   * Transitions status to 'Commissioned & Closed' (100% Complete)
   * Auto-generates Warranty & Commissioning Certificate
   */
  public static approveCommissioningAndClose(projectId: string): boolean {
    const data = this.load();
    const proj = data.projects.find(p => p.id === projectId || p.projectId === projectId);
    if (!proj) return false;

    proj.stage = 'Commissioned & Closed';
    proj.progressPercent = 100;
    proj.completionDate = new Date().toISOString().split('T')[0];

    if (data.customerOrders) {
      const order = data.customerOrders.find(o => o.projectId === proj.projectId || o.projectId === proj.id);
      if (order) {
        order.status = 'Commissioned & Closed';
        order.progressPercent = 100;
        order.documentUrl = 'Official Handover, Net-Metering & 20-Year Warranty Certificate';
      }
    }

    // Auto-advance customer lead status
    const customer = data.customers.find(c => c.id === proj.customerId);
    if (customer) {
      customer.leadStatus = 'Commissioned';
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `Project Commissioned & Closed: ${proj.projectId}`,
      description: `Operations Manager Dr. Singhania officially signed off final commissioning for ${proj.customerName}. Warranty certificate released.`,
      timestamp: new Date().toISOString(),
      actor: 'Dr. Singhania (Operations Manager)'
    });

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `Project Commissioned: ${proj.projectId}`,
      message: `System for ${proj.customerName} is now fully commissioned and energized. Commissioning certificate issued.`,
      type: 'info',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
    });

    this.save(data);
    return true;
  }

  public static approveOrderAndDispatchTech(
    orderId: string,
    technicianId: string,
    scheduledDate: string,
    notes?: string
  ): boolean {
    const data = this.load();
    if (!data.customerOrders) data.customerOrders = [...INITIAL_CUSTOMER_ORDERS];
    const order = data.customerOrders.find(o => o.id === orderId);
    if (!order) return false;

    const tech = TECHNICIANS.find(t => t.id === technicianId) || TECHNICIANS[0];

    order.status = 'Technician Dispatched / Survey Scheduled';
    order.progressPercent = 35;
    order.assignedTechnicianName = tech.name;
    order.assignedTechnicianPhone = tech.phone;
    order.scheduledSurveyDate = scheduledDate;
    if (notes) {
      order.notes = (order.notes ? order.notes + ' | ' : '') + `Manager notes: ${notes}`;
    }

    // Update associated InstallationProject
    if (order.projectId) {
      const proj = data.projects.find(p => p.id === order.projectId || p.projectId === order.projectId);
      if (proj) {
        proj.stage = 'Installation Scheduled';
        proj.progressPercent = 35;
        proj.technicianId = tech.id;
        proj.technicianName = tech.name;
        proj.surveyDate = scheduledDate;
      }
    }

    // Auto-advance customer lead status
    const customer = data.customers.find(c => c.id === order.customerId || (c.email && c.email.toLowerCase() === order.customerEmail.toLowerCase()));
    if (customer) {
      customer.leadStatus = 'Site Survey';
    }

    // Add activity log
    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'project',
      title: `Order Approved: ${order.id}`,
      description: `Operations Manager approved order ${order.id} for ${order.customerName}. Technician ${tech.name} dispatched for site survey on ${scheduledDate}.`,
      timestamp: new Date().toISOString(),
      actor: 'Dr. Singhania (Operations Manager)'
    });

    // Add notification
    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `Order ${order.id} Approved & Dispatched`,
      message: `${tech.name} scheduled for site survey at ${order.customerName}'s property on ${scheduledDate}.`,
      type: 'info',
      date: 'Just now',
      read: false,
      linkTab: 'installations'
    });

    this.save(data);
    return true;
  }

  public static updateCustomerOrderStatus(orderId: string, status: CustomerOrderStatus): boolean {
    const data = this.load();
    if (!data.customerOrders) data.customerOrders = [...INITIAL_CUSTOMER_ORDERS];
    const order = data.customerOrders.find(o => o.id === orderId);
    if (!order) return false;

    const progressMap: Record<CustomerOrderStatus, number> = {
      'Pending Approval': 10,
      'Order Placed': 15,
      'Survey Assigned': 25,
      'Survey In Progress': 35,
      'Survey Submitted': 45,
      'Feasibility Approved': 55,
      'Hardware Dispatched': 70,
      'Installation & Handover Completed': 85,
      'Pending Final Commissioning': 90,
      'Commissioned & Closed': 100,
      'Technician Dispatched / Survey Scheduled': 35,
      'Site Survey Scheduled': 35,
      'Hardware Allocated': 55,
      'Installation In Progress': 80,
      'Commissioned': 100
    };

    order.status = status;
    order.progressPercent = progressMap[status];

    this.save(data);
    return true;
  }

  // ==========================================================================
  // HELPDESK & CUSTOMER SUPPORT INBOX
  // ==========================================================================

  public static getHelpdeskTickets(customerId?: string): HelpdeskTicket[] {
    const data = this.load();
    const tickets = data.helpdeskTickets || INITIAL_HELPDESK_TICKETS;
    if (customerId) {
      return tickets.filter(t => t.customerId === customerId);
    }
    return tickets;
  }

  public static createHelpdeskTicket(ticket: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    orderId?: string;
    subject: string;
    category: 'Installation' | 'Subsidy' | 'Hardware Fault' | 'Technician' | 'General';
    priority?: 'Urgent' | 'High' | 'Normal';
    initialMessage: string;
  }): HelpdeskTicket {
    const data = this.load();
    if (!data.helpdeskTickets) data.helpdeskTickets = [...INITIAL_HELPDESK_TICKETS];

    const ticketId = `TKT-2026-0${Math.floor(100 + Math.random() * 900)}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullDate = new Date().toISOString();

    const newTicket: HelpdeskTicket = {
      id: ticketId,
      customerId: ticket.customerId,
      customerName: ticket.customerName,
      customerEmail: ticket.customerEmail,
      customerPhone: ticket.customerPhone,
      customerAddress: ticket.customerAddress,
      orderId: ticket.orderId,
      subject: ticket.subject,
      category: ticket.category,
      status: 'Open',
      priority: ticket.priority || 'Normal',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          senderName: ticket.customerName,
          text: ticket.initialMessage,
          timestamp: nowTime
        }
      ],
      createdAt: fullDate,
      updatedAt: fullDate
    };

    data.helpdeskTickets.unshift(newTicket);

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `New Support Query: ${ticket.customerName}`,
      message: `${ticket.subject} (Ticket #${ticketId})`,
      type: 'action',
      date: 'Just now',
      read: false,
      linkTab: 'tickets'
    });

    this.save(data);
    return newTicket;
  }

  public static sendHelpdeskMessage(ticketId: string, message: {
    sender: 'customer' | 'agent' | 'bot';
    senderName: string;
    text: string;
  }): boolean {
    const data = this.load();
    if (!data.helpdeskTickets) data.helpdeskTickets = [...INITIAL_HELPDESK_TICKETS];
    const ticket = data.helpdeskTickets.find(t => t.id === ticketId);
    if (!ticket) return false;

    ticket.messages.push({
      id: `msg-${Date.now()}`,
      sender: message.sender,
      senderName: message.senderName,
      text: message.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    ticket.updatedAt = new Date().toISOString();
    if (message.sender === 'agent' && ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }

    this.save(data);
    return true;
  }

  public static updateHelpdeskTicketStatus(ticketId: string, status: HelpdeskTicket['status']): boolean {
    const data = this.load();
    if (!data.helpdeskTickets) data.helpdeskTickets = [...INITIAL_HELPDESK_TICKETS];
    const ticket = data.helpdeskTickets.find(t => t.id === ticketId);
    if (!ticket) return false;

    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    this.save(data);
    return true;
  }

  /**
   * AI Chatbot Escalation: Connect Customer directly to Support & Operations Staff
   * Escalates the active session to human staff with full conversation transcript
   */
  public static escalateAIChat(payload: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerAddress?: string;
    orderId?: string;
    projectPhase?: string;
    subject?: string;
    messages: Array<{
      id: string;
      sender: 'customer' | 'bot' | 'agent';
      senderName: string;
      text: string;
      timestamp: string;
    }>;
  }): HelpdeskTicket {
    const data = this.load();
    if (!data.helpdeskTickets) data.helpdeskTickets = [...INITIAL_HELPDESK_TICKETS];

    const now = new Date().toISOString();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Check if customer has an existing open escalation
    let ticket = data.helpdeskTickets.find(
      t => t.customerId === payload.customerId && (t.status === 'Open' || t.status === 'Escalated to Support Staff' || t.status === 'In Progress')
    );

    if (!ticket) {
      const ticketId = `TKT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      ticket = {
        id: ticketId,
        customerId: payload.customerId,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone || '+91 98201 12345',
        customerAddress: payload.customerAddress || 'Customer Site',
        orderId: payload.orderId || 'ORD-2026-088',
        projectPhase: payload.projectPhase || 'Site Survey',
        subject: payload.subject || `AI Assistant Escalation - ${payload.projectPhase || 'Live Order Help'}`,
        category: 'AI Assistant Escalation',
        status: 'Escalated to Support Staff',
        priority: 'High',
        isAiEscalated: true,
        messages: payload.messages.length > 0
          ? payload.messages.map(m => ({ ...m }))
          : [
              {
                id: `msg-${Date.now()}`,
                sender: 'customer',
                senderName: payload.customerName,
                text: 'Customer requested human staff connection.',
                timestamp: nowTime
              }
            ],
        createdAt: now,
        updatedAt: now
      };
      data.helpdeskTickets.unshift(ticket);
    } else {
      ticket.isAiEscalated = true;
      ticket.status = 'Escalated to Support Staff';
      ticket.priority = 'High';
      ticket.category = 'AI Assistant Escalation';
      if (payload.projectPhase) ticket.projectPhase = payload.projectPhase;
      if (payload.orderId) ticket.orderId = payload.orderId;
      ticket.messages = payload.messages.map(m => ({ ...m }));
      ticket.updatedAt = now;
    }

    data.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'service',
      title: `AI Chat Escalated: ${ticket.customerName}`,
      description: `Customer requested live human staff handoff. Project Phase: ${ticket.projectPhase || 'Active'}.`,
      timestamp: 'Just now',
      actor: ticket.customerName
    });

    data.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `AI Escalation: ${ticket.customerName}`,
      message: `Customer escalated support session to staff. Phase: ${ticket.projectPhase || 'Active'}. Click to respond.`,
      type: 'action',
      date: 'Just now',
      read: false,
      linkTab: 'tickets'
    });

    this.save(data);
    return ticket;
  }

  /**
   * Export Financial Year (FY) Data to CSV
   * Columns: Order ID | Customer Name | System Size (kW) | Total Value | Subsidy Claimed | Net Margin | Completion Date | FY Period
   */
  public static exportFinancialYearDataCSV(): string {
    const data = this.load();
    const rows: string[][] = [
      ['Order ID', 'Customer Name', 'System Size (kW)', 'Total Value (INR)', 'Subsidy Claimed (INR)', 'Net Margin (INR)', 'Completion Date', 'FY Period']
    ];

    const projects = data.projects && data.projects.length > 0 ? data.projects : INITIAL_PROJECTS;

    projects.forEach(p => {
      const orderId = p.projectId || p.id;
      const custName = p.customerName || 'Customer';
      const kwVal = p.capacityKw || 5;
      const sizeKw = `${kwVal} kW`;
      const totalVal = Math.round(kwVal * 70000);
      const subsidy = kwVal <= 1 ? 30000 : kwVal <= 2 ? 60000 : 78000;
      const netMargin = Math.round(totalVal * 0.22);
      const compDate = p.completionDate || p.commissioningData?.completionDate || p.installationDate || '2026-03-25';
      const fy = 'FY 2025-26';

      rows.push([
        orderId,
        `"${custName.replace(/"/g, '""')}"`,
        `"${sizeKw}"`,
        totalVal.toString(),
        subsidy.toString(),
        netMargin.toString(),
        compDate,
        fy
      ]);
    });

    // Also include customer orders not in projects list
    if (data.customerOrders) {
      data.customerOrders.forEach(o => {
        if (!projects.some(p => p.projectId === o.id || p.id === o.id || p.projectId === o.projectId)) {
          const sizeKw = `${o.capacityKw} kW`;
          const totalVal = o.grossCost || Math.round(o.capacityKw * 70000);
          const subsidy = o.centralSubsidy || (o.capacityKw <= 1 ? 30000 : o.capacityKw <= 2 ? 60000 : 78000);
          const netMargin = Math.round(totalVal * 0.22);
          const compDate = o.timestamp ? o.timestamp.split('T')[0] : '2026-03-30';
          rows.push([
            o.id,
            `"${(o.customerName || 'Customer').replace(/"/g, '""')}"`,
            `"${sizeKw}"`,
            totalVal.toString(),
            subsidy.toString(),
            netMargin.toString(),
            compDate,
            'FY 2025-26'
          ]);
        }
      });
    }

    const csvContent = rows.map(r => r.join(',')).join('\n');

    if (typeof window !== 'undefined') {
      try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'SolarFlow_Financial_Year_FY2025_26_Report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('Failed to trigger CSV download', e);
      }
    }

    return csvContent;
  }

}
