import React, { useState } from 'react';
import {
  Sun,
  ShieldCheck,
  Zap,
  BatteryCharging,
  FileText,
  Download,
  LifeBuoy,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  LogOut,
  IndianRupee,
  Leaf,
  Calendar,
  Layers,
  Sparkles,
  Plus
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';

interface CustomerPortalPageProps {
  onLogout: () => void;
}

export const CustomerPortalPage: React.FC<CustomerPortalPageProps> = ({ onLogout }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'warranties' | 'subsidy' | 'support' | 'documents'>('overview');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketsList, setTicketsList] = useState([
    {
      id: 'TICK-CUST-101',
      date: '2026-10-24',
      subject: 'Quarterly Routine Rooftop Cleaning & Inverter Inspection',
      status: 'Resolved',
      technician: 'Ramesh Kumar'
    }
  ]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;

    const newTicket = {
      id: `TICK-CUST-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      subject: ticketSubject,
      status: 'In Progress',
      technician: 'Amit Sharma (Assigned)'
    };

    setTicketsList(prev => [newTicket, ...prev]);
    setIsTicketModalOpen(false);
    setTicketSubject('');
    setTicketDescription('');
    showToast('Service ticket submitted to SunPower support team.', 'success');
  };

  const handleDownloadDoc = (docName: string) => {
    showToast(`Downloading official ${docName}...`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Customer Brand Navbar */}
      <header className="sticky top-0 z-30 bg-[#0F172A] border-b border-slate-800 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#C66B45] flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">SunPower</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Customer Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Solar Homeowner Connect</p>
          </div>
        </div>

        {/* Customer Persona & Logout Button */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5 text-right">
            <div>
              <p className="text-xs font-bold text-white">Rajesh Sharma</p>
              <p className="text-[10px] text-slate-400">10 kW Hybrid • Baner Hills, Pune</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-white/10">
              RS
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-200 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 text-xs font-semibold transition-all shadow-xs"
            title="Log out of Customer Portal"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome Hero Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                System Active & Generating Clean Power
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, Rajesh!
            </h2>
            <p className="text-xs text-slate-500">
              Your 10 kW Hybrid Solar Rooftop with 10.24 kWh LiFePO4 battery storage is operating at optimal peak efficiency.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <LifeBuoy className="w-4 h-4 text-amber-400" />
              <span>Request Service Ticket</span>
            </button>
            <button
              onClick={() => handleDownloadDoc('Comprehensive System Warranty Certificate')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Warranty PDF</span>
            </button>
          </div>
        </div>

        {/* 4 Essential Homeowner Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Today's Solar Yield</span>
              <Sun className="w-4 h-4 text-[#C66B45]" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900">
              38.4 <span className="text-sm font-normal text-slate-500">kWh</span>
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              Live generation rate: <strong>8.4 kW peak</strong>
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Battery Backup State</span>
              <BatteryCharging className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-600">
              92% <span className="text-sm font-normal text-slate-500">(10.24 kWh)</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Autonomous backup: <strong>14.5 hours capacity</strong>
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Monthly Bill Savings</span>
              <IndianRupee className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900">
              ₹9,850
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Net-meter credit: <strong>1,120 units exported</strong>
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Lifetime Carbon Offset</span>
              <Leaf className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-700">
              14.2 <span className="text-sm font-normal text-slate-500">Tons CO₂</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Equivalent to <strong>640 trees planted</strong>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Live Generation & Storage
          </button>
          <button
            onClick={() => setActiveTab('warranties')}
            className={`px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'warranties'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Equipment Serials & Warranties
          </button>
          <button
            onClick={() => setActiveTab('subsidy')}
            className={`px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'subsidy'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            PM Surya Ghar Subsidy Tracker
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'support'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Service & Support Tickets ({ticketsList.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'documents'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            NOC & Installation Documents
          </button>
        </div>

        {/* Tab 1: Live Generation & Storage */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Power Flow Diagram */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Real-Time Solar Power Flow</h3>
                  <p className="text-[11px] text-slate-500">Live energy routing across PV arrays, battery and DISCOM grid</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Telemetry
                </span>
              </div>

              {/* Power Flow visual boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-1">
                  <Sun className="w-6 h-6 text-amber-600 mx-auto" />
                  <span className="text-xs font-bold text-amber-900">Rooftop Solar Array</span>
                  <p className="text-lg font-mono font-bold text-amber-700">+8.4 kW</p>
                  <p className="text-[10px] text-amber-700">18x Waaree 545W Panels</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-white text-center space-y-1 shadow-sm">
                  <Zap className="w-6 h-6 text-amber-400 mx-auto" />
                  <span className="text-xs font-bold text-white">Hybrid Inverter</span>
                  <p className="text-lg font-mono font-bold text-emerald-400">98.4% Eff</p>
                  <p className="text-[10px] text-slate-400">Growatt 10 kW 3-Phase</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <BatteryCharging className="w-6 h-6 text-emerald-600 mx-auto" />
                  <span className="text-xs font-bold text-emerald-900">LiFePO4 Storage</span>
                  <p className="text-lg font-mono font-bold text-emerald-700">+4.0 kW (Chg)</p>
                  <p className="text-[10px] text-emerald-700">92% State of Charge</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    🏠
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Home Electrical Load:</span>
                    <span className="font-mono font-bold text-slate-900 ml-1.5">2.3 kW</span>
                    <p className="text-[10px] text-slate-500">100% solar powered (Zero grid pull)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Exporting to DISCOM Grid:</span>
                    <span className="font-mono font-bold text-emerald-700 ml-1.5">+2.1 kW</span>
                    <p className="text-[10px] text-emerald-700 font-medium">Accumulating net-metering energy credits</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick System Specs Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-900">Site Installation Specs</h3>
                <p className="text-[11px] text-slate-500">Project Reference: PRJ-2026-042</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">System Capacity</span>
                  <span className="font-bold font-mono text-slate-900">10.0 kW Hybrid</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Solar Panels</span>
                  <span className="font-medium text-slate-900 text-right">18x 545W Mono PERC</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Inverter</span>
                  <span className="font-medium text-slate-900 text-right">Growatt 10kW Hybrid</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Battery Storage</span>
                  <span className="font-medium text-slate-900 text-right">10.24 kWh LiFePO4</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Commissioned On</span>
                  <span className="font-mono text-slate-900">12 Oct 2026</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Lead Technician</span>
                  <span className="font-medium text-slate-900">Ramesh Kumar (MNRE L3)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Equipment Serials & Warranties */}
        {activeTab === 'warranties' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Manufacturer Warranties & Registered Serials</h3>
                  <p className="text-[11px] text-slate-500">Hardware warranty clocks initiated on warehouse dispatch & commissioning</p>
                </div>
                <button
                  onClick={() => handleDownloadDoc('Official Warranty Certificate & Serial Ledger')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full Certificate</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 pt-1">
                {/* Item 1 */}
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900">Growatt 10 kW Hybrid 3-Phase Inverter</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active • 2-Year Warranty
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-600 mt-0.5">
                        Serial: <strong className="text-slate-900">INV-GW-2026-0881</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Coverage: Full unit replacement guarantee through Oct 2028 (684 days remaining)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadDoc('Inverter Warranty Deed')}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>View Warranty Deed</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Item 2 */}
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900">18x Waaree 545W Mono PERC DCR Solar Modules</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active • 20-Year Guarantee
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-600 mt-0.5">
                        Array Master Batch: <strong className="text-slate-900">MOD-TP-2026-9921</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Coverage: Linear power output guarantee (minimum 80% output through Oct 2046)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadDoc('Panel Performance Warranty Certificate')}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>View Warranty Deed</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Item 3 */}
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                      <BatteryCharging className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900">BYD Battery-Box Premium LiFePO4 (10.24 kWh)</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active • 2-Year Full Coverage
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-600 mt-0.5">
                        Serial: <strong className="text-slate-900">BAT-BYD-51V-0042</strong>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Coverage: Battery cell degradation and BMS hardware replacement through Oct 2028
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadDoc('Battery Warranty Certificate')}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>View Warranty Deed</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: PM Surya Ghar Subsidy Tracker */}
        {activeTab === 'subsidy' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-sm text-slate-900">PM Surya Ghar: Muft Bijli Yojana Central Subsidy</h3>
                <p className="text-[11px] text-slate-500">Government Direct Benefit Transfer (DBT) progress</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                ₹78,000 Disbursed
              </span>
            </div>

            {/* Stepper */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-500">
              <div className="relative">
                <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900">1. National Portal Application Submitted</h4>
                    <span className="text-[10px] font-mono text-slate-500">14 Sep 2026</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Aadhaar linked, electricity consumer ID #MSEDCL-41029 verified by SunPower team.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900">2. DISCOM Technical Feasibility & Net-Meter Inspection</h4>
                    <span className="text-[10px] font-mono text-slate-500">28 Sep 2026</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Bi-directional meter MTR-MSEDCL-4412 installed and synced with state grid.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-300">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-emerald-900">3. Direct Benefit Transfer (DBT) Disbursed</h4>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">18 Oct 2026</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Subsidy of <strong>₹78,000</strong> credited directly to your Aadhaar-linked Bank Account (SBI A/C ****4821). UTR Ref: <code>MNRE-DBT-2026-98124</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Service & Support Tickets */}
        {activeTab === 'support' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Customer Support & Work Requests</h3>
                <p className="text-[11px] text-slate-500">Dedicated assistance for maintenance, inverter alerts or cleaning</p>
              </div>
              <button
                onClick={() => setIsTicketModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Service Request</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {ticketsList.map(t => (
                <div key={t.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{t.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 mt-1">{t.subject}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Assigned Crew: {t.technician} • Logged on {t.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Documents */}
        {activeTab === 'documents' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">Installation Certificates & Compliance Deeds</h3>
              <p className="text-[11px] text-slate-500">Official statutory clearances and technical documentation</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Commissioning & Handover Certificate', desc: 'Signed by SunPower Lead Engineer & Customer', file: 'Commissioning_Report_PRJ042.pdf' },
                { title: 'DISCOM Net-Metering Sanction Agreement', desc: 'State utility bi-directional tariff endorsement', file: 'DISCOM_NetMetering_NOC.pdf' },
                { title: 'CEIG Electrical Inspector Clearance Certificate', desc: 'Mandatory high-voltage and earthing safety test', file: 'CEIG_Safety_Clearance.pdf' },
                { title: 'Equipment Warranty & Serial Registry Deed', desc: '20-Yr Solar Modules & 2-Yr Inverter/BMS coverage', file: 'Warranty_Deed_Registry.pdf' }
              ].map(doc => (
                <div key={doc.file} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-slate-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{doc.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{doc.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadDoc(doc.title)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 transition-colors shrink-0"
                    title="Download document"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Service Request Modal */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title="Submit Customer Support Request"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Issue / Service Type</label>
            <input
              type="text"
              required
              value={ticketSubject}
              onChange={e => setTicketSubject(e.target.value)}
              placeholder="e.g. Schedule panel cleaning, Inverter display code check, etc."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Detailed Description</label>
            <textarea
              rows={3}
              value={ticketDescription}
              onChange={e => setTicketDescription(e.target.value)}
              placeholder="Provide any additional details or preferred service time..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsTicketModalOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-xs"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
