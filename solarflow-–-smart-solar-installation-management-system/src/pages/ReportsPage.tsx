import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Percent,
  CheckCircle2,
  Boxes,
  FileText,
  LifeBuoy,
  Download
} from 'lucide-react';
import { DataService } from '../services/dataService';
import { useToast } from '../components/common/Toast';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [dateFilter, setDateFilter] = useState<'month' | 'quarter' | 'ytd'>('month');

  const quotations = DataService.getQuotations();
  const projects = DataService.getProjects();
  const inventory = DataService.getInventory();
  const tickets = DataService.getServiceTickets();
  const warranties = DataService.getWarranties();

  // Computations
  const approvedQuotes = quotations.filter(q => q.status === 'Approved');
  const totalRevenue = approvedQuotes.reduce((acc, q) => acc + q.grandTotal, 0);
  const pendingQuotes = quotations.filter(q => q.status === 'Sent' || q.status === 'Draft');
  const pendingQuotesValue = pendingQuotes.reduce((acc, q) => acc + q.grandTotal, 0);

  const completedProjects = projects.filter(p => p.stage === 'Completed');
  const projectCompletionRate = projects.length > 0 ? Math.round((completedProjects.length / projects.length) * 100) : 0;

  const totalInventoryValue = inventory.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);
  const lowStockCount = inventory.filter(i => i.quantity <= i.minStockAlert).length;

  const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
  const ticketResolutionRate = tickets.length > 0 ? Math.round((resolvedTickets.length / tickets.length) * 100) : 100;

  // Monthly Revenue Trend Data (Clean SVG)
  const monthlyData = [
    { month: 'Jun', revenue: 640000, capacity: 16 },
    { month: 'Jul', revenue: 890000, capacity: 22 },
    { month: 'Aug', revenue: 1120000, capacity: 28 },
    { month: 'Sep', revenue: 980000, capacity: 24 },
    { month: 'Oct', revenue: 1450000, capacity: 36 }
  ];

  const maxRev = Math.max(...monthlyData.map(d => d.revenue));

  // Project Profitability sample table
  const profitabilityRows = [
    {
      id: 'PRJ-2026-042',
      customer: 'Rajendra Joshi',
      capacity: '10 kW Hybrid',
      contractValue: 823798,
      equipmentCost: 585400,
      laborCost: 35000,
      grossProfit: 203398,
      marginPercent: 24.7
    },
    {
      id: 'PRJ-2026-045',
      customer: 'Ananya Deshpande',
      capacity: '6 kW Hybrid',
      contractValue: 441771,
      equipmentCost: 312000,
      laborCost: 28000,
      grossProfit: 101771,
      marginPercent: 23.0
    },
    {
      id: 'PRJ-2026-046',
      customer: 'Suresh Singhania',
      capacity: '25 kW On-grid',
      contractValue: 1015096,
      equipmentCost: 710000,
      laborCost: 75000,
      grossProfit: 230096,
      marginPercent: 22.7
    }
  ];

  const handleExportCSV = () => {
    showToast('SolarFlow monthly performance ledger exported to CSV.', 'success');
  };

  return (
    <div className="space-y-6 pb-8 text-xs">
      {/* Top Filter and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#C66B45]" />
          <span className="font-bold text-[#292724] text-xs">Reporting Period:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                dateFilter === 'month'
                  ? 'bg-[#292724] text-[#FFFFFF] border-[#292724]'
                  : 'bg-[#FFFFFF] text-[#292724]/70 border-[#E7E2D9] hover:border-[#DBBA95]'
              }`}
            >
              Current Month
            </button>
            <button
              onClick={() => setDateFilter('quarter')}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                dateFilter === 'quarter'
                  ? 'bg-[#292724] text-[#FFFFFF] border-[#292724]'
                  : 'bg-[#FFFFFF] text-[#292724]/70 border-[#E7E2D9] hover:border-[#DBBA95]'
              }`}
            >
              Last Quarter
            </button>
            <button
              onClick={() => setDateFilter('ytd')}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                dateFilter === 'ytd'
                  ? 'bg-[#292724] text-[#FFFFFF] border-[#292724]'
                  : 'bg-[#FFFFFF] text-[#292724]/70 border-[#E7E2D9] hover:border-[#DBBA95]'
              }`}
            >
              Year to Date (FY26)
            </button>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] font-semibold hover:bg-[#F5F3EF]"
        >
          <Download className="w-3.5 h-3.5 text-[#292724]/70" />
          <span>Export Financial CSV</span>
        </button>
      </div>

      {/* 4 Essential Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
          <span className="text-xs text-[#292724]/70 font-medium">Approved Contract Value</span>
          <p className="text-2xl font-bold font-mono text-[#292724] mt-1 tabular-nums">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#292724]/60 mt-0.5">
            Pending in pipeline: <strong className="font-mono text-[#C66B45]">₹{pendingQuotesValue.toLocaleString('en-IN')}</strong>
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
          <span className="text-xs text-[#292724]/70 font-medium">Installation Completion Rate</span>
          <p className="text-2xl font-bold font-mono text-[#292724] mt-1 tabular-nums">
            {projectCompletionRate}%
          </p>
          <p className="text-[11px] text-[#292724]/60 mt-0.5">
            {completedProjects.length} completed of {projects.length} commissioned sites
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
          <span className="text-xs text-[#292724]/70 font-medium">Warehouse Inventory Capital</span>
          <p className="text-2xl font-bold font-mono text-[#292724] mt-1 tabular-nums">
            ₹{totalInventoryValue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#292724]/60 mt-0.5">
            {lowStockCount} items requiring restocking
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
          <span className="text-xs text-[#292724]/70 font-medium">Service Ticket Turnaround</span>
          <p className="text-2xl font-bold font-mono text-[#292724] mt-1 tabular-nums">
            {ticketResolutionRate}% Resolved
          </p>
          <p className="text-[11px] text-[#292724]/60 mt-0.5">
            Average response time: 24 hrs
          </p>
        </div>
      </div>

      {/* 2 Focused Visual Representations in Strict Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart (Custom Clean SVG) */}
        <div className="lg:col-span-2 bg-[#FFFFFF] p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D9]">
            <div>
              <h3 className="font-bold text-sm text-[#292724]">Monthly Solar Revenue & Capacity (kW)</h3>
              <p className="text-[11px] text-[#292724]/60">Supply, structural works and commissioning invoices</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#C66B45]" />
                <span className="text-[#292724]/70">Revenue (₹)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#292724]" />
                <span className="text-[#292724]/70">Capacity (kW)</span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-56 w-full flex items-end justify-between gap-4 pt-6 px-2">
            {monthlyData.map((d) => {
              const heightPercent = Math.round((d.revenue / maxRev) * 100);
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-mono text-[#292724]/70 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₹{(d.revenue / 100000).toFixed(1)}L ({d.capacity} kW)
                  </span>
                  <div className="w-full max-w-[48px] flex items-end gap-1.5 h-full">
                    {/* Revenue Bar */}
                    <div
                      className="flex-1 bg-[#C66B45] rounded-t hover:bg-[#C66B45]/90 transition-all"
                      style={{ height: `${heightPercent}%` }}
                    />
                    {/* Capacity Bar */}
                    <div
                      className="w-2.5 bg-[#292724] rounded-t hover:bg-[#292724]/90 transition-all"
                      style={{ height: `${d.capacity * 2.2}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#292724] mt-2">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Architecture Capacity Breakdown */}
        <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#E7E2D9]">
            <h3 className="font-bold text-sm text-[#292724]">System Architecture Share</h3>
            <p className="text-[11px] text-[#292724]/60">Total 41 kW contracted capacity</p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#292724]">Commercial On-Grid (Grid-Tied)</span>
                <span className="font-mono font-bold text-[#292724]">25 kW (61%)</span>
              </div>
              <div className="w-full h-2 bg-[#E7E2D9] rounded-full overflow-hidden">
                <div className="h-full bg-[#292724] rounded-full" style={{ width: '61%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#292724]">Residential Hybrid with LiFePO4</span>
                <span className="font-mono font-bold text-[#292724]">16 kW (39%)</span>
              </div>
              <div className="w-full h-2 bg-[#E7E2D9] rounded-full overflow-hidden">
                <div className="h-full bg-[#C66B45] rounded-full" style={{ width: '39%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-[#292724]">Pure Off-Grid (Agricultural)</span>
                <span className="font-mono font-bold text-[#292724]">0 kW (0%)</span>
              </div>
              <div className="w-full h-2 bg-[#E7E2D9] rounded-full overflow-hidden">
                <div className="h-full bg-[#DBBA95] rounded-full" style={{ width: '0%' }} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7E2D9] text-[11px] text-[#292724]/70">
            Hybrid systems generate <strong className="text-[#292724]">38% higher margin</strong> per kW than pure on-grid due to battery integration and BMS configuration services.
          </div>
        </div>
      </div>

      {/* Project Profitability Table */}
      <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D9]">
          <div>
            <h3 className="font-bold text-sm text-[#292724]">Project Profitability & Cost Breakdown</h3>
            <p className="text-[11px] text-[#292724]/60">Contract invoice value vs BOM equipment cost & technician installation labor</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F3EF] border-b border-[#E7E2D9] text-[#292724]/70 font-semibold">
                <th className="py-2.5 px-3">Project ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">System Spec</th>
                <th className="py-2.5 px-3 font-mono text-right">Contract Price (₹)</th>
                <th className="py-2.5 px-3 font-mono text-right">Hardware COGS (₹)</th>
                <th className="py-2.5 px-3 font-mono text-right">Field Labor (₹)</th>
                <th className="py-2.5 px-3 font-mono text-right">Gross Margin (₹)</th>
                <th className="py-2.5 px-3 font-mono text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E2D9]">
              {profitabilityRows.map(row => (
                <tr key={row.id} className="hover:bg-[#F5F3EF]/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#292724]">{row.id}</td>
                  <td className="py-3 px-3 font-medium text-[#292724]">{row.customer}</td>
                  <td className="py-3 px-3 text-[#292724]">{row.capacity}</td>
                  <td className="py-3 px-3 font-mono text-right text-[#292724]">
                    ₹{row.contractValue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-[#292724]/70">
                    ₹{row.equipmentCost.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-[#292724]/70">
                    ₹{row.laborCost.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-right text-[#292724]">
                    ₹{row.grossProfit.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-right text-[#C66B45]">
                    {row.marginPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
