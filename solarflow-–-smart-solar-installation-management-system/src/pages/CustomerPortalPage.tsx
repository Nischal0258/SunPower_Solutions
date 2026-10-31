import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { ProfileSettingsModal } from '../components/common/ProfileSettingsModal';

interface CustomerPortalPageProps {
  onLogout: () => void;
}

export const CustomerPortalPage: React.FC<CustomerPortalPageProps> = ({ onLogout }) => {
  const { showToast } = useToast();
  // Strictly 3 dedicated capabilities for customer users
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'new-order'>('products');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // New order form state
  const [selectedAddon, setSelectedAddon] = useState<string>('bat-5kw');
  const [orderNotes, setOrderNotes] = useState('');

  // Customer order history state
  const [orderHistory, setOrderHistory] = useState([
    {
      orderId: 'ORD-2026-088',
      title: '10 kW Residential Hybrid Solar System',
      date: '2026-10-24',
      value: 823798,
      status: 'Commissioned & Net-Metered',
      details: '24x 545W Bifacial PV Panels + 10kW Inverter + 10.24kWh Storage',
      document: 'Official Handover & Net-Metering Certificate'
    },
    {
      orderId: 'ORD-2026-054',
      title: 'DISCOM Feasibility Survey & Sanction Clearance',
      date: '2026-09-15',
      value: 25000,
      status: 'Completed',
      details: 'Site feasibility clearance and bi-directional meter sanction',
      document: 'DISCOM Feasibility Approval Receipt'
    }
  ]);

  // Available add-ons for placing new orders
  const addonCatalog = [
    {
      id: 'bat-5kw',
      name: '5.12 kWh LiFePO4 Battery Storage Expansion',
      category: 'Energy Storage',
      price: 145000,
      subsidyEligible: true,
      description: 'Expand your night-time backup storage with an additional 51.2V 100Ah lithium iron phosphate module.'
    },
    {
      id: 'ev-charger',
      name: '7.4 kW Smart EV Fast Charger (Type-2 Wallbox)',
      category: 'EV Mobility',
      price: 58000,
      subsidyEligible: false,
      description: 'Integrate electric vehicle charging directly powered by your rooftop solar generation.'
    },
    {
      id: 'heat-pump',
      name: 'Solar Heat Pump 200L Water Heating Module',
      category: 'Thermal Integration',
      price: 48000,
      subsidyEligible: false,
      description: 'High-efficiency heat pump utilizing daytime solar electricity to provide round-the-clock hot water.'
    },
    {
      id: 'maintenance-plan',
      name: 'Annual Solar Operations & Maintenance (O&M) Care',
      category: 'Care Plan',
      price: 9500,
      subsidyEligible: false,
      description: '4 quarterly deep panel cleanings, thermal imaging audit, and annual inverter firmware servicing.'
    }
  ];

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const item = addonCatalog.find(a => a.id === selectedAddon);
    if (!item) return;

    const newOrder = {
      orderId: `ORD-2026-0${Math.floor(100 + Math.random() * 900)}`,
      title: item.name,
      date: new Date().toISOString().split('T')[0],
      value: item.price,
      status: 'Order Placed & Processing',
      details: item.description,
      document: 'Order Confirmation & Advance Invoice'
    };

    setOrderHistory(prev => [newOrder, ...prev]);
    showToast(`Order request for ${item.name} submitted successfully! Our engineering team will contact you.`, 'success');
    setActiveTab('orders');
    setOrderNotes('');
  };

  const handleDownloadDoc = (docName: string) => {
    showToast(`Downloading official ${docName}...`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#292724] flex flex-col font-sans">
      {/* Top Customer Header Bar */}
      <header className="sticky top-0 z-30 bg-[#292724] text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
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

        {/* Customer Profile Pill & Logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors"
            title="View personal profile information"
          >
            <div className="w-7 h-7 rounded-full bg-[#DBBA95] text-[#292724] font-bold text-xs flex items-center justify-center">
              RS
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">Rajesh Sharma</p>
              <p className="text-[10px] text-[#DBBA95]/80 leading-tight">10 kW Hybrid • Baner Hills</p>
            </div>
          </button>

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
        {/* Navigation Tabs - Dedicated 3 Capabilities */}
        <div className="flex items-center gap-2 border-b border-[#E7E2D9] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'products'
                ? 'bg-[#292724] text-white shadow-xs'
                : 'bg-white text-[#292724]/75 border border-[#E7E2D9] hover:bg-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>1. Assigned Products</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#292724] text-white shadow-xs'
                : 'bg-white text-[#292724]/75 border border-[#E7E2D9] hover:bg-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>2. Order History</span>
          </button>

          <button
            onClick={() => setActiveTab('new-order')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'new-order'
                ? 'bg-[#C66B45] text-white shadow-xs font-bold'
                : 'bg-white text-[#292724]/75 border border-[#E7E2D9] hover:bg-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>3. Place New Order</span>
          </button>
        </div>

        {/* =========================================================================
            FEATURE 1: VIEW ASSIGNED PRODUCTS
            ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* System Performance Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#E7E2D9] shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium block">Today's Solar Energy Generation</span>
                <p className="text-2xl font-bold font-mono text-[#292724] mt-1">42.4 kWh</p>
                <span className="text-[10px] text-slate-400">Peak output: 8.8 kW at 1:15 PM</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E7E2D9] shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium block">Lifetime Clean Electricity</span>
                <p className="text-2xl font-bold font-mono text-[#292724] mt-1">8,420 kWh</p>
                <span className="text-[10px] text-slate-400">Net electricity bill savings: ₹74,800</span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E7E2D9] shadow-xs">
                <span className="text-[11px] text-slate-500 font-medium block">Lifetime Environmental Impact</span>
                <p className="text-2xl font-bold font-mono text-[#292724] mt-1">6.8 Tons CO₂</p>
                <span className="text-[10px] text-slate-400">Equivalent to planting 110 mature trees</span>
              </div>
            </div>

            {/* Installed Equipment Cards */}
            <div className="bg-white p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-4">
              <div className="pb-3 border-b border-[#E7E2D9] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#292724]">Assigned Solar Hardware & Equipment</h3>
                  <p className="text-[11px] text-slate-500">Equipment installed and commissioned at Baner Hills site</p>
                </div>
                <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  Turnkey Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Product 1: Solar Panels */}
                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                      PV Module Array
                    </span>
                    <span className="text-[10px] font-semibold text-slate-700">20-Yr Warranty</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#292724]">24x 545W Monocrystalline Panels</h4>
                  <p className="text-[11px] text-slate-500">Tier-1 DCR Bi-facial modules with high temperature tolerance.</p>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 font-mono">
                    <div>Capacity: 13.08 kWp DC</div>
                    <div>Status: Optimal Generation</div>
                  </div>
                </div>

                {/* Product 2: Inverter */}
                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                      Hybrid Inverter
                    </span>
                    <span className="text-[10px] font-semibold text-slate-700">2-Yr Warranty</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#292724]">Growatt 10kW Hybrid SPH-10000</h4>
                  <p className="text-[11px] text-slate-500">Dual MPPT with integrated battery charge controller and grid-tie bypass.</p>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 font-mono">
                    <div>Serial: INV-GW-5000-8831</div>
                    <div>Status: Connected & Synchronized</div>
                  </div>
                </div>

                {/* Product 3: Batteries */}
                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                      LiFePO4 Storage
                    </span>
                    <span className="text-[10px] font-semibold text-slate-700">2-Yr Warranty</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#292724]">2x 5.12 kWh Pylontech Lithium</h4>
                  <p className="text-[11px] text-slate-500">10.24 kWh total reserve storage with 6,000 cycle lifespan.</p>
                  <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 font-mono">
                    <div>Serial: BAT-PY-48100-2401</div>
                    <div>State of Charge: 94%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE 2: VIEW ORDER HISTORY
            ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="bg-white p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-4 animate-in fade-in duration-150">
            <div className="pb-3 border-b border-[#E7E2D9] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#292724]">Your Solar Project Order History</h3>
                <p className="text-[11px] text-slate-500">Official record of contracted turnkey installations and equipment orders</p>
              </div>
              <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                {orderHistory.length} Orders
              </span>
            </div>

            <div className="space-y-3">
              {orderHistory.map((order) => (
                <div
                  key={order.orderId}
                  className="p-4 rounded-xl border border-[#E7E2D9] bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#C66B45]">{order.orderId}</span>
                      <span className="text-[10px] text-slate-400">• {order.date}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {order.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#292724]">{order.title}</h4>
                    <p className="text-[11px] text-slate-500">{order.details}</p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-base text-[#292724]">
                      ₹{order.value.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleDownloadDoc(order.document)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E2D9] bg-slate-50 hover:bg-slate-100 text-[#292724] text-[11px] font-semibold transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C66B45]" />
                      <span>Download Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            FEATURE 3: PLACE NEW ORDERS
            ========================================================================= */}
        {activeTab === 'new-order' && (
          <div className="bg-white p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="pb-3 border-b border-[#E7E2D9]">
              <h3 className="font-bold text-sm text-[#292724]">Place a New Solar Equipment or Expansion Order</h3>
              <p className="text-[11px] text-slate-500">
                Order additional battery modules, EV chargers, solar heat pumps, or scheduled maintenance
              </p>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              {/* Add-on Catalog Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#292724]">
                  Select Hardware Add-on or Service:
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addonCatalog.map((addon) => {
                    const isSelected = selectedAddon === addon.id;
                    return (
                      <div
                        key={addon.id}
                        onClick={() => setSelectedAddon(addon.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#C66B45]/10 border-[#C66B45] shadow-sm'
                            : 'bg-white border-[#E7E2D9] hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {addon.category}
                            </span>
                            {isSelected && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-[#C66B45]">
                                <Check className="w-3.5 h-3.5" />
                                Selected
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-xs text-[#292724]">{addon.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1">{addon.description}</p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#E7E2D9] flex items-center justify-between">
                          <span className="text-xs text-slate-500">Equipment & Installation Price:</span>
                          <span className="font-mono font-bold text-sm text-[#292724]">
                            ₹{addon.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Notes / Instructions */}
              <div>
                <label className="block text-xs font-semibold text-[#292724] mb-1.5">
                  Installation Preferences / Scheduling Notes (Optional):
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Specify preferred site visit dates, installation location details, or special requests..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2D9] bg-white text-xs text-[#292724] focus:outline-none focus:border-[#C66B45]"
                />
              </div>

              {/* Submit Row */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-600 block">Installation Address:</span>
                  <p className="font-semibold text-xs text-[#292724]">Baner Hills, Pune, Maharashtra - 411045</p>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-white font-bold text-xs shadow-md shadow-[#C66B45]/20 flex items-center gap-2 transition-all self-end sm:self-auto"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Submit Order Request</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentRole="customer"
        userEmail="customer@gmail.com"
      />
    </div>
  );
};
