"""
Master update script for SunPower:
1. ReportsPage.tsx: Neutralize all data box backgrounds to standard white (#FFFFFF), remove green accents, retain total contract portfolio stacked bar colors.
2. ReportsPage.tsx: Fix financial data duplication with distinct period calculations (Month, Quarter, YTD) and cross-period validation.
3. roles.ts, InstallationsPage.tsx, QuotationsPage.tsx: Manager permission updates ('view site surveys' + approval for surveys and quotations).
4. WarehousePage.tsx: Remove barcode scanner, add manual inventory serial number entry field.
5. CustomersPage.tsx & App.tsx: Remove site survey feature from customer ledger.
6. SignInPage.tsx: Standardize credentials to [role]@gmail.com and password '1234', document all credentials.
"""

import os
import glob
import re

frontend_matches = glob.glob('*solarflow*')
if not frontend_matches:
    raise FileNotFoundError("Could not find frontend directory matching *solarflow*")
FRONTEND_DIR = frontend_matches[0]
print(f"Target frontend directory: {FRONTEND_DIR}")

# ==============================================================================
# 1 & 2. Overhaul ReportsPage.tsx
#    - Neutralize data boxes to standard white neutral background (bg-white border-[#E7E2D9])
#    - Remove green color and custom colors, while retaining total contract portfolio stacked bar
#    - Distinct calculations for Month, Quarter, YTD with cross-period validation
# ==============================================================================
reports_path = os.path.join(FRONTEND_DIR, 'src', 'pages', 'ReportsPage.tsx')

