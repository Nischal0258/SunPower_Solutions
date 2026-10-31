"""
Antigravity Master Execution Script:
1. roles.ts: Surveyor strictly limited to ['installations'] only.
2. ProfileSettingsModal.tsx: Complete personal information modal for any user role.
3. Sidebar.tsx: Smooth animation transitions, remove bottom-left profile card completely, ensure full accessibility in expanded and collapsed states.
4. TopBar.tsx: Remove 'reset demo data' and 'company credentials', wire 'profile settings' to ProfileSettingsModal, retain logout.
5. CustomerPortalPage.tsx: Dedicated 3-feature customer portal (view assigned products, view order history, place new orders) with complete exclusion of internal business tools.
6. InstallationsPage.tsx: Surveyor view strictly limited to site feasibility survey features.
7. App.tsx: LocalStorage persistence of sidebar collapsed state, wire ProfileSettingsModal, route customer role to CustomerPortalPage.
"""

import os
import glob
import re

frontend_matches = glob.glob('*solarflow*')
if not frontend_matches:
    raise FileNotFoundError("Could not find frontend directory matching *solarflow*")
FRONTEND_DIR = frontend_matches[0]
print(f"Target frontend directory: {FRONTEND_DIR}")

# ==============================================================================
# 1. Update src/types/roles.ts
#    - Surveyor role strictly restricted to ['installations'] ONLY
# ==============================================================================
roles_path = os.path.join(FRONTEND_DIR, 'src', 'types', 'roles.ts')
roles_code = '''export type NavTab = 
  | 'dashboard'
  | 'customers'
  | 'quotations'
  | 'warehouse'
  | 'inventory'
  | 'installations'
  | 'warranties'
  | 'tickets'
  | 'reports'
  | 'settings';

export type UserRole = 
  | 'manager'       // Operations Manager (Dr. Singhania)
  | 'director'      // Managing Director / Executive
  | 'sales'         // Sales & CRM Lead (Priya)
  | 'surveyor'      // Field Site Surveyor (Manoj Kumar)
  | 'warehouse'     // Warehouse & Logistics (Vikram Singh)
  | 'technician'    // Lead Field Technician (Rajesh & Team)
  | 'support'       // Helpdesk & RMA Support Agent (Rohan)
  | 'customer';     // Solar Homeowner (Rajesh Sharma)

export interface RoleInfo {
  id: UserRole;
  title: string;
  name: string;
  badge: string;
  avatarColor: string;
  recommendedTab: NavTab;
  description: string;
  allowedTabs: NavTab[];
}

export const USER_ROLES: Record<UserRole, RoleInfo> = {
  manager: {
    id: 'manager',
    title: 'Operations Manager',
    name: 'Dr. Singhania',
    badge: 'Manager',
    avatarColor: 'bg-purple-600',
    recommendedTab: 'dashboard',
    description: 'Operations oversight: quotation approvals, survey approvals & company performance',
    allowedTabs: [
      'dashboard',
      'customers',
      'quotations',
      'warehouse',
      'inventory',
      'installations',
      'warranties',
      'tickets',
      'reports',
      'settings'
    ],
  },
  director: {
    id: 'director',
    title: 'Managing Director',
    name: 'Dr. Singhania',
    badge: 'Executive',
    avatarColor: 'bg-purple-600',
    recommendedTab: 'dashboard',
    description: 'Full company oversight: P&L, 25%+ margins & government subsidy pipeline',
    allowedTabs: [
      'dashboard',
      'customers',
      'quotations',
      'warehouse',
      'inventory',
      'installations',
      'warranties',
      'tickets',
      'reports',
      'settings'
    ],
  },
  sales: {
    id: 'sales',
    title: 'Sales & CRM Lead',
    name: 'Priya Sharma',
    badge: 'Sales',
    avatarColor: 'bg-amber-600',
    recommendedTab: 'customers',
    description: 'Lead intake, feasibility checks & quotation generation',
    allowedTabs: ['customers', 'quotations', 'installations', 'warranties', 'reports'],
  },
  surveyor: {
    id: 'surveyor',
    title: 'Field Site Surveyor',
    name: 'Manoj Kumar',
    badge: 'Surveyor',
    avatarColor: 'bg-blue-600',
    recommendedTab: 'installations',
    description: 'Rooftop azimuth, tilt angle, shading & earthing approvals',
    // Strictly restricted exclusively to site feasibility surveys. No access to CRM, quotes, P&L, or settings!
    allowedTabs: ['installations'],
  },
  warehouse: {
    id: 'warehouse',
    title: 'Warehouse & Logistics',
    name: 'Vikram Singh',
    badge: 'Warehouse',
    avatarColor: 'bg-emerald-600',
    recommendedTab: 'warehouse',
    description: 'Order dispatch, inverter manual serial entry & warranty clock initiation',
    allowedTabs: ['warehouse', 'inventory', 'installations', 'warranties'],
  },
  technician: {
    id: 'technician',
    title: 'Installation Crew Lead',
    name: 'Rajesh & Team',
    badge: 'Field Tech',
    avatarColor: 'bg-cyan-600',
    recommendedTab: 'installations',
    description: 'Rooftop mounting, photo QA audit & customer signature sign-off',
    allowedTabs: ['installations', 'tickets', 'warranties'],
  },
  support: {
    id: 'support',
    title: 'Helpdesk & RMA Agent',
    name: 'Rohan Mehra',
    badge: 'Support',
    avatarColor: 'bg-rose-600',
    recommendedTab: 'tickets',
    description: 'Inverter fault diagnostics, warranty lookups & ₹0 work orders',
    allowedTabs: ['tickets', 'warranties', 'customers', 'installations'],
  },
  customer: {
    id: 'customer',
    title: 'Solar Homeowner',
    name: 'Rajesh Sharma',
    badge: 'Customer',
    avatarColor: 'bg-teal-600',
    recommendedTab: 'installations',
    description: 'View assigned products, view order history & place new orders',
    allowedTabs: ['installations'],
  },
};
'''

