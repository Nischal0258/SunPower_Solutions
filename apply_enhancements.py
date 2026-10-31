import os
import glob
import re

# Discover frontend directory safely
frontend_matches = glob.glob('*solarflow*')
if not frontend_matches:
    raise FileNotFoundError("Could not find frontend directory matching *solarflow*")
FRONTEND_DIR = frontend_matches[0]
print(f"Target frontend directory: {FRONTEND_DIR}")

# -------------------------------------------------------------
# 1. Update src/components/layout/Sidebar.tsx
# -------------------------------------------------------------
sidebar_content = """import React from 'react';
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
  X
} from 'lucide-react';
import { ShaderGradientCanvas } from './ShaderGradientCanvas';
import { NavTab, UserRole, USER_ROLES } from '../../types/roles';

export type { NavTab };

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
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
  currentRole = 'director',
  counts
}) => {
  const activeRoleInfo = USER_ROLES[currentRole] || USER_ROLES.director;

  const allNavItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers & Leads', icon: Users },
    { id: 'quotations', label: 'Quotations & BOM', icon: FileText, badge: counts?.pendingQuotes },
    { id: 'warehouse', label: 'Warehouse & Dispatch', icon: Truck, badge: counts?.pendingDispatch },
    { id: 'inventory', label: 'Inventory Stock', icon: Package, badge: counts?.lowStock },
    { id: 'installations', label: 'Installations & Survey', icon: Sun, badge: counts?.activeProjects },
    { id: 'warranties', label: 'Warranty & Serials', icon: ShieldCheck },
    { id: 'tickets', label: 'Service Tickets', icon: LifeBuoy, badge: counts?.openTickets },
    { id: 'reports', label: 'Reports & P&L', icon: BarChart3 },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  // RBAC: strictly filter navigation items to those authorized for the active user role
  const allowedNavItems = allNavItems.filter((item) =>
    activeRoleInfo.allowedTabs.includes(item.id)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container - Executive Deep Midnight Slate (#0F172A) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0F172A] text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } border-r border-slate-800 shadow-2xl lg:shadow-none`}
      >
        {/* Atmospheric Header with Shader Canvas */}
        <div className="relative overflow-hidden border-b border-slate-800/80 px-5 py-5 flex items-center justify-between">
          <ShaderGradientCanvas className="opacity-25" />
          
          <div className="flex items-center gap-3 relative z-10">
            {/* SunPower Mark */}
            <div className="w-9 h-9 rounded-lg bg-[#C66B45] flex items-center justify-center text-white shadow-md ring-1 ring-white/10">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">SunPower</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#C66B45]/20 text-[#DBBA95] border border-[#C66B45]/30">Pro</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">Solar EPC Operations OS</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close mobile menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Scope Notice Banner */}
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${activeRoleInfo.avatarColor}`} />
            <span className="truncate font-medium">Role: <strong className="text-white font-semibold">{activeRoleInfo.badge}</strong></span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {allowedNavItems.length} tabs
          </span>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3.5 space-y-1 overflow-y-auto">
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-[#C66B45] text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-[#DBBA95]'
                    }`}
                  />
                  <span className="tracking-tight truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md font-mono ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-[#DBBA95] border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Active Persona Operator Card (Syncs dynamically with role switcher) */}
        <div className="p-3 border-t border-slate-800 bg-[#0B1120]">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-full ${activeRoleInfo.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ring-1 ring-white/10`}>
                {activeRoleInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {activeRoleInfo.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">
                  {activeRoleInfo.title}
                </p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Active Session" />
          </div>
        </div>
      </aside>
    </>
  );
};
"""

sidebar_dest = os.path.join(FRONTEND_DIR, 'src', 'components', 'layout', 'Sidebar.tsx')
with open(sidebar_dest, 'w', encoding='utf-8') as f:
    f.write(sidebar_content)
print("Updated Sidebar.tsx successfully.")