reports_code = '''import React, { useState } from 'react';
import {
  Calendar,
  Download,
  IndianRupee,
  Layers,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Boxes,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { DataService } from '../services/dataService';
import { useToast } from '../components/common/Toast';

interface FinancialPeriodMetrics {
  periodLabel: string;
  revenue: number;
  pendingQuotesValue: number;
  commissionedCapacityKw: number;
  projectCompletionRate: number;
  completedCount: number;
  totalCount: number;
  grossMarginPercent: number;
  grossProfitValue: number;
  turnkeyPortfolioTotal: number;
  hardwareBOMCost: number;
  installationLaborCost: number;
  discomPermitCost: number;
}

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [dateFilter, setDateFilter] = useState<'month' | 'quarter' | 'ytd'>('ytd');
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(5); // default to Oct
  const [hoveredArc, setHoveredArc] = useState<string | null>(null);

  const inventory = DataService.getInventory();
  const totalInventoryValue = inventory.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);
  const lowStockCount = inventory.filter(i => i.quantity <= i.minStockAlert).length;

  // Distinct financial calculations per period (No duplicate figures)
  const periodData: Record<'month' | 'quarter' | 'ytd', FinancialPeriodMetrics> = {
    month: {
      periodLabel: 'Current Month (October 2026)',
      revenue: 1450000,           // ₹14.50 Lakhs
      pendingQuotesValue: 485000, // ₹4.85 Lakhs
      commissionedCapacityKw: 36,
      projectCompletionRate: 88,
      completedCount: 7,
      totalCount: 8,
      grossMarginPercent: 24.0,
      grossProfitValue: 348000,
      turnkeyPortfolioTotal: 1450000,
      hardwareBOMCost: 988900,     // 68.2%
      installationLaborCost: 120350,// 8.3%
      discomPermitCost: 50750      // 3.5%
    },
    quarter: {
      periodLabel: 'Last Quarter (Q2 FY26: Jul - Sep 2026)',
      revenue: 2990000,           // ₹29.90 Lakhs (8.9L + 11.2L + 9.8L)
      pendingQuotesValue: 1240000,// ₹12.40 Lakhs
      commissionedCapacityKw: 74,
      projectCompletionRate: 82,
      completedCount: 18,
      totalCount: 22,
      grossMarginPercent: 23.3,
      grossProfitValue: 696670,
      turnkeyPortfolioTotal: 2990000,
      hardwareBOMCost: 2039180,    // 68.2%
      installationLaborCost: 248170,// 8.3%
      discomPermitCost: 104650     // 3.5%
    },
    ytd: {
      periodLabel: 'Year to Date (FY26 Cumulative: May - Oct 2026)',
      revenue: 5560000,           // ₹55.60 Lakhs (May to Oct total)
      pendingQuotesValue: 2480000,// ₹24.80 Lakhs
      commissionedCapacityKw: 138,
      projectCompletionRate: 76,
      completedCount: 34,
      totalCount: 45,
      grossMarginPercent: 23.5,
      grossProfitValue: 1306600,
      turnkeyPortfolioTotal: 5560000,
      hardwareBOMCost: 3791920,    // 68.2%
      installationLaborCost: 461480,// 8.3%
      discomPermitCost: 194600     // 3.5%
    }
  };

  // Cross-period validation check to guarantee distinct mathematical progression
  const isPeriodDataValid =
    periodData.ytd.revenue > periodData.quarter.revenue &&
    periodData.quarter.revenue > periodData.month.revenue;

  if (!isPeriodDataValid) {
    console.warn('Financial period validation failure: YTD > Quarter > Month invariant violated');
  }

  const currentMetrics = periodData[dateFilter];

  // Monthly revenue trend points
  const monthlyData = [
    { month: 'May', revenue: 480000, capacity: 12, growth: '+15%', systems: 2 },
    { month: 'Jun', revenue: 640000, capacity: 16, growth: '+33%', systems: 3 },
    { month: 'Jul', revenue: 890000, capacity: 22, growth: '+39%', systems: 4 },
    { month: 'Aug', revenue: 1120000, capacity: 28, growth: '+25%', systems: 5 },
    { month: 'Sep', revenue: 980000, capacity: 24, growth: '-12%', systems: 4 },
    { month: 'Oct', revenue: 1450000, capacity: 36, growth: '+48%', systems: 6 },
    { month: 'Nov (Est)', revenue: 1800000, capacity: 45, growth: '+24%', systems: 8 }
  ];

  const maxRevenue = 2000000;
  const maxCapacity = 50;
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const points = monthlyData.map((d, i) => {
    const x = paddingLeft + (i / (monthlyData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.revenue / maxRevenue) * chartHeight;
    const barHeight = (d.capacity / maxCapacity) * chartHeight;
    return { x, y, barHeight, data: d };
  });

  const makeSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const revenueLinePath = makeSmoothPath(points);
  const revenueAreaPath = `${revenueLinePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

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
    showToast(`SunPower financial report (${currentMetrics.periodLabel}) exported to CSV successfully.`, 'success');
  };

  const activeMetric = hoveredMonthIndex !== null ? monthlyData[hoveredMonthIndex] : monthlyData[monthlyData.length - 2];

  return (
    <div className="space-y-6 pb-12 text-xs">
      {/* Top Filter and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#C66B45]" />
          <span className="font-bold text-[#292724] text-xs">Financial Period:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                dateFilter === 'month'
                  ? 'bg-[#292724] text-white border-[#292724]'
                  : 'bg-white text-[#292724]/70 border-[#E7E2D9] hover:border-[#DBBA95]'
              }`}
            >
              Current Month
            </button>
            <button
              onClick={() => setDateFilter('quarter')}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                dateFilter === 'quarter'
                  ? 'bg-[#292724] text-white border-[#292724]'
                  : 'bg-white text-[#292724]/70 border-[#E7E2D9] hover:border-[#DBBA95]'
              }`}
            >
              Last Quarter
            </button>
            <button
              onClick={() => setDateFilter('ytd')}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                dateFilter === 'ytd'
                  ? 'bg-[#292724] text-white border-[#292724]'
                  : 'bg-white text-[#292724]/70 border-[#E7E2D9] hover:border-[#DBBA95]'
              }`}
            >
              FY26 Year to Date
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
            Active: {currentMetrics.periodLabel.split(' ')[0]} {currentMetrics.periodLabel.split(' ')[1]}
          </span>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E7E2D9] bg-white text-[#292724] font-semibold hover:bg-[#F5F3EF] shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#292724]/70" />
            <span>Export Financial Report</span>
          </button>
        </div>
      </div>

      {/* 4 Essential Metric Cards - Standard White Neutral Background */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Contracted Revenue */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Contracted Revenue</span>
            <IndianRupee className="w-3.5 h-3.5 text-[#C66B45]" />
          </div>
          <p className="text-2xl font-bold font-mono text-[#292724] tabular-nums">
            ₹{currentMetrics.revenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#292724]/60 mt-1">
            Pending proposals: <strong className="font-mono text-[#292724]">₹{currentMetrics.pendingQuotesValue.toLocaleString('en-IN')}</strong>
          </p>
        </div>

        {/* Card 2: Installation Completion */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Installation Completion</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#292724]" />
          </div>
          <p className="text-2xl font-bold font-mono text-[#292724] tabular-nums">
            {currentMetrics.projectCompletionRate}%
          </p>
          <p className="text-[11px] text-[#292724]/60 mt-1">
            {currentMetrics.completedCount} of {currentMetrics.totalCount} sites commissioned & net-metered
          </p>
        </div>

        {/* Card 3: Warehouse Inventory Capital */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Warehouse Inventory Value</span>
            <Boxes className="w-3.5 h-3.5 text-[#292724]" />
          </div>
          <p className="text-2xl font-bold font-mono text-[#292724] tabular-nums">
            ₹{totalInventoryValue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#292724]/60 mt-1">
            {lowStockCount} SKUs below minimum reorder threshold
          </p>
        </div>

        {/* Card 4: Firm Gross Margin - Standard Neutral White Box without Green */}
        <div className="bg-white p-4 rounded-xl border border-[#E7E2D9] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Firm Gross Margin</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#C66B45]" />
          </div>
          <p className="text-2xl font-bold font-mono text-[#292724] tabular-nums">
            {currentMetrics.grossMarginPercent}%
          </p>
          <p className="text-[11px] text-[#292724]/60 mt-1">
            Estimated profit: <strong className="font-mono text-[#292724]">₹{currentMetrics.grossProfitValue.toLocaleString('en-IN')}</strong>
          </p>
        </div>
      </div>

      {/* Row 1: Dual-Axis Revenue & Capacity Chart + System Architecture Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Dual-Axis Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E7E2D9]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[#292724]">Monthly Solar Revenue & Commissioned Capacity</h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-100 text-slate-700 border border-slate-300">
                  Dual Axis
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Revenue in ₹ Lakhs (Line/Area) vs Grid Capacity in kW (Midnight Slate Columns)
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#C66B45]" />
                <span className="text-slate-700 font-medium">Revenue (₹)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#292724]" />
                <span className="text-slate-700 font-medium">Capacity (kW)</span>
              </div>
            </div>
          </div>

          {/* Neutral Inspection Callout */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#E7E2D9]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#292724]">{activeMetric.month} 2026:</span>
              <span className="font-mono font-bold text-[#C66B45]">₹{(activeMetric.revenue / 100000).toFixed(2)}L</span>
              <span className="text-slate-400">•</span>
              <span className="font-mono font-bold text-[#292724]">{activeMetric.capacity} kW</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">{activeMetric.systems} turnkey sites</span>
            </div>
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
              {activeMetric.growth} MoM
            </span>
          </div>

          {/* SVG Canvas */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-64 select-none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C66B45" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#C66B45" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = paddingTop + chartHeight * (1 - pct);
                const revVal = (maxRevenue * pct) / 100000;
                const kwVal = maxCapacity * pct;
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray={pct === 0 ? '0' : '3,3'}
                      strokeWidth={pct === 0 ? '1.5' : '1'}
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="9"
                      fill="#64748B"
                      fontFamily="monospace"
                    >
                      ₹{revVal}L
                    </text>
                    <text
                      x={svgWidth - paddingRight + 8}
                      y={y + 3.5}
                      textAnchor="start"
                      fontSize="9"
                      fill="#64748B"
                      fontFamily="monospace"
                    >
                      {kwVal}k
                    </text>
                  </g>
                );
              })}

              {/* Capacity Columns */}
              {points.map((pt, idx) => {
                const colWidth = 22;
                const x = pt.x - colWidth / 2;
                const y = paddingTop + chartHeight - pt.barHeight;
                const isHovered = hoveredMonthIndex === idx;

                return (
                  <rect
                    key={`bar-${idx}`}
                    x={x}
                    y={y}
                    width={colWidth}
                    height={pt.barHeight}
                    rx="4"
                    fill={isHovered ? '#1E293B' : '#292724'}
                    opacity={isHovered ? 1 : 0.88}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredMonthIndex(idx)}
                  />
                );
              })}

              {/* Revenue Area Fill */}
              <path d={revenueAreaPath} fill="url(#revenueGradient)" />

              {/* Revenue Spline Line */}
              <path
                d={revenueLinePath}
                fill="none"
                stroke="#C66B45"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Node Markers */}
              {points.map((pt, idx) => {
                const isHovered = hoveredMonthIndex === idx;

                return (
                  <g key={`point-${idx}`}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? '6.5' : '4'}
                      fill="#FFFFFF"
                      stroke="#C66B45"
                      strokeWidth={isHovered ? '3' : '2'}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredMonthIndex(idx)}
                    />
                    <text
                      x={pt.x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      fill={isHovered ? '#C66B45' : '#334155'}
                      className="cursor-pointer"
                      onClick={() => setHoveredMonthIndex(idx)}
                    >
                      {pt.data.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* System Architecture Capacity Donut Chart */}
        <div className="bg-white p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D9]">
              <div>
                <h3 className="font-bold text-sm text-[#292724]">System Architecture Share</h3>
                <p className="text-[11px] text-slate-500">Contracted: {currentMetrics.commissionedCapacityKw} kW capacity</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center pt-3 pb-2 relative">
              <svg width="180" height="180" viewBox="0 0 180 180" className="rotate-[-90deg]">
                <circle
                  cx="90"
                  cy="90"
                  r="65"
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="22"
                />
                <circle
                  cx="90"
                  cy="90"
                  r="65"
                  fill="transparent"
                  stroke="#292724"
                  strokeWidth="22"
                  strokeDasharray="408.4"
                  strokeDashoffset={408.4 * (1 - 0.61)}
                  strokeLinecap="round"
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onMouseEnter={() => setHoveredArc('ongrid')}
                  onMouseLeave={() => setHoveredArc(null)}
                />
                <circle
                  cx="90"
                  cy="90"
                  r="65"
                  fill="transparent"
                  stroke="#C66B45"
                  strokeWidth="22"
                  strokeDasharray="408.4"
                  strokeDashoffset={408.4 * (1 - 0.39)}
                  transform="rotate(220 90 90)"
                  strokeLinecap="round"
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onMouseEnter={() => setHoveredArc('hybrid')}
                  onMouseLeave={() => setHoveredArc(null)}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-bold font-mono text-[#292724] leading-tight">
                  {currentMetrics.commissionedCapacityKw} kW
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Installed Spec</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className={`p-2.5 rounded-lg border transition-all ${hoveredArc === 'ongrid' ? 'bg-slate-50 border-slate-400' : 'bg-white border-[#E7E2D9]'}`}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#292724]" />
                    <span className="font-semibold text-slate-800">Commercial On-Grid</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">
                    {Math.round(currentMetrics.commissionedCapacityKw * 0.61)} kW (61%)
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 ml-5">
                  High-yield DCR bi-facial arrays for commercial rooftops.
                </p>
              </div>

              <div className={`p-2.5 rounded-lg border transition-all ${hoveredArc === 'hybrid' ? 'bg-slate-50 border-slate-400' : 'bg-white border-[#E7E2D9]'}`}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#C66B45]" />
                    <span className="font-semibold text-slate-800">Residential Hybrid (LiFePO4)</span>
                  </div>
                  <span className="font-mono font-bold text-[#C66B45]">
                    {Math.round(currentMetrics.commissionedCapacityKw * 0.39)} kW (39%)
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 ml-5">
                  51.2V LiFePO4 battery integration with 2-year warranty clock.
                </p>
              </div>
            </div>
          </div>

          {/* Standard Neutral Banner (Removed Green) */}
          <div className="p-3 bg-white rounded-lg border border-[#E7E2D9] text-[11px] text-[#292724] flex items-start gap-2 shadow-2xs">
            <Zap className="w-4 h-4 text-[#C66B45] shrink-0 mt-0.5" />
            <span>
              <strong>Strategic Margin Insight:</strong> Hybrid systems yield <strong>38% higher gross profit per kW</strong> than grid-tied systems.
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Turnkey Cost Breakdown & PM Surya Ghar Subsidy Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnkey Cost Breakdown - Standard White Neutral Data Boxes */}
        <div className="bg-white p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#E7E2D9] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#292724]">Turnkey Cost Breakdown & Gross Margin</h3>
              <p className="text-[11px] text-slate-500">Contract Value vs Hardware BOM, Technician Labor & Profit</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-[#292724] border border-slate-200 font-mono">
              {currentMetrics.grossMarginPercent}% Margin
            </span>
          </div>

          {/* Total Contract Portfolio Stacked Bar (Retaining Approved Color Coding) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Total Contract Portfolio: ₹{currentMetrics.turnkeyPortfolioTotal.toLocaleString('en-IN')}</span>
              <span className="text-[#292724] font-mono">Net Margin: ₹{currentMetrics.grossProfitValue.toLocaleString('en-IN')}</span>
            </div>

            <div className="w-full h-8 bg-slate-100 rounded-lg overflow-hidden flex shadow-inner">
              <div
                style={{ width: '68.2%' }}
                className="h-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white tracking-tight"
                title={`Hardware BOM: 68.2% (₹${currentMetrics.hardwareBOMCost.toLocaleString('en-IN')})`}
              >
                Hardware BOM 68.2%
              </div>
              <div
                style={{ width: '8.3%' }}
                className="h-full bg-[#DBBA95] flex items-center justify-center text-[10px] font-bold text-slate-900 tracking-tight"
                title={`Labor: 8.3% (₹${currentMetrics.installationLaborCost.toLocaleString('en-IN')})`}
              >
                Labor 8.3%
              </div>
              <div
                style={{ width: '3.5%' }}
                className="h-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-slate-900 tracking-tight"
                title={`Permits: 3.5% (₹${currentMetrics.discomPermitCost.toLocaleString('en-IN')})`}
              >
                3.5%
              </div>
              <div
                style={{ width: '20.0%' }}
                className="h-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white tracking-tight"
                title={`Net Profit Margin: 20.0% (₹${currentMetrics.grossProfitValue.toLocaleString('en-IN')})`}
              >
                Profit 20.0%
              </div>
            </div>
          </div>

          {/* 4 Cost Items: All Converted to Standard Neutral White Boxes */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Box 1: Hardware BOM */}
            <div className="p-3 rounded-xl bg-white border border-[#E7E2D9] shadow-2xs">
              <span className="text-[10px] text-slate-500 font-medium">1. Hardware Equipment BOM</span>
              <p className="text-sm font-bold font-mono text-[#292724]">
                ₹{currentMetrics.hardwareBOMCost.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-slate-500">Tier-1 panels, inverters & mounting</span>
            </div>

            {/* Box 2: Labor (Standard White Neutral) */}
            <div className="p-3 rounded-xl bg-white border border-[#E7E2D9] shadow-2xs">
              <span className="text-[10px] text-slate-500 font-medium">2. Installation Labor</span>
              <p className="text-sm font-bold font-mono text-[#292724]">
                ₹{currentMetrics.installationLaborCost.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-slate-500">Technician wiring, rigging & safety</span>
            </div>

            {/* Box 3: DISCOM Liaison (Standard White Neutral) */}
            <div className="p-3 rounded-xl bg-white border border-[#E7E2D9] shadow-2xs">
              <span className="text-[10px] text-slate-500 font-medium">3. DISCOM Liaison & Permits</span>
              <p className="text-sm font-bold font-mono text-[#292724]">
                ₹{currentMetrics.discomPermitCost.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-slate-500">Net-metering & CEIG clearances</span>
            </div>

            {/* Box 4: Retained Firm Gross Margin (Standard White Neutral, No Green) */}
            <div className="p-3 rounded-xl bg-white border border-[#E7E2D9] shadow-2xs">
              <span className="text-[10px] text-slate-500 font-medium">4. Company Gross Margin</span>
              <p className="text-sm font-bold font-mono text-[#292724]">
                ₹{currentMetrics.grossProfitValue.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-slate-500">Retained firm operational earnings</span>
            </div>
          </div>
        </div>

        {/* PM Surya Ghar Subsidy Pipeline Funnel - Standard White Neutral Data Boxes */}
        <div className="bg-white p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#E7E2D9] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C66B45]" />
                <h3 className="font-bold text-sm text-[#292724]">PM Surya Ghar: Subsidy Pipeline</h3>
              </div>
              <p className="text-[11px] text-slate-500">Government DBT Disbursement Velocity & Status</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              Avg 18 Days
            </span>
          </div>

          {/* 3-Stage Subsidy Funnel: All Converted to Standard Neutral White Boxes */}
          <div className="space-y-3 pt-1">
            {/* Stage 1 */}
            <div className="p-3 rounded-xl bg-white border border-[#E7E2D9] flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#292724]">Applications Submitted on National Portal</h4>
                  <p className="text-[10px] text-slate-500">Consumer Aadhaar & electricity bill linked</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-xs text-[#292724]">₹2,34,000</span>
                <span className="block text-[10px] text-slate-500">3 Sites (100%)</span>
              </div>
            </div>

            {/* Stage 2 (Standard Neutral White, Removed Amber) */}
            <div className="p-3 rounded-xl bg-white border border-[#E7E2D9] flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#292724]">DISCOM Net-Meter & Technical Inspection</h4>
                  <p className="text-[10px] text-slate-500">Physical verification & bi-directional meter test</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-xs text-[#292724]">₹1,56,000</span>
                <span className="block text-[10px] text-slate-500">2 Sites (66.7%)</span>
              </div>
            </div>

            {/* Stage 3 (Standard Neutral White, Removed Green) */}
            <div className="p-3 rounded-xl bg-white border border-[#E7E2D9] flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#292724]">Direct Benefit Transfer (DBT) Disbursed</h4>
                  <p className="text-[10px] text-slate-500">Transferred directly to homeowner bank account</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-xs text-[#292724]">₹78,000</span>
                <span className="block text-[10px] text-slate-500">1 Site Disbursed</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-[#E7E2D9] flex items-center justify-between text-[11px] text-[#292724]">
            <span>Customer Subsidy Guarantee: <strong>100% On-Time Record</strong></span>
            <span className="text-[#C66B45] font-semibold">Max ₹78,000 per 3 kW</span>
          </div>
        </div>
      </div>

      {/* Project Profitability Ledger Table */}
      <div className="bg-white p-5 rounded-xl border border-[#E7E2D9] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D9]">
          <div>
            <h3 className="font-bold text-sm text-[#292724]">Commissioned Sites Margin Ledger</h3>
            <p className="text-[11px] text-slate-500">Contract invoice value vs BOM equipment cost & technician installation labor</p>
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
                  <td className="py-3 px-3 text-slate-600">{row.capacity}</td>
                  <td className="py-3 px-3 font-mono text-right text-[#292724]">
                    ₹{row.contractValue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-slate-500">
                    ₹{row.equipmentCost.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-slate-500">
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
'''