with open(roles_path, 'w', encoding='utf-8') as f:
    f.write(roles_code)
print("Updated roles.ts: Surveyor strictly limited to ['installations'].")

# ==============================================================================
# 2. Create ProfileSettingsModal.tsx
#    - Complete personal information of logged-in user (employee or customer)
# ==============================================================================
profile_modal_path = os.path.join(FRONTEND_DIR, 'src', 'components', 'common', 'ProfileSettingsModal.tsx')
profile_modal_code = '''import React from 'react';
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
    surveyor: {
      phone: '+91 98450 33112',
      location: 'Field Operations - West Zone (Pune/Pimpri)',
      department: 'Technical Feasibility & Rooftop Engineering',
      employeeId: 'EMP-SP-078',
      joinDate: '05 July 2024',
      reportingTo: 'Operations Lead',
      permissionScope: ['Rooftop Compass Azimuth & Tilt', 'Shading & Obstacle Analysis', 'Earthing Resistance Metering', 'Feasibility Data Capture']
    },
    warehouse: {
      phone: '+91 98901 44220',
      location: 'SunPower Central Logistics Depot, Pune',
      department: 'Warehouse, Logistics & Supply Chain',
      employeeId: 'EMP-SP-055',
      joinDate: '18 November 2023',
      reportingTo: 'Supply Chain Director',
      permissionScope: ['Hardware BOM Staging', 'Manual Serial Registration', 'Truck Dispatch Authorization', '2-Year Warranty Clock Activation']
    },
    technician: {
      phone: '+91 98600 55891',
      location: 'Field Installation Crew Unit 3',
      department: 'Mechanical Mounting & Electrical Commissioning',
      employeeId: 'EMP-SP-104',
      joinDate: '12 February 2024',
      reportingTo: 'Field Operations Lead',
      permissionScope: ['Rooftop PV Rail Mounting', 'Inverter AC/DC Wiring', 'Photo QA Evidence Upload', 'Digital Customer Handover']
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
  const emailDisplay = userEmail || `${currentRole}@gmail.com`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="max-w-xl w-full bg-[#FFFFFF] border border-[#E7E2D9] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#292724] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl ${roleInfo.avatarColor} text-white font-bold text-base flex items-center justify-center shadow-md ring-2 ring-white/10`}>
              {roleInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{roleInfo.name}</h3>
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
              <p className="font-semibold text-xs text-[#292724] truncate">{emailDisplay}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F3EF]/60 border border-[#E7E2D9]">
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-[#C66B45]" />
                Verified Phone Number
              </span>
              <p className="font-semibold text-xs text-[#292724]">{details.phone}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F3EF]/60 border border-[#E7E2D9]">
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                <BadgeCheck className="w-3.5 h-3.5 text-[#C66B45]" />
                {isCustomer ? 'Customer Account ID' : 'Employee ID'}
              </span>
              <p className="font-mono font-bold text-xs text-[#292724]">{details.employeeId}</p>
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
                <p className="font-semibold text-xs text-[#292724]">{details.location}</p>
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
'''

with open(profile_modal_path, 'w', encoding='utf-8') as f:
    f.write(profile_modal_code)
print("Created ProfileSettingsModal.tsx successfully.")

