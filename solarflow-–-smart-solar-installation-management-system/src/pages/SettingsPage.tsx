import React, { useState } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  Download,
  Phone,
  Mail,
  MapPin,
  FileCheck
} from 'lucide-react';
import { TECHNICIANS, DataService } from '../services/dataService';
import { useToast } from '../components/common/Toast';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [companyName, setCompanyName] = useState('SunPower Technologies Pvt Ltd');
  const [gstin, setGstin] = useState('27AABCS1429B1Z8');
  const [mnreCode, setMnreCode] = useState('MNRE-CP-2024-MH-092');
  const [officialPhone, setOfficialPhone] = useState('+91 20 6712 4000');
  const [officialEmail, setOfficialEmail] = useState('operations@sunpower.in');
  const [hqAddress, setHqAddress] = useState('SunPower Towers, Baner Tech Park, High Street, Pune 411045');

  const [panelWarranty, setPanelWarranty] = useState(20);
  const [inverterWarranty, setInverterWarranty] = useState(2);
  const [batteryWarranty, setBatteryWarranty] = useState(2);
  const [compositeGst, setCompositeGst] = useState(13.8);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Company profile and credentials saved.', 'success');
  };

  const handleSaveDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Warranty standards & GST tax rules updated.', 'success');
  };

  const handleExportBackup = () => {
    const data = {
      customers: DataService.getCustomers(),
      inventory: DataService.getInventory(),
      quotations: DataService.getQuotations(),
      projects: DataService.getProjects(),
      warranties: DataService.getWarranties(),
      tickets: DataService.getServiceTickets()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sunpower_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('SunPower JSON database archive downloaded.', 'success');
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to restore the default solar demo data? This will reset local changes.')) {
      DataService.resetToDefaults();
      showToast('Database reset to demonstration defaults.', 'info');
      setTimeout(() => window.location.reload(), 400);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-xs max-w-5xl">
      {/* Company Profile Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#C66B45]" />
            <h3 className="font-bold text-sm text-slate-900">Solar Enterprise Profile & Licensing</h3>
          </div>
          <span className="text-[11px] text-slate-500">Used on official quotations & warranty certificates</span>
        </div>

        <form onSubmit={handleSaveCompany} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">Company Legal Entity Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">GSTIN Number (Goods & Services Tax)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">MNRE Channel Partner License Code</label>
              <input
                type="text"
                value={mnreCode}
                onChange={(e) => setMnreCode(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Official Support Phone</label>
              <input
                type="text"
                value={officialPhone}
                onChange={(e) => setOfficialPhone(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-slate-900 focus:outline-none focus:border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">Invoicing Support Email</label>
              <input
                type="email"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-900 mb-1">Headquarters & Fabrication Facility Address</label>
            <input
              type="text"
              value={hqAddress}
              onChange={(e) => setHqAddress(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-300"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-900 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Company Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Field Technicians Roster */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D9A441]" />
            <h3 className="font-bold text-sm text-slate-900">Certified Technician Team Roster</h3>
          </div>
          <span className="text-[11px] text-slate-500">Assigned for site surveys, installations and warranty visits</span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Technician ID</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3 font-mono text-center">Active Sites</th>
                <th className="py-2.5 px-3">Technical Qualifications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {TECHNICIANS.map((tech) => (
                <tr key={tech.id} className="hover:bg-slate-50/30">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{tech.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{tech.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{tech.phone}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-center text-slate-900">{tech.activeProjects}</td>
                  <td className="py-2.5 px-3 text-slate-600">{tech.certifications}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Solar System Policy Defaults */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C66B45]" />
            <h3 className="font-bold text-sm text-slate-900">Standard Warranty & Tax Calculation Rules</h3>
          </div>
          <span className="text-[11px] text-slate-500">System-enforced business policies</span>
        </div>

        <form onSubmit={handleSaveDefaults} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-900 mb-1">
                Solar Panel Warranty
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={panelWarranty}
                  onChange={(e) => setPanelWarranty(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-slate-900"
                  disabled
                />
                <span className="text-xs text-slate-500 font-semibold">Years</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Strict rule: 20 years</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">
                Inverter Warranty
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={inverterWarranty}
                  onChange={(e) => setInverterWarranty(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-slate-900"
                  disabled
                />
                <span className="text-xs text-slate-500 font-semibold">Years</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Strict rule: 2 years</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">
                Battery Bank Warranty
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={batteryWarranty}
                  onChange={(e) => setBatteryWarranty(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-slate-900"
                  disabled
                />
                <span className="text-xs text-slate-500 font-semibold">Years</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Strict rule: 2 years</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 mb-1">
                Composite Solar GST
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step={0.1}
                  value={compositeGst}
                  onChange={(e) => setCompositeGst(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-slate-900"
                />
                <span className="text-xs text-slate-500 font-semibold">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">70% goods + 30% services composite</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-900 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Defaults</span>
            </button>
          </div>
        </form>
      </div>

      {/* Database Maintenance & Backup */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900">Data Storage & Maintenance</h3>
          <span className="text-[11px] text-slate-500">Frontend state preservation & backup</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">Export Offline Data Snapshot</p>
            <p className="text-slate-600 mt-0.5">
              Download complete JSON ledger of customers, quotations, inventory items, warranties and service logs.
            </p>
          </div>
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50 shrink-0"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download JSON Backup</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-[#C66B45]">Reset Application Demonstration Data</p>
            <p className="text-slate-600 mt-0.5">
              Restores initial customers, quotation pipeline, inventory stock levels and installation files.
            </p>
          </div>
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C66B45]/10 text-[#C66B45] border border-[#C66B45]/30 font-semibold hover:bg-[#C66B45]/20 shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Demo Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};