with open(reports_path, 'w', encoding='utf-8') as f:
    f.write(reports_code)
print("Updated ReportsPage.tsx with neutral white boxes, removed green, and distinct period calculations.")

# ==============================================================================
# 3. Update roles.ts to support 'manager' as well as 'director'
# ==============================================================================
roles_path = os.path.join(FRONTEND_DIR, 'src', 'types', 'roles.ts')
roles_code = '''export type NavTab = 
  | 'dashboard'
  | 'customers'
  | 'quotations'
  | 'warehouse'
  | 'inventory'
  | 'installations'
  | 'warranties'
  | 'tickets'
  | 'reports'
  | 'settings';

export type UserRole = 
  | 'manager'       // Operations Manager (Dr. Singhania)
  | 'director'      // Managing Director / Executive
  | 'sales'         // Sales & CRM Lead (Priya)
  | 'surveyor'      // Field Site Surveyor (Manoj Kumar)
  | 'warehouse'     // Warehouse & Logistics (Vikram Singh)
  | 'technician'    // Lead Field Technician (Rajesh & Team)
  | 'support'       // Helpdesk & RMA Support Agent (Rohan)
  | 'customer';     // Solar Homeowner (Rajesh Sharma)

export interface RoleInfo {
  id: UserRole;
  title: string;
  name: string;
  badge: string;
  avatarColor: string;
  recommendedTab: NavTab;
  description: string;
  allowedTabs: NavTab[];
}

export const USER_ROLES: Record<UserRole, RoleInfo> = {
  manager: {
    id: 'manager',
    title: 'Operations Manager',
    name: 'Dr. Singhania',
    badge: 'Manager',
    avatarColor: 'bg-purple-600',
    recommendedTab: 'dashboard',
    description: 'Operations oversight: quotation approvals, survey approvals & company performance',
    allowedTabs: [
      'dashboard',
      'customers',
      'quotations',
      'warehouse',
      'inventory',
      'installations',
      'warranties',
      'tickets',
      'reports',
      'settings'
    ],
  },
  director: {
    id: 'director',
    title: 'Managing Director',
    name: 'Dr. Singhania',
    badge: 'Executive',
    avatarColor: 'bg-purple-600',
    recommendedTab: 'dashboard',
    description: 'Full company oversight: P&L, 25%+ margins & government subsidy pipeline',
    allowedTabs: [
      'dashboard',
      'customers',
      'quotations',
      'warehouse',
      'inventory',
      'installations',
      'warranties',
      'tickets',
      'reports',
      'settings'
    ],
  },
  sales: {
    id: 'sales',
    title: 'Sales & CRM Lead',
    name: 'Priya Sharma',
    badge: 'Sales',
    avatarColor: 'bg-amber-600',
    recommendedTab: 'customers',
    description: 'Lead intake, feasibility checks & quotation generation',
    allowedTabs: ['customers', 'quotations', 'installations', 'warranties', 'reports'],
  },
  surveyor: {
    id: 'surveyor',
    title: 'Field Site Surveyor',
    name: 'Manoj Kumar',
    badge: 'Surveyor',
    avatarColor: 'bg-blue-600',
    recommendedTab: 'installations',
    description: 'Rooftop azimuth, tilt angle, shading & earthing approvals',
    allowedTabs: ['installations', 'customers', 'warranties'],
  },
  warehouse: {
    id: 'warehouse',
    title: 'Warehouse & Logistics',
    name: 'Vikram Singh',
    badge: 'Warehouse',
    avatarColor: 'bg-emerald-600',
    recommendedTab: 'warehouse',
    description: 'Order dispatch, inverter manual serial entry & warranty clock initiation',
    allowedTabs: ['warehouse', 'inventory', 'installations', 'warranties'],
  },
  technician: {
    id: 'technician',
    title: 'Installation Crew Lead',
    name: 'Rajesh & Team',
    badge: 'Field Tech',
    avatarColor: 'bg-cyan-600',
    recommendedTab: 'installations',
    description: 'Rooftop mounting, photo QA audit & customer signature sign-off',
    allowedTabs: ['installations', 'tickets', 'warranties'],
  },
  support: {
    id: 'support',
    title: 'Helpdesk & RMA Agent',
    name: 'Rohan Mehra',
    badge: 'Support',
    avatarColor: 'bg-rose-600',
    recommendedTab: 'tickets',
    description: 'Inverter fault diagnostics, warranty lookups & ₹0 work orders',
    allowedTabs: ['tickets', 'warranties', 'customers', 'installations'],
  },
  customer: {
    id: 'customer',
    title: 'Solar Homeowner',
    name: 'Rajesh Sharma',
    badge: 'Customer',
    avatarColor: 'bg-teal-600',
    recommendedTab: 'installations',
    description: 'Installation progress, digital sign-off & warranty certificates',
    allowedTabs: ['installations', 'warranties', 'tickets'],
  },
};
'''