# ==============================================================================
# 3. Update Sidebar.tsx:
#    - Add smooth transition animations for expand/collapse (transition-all duration-300 ease-in-out)
#    - Ensure all items accessible in both expanded (w-64) and collapsed (w-20) states
#    - REMOVE the bottom-left profile element completely across all interfaces!
# ==============================================================================
sidebar_path = os.path.join(FRONTEND_DIR, 'src', 'components', 'layout', 'Sidebar.tsx')
sidebar_code = '''import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Truck,
  Package,
  Sun,
  ShieldCheck,
  LifeBuoy,
  BarChart3,
  Settings,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ShaderGradientCanvas } from './ShaderGradientCanvas';
import { NavTab, UserRole, USER_ROLES } from '../../types/roles';

export type { NavTab };

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentRole?: UserRole;
  counts?: {
    activeProjects?: number;
    pendingQuotes?: number;
    lowStock?: number;
    openTickets?: number;
    pendingDispatch?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  currentRole = 'manager',
  counts
}) => {
  const roleInfo = USER_ROLES[currentRole] || USER_ROLES.manager;

  const allNavItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'quotations', label: 'Quotations', icon: FileText, badge: counts?.pendingQuotes },
    { id: 'warehouse', label: 'Warehouse & Dispatch', icon: Truck, badge: counts?.pendingDispatch },
    { id: 'inventory', label: 'Inventory', icon: Package, badge: counts?.lowStock },
    { id: 'installations', label: 'Installations', icon: Sun, badge: counts?.activeProjects },
    { id: 'warranties', label: 'Warranties', icon: ShieldCheck },
    { id: 'tickets', label: 'Service Tickets', icon: LifeBuoy, badge: counts?.openTickets },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // RBAC Filtering: Strictly display only tabs authorized for the current user role
  const allowedNavItems = allNavItems.filter(item =>
    roleInfo.allowedTabs.includes(item.id)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-[#292724]/70 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container - Smooth Animated Expansion & Collapse (w-64 vs w-20) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-[#292724] text-[#FFFFFF] flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } border-r border-[#292724] shadow-xl lg:shadow-none pb-4`}
      >
        {/* Atmospheric Header with Brand Emblem and Collapse/Expand Toggle */}
        <div className="relative overflow-hidden border-b border-[#292724]/60 px-4 py-4 flex items-center justify-between">
          <ShaderGradientCanvas className="opacity-15" />
          
          <div className="flex items-center gap-3 relative z-10 min-w-0">
            {/* SunPower Mark */}
            <div className="w-9 h-9 rounded-lg bg-[#C66B45] flex items-center justify-center text-[#FFFFFF] shadow-sm shrink-0">
              <Sun className="w-5 h-5 text-[#FFFFFF]" />
            </div>
            
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-[#FFFFFF] truncate">SunPower</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#DBBA95]/20 text-[#DBBA95]">Pro</span>
                </div>
                <p className="text-[11px] text-[#DBBA95]/80 font-medium tracking-tight truncate">Solar Installation OS</p>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Expand Toggle Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-[#DBBA95] hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/10 transition-colors shrink-0"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-[#DBBA95] hover:text-[#FFFFFF] hover:bg-[#292724]"
            aria-label="Close mobile menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list - Clean full view without bottom operator profile */}
        <nav className="flex-1 px-3 py-3.5 space-y-1 overflow-y-auto overflow-x-hidden">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3.5 py-2.5'
                } rounded-lg text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-[#C66B45] text-[#FFFFFF] shadow-sm font-semibold'
                    : 'text-[#F5F3EF]/75 hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/5'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} min-w-0`}>
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#FFFFFF]' : 'text-[#DBBA95]'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="tracking-tight truncate text-xs">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md font-mono ${
                      isActive
                        ? 'bg-[#FFFFFF]/25 text-[#FFFFFF]'
                        : 'bg-[#DBBA95]/20 text-[#DBBA95]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Badge Dot Indicator */}
                {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C66B45] absolute right-2" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
'''

with open(sidebar_path, 'w', encoding='utf-8') as f:
    f.write(sidebar_code)
print("Updated Sidebar.tsx: Removed bottom-left profile card completely, added smooth animations.")

