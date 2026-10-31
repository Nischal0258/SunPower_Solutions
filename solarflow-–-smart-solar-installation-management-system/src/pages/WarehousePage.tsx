import React, { useState } from 'react';
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
  KeyRound
} from 'lucide-react';
import { DataService } from '../services/dataService';
import { useToast } from '../components/common/Toast';
import { NavTab } from '../components/layout/Sidebar';

interface WarehousePageProps {
  onNavigateTab: (tab: NavTab, targetId?: string) => void;
}

export const WarehousePage: React.FC<WarehousePageProps> = ({ onNavigateTab }) => {
  const { showToast } = useToast();
  const projects = DataService.getProjects();
  const inventory = DataService.getInventory();

  // Active project selection for dispatch
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'PRJ-2026-042');
  
  // Manual serial number entry state
  const [manualSerialInput, setManualSerialInput] = useState('');

  // Registered serials map (projectId -> array of serials)
  const [registeredSerials, setRegisteredSerials] = useState<Record<string, string[]>>({
    'PRJ-2026-042': ['INV-GW-5000-8831', 'BAT-PY-48100-2401'],
    'PRJ-2026-045': [],
    'PRJ-2026-046': []
  });

  // Staged truck dispatch state
  const [dispatchStatus, setDispatchStatus] = useState<Record<string, { dispatched: boolean; truckNo: string; driverName: string; time: string }>>({
    'PRJ-2026-042': {
      dispatched: false,
      truckNo: 'MH-12-RN-8831',
      driverName: 'Ramesh Patil',
      time: '10:30 AM'
    }
  });

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const handleAddManualSerial = (serialToRegister?: string) => {
    const code = (serialToRegister || manualSerialInput).trim().toUpperCase();
    if (!code) {
      showToast('Please enter an equipment serial number.', 'warning');
      return;
    }

    const pid = activeProject?.id || 'PRJ-2026-042';
    const existing = registeredSerials[pid] || [];
    if (existing.includes(code)) {
      showToast(`Serial number ${code} is already registered.`, 'warning');
      return;
    }

    setRegisteredSerials(prev => ({
      ...prev,
      [pid]: [...existing, code]
    }));
    setManualSerialInput('');
    showToast(`Serial number ${code} registered successfully.`, 'success');
  };

  const handleRemoveSerial = (serialToRemove: string) => {
    const pid = activeProject?.id || 'PRJ-2026-042';
    const existing = registeredSerials[pid] || [];
    setRegisteredSerials(prev => ({
      ...prev,
      [pid]: existing.filter(s => s !== serialToRemove)
    }));
    showToast(`Removed serial number ${serialToRemove}.`, 'info');
  };

  const handleAuthorizeDeparture = () => {
    const pid = activeProject?.id || 'PRJ-2026-042';
    const serials = registeredSerials[pid] || [];

    if (serials.length === 0) {
      showToast('Mandatory Inverter serial number entry required before authorizing truck departure.', 'error');
      return;
    }

    // Register warranties in DataService
    serials.forEach(s => {
      DataService.registerWarranty({
        customerId: activeProject.customerId,
        customerName: activeProject.customerName,
        customerPhone: activeProject.customerPhone,
        customerAddress: activeProject.customerAddress,
        projectId: activeProject.id,
        serialNumber: s,
        productCategory: s.includes('BAT') ? 'Batteries' : 'Inverters',
        productName: s.includes('BAT') ? 'Pylontech LiFePO4 Battery' : 'Growatt Inverter Unit',
        model: s.includes('BAT') ? 'US5000' : 'SPF-5000-ES',
        deliveryDate: new Date().toISOString().split('T')[0],
        warrantyYears: 2
      });
    });

    setDispatchStatus(prev => ({
      ...prev,
      [pid]: {
        dispatched: true,
        truckNo: prev[pid]?.truckNo || 'MH-12-RN-8831',
        driverName: prev[pid]?.driverName || 'Ramesh Patil',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }));

    showToast(`Truck departure authorized! 2-Year warranty clock initiated for order ${pid}.`, 'success');
  };

  return (
    <div className="space-y-6 pb-12 text-xs">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#E7E2D9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#C66B45]" />
            <h2 className="text-base sm:text-lg font-bold text-[#292724]">Warehouse Dispatch & Logistics Hub</h2>
          </div>
          <p className="text-xs text-[#292724]/70 mt-1">
            Manual serial registration, staging verification, and truck departure authorization
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

      {/* Main Grid: Orders & Staging Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dispatch Queue */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D9]">
            <div>
              <h3 className="font-bold text-sm text-[#292724]">Active Installation Dispatch Queue</h3>
              <p className="text-[11px] text-slate-500">Orders ready for warehouse staging</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
              {projects.length} Orders
            </span>
          </div>

          <div className="space-y-2.5">
            {projects.map((proj) => {
              const isSelected = selectedProjectId === proj.id;
              const isDispatched = dispatchStatus[proj.id]?.dispatched;
              const serialsCount = registeredSerials[proj.id]?.length || 0;

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-50 border-[#C66B45] shadow-xs'
                      : 'bg-white border-[#E7E2D9] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-xs text-[#292724]">{proj.id}</span>
                      <h4 className="font-semibold text-xs text-slate-800 mt-0.5">{proj.customerName}</h4>
                      <p className="text-[11px] text-slate-500">{proj.capacityKw} kW Turnkey System</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isDispatched
                        ? 'bg-slate-800 text-white'
                        : serialsCount > 0
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isDispatched ? 'Dispatched' : serialsCount > 0 ? `${serialsCount} Serials Entered` : 'Pending Entry'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Manual Serial Entry & Staging Details */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D9]">
            <div>
              <span className="font-mono font-bold text-xs text-[#C66B45]">{activeProject.id}</span>
              <h3 className="font-bold text-base text-[#292724] mt-0.5">{activeProject.customerName}</h3>
              <p className="text-[11px] text-slate-500">Destination: {activeProject.customerAddress || 'Pune Site'}, Maharashtra</p>
            </div>

            {dispatchStatus[activeProject.id]?.dispatched ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-white">
                ✔ Dispatched & En Route
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                Awaiting Serial Entry & Dispatch
              </span>
            )}
          </div>

          {/* Manual Serial Number Entry Field */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-[#292724]">Manual Equipment Serial Number Registration</h4>
                <p className="text-[11px] text-slate-500">
                  Enter hardware serial numbers directly from equipment labels (no barcode scanner required).
                </p>
              </div>
              <KeyRound className="w-4 h-4 text-[#C66B45]" />
            </div>

            {/* Input & Add Row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualSerialInput}
                onChange={(e) => setManualSerialInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddManualSerial(); }}
                placeholder="Enter serial number (e.g. INV-GW-5000-8831)"
                className="flex-1 px-3 py-2 rounded-lg border border-[#E7E2D9] bg-white text-xs font-mono text-[#292724] focus:outline-none focus:border-[#C66B45] focus:ring-1 focus:ring-[#C66B45]"
              />
              <button
                type="button"
                onClick={() => handleAddManualSerial()}
                className="px-4 py-2 rounded-lg bg-[#C66B45] hover:bg-[#C66B45]/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Serial</span>
              </button>
            </div>

            {/* Quick Test Serial Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
              <span className="text-slate-500">Quick Entry Presets:</span>
              <button
                type="button"
                onClick={() => handleAddManualSerial('INV-GW-5000-8831')}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-mono text-[10px]"
              >
                + Inverter: INV-GW-5000-8831
              </button>
              <button
                type="button"
                onClick={() => handleAddManualSerial('BAT-PY-48100-2401')}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-mono text-[10px]"
              >
                + Battery: BAT-PY-48100-2401
              </button>
            </div>

            {/* Registered Serials List */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                Registered Serials for Order ({registeredSerials[activeProject.id]?.length || 0}):
              </span>
              {(registeredSerials[activeProject.id]?.length || 0) === 0 ? (
                <div className="p-3 rounded-lg bg-white border border-dashed border-slate-300 text-center text-[11px] text-slate-500">
                  No serial numbers entered yet. Enter the inverter serial above to unlock departure authorization.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {registeredSerials[activeProject.id].map((s) => (
                    <div
                      key={s}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#292724]" />
                        <span className="font-mono font-bold text-slate-800">{s}</span>
                        <span className="text-[10px] text-slate-400">
                          ({s.includes('INV') ? 'Solar Inverter' : s.includes('BAT') ? 'Storage Battery' : 'PV Module'})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSerial(s)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Remove serial"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Truck Logistics Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#E7E2D9]">
              <span className="text-[10px] text-slate-500 block">Assigned Transport Vehicle</span>
              <p className="font-mono font-bold text-sm text-[#292724] mt-0.5">
                {dispatchStatus[activeProject.id]?.truckNo || 'MH-12-RN-8831'}
              </p>
              <span className="text-[10px] text-slate-400">Eicher 14ft Flatbed Truck</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#E7E2D9]">
              <span className="text-[10px] text-slate-500 block">Lead Dispatch Driver</span>
              <p className="font-semibold text-sm text-[#292724] mt-0.5">
                {dispatchStatus[activeProject.id]?.driverName || 'Ramesh Patil'}
              </p>
              <span className="text-[10px] text-slate-400">Contact: +91 98230 44912</span>
            </div>
          </div>

          {/* Action Row: Authorize Truck Departure */}
          <div className="pt-2 border-t border-[#E7E2D9] flex items-center justify-between gap-4">
            <div className="text-[11px] text-slate-500">
              {dispatchStatus[activeProject.id]?.dispatched ? (
                <span className="text-slate-800 font-medium">
                  Departure logged at {dispatchStatus[activeProject.id]?.time}. 2-Year warranty clock active.
                </span>
              ) : (
                <span>
                  Authorizing departure initiates the 2-year warranty clock for all registered equipment.
                </span>
              )}
            </div>

            {!dispatchStatus[activeProject.id]?.dispatched ? (
              <button
                type="button"
                onClick={handleAuthorizeDeparture}
                className="px-5 py-2.5 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-white font-bold text-xs shadow-md shadow-[#C66B45]/20 flex items-center gap-2 transition-all shrink-0"
              >
                <Truck className="w-4 h-4" />
                <span>Authorize Truck Departure</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateTab('warranties')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>View Registered Warranties</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
