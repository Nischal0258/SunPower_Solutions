import { SystemType } from '../types';

export interface SubsidyResult {
  capacityKw: number;
  systemType: SystemType;
  grossCost: number;
  centralSubsidy: number; // PM Surya Ghar Muft Bijli Yojana
  stateSubsidy: number;   // State clean energy top-up
  totalSubsidy: number;
  netPayable: number;
  subsidyPercentage: number;
  monthlyGenerationKwh: number;
  monthlySavingsInr: number;
  annualSavingsInr: number;
  paybackYears: number;
  co2OffsetTonsYear: number;
  treesEquivalent: number;
  discomUnitRate: number;
  documentationChecklist: { id: string; title: string; desc: string; mandatory: boolean }[];
}

export function calculateSolarSubsidy(
  capacityKw: number,
  systemType: SystemType,
  state: string = 'Maharashtra'
): SubsidyResult {
  // Benchmark pricing per kW based on current Indian market EPC standards:
  // On-Grid: ~₹62,000 / kW (modules + string inverter + BOS + net-meter liaising)
  // Hybrid: ~₹88,000 / kW (modules + hybrid PCU + 5.12kWh modular LiFePO4 battery)
  // Off-Grid: ~₹98,000 / kW (modules + off-grid inverter + 10.24kWh high-reserve battery + manual changeover)
  let baseRatePerKw = 62000;
  if (systemType === 'Hybrid') baseRatePerKw = 88000;
  if (systemType === 'Off-grid') baseRatePerKw = 98000;

  const grossCost = Math.round(capacityKw * baseRatePerKw);

  // Central Subsidy under PM Surya Ghar: Muft Bijli Yojana (for Residential Grid-Tied / Hybrid):
  // 1 kW: ₹30,000
  // 2 kW: ₹60,000
  // >= 3 kW: ₹78,000 (Maximum central subsidy cap for residential rooftops)
  // Note: Pure Off-grid systems do not qualify for PM Surya Ghar net-metering direct benefit transfer
  let centralSubsidy = 0;
  if (systemType === 'On-grid' || systemType === 'Hybrid') {
    if (capacityKw <= 1) {
      centralSubsidy = 30000;
    } else if (capacityKw <= 2) {
      centralSubsidy = 60000;
    } else {
      centralSubsidy = 78000;
    }
  }

  // State Top-Up Subsidy (e.g., Maharashtra / Gujarat state green fund additional incentive)
  let stateSubsidy = 0;
  if (centralSubsidy > 0) {
    if (state.toLowerCase().includes('maharashtra') || state.toLowerCase().includes('gujarat')) {
      stateSubsidy = Math.min(Math.round(capacityKw * 3000), 12000);
    }
  }

  const totalSubsidy = centralSubsidy + stateSubsidy;
  const netPayable = Math.max(0, grossCost - totalSubsidy);
  const subsidyPercentage = grossCost > 0 ? Math.round((totalSubsidy / grossCost) * 100) : 0;

  // Generation modeling in India: ~4.2 Peak Sun Hours/day -> ~125 kWh (units) per kW per month
  const monthlyGenerationKwh = Math.round(capacityKw * 126);
  const discomUnitRate = 8.5; // Average residential DISCOM slab rate in ₹/unit
  const monthlySavingsInr = Math.round(monthlyGenerationKwh * discomUnitRate);
  const annualSavingsInr = monthlySavingsInr * 12;

  // Payback period in years: Net Investment / Annual Savings
  const paybackYears = annualSavingsInr > 0 
    ? Number((netPayable / annualSavingsInr).toFixed(1)) 
    : 4.0;

  // Environmental offset: 0.82 kg CO2 per kWh of grid electricity replaced
  const co2OffsetTonsYear = Number(((monthlyGenerationKwh * 12 * 0.82) / 1000).toFixed(1));
  const treesEquivalent = Math.round(co2OffsetTonsYear * 16);

  const documentationChecklist = [
    {
      id: 'doc-bill',
      title: 'Latest Electricity DISCOM Bill',
      desc: 'Showing active Consumer Account No. & Sanctioned Load (kW)',
      mandatory: true
    },
    {
      id: 'doc-aadhaar',
      title: 'Aadhaar Card of Property Owner',
      desc: 'Required for National Portal DBT subsidy matching & verification',
      mandatory: true
    },
    {
      id: 'doc-bank',
      title: 'Bank Passbook / Cancelled Cheque',
      desc: 'Aadhaar-seeded bank account where central subsidy is directly credited',
      mandatory: true
    },
    {
      id: 'doc-tax',
      title: 'Property Tax Receipt / Ownership Proof',
      desc: 'Verifies legal ownership of the residential rooftop structure',
      mandatory: true
    }
  ];

  return {
    capacityKw,
    systemType,
    grossCost,
    centralSubsidy,
    stateSubsidy,
    totalSubsidy,
    netPayable,
    subsidyPercentage,
    monthlyGenerationKwh,
    monthlySavingsInr,
    annualSavingsInr,
    paybackYears,
    co2OffsetTonsYear,
    treesEquivalent,
    discomUnitRate,
    documentationChecklist
  };
}
