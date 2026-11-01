import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  Phone,
  Calendar,
  Edit,
  ArrowRight,
  Lock,
  Wrench,
  CheckCircle
} from 'lucide-react';
import { DataService, TECHNICIANS } from '../services/dataService';
import { ServiceTicket, ServiceTicketPriority, ServiceTicketStatus, Customer } from '../types';
import { UserRole } from '../types/roles';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { NavTab } from '../components/layout/Sidebar';
import { HelpdeskInboxView } from '../components/support/HelpdeskInboxView';

interface ServiceTicketsPageProps {
  onNavigateTab: (tab: NavTab, targetId?: string) => void;
  initialTicketIdOrSerial?: string;
  currentRole?: UserRole;
}

export const ServiceTicketsPage: React.FC<ServiceTicketsPageProps> = ({
  onNavigateTab,
  initialTicketIdOrSerial,
  currentRole = 'support'
}) => {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<ServiceTicket[]>(DataService.getServiceTickets());
  const [customers] = useState<Customer[]>(DataService.getCustomers());
  const [warranties] = useState(DataService.getWarranties());

  const [searchQuery, setSearchQuery] = useState(initialTicketIdOrSerial || '');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [activeView, setActiveView] = useState<'rma' | 'helpdesk'>('rma');

  // Strict Role Definitions
  const isTechnician = currentRole === 'technician';
  const isSupport = currentRole === 'support';
  const isManager = currentRole === 'manager' || currentRole === 'director';

  useEffect(() => {
    refreshList();
    const handleUpdate = () => refreshList();
    window.addEventListener('sunpower_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sunpower_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Selected Ticket for detail & resolution
  const [activeTicket, setActiveTicket] = useState<ServiceTicket | null>(() => {
    if (initialTicketIdOrSerial) {
      return DataService.getServiceTickets().find(t => 
        t.id === initialTicketIdOrSerial || 
        t.ticketNumber === initialTicketIdOrSerial ||
        t.productSerial === initialTicketIdOrSerial
      ) || null;
    }
    return null;
  });

  // Create Ticket Modal State (Available for Support Agent and Manager only)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formIssue, setFormIssue] = useState('');
  const [formPriority, setFormPriority] = useState<ServiceTicketPriority>('High');
  const [formTechId, setFormTechId] = useState('');
  const [formVisitDate, setFormVisitDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal Assignment State (Available for Support Agent and Manager only)
  const [assignTechId, setAssignTechId] = useState('');
  const [assignVisitDate, setAssignVisitDate] = useState('');

  // Resolution Notes in Detail View
  const [resolutionText, setResolutionText] = useState('');

  // Sync active ticket assignment and resolution notes
  useEffect(() => {
    if (activeTicket) {
      setAssignTechId(activeTicket.assignedTechnicianId || TECHNICIANS[0]?.id || '');
      setAssignVisitDate(activeTicket.scheduledVisitDate || new Date().toISOString().split('T')[0]);
      setResolutionText(activeTicket.resolutionNotes || '');
    }
  }, [activeTicket?.id]);

  const refreshList = () => {
    const list = DataService.getServiceTickets();
    setTickets(list);
    if (activeTicket) {
      const refreshed = list.find(t => t.id === activeTicket.id) || null;
      setActiveTicket(refreshed);
    }
  };

  const handleOpenCreate = () => {
    if (isTechnician) {
      showToast('Field Technicians cannot create new service tickets.', 'error');
      return;
    }
    setFormCustomerId(customers[0]?.id || '');
    setFormSerial('');
    setFormIssue('');
    setFormPriority('High');
    setFormTechId(TECHNICIANS[0]?.id || '');
    setFormVisitDate(new Date().toISOString().split('T')[0]);
    setIsCreateOpen(true);
  };

  // Warranty eligibility check for current serial
  const matchedWarranty = warranties.find(w => w.serialNumber.toLowerCase() === formSerial.trim().toLowerCase());

  const handleSaveTicket = (e: React.FormEvent) => {
    e.preventDefault();

    if (isTechnician) {
      showToast('Field Technicians are not authorized to create tickets.', 'error');
      return;
    }

    if (!formIssue.trim()) {
      showToast('Please enter an issue description.', 'error');
      return;
    }

    const customer = customers.find(c => c.id === formCustomerId) || customers[0];
    const tech = TECHNICIANS.find(t => t.id === formTechId);

    const created = DataService.saveServiceTicket({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: `${customer.address}, ${customer.city}`,
      projectId: matchedWarranty?.projectId || 'PRJ-2026-042',
      productSerial: formSerial.trim().toUpperCase() || undefined,
      productName: matchedWarranty?.productName || 'Solar Rooftop System',
      productCategory: matchedWarranty?.productCategory || 'Solar Panels',
      isWarrantyEligible: matchedWarranty ? matchedWarranty.status !== 'Expired' : true,
      issueDescription: formIssue.trim(),
      priority: formPriority,
      status: formTechId ? 'Assigned' : 'Open',
      assignedTechnicianId: tech?.id,
      assignedTechnicianName: tech?.name,
      scheduledVisitDate: formVisitDate
    });

    showToast(`Service Ticket ${created.ticketNumber} opened successfully.`, 'success');
    setIsCreateOpen(false);
    refreshList();
    setActiveTicket(created);
  };

  const handleAssignTechnician = () => {
    if (!activeTicket) return;
    if (isTechnician) {
      showToast('Field Technicians cannot assign service tickets.', 'error');
      return;
    }
    const tech = TECHNICIANS.find(t => t.id === assignTechId);
    if (!tech) {
      showToast('Please select a technician to assign.', 'error');
      return;
    }
    const updated = DataService.assignTicketTechnician(activeTicket.id, tech.id, tech.name, assignVisitDate);
    if (updated) {
      showToast(`Ticket ${activeTicket.ticketNumber} assigned to ${tech.name}.`, 'success');
      refreshList();
    }
  };

  const handleUpdateStatus = (newStatus: ServiceTicketStatus) => {
    if (!activeTicket) return;

    // Strict Role Enforcement:
    // 1. Field Technician: Can only perform "In Progress" (on-site inspection) and "Resolved" (completed repairs).
    if (isTechnician) {
      if (newStatus !== 'In Progress' && newStatus !== 'Resolved') {
        showToast('Field Technicians can only mark tickets as "In Progress" or "Resolved".', 'error');
        return;
      }
    }

    // 2. Support Agent: Opens and assigns tickets. Cannot mark "In Progress" or "Resolved" (on-site technician job).
    // Can only mark "Closed" once the ticket is already marked "Resolved" by the technician.
    if (isSupport) {
      if (newStatus === 'In Progress' || newStatus === 'Resolved') {
        showToast('On-site diagnosis ("In Progress" & "Resolved") is strictly performed by Field Technicians.', 'error');
        return;
      }
      if (newStatus === 'Closed' && activeTicket.status !== 'Resolved') {
        showToast('Tickets must be marked as "Resolved" by the Technician before Support can close them.', 'error');
        return;
      }
    }

    const updated = DataService.updateTicketStatus(activeTicket.id, newStatus, resolutionText || activeTicket.resolutionNotes);
    if (updated) {
      showToast(`Ticket status updated to ${newStatus}.`, 'success');
      refreshList();
    }
  };

  const handleSaveResolutionNotes = () => {
    if (!activeTicket) return;
    const updated = DataService.updateTicketStatus(activeTicket.id, activeTicket.status, resolutionText);
    if (updated) {
      showToast('Resolution notes recorded to service file.', 'success');
      refreshList();
    }
  };

  // Filtered Tickets
  const filteredTickets = tickets.filter(t => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = 
      t.ticketNumber.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      (t.productSerial && t.productSerial.toLowerCase().includes(q)) ||
      t.issueDescription.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-5">
      {/* View Switcher: Field Service vs Customer Helpdesk */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('rma')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              activeView === 'rma'
                ? 'bg-[#292724] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#C66B45]" />
            Field Service & RMA Tickets
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-700 text-white">
              {tickets.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('helpdesk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              activeView === 'helpdesk'
                ? 'bg-[#292724] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-[#C66B45]" />
            Live Customer Helpdesk & Chat Inbox
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-[#C66B45] text-white">
              {DataService.getHelpdeskTickets().filter(t => t.status !== 'Resolved').length} Active
            </span>
          </button>
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          {activeView === 'rma' ? 'Field diagnostics & technician dispatches' : 'Real-time two-way customer communication channel'}
        </div>
      </div>

      {activeView === 'helpdesk' ? (
        <HelpdeskInboxView />
      ) : (
        <>
          {/* Top Filter & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ticket # (SRV-2026-...), customer, serial or fault..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder-[#292724]/50 focus:outline-none focus:border-slate-300"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Role-Specific Action Header: Technician cannot open tickets; Support and Manager can */}
            {isTechnician ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-lg text-cyan-900 text-xs font-semibold shrink-0">
                <Wrench className="w-4 h-4 text-cyan-700" />
                <span>Field Technician Mode: Diagnosing Assigned Tickets</span>
              </div>
            ) : (
              <button
                onClick={handleOpenCreate}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45] text-white text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Service Ticket</span>
              </button>
            )}
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Ticket #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Reported Issue</th>
                    <th className="py-3 px-4">Linked Serial & Warranty</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Technician</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                        No service tickets found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveTicket(t);
                          setResolutionText(t.resolutionNotes || '');
                        }}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {t.ticketNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <strong className="block text-slate-900">{t.customerName}</strong>
                          <span className="text-[11px] text-slate-500">{t.customerPhone}</span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-700">
                          {t.issueDescription}
                        </td>
                        <td className="py-3.5 px-4">
                          {t.productSerial ? (
                            <div>
                              <span className="font-mono font-medium text-slate-900 block">{t.productSerial}</span>
                              <span className={`text-[10px] font-semibold ${t.isWarrantyEligible ? 'text-emerald-700' : 'text-amber-800'}`}>
                                {t.isWarrantyEligible ? 'Under Warranty' : 'Out of Warranty'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unlinked Visit</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={t.priority} type="priority" />
                        </td>
                        <td className="py-3.5 px-4 text-slate-900">
                          {t.assignedTechnicianName ? (
                            <div className="flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-[#D9A441]" />
                              <span>{t.assignedTechnicianName}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={t.status} type="ticket" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTicket(t);
                              setResolutionText(t.resolutionNotes || '');
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-200 text-slate-900 rounded border border-slate-200 transition-colors cursor-pointer"
                          >
                            Details & Actions
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Ticket Modal - Available strictly to Support Agent and Manager */}
          {!isTechnician && (
            <Modal
              isOpen={isCreateOpen}
              onClose={() => setIsCreateOpen(false)}
              title="Create Customer Service Request"
              subtitle="Automatic hardware warranty verification and technician dispatch"
              maxWidth="2xl"
            >
              <form onSubmit={handleSaveTicket} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Select Customer *
                    </label>
                    <select
                      value={formCustomerId}
                      onChange={(e) => setFormCustomerId(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
                    >
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Priority Level *
                    </label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as ServiceTicketPriority)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
                    >
                      <option value="Urgent">Urgent (Total Plant Shutdown)</option>
                      <option value="High">High (Inverter Error / Generation Drop)</option>
                      <option value="Medium">Medium (Telemetry / Wi-Fi Glitch)</option>
                      <option value="Low">Low (General Maintenance / Cleaning)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">
                    Hardware Serial Number (Optional - checks warranty validity)
                  </label>
                  <input
                    type="text"
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                    placeholder="e.g. INV-GRO-5K-1120 or INV-DEY-10K-4489"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-slate-300"
                  />
                  {formSerial && (
                    <div className="mt-1.5">
                      {matchedWarranty ? (
                        <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] flex items-center justify-between">
                          <span>
                            Identified: <strong>{matchedWarranty.productName}</strong> (Delivery: {matchedWarranty.deliveryDate})
                          </span>
                          <StatusBadge status={matchedWarranty.status} type="warranty" />
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          Serial not in local registry (will be treated as general service visit).
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">
                    Detailed Fault / Issue Description *
                  </label>
                  <textarea
                    rows={3}
                    value={formIssue}
                    onChange={(e) => setFormIssue(e.target.value)}
                    placeholder="Describe customer symptom, error codes on display, or physical inspection notes..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Assign Service Technician
                    </label>
                    <select
                      value={formTechId}
                      onChange={(e) => setFormTechId(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
                    >
                      <option value="">Unassigned (Queue only)</option>
                      {TECHNICIANS.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.phone})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-900 mb-1">
                      Scheduled Field Visit Date
                    </label>
                    <input
                      type="date"
                      value={formVisitDate}
                      onChange={(e) => setFormVisitDate(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-slate-300"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-900 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#C66B45] text-white font-semibold hover:bg-[#C66B45]/90 shadow-sm cursor-pointer"
                  >
                    Open Ticket & Dispatch
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* Ticket Details & Resolution Modal */}
          {activeTicket && (
            <Modal
              isOpen={!!activeTicket}
              onClose={() => setActiveTicket(null)}
              title={`Service Ticket: ${activeTicket.ticketNumber}`}
              subtitle={`Customer: ${activeTicket.customerName} • Priority: ${activeTicket.priority}`}
              maxWidth="2xl"
            >
              <div className="space-y-5 text-xs">
                {/* Header info */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{activeTicket.customerName}</span>
                      <StatusBadge status={activeTicket.priority} type="priority" />
                      <StatusBadge status={activeTicket.status} type="ticket" />
                    </div>
                    <span className="font-mono text-slate-500">Logged {new Date(activeTicket.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    <p>Phone: <strong className="font-mono">{activeTicket.customerPhone}</strong></p>
                    <p>Address: {activeTicket.customerAddress}</p>
                    <p>Assigned Tech: <strong>{activeTicket.assignedTechnicianName || 'Pending Assignment'}</strong></p>
                    <p>Visit Date: <strong>{activeTicket.scheduledVisitDate || 'Not scheduled'}</strong></p>
                  </div>

                  {activeTicket.productSerial && (
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="font-mono">Serial: <strong>{activeTicket.productSerial}</strong> ({activeTicket.productName})</span>
                      {activeTicket.isWarrantyEligible ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                          Under Active Warranty
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#C66B45]/10 text-[#C66B45] font-semibold text-[10px]">
                          Out of Warranty (Chargeable)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Issue Description */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                  <span className="font-semibold text-slate-900 block mb-1">Issue Description</span>
                  <p className="text-slate-900 leading-relaxed">{activeTicket.issueDescription}</p>
                </div>

                {/* Technician Assignment Section: Only Support Agent & Manager can assign/reassign */}
                {!isTechnician ? (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 block text-xs">
                        {activeTicket.assignedTechnicianName ? 'Reassign Field Technician' : 'Assign Field Technician'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Support / Operations Dispatch Action
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={assignTechId}
                        onChange={(e) => setAssignTechId(e.target.value)}
                        className="sm:col-span-1.5 p-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                      >
                        <option value="">Select Technician...</option>
                        {TECHNICIANS.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.phone})</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={assignVisitDate}
                        onChange={(e) => setAssignVisitDate(e.target.value)}
                        className="p-2 rounded-lg border border-slate-200 bg-white font-mono text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                      />
                      <button
                        type="button"
                        onClick={handleAssignTechnician}
                        disabled={!assignTechId}
                        className="px-3 py-2 bg-[#C66B45] hover:bg-[#C66B45]/90 text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Assign & Dispatch</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-cyan-50/60 border border-cyan-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-cyan-700 shrink-0" />
                      <span className="text-cyan-900 font-medium">
                        Assigned Field Engineer: <strong>{activeTicket.assignedTechnicianName || 'Rajesh & Team'}</strong>
                      </span>
                    </div>
                    <span className="text-cyan-800 text-[11px] font-mono">
                      Scheduled Visit: {activeTicket.scheduledVisitDate || 'Today'}
                    </span>
                  </div>
                )}

                {/* ===================================================================
                    ROLE-BASED STATUS TRANSITION CONTROLS
                    =================================================================== */}

                {/* 1. FIELD TECHNICIAN WORKFLOW: Only "In Progress" and "Resolved" */}
                {isTechnician && (
                  <div className="p-3.5 rounded-xl bg-cyan-50/50 border border-cyan-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-cyan-950 font-bold text-xs">
                        <Wrench className="w-4 h-4 text-cyan-700" />
                        <span>Field Execution Actions (Technician)</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
                        On-Site Field Mode
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('In Progress')}
                        className={`py-2.5 px-3 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer ${
                          activeTicket.status === 'In Progress'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {activeTicket.status === 'In Progress' ? '✓ Currently In Progress' : 'Start Inspection (In Progress)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('Resolved')}
                        className={`py-2.5 px-3 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer ${
                          activeTicket.status === 'Resolved'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {activeTicket.status === 'Resolved' ? '✓ Completed (Resolved)' : 'Mark Completed (Resolved)'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Field Technicians update status to <strong>In Progress</strong> upon arrival and <strong>Resolved</strong> after testing and repairs. Technicians do not open, assign, or close tickets.
                    </p>
                  </div>
                )}

                {/* 2. SUPPORT AGENT WORKFLOW: Open, Assigned, and Close Ticket */}
                {isSupport && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">Support Agent Actions (Helpdesk Desk)</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                        Support Desk
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('Open')}
                        className={`py-2 px-2 rounded-lg border text-center font-semibold text-xs transition-all cursor-pointer ${
                          activeTicket.status === 'Open'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Open (Queue)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('Assigned')}
                        className={`py-2 px-2 rounded-lg border text-center font-semibold text-xs transition-all cursor-pointer ${
                          activeTicket.status === 'Assigned'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Assigned
                      </button>
                      <button
                        type="button"
                        disabled={activeTicket.status !== 'Resolved'}
                        onClick={() => handleUpdateStatus('Closed')}
                        className={`py-2 px-2 rounded-lg border text-center font-semibold text-xs transition-all ${
                          activeTicket.status === 'Closed'
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : activeTicket.status === 'Resolved'
                            ? 'bg-[#292724] hover:bg-black text-white border-[#292724] shadow-sm cursor-pointer'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        }`}
                        title={activeTicket.status !== 'Resolved' ? 'Must be marked as Resolved by Technician first' : 'Close Ticket'}
                      >
                        {activeTicket.status === 'Closed' ? '✓ Closed' : 'Close Ticket'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {activeTicket.status === 'Resolved'
                        ? 'Technician has completed field repairs and marked work as Resolved. Verify customer sign-off and click "Close Ticket" to finalize.'
                        : 'Support Agent opens and assigns tickets. "In Progress" and "Resolved" are set on-site by the Field Technician. Once resolved, you can close the ticket.'}
                    </p>
                  </div>
                )}

                {/* 3. OPERATIONS MANAGER WORKFLOW: Executive Oversight */}
                {isManager && (
                  <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 text-xs">Operations Manager Oversight</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                        Manager Authority
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {(['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'] as ServiceTicketStatus[]).map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateStatus(st)}
                          className={`py-2 px-1 rounded-lg border text-center font-semibold text-xs transition-all cursor-pointer ${
                            activeTicket.status === st
                              ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Managerial authority: review technician findings, approve RMA replacements, and sign off to Close.
                    </p>
                  </div>
                )}

                {/* Field Technician Resolution Notes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-900 text-xs">
                      Technician Field Findings & Resolution Notes
                    </label>
                    <span className="text-[10px] text-slate-500">
                      Diagnostic notes & replaced components
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Log diagnostic results, replaced parts (e.g. DC fuse, MC4 connector, firmware upgrade) and customer sign-off..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-slate-400"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveResolutionNotes}
                      className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-semibold text-xs cursor-pointer shadow-xs"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>

                {activeTicket.resolvedAt && (
                  <p className="text-[11px] text-slate-500 font-mono text-right">
                    Resolved / Completed on: {new Date(activeTicket.resolvedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
};