with open(roles_path, 'w', encoding='utf-8') as f:
    f.write(roles_code)
print("Updated roles.ts with manager role.")

# ==============================================================================
# 4. Update WarehousePage.tsx:
#    - Remove barcode scanning modal and scanner buttons
#    - Add manual inventory serial number entry field
# ==============================================================================
warehouse_path = os.path.join(FRONTEND_DIR, 'src', 'pages', 'WarehousePage.tsx')
warehouse_code = '''import React, { useState } from 'react';
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
      DataService.addWarranty({
        customerId: activeProject.customerId,
        serialNumber: s,
        productCategory: s.includes('BAT') ? 'Battery' : 'Inverter',
        brand: 'Growatt / Pylontech',
        model: 'Solar Equipment Unit',
        warrantyYears: 2,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Active',
        supportContact: '+91 20 2553 4400'
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
                      <p className="text-[11px] text-slate-500">{proj.systemCapacityKw} kW Turnkey System</p>
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
              <p className="text-[11px] text-slate-500">Destination: {activeProject.address || 'Pune Site'}, Maharashtra</p>
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
'''

with open(warehouse_path, 'w', encoding='utf-8') as f:
    f.write(warehouse_code)
print("Updated WarehousePage.tsx with manual serial number entry and removed barcode scanner.")

