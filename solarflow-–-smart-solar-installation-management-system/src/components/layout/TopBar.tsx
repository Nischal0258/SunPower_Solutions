import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  RefreshCw,
  Check,
  Building2,
  ExternalLink
} from 'lucide-react';
import { NavTab } from './Sidebar';
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
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenSearch,
  onNavigateTab,
  onResetData,
  notifications,
  onRefreshNotifications
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Operations Dashboard', subtitle: 'Priority tasks and active installations' },
    customers: { title: 'Customer & Lead Ledger', subtitle: 'Manage solar enquiries, site details & history' },
    quotations: { title: 'Quotations & Bill of Materials', subtitle: 'On-grid, off-grid and hybrid solar proposals' },
    inventory: { title: 'Warehouse Inventory & Stock', subtitle: 'Panels, inverters, batteries and balance of system' },
    installations: { title: 'Installation Management', subtitle: 'Site surveys, execution phases and commissioning' },
    warranties: { title: 'Warranty & Serial Tracking', subtitle: '20-year panels and 2-year inverter/battery registry' },
    tickets: { title: 'Service Tickets & Support', subtitle: 'Customer service, field diagnostics and warranty claims' },
    reports: { title: 'Business Reports & Analytics', subtitle: 'Turnover, completion velocity and profitability' },
    settings: { title: 'System Settings', subtitle: 'Company credentials, team roster and pricing defaults' }
  };

  const currentInfo = titles[currentTab] || { title: 'SolarFlow', subtitle: 'Solar Management System' };
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

      {/* Right zone: Search, Notifications, User */}
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
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#E7E2D9]">
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

        {/* User / Org Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#E7E2D9] hover:bg-[#F5F3EF] text-left transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-[#292724] text-[#DBBA95] font-bold text-xs flex items-center justify-center">
              SR
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-[#292724] leading-tight">Sunil Rao</p>
              <p className="text-[10px] text-[#292724]/60 leading-tight">SolarFlow HQ</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#FFFFFF] border border-[#E7E2D9] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#E7E2D9]">
                <p className="text-xs font-bold text-[#292724]">SolarFlow Technologies</p>
                <p className="text-[11px] text-[#292724]/60">HQ: Pune & Bengaluru Units</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigateTab('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-[#292724] hover:bg-[#F5F3EF] text-left flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-[#292724]/60" />
                  <span>Company Credentials</span>
                </button>

                <button
                  onClick={() => {
                    onResetData();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-[#C66B45] hover:bg-[#C66B45]/10 text-left flex items-center gap-2 font-medium"
                >
                  <RefreshCw className="w-4 h-4 text-[#C66B45]" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
