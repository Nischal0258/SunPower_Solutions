export type SystemType = 'On-grid' | 'Off-grid' | 'Hybrid';

export type LeadStatus = 'New' | 'Contacted' | 'Survey Scheduled' | 'Converted' | 'Lost';

export type QuotationStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected';

export type ProductCategory = 
  | 'Solar Panels' 
  | 'Inverters' 
  | 'Batteries' 
  | 'Mounting Structures' 
  | 'Accessories';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export type InstallationStage = 
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
  sanctionLoadKw?: number;
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
