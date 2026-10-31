import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { DataService, TECHNICIANS } from '../services/dataService';
import { ServiceTicket, ServiceTicketPriority, ServiceTicketStatus, Customer } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { NavTab } from '../components/layout/Sidebar';

interface ServiceTicketsPageProps {
  onNavigateTab: (tab: NavTab, targetId?: string) => void;
  initialTicketIdOrSerial?: string;
}

export const ServiceTicketsPage: React.FC<ServiceTicketsPageProps> = ({
  onNavigateTab,
  initialTicketIdOrSerial
}) => {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<ServiceTicket[]>(DataService.getServiceTickets());
  const [customers] = useState<Customer[]>(DataService.getCustomers());
  const [warranties] = useState(DataService.getWarranties());

  const [searchQuery, setSearchQuery] = useState(initialTicketIdOrSerial || '');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

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

  // Create Ticket Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formIssue, setFormIssue] = useState('');
  const [formPriority, setFormPriority] = useState<ServiceTicketPriority>('High');
  const [formTechId, setFormTechId] = useState('');
  const [formVisitDate, setFormVisitDate] = useState(new Date().toISOString().split('T')[0]);

  // Resolution Notes in Detail View
  const [resolutionText, setResolutionText] = useState('');

  const refreshList = () => {
    const list = DataService.getServiceTickets();
    setTickets(list);
    if (activeTicket) {
      const refreshed = list.find(t => t.id === activeTicket.id) || null;
      setActiveTicket(refreshed);
    }
  };

  const handleOpenCreate = () => {
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
  const isWarrantyValid = matchedWarranty ? matchedWarranty.status !== 'Expired' : false;

  const handleSaveTicket = (e: React.FormEvent) => {
    e.preventDefault();

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

    showToast(`Service Ticket ${created.ticketNumber} logged.`, 'success');
    setIsCreateOpen(false);
    refreshList();
    setActiveTicket(created);
  };

  const handleUpdateStatus = (newStatus: ServiceTicketStatus) => {
    if (!activeTicket) return;
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

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45] text-white text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Service Ticket</span>
        </button>
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
                    onClick={() => {
                      setActiveTicket(t);
                      setResolutionText(t.resolutionNotes || '');
                    }}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-[#C66B45]">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{t.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{t.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-900 line-clamp-2 leading-relaxed">
                        {t.issueDescription}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      {t.productSerial ? (
                        <div>
                          <span className="font-mono font-semibold text-slate-900">{t.productSerial}</span>
                          <div className="mt-0.5">
                            {t.isWarrantyEligible ? (
                              <span className="text-[10px] font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                                Covered by Warranty
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-[#C66B45] bg-[#C66B45]/10 px-1.5 py-0.5 rounded">
                                Out of Warranty
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">General System</span>
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
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-200 text-slate-900 rounded border border-slate-200 transition-colors"
                      >
                        Details & Resolve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
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
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#C66B45] text-white font-semibold hover:bg-[#C66B45]/90 shadow-sm"
            >
              Create Ticket & Dispatch
            </button>
          </div>
        </form>
      </Modal>

      {/* Ticket Details & Resolution Modal */}
      {activeTicket && (
        <Modal
          isOpen={!!activeTicket}
          onClose={() => setActiveTicket(null)}
          title={`Service Ticket: ${activeTicket.ticketNumber}`}
          subtitle={`Customer: ${activeTicket.customerName} · Priority: ${activeTicket.priority}`}
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
                <p>Assigned Tech: <strong>{activeTicket.assignedTechnicianName || 'Pending'}</strong></p>
                <p>Visit Date: <strong>{activeTicket.scheduledVisitDate || 'Not scheduled'}</strong></p>
              </div>

              {activeTicket.productSerial && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-mono">Serial: <strong>{activeTicket.productSerial}</strong> ({activeTicket.productName})</span>
                  {activeTicket.isWarrantyEligible ? (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-semibold text-[10px]">
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

            {/* Status Transition buttons */}
            <div>
              <span className="font-semibold text-slate-900 block mb-2">Update Ticket Status</span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'] as ServiceTicketStatus[]).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateStatus(st)}
                    className={`py-2 px-1 rounded-lg border text-center font-semibold transition-all ${
                      activeTicket.status === st
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Field Technician Resolution Notes */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-900">
                Technician Field Findings & Resolution Notes
              </label>
              <textarea
                rows={3}
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Log diagnostic results, replaced parts (e.g. DC fuse, MC4 connector, firmware upgrade) and customer sign-off..."
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveResolutionNotes}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-900"
                >
                  Save Notes
                </button>
              </div>
            </div>

            {activeTicket.resolvedAt && (
              <p className="text-[11px] text-slate-500 font-mono text-right">
                Resolved on: {new Date(activeTicket.resolvedAt).toLocaleString()}
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