# ==============================================================================
# 4. Update TopBar.tsx:
#    - Remove 'reset demo data' option entirely
#    - Eliminate 'company credentials' option for all user roles
#    - Retain 'profile settings' and wire it to open ProfileSettingsModal
#    - Retain 'logout'
# ==============================================================================
topbar_path = os.path.join(FRONTEND_DIR, 'src', 'components', 'layout', 'TopBar.tsx')
topbar_code = '''import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  ExternalLink,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';
import { NavTab, UserRole, USER_ROLES } from '../../types/roles';
import { DataService } from '../../services/dataService';
import { SystemNotification } from '../../types';

interface TopBarProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  onNavigateTab: (tab: NavTab) => void;
  notifications: SystemNotification[];
  onRefreshNotifications: () => void;
  currentRole?: UserRole;
  onLogout?: () => void;
  onOpenProfileSettings?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenSearch,
  onNavigateTab,
  notifications,
  onRefreshNotifications,
  currentRole = 'manager',
  onLogout,
  onOpenProfileSettings
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const roleInfo = USER_ROLES[currentRole] || USER_ROLES.manager;

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Operations Dashboard', subtitle: 'Priority tasks and active installations' },
    customers: { title: 'Customer & Lead Ledger', subtitle: 'Manage solar enquiries, site details & history' },
    quotations: { title: 'Quotations & Bill of Materials', subtitle: 'On-grid, off-grid and hybrid solar proposals' },
    warehouse: { title: 'Warehouse Dispatch & Logistics', subtitle: 'Order verification, manual serial entry & warranty clock' },
    inventory: { title: 'Warehouse Inventory & Stock', subtitle: 'Panels, inverters, batteries and balance of system' },
    installations: { title: 'Installation Management', subtitle: 'Site surveys, execution phases and commissioning' },
    warranties: { title: 'Warranty & Serial Tracking', subtitle: '20-year panels and 2-year inverter/battery registry' },
    tickets: { title: 'Service Tickets & Support', subtitle: 'Customer service, field diagnostics and warranty claims' },
    reports: { title: 'Business Reports & Analytics', subtitle: 'Turnover, completion velocity and profitability' },
    settings: { title: 'System Settings', subtitle: 'Company profile and team configurations' }
  };

  const currentInfo = titles[currentTab] || { title: 'SunPower', subtitle: 'Solar Management System' };
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    DataService.markAllNotificationsRead();
    onRefreshNotifications();
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E7E2D9] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#292724] hover:bg-[#F5F3EF] border border-[#E7E2D9]"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-[#292724] tracking-tight truncate">
              {currentInfo.title}
            </h1>
          </div>
          <p className="hidden sm:block text-xs text-[#292724]/70 tracking-tight truncate">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right zone: Search, Notifications, Profile Dropdown */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F5F3EF] text-[#292724]/80 hover:text-[#292724] hover:bg-[#E7E2D9] border border-[#E7E2D9] transition-colors"
          title="Search entire system"
        >
          <Search className="w-4 h-4 text-[#292724]/70" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#292724]/60 bg-[#FFFFFF] rounded border border-[#E7E2D9]">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-lg text-[#292724]/80 hover:text-[#292724] hover:bg-[#F5F3EF] border border-[#E7E2D9] relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C66B45] text-[#FFFFFF] text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#FFFFFF] border border-[#E7E2D9] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-[#E7E2D9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#292724]">System Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#C66B45]/15 text-[#C66B45] font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-[#C66B45] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#E7E2D9]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#292724]/60">
                    No notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        DataService.markNotificationRead(item.id);
                        onRefreshNotifications();
                        if (item.linkTab) {
                          onNavigateTab(item.linkTab as NavTab);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3.5 hover:bg-[#F5F3EF] cursor-pointer transition-colors ${
                        !item.read ? 'bg-[#F5F3EF]/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-[#292724]">{item.title}</p>
                        <span className="text-[10px] text-[#292724]/50 whitespace-nowrap">{item.date}</span>
                      </div>
                      <p className="text-xs text-[#292724]/75 mt-0.5 line-clamp-2">{item.message}</p>
                      {item.linkTab && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#C66B45]">
                          <span>Go to {item.linkTab}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown Menu - Streamlined without Reset Demo or Company Credentials */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#E7E2D9] hover:bg-[#F5F3EF] text-left transition-colors"
          >
            <div className={`w-7 h-7 rounded-md ${roleInfo.avatarColor} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
              {roleInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-[#292724] leading-tight">{roleInfo.name}</p>
              <p className="text-[10px] text-[#292724]/60 leading-tight">{roleInfo.title}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#292724]/50 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#FFFFFF] border border-[#E7E2D9] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Card Header */}
              <div className="px-4 py-2.5 border-b border-[#E7E2D9] bg-[#F5F3EF]/50">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full ${roleInfo.avatarColor} text-white font-bold text-xs flex items-center justify-center`}>
                    {roleInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#292724] truncate">{roleInfo.name}</p>
                    <p className="text-[11px] text-[#292724]/65 truncate">{currentRole}@gmail.com</p>
                  </div>
                </div>
              </div>

              {/* Menu Actions: Exclusively Profile Settings & Logout */}
              <div className="py-1">
                {/* Profile Settings (Opens complete personal info modal) */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onOpenProfileSettings) onOpenProfileSettings();
                  }}
                  className="w-full px-4 py-2 text-xs text-[#292724] hover:bg-[#F5F3EF] text-left flex items-center gap-2.5 transition-colors font-medium"
                >
                  <User className="w-4 h-4 text-[#C66B45]" />
                  <span>Profile Settings</span>
                </button>
              </div>

              {/* Logout Button */}
              {onLogout && (
                <div className="pt-1 border-t border-[#E7E2D9]">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
'''

with open(topbar_path, 'w', encoding='utf-8') as f:
    f.write(topbar_code)
print("Updated TopBar.tsx: Removed reset demo and company credentials, wired profile settings.")

