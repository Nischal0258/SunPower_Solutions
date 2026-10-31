import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Printer,
  CheckCircle2,
  XCircle,
  Send,
  Trash2,
  Edit,
  ArrowRight,
  Sun,
  ShieldCheck,
  Zap,
  Building2
} from 'lucide-react';
import { DataService } from '../services/dataService';
import { Quotation, QuotationItem, QuotationStatus, SystemType, ProductCategory, Customer } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { NavTab } from '../components/layout/Sidebar';
import { UserRole } from '../types/roles';

interface QuotationsPageProps {
  onNavigateTab: (tab: NavTab, targetId?: string) => void;
  initialQuotationId?: string;
  currentRole?: UserRole;
}

export const QuotationsPage: React.FC<QuotationsPageProps> = ({
  onNavigateTab,
  initialQuotationId,
  currentRole = "manager"
}) => {
  const { showToast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>(DataService.getQuotations());
  const [customers] = useState<Customer[]>(DataService.getCustomers());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Active viewing/printing quotation
  const [viewQuotation, setViewQuotation] = useState<Quotation | null>(() => {
    if (initialQuotationId) {
      return DataService.getQuotations().find(q => q.id === initialQuotationId || q.quotationNumber === initialQuotationId) || null;
    }
    return null;
  });

  // Builder Modal State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);

  // Builder Form Fields
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [systemType, setSystemType] = useState<SystemType>('Hybrid');
  const [capacityKw, setCapacityKw] = useState<number>(5);
  const [taxRatePercent, setTaxRatePercent] = useState<number>(13.8); // Solar composite GST
  const [validDays, setValidDays] = useState<number>(30);
  const [quotationNotes, setQuotationNotes] = useState('');
  const [bomItems, setBomItems] = useState<QuotationItem[]>([]);

  const refreshList = () => {
    const list = DataService.getQuotations();
    setQuotations(list);
    if (viewQuotation) {
      const refreshed = list.find(q => q.id === viewQuotation.id) || null;
      setViewQuotation(refreshed);
    }
  };

  // Helper to auto-generate standard recommended BOM from kW and system type
  const autoGenerateBOM = (kw: number, type: SystemType) => {
    // 545W Mono PERC panels calculation
    const panelCount = Math.ceil((kw * 1000) / 545);
    const panelUnitPrice = 12800;

    const items: QuotationItem[] = [
      {
        id: `QI-${Date.now()}-1`,
        name: `Waaree 545W Mono PERC Half-Cut Panel (${panelCount} Nos)`,
        category: 'Solar Panels',
        quantity: panelCount,
        unit: 'Pieces',
        unitPrice: panelUnitPrice,
        total: panelCount * panelUnitPrice
      }
    ];

    // Inverter
    if (kw <= 5) {
      const invPrice = type === 'Hybrid' ? 88000 : 48500;
      const invName = type === 'Hybrid' ? 'Growatt 5kW Hybrid Inverter with Smart BMS' : 'Growatt 5kW 3-Phase On-Grid Inverter';
      items.push({
        id: `QI-${Date.now()}-2`,
        name: invName,
        category: 'Inverters',
        quantity: 1,
        unit: 'Units',
        unitPrice: invPrice,
        total: invPrice
      });
    } else if (kw <= 10) {
      const invPrice = type === 'Hybrid' ? 142000 : 85000;
      const invName = type === 'Hybrid' ? 'Deye 10kW Hybrid Three-Phase Inverter' : 'Solis 10kW 3-Phase On-Grid Inverter';
      items.push({
        id: `QI-${Date.now()}-2`,
        name: invName,
        category: 'Inverters',
        quantity: 1,
        unit: 'Units',
        unitPrice: invPrice,
        total: invPrice
      });
    } else {
      const invPrice = 168000;
      items.push({
        id: `QI-${Date.now()}-2`,
        name: `Growatt ${kw}kW 3-Phase Commercial Solar Inverter`,
        category: 'Inverters',
        quantity: 1,
        unit: 'Units',
        unitPrice: invPrice,
        total: invPrice
      });
    }

    // Battery if Hybrid or Off-grid
    if (type === 'Hybrid' || type === 'Off-grid') {
      const batteryCount = kw <= 5 ? 1 : 2;
      const battUnitPrice = 125000;
      items.push({
        id: `QI-${Date.now()}-3`,
        name: 'Exide 5.12 kWh LiFePO4 Smart Battery Bank',
        category: 'Batteries',
        quantity: batteryCount,
        unit: 'Units',
        unitPrice: battUnitPrice,
        total: batteryCount * battUnitPrice
      });
    }

    // Mounting structures
    const structurePrice = kw * 2800;
    items.push({
      id: `QI-${Date.now()}-4`,
      name: `HDG Anodized Aluminium Rooftop Mounting Structure (${kw} kW)`,
      category: 'Mounting Structures',
      quantity: 1,
      unit: 'Sets',
      unitPrice: structurePrice,
      total: structurePrice
    });

    // Protection ACDB / DCDB
    const dcdbPrice = 16500;
    items.push({
      id: `QI-${Date.now()}-5`,
      name: '3-Phase ACDB & DCDB IP65 Array Protection Enclosures with SPD',
      category: 'Accessories',
      quantity: 1,
      unit: 'Sets',
      unitPrice: dcdbPrice,
      total: dcdbPrice
    });

    // Balance of system cables and labor
    const bosPrice = kw * 3500 + 15000;
    items.push({
      id: `QI-${Date.now()}-6`,
      name: 'DC Solar Cabling (4 sq mm), Chemical Earthing & Turnkey Commissioning',
      category: 'Accessories',
      quantity: 1,
      unit: 'Lot',
      unitPrice: bosPrice,
      total: bosPrice
    });

    setBomItems(items);
  };

  const handleOpenCreate = () => {
    setEditingQuotationId(null);
    const firstCust = customers[0]?.id || '';
    setSelectedCustomerId(firstCust);
    setSystemType('Hybrid');
    setCapacityKw(5);
    setTaxRatePercent(13.8);
    setValidDays(30);
    setQuotationNotes('Standard MNRE guideline compliant installation. Includes DISCOM net-meter liaising & 5 years comprehensive free service visits.');
    autoGenerateBOM(5, 'Hybrid');
    setIsBuilderOpen(true);
  };

  const handleOpenEdit = (q: Quotation) => {
    setEditingQuotationId(q.id);
    setSelectedCustomerId(q.customerId);
    setSystemType(q.systemType);
    setCapacityKw(q.capacityKw);
    setTaxRatePercent(q.taxRatePercent || 13.8);
    setQuotationNotes(q.notes || '');
    setBomItems([...q.items]);
    setIsBuilderOpen(true);
  };

  // Add line item manually
  const handleAddLineItem = () => {
    const newItem: QuotationItem = {
      id: `QI-${Date.now()}`,
      name: 'Additional Accessory / Hardware',
      category: 'Accessories',
      quantity: 1,
      unit: 'Units',
      unitPrice: 5000,
      total: 5000
    };
    setBomItems([...bomItems, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const updated = [...bomItems];
    const item = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) || 0 : item.quantity;
      const p = field === 'unitPrice' ? Number(value) || 0 : item.unitPrice;
      item.total = q * p;
    }
    updated[index] = item;
    setBomItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setBomItems(bomItems.filter((_, idx) => idx !== index));
  };

  // Calculations
  const subtotal = bomItems.reduce((acc, item) => acc + item.total, 0);
  const taxAmount = Math.round((subtotal * taxRatePercent) / 100);
  const grandTotal = subtotal + taxAmount;

  const handleSaveQuotation = (status: QuotationStatus = 'Sent') => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
      showToast('Please select a valid customer.', 'error');
      return;
    }

    if (bomItems.length === 0) {
      showToast('Quotation must contain at least one BOM line item.', 'error');
      return;
    }

    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + validDays);

    const saved = DataService.saveQuotation({
      ...(editingQuotationId ? { id: editingQuotationId } : {}),
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: `${customer.address}, ${customer.city}, ${customer.state}`,
      systemType,
      capacityKw: Number(capacityKw),
      items: bomItems,
      subtotal,
      taxRatePercent,
      taxAmount,
      grandTotal,
      status,
      validUntil: expiry.toISOString().split('T')[0],
      notes: quotationNotes
    });

    showToast(`Quotation ${saved.quotationNumber} saved as ${status}.`, 'success');
    setIsBuilderOpen(false);
    refreshList();
    setViewQuotation(saved);
  };

  const handleUpdateStatus = (quoteId: string, newStatus: QuotationStatus) => {
    const updated = DataService.updateQuotationStatus(quoteId, newStatus);
    if (updated) {
      showToast(`Quotation status updated to ${newStatus}.`, 'success');
      refreshList();
    }
  };

  const handleConvertToProject = (quote: Quotation) => {
    const newProj = DataService.convertQuotationToProject(quote.id);
    if (newProj) {
      showToast(`Success! Quotation ${quote.quotationNumber} converted to Project ${newProj.projectId}.`, 'success');
      refreshList();
      setViewQuotation(null);
      onNavigateTab('installations', newProj.id);
    }
  };

  // Filters
  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = 
      q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by quote number (QT-2026-...) or customer name..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder-[#292724]/50 focus:outline-none focus:border-slate-300"
            />
          </div>

          <div className="flex items-center gap-1">
            {['All', 'Draft', 'Sent', 'Approved', 'Rejected'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45] text-white text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Quotation</span>
        </button>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Quotation #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">System Spec</th>
                <th className="py-3 px-4">BOM Items</th>
                <th className="py-3 px-4">Total Amount (Incl. GST)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                    No quotations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quote) => (
                  <tr
                    key={quote.id}
                    onClick={() => setViewQuotation(quote)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-[#C66B45]">
                      {quote.quotationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{quote.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{quote.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900">{quote.capacityKw} kW</span>
                      <span className="ml-1 text-[11px] text-slate-600">({quote.systemType})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {quote.items.length} Component Lines
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900">
                      ₹{quote.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={quote.status} type="quote" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {quote.createdAt}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setViewQuotation(quote)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-200 text-slate-900 rounded border border-slate-200 transition-colors"
                        >
                          View & Print
                        </button>
                        {quote.status !== 'Approved' && (
                          <button
                            onClick={() => handleUpdateStatus(quote.id, 'Approved')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-[#292724] hover:bg-slate-800 text-white rounded transition-colors shadow-2xs"
                            title="Manager: Approve quotation & BOM"
                          >
                            Approve
                          </button>
                        )}
                        {quote.status !== 'Approved' && (
                          <button
                            onClick={() => handleOpenEdit(quote)}
                            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                            title="Edit Quotation"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotation Builder Modal */}
      <Modal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        title={editingQuotationId ? 'Edit Solar Quotation' : 'Create Solar Quotation & Bill of Materials (BOM)'}
        subtitle="Automatic capacity sizing, equipment pricing, and tax computation"
        maxWidth="4xl"
      >
        <div className="space-y-5 text-xs">
          {/* Top Config Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="sm:col-span-1">
              <label className="block font-semibold text-slate-900 mb-1">Customer *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">System Type *</label>
              <select
                value={systemType}
                onChange={(e) => {
                  const t = e.target.value as SystemType;
                  setSystemType(t);
                  autoGenerateBOM(capacityKw, t);
                }}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
              >
                <option value="On-grid">On-grid (Grid-tied Net Meter)</option>
                <option value="Hybrid">Hybrid (Grid + LiFePO4 Storage)</option>
                <option value="Off-grid">Off-grid (Independent Battery)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Capacity (kW) *</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={500}
                  step={0.5}
                  value={capacityKw}
                  onChange={(e) => {
                    const kw = Number(e.target.value) || 1;
                    setCapacityKw(kw);
                  }}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => autoGenerateBOM(capacityKw, systemType)}
                  className="px-2.5 py-2 rounded-lg bg-slate-200 text-slate-900 font-semibold hover:bg-slate-200/80 whitespace-nowrap"
                  title="Recalculate equipment for this capacity"
                >
                  Auto-Size
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Composite Solar GST %</label>
              <input
                type="number"
                step={0.1}
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(Number(e.target.value) || 0)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-slate-300"
              />
            </div>
          </div>

          {/* BOM Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-sm">Bill of Materials (BOM) Breakdown</span>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-xs text-[#C66B45] hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Line Item</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Equipment / Item Description</th>
                    <th className="py-2.5 px-3 w-20">Qty</th>
                    <th className="py-2.5 px-3 w-24">Unit</th>
                    <th className="py-2.5 px-3 w-28">Rate (₹)</th>
                    <th className="py-2.5 px-3 w-32 text-right">Total (₹)</th>
                    <th className="py-2.5 px-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bomItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/40">
                      <td className="py-2 px-3">
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdateItem(index, 'category', e.target.value as ProductCategory)}
                          className="w-full p-1 rounded border border-slate-200 bg-white text-[11px]"
                        >
                          <option value="Solar Panels">Solar Panels</option>
                          <option value="Inverters">Inverters</option>
                          <option value="Batteries">Batteries</option>
                          <option value="Mounting Structures">Mounting Structures</option>
                          <option value="Accessories">Accessories</option>
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                          className="w-full p-1.5 rounded border border-slate-200 bg-white text-xs font-medium text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                          className="w-full p-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(index, 'unit', e.target.value)}
                          className="w-full p-1.5 rounded border border-slate-200 bg-white text-xs text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(index, 'unitPrice', e.target.value)}
                          className="w-full p-1.5 rounded border border-slate-200 bg-white font-mono text-xs text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-right text-xs text-slate-900">
                        ₹{item.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-slate-900/40 hover:text-[#C66B45]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary Box */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex-1 space-y-2">
              <label className="block font-semibold text-slate-900">Terms & Technical Scope</label>
              <textarea
                rows={2}
                value={quotationNotes}
                onChange={(e) => setQuotationNotes(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs"
              />
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Net):</span>
                <span className="font-mono font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST ({taxRatePercent}%):</span>
                <span className="font-mono font-medium">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="font-mono text-base text-[#C66B45]">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Builder Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsBuilderOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-900 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveQuotation('Draft')}
              className="px-4 py-2 rounded-lg border border-slate-900 text-slate-900 hover:bg-slate-50 font-semibold"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSaveQuotation('Sent')}
              className="px-5 py-2 rounded-lg bg-[#C66B45] text-white font-semibold hover:bg-[#C66B45]/90 shadow-sm"
            >
              Save & Send to Customer
            </button>
          </div>
        </div>
      </Modal>

      {/* Printable Quotation View Modal */}
      {viewQuotation && (
        <Modal
          isOpen={!!viewQuotation}
          onClose={() => setViewQuotation(null)}
          title={`Quotation ${viewQuotation.quotationNumber}`}
          subtitle={`Customer: ${viewQuotation.customerName} · Status: ${viewQuotation.status}`}
          maxWidth="4xl"
        >
          <div className="space-y-6 text-xs">
            {/* Top action toolbar (Hidden when printing) */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Status:</span>
                <StatusBadge status={viewQuotation.status} type="quote" />
                
                {/* Status transitions */}
                <div className="flex items-center gap-1 ml-2">
                  {viewQuotation.status !== 'Approved' && (
                    <button
                      onClick={() => handleUpdateStatus(viewQuotation.id, 'Approved')}
                      className="px-2 py-1 rounded bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-900"
                    >
                      Mark Approved
                    </button>
                  )}
                  {viewQuotation.status !== 'Rejected' && viewQuotation.status !== 'Approved' && (
                    <button
                      onClick={() => handleUpdateStatus(viewQuotation.id, 'Rejected')}
                      className="px-2 py-1 rounded bg-[#C66B45]/10 text-[#C66B45] text-[11px] font-semibold hover:bg-[#C66B45]/20"
                    >
                      Mark Rejected
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {viewQuotation.status === 'Approved' && !viewQuotation.convertedToProjectId && (
                  <button
                    onClick={() => handleConvertToProject(viewQuotation)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C66B45] text-white font-semibold text-xs hover:bg-[#C66B45]/90 shadow-sm animate-pulse"
                  >
                    <Sun className="w-4 h-4" />
                    <span>Convert to Installation Project</span>
                  </button>
                )}

                {viewQuotation.convertedToProjectId && (
                  <button
                    onClick={() => {
                      setViewQuotation(null);
                      onNavigateTab('installations', viewQuotation.convertedToProjectId);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs"
                  >
                    <span>View Project {viewQuotation.convertedToProjectId}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-200"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Quotation</span>
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6 print:border-none print:p-0">
              {/* Document Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-[#C66B45] text-white flex items-center justify-center font-bold">
                      <Sun className="w-4 h-4" />
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">SunPower Technologies Pvt Ltd</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Govt. Approved MNRE Channel Partner · CIN: U40106PN2023PTC199482
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    SunPower Towers, Baner Tech Park, Pune, Maharashtra 411045 · support@sunpower.in
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-xs uppercase tracking-wider font-bold text-[#C66B45]">Official Proposal</span>
                  <p className="text-base font-bold font-mono text-slate-900">{viewQuotation.quotationNumber}</p>
                  <p className="text-slate-600 font-mono text-[11px]">Date: {viewQuotation.createdAt}</p>
                  <p className="text-slate-600 font-mono text-[11px]">Valid Until: {viewQuotation.validUntil}</p>
                </div>
              </div>

              {/* Customer & Technical Summary Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Client Bill To:</p>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">{viewQuotation.customerName}</p>
                  <p className="text-slate-600 text-xs">{viewQuotation.customerAddress}</p>
                  <p className="text-slate-600 text-xs font-mono mt-0.5">Contact: {viewQuotation.customerPhone}</p>
                </div>

                <div className="sm:text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Solar Installation Specs:</p>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">
                    {viewQuotation.capacityKw} kWp Rooftop System
                  </p>
                  <p className="text-slate-600 text-xs">Architecture: {viewQuotation.systemType} Setup</p>
                  <p className="text-slate-600 text-xs">Estimated Daily Generation: ~{viewQuotation.capacityKw * 4.5} kWh / Units</p>
                </div>
              </div>

              {/* Equipment Items Table */}
              <div>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="py-2.5 px-3 w-8">#</th>
                      <th className="py-2.5 px-3">Component / Specification</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Subtotal (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {viewQuotation.items.map((it, idx) => (
                      <tr key={it.id} className="hover:bg-slate-50/30">
                        <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{it.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{it.category}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{it.quantity} {it.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono">₹{it.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                          ₹{it.total.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Warranties block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#C66B45]" />
                    <span>Manufacturer Warranty Coverage:</span>
                  </p>
                  <ul className="text-slate-700 space-y-1 text-[11px]">
                    <li>• <strong>Solar PV Modules:</strong> 20 Years Performance Warranty (MNRE certified)</li>
                    <li>• <strong>Solar Inverter:</strong> 2 Years Full Replacement Warranty</li>
                    <li>• <strong>Battery Bank (if supplied):</strong> 2 Years LiFePO4 Manufacturer Warranty</li>
                    <li>• <strong>Workmanship & Structure:</strong> 5 Years SunPower Service Guarantee</li>
                  </ul>
                  {viewQuotation.notes && (
                    <p className="text-[11px] text-slate-600 pt-2 italic">
                      Special Note: {viewQuotation.notes}
                    </p>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Equipment Value:</span>
                    <span className="font-mono font-medium">₹{viewQuotation.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST ({viewQuotation.taxRatePercent || 13.8}%):</span>
                    <span className="font-mono font-medium">₹{viewQuotation.taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                    <span>Total Investment:</span>
                    <span className="font-mono text-lg text-[#C66B45]">₹{viewQuotation.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right pt-1">
                    Inclusive of supply, freight, installation, DISCOM testing & documentation.
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <p className="font-semibold text-slate-900">For SunPower Technologies Pvt Ltd</p>
                  <div className="h-12 flex items-end">
                    <span className="font-serif italic text-sm text-slate-500">Authorized Signatory</span>
                  </div>
                  <p className="text-[10px] text-slate-400 border-t border-slate-200 pt-1">Project Technical Director</p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-900">Customer Acceptance</p>
                  <div className="h-12 flex items-end justify-end">
                    <span className="italic text-xs text-slate-400">Signature / Seal & Date</span>
                  </div>
                  <p className="text-[10px] text-slate-400 border-t border-slate-200 pt-1">{viewQuotation.customerName}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
