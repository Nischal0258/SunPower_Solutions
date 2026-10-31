import React, { useState, useEffect } from 'react';
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