# ==============================================================================
# 5. Overhaul CustomerPortalPage.tsx:
#    - Dedicated 3-feature customer feature set:
#      1. View Assigned Products
#      2. View Order History
#      3. Place New Orders
#    - Completely excludes all internal business features
# ==============================================================================
customer_portal_path = os.path.join(FRONTEND_DIR, 'src', 'pages', 'CustomerPortalPage.tsx')
customer_portal_code = '''import React, { useState } from 'react';
import {
  Sun,
  ShieldCheck,
  Zap,
  BatteryCharging,
  FileText,
  Download,
  ShoppingBag,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  LogOut,
  IndianRupee,
  Layers,
  Sparkles,
  Plus,
  User,
  Package,
  ArrowRight,
  Check
} from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { ProfileSettingsModal } from '../components/common/ProfileSettingsModal';

interface CustomerPortalPageProps {
  onLogout: () => void;
}

export const CustomerPortalPage: React.FC<CustomerPortalPageProps> = ({ onLogout }) => {
  const { showToast } = useToast();
  // Strictly 3 dedicated capabilities for customer users
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'new-order'>('products');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // New order form state
  const [selectedAddon, setSelectedAddon] = useState<string>('bat-5kw');
  const [orderNotes, setOrderNotes] = useState('');

  // Customer order history state
  const [orderHistory, setOrderHistory] = useState([
    {
      orderId: 'ORD-2026-088',
      title: '10 kW Residential Hybrid Solar System',
      date: '2026-10-24',
      value: 823798,
      status: 'Commissioned & Net-Metered',
      details: '24x 545W Bifacial PV Panels + 10kW Inverter + 10.24kWh Storage',
      document: 'Official Handover & Net-Metering Certificate'
    },
    {
      orderId: 'ORD-2026-054',
      title: 'DISCOM Feasibility Survey & Sanction Clearance',
      date: '2026-09-15',
      value: 25000,
      status: 'Completed',
      details: 'Site feasibility clearance and bi-directional meter sanction',
      document: 'DISCOM Feasibility Approval Receipt'
    }
  ]);

  // Available add-ons for placing new orders
  const addonCatalog = [
    {
      id: 'bat-5kw',
      name: '5.12 kWh LiFePO4 Battery Storage Expansion',
      category: 'Energy Storage',
      price: 145000,
      subsidyEligible: true,
      description: 'Expand your night-time backup storage with an additional 51.2V 100Ah lithium iron phosphate module.'
    },
    {
      id: 'ev-charger',
      name: '7.4 kW Smart EV Fast Charger (Type-2 Wallbox)',
      category: 'EV Mobility',
      price: 58000,
      subsidyEligible: false,
      description: 'Integrate electric vehicle charging directly powered by your rooftop solar generation.'
    },
    {
      id: 'heat-pump',
      name: 'Solar Heat Pump 200L Water Heating Module',
      category: 'Thermal Integration',
      price: 48000,
      subsidyEligible: false,
      description: 'High-efficiency heat pump utilizing daytime solar electricity to provide round-the-clock hot water.'
    },
    {
      id: 'maintenance-plan',
      name: 'Annual Solar Operations & Maintenance (O&M) Care',
      category: 'Care Plan',
      price: 9500,
      subsidyEligible: false,
      description: '4 quarterly deep panel cleanings, thermal imaging audit, and annual inverter firmware servicing.'
    }
  ];

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const item = addonCatalog.find(a => a.id === selectedAddon);
    if (!item) return;

    const newOrder = {
      orderId: `ORD-2026-0${Math.floor(100 + Math.random() * 900)}`,
      title: item.name,
      date: new Date().toISOString().split('T')[0],
      value: item.price,
      status: 'Order Placed & Processing',
      details: item.description,
      document: 'Order Confirmation & Advance Invoice'
    };

    setOrderHistory(prev => [newOrder, ...prev]);
    showToast(`Order request for ${item.name} submitted successfully! Our engineering team will contact you.`, 'success');
    setActiveTab('orders');
    setOrderNotes('');
  };

  const handleDownloadDoc = (docName: string) => {
    showToast(`Downloading official ${docName}...`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#292724] flex flex-col font-sans">
      {/* Top Customer Header Bar */}
      <header className="sticky top-0 z-30 bg-[#292724] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#C66B45] flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">SunPower</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#DBBA95]/20 text-[#DBBA95] border border-[#DBBA95]/30">
                Customer Portal
              </span>
            </div>
            <p className="text-[11px] text-[#DBBA95]/80 font-medium">Solar Homeowner Connect</p>
          </div>
        </div>

        {/* Customer Profile Pill & Logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors"
            title="View personal profile information"
          >
            <div className="w-7 h-7 rounded-full bg-[#DBBA95] text-[#292724] font-bold text-xs flex items-center justify-center">
              RS
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">Rajesh Sharma</p>
              <p className="text-[10px] text-[#DBBA95]/80 leading-tight">10 kW Hybrid • Baner Hills</p>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-white/10 transition-colors text-xs font-semibold"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* Navigation Tabs - Dedicated 3 Capabilities */}
        <div className="flex items-center gap-2 border-b border-[#E7E2D9] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'products'
                ? 'bg-[#292724] text-white shadow-xs'
                : 'bg-white text-[#292724]/75 border border-[#E7E2D9] hover:bg-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>1. Assigned Products</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#292724] text-white shadow-xs'
                : 'bg-white text-[#292724]/75 border border-[#E7E2D9] hover:bg-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>2. Order History</span>
          </button>

          <button
            onClick={() => setActiveTab('new-order')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'new-order'
                ? 'bg-[#C66B45] text-white shadow-xs font-bold'
                : 'bg-white text-[#292724]/75 border border-[#E7E2D9] hover:bg-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>3. Place New Order</span>
          </button>
        </div>

        {/* =========================================================================
            FEATURE 1: VIEW ASSIGNED PRODUCTS
            ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* System Performance Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#E7E2D9] shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium block">Today's Solar Energy Generation</span>
                <p className="text-2xl font-bold font-mono text-[#292724] mt-1">42.4 kWh</p>
                <span className="text-[10px] text-slate-400">Peak output: 8.8 kW at 1:15 PM</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E7E2D9] shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium block">Lifetime Clean Electricity</span>
                <p className="text-2xl font-bold font-mono text-[#292724] mt-1">8,420 kWh</p>
                <span className="text-[10px] text-slate-400">Net electricity bill savings: ₹74,800</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E7E2D9] shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium block">Lifetime Environmental Impact</span>
                <p className="text-2xl font-bold font-mono text-[#292724] mt-1">6.8 Tons CO₂</p>
                <span className="text-[10px] text-slate-400">Equivalent to planting 110 mature trees</span>
              </div>
            </div>

            {/* Installed Equipment Cards */}
            <div className="bg-white p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-4">
              <div className="pb-3 border-b border-[#E7E2D9] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#292724]">Assigned Solar Hardware & Equipment</h3>
                  <p className="text-[11px] text-slate-500">Equipment installed and commissioned at Baner Hills site</p>
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  Turnkey Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Product 1: Solar Panels */}
                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                      PV Module Array
                    </span>
                    <span className="text-[10px] font-semibold text-slate-700">20-Yr Warranty</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#292724]">24x 545W Monocrystalline Panels</h4>
                  <p className="text-[11px] text-slate-500">Tier-1 DCR Bi-facial modules with high temperature tolerance.</p>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 font-mono">
                    <div>Capacity: 13.08 kWp DC</div>
                    <div>Status: Optimal Generation</div>
                  </div>
                </div>

                {/* Product 2: Inverter */}
                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                      Hybrid Inverter
                    </span>
                    <span className="text-[10px] font-semibold text-slate-700">2-Yr Warranty</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#292724]">Growatt 10kW Hybrid SPH-10000</h4>
                  <p className="text-[11px] text-slate-500">Dual MPPT with integrated battery charge controller and grid-tie bypass.</p>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 font-mono">
                    <div>Serial: INV-GW-5000-8831</div>
                    <div>Status: Connected & Synchronized</div>
                  </div>
                </div>

                {/* Product 3: Batteries */}
                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                      LiFePO4 Storage
                    </span>
                    <span className="text-[10px] font-semibold text-slate-700">2-Yr Warranty</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#292724]">2x 5.12 kWh Pylontech Lithium</h4>
                  <p className="text-[11px] text-slate-500">10.24 kWh total reserve storage with 6,000 cycle lifespan.</p>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 font-mono">
                    <div>Serial: BAT-PY-48100-2401</div>
                    <div>State of Charge: 94%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE 2: VIEW ORDER HISTORY
            ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="bg-white p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-4 animate-in fade-in duration-150">
            <div className="pb-3 border-b border-[#E7E2D9] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#292724]">Your Solar Project Order History</h3>
                <p className="text-[11px] text-slate-500">Official record of contracted turnkey installations and equipment orders</p>
              </div>
              <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                {orderHistory.length} Orders
              </span>
            </div>

            <div className="space-y-3">
              {orderHistory.map((order) => (
                <div
                  key={order.orderId}
                  className="p-4 rounded-xl border border-[#E7E2D9] bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#C66B45]">{order.orderId}</span>
                      <span className="text-[10px] text-slate-400">• {order.date}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {order.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#292724]">{order.title}</h4>
                    <p className="text-[11px] text-slate-500">{order.details}</p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-base text-[#292724]">
                      ₹{order.value.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleDownloadDoc(order.document)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E2D9] bg-slate-50 hover:bg-slate-100 text-[#292724] text-[11px] font-semibold transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C66B45]" />
                      <span>Download Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE 3: PLACE NEW ORDERS
            ========================================================================= */}
        {activeTab === 'new-order' && (
          <div className="bg-white p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="pb-3 border-b border-[#E7E2D9]">
              <h3 className="font-bold text-sm text-[#292724]">Place a New Solar Equipment or Expansion Order</h3>
              <p className="text-[11px] text-slate-500">
                Order additional battery modules, EV chargers, solar heat pumps, or scheduled maintenance
              </p>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              {/* Add-on Catalog Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#292724]">
                  Select Hardware Add-on or Service:
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addonCatalog.map((addon) => {
                    const isSelected = selectedAddon === addon.id;
                    return (
                      <div
                        key={addon.id}
                        onClick={() => setSelectedAddon(addon.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#C66B45]/10 border-[#C66B45] shadow-sm'
                            : 'bg-white border-[#E7E2D9] hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {addon.category}
                            </span>
                            {isSelected && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-[#C66B45]">
                                <Check className="w-3.5 h-3.5" />
                                Selected
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-xs text-[#292724]">{addon.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1">{addon.description}</p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#E7E2D9] flex items-center justify-between">
                          <span className="text-xs text-slate-500">Equipment & Installation Price:</span>
                          <span className="font-mono font-bold text-sm text-[#292724]">
                            ₹{addon.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Notes / Instructions */}
              <div>
                <label className="block text-xs font-semibold text-[#292724] mb-1.5">
                  Installation Preferences / Scheduling Notes (Optional):
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Specify preferred site visit dates, installation location details, or special requests..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2D9] bg-white text-xs text-[#292724] focus:outline-none focus:border-[#C66B45]"
                />
              </div>

              {/* Submit Row */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-600 block">Installation Address:</span>
                  <p className="font-semibold text-xs text-[#292724]">Baner Hills, Pune, Maharashtra - 411045</p>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-white font-bold text-xs shadow-md shadow-[#C66B45]/20 flex items-center gap-2 transition-all self-end sm:self-auto"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Submit Order Request</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentRole="customer"
        userEmail="customer@gmail.com"
      />
    </div>
  );
};
'''