# -------------------------------------------------------------
# 2. Update src/components/layout/TopBar.tsx
# -------------------------------------------------------------
topbar_content = """import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  RefreshCw,
  Building2,
  ExternalLink,
  ChevronDown,
  Check,
  LogOut,
  Shield,
  UserCheck
} from 'lucide-react';
import { NavTab, UserRole, USER_ROLES } from '../../types/roles';
import { DataService } from '../../services/dataService';
import { SystemNotification } from '../../types';

interface TopBarProps {
  currentTab: NavTab;
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onResetData: () => void;
  notifications: SystemNotification[];
  onRefreshNotifications: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenSearch,
  onNavigateTab,
  onResetData,
  notifications,
  onRefreshNotifications,
  currentRole,
  onRoleChange,
  onLogout
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const activeRoleInfo = USER_ROLES[currentRole] || USER_ROLES.director;

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Executive Operations Dashboard', subtitle: 'P&L, priority tasks and active installations' },
    customers: { title: 'Customer & Lead Ledger', subtitle: 'Solar enquiries, feasibility surveys & contact records' },
    quotations: { title: 'Quotations & Bill of Materials', subtitle: 'On-grid, off-grid and hybrid solar proposals' },
    warehouse: { title: 'Warehouse Dispatch & Logistics', subtitle: 'Order verification, inverter barcode scanning & warranty clock' },
    inventory: { title: 'Warehouse Inventory Stock', subtitle: 'Tier-1 panels, hybrid inverters and balance of system' },
    installations: { title: 'Installation Management', subtitle: 'Field execution phases, site surveys and commissioning' },
    warranties: { title: 'Warranty & Serial Tracking', subtitle: '20-year panels and 2-year inverter/battery registry' },
    tickets: { title: 'Service Tickets & Support', subtitle: 'Customer service, field diagnostics and warranty claims' },
    reports: { title: 'Business Reports & Analytics', subtitle: 'Turnover, completion velocity and gross margins' },
    settings: { title: 'System Settings', subtitle: 'Company credentials, team roster and pricing defaults' }
  };

  const currentInfo = titles[currentTab] || { title: 'SunPower', subtitle: 'Solar EPC Operations OS' };
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    DataService.markAllNotificationsRead();
    onRefreshNotifications();
  };

  const rolesList = Object.values(USER_ROLES);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E7E2D9] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-2xs">
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

      {/* Right zone: Search, Notifications, Active Role Pill, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F5F3EF] text-[#292724]/80 hover:text-[#292724] hover:bg-[#E7E2D9] border border-[#E7E2D9] transition-colors"
          title="Search entire system (Cmd+K)"
        >
          <Search className="w-4 h-4 text-[#292724]/70" />
          <span className="hidden md:inline">Quick Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#292724]/60 bg-white rounded border border-[#E7E2D9]">
            Ctrl+K
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
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C66B45] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-[#E7E2D9] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                    No new notifications
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
                        !item.read ? 'bg-[#F5F3EF]/50' : ''
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

        {/* Profile / Role Selector Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#E7E2D9] hover:bg-[#F5F3EF] hover:border-[#DBBA95] text-left transition-all"
            aria-label="User role and session menu"
          >
            <div className={`w-7 h-7 rounded-md ${activeRoleInfo.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
              {activeRoleInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-[#292724] leading-tight truncate">
                  {activeRoleInfo.name}
                </p>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                  {activeRoleInfo.badge}
                </span>
              </div>
              <p className="text-[10px] text-[#292724]/60 leading-tight truncate">
                {activeRoleInfo.title}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#292724]/50 shrink-0 ml-0.5" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-white border border-[#E7E2D9] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Active Profile Header */}
              <div className="px-4 py-3 border-b border-[#E7E2D9] bg-[#F5F3EF]/50">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${activeRoleInfo.avatarColor} text-white font-bold text-sm flex items-center justify-center shadow-xs`}>
                    {activeRoleInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[#292724] truncate">{activeRoleInfo.name}</p>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#C66B45]/15 text-[#C66B45]">
                        {activeRoleInfo.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#292724]/70 truncate">{activeRoleInfo.title}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 italic bg-white p-1.5 rounded border border-[#E7E2D9]/70">
                  {activeRoleInfo.description}
                </p>
              </div>

              {/* Role Switcher Section (All 7 Roles) */}
              <div className="px-3 py-2 border-b border-[#E7E2D9]">
                <div className="flex items-center justify-between px-1 mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#C66B45]" />
                    Switch User Role / Persona
                  </span>
                  <span className="text-[10px] text-slate-400">RBAC Active</span>
                </div>

                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {rolesList.map((role) => {
                    const isCurrent = currentRole === role.id;
                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          onRoleChange(role.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                          isCurrent
                            ? 'bg-[#C66B45]/10 border border-[#C66B45]/40 text-[#292724]'
                            : 'hover:bg-[#F5F3EF] border border-transparent text-[#292724]/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded ${role.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                            {role.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold leading-tight truncate text-[#292724]">
                              {role.name}
                            </p>
                            <p className="text-[10px] text-slate-500 leading-tight truncate">
                              {role.title}
                            </p>
                          </div>
                        </div>

                        {isCurrent ? (
                          <Check className="w-4 h-4 text-[#C66B45] shrink-0" />
                        ) : (
                          <span className="text-[9px] font-mono text-slate-400 px-1 py-0.5 rounded bg-slate-100">
                            {role.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Company & Demo Actions */}
              <div className="py-1 px-1 border-b border-[#E7E2D9]">
                <button
                  onClick={() => {
                    onNavigateTab('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-[#292724] hover:bg-[#F5F3EF] rounded-lg text-left flex items-center gap-2.5 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-[#292724]/60" />
                  <span>Company Credentials & Team</span>
                </button>

                <button
                  onClick={() => {
                    onResetData();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-[#C66B45] hover:bg-[#C66B45]/10 rounded-lg text-left flex items-center gap-2.5 font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-[#C66B45]" />
                  <span>Reset Demo Data to Defaults</span>
                </button>
              </div>

              {/* Requirement 4: Logout Button */}
              <div className="pt-1.5 pb-0.5 px-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-left flex items-center justify-between transition-colors border border-transparent hover:border-rose-200"
                >
                  <div className="flex items-center gap-2.5">
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Log Out / Exit Session</span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400">Lock</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
"""

