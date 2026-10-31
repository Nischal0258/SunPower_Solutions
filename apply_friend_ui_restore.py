"""
Script to restore the friend's original color palette, make sidebar expandable/collapsible,
merge Dr. Singhania profile with expandable menu containing 'Profile Settings' and 'Log Out',
and redesign SignInPage to remove role selection and use mail/password/remember session/forgot password.
"""

import os
import glob

frontend_matches = glob.glob('*solarflow*')
if not frontend_matches:
    raise FileNotFoundError("Could not find frontend directory matching *solarflow*")
FRONTEND_DIR = frontend_matches[0]
print(f"Target frontend directory: {FRONTEND_DIR}")

# ==============================================================================
# 1. Update src/components/auth/SignInPage.tsx
#    - Warm linen background: bg-[#F5F3EF]
#    - Card: bg-[#FFFFFF] border-[#E7E2D9]
#    - Brand: SunPower Pro in #C66B45 and #292724
#    - NO role buttons! Only mail, password, sign in, remember session, forgot password
# ==============================================================================
signin_path = os.path.join(FRONTEND_DIR, 'src', 'components', 'auth', 'SignInPage.tsx')

signin_code = '''import React, { useState } from 'react';
import { Sun, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserRole } from '../../types/roles';

interface SignInPageProps {
  onLogin: (role: UserRole) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('d.singhania@sunpower.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotMsg, setForgotMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sign in as Dr. Singhania (Managing Director) with full access
    onLogin('director');
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotMsg(true);
    setTimeout(() => setForgotMsg(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#292724] flex flex-col justify-center items-center p-4 sm:p-6 relative font-sans">
      {/* Subtle atmospheric ambient warm sun glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DBBA95]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card - Friend's Exact Original Styling */}
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E7E2D9] rounded-2xl shadow-xl p-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C66B45] text-[#FFFFFF] shadow-lg shadow-[#C66B45]/20 mb-3.5 ring-4 ring-[#DBBA95]/20">
            <Sun className="w-8 h-8 text-[#FFFFFF]" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#292724]">SunPower</h1>
            <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#DBBA95]/25 text-[#C66B45] border border-[#DBBA95]/40">
              Pro
            </span>
          </div>
          <p className="text-xs text-[#292724]/70 mt-1.5">
            Solar Installation OS & Operations Platform
          </p>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#292724] tracking-tight">Sign In to Your Account</h2>
          <p className="text-xs text-[#292724]/65 mt-0.5">
            Enter your credentials to access operations management.
          </p>
        </div>

        {/* Forgot Password Notification Banner */}
        {forgotMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Password reset instructions have been dispatched to {email}.</span>
          </div>
        )}

        {/* Sign In Form: Mail, Password, Remember Session, Forgot Password, Sign In */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-[#292724] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#292724]/40 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="singhania@sunpower.in"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] text-xs font-medium focus:outline-none focus:border-[#C66B45] focus:ring-2 focus:ring-[#C66B45]/20 transition-all placeholder:text-[#292724]/30"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-[#292724] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#292724]/40 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] text-xs font-medium focus:outline-none focus:border-[#C66B45] focus:ring-2 focus:ring-[#C66B45]/20 transition-all placeholder:text-[#292724]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-[#292724]/40 hover:text-[#292724] p-0.5 rounded transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Session & Forgot Password Row */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#292724]/75 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#E7E2D9] text-[#C66B45] focus:ring-[#C66B45] cursor-pointer"
              />
              <span className="font-medium">Remember session</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-semibold text-[#C66B45] hover:underline transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-[#FFFFFF] font-bold text-xs shadow-md shadow-[#C66B45]/25 flex items-center justify-center gap-2 transition-all group"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        {/* Footer Guarantee */}
        <div className="mt-8 pt-4 border-t border-[#E7E2D9] flex items-center justify-center gap-2 text-[11px] text-[#292724]/60">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C66B45]" />
          <span>SunPower Enterprise Security • v2.4</span>
        </div>
      </div>
    </div>
  );
};
'''

with open(signin_path, 'w', encoding='utf-8') as f:
    f.write(signin_code)
print("Updated SignInPage.tsx successfully.")

# ==============================================================================
# 2. Update src/components/layout/Sidebar.tsx
#    - Original Palette: bg-[#292724], text-[#FFFFFF], text-[#DBBA95], active bg-[#C66B45]
#    - Expandable and Collapsible Sidebar: isCollapsed (w-64 vs w-20) with toggle button
#    - Merged Dr. Singhania Profile Card with Expandable Menu (Profile Settings & Log Out)
# ==============================================================================
sidebar_path = os.path.join(FRONTEND_DIR, 'src', 'components', 'layout', 'Sidebar.tsx')