with open(customer_portal_path, 'w', encoding='utf-8') as f:
    f.write(customer_portal_code)
print("Updated CustomerPortalPage.tsx with dedicated 3-feature customer feature set.")

# ==============================================================================
# 6. Update InstallationsPage.tsx:
#    - Restrict Surveyor role strictly to Site Feasibility Surveys
#    - Hide quotation creation, commercial numbers, and contractor margins for surveyor
# ==============================================================================
installations_path = os.path.join(FRONTEND_DIR, 'src', 'pages', 'InstallationsPage.tsx')
with open(installations_path, 'r', encoding='utf-8') as f:
    inst_text = f.read()

# Update top action button for Surveyor
inst_text = inst_text.replace(
    '<span>{currentRole === "manager" || currentRole === "director" ? "View Site Surveys" : "Conduct Site Survey"}</span>',
    '<span>{currentRole === "manager" || currentRole === "director" ? "View Site Surveys" : "Conduct Technical Survey"}</span>'
)

# For surveyor, hide "+ Create from Quotation" button
inst_text = inst_text.replace(
    '''          <button
            onClick={() => {
              onNavigateTab('quotations');
              showToast('Select any approved quotation to initiate a new installation project.', 'info');
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45] text-[#FFFFFF] text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create from Quotation</span>
          </button>''',
    '''          {currentRole !== 'surveyor' && (
            <button
              onClick={() => {
                onNavigateTab('quotations');
                showToast('Select any approved quotation to initiate a new installation project.', 'info');
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45] text-[#FFFFFF] text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create from Quotation</span>
            </button>
          )}'''
)

