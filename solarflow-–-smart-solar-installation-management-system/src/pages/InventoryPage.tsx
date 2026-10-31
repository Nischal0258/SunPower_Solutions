import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Truck,
  Scan,
  QrCode,
  ClipboardCheck,
  AlertTriangle,
  History,
  Edit2,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Boxes
} from 'lucide-react';
import { DataService } from '../services/dataService';
import { InventoryItem, ProductCategory, StockStatus, StockMovement, InstallationProject } from '../types';
import { SerialNumberScanModal } from '../components/common/SerialNumberScanModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';

interface InventoryPageProps {
  initialProductId?: string;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ initialProductId }) => {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>(DataService.getInventory());
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(DataService.getStockMovements());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('All');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<InventoryItem | null>(null);
  const [viewMode, setViewMode] = useState<'inventory' | 'dispatch'>('inventory');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [targetDispatchProject, setTargetDispatchProject] = useState<InstallationProject | null>(null);
  const [projects, setProjects] = useState<InstallationProject[]>(DataService.getProjects());
  const [scannedSerials, setScannedSerials] = useState<Record<string, string[]>>({
    'PRJ-2026-042': ['INV-3KW-9901-X', 'PNL-LOT-545W-44'],
  });

  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Solar Panels' as ProductCategory,
    model: '',
    brand: '',
    supplier: '',
    quantity: 10,
    minStockAlert: 5,
    unit: 'Pieces',
    unitPrice: 12000,
    location: 'Warehouse Bay A',
    serialNumberRequired: true,
    warrantyPeriodYears: 20
  });

  // Adjust stock form state
  const [adjustType, setAdjustType] = useState<'Stock In' | 'Stock Out'>('Stock In');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<string>('');

  
  const handleDispatchScan = (code: string) => {
    if (!targetDispatchProject) {
      showToast(`Scanned equipment serial number: ${code}`, 'info');
      setSearchQuery(code);
      return;
    }
    const pid = targetDispatchProject.projectId || targetDispatchProject.id;
    const existing = scannedSerials[pid] || [];
    if (!existing.includes(code)) {
      setScannedSerials(prev => ({
        ...prev,
        [pid]: [...(prev[pid] || []), code]
      }));
    }
    showToast(`Scanned ${code} for order ${pid}`, 'success');
  };

  const handleAuthorizeDispatch = (proj: InstallationProject) => {
    const pid = proj.projectId || proj.id;
    const serials = scannedSerials[pid] || [];
    if (serials.length === 0) {
      showToast('Please scan at least one Inverter / Battery serial number before dispatch.', 'error');
      return;
    }

    // Register warranties
    serials.forEach(s => {
      const isPanel = s.includes('PNL');
      DataService.registerWarranty({
        serialNumber: s,
        productCategory: s.includes('BAT') ? 'Batteries' : isPanel ? 'Solar Panels' : 'Inverters',
        productName: s.includes('BAT') ? 'LiFePO4 Battery Bank' : isPanel ? 'Mono-PERC Solar Panel' : 'Grid-Tied Solar Inverter',
        model: 'Certified OEM Unit',
        customerId: proj.customerId,
        customerName: proj.customerName,
        customerPhone: proj.customerPhone,
        customerAddress: proj.customerAddress,
        projectId: pid,
        deliveryDate: new Date().toISOString().split('T')[0],
        warrantyYears: isPanel ? 20 : 2
      });
    });

    DataService.updateProjectStage(proj.id, 'Material Ready');
    showToast(`Order ${pid} dispatched! 2-Year Inverter Warranty Clock auto-activated.`, 'success');
    setProjects(DataService.getProjects());
    refreshList();
  };

  const refreshList = () => {
    setInventory(DataService.getInventory());
    setStockMovements(DataService.getStockMovements());
  };

  const categories: ('All' | ProductCategory)[] = [
    'All',
    'Solar Panels',
    'Inverters',
    'Batteries',
    'Mounting Structures',
    'Accessories'
  ];

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      name: '',
      category: 'Solar Panels',
      model: '',
      brand: '',
      supplier: '',
      quantity: 10,
      minStockAlert: 5,
      unit: 'Pieces',
      unitPrice: 12000,
      location: 'Warehouse Bay A',
      serialNumberRequired: true,
      warrantyPeriodYears: 20
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      sku: item.sku,
      name: item.name,
      category: item.category,
      model: item.model,
      brand: item.brand,
      supplier: item.supplier,
      quantity: item.quantity,
      minStockAlert: item.minStockAlert,
      unit: item.unit,
      unitPrice: item.unitPrice,
      location: item.location,
      serialNumberRequired: item.serialNumberRequired,
      warrantyPeriodYears: item.warrantyPeriodYears
    });
    setIsAddEditOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.sku.trim()) {
      showToast('Product name and SKU are required.', 'error');
      return;
    }

    if (formData.quantity < 0) {
      showToast('Quantity cannot be negative.', 'error');
      return;
    }

    // Default warranties: Panels 20 yrs, Inverters 2 yrs, Batteries 2 yrs
    let warrantyYears = formData.warrantyPeriodYears;
    if (formData.category === 'Solar Panels') warrantyYears = 20;
    else if (formData.category === 'Inverters' || formData.category === 'Batteries') warrantyYears = 2;

    const res = DataService.saveInventoryItem({
      ...(editingItem ? { id: editingItem.id } : {}),
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      category: formData.category,
      model: formData.model.trim(),
      brand: formData.brand.trim(),
      supplier: formData.supplier.trim(),
      quantity: Number(formData.quantity) || 0,
      minStockAlert: Number(formData.minStockAlert) || 0,
      unit: formData.unit.trim(),
      unitPrice: Number(formData.unitPrice) || 0,
      location: formData.location.trim(),
      serialNumberRequired: formData.serialNumberRequired,
      warrantyPeriodYears: warrantyYears
    });

    if (!res.success) {
      showToast(res.error || 'Failed to save inventory item.', 'error');
      return;
    }

    showToast(`Product "${formData.name}" saved successfully.`, 'success');
    setIsAddEditOpen(false);
    refreshList();
  };

  const handleOpenAdjust = (item: InventoryItem) => {
    setAdjustingItem(item);
    setAdjustType('Stock In');
    setAdjustQuantity(5);
    setAdjustReason('PO Consignment Received');
  };

  const handleExecuteStockAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    if (adjustQuantity <= 0) {
      showToast('Quantity must be greater than zero.', 'error');
      return;
    }

    const currentQty = adjustingItem.quantity;
    let newQty = currentQty;

    if (adjustType === 'Stock In') {
      newQty = currentQty + adjustQuantity;
    } else {
      if (currentQty < adjustQuantity) {
        showToast(`Cannot remove ${adjustQuantity} units. Only ${currentQty} units in stock.`, 'error');
        return;
      }
      newQty = currentQty - adjustQuantity;
    }

    const res = DataService.saveInventoryItem({
      ...adjustingItem,
      quantity: newQty
    });

    if (res.success) {
      showToast(`Stock updated: ${adjustingItem.name} now at ${newQty} ${adjustingItem.unit}.`, 'success');
      setAdjustingItem(null);
      refreshList();
    }
  };

  const handleDelete = (item: InventoryItem) => {
    setDeleteConfirmItem(item);
  };

  const confirmDelete = () => {
    if (!deleteConfirmItem) return;
    DataService.deleteInventoryItem(deleteConfirmItem.id);
    showToast(`Product ${deleteConfirmItem.name} removed from inventory.`, 'info');
    setDeleteConfirmItem(null);
    refreshList();
  };

  // Low stock items
  const lowStockItems = inventory.filter(i => i.quantity <= i.minStockAlert);

  // Filtered inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = stockStatusFilter === 'All' || item.stockStatus === stockStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const pendingDispatchProjects = projects.filter(
    p => p.stage === 'Survey Completed' || p.stage === 'Material Ready' || p.stage === 'Installation Scheduled'
  );

  return (
    <div className="space-y-5">
      {/* Top Switcher: Inventory Stock vs Warehouse Dispatch Queue */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setViewMode('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            viewMode === 'inventory'
              ? 'bg-[#C66B45] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Warehouse Stock ({inventory.length} Products)</span>
        </button>

        <button
          onClick={() => setViewMode('dispatch')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            viewMode === 'dispatch'
              ? 'bg-[#C66B45] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Warehouse Dispatch Queue ({pendingDispatchProjects.length} Orders Awaiting Packing)</span>
        </button>
      </div>

      {viewMode === 'dispatch' ? (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="text-xs font-bold text-emerald-950">Scene 3: Warehouse Serial Scan Dispatch & Serial Engine</h3>
                <p className="text-[11px] text-emerald-800">
                  Scan physical serial numbers for high-value Inverters & Batteries before truck dispatch. Scanning automatically initiates the 2-Year and 20-Year warranty clocks.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setTargetDispatchProject(pendingDispatchProjects[0] || null);
                setIsScannerOpen(true);
              }}
              className="px-3.5 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs hover:bg-slate-900"
            >
              <Scan className="w-4 h-4 text-amber-600" />
              <span>Scan Equipment Serial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingDispatchProjects.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                All confirmed customer orders have been dispatched! No orders currently pending warehouse packing.
              </div>
            ) : (
              pendingDispatchProjects.map(proj => {
                const pid = proj.projectId || proj.id;
                const serials = scannedSerials[pid] || [];
                const hasInverter = serials.some(s => s.includes('INV'));

                return (
                  <div key={proj.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#C66B45] text-sm">{pid}</span>
                          <span className="font-bold text-slate-900 text-sm">{proj.customerName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-900">
                            {proj.capacityKw} kW {proj.systemType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{proj.customerAddress} • {proj.customerPhone}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          proj.stage === 'Material Ready' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {proj.stage === 'Material Ready' ? '✔ Dispatched & Serialized' : 'Ready for Packing'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-semibold text-slate-900 text-[11px] block">Required Hardware Kit:</span>
                        <div className="space-y-0.5 text-[11px] text-slate-700">
                          <div>• Mono-PERC Panels ({Math.round(proj.capacityKw * 2)} Nos)</div>
                          <div>• Inverter ({proj.capacityKw} kW MPPT)</div>
                          <div>• Elevated Aluminum Structure Set</div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 text-[11px]">Scanned Serial Numbers:</span>
                          <button
                            onClick={() => {
                              setTargetDispatchProject(proj);
                              setIsScannerOpen(true);
                            }}
                            className="text-[10px] font-bold text-[#C66B45] hover:underline flex items-center gap-1"
                          >
                            <Scan className="w-3 h-3" />
                            <span>Serial Number Scan</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {serials.length === 0 ? (
                            <span className="text-[11px] text-amber-800 italic">
                              No serial numbers scanned yet. Scan inverter serial number to proceed.
                            </span>
                          ) : (
                            serials.map(s => (
                              <span key={s} className="px-2 py-1 rounded bg-white border border-slate-200 font-mono text-[11px] font-bold text-slate-900 flex items-center gap-1">
                                <QrCode className="w-3 h-3 text-[#C66B45]" />
                                {s}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="text-[11px] text-slate-600">
                        {hasInverter ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            ✔ Inverter serial verified. Ready for truck departure.
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            ⚠️ Inverter serial number scan required before dispatch.
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setTargetDispatchProject(proj);
                            setIsScannerOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-900 flex items-center gap-1.5"
                        >
                          <Scan className="w-3.5 h-3.5 text-[#C66B45]" />
                          <span>Scan Asset</span>
                        </button>
                        <button
                          onClick={() => handleAuthorizeDispatch(proj)}
                          className="px-4 py-1.5 rounded-lg bg-[#C66B45] text-white text-xs font-bold hover:bg-[#C66B45]/90 transition-colors shadow-xs flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Authorize Dispatch & Start Warranty</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <>
      {/* Low Stock Warning Banner if applicable */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-[#C66B45]/10 border border-[#C66B45]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C66B45] text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#C66B45] text-sm">
                Low Stock Threshold Alert ({lowStockItems.length} Products Critical)
              </p>
              <p className="text-slate-700 mt-0.5">
                The following equipment is below safety replenishment stock: {lowStockItems.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setStockStatusFilter('Low Stock');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#C66B45] text-white font-semibold hover:bg-[#C66B45]/90 whitespace-nowrap self-start sm:self-center"
          >
            Filter Low Stock Items
          </button>
        </div>
      )}

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, SKU, model or supplier..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder-[#292724]/50 focus:outline-none focus:border-slate-300"
            />
          </div>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
          >
            <option value="All">All Stock Levels</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsMovementModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs font-semibold hover:bg-slate-50"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span>Stock Movement Log</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45] text-white text-xs font-semibold hover:bg-[#C66B45]/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-2 rounded-lg font-medium border transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">SKU & Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Model & Brand</th>
                <th className="py-3 px-4">Stock Quantity</th>
                <th className="py-3 px-4">Min. Buffer</th>
                <th className="py-3 px-4">Unit Rate</th>
                <th className="py-3 px-4">Warehouse Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-500">
                    No inventory items found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{item.sku}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 font-medium">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-900">{item.model}</div>
                      <div className="text-[11px] text-slate-500">{item.brand}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900">
                      {item.quantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {item.minStockAlert} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      ₹{item.unitPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.location}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.stockStatus} type="stock" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-200 text-slate-900 rounded border border-slate-200 transition-colors"
                          title="Quick In/Out adjustment"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1 rounded text-[#C66B45]/70 hover:text-[#C66B45] hover:bg-[#C66B45]/10"
                          title="Delete Product"
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

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingItem ? `Edit Product: ${editingItem.name}` : 'Register New Inventory Product'}
        subtitle="Catalog solar panels, inverters, batteries and accessories with warranty rules"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Waaree 545W Mono PERC Half-Cut Panel"
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Catalog SKU Code *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. SP-WAR-545M"
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-mono focus:outline-none focus:border-slate-300"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
              >
                <option value="Solar Panels">Solar Panels (20 Yr Warranty)</option>
                <option value="Inverters">Inverters (2 Yr Warranty)</option>
                <option value="Batteries">Batteries (2 Yr Warranty)</option>
                <option value="Mounting Structures">Mounting Structures</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Model / Part No.</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. WS-545-M10"
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Brand Manufacturer</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Waaree Energies"
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Current Stock Quantity *</label>
              <input
                type="number"
                min={0}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Min. Stock Alert Threshold *</label>
              <input
                type="number"
                min={0}
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Measurement Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Pieces, Units, Sets"
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Unit Purchase Price (₹)</label>
              <input
                type="number"
                min={0}
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Supplier / Vendor</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="e.g. Waaree National Distribution"
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Warehouse Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Bay A-1, Rack 3"
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddEditOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#C66B45] text-white font-semibold hover:bg-[#C66B45]/90 shadow-sm"
            >
              {editingItem ? 'Update Product' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjustment Modal */}
      {adjustingItem && (
        <Modal
          isOpen={!!adjustingItem}
          onClose={() => setAdjustingItem(null)}
          title={`Adjust Stock: ${adjustingItem.name}`}
          subtitle={`Current stock: ${adjustingItem.quantity} ${adjustingItem.unit} (SKU: ${adjustingItem.sku})`}
          maxWidth="md"
        >
          <form onSubmit={handleExecuteStockAdjust} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-900 mb-1.5">Adjustment Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('Stock In')}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                    adjustType === 'Stock In'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-900 border-slate-200'
                  }`}
                >
                  + Stock In (Receive)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('Stock Out')}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                    adjustType === 'Stock Out'
                      ? 'bg-[#C66B45] text-white border-[#C66B45]'
                      : 'bg-white text-slate-900 border-slate-200'
                  }`}
                >
                  - Stock Out (Dispatch)
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">
                Quantity to {adjustType} *
              </label>
              <input
                type="number"
                min={1}
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-slate-300"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                New resulting inventory will be:{' '}
                <strong>
                  {adjustType === 'Stock In'
                    ? adjustingItem.quantity + adjustQuantity
                    : Math.max(0, adjustingItem.quantity - adjustQuantity)}{' '}
                  {adjustingItem.unit}
                </strong>
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Reference Reason</label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. PO Receipt, Damaged Unit, Return"
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#C66B45] text-white font-semibold hover:bg-[#C66B45]/90"
              >
                Apply Stock Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Stock Movements Log Modal */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title="Warehouse Stock Movement History"
        subtitle="Chronological log of factory receipts, project dispatches and adjustments"
        maxWidth="3xl"
      >
        <div className="space-y-4 text-xs">
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 font-mono text-center">Quantity</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stockMovements.map((sm) => (
                  <tr key={sm.id} className="hover:bg-slate-50/30">
                    <td className="py-2.5 px-3 font-mono text-slate-600">{sm.date}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        sm.type === 'Stock In' ? 'bg-slate-900 text-white' :
                        sm.type === 'Stock Out' ? 'bg-[#C66B45]/15 text-[#C66B45]' :
                        'bg-slate-100 text-slate-900'
                      }`}>
                        {sm.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{sm.productName}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-center text-slate-900">
                      {sm.type === 'Stock In' ? '+' : '-'}{sm.quantity}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{sm.reference}</td>
                    <td className="py-2.5 px-3 text-slate-500">{sm.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <Modal
          isOpen={!!deleteConfirmItem}
          onClose={() => setDeleteConfirmItem(null)}
          title="Delete Inventory Product"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-900">
              Are you sure you want to delete <strong>{deleteConfirmItem.name}</strong> (SKU: {deleteConfirmItem.sku})?
            </p>
            <p className="text-[#C66B45] bg-[#C66B45]/10 p-2 rounded-lg border border-[#C66B45]/30">
              This SKU will be removed from future quotations and warehouse allocation.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-lg bg-[#C66B45] text-white font-semibold hover:bg-[#C66B45]/90"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
        </>
      )}

      {/* Serial Number Scan Modal */}
      <SerialNumberScanModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleDispatchScan}
        targetItemName={targetDispatchProject ? `${targetDispatchProject.customerName} (${targetDispatchProject.projectId})` : 'Warehouse Inventory Box'}
        expectedCategory="Inverters"
      />
    </div>
  );
};
