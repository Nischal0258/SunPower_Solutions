export type SystemType = 'On-grid' | 'Off-grid' | 'Hybrid';

export type LeadStatus = 
  | 'Hot'
  | 'Lead / Inquiry' 
  | 'Order Placed' 
  | 'Site Survey' 
  | 'Installation' 
  | 'Commissioned' 
  | 'New' 
  | 'Contacted' 
  | 'Survey Scheduled' 
  | 'Converted' 
  | 'Lost';

export type QuotationStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Pending Manager Approval';

export type ProductCategory = 
  | 'Solar Panels' 
  | 'Inverters' 
  | 'Batteries' 
  | 'Mounting Structures' 
  | 'Accessories';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export type ProjectLifecycleStage =
  | 'Order Placed'
  | 'Survey Assigned'
  | 'Survey In Progress'
  | 'Survey Submitted'
  | 'Feasibility Approved'
  | 'Hardware Dispatched'
  | 'Installation & Handover Completed'
  | 'Pending Final Commissioning'
  | 'Commissioned & Closed';

export type InstallationStage = 
  | ProjectLifecycleStage
  | 'Survey Pending'
  | 'Survey Completed'
  | 'Material Ready'
  | 'Installation Scheduled'
  | 'Installation In Progress'
  | 'Completed';

export type WarrantyStatus = 'Active' | 'Expiring Soon' | 'Expired';

export type ServiceTicketPriority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type ServiceTicketStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  enquiryDate: string;
  leadStatus: LeadStatus;
  roofAreaSqFt?: number;
  roofType?: string;
  sanctionLoadKw?: number;
  monthlyBill?: number;
  propertyType?: 'Residential' | 'Commercial';
  needsRooftopDetails?: boolean;
  notes?: string;
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  productId?: string;
  name: string;
  category: ProductCategory;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  specifications?: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  systemType: SystemType;
  capacityKw: number;
  items: QuotationItem[];
  subtotal: number;
  taxRatePercent: number; // e.g. 13.8%
  taxAmount: number;
  grandTotal: number;
  discountPercent?: number;
  discountAmount?: number;
  marginPercent?: number;
  requiresManagerApproval?: boolean;
  status: QuotationStatus;
  createdAt: string;
  validUntil: string;
  notes?: string;
  convertedToProjectId?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  model: string;
  brand: string;
  supplier: string;
  quantity: number;
  minStockAlert: number;
  unit: string;
  unitPrice: number;
  location: string;
  serialNumberRequired: boolean;
  stockStatus: StockStatus;
  warrantyPeriodYears: number; // 20 for panels, 2 for inverters/batteries, 1 for others
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'Stock In' | 'Stock Out' | 'Reserved' | 'Adjustment';
  quantity: number;
  date: string;
  reference: string;
  notes?: string;
}

export interface InstalledProductItem {
  id: string;
  productCategory: ProductCategory;
  productName: string;
  model: string;
  serialNumbers: string[];
  deliveryDate: string;
  warrantyYears: number;
}

export interface InstallationPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedAt: string;
  phase: 'Survey' | 'Mounting' | 'Wiring' | 'Completion';
}


export interface FeasibilityReport {
  id?: string;
  projectId?: string;
  technicianId?: string;
  technicianName?: string;
  surveyorName?: string;
  surveyDate?: string;
  roofType: 'Concrete RCC' | 'Concrete Flat' | 'Tin / Metal Shed' | 'Tin / Metal Sheet' | 'Clay Tile' | 'Asbestos Sheet';
  roofTiltDeg?: number;
  tiltAngleDeg?: number;
  roofAzimuth?: 'South' | 'South-East' | 'South-West' | 'East' | 'West' | 'North' | string;
  azimuthOrientation?: string;
  shadingObstacles: boolean;
  shadingNotes?: string;
  earthingResistanceOhms?: number;
  roofPhotoUrl?: string;
  panelPhotoUrl?: string;
  photos?: string[];
  structureRecommendation?: string;
  submittedAt?: string;
  status?: 'Submitted' | 'Approved' | 'Re-survey Requested';
  verdict?: string;
  notes?: string;
  directorReviewNotes?: string;
  managerReviewNotes?: string;
}

export interface HardwareDispatchRecord {
  projectId?: string;
  moduleSerialRange?: string;
  moduleSerials?: string;
  inverterSerial: string;
  batterySerial?: string;
  dispatchedAt?: string;
  dispatchDate?: string;
  dispatchedBy?: string;
  truckNo?: string;
  driverName?: string;
  notes?: string;
}

export interface CommissioningData {
  projectId?: string;
  testPowerOutputKw: number;
  postInstallPhotos?: string[];
  photos?: string[];
  customerSignature: string;
  customerSignerName?: string;
  signatoryName?: string;
  completionDate?: string;
  commissioningDate?: string;
  notes?: string;
  handoverNotes?: string;
  approvedByDirector?: boolean;
  approvedByManager?: boolean;
}