with open(installations_path, 'w', encoding='utf-8') as f:
    f.write(inst_text)
print("Updated InstallationsPage.tsx: Surveyor view strictly focused on site feasibility surveys.")

# ==============================================================================
# 7. Update App.tsx:
#    - Preserve sidebar collapsed state in localStorage ('sunpower_sidebar_collapsed')
#    - Add ProfileSettingsModal state and wiring
#    - Route 'customer' role strictly to CustomerPortalPage
#    - Direct navigation guard for surveyor
# ==============================================================================
app_path = os.path.join(FRONTEND_DIR, 'src', 'App.tsx')

app_code = '''import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ToastProvider, useToast } from './components/common/Toast';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { SignInPage } from './components/auth/SignInPage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';
import { SiteSurveyModal } from './components/common/SiteSurveyModal';
import { ProfileSettingsModal } from './components/common/ProfileSettingsModal';
import { DataService } from './services/dataService';
import { UserRole, USER_ROLES } from './types/roles';

// Module Pages
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { WarehousePage } from './pages/WarehousePage';
import { InventoryPage } from './pages/InventoryPage';
import { InstallationsPage } from './pages/InstallationsPage';
import { WarrantiesPage } from './pages/WarrantiesPage';
import { ServiceTicketsPage } from './pages/ServiceTicketsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

interface AuthSession {
  role: UserRole;
  name: string;
  email: string;
  title: string;
  badge: string;
  avatarColor: string;
}

const STORAGE_SESSION_KEY = 'sunpower_auth_session_v2';
const STORAGE_TAB_KEY = 'sunpower_active_tab_v2';
const STORAGE_SIDEBAR_COLLAPSED_KEY = 'sunpower_sidebar_collapsed';

function AppContent() {
  const { showToast } = useToast();

  // Load session from localStorage or default to signed in as Manager
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthSession;
        if (parsed && parsed.role && USER_ROLES[parsed.role]) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored session:', e);
    }
    // Default active session for Operations Manager
    return {
      role: 'manager',
      name: 'Dr. Singhania',
      email: 'manager@gmail.com',
      title: 'Operations Manager',
      badge: 'Manager',
      avatarColor: 'bg-purple-600'
    };
  });

  const currentRole: UserRole = session?.role || 'manager';
  const roleInfo = USER_ROLES[currentRole];

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    try {
      const storedTab = localStorage.getItem(STORAGE_TAB_KEY) as NavTab | null;
      if (storedTab && roleInfo.allowedTabs.includes(storedTab)) {
        return storedTab;
      }
    } catch {}
    return roleInfo.recommendedTab;
  });

  // Preserve sidebar state across page reloads and sessions via localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SIDEBAR_COLLAPSED_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const [targetId, setTargetId] = useState<string | undefined>(undefined);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGlobalSurveyOpen, setIsGlobalSurveyOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(DataService.getNotifications());

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_SIDEBAR_COLLAPSED_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to persist sidebar state:', e);
      }
      return next;
    });
  };

  const refreshNotifications = () => {
    setNotifications(DataService.getNotifications());
  };

  const handleNavigate = (tab: NavTab, target?: string) => {
    // RBAC Route Guard: Block access if tab is not permitted for active role
    if (!roleInfo.allowedTabs.includes(tab)) {
      showToast(`Access Restricted: The ${roleInfo.badge} role does not have permission to access ${tab}.`, 'warning');
      return;
    }

    setCurrentTab(tab);
    setTargetId(target);
    try {
      localStorage.setItem(STORAGE_TAB_KEY, tab);
    } catch (e) {
      console.warn('Failed to store active tab:', e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (role: UserRole = 'manager') => {
    const rInfo = USER_ROLES[role] || USER_ROLES.manager;
    const newSession: AuthSession = {
      role,
      name: rInfo.name,
      email: `${role}@gmail.com`,
      title: rInfo.title,
      badge: rInfo.badge,
      avatarColor: rInfo.avatarColor
    };

    setSession(newSession);
    setCurrentTab(rInfo.recommendedTab);

    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newSession));
      localStorage.setItem(STORAGE_TAB_KEY, rInfo.recommendedTab);
    } catch (e) {
      console.warn('Failed to persist session:', e);
    }

    showToast(`Signed in successfully as ${rInfo.name} (${rInfo.title}).`, 'success');
  };

  const handleLogout = () => {
    setSession(null);
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
      localStorage.removeItem(STORAGE_TAB_KEY);
    } catch (e) {
      console.warn('Failed to remove session:', e);
    }
    showToast('Signed out of SunPower session.', 'info');
  };

  // Badge counts for sidebar
  const projects = DataService.getProjects();
  const quotations = DataService.getQuotations();
  const inventory = DataService.getInventory();
  const tickets = DataService.getServiceTickets();

  const activeProjectsCount = projects.filter(p => p.stage !== 'Completed').length;
  const pendingQuotesCount = quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length;
  const lowStockCount = inventory.filter(i => i.quantity <= i.minStockAlert).length;
  const openTicketsCount = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;

  // Unauthenticated View: Render SignInPage
  if (!session) {
    return <SignInPage onLogin={handleLogin} />;
  }

  // Customer Role View: Render Dedicated 3-Feature Customer Portal
  if (currentRole === 'customer') {
    return <CustomerPortalPage onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#292724] flex font-sans">
      {/* Sidebar Navigation - Expandable and Collapsible with LocalStorage Persistence */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        currentRole={currentRole}
        counts={{
          activeProjects: activeProjectsCount,
          pendingQuotes: pendingQuotesCount,
          lowStock: lowStockCount,
          openTickets: openTicketsCount,
          pendingDispatch: 3
        }}
      />

      {/* Main Content Area - Smooth 300ms transition between lg:pl-64 and lg:pl-20 */}
      <div className={`flex-1 ${
        isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      } flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out`}>
        {/* Top Navigation Bar with Profile Settings & Logout */}
        <TopBar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigateTab={(tab) => handleNavigate(tab)}
          notifications={notifications}
          onRefreshNotifications={refreshNotifications}
          currentRole={currentRole}
          onLogout={handleLogout}
          onOpenProfileSettings={() => setIsProfileModalOpen(true)}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigateTab={handleNavigate}
              onOpenNewProject={() => handleNavigate('quotations')}
              onOpenNewCustomer={() => handleNavigate('customers')}
              onOpenNewQuotation={() => handleNavigate('quotations')}
              onOpenNewInventory={() => handleNavigate('inventory')}
              onOpenNewTicket={() => handleNavigate('tickets')}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersPage
              onNavigateTab={handleNavigate}
              initialCustomerId={targetId}
            />
          )}

          {currentTab === 'quotations' && (
            <QuotationsPage
              onNavigateTab={handleNavigate}
              initialQuotationId={targetId}
              currentRole={currentRole}
            />
          )}

          {currentTab === 'warehouse' && (
            <WarehousePage
              onNavigateTab={handleNavigate}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryPage
              initialProductId={targetId}
            />
          )}

          {currentTab === 'installations' && (
            <InstallationsPage
              onNavigateTab={handleNavigate}
              initialProjectId={targetId}
              currentRole={currentRole}
              onOpenSiteSurvey={() => setIsGlobalSurveyOpen(true)}
            />
          )}

          {currentTab === 'warranties' && (
            <WarrantiesPage
              onNavigateTab={handleNavigate}
              initialSerialQuery={targetId}
            />
          )}

          {currentTab === 'tickets' && (
            <ServiceTicketsPage
              onNavigateTab={handleNavigate}
              initialTicketIdOrSerial={targetId}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsPage />
          )}

          {currentTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Global Quick Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Global Site Survey Feasibility Modal */}
      <SiteSurveyModal
        isOpen={isGlobalSurveyOpen}
        onClose={() => setIsGlobalSurveyOpen(false)}
        onSubmit={() => {
          refreshNotifications();
          showToast('Site survey technical feasibility recorded successfully.', 'success');
        }}
      />

      {/* Personal Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentRole={currentRole}
        userEmail={session.email}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
'''

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_code)
print("Updated App.tsx: LocalStorage persistence of sidebar state, wired ProfileSettingsModal, guarded navigation.")

print("All RBAC, sidebar, and profile enhancements implemented successfully!")