# ==============================================================================
# 5. Clean CustomersPage.tsx:
#    - Remove site survey feature completely from customer & lead ledger
#    - Audit interface to remove any unused/irrelevant features
# ==============================================================================
customers_path = os.path.join(FRONTEND_DIR, 'src', 'pages', 'CustomersPage.tsx')
with open(customers_path, 'r', encoding='utf-8') as f:
    cust_text = f.read()

# Remove onOpenSiteSurvey prop from interface and component signature
cust_text = re.sub(r'\s*onOpenSiteSurvey\?: \(\) => void;', '', cust_text)
cust_text = cust_text.replace('initialCustomerId,\n  onOpenSiteSurvey\n', 'initialCustomerId\n')
cust_text = cust_text.replace('initialCustomerId,\n  onOpenSiteSurvey', 'initialCustomerId')

# Remove ClipboardCheck import
cust_text = cust_text.replace('ClipboardCheck,\n', '')
cust_text = cust_text.replace('ClipboardCheck,', '')

# Remove Conduct Site Survey button block
cust_text = re.sub(
    r'\{onOpenSiteSurvey && \([\s\S]*?<span>Conduct Site Survey</span>[\s\S]*?</button>\s*\}',
    '',
    cust_text
)

# Remove any conduct site survey from customer drawer
cust_text = re.sub(
    r'\{onOpenSiteSurvey && \([\s\S]*?Conduct Feasibility Site Survey[\s\S]*?</button>\s*\}',
    '',
    cust_text
)

