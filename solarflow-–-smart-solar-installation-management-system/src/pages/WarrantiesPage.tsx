import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Plus,
  Calendar,
  AlertCircle,
  FileCheck,
  Printer,
  Wrench,
  ExternalLink,
  LifeBuoy
} from 'lucide-react';
import { DataService, computeWarrantyDates } from '../services/dataService';
import { WarrantyRecord, ProductCategory, Customer } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { NavTab } from '../components/layout/Sidebar';

interface WarrantiesPageProps {
  onNavigateTab: (tab: NavTab, targetId?: string) => void;
  initialSerialQuery?: string;
}

export const WarrantiesPage: React.FC<WarrantiesPageProps> = ({
  onNavigateTab,
  initialSerialQuery
}) => {
  const { showToast } = useToast();
  const [warranties, setWarranties] = useState<WarrantyRecord[]>(DataService.getWarranties());
  const [customers] = useState<Customer[]>(DataService.getCustomers());
  const [searchQuery, setSearchQuery] = useState(initialSerialQuery || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Certificate Modal State
  const [viewCertificate, setViewCertificate] = useState<WarrantyRecord | null>(null);

  // Registration Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [formSerial, setFormSerial] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Solar Panels');
  const [formProductName, setFormProductName] = useState('Waaree 545W Mono PERC Half-Cut Panel');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formProjectId, setFormProjectId] = useState('PRJ-2026-042');
  const [formDeliveryDate, setFormDeliveryDate] = useState(new Date().toISOString().split('T')[0]);

  const refreshList = () => {
    setWarranties(DataService.getWarranties());
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formSerial.trim()) {
      showToast('Serial number is required.', 'error');
      return;
    }

    const customer = customers.find(c => c.id === formCustomerId) || customers[0];
    if (!customer) {
      showToast('Please select a valid customer.', 'error');
      return;
    }

    // Strict rule: Panels 20 yrs, Inverter 2 yrs, Battery 2 yrs
    let warrantyYears = 1;
    if (formCategory === 'Solar Panels') warrantyYears = 20;
    else if (formCategory === 'Inverters' || formCategory === 'Batteries') warrantyYears = 2;

    const registered = DataService.registerWarranty({
      serialNumber: formSerial.trim().toUpperCase(),
      productCategory: formCategory,
      productName: formProductName.trim(),
      model: 'Certified OEM Specification',
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: `${customer.address}, ${customer.city}`,
      projectId: formProjectId.trim() || 'Direct Supply',
      deliveryDate: formDeliveryDate,
      warrantyYears
    });

    showToast(`Warranty registered for serial ${registered.serialNumber} (${warrantyYears} Years)`, 'success');
    setIsRegisterOpen(false);
    refreshList();
    setViewCertificate(registered);
  };

  // Filtered Warranties
  const filteredWarranties = warranties.filter(w => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = 
      w.serialNumber.toLowerCase().includes(q) ||
      w.customerName.toLowerCase().includes(q) ||
      w.productName.toLowerCase().includes(q) ||
      w.projectId.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'All' || w.productCategory === categoryFilter;
    const matchesStatus = statusFilter === 'All' || w.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCount = warranties.filter(w => w.status === 'Active').length;
  const expiringSoonCount = warranties.filter(w => w.status === 'Expiring Soon').length;
  const expiredCount = warranties.filter(w => w.status === 'Expired').length;

  return (
    <div className="space-y-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
          <span className="text-xs text-[#292724]/70 font-medium">Active Warranties</span>
          <p className="text-2xl font-bold font-mono text-[#292724] mt-1 tabular-nums">{activeCount}</p>
          <p className="text-[11px] text-[#292724]/60 mt-0.5">Under valid coverage</p>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
          <span className="text-xs text-[#292724]/70 font-medium">Expiring Soon</span>
          <p className="text-2xl font-bold font-mono text-[#D9A441] mt-1 tabular-nums">{expiringSoonCount}</p>
          <p className="text-[11px] text-[#292724]/60 mt-0.5">Within next 60 days</p>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
          <span className="text-xs text-[#292724]/70 font-medium">Solar Panel Tenure</span>
          <p className="text-2xl font-bold font-mono text-[#292724] mt-1">20 Years</p>
          <p className="text-[11px] text-[#292724]/60 mt-0.5">Calculated from delivery date</p>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
          <span className="text-xs text-[#292724]/70 font-medium">Inverter & Battery Tenure</span>
          <p className="text-2xl font-bold font-mono text-[#292724] mt-1">2 Years</p>
          <p className="text-[11px] text-[#292724]/60 mt-0.5">OEM replacement coverage</p>
        </div>
      </div>

      {/* Instant Serial Lookup & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#292724]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search serial number (e.g. SP-WAR-..., INV-DEY-...), customer or project..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-[#F5F3EF] border border-[#E7E2D9] text-[#292724] placeholder-[#292724]/50 focus:outline-none focus:border-[#DBBA95]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] focus:outline-none focus:border-[#DBBA95]"
          >
            <option value="All">All Categories</option>
            <option value="Solar Panels">Solar Panels (20 Yrs)</option>
            <option value="Inverters">Inverters (2 Yrs)</option>
            <option value="Batteries">Batteries (2 Yrs)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] focus:outline-none focus:border-[#DBBA95]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
          </select>
        </div>

        <button
          onClick={() => {
            setFormCustomerId(customers[0]?.id || '');
            setFormSerial(`SN-${Date.now().toString().slice(-6)}`);
            setIsRegisterOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45] text-[#FFFFFF] text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Register Warranty Serial</span>
        </button>
      </div>

      {/* Warranties Table */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E7E2D9] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F3EF] border-b border-[#E7E2D9] text-[#292724]/70 font-semibold">
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Equipment & Model</th>
                <th className="py-3 px-4">Customer & Project</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4">Coverage Tenure</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D9]">
              {filteredWarranties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#292724]/60">
                    No warranty records found matching your serial or customer search.
                  </td>
                </tr>
              ) : (
                filteredWarranties.map((w) => (
                  <tr
                    key={w.id}
                    onClick={() => setViewCertificate(w)}
                    className="hover:bg-[#F5F3EF]/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-[#292724] group-hover:text-[#C66B45]">
                      {w.serialNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#292724]">{w.productName}</div>
                      <div className="text-[11px] text-[#292724]/60">{w.productCategory} · {w.model}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#292724]">{w.customerName}</div>
                      <div className="text-[11px] font-mono text-[#292724]/60">{w.projectId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#292724]">
                      {w.deliveryDate}
                      <div className="text-[10px] text-[#292724]/50">Official Start</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-[#292724]">
                      {w.warrantyYears} Years
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[#292724]">
                      {w.warrantyEndDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={w.status} type="warranty" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setViewCertificate(w)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-[#F5F3EF] hover:bg-[#E7E2D9] text-[#292724] rounded border border-[#E7E2D9] transition-colors"
                        >
                          Certificate
                        </button>
                        <button
                          onClick={() => {
                            onNavigateTab('tickets', w.serialNumber);
                          }}
                          className="p-1 rounded text-[#292724]/60 hover:text-[#C66B45] hover:bg-[#F5F3EF]"
                          title="Raise Service Ticket for this Serial"
                        >
                          <LifeBuoy className="w-3.5 h-3.5" />
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

      {/* Register Warranty Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register Product Warranty Certificate"
        subtitle="Automatic tenure calculation strictly from product delivery date"
        maxWidth="xl"
      >
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#292724] mb-1">
              Hardware Serial Number (Barcode / QR) *
            </label>
            <input
              type="text"
              value={formSerial}
              onChange={(e) => setFormSerial(e.target.value)}
              placeholder="e.g. SP-WAR-545-9921"
              className="w-full p-2.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] font-mono text-[#292724] focus:outline-none focus:border-[#DBBA95]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#292724] mb-1">
                Equipment Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => {
                  const cat = e.target.value as ProductCategory;
                  setFormCategory(cat);
                  if (cat === 'Solar Panels') setFormProductName('Waaree 545W Mono PERC Half-Cut Panel');
                  else if (cat === 'Inverters') setFormProductName('Deye 10kW Hybrid Three-Phase Inverter');
                  else if (cat === 'Batteries') setFormProductName('Exide 5.12 kWh LiFePO4 Battery Bank');
                }}
                className="w-full p-2.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] focus:outline-none focus:border-[#DBBA95]"
              >
                <option value="Solar Panels">Solar Panels (20 Years Warranty)</option>
                <option value="Inverters">Inverters (2 Years Warranty)</option>
                <option value="Batteries">Batteries (2 Years Warranty)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#292724] mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={formProductName}
                onChange={(e) => setFormProductName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] focus:outline-none focus:border-[#DBBA95]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#292724] mb-1">
                Customer Name *
              </label>
              <select
                value={formCustomerId}
                onChange={(e) => setFormCustomerId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] focus:outline-none focus:border-[#DBBA95]"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#292724] mb-1">
                Project Reference ID
              </label>
              <input
                type="text"
                value={formProjectId}
                onChange={(e) => setFormProjectId(e.target.value)}
                placeholder="e.g. PRJ-2026-042"
                className="w-full p-2.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] font-mono text-[#292724] focus:outline-none focus:border-[#DBBA95]"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F5F3EF] border border-[#E7E2D9] space-y-2">
            <label className="block font-semibold text-[#292724]">
              Actual Delivery / Commissioning Date * (Not Quotation Date)
            </label>
            <input
              type="date"
              value={formDeliveryDate}
              onChange={(e) => setFormDeliveryDate(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] font-mono text-[#292724] focus:outline-none focus:border-[#DBBA95]"
              required
            />
            <p className="text-[11px] text-[#292724]/70">
              Warranty starts strictly on the delivery date. Panels receive 20 years; Inverters & Batteries receive 2 years.
            </p>
          </div>

          <div className="pt-3 border-t border-[#E7E2D9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="px-4 py-2 rounded-lg border border-[#E7E2D9] text-[#292724] hover:bg-[#F5F3EF]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#C66B45] text-[#FFFFFF] font-semibold hover:bg-[#C66B45]/90 shadow-sm"
            >
              Issue Warranty Certificate
            </button>
          </div>
        </form>
      </Modal>

      {/* Warranty Certificate View Modal */}
      {viewCertificate && (
        <Modal
          isOpen={!!viewCertificate}
          onClose={() => setViewCertificate(null)}
          title={`Warranty Certificate: ${viewCertificate.serialNumber}`}
          subtitle={`Customer: ${viewCertificate.customerName} · ${viewCertificate.warrantyYears} Years Coverage`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            <div className="no-print flex justify-end gap-2">
              <button
                onClick={() => {
                  setViewCertificate(null);
                  onNavigateTab('tickets', viewCertificate.serialNumber);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] font-semibold hover:bg-[#F5F3EF] flex items-center gap-1.5"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-[#C66B45]" />
                <span>Log Service Claim</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg bg-[#292724] text-[#FFFFFF] font-semibold hover:bg-[#292724]/90 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>

            {/* Certificate Canvas */}
            <div className="p-6 rounded-xl border-2 border-[#DBBA95] bg-[#FFFFFF] relative overflow-hidden space-y-6 shadow-sm">
              <div className="flex items-start justify-between border-b border-[#E7E2D9] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#C66B45]" />
                    <span className="font-bold text-base text-[#292724]">SolarFlow Warranty Certificate</span>
                  </div>
                  <p className="text-[10px] text-[#292724]/60 font-mono mt-0.5">
                    Cert # SFC-{viewCertificate.id} · Project {viewCertificate.projectId}
                  </p>
                </div>
                <StatusBadge status={viewCertificate.status} type="warranty" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#292724]/50">Customer Name</span>
                  <p className="font-bold text-[#292724] text-sm">{viewCertificate.customerName}</p>
                  <p className="text-[#292724]/70">{viewCertificate.customerAddress}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#292724]/50">Equipment Details</span>
                  <p className="font-bold text-[#292724]">{viewCertificate.productName}</p>
                  <p className="font-mono text-[#292724]/80">Serial: {viewCertificate.serialNumber}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F3EF] border border-[#E7E2D9] grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-[#292724]/60 block font-medium">Delivery Date</span>
                  <span className="font-mono font-bold text-[#292724] text-xs">{viewCertificate.deliveryDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#292724]/60 block font-medium">Guaranteed Tenure</span>
                  <span className="font-mono font-bold text-[#C66B45] text-xs">{viewCertificate.warrantyYears} Years</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#292724]/60 block font-medium">Warranty Expiry</span>
                  <span className="font-mono font-bold text-[#292724] text-xs">{viewCertificate.warrantyEndDate}</span>
                </div>
              </div>

              <div className="text-[11px] text-[#292724]/75 space-y-1">
                <p>• <strong>Performance Assurance:</strong> Guaranteed minimum 84.8% peak generation output through Year 20.</p>
                <p>• <strong>Replacement Terms:</strong> Full manufacturing defect replacement under authorized service inspection.</p>
                <p>• <strong>Claims:</strong> Contact SolarFlow customer care quoting the above hardware serial number.</p>
              </div>

              <div className="pt-4 border-t border-[#E7E2D9] flex justify-between items-center text-[10px] text-[#292724]/50">
                <span>SolarFlow Quality Assurance Division</span>
                <span className="font-mono">Security Hash: Verified</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
