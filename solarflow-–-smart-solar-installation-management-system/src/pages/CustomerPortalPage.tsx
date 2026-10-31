import React, { useState, useEffect } from 'react';
import {
  Sun,
  ShieldCheck,
  Zap,
  BatteryCharging,
  FileText,
  Download,
  ShoppingBag,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  LogOut,
  IndianRupee,
  Layers,
  Sparkles,
  Plus,
  User,
  Package,
  ArrowRight,
  Check,
  Wrench,
  Grid,
  BatteryMedium,
  Compass,
  FileCheck2,
  AlertCircle,
  Truck,
  TrendingUp,
  Sliders,
  HelpCircle,
  Users
} from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { ProfileSettingsModal } from '../components/common/ProfileSettingsModal';
import { GridBreakdownModal } from '../components/common/GridBreakdownModal';
import { CustomerSupportChat } from '../components/customer/CustomerSupportChat';
import { DataService } from '../services/dataService';
import { 
  SystemType, 
  CustomerOrder, 
  CustomerOrderStatus, 
  CustomerPersona, 
  DEMO_CUSTOMERS 
} from '../types';
import { calculateSolarSubsidy } from '../utils/subsidyCalculator';

// High-Resolution Curated Product Assets
import solarRooftopImg from '../assets/images/solar_rooftop_installation_1793436857441.jpg';
import solarTechnicianImg from '../assets/images/solar_technician_survey_1793436857911.jpg';
import solarBatteryInverterImg from '../assets/images/solar_inverter_battery_setup_1793436858572.jpg';
import standaloneSolarPanelImg from '../assets/images/standalone_solar_panel.jpg';

interface CustomerPortalPageProps {
  onLogout: () => void;
}