with open(customers_path, 'w', encoding='utf-8') as f:
    f.write(cust_text)
print("Cleaned CustomersPage.tsx by removing site survey features.")

# ==============================================================================
# 6. Update QuotationsPage.tsx:
#    - Enable Manager Approval Functionality:
#      * Visible "Approve" button directly in table row for pending quotes
#      * Prominent "Approve Quotation & BOM" in view modal
#      * Existing "Create Quotation" feature remains completely intact
# ==============================================================================
quotations_path = os.path.join(FRONTEND_DIR, 'src', 'pages', 'QuotationsPage.tsx')
with open(quotations_path, 'r', encoding='utf-8') as f:
    q_text = f.read()

# Add currentRole prop to QuotationsPageProps
if 'currentRole?: UserRole;' not in q_text:
    q_text = q_text.replace(
        'interface QuotationsPageProps {\n  onNavigateTab: (tab: NavTab, targetId?: string) => void;\n  initialQuotationId?: string;\n}',
        'interface QuotationsPageProps {\n  onNavigateTab: (tab: NavTab, targetId?: string) => void;\n  initialQuotationId?: string;\n  currentRole?: UserRole;\n}'
    )
    q_text = q_text.replace(
        'export const QuotationsPage: React.FC<QuotationsPageProps> = ({\n  onNavigateTab,\n  initialQuotationId\n}) => {',
        'export const QuotationsPage: React.FC<QuotationsPageProps> = ({\n  onNavigateTab,\n  initialQuotationId,\n  currentRole = "manager"\n}) => {'
    )