topbar_dest = os.path.join(FRONTEND_DIR, 'src', 'components', 'layout', 'TopBar.tsx')
with open(topbar_dest, 'w', encoding='utf-8') as f:
    f.write(topbar_content)
print("Updated TopBar.tsx successfully.")

# -------------------------------------------------------------
# 3. Create SunPowerLockScreen component for Session Termination
# -------------------------------------------------------------
lock_screen_content = """import React from 'react';
import { Sun, Shield, Lock, ArrowRight } from 'lucide-react';
import { UserRole, USER_ROLES } from '../../types/roles';

interface SunPowerLockScreenProps {
  onLogin: (role: UserRole) => void;
}

export const SunPowerLockScreen: React.FC<SunPowerLockScreenProps> = ({ onLogin }) => {
  const rolesList = Object.values(USER_ROLES);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C66B45]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C66B45] text-white shadow-xl shadow-[#C66B45]/20 mb-3 ring-4 ring-white/10">
            <Sun className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">SunPower</h1>
            <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#C66B45]/20 text-[#DBBA95] border border-[#C66B45]/30">Pro</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Solar EPC & Rooftop Installation Management System
          </p>
        </div>

        {/* Lock Banner */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 mb-6">
          <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center text-[#DBBA95] shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Session Locked</h3>
            <p className="text-[11px] text-slate-400">
              Select your team role persona below to re-authenticate and resume your workflow.
            </p>
          </div>
        </div>

        {/* Quick Role Re-authentication */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Sign In As:
          </p>
          <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
            {rolesList.map((role) => (
              <button
                key={role.id}
                onClick={() => onLogin(role.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-[#C66B45]/50 transition-all group text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg ${role.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                    {role.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white group-hover:text-[#DBBA95] transition-colors truncate">
                        {role.name}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400">
                        {role.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {role.title}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#C66B45] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Role-Based Access Control (RBAC) Enforced - SunPower v2.4</span>
        </div>
      </div>
    </div>
  );
};
"""

lock_screen_dest = os.path.join(FRONTEND_DIR, 'src', 'components', 'common', 'SunPowerLockScreen.tsx')
with open(lock_screen_dest, 'w', encoding='utf-8') as f:
    f.write(lock_screen_content)
print("Created SunPowerLockScreen.tsx successfully.")