export const CustomerPortalPage: React.FC<CustomerPortalPageProps> = ({ onLogout }) => {
  const { showToast } = useToast();

  // Active Customer Persona (Default to Rajendra Joshi CUST-001)
  const [activeCustomer, setActiveCustomer] = useState<CustomerPersona>(() => {
    try {
      const stored = localStorage.getItem('sunpower_active_customer_persona');
      if (stored) {
        const found = DEMO_CUSTOMERS.find(c => c.id === stored);
        if (found) return found;
      }
    } catch {}
    return DEMO_CUSTOMERS[0];
  });

  // 4 Intuitive Customer-Centric Tabs
  const [activeTab, setActiveTab] = useState<'advisor' | 'configure' | 'orders' | 'hardware'>('advisor');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBOMModalOpen, setIsBOMModalOpen] = useState(false);
  const [bomModalSystemType, setBOMModalSystemType] = useState<SystemType>('On-grid');

  // Tab 1: Solar Advisor Interactive Calculator State
  const [roofAreaSqFt, setRoofAreaSqFt] = useState<number>(activeCustomer.roofAreaSqFt || 1200);
  const [monthlyBillInr, setMonthlyBillInr] = useState<number>(4500);
  const [powerCutFrequency, setPowerCutFrequency] = useState<'rare' | 'frequent'>('rare');

  // Tab 2: System Configuration & Checkout State
  const [selectedSystemType, setSelectedSystemType] = useState<SystemType>('On-grid');
  const [selectedCapacityKw, setSelectedCapacityKw] = useState<number>(5);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState('');
  
  // Editable checkout contact & installation address verification
  const [checkoutName, setCheckoutName] = useState(activeCustomer.name);
  const [checkoutEmail, setCheckoutEmail] = useState(activeCustomer.email);
  const [checkoutPhone, setCheckoutPhone] = useState(activeCustomer.phone);
  const [checkoutAddress, setCheckoutAddress] = useState(activeCustomer.address);

  // Sync orders in real-time from DataService
  const [orders, setOrders] = useState<CustomerOrder[]>(() => 
    DataService.getCustomerOrders(activeCustomer.id)
  );

  const refreshOrders = () => {
    setOrders(DataService.getCustomerOrders(activeCustomer.id));
  };

  useEffect(() => {
    refreshOrders();
    setCheckoutName(activeCustomer.name);
    setCheckoutEmail(activeCustomer.email);
    setCheckoutPhone(activeCustomer.phone);
    setCheckoutAddress(activeCustomer.address);
    setRoofAreaSqFt(activeCustomer.roofAreaSqFt);

    const handleDataUpdate = () => refreshOrders();
    window.addEventListener('sunpower_data_updated', handleDataUpdate);
    window.addEventListener('storage', handleDataUpdate);
    return () => {
      window.removeEventListener('sunpower_data_updated', handleDataUpdate);
      window.removeEventListener('storage', handleDataUpdate);
    };
  }, [activeCustomer.id]);

  // Handle Persona Switching
  const handleSwitchPersona = (personaId: string) => {
    const found = DEMO_CUSTOMERS.find(c => c.id === personaId);
    if (!found) return;
    setActiveCustomer(found);
    try {
      localStorage.setItem('sunpower_active_customer_persona', found.id);
    } catch {}
    showToast(`Switched active customer persona to ${found.name} (${found.city}).`, 'info');
  };

  // Solar Advisor dynamic sizing logic:
  // Estimate capacity based on monthly bill (average ₹8.5/unit -> monthly kWh -> / 125 kWh/kW)
  const advisorUnitsPerMonth = Math.round(monthlyBillInr / 8.5);
  const advisorRecommendedKw = Math.max(1, Math.min(Math.round(advisorUnitsPerMonth / 125), 15));
  const advisorRoofCapacityLimit = Math.floor(roofAreaSqFt / 95); // ~95 sq ft per kW
  const advisorOptimalKw = Math.max(1, Math.min(advisorRecommendedKw, Math.max(1, advisorRoofCapacityLimit)));
  const advisorSubsidy = calculateSolarSubsidy(
    advisorOptimalKw, 
    powerCutFrequency === 'frequent' ? 'Hybrid' : 'On-grid', 
    activeCustomer.state
  );

  // Live Checkout Subsidy Calculation
  const checkoutSubsidy = calculateSolarSubsidy(selectedCapacityKw, selectedSystemType, activeCustomer.state);

  // Add-ons list
  const availableAddons = [
    {
      id: 'addon-bat-5kw',
      name: '5.12 kWh LiFePO4 Battery Storage Expansion',
      category: 'Energy Storage',
      price: 145000,
      description: 'Expand night-time reserve storage with a high-cycle lithium iron phosphate module.'
    },
    {
      id: 'addon-ev-charger',
      name: '7.4 kW Smart EV Fast Charger (Type-2 Wallbox)',
      category: 'EV Mobility',
      price: 58000,
      description: 'Integrate electric vehicle charging powered by your rooftop solar generation.'
    },
    {
      id: 'addon-heat-pump',
      name: 'Solar Heat Pump 200L Water Heating Module',
      category: 'Thermal Integration',
      price: 48000,
      description: 'Ultra-efficient heat pump utilizing daytime solar electricity for hot water.'
    },
    {
      id: 'addon-om-care',
      name: '5-Year Comprehensive Solar O&M Care Plan',
      category: 'Care Plan',
      price: 24500,
      description: 'Quarterly deep cleaning, inverter firmware checks, and annual thermal imaging.'
    }
  ];

  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const item = availableAddons.find(a => a.id === id);
    return sum + (item ? item.price : 0);
  }, 0);

  const finalGrossCost = checkoutSubsidy.grossCost + addonsTotal;
  const finalNetPayable = checkoutSubsidy.netPayable + addonsTotal;

  // Handle Checkout Submission
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const placedOrder = DataService.placeCustomerOrder({
      customerId: activeCustomer.id,
      customerName: checkoutName.trim() || activeCustomer.name,
      customerEmail: checkoutEmail.trim() || activeCustomer.email,
      contactNumber: checkoutPhone.trim() || activeCustomer.phone,
      installationAddress: checkoutAddress.trim() || activeCustomer.address,
      city: activeCustomer.city,
      state: activeCustomer.state,
      systemType: selectedSystemType,
      capacityKw: selectedCapacityKw,
      grossCost: finalGrossCost,
      centralSubsidy: checkoutSubsidy.centralSubsidy,
      stateSubsidy: checkoutSubsidy.stateSubsidy,
      netPayable: finalNetPayable,
      selectedAddons: selectedAddons.map(id => availableAddons.find(a => a.id === id)?.name || id),
      notes: customNotes.trim()
    });

    showToast(
      `Order ${placedOrder.id} placed successfully! Cross-role sync notified Operations & Engineering.`,
      'success'
    );
    setActiveTab('orders');
    refreshOrders();
    setCustomNotes('');
  };

  const handleDownloadDoc = (docName: string) => {
    showToast(`Downloading official document: ${docName}...`, 'info');
  };

  const handleOpenBOM = (type: SystemType) => {
    setBOMModalSystemType(type);
    setIsBOMModalOpen(true);
  };

  // Milestone Progress Steps for Orders
  const milestoneSteps: { status: CustomerOrderStatus; title: string; desc: string }[] = [
    { status: 'Order Placed', title: '1. Order Placed', desc: 'Contract registered & advance invoice generated' },
    { status: 'Site Survey Scheduled', title: '2. Site Feasibility Survey', desc: 'Azimuth, tilt angle & shading clearance' },
    { status: 'Hardware Allocated', title: '3. Hardware Allocated', desc: 'Panels & inverter staged at central depot' },
    { status: 'Installation In Progress', title: '4. Installation In Progress', desc: 'Rooftop mounting & electrical wiring' },
    { status: 'Commissioned', title: '5. Commissioned & Net-Metered', desc: 'DISCOM bi-directional meter energized' }
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#292724] flex flex-col font-sans">
      {/* =======================================================================
          TOP CUSTOMER HEADER WITH MULTI-CUSTOMER PERSONA SWITCHER
          ======================================================================= */}
      <header className="sticky top-0 z-30 bg-[#292724] text-white px-4 sm:px-8 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#C66B45] flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">SunPower</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#DBBA95]/20 text-[#DBBA95] border border-[#DBBA95]/30">
                Customer Portal
              </span>
            </div>
            <p className="text-[11px] text-[#DBBA95]/80 font-medium">Solar Homeowner Connect</p>
          </div>
        </div>

        {/* Right Header Zone: Multi-Customer Persona Switcher + Profile Pill + Logout */}
        <div className="flex items-center gap-3">
          {/* Multi-Customer Demo Persona Switcher */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs">
            <Users className="w-3.5 h-3.5 text-[#DBBA95]" />
            <span className="text-white/70 text-[11px]">Demo Persona:</span>
            <select
              value={activeCustomer.id}
              onChange={(e) => handleSwitchPersona(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer"
            >
              {DEMO_CUSTOMERS.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#292724] text-white">
                  {c.name} ({c.city})
                </option>
              ))}
            </select>
          </div>

          {/* Customer Profile Pill */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors"
            title="View personal profile and installation property"
          >
            <div className="w-7 h-7 rounded-full bg-[#DBBA95] text-[#292724] font-bold text-xs flex items-center justify-center">
              {activeCustomer.avatarInitials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{activeCustomer.name}</p>
              <p className="text-[10px] text-[#DBBA95]/80 leading-tight">
                {activeCustomer.city} • {activeCustomer.roofAreaSqFt} sq.ft
              </p>
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-white/10 transition-colors text-xs font-semibold"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* Dynamic Welcome Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E2D9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-lg font-bold text-[#292724] tracking-tight">
                Welcome back, {activeCustomer.name}!
              </h2>
            </div>
            <p className="text-xs text-[#292724]/70 mt-0.5">
              Property Location: <strong>{activeCustomer.address}, {activeCustomer.city}</strong> • Sanctioned Load: {activeCustomer.sanctionLoadKw} kW
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
              Account ID: {activeCustomer.id}
            </span>
          </div>
        </div>

        {/* =======================================================================
            4 INTUITIVE CUSTOMER-CENTRIC NAVIGATION TABS
            ======================================================================= */}
        <div className="flex items-center gap-2 border-b border-[#E7E2D9] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'advisor'
                ? 'bg-[#292724] text-white shadow-xs'
                : 'bg-white text-[#292724]/75 border border-[#E7E2D9] hover:bg-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#DBBA95]" />
            <span>Tab 1: Overview & Solar Advisor</span>
          </button>

          <button
            onClick={() => setActiveTab('configure')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'configure'
                ? 'bg-[#C66B45] text-white shadow-xs font-bold'
                : 'bg-white text-[#292724]/75 border border-[#E7E2D9] hover:bg-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Tab 2: Configure & Place Order</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#292724] text-white shadow-xs'
                : 'bg-white text-[#292724]/75 border border-[#E7E2D9] hover:bg-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Tab 3: My Orders & Tracking</span>
            {orders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#C66B45] text-white">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'hardware'
                ? 'bg-[#292724] text-white shadow-xs'
                : 'bg-white text-[#292724]/75 border border-[#E7E2D9] hover:bg-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Tab 4: My Hardware & System Performance</span>
          </button>
        </div>

        {/* =======================================================================
            TAB 1: OVERVIEW & SOLAR ADVISOR (RECOMMENDATION ENGINE)
            ======================================================================= */}
        {activeTab === 'advisor' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Solar Advisor Interactive Tool */}
            <div className="bg-white p-6 rounded-2xl border border-[#E7E2D9] shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#E7E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#C66B45]" />
                    <h3 className="font-bold text-base text-[#292724]">Smart Solar Advisor & Feasibility Engine</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Calculate your optimal rooftop solar system size, PM Surya Ghar subsidy entitlement, and 25-year financial savings
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DBBA95]/20 text-[#C66B45] border border-[#DBBA95]/30 self-start sm:self-auto">
                  AI-Powered Feasibility
                </span>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rooftop Usable Area Slider */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900">
                      Usable Rooftop Area:
                    </label>
                    <span className="font-mono font-bold text-sm text-[#C66B45]">
                      {roofAreaSqFt} sq.ft
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="4000"
                    step="50"
                    value={roofAreaSqFt}
                    onChange={(e) => setRoofAreaSqFt(Number(e.target.value))}
                    className="w-full accent-[#C66B45] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>300 sq.ft (~3 kW)</span>
                    <span>2,000 sq.ft (~20 kW)</span>
                    <span>4,000 sq.ft</span>
                  </div>
                </div>

                {/* Monthly Electricity Bill Slider */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900">
                      Average Monthly Electricity Bill:
                    </label>
                    <span className="font-mono font-bold text-sm text-[#C66B45]">
                      ₹{monthlyBillInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="25000"
                    step="500"
                    value={monthlyBillInr}
                    onChange={(e) => setMonthlyBillInr(Number(e.target.value))}
                    className="w-full accent-[#C66B45] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>₹1,000 / mo</span>
                    <span>₹12,000 / mo</span>
                    <span>₹25,000 / mo</span>
                  </div>
                </div>
              </div>

              {/* Power Cut Frequency Toggle */}
              <div className="p-4 rounded-xl bg-[#F5F3EF] border border-[#E7E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-xs text-[#292724]">Local Grid Reliability & Power Outages:</h4>
                  <p className="text-[11px] text-slate-600">
                    Determines whether an On-Grid or Hybrid Battery Backup system is best for your residence.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPowerCutFrequency('rare')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      powerCutFrequency === 'rare'
                        ? 'bg-[#292724] text-white border-[#292724]'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Rare Outages (On-Grid)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPowerCutFrequency('frequent')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      powerCutFrequency === 'frequent'
                        ? 'bg-[#C66B45] text-white border-[#C66B45]'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Frequent Outages (Hybrid + Battery)
                  </button>
                </div>
              </div>

              {/* Advisor Output Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white border border-[#E7E2D9] shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">Recommended Sizing</span>
                  <p className="text-2xl font-bold font-mono text-[#292724] mt-1">
                    {advisorOptimalKw} kW
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {Math.ceil((advisorOptimalKw * 1000) / 545)}x 545W Mono PERC Modules
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E7E2D9] shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">Govt. PM Surya Ghar Subsidy</span>
                  <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                    ₹{advisorSubsidy.totalSubsidy.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-medium">Direct Bank Transfer (DBT)</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E7E2D9] shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">Estimated Monthly Savings</span>
                  <p className="text-2xl font-bold font-mono text-[#C66B45] mt-1">
                    ₹{advisorSubsidy.monthlySavingsInr.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-slate-400">~{advisorSubsidy.monthlyGenerationKwh} clean units / mo</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E7E2D9] shadow-2xs">
                  <span className="text-[11px] text-slate-500 font-medium block">Payback Horizon</span>
                  <p className="text-2xl font-bold font-mono text-[#292724] mt-1">
                    {advisorSubsidy.paybackYears} Years
                  </p>
                  <span className="text-[10px] text-slate-400">20+ Years of Free Power</span>
                </div>
              </div>

              {/* Call to Action Row */}
              <div className="p-5 rounded-xl bg-[#292724] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Ready to build your {advisorOptimalKw} kW {powerCutFrequency === 'frequent' ? 'Hybrid' : 'On-Grid'} Solar System?
                  </h4>
                  <p className="text-xs text-[#DBBA95]/80 mt-0.5">
                    Net Investment: <strong>₹{advisorSubsidy.netPayable.toLocaleString('en-IN')}</strong> after applying ₹{advisorSubsidy.totalSubsidy.toLocaleString('en-IN')} government subsidy.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedCapacityKw(advisorOptimalKw);
                    setSelectedSystemType(powerCutFrequency === 'frequent' ? 'Hybrid' : 'On-grid');
                    setActiveTab('configure');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-white font-bold text-xs shadow-md shadow-[#C66B45]/30 flex items-center gap-2 transition-all self-end sm:self-auto"
                >
                  <span>Configure This System</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 2: CONFIGURE & PLACE ORDER (WITH SUBSIDY CALCULATOR & BOM)
            ======================================================================= */}
        {activeTab === 'configure' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E7E2D9] shadow-xs space-y-8 animate-in fade-in duration-150">
            <div className="pb-4 border-b border-[#E7E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-[#292724]">Configure Your Custom Solar Energy System</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select architecture, capacity, add-ons, and verify government subsidy before order submission
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenBOM(selectedSystemType)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#C66B45] text-[#C66B45] bg-[#C66B45]/5 hover:bg-[#C66B45]/10 text-xs font-bold transition-all shadow-2xs self-start sm:self-auto"
              >
                <Layers className="w-4 h-4" />
                <span>Explore System Breakdown (BOM)</span>
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-8">
              {/* Step 1: System Architecture Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#292724] uppercase tracking-wider">
                  Step 1: Choose System Architecture:
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* On-Grid Card */}
                  <div
                    onClick={() => setSelectedSystemType('On-grid')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedSystemType === 'On-grid'
                        ? 'bg-[#C66B45]/5 border-[#C66B45] ring-2 ring-[#C66B45]/30 shadow-sm'
                        : 'bg-white border-[#E7E2D9] hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Subsidy Eligible (₹78k)
                        </span>
                        {selectedSystemType === 'On-grid' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#C66B45]">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-[#292724]">On-Grid Solar System</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Direct grid-tied with bi-directional net metering. Exports excess power to DISCOM for maximum electricity bill reduction.
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#E7E2D9] flex justify-between items-center text-xs">
                      <span className="text-slate-500">Base Rate:</span>
                      <span className="font-mono font-bold text-[#292724]">~₹62,000 / kW</span>
                    </div>
                  </div>

                  {/* Hybrid Card */}
                  <div
                    onClick={() => setSelectedSystemType('Hybrid')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedSystemType === 'Hybrid'
                        ? 'bg-[#C66B45]/5 border-[#C66B45] ring-2 ring-[#C66B45]/30 shadow-sm'
                        : 'bg-white border-[#E7E2D9] hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          Net-Meter + Battery
                        </span>
                        {selectedSystemType === 'Hybrid' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#C66B45]">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-[#292724]">Hybrid Solar System</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        The ultimate resilience solution: feeds the grid during the day and provides 10ms blackout backup with smart lithium storage at night.
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#E7E2D9] flex justify-between items-center text-xs">
                      <span className="text-slate-500">Base Rate:</span>
                      <span className="font-mono font-bold text-[#292724]">~₹88,000 / kW</span>
                    </div>
                  </div>

                  {/* Off-Grid Card */}
                  <div
                    onClick={() => setSelectedSystemType('Off-grid')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedSystemType === 'Off-grid'
                        ? 'bg-[#C66B45]/5 border-[#C66B45] ring-2 ring-[#C66B45]/30 shadow-sm'
                        : 'bg-white border-[#E7E2D9] hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          100% Independent
                        </span>
                        {selectedSystemType === 'Off-grid' && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#C66B45]">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-[#292724]">Off-Grid Solar System</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Zero grid connection required. High-capacity LiFePO4 storage bank designed for remote farmhouses and zero-utility sites.
                      </p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-[#E7E2D9] flex justify-between items-center text-xs">
                      <span className="text-slate-500">Base Rate:</span>
                      <span className="font-mono font-bold text-[#292724]">~₹98,000 / kW</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Capacity Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#292724] uppercase tracking-wider">
                  Step 2: Select System Sizing (kW Capacity):
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[3, 5, 8, 10, 15].map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => setSelectedCapacityKw(kw)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        selectedCapacityKw === kw
                          ? 'bg-[#292724] text-white border-[#292724] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="block font-bold text-base font-mono">{kw} kW</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        ~{Math.round(kw * 125)} units/mo
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Hardware Add-ons & Expansions */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#292724] uppercase tracking-wider">
                  Step 3: Optional Hardware Add-ons:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableAddons.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => {
                          setSelectedAddons(prev =>
                            isChecked ? prev.filter(x => x !== addon.id) : [...prev, addon.id]
                          );
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isChecked
                            ? 'bg-[#C66B45]/5 border-[#C66B45]'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {addon.category}
                          </span>
                          <h5 className="font-bold text-xs text-[#292724]">{addon.name}</h5>
                          <p className="text-[11px] text-slate-500">{addon.description}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-xs text-[#292724] block">
                            +₹{addon.price.toLocaleString('en-IN')}
                          </span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 mt-2 accent-[#C66B45] rounded"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Government Solar Subsidy & Pricing Engine Output */}
              <div className="p-5 rounded-2xl bg-[#F5F3EF] border border-[#E7E2D9] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D9]">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-sm text-[#292724]">Official Pricing & Subsidy Ledger</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    PM Surya Ghar Verified
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">
                      Gross Turnkey System Cost ({selectedCapacityKw} kW {selectedSystemType}):
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{checkoutSubsidy.grossCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {addonsTotal > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-600">Selected Hardware Add-ons ({selectedAddons.length}):</span>
                      <span className="font-mono font-bold text-slate-900">
                        +₹{addonsTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-1 text-emerald-700 font-semibold border-b border-slate-200/60">
                    <span>Central Government Subsidy (PM Surya Ghar DBT):</span>
                    <span className="font-mono">-₹{checkoutSubsidy.centralSubsidy.toLocaleString('en-IN')}</span>
                  </div>

                  {checkoutSubsidy.stateSubsidy > 0 && (
                    <div className="flex justify-between py-1 text-emerald-700 font-semibold border-b border-slate-200/60">
                      <span>State Green Fund Incentive ({activeCustomer.state}):</span>
                      <span className="font-mono">-₹{checkoutSubsidy.stateSubsidy.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 text-base font-bold text-[#292724]">
                    <span>Net Customer Payable Amount:</span>
                    <span className="font-mono text-xl text-[#C66B45]">
                      ₹{finalNetPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Documentation Checklist Warning / Transparency Box */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Required Subsidy Verification Documents (Collected during on-site survey):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                    {checkoutSubsidy.documentationChecklist.map(doc => (
                      <div key={doc.id} className="flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{doc.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 5: Verified Customer Metadata & Installation Address Confirmation */}
              <div className="space-y-4">
                <label className="block text-xs font-bold text-[#292724] uppercase tracking-wider">
                  Step 5: Verify Installation Address & Contact Attribution:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Customer Full Name:</label>
                    <input
                      type="text"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C66B45]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Email Address:</label>
                    <input
                      type="email"
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C66B45]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Contact Phone:</label>
                    <input
                      type="tel"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C66B45]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Installation Site Address:
                  </label>
                  <input
                    type="text"
                    value={checkoutAddress}
                    onChange={(e) => setCheckoutAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C66B45]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Special Site Notes / Roof Access Instructions (Optional):
                  </label>
                  <textarea
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Provide details on roof orientation, water tank location, or preferred survey visit slot..."
                    rows={2}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#C66B45]"
                  />
                </div>
              </div>

              {/* Final Submit Bar */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Final Payable Amount:</span>
                  <span className="text-xl font-bold font-mono text-white">
                    ₹{finalNetPayable.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-white font-bold text-xs shadow-lg shadow-[#C66B45]/30 flex items-center gap-2 transition-all self-end sm:self-auto"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Submit Turnkey Solar Order</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =======================================================================
            TAB 3: MY ORDERS & TRACKING (VISUAL 5-MILESTONE TIMELINE)
            ======================================================================= */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-2xl border border-[#E7E2D9] shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="pb-4 border-b border-[#E7E2D9] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#292724]">My Solar Orders & Execution Tracking</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time milestone progress synchronized directly with Operations & Field Engineering
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                {orders.length} Active Orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Package className="w-10 h-10 mx-auto text-slate-300" />
                <h4 className="font-bold text-sm text-slate-800">No Orders Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven't placed a solar installation order yet. Click below to explore our recommendations!
                </p>
                <button
                  onClick={() => setActiveTab('configure')}
                  className="px-4 py-2 rounded-xl bg-[#C66B45] text-white font-bold text-xs transition-colors"
                >
                  Configure a Solar System
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl border border-[#E7E2D9] bg-white shadow-2xs space-y-5"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#C66B45]">{order.id}</span>
                            <span className="text-xs text-slate-400">• Booked {order.timestamp}</span>
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {order.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-[#292724] mt-1">
                            {order.capacityKw} kW {order.systemType} Solar Turnkey System
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Installation Site: {order.installationAddress}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 block font-medium">Net Order Value:</span>
                          <span className="font-mono font-bold text-base text-[#292724]">
                            ₹{order.netPayable.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Visual 5-Milestone Tracking Timeline */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">Project Milestone Lifecycle</span>
                          <span className="font-mono font-bold text-[#C66B45]">{order.progressPercent}% Complete</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#DBBA95] to-[#C66B45] transition-all duration-500"
                            style={{ width: `${order.progressPercent}%` }}
                          />
                        </div>

                        {/* 5 Stage Nodes */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                          {milestoneSteps.map((step, idx) => {
                            const isCurrent = order.status === step.status;
                            const isCompleted = order.progressPercent >= (idx + 1) * 20;

                            return (
                              <div
                                key={step.status}
                                className={`p-2.5 rounded-xl border text-left transition-all ${
                                  isCurrent
                                    ? 'bg-[#C66B45]/10 border-[#C66B45]'
                                    : isCompleted
                                    ? 'bg-emerald-50/60 border-emerald-200'
                                    : 'bg-slate-50 border-slate-200 opacity-60'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <Clock className="w-3.5 h-3.5 text-[#C66B45] shrink-0" />
                                  )}
                                  <span className="font-bold text-[11px] text-slate-900 truncate">
                                    {step.title}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 line-clamp-2">{step.desc}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Assigned Lead Technician & Actions Row */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">
                            RT
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Assigned Field Lead:</span>
                            <span className="font-bold text-slate-900">
                              {order.assignedTechnicianName || 'Rajesh & Team'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono ml-2">
                              {order.assignedTechnicianPhone || '+91 98600 55891'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadDoc(order.documentUrl || 'Advance Invoice')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[#292724] font-semibold text-[11px] transition-colors shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5 text-[#C66B45]" />
                            <span>Download Invoice & Docket</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =======================================================================
            TAB 4: MY HARDWARE & SYSTEM PERFORMANCE (POST-INSTALLATION)
            ======================================================================= */}
        {activeTab === 'hardware' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Real-Time Generation Telemetry Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#E7E2D9] shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium block">Today's Clean Solar Generation</span>
                <p className="text-2xl font-bold font-mono text-[#292724] mt-1">42.4 kWh</p>
                <span className="text-[10px] text-slate-400">Peak instantaneous output: 8.8 kW at 1:15 PM</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E7E2D9] shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium block">Lifetime Clean Electricity</span>
                <p className="text-2xl font-bold font-mono text-[#292724] mt-1">8,420 kWh</p>
                <span className="text-[10px] text-slate-400">Total utility bill savings: ₹74,800</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E7E2D9] shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium block">Environmental Impact</span>
                <p className="text-2xl font-bold font-mono text-[#292724] mt-1">6.8 Tons CO₂</p>
                <span className="text-[10px] text-slate-400">Equivalent to planting 110 mature trees</span>
              </div>
            </div>

            {/* Hardware Status Cards with High-Res Photography */}
            <div className="bg-white p-6 rounded-2xl border border-[#E7E2D9] shadow-xs space-y-5">
              <div className="pb-3 border-b border-[#E7E2D9] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#292724]">Commissioned Hardware & Warranty Certificates</h3>
                  <p className="text-[11px] text-slate-500">
                    Active equipment at {activeCustomer.address}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Turnkey Commissioned
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                {/* Hardware 1: PV Modules */}
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/40 hover:shadow-md transition-all flex flex-col">
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={standaloneSolarPanelImg}
                      alt="Tier-1 Monocrystalline Solar Panels"
                      className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#292724]/80 text-white font-bold text-[10px]">
                      PV Module Array
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                      20-Yr Warranty
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#292724]">Waaree 545W Mono PERC Half-Cut</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Bi-facial high-temperature modules with anti-reflective self-cleaning glass.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-700 space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Array:</span>
                        <span className="font-semibold text-slate-900">13.08 kWp DC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Health:</span>
                        <span className="font-semibold text-emerald-700">Optimal (Zero Shading)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hardware 2: Inverter */}
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/40 hover:shadow-md transition-all flex flex-col">
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={solarBatteryInverterImg}
                      alt="Growatt 10kW Hybrid Inverter"
                      className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#292724]/80 text-white font-bold text-[10px]">
                      Hybrid Inverter
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">
                      5-Yr Warranty
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#292724]">Growatt 10kW Hybrid SPH-10000</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Dual MPPT smart bi-directional inverter with cloud WiFi telemetry.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-700 space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Serial No:</span>
                        <span className="font-semibold text-slate-900">INV-GW-10K-8831</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <span className="font-semibold text-emerald-700">Online & Synchronized</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hardware 3: Battery Storage */}
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/40 hover:shadow-md transition-all flex flex-col">
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={solarBatteryInverterImg}
                      alt="LiFePO4 Storage Module"
                      className="w-full h-full object-cover object-bottom hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#292724]/80 text-white font-bold text-[10px]">
                      LiFePO4 Storage
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-purple-600 text-white font-bold text-[10px]">
                      5-Yr Warranty
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#292724]">2x 5.12 kWh Pylontech Lithium</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        10.24 kWh total usable reserve capacity with 6,000 cycle design life.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-700 space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Serial No:</span>
                        <span className="font-semibold text-slate-900">BAT-PY-48100-2401</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">State of Charge:</span>
                        <span className="font-semibold text-emerald-700">94% (Full Backup)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bill of Materials (BOM) Specs Modal */}
      <GridBreakdownModal
        isOpen={isBOMModalOpen}
        onClose={() => setIsBOMModalOpen(false)}
        systemType={bomModalSystemType}
        capacityKw={selectedCapacityKw}
      />

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentRole="customer"
        userEmail={activeCustomer.email}
      />

      {/* Customer-Facing Floating Support Chatbot */}
      <CustomerSupportChat
        currentCustomer={activeCustomer}
        activeOrderId={orders[0]?.id}
      />
    </div>
  );
};
