import glob, os

base_dir = glob.glob('solarflow*')[0]
types_path = os.path.join(base_dir, 'src', 'types', 'index.ts')
roles_path = os.path.join(base_dir, 'src', 'types', 'roles.ts')

# Update index.ts
with open(types_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update InstallationStage
old_stage = """export type InstallationStage = 
  | 'Survey Pending'
  | 'Survey Completed'
  | 'Material Ready'
  | 'Installation Scheduled'
  | 'Installation In Progress'
  | 'Completed';"""

new_stage = """export type ProjectLifecycleStage =
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
  | 'Completed';"""

if old_stage in text:
    text = text.replace(old_stage, new_stage)

# 2. Update CustomerOrderStatus
old_cust_status = """export type CustomerOrderStatus = 
  | 'Pending Approval'
  | 'Technician Dispatched / Survey Scheduled'
  | 'Order Placed' 
  | 'Site Survey Scheduled' 
  | 'Hardware Allocated' 
  | 'Installation In Progress' 
  | 'Commissioned';"""

new_cust_status = """export type CustomerOrderStatus = 
  | ProjectLifecycleStage
  | 'Pending Approval'
  | 'Technician Dispatched / Survey Scheduled'
  | 'Order Placed' 
  | 'Site Survey Scheduled' 
  | 'Hardware Allocated' 
  | 'Installation In Progress' 
  | 'Commissioned';"""

if old_cust_status in text:
    text = text.replace(old_cust_status, new_cust_status)

# 3. Add FeasibilityReport, HardwareDispatchRecord, CommissioningData
interfaces_code = """
export interface FeasibilityReport {
  id: string;
  projectId: string;
  technicianId: string;
  technicianName: string;
  roofType: 'Concrete RCC' | 'Tin / Metal Shed' | 'Clay Tile' | 'Asbestos Sheet';
  roofTiltDeg: number;
  roofAzimuth: 'South' | 'South-East' | 'South-West' | 'East' | 'West' | 'North';
  shadingObstacles: boolean;
  shadingNotes?: string;
  roofPhotoUrl?: string;
  panelPhotoUrl?: string;
  structureRecommendation?: string;
  submittedAt: string;
  status?: 'Submitted' | 'Approved' | 'Re-survey Requested';
  directorReviewNotes?: string;
}

export interface HardwareDispatchRecord {
  projectId: string;
  moduleSerialRange: string;
  inverterSerial: string;
  batterySerial?: string;
  dispatchedAt: string;
  dispatchedBy: string;
  truckNo?: string;
}

export interface CommissioningData {
  projectId: string;
  testPowerOutputKw: number;
  postInstallPhotos: string[];
  customerSignature: string;
  customerSignerName: string;
  completionDate: string;
  notes?: string;
}
"""

if "export interface FeasibilityReport" not in text:
    target = "export interface InstallationProject {"
    text = text.replace(target, interfaces_code + "\n" + target)

# Add fields to InstallationProject
old_proj_fields = """  customerApproved: boolean;
  approvalSignature?: string; // Data URL or recorded signatory
  approvalNotes?: string;
  approvalDate?: string;
  createdAt: string;
}"""

new_proj_fields = """  customerApproved: boolean;
  approvalSignature?: string; // Data URL or recorded signatory
  approvalNotes?: string;
  approvalDate?: string;
  feasibilityReport?: FeasibilityReport;
  hardwareDispatch?: HardwareDispatchRecord;
  commissioningData?: CommissioningData;
  createdAt: string;
}"""

if old_proj_fields in text:
    text = text.replace(old_proj_fields, new_proj_fields)

with open(types_path, 'w', encoding='utf-8') as f:
    f.write(text)

# Update roles.ts: remove 'tickets' from technician's allowedTabs
with open(roles_path, 'r', encoding='utf-8') as f:
    r_text = f.read()

r_text = r_text.replace(
    "allowedTabs: ['installations', 'tickets', 'warranties'],",
    "allowedTabs: ['installations', 'warranties'],"
)
r_text = r_text.replace(
    "description: 'On-site technical surveys, rooftop mounting, photo QA audit, warranties & service ticket creation',",
    "description: 'On-site technical surveys, rooftop mounting, physical testing, photo QA audit, and customer digital handover signature',",
)

with open(roles_path, 'w', encoding='utf-8') as f:
    f.write(r_text)

print("Step 1: Updated types/index.ts and roles.ts successfully!")