sidebar_code = '''import React, { useState } from 'react';
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
  ChevronRight,
  ChevronUp,
  ChevronDown,
  User,
  LogOut,
  Sliders
} from 'lucide-react';
import { ShaderGradientCanvas } from './ShaderGradientCanvas';
import { NavTab, UserRole } from '../../types/roles';

export type { NavTab };

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
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
  onLogout,
  counts
}) => {
  // State for Dr. Singhania Expandable Profile Drawer / Menu
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Original Navigation Items restored with Warehouse
  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number }[] = [
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

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-[#292724]/70 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container - Restored to Friend's Original Espresso/Charcoal Palette (#292724) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-[#292724] text-[#FFFFFF] flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } border-r border-[#292724] shadow-xl lg:shadow-none`}
      >
        {/* Subtle static ShaderGradient atmospheric header backing */}
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

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3.5 space-y-1 overflow-y-auto overflow-x-hidden">
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

                {/* Collapsed Badge Dot */}
                {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C66B45] absolute right-2" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Operator Section: Merged Dr. Singhania Profile with Expandable/Collapsible Menu */}
        <div className="p-3 border-t border-[#FFFFFF]/10 bg-[#292724]/95 relative">
          {/* Expanded Drawer / Menu (Popup above the profile card) */}
          {isProfileMenuOpen && (
            <div className={`absolute ${
              isCollapsed ? 'left-full ml-2 bottom-2 w-56' : 'bottom-full left-3 right-3 mb-2'
            } rounded-xl bg-[#292724] border border-[#FFFFFF]/15 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150`}>
              {/* Profile Details Header */}
              <div className="px-3 py-2 border-b border-[#FFFFFF]/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#DBBA95] text-[#292724] font-bold text-xs flex items-center justify-center shrink-0">
                    DS
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#FFFFFF] truncate">Dr. Singhania</p>
                    <p className="text-[10px] text-[#DBBA95]/80 truncate">Managing Director</p>
                  </div>
                </div>
                <p className="text-[10px] text-[#F5F3EF]/60 mt-1 truncate">d.singhania@sunpower.in</p>
              </div>

              {/* Menu Actions */}
              <div className="py-1 space-y-0.5">
                {/* Profile Settings Option */}
                <button
                  onClick={() => {
                    onSelectTab('settings');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#F5F3EF] hover:bg-[#FFFFFF]/10 hover:text-[#FFFFFF] text-left transition-colors"
                >
                  <User className="w-4 h-4 text-[#DBBA95]" />
                  <span>Profile Settings</span>
                </button>

                {/* Logout Option */}
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 text-left transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Trigger Profile Card (Dr. Singhania) */}
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2.5'
            } rounded-lg bg-[#FFFFFF]/5 hover:bg-[#FFFFFF]/10 border border-[#FFFFFF]/10 hover:border-[#DBBA95]/40 transition-all text-left`}
            title="Dr. Singhania - Click for profile settings & logout"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#DBBA95] text-[#292724] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                DS
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#FFFFFF] truncate">Dr. Singhania</p>
                  <p className="text-[10px] text-[#DBBA95]/80 truncate">Managing Director</p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                <div className="w-2 h-2 rounded-full bg-[#D9A441]" title="Active Session" />
                {isProfileMenuOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[#DBBA95]" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-[#DBBA95]/70" />
                )}
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
'''

with open(sidebar_path, 'w', encoding='utf-8') as f:
    f.write(sidebar_code)
print("Updated Sidebar.tsx successfully.")

# ==============================================================================
# 3. Update src/App.tsx
#    - Manage isSidebarCollapsed state
#    - Adjust main wrapper padding: lg:pl-64 when expanded, lg:pl-20 when collapsed
#    - Pass isCollapsed and onToggleCollapse to Sidebar
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

