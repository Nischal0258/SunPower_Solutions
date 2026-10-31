import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  Sun,
  ShieldCheck,
  LifeBuoy,
  BarChart3,
  Settings,
  X
} from 'lucide-react';
import { ShaderGradientCanvas } from './ShaderGradientCanvas';

export type NavTab = 
  | 'dashboard'
  | 'customers'
  | 'quotations'
  | 'inventory'
  | 'installations'
  | 'warranties'
  | 'tickets'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  counts?: {
    activeProjects?: number;
    pendingQuotes?: number;
    lowStock?: number;
    openTickets?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  counts
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'quotations', label: 'Quotations', icon: FileText, badge: counts?.pendingQuotes },
    { id: 'inventory', label: 'Inventory', icon: Package, badge: counts?.lowStock },
    { id: 'installations', label: 'Installations', icon: Sun, badge: counts?.activeProjects },
    { id: 'warranties', label: 'Warranties', icon: ShieldCheck },
    { id: 'tickets', label: 'Service Tickets', icon: LifeBuoy, badge: counts?.openTickets },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-[#292724]/70 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#292724] text-[#FFFFFF] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-0 -translate-x-full lg:translate-x-0'
        } border-r border-[#292724] shadow-xl lg:shadow-none`}
      >
        {/* Subtle static ShaderGradient atmospheric header backing */}
        <div className="relative overflow-hidden border-b border-[#292724]/60 px-5 py-5 flex items-center justify-between">
          <ShaderGradientCanvas className="opacity-15" />
          
          <div className="flex items-center gap-3 relative z-10">
            {/* SolarFlow Mark */}
            <div className="w-9 h-9 rounded-lg bg-[#C66B45] flex items-center justify-center text-[#FFFFFF] shadow-sm">
              <Sun className="w-5 h-5 text-[#FFFFFF]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-[#FFFFFF]">SolarFlow</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-[#DBBA95]/20 text-[#DBBA95]">Pro</span>
              </div>
              <p className="text-[11px] text-[#DBBA95]/80 font-medium tracking-tight">Solar Installation OS</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-[#DBBA95] hover:text-[#FFFFFF] hover:bg-[#292724]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-[#C66B45] text-[#FFFFFF] shadow-sm font-semibold'
                    : 'text-[#F5F3EF]/75 hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#FFFFFF]' : 'text-[#DBBA95]'
                    }`}
                  />
                  <span className="tracking-tight">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-md font-mono ${
                      isActive
                        ? 'bg-[#FFFFFF]/25 text-[#FFFFFF]'
                        : 'bg-[#DBBA95]/20 text-[#DBBA95]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Operator Pill */}
        <div className="p-3 border-t border-[#FFFFFF]/10 bg-[#292724]/90">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#FFFFFF]/5 border border-[#FFFFFF]/10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#DBBA95] text-[#292724] font-bold text-xs flex items-center justify-center shrink-0">
                SR
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#FFFFFF] truncate">Sunil Rao</p>
                <p className="text-[10px] text-[#DBBA95]/80 truncate">Operations Lead</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#D9A441]" title="System Active" />
          </div>
        </div>
      </aside>
    </>
  );
};
