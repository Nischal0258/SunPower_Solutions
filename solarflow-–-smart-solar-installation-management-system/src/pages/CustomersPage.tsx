import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  MapPin,
  FileText,
  Sun,
  LifeBuoy,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { DataService } from '../services/dataService';
import { Customer, LeadStatus, Quotation, InstallationProject, ServiceTicket } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { NavTab } from '../components/layout/Sidebar';

interface CustomersPageProps {
  onNavigateTab: (tab: NavTab, targetId?: string) => void;
  initialCustomerId?: string;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  onNavigateTab,
  initialCustomerId
}) => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(DataService.getCustomers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  
  // Selected Customer for Details
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(() => {
    if (initialCustomerId) {
      return DataService.getCustomerById(initialCustomerId) || null;
    }
    return null;
  });

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmCust, setDeleteConfirmCust] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    enquiryDate: new Date().toISOString().split('T')[0],
    leadStatus: 'New' as LeadStatus,
    roofAreaSqFt: 1000,
    sanctionLoadKw: 5,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const refreshList = () => {
    const list = DataService.getCustomers();
    setCustomers(list);
    if (viewCustomer) {
      const updated = list.find(c => c.id === viewCustomer.id) || null;
      setViewCustomer(updated);
    }
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      enquiryDate: new Date().toISOString().split('T')[0],
      leadStatus: 'New',
      roofAreaSqFt: 1000,
      sanctionLoadKw: 5,
      notes: ''
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (c: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      city: c.city,
      state: c.state,
      pincode: c.pincode,
      enquiryDate: c.enquiryDate,
      leadStatus: c.leadStatus,
      roofAreaSqFt: c.roofAreaSqFt || 1000,
      sanctionLoadKw: c.sanctionLoadKw || 5,
      notes: c.notes || ''
    });
    setFormErrors({});
    setIsAddEditOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Full name is required.';
    
    // Indian phone number validation (+91 or 10 digits starting with 6, 7, 8, or 9)
    const phoneClean = formData.phone.replace(/[\s\-\+]/g, '');
    const phoneRegex = /^(91)?[6-9]\d{9}$/;
    if (!phoneClean) {
      errors.phone = 'Phone number is required.';
    } else if (!phoneRegex.test(phoneClean)) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number (e.g., +91 98201 54321).';
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Enter a valid email address.';
      }
    }

    if (!formData.address.trim()) errors.address = 'Site address is required.';
    if (!formData.city.trim()) errors.city = 'City is required.';
    if (!formData.state.trim()) errors.state = 'State is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = DataService.saveCustomer({
      ...(editingCustomer ? { id: editingCustomer.id } : {}),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      enquiryDate: formData.enquiryDate,
      leadStatus: formData.leadStatus,
      roofAreaSqFt: Number(formData.roofAreaSqFt) || 0,
      sanctionLoadKw: Number(formData.sanctionLoadKw) || 0,
      notes: formData.notes.trim()
    });

    if (!result.success) {
      setFormErrors({ general: result.error || 'Failed to save customer' });
      showToast(result.error || 'Failed to save customer', 'error');
      return;
    }

    showToast(
      editingCustomer ? `Customer ${formData.name} updated` : `New customer ${formData.name} registered`,
      'success'
    );
    setIsAddEditOpen(false);
    refreshList();
  };

  const handleDelete = (customer: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfirmCust(customer);
  };

  const confirmDelete = () => {
    if (!deleteConfirmCust) return;
    DataService.deleteCustomer(deleteConfirmCust.id);
    showToast(`Customer ${deleteConfirmCust.name} deleted`, 'info');
    setDeleteConfirmCust(null);
    if (viewCustomer?.id === deleteConfirmCust.id) {
      setViewCustomer(null);
    }
    refreshList();
  };

  // Filtered customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || c.leadStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Associated records for active drawer/details view
  const customerQuotes: Quotation[] = viewCustomer 
    ? DataService.getQuotations().filter(q => q.customerId === viewCustomer.id) 
    : [];

  const customerProjects: InstallationProject[] = viewCustomer 
    ? DataService.getProjects().filter(p => p.customerId === viewCustomer.id) 
    : [];

  const customerTickets: ServiceTicket[] = viewCustomer 
    ? DataService.getServiceTickets().filter(t => t.customerId === viewCustomer.id) 
    : [];

  const statuses: ('All' | LeadStatus)[] = ['All', 'New', 'Contacted', 'Survey Scheduled', 'Converted', 'Lost'];

  return (
    <div className="space-y-5">
      {/* Top action & Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#292724]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone, city or email..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-[#F5F3EF] border border-[#E7E2D9] text-[#292724] placeholder-[#292724]/50 focus:outline-none focus:border-[#DBBA95]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {statuses.map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
                  selectedStatus === st
                    ? 'bg-[#292724] text-[#FFFFFF] border-[#292724]'
                    : 'bg-[#FFFFFF] text-[#292724]/70 border-[#E7E2D9] hover:border-[#DBBA95]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45] text-[#FFFFFF] text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Customer</span>
        </button>
      </div>

      {/* Main Table View */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E7E2D9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F3EF] border-b border-[#E7E2D9] text-[#292724]/70 font-semibold">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Lead Status</th>
                <th className="py-3 px-4">Site Specs</th>
                <th className="py-3 px-4">Enquiry Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D9]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#292724]/60">
                    No customers found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => setViewCustomer(cust)}
                    className="hover:bg-[#F5F3EF]/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#292724] text-xs group-hover:text-[#C66B45] transition-colors">
                        {cust.name}
                      </div>
                      <span className="text-[10px] font-mono text-[#292724]/50">{cust.id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-[#292724]">
                        <Phone className="w-3.5 h-3.5 text-[#DBBA95]" />
                        <span className="font-mono">{cust.phone}</span>
                      </div>
                      {cust.email && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#292724]/60 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-[#292724]/40" />
                          <span>{cust.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#292724] font-medium">{cust.city}, {cust.state}</div>
                      <div className="text-[11px] text-[#292724]/60 truncate max-w-[180px]">{cust.address}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={cust.leadStatus} type="lead" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#292724]">
                      <div>{cust.sanctionLoadKw || 5} kW Sanctioned</div>
                      <div className="text-[11px] text-[#292724]/60">{cust.roofAreaSqFt || 0} sq.ft roof</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#292724]/70">
                      {cust.enquiryDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setViewCustomer(cust)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-[#F5F3EF] hover:bg-[#E7E2D9] text-[#292724] rounded border border-[#E7E2D9] transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={(e) => handleOpenEdit(cust, e)}
                          className="p-1 rounded text-[#292724]/60 hover:text-[#292724] hover:bg-[#E7E2D9] transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(cust, e)}
                          className="p-1 rounded text-[#C66B45]/70 hover:text-[#C66B45] hover:bg-[#C66B45]/10 transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Full Details Modal / Drawer */}
      {viewCustomer && (
        <Modal
          isOpen={!!viewCustomer}
          onClose={() => setViewCustomer(null)}
          title={`Customer Record: ${viewCustomer.name}`}
          subtitle={`Ledger ID: ${viewCustomer.id} · Registered ${viewCustomer.enquiryDate}`}
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Header strip */}
            <div className="p-4 rounded-xl bg-[#F5F3EF] border border-[#E7E2D9] flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#292724]">{viewCustomer.name}</span>
                  <StatusBadge status={viewCustomer.leadStatus} type="lead" />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-[#292724]/80">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#C66B45]" />
                    <strong className="font-mono">{viewCustomer.phone}</strong>
                  </span>
                  {viewCustomer.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#292724]/60" />
                      <span>{viewCustomer.email}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D9A441]" />
                    <span>{viewCustomer.address}, {viewCustomer.city}, {viewCustomer.state} - {viewCustomer.pincode}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(viewCustomer)}
                  className="px-3 py-1.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] text-xs font-semibold text-[#292724] hover:bg-[#E7E2D9] transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setViewCustomer(null);
                    onNavigateTab('quotations');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#C66B45] text-xs font-semibold text-[#FFFFFF] hover:bg-[#C66B45]/90 transition-colors"
                >
                  + New Quote
                </button>
              </div>
            </div>

            {/* Site Specs & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF]">
                <p className="text-[#292724]/60 font-medium">Sanctioned Electricity Load</p>
                <p className="text-base font-bold text-[#292724] font-mono mt-1">{viewCustomer.sanctionLoadKw || 5} kW</p>
                <p className="text-[10px] text-[#292724]/50">3-Phase DISCOM Connection</p>
              </div>

              <div className="p-3 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF]">
                <p className="text-[#292724]/60 font-medium">Usable Rooftop Area</p>
                <p className="text-base font-bold text-[#292724] font-mono mt-1">{viewCustomer.roofAreaSqFt || 0} sq.ft</p>
                <p className="text-[10px] text-[#292724]/50">Estimated Solar Capacity: ~{Math.floor((viewCustomer.roofAreaSqFt || 1000) / 100)} kW</p>
              </div>

              <div className="p-3 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF]">
                <p className="text-[#292724]/60 font-medium">Enquiry Date</p>
                <p className="text-base font-bold text-[#292724] font-mono mt-1">{viewCustomer.enquiryDate}</p>
                <p className="text-[10px] text-[#292724]/50">SolarFlow Customer Record</p>
              </div>
            </div>

            {viewCustomer.notes && (
              <div className="p-3 rounded-lg bg-[#F5F3EF]/60 border border-[#E7E2D9] text-xs">
                <span className="font-semibold text-[#292724]">Site / Requirement Notes: </span>
                <span className="text-[#292724]/80">{viewCustomer.notes}</span>
              </div>
            )}

            {/* History Section: Quotations, Projects, Service Tickets */}
            <div className="space-y-4">
              {/* Linked Quotations */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#292724]">
                    <FileText className="w-4 h-4 text-[#C66B45]" />
                    <span>Quotations ({customerQuotes.length})</span>
                  </div>
                </div>

                {customerQuotes.length === 0 ? (
                  <p className="text-xs text-[#292724]/60 italic p-3 bg-[#F5F3EF] rounded-lg border border-[#E7E2D9]">
                    No quotations generated yet for this customer.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customerQuotes.map(q => (
                      <div
                        key={q.id}
                        onClick={() => {
                          setViewCustomer(null);
                          onNavigateTab('quotations', q.id);
                        }}
                        className="p-3 rounded-lg border border-[#E7E2D9] hover:border-[#DBBA95] bg-[#FFFFFF] flex items-center justify-between cursor-pointer transition-all text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-[#292724]">{q.quotationNumber}</span>
                            <span className="text-[#292724]/60">·</span>
                            <span className="font-semibold">{q.capacityKw} kW {q.systemType}</span>
                            <StatusBadge status={q.status} type="quote" />
                          </div>
                          <p className="text-[11px] text-[#292724]/60 mt-0.5">
                            Created on {q.createdAt} · Valid until {q.validUntil}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono text-sm text-[#292724]">
                            ₹{q.grandTotal.toLocaleString('en-IN')}
                          </p>
                          <span className="text-[10px] text-[#C66B45] font-semibold hover:underline flex items-center justify-end gap-0.5">
                            Open <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Projects */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#292724]">
                    <Sun className="w-4 h-4 text-[#D9A441]" />
                    <span>Installation Projects ({customerProjects.length})</span>
                  </div>
                </div>

                {customerProjects.length === 0 ? (
                  <p className="text-xs text-[#292724]/60 italic p-3 bg-[#F5F3EF] rounded-lg border border-[#E7E2D9]">
                    No active installation project yet. (Approve a quotation to start a project).
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customerProjects.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setViewCustomer(null);
                          onNavigateTab('installations', p.id);
                        }}
                        className="p-3 rounded-lg border border-[#E7E2D9] hover:border-[#DBBA95] bg-[#FFFFFF] flex items-center justify-between cursor-pointer transition-all text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-[#292724]">{p.projectId}</span>
                            <span className="text-[#292724]/60">·</span>
                            <span>{p.capacityKw} kW {p.systemType}</span>
                            <StatusBadge status={p.stage} type="stage" />
                          </div>
                          <p className="text-[11px] text-[#292724]/60 mt-0.5">
                            Assigned Tech: {p.technicianName || 'Pending'} · Progress: {p.progressPercent}%
                          </p>
                        </div>
                        <span className="text-[10px] text-[#C66B45] font-semibold hover:underline flex items-center gap-0.5">
                          View Project <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Service Tickets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#292724]">
                    <LifeBuoy className="w-4 h-4 text-[#292724]" />
                    <span>Service History ({customerTickets.length})</span>
                  </div>
                </div>

                {customerTickets.length === 0 ? (
                  <p className="text-xs text-[#292724]/60 italic p-3 bg-[#F5F3EF] rounded-lg border border-[#E7E2D9]">
                    Zero service complaints recorded. System operating nominally.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customerTickets.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setViewCustomer(null);
                          onNavigateTab('tickets', t.id);
                        }}
                        className="p-3 rounded-lg border border-[#E7E2D9] hover:border-[#DBBA95] bg-[#FFFFFF] flex items-center justify-between cursor-pointer transition-all text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold font-mono text-[#292724]">{t.ticketNumber}</span>
                            <StatusBadge status={t.status} type="ticket" />
                            <StatusBadge status={t.priority} type="priority" />
                          </div>
                          <p className="text-[11px] text-[#292724]/75 mt-0.5">
                            {t.issueDescription}
                          </p>
                        </div>
                        <span className="text-[10px] text-[#C66B45] font-semibold hover:underline flex items-center gap-0.5">
                          Details <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingCustomer ? `Edit Customer: ${editingCustomer.name}` : 'Add New Solar Customer'}
        subtitle="Validate contact details & rooftop load specs to ensure survey feasibility"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
          {formErrors.general && (
            <div className="p-3 rounded-lg bg-[#C66B45]/10 border border-[#C66B45] text-[#C66B45] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formErrors.general}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#292724] mb-1">
                Customer Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rameshwar Patil"
                className={`w-full p-2.5 rounded-lg border bg-[#FFFFFF] text-[#292724] focus:outline-none ${
                  formErrors.name ? 'border-[#C66B45]' : 'border-[#E7E2D9] focus:border-[#DBBA95]'
                }`}
              />
              {formErrors.name && <p className="text-[#C66B45] text-[11px] mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block font-semibold text-[#292724] mb-1">
                Indian Mobile Number *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98201 54321"
                className={`w-full p-2.5 rounded-lg border bg-[#FFFFFF] text-[#292724] font-mono focus:outline-none ${
                  formErrors.phone ? 'border-[#C66B45]' : 'border-[#E7E2D9] focus:border-[#DBBA95]'
                }`}
              />
              {formErrors.phone && <p className="text-[#C66B45] text-[11px] mt-1">{formErrors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#292724] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. customer@domain.com"
                className={`w-full p-2.5 rounded-lg border bg-[#FFFFFF] text-[#292724] focus:outline-none ${
                  formErrors.email ? 'border-[#C66B45]' : 'border-[#E7E2D9] focus:border-[#DBBA95]'
                }`}
              />
              {formErrors.email && <p className="text-[#C66B45] text-[11px] mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block font-semibold text-[#292724] mb-1">
                Lead Status
              </label>
              <select
                value={formData.leadStatus}
                onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value as LeadStatus })}
                className="w-full p-2.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] focus:outline-none focus:border-[#DBBA95]"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Survey Scheduled">Survey Scheduled</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#292724] mb-1">
              Premises / Site Address *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Bungalow 12, Gulmohar Enclave, Opp. Metro Pillar 42"
              className={`w-full p-2.5 rounded-lg border bg-[#FFFFFF] text-[#292724] focus:outline-none ${
                formErrors.address ? 'border-[#C66B45]' : 'border-[#E7E2D9] focus:border-[#DBBA95]'
              }`}
            />
            {formErrors.address && <p className="text-[#C66B45] text-[11px] mt-1">{formErrors.address}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#292724] mb-1">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Pune"
                className={`w-full p-2.5 rounded-lg border bg-[#FFFFFF] text-[#292724] focus:outline-none ${
                  formErrors.city ? 'border-[#C66B45]' : 'border-[#E7E2D9] focus:border-[#DBBA95]'
                }`}
              />
              {formErrors.city && <p className="text-[#C66B45] text-[11px] mt-1">{formErrors.city}</p>}
            </div>

            <div>
              <label className="block font-semibold text-[#292724] mb-1">
                State *
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Maharashtra"
                className={`w-full p-2.5 rounded-lg border bg-[#FFFFFF] text-[#292724] focus:outline-none ${
                  formErrors.state ? 'border-[#C66B45]' : 'border-[#E7E2D9] focus:border-[#DBBA95]'
                }`}
              />
              {formErrors.state && <p className="text-[#C66B45] text-[11px] mt-1">{formErrors.state}</p>}
            </div>

            <div>
              <label className="block font-semibold text-[#292724] mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="e.g. 411038"
                className="w-full p-2.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] font-mono focus:outline-none focus:border-[#DBBA95]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#292724] mb-1">
                Roof Area (Sq. Ft)
              </label>
              <input
                type="number"
                value={formData.roofAreaSqFt}
                onChange={(e) => setFormData({ ...formData, roofAreaSqFt: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] font-mono focus:outline-none focus:border-[#DBBA95]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#292724] mb-1">
                Sanctioned Load (kW)
              </label>
              <input
                type="number"
                value={formData.sanctionLoadKw}
                onChange={(e) => setFormData({ ...formData, sanctionLoadKw: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] font-mono focus:outline-none focus:border-[#DBBA95]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#292724] mb-1">
                Enquiry Date
              </label>
              <input
                type="date"
                value={formData.enquiryDate}
                onChange={(e) => setFormData({ ...formData, enquiryDate: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] font-mono focus:outline-none focus:border-[#DBBA95]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#292724] mb-1">
              Notes & Special Instructions
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Needs elevated structure to preserve terrace space. High night usage."
              className="w-full p-2.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] focus:outline-none focus:border-[#DBBA95]"
            />
          </div>

          <div className="pt-3 border-t border-[#E7E2D9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 rounded-lg border border-[#E7E2D9] text-[#292724] font-medium hover:bg-[#F5F3EF]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#C66B45] text-[#FFFFFF] font-semibold hover:bg-[#C66B45]/90 shadow-sm"
            >
              {editingCustomer ? 'Update Customer' : 'Save Customer Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirmCust && (
        <Modal
          isOpen={!!deleteConfirmCust}
          onClose={() => setDeleteConfirmCust(null)}
          title="Delete Customer Confirmation"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-[#292724]">
              Are you sure you want to permanently delete customer <strong>{deleteConfirmCust.name}</strong> ({deleteConfirmCust.id})?
            </p>
            <p className="text-[#C66B45] bg-[#C66B45]/10 p-2.5 rounded-lg border border-[#C66B45]/30">
              This action cannot be undone. Historical logs and quotations will remain archived.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmCust(null)}
                className="px-3 py-1.5 rounded-lg border border-[#E7E2D9] text-[#292724] hover:bg-[#F5F3EF]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-lg bg-[#C66B45] text-[#FFFFFF] font-semibold hover:bg-[#C66B45]/90"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
