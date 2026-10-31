import React from 'react';
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
