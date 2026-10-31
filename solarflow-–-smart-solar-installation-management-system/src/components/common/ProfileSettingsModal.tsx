import React from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Shield,
  Calendar,
  BadgeCheck,
  X,
  KeyRound
} from 'lucide-react';
import { UserRole, USER_ROLES } from '../../types/roles';
import { DEMO_CUSTOMERS } from '../../types';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  userEmail?: string;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  userEmail
}) => {
  if (!isOpen) return null;

  const roleInfo = USER_ROLES[currentRole] || USER_ROLES.manager;
  const isCustomer = currentRole === 'customer';

  // Role-specific detailed personal profiles
  const profileDetails: Record<UserRole, {
    phone: string;
    location: string;
    department: string;
    employeeId: string;
    joinDate: string;
    reportingTo: string;
    permissionScope: string[];
  }> = {
    manager: {
      phone: '+91 98220 11400',
      location: 'Pune Central Operations Hub, Maharashtra',
      department: 'Executive Operations & Commercial Management',
      employeeId: 'EMP-SP-001',
      joinDate: '15 January 2023',
      reportingTo: 'Board of Directors',
      permissionScope: ['Quotation & BOM Approvals', 'Feasibility Survey Sign-offs', 'Financial P&L Oversight', 'Turnkey Project Dispatch']
    },
    director: {
      phone: '+91 98220 11400',
      location: 'Corporate HQ, Pune & Bengaluru Units',
      department: 'Executive Management & Governance',
      employeeId: 'EMP-SP-000',
      joinDate: '01 October 2022',
      reportingTo: 'Board of Directors',
      permissionScope: ['Complete System Administration', 'P&L Analytics', 'Company Credentials', 'Executive Strategy']
    },
    sales: {
      phone: '+91 98231 22890',
      location: 'Pune Regional Sales Hub',
      department: 'Sales & Customer Relationship Management',
      employeeId: 'EMP-SP-042',
      joinDate: '10 March 2024',
      reportingTo: 'Dr. Singhania (Operations Manager)',
      permissionScope: ['Lead Ledger Intake', 'Solar Sizing Calculator', 'Quotation Creation', 'Feasibility Review']
    },
    warehouse: {
      phone: '+91 98901 44220',
      location: 'SunPower Central Logistics Depot, Pune',
      department: 'Warehouse, Logistics & Supply Chain',
      employeeId: 'EMP-SP-055',
      joinDate: '18 November 2023',
      reportingTo: 'Supply Chain Director',
      permissionScope: ['Inventory Stock Tracking', 'Inventory Replenishment', 'Manual Serial Registration', 'Warehouse Order Staging & Stock Level Reporting']
    },
    technician: {
      phone: '+91 98600 55891',
      location: 'Field Installation Crew Unit 3',
      department: 'Mechanical Mounting & Electrical Commissioning',
      employeeId: 'EMP-SP-104',
      joinDate: '12 February 2024',
      reportingTo: 'Field Operations Lead',
      permissionScope: ['On-site Technical Feasibility Surveys', 'Rooftop PV Rail Mounting & Commissioning', 'Photo QA Evidence Upload & Audit', 'Service Ticket Creation & Warranty Management']
    },
    support: {
      phone: '+91 98210 66743',
      location: 'Helpdesk & Remote Telemetry Center',
      department: 'Customer Support & Warranty RMA',
      employeeId: 'EMP-SP-089',
      joinDate: '01 June 2024',
      reportingTo: 'Support Supervisor',
      permissionScope: ['Customer Ticket Resolution', 'Equipment Fault Diagnostics', 'Warranty Serial Registry Lookups', 'RMA Replacement Processing']
    },
    customer: {
      phone: '+91 98221 77334',
      location: 'Baner Hills, Pune, Maharashtra - 411045',
      department: 'Residential Solar Homeowner Account',
      employeeId: 'CUST-SP-2026-088',
      joinDate: '24 October 2026',
      reportingTo: 'Account Manager: Priya Sharma',
      permissionScope: ['View Assigned Rooftop Products', 'View Order & Project History', 'Place New Orders & Add-ons', 'Download Commissioning Documents']
    }
  };

  const details = profileDetails[currentRole] || profileDetails.manager;
  let displayName = roleInfo.name;
  let displayEmail = userEmail || `${currentRole}@gmail.com`;
  let displayPhone = details.phone;
  let displayLocation = details.location;
  let displayId = details.employeeId;

  if (isCustomer) {
    try {
      const activePersonaId = localStorage.getItem('sunpower_active_customer_persona') || 'CUST-001';
      const persona = DEMO_CUSTOMERS.find(c => c.id === activePersonaId) || DEMO_CUSTOMERS[0];
      displayName = persona.name;
      displayEmail = persona.email;
      displayPhone = persona.phone;
      displayLocation = `${persona.address}, ${persona.city}`;
      displayId = persona.id;
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="max-w-xl w-full bg-[#FFFFFF] border border-[#E7E2D9] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#292724] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl ${roleInfo.avatarColor} text-white font-bold text-base flex items-center justify-center shadow-md ring-2 ring-white/10`}>
              {displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{displayName}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-[#DBBA95] uppercase tracking-wider">
                  {roleInfo.badge}
                </span>
              </div>
              <p className="text-xs text-[#DBBA95]/90">{roleInfo.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-xs text-[#292724] max-h-[80vh] overflow-y-auto">
          {/* Identity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3 rounded-xl bg-[#F5F3EF]/60 border border-[#E7E2D9]">
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-[#C66B45]" />
                {isCustomer ? 'Contact Email' : 'Corporate Email'}
              </span>
              <p className="font-semibold text-xs text-[#292724] truncate">{displayEmail}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F3EF]/60 border border-[#E7E2D9]">
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-[#C66B45]" />
                Verified Phone Number
              </span>
              <p className="font-semibold text-xs text-[#292724]">{displayPhone}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F3EF]/60 border border-[#E7E2D9]">
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                <BadgeCheck className="w-3.5 h-3.5 text-[#C66B45]" />
                {isCustomer ? 'Customer Account ID' : 'Employee ID'}
              </span>
              <p className="font-mono font-bold text-xs text-[#292724]">{displayId}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F3EF]/60 border border-[#E7E2D9]">
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#C66B45]" />
                {isCustomer ? 'Account Registration Date' : 'Company Joining Date'}
              </span>
              <p className="font-semibold text-xs text-[#292724]">{details.joinDate}</p>
            </div>
          </div>

          {/* Department & Location */}
          <div className="space-y-3 p-3.5 rounded-xl bg-white border border-[#E7E2D9]">
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-[#C66B45] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 font-medium block">Department / Team</span>
                <p className="font-semibold text-xs text-[#292724]">{details.department}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-[#E7E2D9]">
              <MapPin className="w-4 h-4 text-[#C66B45] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 font-medium block">{isCustomer ? 'Installation Site Address' : 'Assigned Operating Branch'}</span>
                <p className="font-semibold text-xs text-[#292724]">{displayLocation}</p>
              </div>
            </div>
          </div>

          {/* Permission & Capability Scope */}
          <div className="p-3.5 rounded-xl bg-[#F5F3EF]/40 border border-[#E7E2D9]">
            <span className="text-[11px] font-bold text-[#292724] flex items-center gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5 text-[#C66B45]" />
              Role-Based Access Control (RBAC) Assigned Capabilities:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {details.permissionScope.map((perm, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C66B45] shrink-0" />
                  <span className="truncate">{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#F5F3EF] border-t border-[#E7E2D9] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#292724] text-white font-semibold text-xs hover:bg-[#292724]/90 transition-colors shadow-xs"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
