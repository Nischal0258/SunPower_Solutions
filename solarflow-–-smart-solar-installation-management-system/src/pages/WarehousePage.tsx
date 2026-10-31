import React, { useState } from 'react';
import {
  Truck,
  Scan,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Package,
  Calendar,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Boxes,
  ArrowRight
} from 'lucide-react';
import { DataService } from '../services/dataService';
import { InstallationProject } from '../types';
import { SerialNumberScanModal } from '../components/common/SerialNumberScanModal';
import { useToast } from '../components/common/Toast';
import { NavTab } from '../types/roles';

interface WarehousePageProps {
  onNavigateTab?: (tab: NavTab, targetId?: string) => void;
}

export const WarehousePage: React.FC<WarehousePageProps> = ({ onNavigateTab }) => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<InstallationProject[]>(DataService.getProjects());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<string>('All');

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [targetProject, setTargetProject] = useState<InstallationProject | null>(null);

  // Scanned serials map (projectId -> array of serials)
  const [scannedSerials, setScannedSerials] = useState<Record<string, string[]>>({
    'PRJ-2026-042': ['INV-3KW-9901-X', 'PNL-LOT-545W-44'],
  });

  const refreshList = () => {
    setProjects(DataService.getProjects());
  };

  // Filter projects relevant to warehouse dispatch
  const dispatchProjects = projects.filter(p => {
    const isDispatchEligible =
      p.stage === 'Survey Completed' ||
      p.stage === 'Material Ready' ||
      p.stage === 'Installation Scheduled';

    const matchesSearch =
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerAddress.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStage === 'All' || p.stage === filterStage;

    return isDispatchEligible && matchesSearch && matchesFilter;
  });

  const handleScanSerial = (code: string) => {
    if (!targetProject) {
      showToast(`Scanned equipment serial number: ${code}`, 'info');
      return;
    }
    const pid = targetProject.projectId || targetProject.id;
    const existing = scannedSerials[pid] || [];
    if (!existing.includes(code)) {
      setScannedSerials(prev => ({
        ...prev,
        [pid]: [...(prev[pid] || []), code]
      }));
    }
    showToast(`Serial number ${code} registered for order ${pid}`, 'success');
  };

  const handleAuthorizeDispatch = (proj: InstallationProject) => {
    const pid = proj.projectId || proj.id;
    const serials = scannedSerials[pid] || [];

    if (serials.length === 0) {
      showToast('Mandatory Inverter serial number scan required before authorizing truck departure.', 'error');
      return;
    }

    // Register 20-year and 2-year warranty clocks automatically
    serials.forEach(s => {
      const isPanel = s.includes('PNL');
      DataService.registerWarranty({
        serialNumber: s,
        productCategory: s.includes('BAT') ? 'Batteries' : isPanel ? 'Solar Panels' : 'Inverters',
        productName: s.includes('BAT')
          ? 'Exide LiFePO4 Battery Bank'
          : isPanel
          ? 'Waaree Mono-PERC Panel Lot'
          : 'Growatt Single-Phase Inverter',
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
    showToast(
      `Order ${pid} authorized for truck departure! 2-Year Inverter Warranty Clock auto-activated.`,
      'success'
    );
    refreshList();
  };

  const totalAwaiting = projects.filter(p => p.stage === 'Survey Completed').length;
  const totalReady = projects.filter(p => p.stage === 'Material Ready').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#C66B45] text-white text-[10px] font-bold uppercase tracking-wider">
              Scene 3 Engine
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Warehouse & Logistics Dispatch Hub
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Verify high-value serialized equipment, scan hardware serial numbers, and authorize truck departures. Every dispatch automatically initiates the customer's 2-Year and 20-Year warranty clocks.
          </p>
        </div>

        <button
          onClick={() => {
            setTargetProject(dispatchProjects[0] || null);
            setIsScannerOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
        >
          <Scan className="w-4 h-4" />
          <span>Scan Equipment Serial</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-600 font-medium block">Awaiting Packing</span>
          <span className="text-xl font-bold text-[#C66B45] mt-1 block">{totalAwaiting} Orders</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-600 font-medium block">Ready for Truck</span>
          <span className="text-xl font-bold text-emerald-600 mt-1 block">{totalReady} Staged</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-600 font-medium block">Active Warranty Clocks</span>
          <span className="text-xl font-bold text-blue-600 mt-1 block">{DataService.getWarranties().length} Units</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-600 font-medium block">Serial Scanner Status</span>
          <span className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Optical Ready
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, customer name or city..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#C66B45]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#C66B45]"
          >
            <option value="All">All Dispatch Stages</option>
            <option value="Survey Completed">Awaiting Packing (Gate Passed)</option>
            <option value="Material Ready">Material Ready / Staged</option>
            <option value="Installation Scheduled">Installation Scheduled</option>
          </select>
        </div>
      </div>

      {/* Dispatch Orders List */}
      <div className="space-y-4">
        {dispatchProjects.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500 space-y-2">
            <Package className="w-8 h-8 text-slate-900/30 mx-auto" />
            <p className="font-semibold text-slate-900">No orders pending warehouse dispatch.</p>
            <p className="text-[11px]">All approved customer installations have been packed and staged for truck departure.</p>
          </div>
        ) : (
          dispatchProjects.map((proj) => {
            const pid = proj.projectId || proj.id;
            const serials = scannedSerials[pid] || [];
            const hasInverter = serials.some(s => s.includes('INV'));
            const isReady = proj.stage === 'Material Ready';

            return (
              <div
                key={proj.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-[#C66B45]/40 transition-colors"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#C66B45] text-sm">{pid}</span>
                      <span className="font-bold text-slate-900 text-sm">{proj.customerName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-900">
                        {proj.capacityKw} kW {proj.systemType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {proj.customerAddress} • {proj.customerPhone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isReady ? '✔ Material Staged & Serialized' : 'Packing In Progress'}
                    </span>
                  </div>
                </div>

                {/* Packing Specs & Serial Numbers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Bill of Materials Box */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="font-semibold text-slate-900 text-[11px] block">
                      Required Hardware Staging:
                    </span>
                    <div className="space-y-1 text-[11px] text-slate-700">
                      <div>• Mono-PERC 545W Panels ({Math.round(proj.capacityKw * 2)} Units)</div>
                      <div>• {proj.capacityKw} kW MPPT Inverter (1 Unit)</div>
                      {proj.systemType !== 'On-grid' && (
                        <div>• LiFePO4 Solar Battery Bank (1 Set)</div>
                      )}
                      <div>• Aluminum Mounting Legs & Earthing Chemical</div>
                    </div>
                  </div>

                  {/* Scanned Serials Section */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-[11px]">
                        Scanned Equipment Serial Numbers:
                      </span>
                      <button
                        onClick={() => {
                          setTargetProject(proj);
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
                        <div className="text-[11px] text-amber-800 italic flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>No serial numbers scanned yet. Please scan the Inverter serial number to verify equipment.</span>
                        </div>
                      ) : (
                        serials.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded bg-white border border-slate-200 font-mono text-[11px] font-bold text-slate-900 flex items-center gap-1.5 shadow-2xs"
                          >
                            <QrCode className="w-3 h-3 text-[#C66B45]" />
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-[11px]">
                    {hasInverter ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Inverter serial confirmed. Ready for truck departure.
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Inverter serial scan required by quality protocol.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTargetProject(proj);
                        setIsScannerOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-900 flex items-center gap-1.5 transition-colors"
                    >
                      <Scan className="w-3.5 h-3.5 text-[#C66B45]" />
                      <span>Scan Serial Number</span>
                    </button>

                    <button
                      onClick={() => handleAuthorizeDispatch(proj)}
                      className="px-4 py-1.5 rounded-lg bg-[#C66B45] text-white text-xs font-bold hover:bg-[#C66B45]/90 transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Authorize Departure & Start Warranty</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Serial Number Scan Modal */}
      <SerialNumberScanModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanSerial}
        targetItemName={targetProject ? `${targetProject.customerName} (${targetProject.projectId})` : 'Warehouse Box'}
        expectedCategory="Inverters"
      />
    </div>
  );
};