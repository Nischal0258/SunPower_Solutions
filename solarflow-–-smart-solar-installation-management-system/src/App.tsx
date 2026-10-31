import React, { useState, useEffect } from 'react';
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
import { DEMO_CUSTOMERS } from './types';

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

  useEffect(() => {
    const handleGlobalUpdate = () => {
      refreshNotifications();
    };
    window.addEventListener('sunpower_data_updated', handleGlobalUpdate);
    window.addEventListener('storage', handleGlobalUpdate);
    return () => {
      window.removeEventListener('sunpower_data_updated', handleGlobalUpdate);
      window.removeEventListener('storage', handleGlobalUpdate);
    };
  }, []);

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

  const handleLogin = (role: UserRole = 'manager', userEmail?: string) => {
    const rInfo = USER_ROLES[role] || USER_ROLES.manager;
    let userName = rInfo.name;
    let emailToUse = userEmail || `${role}@gmail.com`;

    if (role === 'customer') {
      const activePersonaId = localStorage.getItem('sunpower_active_customer_persona') || 'CUST-001';
      const persona = DEMO_CUSTOMERS.find(c => c.id === activePersonaId || (emailToUse && c.email.toLowerCase() === emailToUse.toLowerCase()))
        || DataService.getCustomers().find(c => c.id === activePersonaId || (emailToUse && c.email.toLowerCase() === emailToUse.toLowerCase()))
        || DEMO_CUSTOMERS[0];
      userName = persona.name;
      emailToUse = persona.email;
    }

    const newSession: AuthSession = {
      role,
      name: userName,
      email: emailToUse,
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

    showToast(`Signed in successfully as ${userName} (${rInfo.title}).`, 'success');
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
              userName={session.name}
              currentRole={currentRole}
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