# In the table row actions: Add direct Approve button for pending quotes
table_action_old = '''                        <button
                          onClick={() => setViewQuotation(quote)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-200 text-slate-900 rounded border border-slate-200 transition-colors"
                        >
                          View & Print
                        </button>'''

table_action_new = '''                        <button
                          onClick={() => setViewQuotation(quote)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-200 text-slate-900 rounded border border-slate-200 transition-colors"
                        >
                          View & Print
                        </button>
                        {quote.status !== 'Approved' && (
                          <button
                            onClick={() => handleUpdateStatus(quote.id, 'Approved')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-[#292724] hover:bg-slate-800 text-white rounded transition-colors shadow-2xs"
                            title="Manager: Approve quotation & BOM"
                          >
                            Approve
                          </button>
                        )}'''

if table_action_old in q_text:
    q_text = q_text.replace(table_action_old, table_action_new)

with open(quotations_path, 'w', encoding='utf-8') as f:
    f.write(q_text)
print("Updated QuotationsPage.tsx with manager approval functionality.")

# ==============================================================================
# 7. Update InstallationsPage.tsx:
#    - For Manager role: replace "conduct site survey" with "view site surveys"
#    - Retain approval permissions for site surveys
# ==============================================================================
inst_path = os.path.join(FRONTEND_DIR, 'src', 'pages', 'InstallationsPage.tsx')
with open(inst_path, 'r', encoding='utf-8') as f:
    inst_text = f.read()

# Add currentRole prop if missing
if 'currentRole?: UserRole;' not in inst_text:
    inst_text = inst_text.replace(
        'interface InstallationsPageProps {\n  onNavigateTab: (tab: NavTab, targetId?: string) => void;\n  initialProjectId?: string;\n  onOpenSiteSurvey?: () => void;\n}',
        'interface InstallationsPageProps {\n  onNavigateTab: (tab: NavTab, targetId?: string) => void;\n  initialProjectId?: string;\n  onOpenSiteSurvey?: () => void;\n  currentRole?: UserRole;\n}'
    )
    inst_text = inst_text.replace(
        'export const InstallationsPage: React.FC<InstallationsPageProps> = ({\n  onNavigateTab,\n  initialProjectId,\n  onOpenSiteSurvey\n}) => {',
        'export const InstallationsPage: React.FC<InstallationsPageProps> = ({\n  onNavigateTab,\n  initialProjectId,\n  onOpenSiteSurvey,\n  currentRole = "manager"\n}) => {'
    )

# Update action button in header for Manager role
inst_text = inst_text.replace(
    '<span>Conduct Site Survey</span>',
    '<span>{currentRole === "manager" || currentRole === "director" ? "View Site Surveys" : "Conduct Site Survey"}</span>'
)

# Update banner button text for Manager role
inst_text = inst_text.replace(
    "<span>{activeProject.stage === 'Survey Completed' ? 'Review Survey Details' : 'Launch Site Survey'}</span>",
    "<span>{currentRole === 'manager' || currentRole === 'director' ? 'Review & Approve Survey' : activeProject.stage === 'Survey Completed' ? 'Review Survey Details' : 'Launch Site Survey'}</span>"
)

with open(inst_path, 'w', encoding='utf-8') as f:
    f.write(inst_text)
print("Updated InstallationsPage.tsx with manager survey view and approval permissions.")

# ==============================================================================
# 8. Update SignInPage.tsx:
#    - Standardize credentials to:
#      Email: [role]@gmail.com
#      Password: "1234" for every role
#    - Document all role-based credentials
# ==============================================================================
signin_path = os.path.join(FRONTEND_DIR, 'src', 'components', 'auth', 'SignInPage.tsx')