# -------------------------------------------------------------
# 4. Update src/App.tsx with RBAC routing, Warehouse tab, and Lock Screen
# -------------------------------------------------------------
app_content = """import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ToastProvider, useToast } from './components/common/Toast';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { SunPowerLockScreen } from './components/common/SunPowerLockScreen';
import { SiteSurveyModal } from './components/common/SiteSurveyModal';
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

function AppContent() {
  const { showToast } = useToast();
  const [currentRole, setCurrentRole] = useState<UserRole>('director');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(false);
  const [targetId, setTargetId] = useState<string | undefined>(undefined);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGlobalSurveyOpen, setIsGlobalSurveyOpen] = useState(false);
  const [notifications, setNotifications] = useState(DataService.getNotifications());

  const refreshNotifications = () => {
    setNotifications(DataService.getNotifications());
  };

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    const roleInfo = USER_ROLES[newRole];

    // RBAC: If the current tab is not allowed for the new role, automatically navigate to their recommended tab
    if (!roleInfo.allowedTabs.includes(currentTab)) {
      setCurrentTab(roleInfo.recommendedTab);
      showToast(`Switched to ${roleInfo.name} (${roleInfo.badge}). Redirected to authorized view: ${roleInfo.recommendedTab}.`, 'info');
    } else {
      showToast(`Switched active profile to ${roleInfo.name} (${roleInfo.title}).`, 'info');
    }
  };

  const handleNavigate = (tab: NavTab, target?: string) => {
    const roleInfo = USER_ROLES[currentRole];
    // RBAC Guard
    if (!roleInfo.allowedTabs.includes(tab)) {
      showToast(`Access Restricted: The ${roleInfo.badge} role does not have permission to access ${tab}.`, 'warning');
      return;
    }
    setCurrentTab(tab);
    setTargetId(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setIsLoggedOut(true);
    showToast('SunPower user session terminated.', 'info');
  };

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setIsLoggedOut(false);
    const roleInfo = USER_ROLES[role];
    setCurrentTab(roleInfo.recommendedTab);
    showToast(`Welcome back, ${roleInfo.name}!`, 'success');
  };

  const handleResetData = () => {
    if (window.confirm('Reset application demonstration data to default state?')) {
      DataService.resetToDefaults();
      refreshNotifications();
      showToast('Demo data restored to clean state.', 'info');
      setTimeout(() => window.location.reload(), 400);
    }
  };

  // Badges for sidebar
  const projects = DataService.getProjects();
  const quotations = DataService.getQuotations();
  const inventory = DataService.getInventory();
  const tickets = DataService.getServiceTickets();

  const activeProjectsCount = projects.filter(p => p.stage !== 'Completed').length;
  const pendingQuotesCount = quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length;
  const lowStockCount = inventory.filter(i => i.quantity <= i.minStockAlert).length;
  const openTicketsCount = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;

  // Render Lock/Login Screen if session is logged out
  if (isLoggedOut) {
    return <SunPowerLockScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#292724] flex">
      {/* Sidebar Navigation - Styled in #0F172A Midnight Slate with RBAC filtering */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentRole={currentRole}
        counts={{
          activeProjects: activeProjectsCount,
          pendingQuotes: pendingQuotesCount,
          lowStock: lowStockCount,
          openTickets: openTicketsCount,
          pendingDispatch: 3
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* Top Navigation Bar with Role Selector & Logout */}
        <TopBar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigateTab={(tab) => handleNavigate(tab)}
          onResetData={handleResetData}
          notifications={notifications}
          onRefreshNotifications={refreshNotifications}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          onLogout={handleLogout}
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
              onOpenSiteSurvey={() => setIsGlobalSurveyOpen(true)}
            />
          )}

          {currentTab === 'quotations' && (
            <QuotationsPage
              onNavigateTab={handleNavigate}
              initialQuotationId={targetId}
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
        onSaved={() => {
          refreshNotifications();
          showToast('Site survey technical feasibility recorded successfully.', 'success');
        }}
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
"""

app_dest = os.path.join(FRONTEND_DIR, 'src', 'App.tsx')
with open(app_dest, 'w', encoding='utf-8') as f:
    f.write(app_content)
print("Updated App.tsx successfully.")

print("Layout and App files successfully written.")