export interface InstallationProject {
  id: string;
  projectId: string; // e.g. "PRJ-2026-042"
  quotationId?: string;
  quotationNumber?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  capacityKw: number;
  systemType: SystemType;
  technicianId?: string;
  technicianName?: string;
  surveyDate?: string;
  installationDate?: string;
  completionDate?: string;
  stage: InstallationStage;
  progressPercent: number;
  installedProducts: InstalledProductItem[];
  photos: InstallationPhoto[];
  customerApproved: boolean;
  approvalSignature?: string; // Data URL or recorded signatory
  approvalNotes?: string;
  approvalDate?: string;
  feasibilityReport?: FeasibilityReport;
  hardwareDispatch?: HardwareDispatchRecord;
  commissioningData?: CommissioningData;
  createdAt: string;
}

export interface WarrantyRecord {
  id: string;
  serialNumber: string;
  productCategory: ProductCategory;
  productName: string;
  model: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  projectId: string;
  deliveryDate: string; // Crucial: warranty calculated from delivery date
  warrantyYears: number;
  warrantyStartDate: string;
  warrantyEndDate: string;
  status: WarrantyStatus;
  claimsCount: number;
}

export interface ServiceTicket {
  id: string;
  ticketNumber: string; // e.g. "SRV-2026-104"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  projectId?: string;
  productSerial?: string;
  productName?: string;
  productCategory?: ProductCategory;
  isWarrantyEligible?: boolean;
  issueDescription: string;
  priority: ServiceTicketPriority;
  status: ServiceTicketStatus;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  scheduledVisitDate?: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  email: string;
  activeProjects: number;
  certifications: string;
}

export interface BusinessTask {
  id: string;
  title: string;
  category: 'Customer' | 'Quotation' | 'Installation' | 'Service' | 'Inventory';
  dueDate: string;
  priority: 'Urgent' | 'High' | 'Normal';
  actionType: 'call' | 'approve_quote' | 'assign_tech' | 'inspect' | 'reorder' | 'resolve_ticket';
  targetId: string;
  completed: boolean;
  targetDescription: string;
}

export interface ActivityLog {
  id: string;
  type: 'project' | 'quotation' | 'customer' | 'warranty' | 'service' | 'inventory';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'action';
  date: string;
  read: boolean;
  linkTab?: string;
}


// ============================================================================
// CUSTOMER ORDERS, DEMO PERSONAS & REAL-TIME HELPDESK TYPES
// ============================================================================

export type CustomerOrderStatus = 
  | ProjectLifecycleStage
  | 'Pending Approval'
  | 'Technician Dispatched / Survey Scheduled'
  | 'Order Placed' 
  | 'Site Survey Scheduled' 
  | 'Hardware Allocated' 
  | 'Installation In Progress' 
  | 'Commissioned';

export interface CustomerOrder {
  id: string; // e.g. "ORD-2026-088"
  customerId: string;
  customerName: string;
  customerEmail: string;
  contactNumber: string;
  installationAddress: string;
  city: string;
  state: string;
  systemType: SystemType;
  capacityKw: number;
  grossCost: number;
  centralSubsidy: number;
  stateSubsidy: number;
  netPayable: number;
  status: CustomerOrderStatus;
  progressPercent: number;
  projectId?: string;
  quotationId?: string;
  assignedTechnicianName?: string;
  assignedTechnicianPhone?: string;
  selectedAddons?: string[];
  documentUrl?: string;
  scheduledSurveyDate?: string;
  timestamp: string;
  notes?: string;
}

export interface HelpdeskMessage {
  id: string;
  sender: 'customer' | 'agent' | 'bot';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface HelpdeskTicket {
  id: string; // e.g. "TKT-2026-104"
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  orderId?: string;
  subject: string;
  category: 'Installation' | 'Subsidy' | 'Hardware Fault' | 'Technician' | 'General' | 'AI Assistant Escalation' | 'Billing';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated to Support Staff';
  priority: 'Urgent' | 'High' | 'Normal';
  isAiEscalated?: boolean;
  projectPhase?: string;
  messages: HelpdeskMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPersona {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  roofAreaSqFt: number;
  roofType?: string;
  sanctionLoadKw: number;
  monthlyBill?: number;
  propertyType?: 'Residential' | 'Commercial';
  needsRooftopDetails?: boolean;
  installedSystem?: string;
  avatarInitials: string;
}

export const DEMO_CUSTOMERS: CustomerPersona[] = [
  {
    id: 'CUST-001',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@gmail.com',
    phone: '+91 98201 54321',
    address: 'Plot 42, Baner Hills, Pashan Highway',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411045',
    roofAreaSqFt: 1400,
    sanctionLoadKw: 10,
    installedSystem: '10 kW Hybrid Solar System',
    avatarInitials: 'AM'
  },
  {
    id: 'CUST-002',
    name: 'Pooja Sharma',
    email: 'pooja.sharma@gmail.com',
    phone: '+91 98112 33456',
    address: 'Villa 24, Palm Meadows, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    roofAreaSqFt: 950,
    sanctionLoadKw: 6,
    installedSystem: '5 kW On-Grid Solar System',
    avatarInitials: 'PS'
  },
  {
    id: 'CUST-003',
    name: 'Vikram Rao',
    email: 'vikram.rao@gmail.com',
    phone: '+91 98223 77889',
    address: 'Plot 88, Jubilee Hills, Road No. 36',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500033',
    roofAreaSqFt: 1800,
    sanctionLoadKw: 15,
    installedSystem: '15 kW On-Grid Commercial Array',
    avatarInitials: 'VR'
  }
];
