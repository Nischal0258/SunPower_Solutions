import React from 'react';
import {
  Sun,
  Zap,
  BatteryCharging,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Wrench,
  Activity,
  X,
  FileText
} from 'lucide-react';
import { SystemType } from '../../types';

interface GridBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemType: SystemType;
  capacityKw: number;
}

export const GridBreakdownModal: React.FC<GridBreakdownModalProps> = ({
  isOpen,
  onClose,
  systemType,
  capacityKw
}) => {
  if (!isOpen) return null;

  const panelCount = Math.ceil((capacityKw * 1000) / 545);
  const totalArrayWattage = (panelCount * 545) / 1000;
  const isHybrid = systemType === 'Hybrid';
  const isOffGrid = systemType === 'Off-grid';
  const batteryKwh = isOffGrid ? 10.24 : isHybrid ? 5.12 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292724]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white border border-[#E7E2D9] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#292724] text-white flex items-center justify-between border-b border-[#292724]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C66B45] text-white flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  System Architecture & Bill of Materials (BOM)
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#DBBA95]/20 text-[#DBBA95] border border-[#DBBA95]/30">
                  {capacityKw} kW {systemType}
                </span>
              </div>
              <p className="text-xs text-[#DBBA95]/80 mt-0.5">
                Complete engineering specification and equipment breakdown included in your turnkey contract
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#292724]">
          {/* Quick System Summary Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <span className="text-[10px] text-slate-500 font-medium block">Total PV Array</span>
                <span className="text-sm font-bold text-slate-900 font-mono">{totalArrayWattage.toFixed(2)} kWp ({panelCount} Modules)</span>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-[10px] text-slate-500 font-medium block">Inverter Sizing</span>
                <span className="text-sm font-bold text-slate-900 font-mono">{capacityKw} kW Pure Sine Wave</span>
              </div>
              {(isHybrid || isOffGrid) && (
                <>
                  <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Storage Bank</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">{batteryKwh} kWh LiFePO4</span>
                  </div>
                </>
              )}
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C66B45]/15 text-[#C66B45] border border-[#C66B45]/30">
              Turnkey Equipment Package
            </span>
          </div>

          {/* Detailed Component Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Component 1: Solar PV Modules */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#C66B45]/40 transition-all space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-[#C66B45]" />
                  <h4 className="font-bold text-xs text-slate-900">1. Tier-1 Solar PV Modules</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  20-Yr Warranty
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Technology:</span>
                  <span className="font-semibold text-slate-900">Waaree / Adani Mono PERC Half-Cut</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Rated Wattage:</span>
                  <span className="font-semibold text-slate-900 font-mono">545W+ Bi-Facial Cells</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Module Count:</span>
                  <span className="font-semibold text-slate-900 font-mono">{panelCount} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Efficiency:</span>
                  <span className="font-semibold text-slate-900 font-mono">22.4% Max Conversion</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Glass & Frame:</span>
                  <span className="font-semibold text-slate-900">3.2mm ARC Tempered / Anodized Aluminum</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Compliance:</span>
                  <span className="font-semibold text-emerald-700">MNRE ALMM & DCR Certified</span>
                </div>
              </div>
            </div>

            {/* Component 2: Smart Solar Inverter / PCU */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#C66B45]/40 transition-all space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#D9A441]" />
                  <h4 className="font-bold text-xs text-slate-900">2. Solar Power Conditioning Unit</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  5-Yr Warranty
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Make & Model:</span>
                  <span className="font-semibold text-slate-900">Growatt / SolarEdge Smart Inverter</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Rated Capacity:</span>
                  <span className="font-semibold text-slate-900 font-mono">{capacityKw} kW (3-Phase / 1-Phase)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">MPPT Trackers:</span>
                  <span className="font-semibold text-slate-900">Dual MPPT with 99.9% Tracking</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Peak Efficiency:</span>
                  <span className="font-semibold text-slate-900 font-mono">98.4% Euro Standard</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Enclosure & Cooling:</span>
                  <span className="font-semibold text-slate-900">IP65 Waterproof / Natural Convection</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-slate-500">Telemetry:</span>
                  <span className="font-semibold text-blue-700">Integrated WiFi / 4G Real-time Cloud App</span>
                </div>
              </div>
            </div>

            {/* Component 3: Battery Storage (if Hybrid/Off-Grid) or Grid Tie Sync */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#C66B45]/40 transition-all space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-purple-600" />
                  <h4 className="font-bold text-xs text-slate-900">
                    {isHybrid || isOffGrid ? '3. Lithium Energy Storage' : '3. Bi-Directional Net-Meter'}
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                  {isHybrid || isOffGrid ? '5-Yr Warranty' : 'DISCOM Approved'}
                </span>
              </div>

              {isHybrid || isOffGrid ? (
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Battery Chemistry:</span>
                    <span className="font-semibold text-slate-900">Lithium Iron Phosphate (LiFePO4)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Total Reserve:</span>
                    <span className="font-semibold text-slate-900 font-mono">{batteryKwh} kWh Usable</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Cycle Life:</span>
                    <span className="font-semibold text-slate-900 font-mono">6,000+ Cycles @ 90% DoD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Battery Management:</span>
                    <span className="font-semibold text-slate-900">Multi-stage BMS with thermal auto-cutoff</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Blackout Switchover:</span>
                    <span className="font-semibold text-emerald-700">&lt;10ms Seamless UPS Transition</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Meter Type:</span>
                    <span className="font-semibold text-slate-900">Bi-Directional 4-Quadrant Smart Meter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Accuracy Class:</span>
                    <span className="font-semibold text-slate-900 font-mono">Class 1.0s / 0.5s IS 13779</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Export Tracking:</span>
                    <span className="font-semibold text-slate-900">Import / Export / Net Energy Recording</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">Utility Liaison:</span>
                    <span className="font-semibold text-emerald-700">Turnkey Inspection & Sanction Sign-off</span>
                  </div>
                </div>
              )}
            </div>

            {/* Component 4: Complete Balance of System (BOS) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#C66B45]/40 transition-all space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-700" />
                  <h4 className="font-bold text-xs text-slate-900">4. Balance of System (BOS) & Safety</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  Full Electrical Kit
                </span>
              </div>

              <div className="space-y-2 text-[11px] text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C66B45] shrink-0 mt-0.5" />
                  <span><strong>Mounting Structure:</strong> Hot-dip galvanized structural aluminum rail channels, rated for 150 km/h wind velocity.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C66B45] shrink-0 mt-0.5" />
                  <span><strong>DC & AC Distribution Boxes:</strong> IP65 polycarbonate boxes fitted with Type-II Surge Protection Devices (SPD) & Schneider C-Curve MCBs.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C66B45] shrink-0 mt-0.5" />
                  <span><strong>Solar DC Cabling:</strong> Polycab 4 sq.mm electron-beam cross-linked polyolefin (XLPO) UV-resistant fire-retardant cables.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C66B45] shrink-0 mt-0.5" />
                  <span><strong>Chemical Earthing Kit:</strong> Dual copper-bonded chemical electrodes with bentonite backfill compound, guaranteed ground resistance &lt;3.0Ω.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C66B45] shrink-0 mt-0.5" />
                  <span><strong>Lightning Arrester:</strong> Class-B pure copper lightning terminal with down-conductor and event counter.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quality & Safety Assurance Note */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">SunPower Quality Assurance & Warranty Guarantee</p>
              <p className="text-[11px] text-amber-800/90 mt-0.5">
                Every component supplied is barcoded, serial-tracked in the SunPower national registry, and installed strictly in compliance with Central Electricity Authority (CEA) Technical Standards and IEEE 1547 grid interconnection codes.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Document: SP-BOM-SPEC-{capacityKw}KW-{systemType.toUpperCase()}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#292724] hover:bg-[#292724]/90 text-white font-semibold text-xs transition-colors"
          >
            Close Equipment Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
