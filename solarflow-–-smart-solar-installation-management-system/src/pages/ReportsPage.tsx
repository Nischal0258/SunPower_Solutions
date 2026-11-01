import React, { useState } from 'react';
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
    DataService.exportFinancialYearDataCSV();
    showToast('SunPower FY 2025-26 financial report exported to CSV successfully.', 'success');
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E7E2D9] bg-white text-[#292724] font-semibold hover:bg-[#F5F3EF] shadow-2xs cursor-pointer"
            title="Download Complete FY 2025-26 CSV Report"
          >
            <Download className="w-3.5 h-3.5 text-[#C66B45]" />
            <span>Download FY Data (CSV)</span>
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
