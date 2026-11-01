import React from 'react';
import {
  Plus,
  Download,
  Users,
  FileText,
  Package,
  Sun,
  LifeBuoy,
  CheckCircle2,
  Clock,
  ArrowRight,
  Calendar,
  AlertTriangle,
  Zap,
  PhoneCall,
  Check
} from 'lucide-react';
import { NavTab, UserRole } from '../types/roles';
import { StatusBadge } from '../components/common/StatusBadge';
import { DataService } from '../services/dataService';
import { BusinessTask, InstallationProject, Quotation, ServiceTicket, InventoryItem, CustomerOrder } from '../types';
import { TECHNICIANS } from '../services/dataService';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { Truck } from 'lucide-react';

interface DashboardPageProps {
  onNavigateTab: (tab: NavTab, targetId?: string) => void;
  onOpenNewProject: () => void;
    onOpenNewQuotation: () => void;
  onOpenNewInventory: () => void;
  onOpenNewTicket: () => void;
  userName?: string;
  currentRole?: UserRole;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onOpenNewProject,
    onOpenNewQuotation,
  onOpenNewInventory,
  onOpenNewTicket,
  userName,
  currentRole
}) => {
  const [tasks, setTasks] = React.useState<BusinessTask[]>(DataService.getTasks());
  const [projects, setProjects] = React.useState<InstallationProject[]>(DataService.getProjects());
  const [quotations, setQuotations] = React.useState<Quotation[]>(DataService.getQuotations());
  const [inventory, setInventory] = React.useState<InventoryItem[]>(DataService.getInventory());
  const [tickets, setTickets] = React.useState<ServiceTicket[]>(DataService.getServiceTickets());
  const [activities, setActivities] = React.useState(DataService.getActivities());
  const [customerOrders, setCustomerOrders] = React.useState<CustomerOrder[]>(() => DataService.getCustomerOrders());
  
  // Approval & Dispatch Modal State
  const { showToast } = useToast();
  const [selectedOrderForApproval, setSelectedOrderForApproval] = React.useState<CustomerOrder | null>(null);
  const [selectedTechId, setSelectedTechId] = React.useState('TECH-001');
  const [scheduledDate, setScheduledDate] = React.useState('2026-11-01');
  const [dispatchNotes, setDispatchNotes] = React.useState('Conduct shadow profiling, azimuth verification, and RCC anchor pull test.');

  const refreshDashboard = React.useCallback(() => {
    setTasks(DataService.getTasks());
    setProjects(DataService.getProjects());
    setQuotations(DataService.getQuotations());
    setInventory(DataService.getInventory());
    setTickets(DataService.getServiceTickets());
    setActivities(DataService.getActivities());
    setCustomerOrders(DataService.getCustomerOrders());
  }, []);

  React.useEffect(() => {
    refreshDashboard();
    window.addEventListener('sunpower_data_updated', refreshDashboard);
    window.addEventListener('storage', refreshDashboard);
    return () => {
      window.removeEventListener('sunpower_data_updated', refreshDashboard);
      window.removeEventListener('storage', refreshDashboard);
    };
  }, [refreshDashboard]);


  const handleOpenApproveModal = (order: CustomerOrder) => {
    setSelectedOrderForApproval(order);
    setSelectedTechId(TECHNICIANS[0]?.id || 'TECH-001');
    setScheduledDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setDispatchNotes('Conduct shadow profiling, azimuth verification, and RCC anchor pull test.');
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForApproval) return;

    DataService.approveOrderAndDispatchTech(
      selectedOrderForApproval.id,
      selectedTechId,
      scheduledDate,
      dispatchNotes
    );

    showToast(`Order ${selectedOrderForApproval.id} approved! Field technician dispatched for site survey.`, 'success');
    setSelectedOrderForApproval(null);
    refreshDashboard();
  };

  const pendingOrders = customerOrders.filter(o => o.status === 'Pending Approval');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = userName || 'Dr. Singhania';

  // Metrics
  const activeProjectsCount = projects.filter(p => p.stage !== 'Completed').length;
  const pendingQuotesCount = quotations.filter(q => q.status === 'Sent' || q.status === 'Draft').length;
  const lowStockCount = inventory.filter(i => i.quantity <= i.minStockAlert).length;
  const openTicketsCount = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length;

  // Toggle task
  const handleToggleTask = (taskId: string) => {
    DataService.toggleTask(taskId);
    setTasks(DataService.getTasks());
  };

  const handleTaskAction = (task: BusinessTask) => {
    switch (task.actionType) {
      case 'approve_quote':
        onNavigateTab('quotations', task.targetId);
        break;
      case 'assign_tech':
      case 'inspect':
        onNavigateTab('installations', task.targetId);
        break;
      case 'reorder':
        onNavigateTab('inventory', task.targetId);
        break;
      case 'resolve_ticket':
        onNavigateTab('tickets', task.targetId);
        break;
      case 'call':
        onNavigateTab('customers', task.targetId);
        break;
      default:
        onNavigateTab('dashboard');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Customer Orders Awaiting Manager Approval Banner */}
      {pendingOrders.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-5 shadow-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-bold text-sm text-slate-900">
                Customer Solar Orders Awaiting Manager Approval ({pendingOrders.length})
              </h3>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              Pipeline Action Required
            </span>
          </div>

          <div className="space-y-2.5">
            {pendingOrders.map(order => (
              <div
                key={order.id}
                className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{order.id}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-bold text-slate-800">{order.customerName}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-semibold text-slate-700">{order.capacityKw} kW {order.systemType}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Pending Approval
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Installation Premises: {order.installationAddress}, {order.city} · Net Contract Value: <strong className="text-slate-900 font-mono">₹{order.netPayable.toLocaleString('en-IN')}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenApproveModal(order)}
                  className="px-4 py-2 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Order</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Welcome & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D9A441]" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {getGreeting()}, {displayName}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            You have <strong className="text-slate-900 font-semibold">{tasks.filter(t => !t.completed).length} priority tasks</strong> scheduled today across 3 active installation sites.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              DataService.exportFinancialYearDataCSV();
              showToast('Financial Year (FY 2025-26) data exported to CSV successfully.', 'success');
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs active:scale-[0.99] whitespace-nowrap cursor-pointer"
            title="Download Complete FY 2025-26 CSV Report"
          >
            <Download className="w-4 h-4 text-[#C66B45]" />
            <span>Download FY Data</span>
          </button>

          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C66B45] text-white text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm active:scale-[0.99] whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* 4 Important Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Projects */}
        <div
          onClick={() => onNavigateTab('installations')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Active Projects</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
              <Sun className="w-4 h-4 text-[#D9A441]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {activeProjectsCount}
            </span>
            <span className="text-xs text-slate-500 font-medium group-hover:text-[#C66B45] flex items-center gap-1 transition-colors">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {projects.filter(p => p.stage === 'Installation In Progress').length} in active field installation
          </p>
        </div>

        {/* Card 2: Pending Quotations */}
        <div
          onClick={() => onNavigateTab('quotations')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Pending Quotations</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
              <FileText className="w-4 h-4 text-slate-900" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {pendingQuotesCount}
            </span>
            <span className="text-xs text-slate-500 font-medium group-hover:text-[#C66B45] flex items-center gap-1 transition-colors">
              Review <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Awaiting client sign-off or survey
          </p>
        </div>

        {/* Card 3: Low Stock Items */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Low Stock Items</span>
            <div className="w-8 h-8 rounded-lg bg-[#C66B45]/10 flex items-center justify-center text-[#C66B45]">
              <AlertTriangle className="w-4 h-4 text-[#C66B45]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-[#C66B45] font-mono tabular-nums">
              {lowStockCount}
            </span>
            <span className="text-xs text-slate-500 font-medium group-hover:text-[#C66B45] flex items-center gap-1 transition-colors">
              Restock <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Below safety buffer threshold
          </p>
        </div>

        {/* Card 4: Open Service Tickets */}
        <div
          onClick={() => onNavigateTab('tickets')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Open Service Tickets</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
              <LifeBuoy className="w-4 h-4 text-[#D9A441]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {openTicketsCount}
            </span>
            <span className="text-xs text-slate-500 font-medium group-hover:text-[#C66B45] flex items-center gap-1 transition-colors">
              Dispatch <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            1 urgent warranty repair assigned
          </p>
        </div>
      </div>

      {/* Grid: A. Today's Tasks & C. Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section A: Today's Tasks (2 Columns on large screens) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C66B45]" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Today's Tasks</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {tasks.filter(t => t.completed).length} of {tasks.length} Completed
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-slate-50/60 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        task.completed
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'border-slate-900/30 hover:border-[#C66B45]'
                      }`}
                      aria-label="Toggle task completion"
                    >
                      {task.completed && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {task.title}
                        </span>
                        {task.priority === 'Urgent' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#C66B45]/15 text-[#C66B45]">
                            URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-900/65 mt-0.5">
                        {task.targetDescription} · <span className="font-mono text-amber-600 font-medium">{task.dueDate}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleTaskAction(task)}
                      className="px-3 py-1.5 rounded-md text-[11px] font-semibold bg-slate-50 hover:bg-slate-200 text-slate-900 border border-slate-200 transition-colors"
                    >
                      Take Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Tasks update automatically based on survey dates, stock thresholds & customer approvals.</span>
          </div>
        </div>

        {/* Section C: Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D9A441]" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Quick Actions</h3>
              </div>
              <span className="text-[11px] text-slate-400">Common Workflows</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => onNavigateTab('customers')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-[#C66B45] group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Customer Ledger</span>
                    <span className="text-[11px] text-slate-500">Review registered accounts & site specs</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-900/40 group-hover:text-slate-900" />
              </button>

              <button
                onClick={onOpenNewQuotation}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-[#C66B45] group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Create Quotation</span>
                    <span className="text-[11px] text-slate-500">Generate BOM & price quote</span>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-900/40 group-hover:text-slate-900" />
              </button>

              <button
                onClick={onOpenNewInventory}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-[#C66B45] group-hover:text-white transition-colors">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Add Inventory Item</span>
                    <span className="text-[11px] text-slate-500">Register panels, inverters or BOS</span>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-900/40 group-hover:text-slate-900" />
              </button>

              <button
                onClick={onOpenNewProject}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-[#C66B45] group-hover:text-white transition-colors">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Schedule Installation</span>
                    <span className="text-[11px] text-slate-500">Assign crew & survey dates</span>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-900/40 group-hover:text-slate-900" />
              </button>

              <button
                onClick={onOpenNewTicket}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-[#C66B45] group-hover:text-white transition-colors">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Create Service Ticket</span>
                    <span className="text-[11px] text-slate-500">Log customer fault or claim</span>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-900/40 group-hover:text-slate-900" />
              </button>
            </div>
          </div>

          {/* Minimalist Progress Indicator as requested */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Monthly Commissioning Target</span>
              <span className="font-mono font-bold text-slate-900">41 kW / 50 kW</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-[#C66B45] rounded-full" style={{ width: '82%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: B. Recent Projects & D. Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section B: Recent Projects (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#D9A441]" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Projects</h3>
            </div>
            <button
              onClick={() => onNavigateTab('installations')}
              className="text-xs font-medium text-[#C66B45] hover:underline flex items-center gap-1"
            >
              <span>View All ({projects.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-2.5 font-medium">Project ID</th>
                  <th className="pb-2.5 font-medium">Customer</th>
                  <th className="pb-2.5 font-medium">System Capacity</th>
                  <th className="pb-2.5 font-medium">Installation Status</th>
                  <th className="pb-2.5 font-medium">Technician</th>
                  <th className="pb-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {projects.slice(0, 4).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">{p.projectId}</td>
                    <td className="py-3 font-medium text-slate-900">
                      <div>{p.customerName}</div>
                      <div className="text-[11px] text-slate-500">{p.customerAddress.split(',')[1] || p.customerAddress.split(',')[0]}</div>
                    </td>
                    <td className="py-3 font-mono text-slate-900">
                      {p.capacityKw} kW <span className="text-slate-500">({p.systemType})</span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={p.stage} type="stage" />
                    </td>
                    <td className="py-3 text-slate-700">
                      {p.technicianName || 'Unassigned'}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onNavigateTab('installations', p.id)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-900 bg-slate-50 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section D: Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-900" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Activity</h3>
            </div>
            <span className="text-[11px] text-slate-400">Audit Feed</span>
          </div>

          <div className="space-y-4">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 tracking-tight">{act.title}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{act.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>{act.timestamp}</span>
                    <span>·</span>
                    <span>{act.actor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Assign Field Technician & Dispatch Modal */}
      {selectedOrderForApproval && (
        <Modal
          isOpen={!!selectedOrderForApproval}
          onClose={() => setSelectedOrderForApproval(null)}
          title={`Approve & Dispatch: ${selectedOrderForApproval.id}`}
          subtitle="Assign certified field technician for on-site technical survey & feasibility sign-off"
          maxWidth="lg"
        >
          <form onSubmit={handleConfirmDispatch} className="space-y-4 text-xs">
            {/* Customer Summary Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{selectedOrderForApproval.customerName}</span>
                <span className="font-mono text-[11px] text-[#C66B45] font-bold">
                  {selectedOrderForApproval.capacityKw} kW {selectedOrderForApproval.systemType}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Premises: {selectedOrderForApproval.installationAddress}, {selectedOrderForApproval.city}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Customer Phone: {selectedOrderForApproval.contactNumber} · Email: {selectedOrderForApproval.customerEmail}
              </p>
            </div>

            {/* Technician Selection */}
            <div>
              <label className="block font-semibold text-slate-900 mb-1">
                Assign Field Lead Technician *
              </label>
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#C66B45]"
              >
                <option value="TECH-001">Rajesh & Team — Lead Field Installation Crew (Pune Unit)</option>
                {TECHNICIANS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.certifications} ({t.activeProjects} active projects)
                  </option>
                ))}
              </select>
            </div>

            {/* Scheduled Survey Date */}
            <div>
              <label className="block font-semibold text-slate-900 mb-1">
                Scheduled Survey / Inspection Date *
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-mono focus:outline-none focus:border-[#C66B45]"
              />
            </div>

            {/* Field Instructions & Notes */}
            <div>
              <label className="block font-semibold text-slate-900 mb-1">
                Technical Survey Notes & Checklist Directives
              </label>
              <textarea
                rows={3}
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                placeholder="Specify requirements for azimuth measurement, water tank clearance, shadow profiling, or DISCOM earthing..."
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#C66B45]"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedOrderForApproval(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#C66B45] hover:bg-[#C66B45]/90 text-white font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Truck className="w-4 h-4" />
                <span>Confirm & Dispatch Technician</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