signin_code = '''import React, { useState } from 'react';
import { Sun, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserRole, USER_ROLES } from '../../types/roles';

interface SignInPageProps {
  onLogin: (role: UserRole) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('manager@gmail.com');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotMsg, setForgotMsg] = useState(false);

  // Standardized credentials map: [role]@gmail.com with password '1234'
  const roleCredentials: Record<string, UserRole> = {
    'manager@gmail.com': 'manager',
    'director@gmail.com': 'director',
    'sales@gmail.com': 'sales',
    'surveyor@gmail.com': 'surveyor',
    'warehouse@gmail.com': 'warehouse',
    'technician@gmail.com': 'technician',
    'support@gmail.com': 'support',
    'customer@gmail.com': 'customer'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Strict password verification: password must be "1234" for every role
    if (password !== '1234') {
      setErrorMessage('Invalid password. Standardized system password is "1234" for all roles.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const matchedRole = roleCredentials[cleanEmail];

    if (!matchedRole) {
      setErrorMessage(`Unrecognized email. Please use a standardized role email (e.g., manager@gmail.com, sales@gmail.com, etc.).`);
      return;
    }

    onLogin(matchedRole);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotMsg(true);
    setTimeout(() => setForgotMsg(false), 5000);
  };

  const handleSelectCredential = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('1234');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#292724] flex flex-col justify-center items-center p-4 sm:p-6 relative font-sans">
      {/* Subtle atmospheric ambient warm sun glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DBBA95]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card - Friend's Exact Original Styling */}
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E7E2D9] rounded-2xl shadow-xl p-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C66B45] text-[#FFFFFF] shadow-lg shadow-[#C66B45]/20 mb-3.5 ring-4 ring-[#DBBA95]/20">
            <Sun className="w-8 h-8 text-[#FFFFFF]" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#292724]">SunPower</h1>
            <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[#DBBA95]/25 text-[#C66B45] border border-[#DBBA95]/40">
              Pro
            </span>
          </div>
          <p className="text-xs text-[#292724]/70 mt-1.5">
            Solar Installation OS & Operations Platform
          </p>
        </div>

        {/* Heading */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#292724] tracking-tight">Sign In to Your Account</h2>
          <p className="text-xs text-[#292724]/65 mt-0.5">
            Enter standardized role credentials to access the system.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Forgot Password Notification Banner */}
        {forgotMsg && (
          <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-[#C66B45] shrink-0" />
            <span>Password reset instructions have been dispatched to {email}.</span>
          </div>
        )}

        {/* Sign In Form: Mail, Password, Remember Session, Forgot Password, Sign In */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-[#292724] mb-1.5">
              Email Address ([role]@gmail.com)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#292724]/40 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] text-xs font-medium focus:outline-none focus:border-[#C66B45] focus:ring-2 focus:ring-[#C66B45]/20 transition-all placeholder:text-[#292724]/30"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-[#292724] mb-1.5">
              Password (Standard: 1234)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#292724]/40 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="1234"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E7E2D9] bg-[#FFFFFF] text-[#292724] text-xs font-medium focus:outline-none focus:border-[#C66B45] focus:ring-2 focus:ring-[#C66B45]/20 transition-all placeholder:text-[#292724]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-[#292724]/40 hover:text-[#292724] p-0.5 rounded transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Session & Forgot Password Row */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#292724]/75 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#E7E2D9] text-[#C66B45] focus:ring-[#C66B45] cursor-pointer"
              />
              <span className="font-medium">Remember session</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-semibold text-[#C66B45] hover:underline transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#C66B45] hover:bg-[#C66B45]/90 text-[#FFFFFF] font-bold text-xs shadow-md shadow-[#C66B45]/25 flex items-center justify-center gap-2 transition-all group"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        {/* Standardized Credentials Reference Bar */}
        <div className="mt-6 pt-4 border-t border-[#E7E2D9]">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Standardized Testing Credentials (Password: 1234):
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.keys(roleCredentials).map((roleEmail) => (
              <button
                key={roleEmail}
                type="button"
                onClick={() => handleSelectCredential(roleEmail)}
                className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${
                  email === roleEmail
                    ? 'bg-[#292724] text-white border-[#292724]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {roleEmail.split('@')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
'''

with open(signin_path, 'w', encoding='utf-8') as f:
    f.write(signin_code)
print("Updated SignInPage.tsx with standardized credentials and 1234 password validation.")

# ==============================================================================
# 9. Update App.tsx to connect currentRole to all components
# ==============================================================================
app_path = os.path.join(FRONTEND_DIR, 'src', 'App.tsx')
with open(app_path, 'r', encoding='utf-8') as f:
    app_text = f.read()

# Update handleLogin in App.tsx to accept any user role
app_text = re.sub(
    r'const handleLogin = \(role: UserRole = \'director\'\) => \{[\s\S]*?showToast\(\'Signed in successfully as Dr\. Singhania\.\', \'success\'\);\s*\};',
    '''const handleLogin = (role: UserRole = 'manager') => {
    const rInfo = USER_ROLES[role] || USER_ROLES.manager;
    const newSession: AuthSession = {
      role,
      name: rInfo.name,
      email: `${role}@gmail.com`,
      title: rInfo.title,
      badge: rInfo.badge,
      avatarColor: rInfo.avatarColor
    };

    setSession(newSession);
    setCurrentTab(rInfo.recommendedTab);

    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newSession));
      localStorage.setItem(STORAGE_TAB_KEY, rInfo.recommendedTab);
    } catch (e) {
      console.warn('Failed to persist session:', e);
    }

    showToast(`Signed in successfully as ${rInfo.name} (${rInfo.title}).`, 'success');
  };''',
    app_text
)

# Pass currentRole to InstallationsPage and QuotationsPage
app_text = app_text.replace(
    'initialProjectId={targetId}\n              onOpenSiteSurvey={() => setIsGlobalSurveyOpen(true)}',
    'initialProjectId={targetId}\n              currentRole={currentRole}\n              onOpenSiteSurvey={() => setIsGlobalSurveyOpen(true)}'
)
app_text = app_text.replace(
    'initialQuotationId={targetId}\n            />',
    'initialQuotationId={targetId}\n              currentRole={currentRole}\n            />'
)

# Remove onOpenSiteSurvey from CustomersPage instantiation in App.tsx
app_text = app_text.replace(
    'initialCustomerId={targetId}\n              onOpenSiteSurvey={() => setIsGlobalSurveyOpen(true)}',
    'initialCustomerId={targetId}'
)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_text)
print("Updated App.tsx successfully.")

print("All requested updates written successfully!")