function AppContent() {
  const { showToast } = useToast();

  // Load session from localStorage or default to signed in as Dr. Singhania
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
    // Default active session for Dr. Singhania
    return {
      role: 'director',
      name: 'Dr. Singhania',
      email: 'd.singhania@sunpower.in',
      title: 'Managing Director',
      badge: 'Executive',
      avatarColor: 'bg-purple-600'
    };
  });

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    try {
      const storedTab = localStorage.getItem(STORAGE_TAB_KEY) as NavTab | null;
      if (storedTab) return storedTab;
    } catch {}
    return 'dashboard';
  });

  // Sidebar Expandable / Collapsible State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [targetId, setTargetId] = useState<string | undefined>(undefined);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGlobalSurveyOpen, setIsGlobalSurveyOpen] = useState(false);
  const [notifications, setNotifications] = useState(DataService.getNotifications());

  const currentRole: UserRole = session?.role || 'director';

  const refreshNotifications = () => {
    setNotifications(DataService.getNotifications());
  };

  const handleNavigate = (tab: NavTab, target?: string) => {
    setCurrentTab(tab);
    setTargetId(target);
    try {
      localStorage.setItem(STORAGE_TAB_KEY, tab);
    } catch (e) {
      console.warn('Failed to store active tab:', e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (role: UserRole = 'director') => {
    const newSession: AuthSession = {
      role: 'director',
      name: 'Dr. Singhania',
      email: 'd.singhania@sunpower.in',
      title: 'Managing Director',
      badge: 'Executive',
      avatarColor: 'bg-purple-600'
    };

    setSession(newSession);
    setCurrentTab('dashboard');

    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newSession));
      localStorage.setItem(STORAGE_TAB_KEY, 'dashboard');
    } catch (e) {
      console.warn('Failed to persist session:', e);
    }

    showToast('Signed in successfully as Dr. Singhania.', 'success');
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

  const handleResetData = () => {
    if (window.confirm('Reset application demonstration data to default state?')) {
      DataService.resetToDefaults();
      refreshNotifications();
      showToast('Demo data restored to clean state.', 'info');
      setTimeout(() => window.location.reload(), 400);
    }
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

  // Unauthenticated / Logged Out View - Render SignInPage with friend's warm palette
  if (!session) {
    return <SignInPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#292724] flex font-sans">
      {/* Sidebar Navigation - Expandable and Collapsible */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={handleLogout}
        currentRole={currentRole}
        counts={{
          activeProjects: activeProjectsCount,
          pendingQuotes: pendingQuotesCount,
          lowStock: lowStockCount,
          openTickets: openTicketsCount,
          pendingDispatch: 3
        }}
      />

      {/* Main Content Area - Expands or contracts dynamically with the sidebar */}
      <div className={`flex-1 ${
        isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      } flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out`}>
        {/* Top Navigation Bar */}
        <TopBar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigateTab={(tab) => handleNavigate(tab)}
          onResetData={handleResetData}
          notifications={notifications}
          onRefreshNotifications={refreshNotifications}
          currentRole={currentRole}
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
        onSubmit={() => {
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
'''

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_code)
print("Updated App.tsx successfully.")

# ==============================================================================
# 4. Update src/components/layout/TopBar.tsx
#    - Style profile menu cleanly in friend's palette: #FFFFFF, #E7E2D9, #292724, #C66B45
#    - Display Dr. Singhania, Profile Settings, Company Credentials, Reset Demo, and Logout
# ==============================================================================
topbar_path = os.path.join(FRONTEND_DIR, 'src', 'components', 'layout', 'TopBar.tsx')

topbar_code = '''import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  RefreshCw,
  Building2,
  ExternalLink,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';
import { NavTab, UserRole } from '../../types/roles';
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
  currentRole?: UserRole;
  onLogout?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenSearch,
  onNavigateTab,
  onResetData,
  notifications,
  onRefreshNotifications,
  onLogout
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Operations Dashboard', subtitle: 'Priority tasks and active installations' },
    customers: { title: 'Customer & Lead Ledger', subtitle: 'Manage solar enquiries, site details & history' },
    quotations: { title: 'Quotations & Bill of Materials', subtitle: 'On-grid, off-grid and hybrid solar proposals' },
    warehouse: { title: 'Warehouse Dispatch & Logistics', subtitle: 'Order verification, inverter barcode scanning & warranty clock' },
    inventory: { title: 'Warehouse Inventory & Stock', subtitle: 'Panels, inverters, batteries and balance of system' },
    installations: { title: 'Installation Management', subtitle: 'Site surveys, execution phases and commissioning' },
    warranties: { title: 'Warranty & Serial Tracking', subtitle: '20-year panels and 2-year inverter/battery registry' },
    tickets: { title: 'Service Tickets & Support', subtitle: 'Customer service, field diagnostics and warranty claims' },
    reports: { title: 'Business Reports & Analytics', subtitle: 'Turnover, completion velocity and profitability' },
    settings: { title: 'System Settings', subtitle: 'Company credentials, team roster and pricing defaults' }
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

      {/* Right zone: Search, Notifications, Dr. Singhania Profile Dropdown */}
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

        {/* Dr. Singhania Profile Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#E7E2D9] hover:bg-[#F5F3EF] text-left transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-[#292724] text-[#DBBA95] font-bold text-xs flex items-center justify-center">
              DS
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-[#292724] leading-tight">Dr. Singhania</p>
              <p className="text-[10px] text-[#292724]/60 leading-tight">Managing Director</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#292724]/50 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#FFFFFF] border border-[#E7E2D9] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-[#E7E2D9] bg-[#F5F3EF]/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#292724] text-[#DBBA95] font-bold text-xs flex items-center justify-center">
                    DS
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#292724]">Dr. Singhania</p>
                    <p className="text-[11px] text-[#292724]/65">d.singhania@sunpower.in</p>
                  </div>
                </div>
              </div>

              <div className="py-1">
                {/* Profile Settings */}
                <button
                  onClick={() => {
                    onNavigateTab('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-[#292724] hover:bg-[#F5F3EF] text-left flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-[#C66B45]" />
                  <span>Profile Settings</span>
                </button>

                {/* Company Credentials */}
                <button
                  onClick={() => {
                    onNavigateTab('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-[#292724] hover:bg-[#F5F3EF] text-left flex items-center gap-2.5 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-[#292724]/60" />
                  <span>Company Credentials</span>
                </button>

                {/* Reset Demo Data */}
                <button
                  onClick={() => {
                    onResetData();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-xs text-[#C66B45] hover:bg-[#C66B45]/10 text-left flex items-center gap-2.5 font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-[#C66B45]" />
                  <span>Reset Demo Data</span>
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
print("Updated TopBar.tsx successfully.")

print("All components restored and updated with friend's palette and requested features!")
