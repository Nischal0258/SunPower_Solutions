import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
  Plus,
  Trash2,
  Clock,
  KeyRound,
  Lock,
  Layers,
  Cpu,
  Battery,
  Sun
} from 'lucide-react';
import { DataService } from '../services/dataService';
import { InstallationProject } from '../types';
import { useToast } from '../components/common/Toast';
import { NavTab } from '../components/layout/Sidebar';
import { StatusBadge } from '../components/common/StatusBadge';

interface WarehousePageProps {
  onNavigateTab: (tab: NavTab, targetId?: string) => void;
}

export const WarehousePage: React.FC<WarehousePageProps> = ({ onNavigateTab }) => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<InstallationProject[]>(() => DataService.getProjects());

  // Active project selection for dispatch
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const list = DataService.getProjects();
    // Prefer Feasibility Approved project if any exists
    const ready = list.find(p => p.stage === 'Feasibility Approved');
    return ready?.id || list[0]?.id || 'PRJ-2026-044';
  });

  // Manual serial numbers for the active project
  const [moduleSerialsInput, setModuleSerialsInput] = useState('PV-WA-540-9901..9920');
  const [inverterSerialInput, setInverterSerialInput] = useState('INV-GW-5000-8831');
  const [batterySerialInput, setBatterySerialInput] = useState('BAT-PY-48100-2401');
  const [truckNoInput, setTruckNoInput] = useState('MH-12-RN-8831');
  const [driverNameInput, setDriverNameInput] = useState('Ramesh Patil (+91 98230 44912)');

  const refreshProjects = () => {
    setProjects(DataService.getProjects());
  };

  useEffect(() => {
    const handleUpdate = () => refreshProjects();
    window.addEventListener('sunpower_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sunpower_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Check if project is unlocked for dispatch
  const isUnlockedForDispatch = activeProject?.stage === 'Feasibility Approved';
  const isAlreadyDispatched =
    activeProject?.stage === 'Hardware Dispatched' ||
    activeProject?.stage === 'Installation & Handover Completed' ||
    activeProject?.stage === 'Commissioned & Closed';

  // Dispatch Action
  const handleDispatchHardware = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    if (!isUnlockedForDispatch) {
      showToast('Cannot dispatch: Project must be in "Feasibility Approved" stage.', 'error');
      return;
    }

    if (!inverterSerialInput.trim()) {
      showToast('Mandatory Inverter Serial Number entry required before dispatch.', 'warning');
      return;
    }

    const success = DataService.dispatchWarehouseHardware(activeProject.id, {
      moduleSerials: moduleSerialsInput.trim() || 'PV-WA-540-9901..9920',
      inverterSerial: inverterSerialInput.trim(),
      batterySerial: activeProject.systemType === 'Hybrid' ? (batterySerialInput.trim() || 'BAT-PY-48100-2401') : 'N/A (On-Grid)',
      truckNo: truckNoInput.trim() || 'MH-12-RN-8831',
      driverName: driverNameInput.trim() || 'Ramesh Patil',
      notes: 'Hardware staged, verified against BOM, and departed central warehouse.'
    });

    if (success) {
      showToast(`Hardware dispatched for ${activeProject.customerName}! Assigned technician notified.`, 'success');
      refreshProjects();
    } else {
      showToast('Failed to dispatch hardware.', 'error');
    }
  };

  // Calculate BOM quantities
  const panelCount = activeProject ? Math.max(8, Math.round((activeProject.capacityKw * 1000) / 545)) : 18;

  return (
    <div className="space-y-6 pb-12 text-xs font-sans">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-[#E7E2D9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#C66B45]" />
            <h2 className="text-base sm:text-lg font-bold text-[#292724]">Warehouse Dispatch & Logistics Hub</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-[#C66B45] border border-amber-200">
              Logistics Portal
            </span>
          </div>
          <p className="text-xs text-[#292724]/70 mt-1">
            Manual serial registration, staging verification, and truck departure authorization strictly gated by Director Feasibility Approval.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('inventory')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E7E2D9] bg-white text-[#292724] font-semibold hover:bg-[#F5F3EF] shadow-2xs self-start sm:self-auto"
        >
          <Package className="w-4 h-4 text-[#292724]/70" />
          <span>Check Inventory Stock</span>
        </button>
      </div>

      {/* Main Grid: Orders Queue & Staging Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dispatch Queue */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#E7E2D9] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D9]">
            <div>
              <h3 className="font-bold text-sm text-[#292724]">Installation Orders Queue</h3>
              <p className="text-[11px] text-slate-500">Only Feasibility Approved orders can be staged</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
              {projects.length} Orders
            </span>
          </div>

          <div className="space-y-2.5">
            {projects.map((proj) => {
              const isSelected = selectedProjectId === proj.id;
              const isApproved = proj.stage === 'Feasibility Approved';
              const isDispatched =
                proj.stage === 'Hardware Dispatched' ||
                proj.stage === 'Installation & Handover Completed' ||
                proj.stage === 'Commissioned & Closed';
              const isLocked = !isApproved && !isDispatched;

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/50 border-[#C66B45] ring-1 ring-[#C66B45] shadow-xs'
                      : 'bg-white border-[#E7E2D9] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#292724]">{proj.id}</span>
                        <span className="text-[10px] text-slate-400">• {proj.capacityKw} kW</span>
                      </div>
                      <h4 className="font-semibold text-xs text-slate-800 mt-0.5">{proj.customerName}</h4>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {proj.customerAddress}
                      </p>
                    </div>

                    <div className="text-right">
                      {isApproved ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Ready for Dispatch
                        </span>
                      ) : isDispatched ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-white">
                          Dispatched
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {isLocked && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-amber-700 font-medium">
                      <Lock className="w-3 h-3 shrink-0" />
                      <span>Locked — Awaiting Director Feasibility Approval</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Manual Serial Entry & Staging Details */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#E7E2D9] shadow-xs space-y-5">
          {activeProject ? (
            <>
              {/* Active Project Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D9]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#C66B45]">{activeProject.id}</span>
                    <span className="text-xs text-slate-400">• {activeProject.capacityKw} kW {activeProject.systemType}</span>
                  </div>
                  <h3 className="font-bold text-base text-[#292724] mt-0.5">{activeProject.customerName}</h3>
                  <p className="text-[11px] text-slate-500">Destination: {activeProject.customerAddress}</p>
                </div>

                <div>
                  <StatusBadge status={activeProject.stage} type="stage" />
                </div>
              </div>

              {/* Locked Warning Banner (if not Feasibility Approved and not dispatched) */}
              {!isUnlockedForDispatch && !isAlreadyDispatched && (
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Locked — Awaiting Director Feasibility Approval</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    This order is currently at stage <strong className="font-mono">{activeProject.stage}</strong>. Warehouse staging and equipment serial allocation are strictly locked until the lead technician completes the on-site technical feasibility survey and the Director approves the roof structure and tilt.
                  </p>
                </div>
              )}

              {/* Bill of Materials (BOM) Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#292724] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#C66B45]" />
                    <span>Bill of Materials (BOM) for {activeProject.capacityKw} kW System</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 font-bold border border-slate-200">
                    BOM Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                      <Sun className="w-3.5 h-3.5 text-[#C66B45]" />
                      <span>PV Modules ({panelCount} Units)</span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs">Waaree 545W Mono PERC</p>
                    <p className="text-[10px] text-slate-500">20-Year OEM Warranty</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                      <Cpu className="w-3.5 h-3.5 text-[#C66B45]" />
                      <span>Solar Inverter (1 Unit)</span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs">Growatt {activeProject.capacityKw}kW Tier 1</p>
                    <p className="text-[10px] text-slate-500">2-Year Inverter Warranty</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                      <Battery className="w-3.5 h-3.5 text-[#C66B45]" />
                      <span>Storage Battery</span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs">
                      {activeProject.systemType === 'Hybrid' ? 'Pylontech 4.8kWh LiFePO4' : 'N/A (On-Grid System)'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {activeProject.systemType === 'Hybrid' ? '2-Year Battery Warranty' : 'Direct Grid Export'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Already Dispatched Details */}
              {isAlreadyDispatched ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      <h4 className="font-bold text-sm text-emerald-900">Hardware Dispatched & Handed to Field Crew</h4>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800">
                      Dispatched on {activeProject.hardwareDispatch?.dispatchDate || 'Today'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                      <span className="text-[10px] font-sans text-slate-500 block">PV Modules Batch:</span>
                      <strong className="text-slate-900">{activeProject.hardwareDispatch?.moduleSerials || 'PV-WA-540-9901..9920'}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                      <span className="text-[10px] font-sans text-slate-500 block">Inverter Serial:</span>
                      <strong className="text-slate-900">{activeProject.hardwareDispatch?.inverterSerial || 'INV-GW-5000-8831'}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                      <span className="text-[10px] font-sans text-slate-500 block">Battery Serial:</span>
                      <strong className="text-slate-900">{activeProject.hardwareDispatch?.batterySerial || 'BAT-PY-48100-2401'}</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onNavigateTab('warranties')}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>View Registered Warranties</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Manual Serial Entry Form (Active when Unlocked) */
                <form onSubmit={handleDispatchHardware} className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-[#292724]">
                          Manual Equipment Serial Number Entry
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Enter alphanumeric serial numbers directly from equipment nameplates before releasing truck.
                        </p>
                      </div>
                      <KeyRound className="w-4 h-4 text-[#C66B45]" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-1">
                          PV Modules Batch / Serial Range:
                        </label>
                        <input
                          type="text"
                          disabled={!isUnlockedForDispatch}
                          value={moduleSerialsInput}
                          onChange={(e) => setModuleSerialsInput(e.target.value)}
                          placeholder="e.g. PV-WA-540-9901..9920"
                          className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#C66B45] disabled:bg-slate-100 disabled:cursor-not-allowed"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-1">
                          Solar Inverter Serial Number:
                        </label>
                        <input
                          type="text"
                          disabled={!isUnlockedForDispatch}
                          value={inverterSerialInput}
                          onChange={(e) => setInverterSerialInput(e.target.value)}
                          placeholder="e.g. INV-GW-5000-8831"
                          className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#C66B45] disabled:bg-slate-100 disabled:cursor-not-allowed"
                          required
                        />
                      </div>
                    </div>

                    {activeProject.systemType === 'Hybrid' && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-1">
                          Battery Bank Serial Number:
                        </label>
                        <input
                          type="text"
                          disabled={!isUnlockedForDispatch}
                          value={batterySerialInput}
                          onChange={(e) => setBatterySerialInput(e.target.value)}
                          placeholder="e.g. BAT-PY-48100-2401"
                          className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#C66B45] disabled:bg-slate-100 disabled:cursor-not-allowed"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Truck Logistics & Driver Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white border border-[#E7E2D9]">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Dispatch Vehicle Number:
                      </label>
                      <input
                        type="text"
                        disabled={!isUnlockedForDispatch}
                        value={truckNoInput}
                        onChange={(e) => setTruckNoInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-white disabled:bg-slate-100"
                        placeholder="MH-12-RN-8831"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[#E7E2D9]">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Logistics Driver & Contact:
                      </label>
                      <input
                        type="text"
                        disabled={!isUnlockedForDispatch}
                        value={driverNameInput}
                        onChange={(e) => setDriverNameInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white disabled:bg-slate-100"
                        placeholder="Ramesh Patil (+91 98230 44912)"
                      />
                    </div>
                  </div>

                  {/* Submit Dispatch Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E7E2D9]">
                    <span className="text-[11px] text-slate-500">
                      Authorizing departure advances stage to "Hardware Dispatched" and notifies assigned technician.
                    </span>

                    <button
                      type="submit"
                      disabled={!isUnlockedForDispatch}
                      className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 transition-all ${
                        isUnlockedForDispatch
                          ? 'bg-[#C66B45] hover:bg-[#C66B45]/90 shadow-md shadow-[#C66B45]/20 cursor-pointer'
                          : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span>Dispatch Hardware & Notify Technician</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select an order from the queue to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};