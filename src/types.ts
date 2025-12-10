
// src/types.ts

export type Region = "Export" | "South" | "West" | "North";

export interface ProductDecision {
  name: string;                 // Product 1 / 2 / 3
  majorImprovement: boolean;
  exportPrice: number;          // £
  homePrice: number;            // £
  adTradePress: number;         // £'000
  adPressTV: number;            // £'000
  adMerchandising: number;      // £'000
  assemblyTimeMins: number;
}

export interface SalesAllocation {
  region: Region;
  salespeople: number;
}

export interface GeneralDecisions {
  salesQuarterlySalary: number;   // £00
  assemblyWagePerHour: number;    // £.p
  maintenanceHoursPerMachine: number;
  newMachinesToOrder: number;
  managementBudget: number;       // £'000
  dividendPerShare: number;       // % per £1
  vehiclesToBuy: number;
  infoCompanyActivities: number;  // bool/flag as number (0/1)
  infoMarketShares: number;       // 0/1
  salesCommissionPct: number;
  shiftLevel: number;
  machinesToSell: number;
  creditDaysAllowed: number;
  vehiclesToSell: number;
}

export interface ProductQuantityDecision {
  productName: string;
  exportQty: number;
  southQty: number;
  westQty: number;
  northQty: number;
}

export interface ProductDevelopmentDecision {
  productName: string;
  amount: number; // £'000
}

export interface PersonnelDecisionRow {
  role: "Salespeople" | "Assembly Workers";
  recruit: number;
  dismiss: number;
  train: number;
}

export interface MaterialsOrderDecision {
  units: number;
  supplier: number;
  deliveries: number;
}

export interface DecisionsSection {
  year: number;
  quarter: number;
  products: ProductDecision[];
  salesAllocations: SalesAllocation[];
  general: GeneralDecisions;
  quantities: ProductQuantityDecision[];
  productDevelopment: ProductDevelopmentDecision[];
  personnel: PersonnelDecisionRow[];
  materialsOrder: MaterialsOrderDecision;
}

export interface MachinesAvailability {
  machinesLastQuarter: number;
  machinesNextQuarter: number;
  vehiclesLastQuarter: number;
}

export interface AssemblyWorkersHours {
  totalHoursAvailableLastQuarter: number;
  hoursAbsenteeism: number;
  totalHoursWorkedLastQuarter: number;
  noticeStrikeWeeksNextQuarter: number;
}

export interface MachineHours {
  totalHoursAvailableLastQuarter: number;
  hoursBreakdown: number;
  hoursPlannedMaintenance: number;
  totalHoursWorkedLastQuarter: number;
  avgEfficiencyPct: number;
}

export interface MaterialStock {
  openingStockUnits: number;
  deliveredLastQuarter: number;
  usedLastQuarter: number;
  closingStockEndQuarter: number;
  onOrderNextQuarter: number;
  totalAvailableNextQuarter: number;
}

export interface PersonnelMovementRow {
  role: "Sales" | "Assembly" | "Machinists";
  startLastQuarter: number;
  recruits: number;
  trainees: number;
  dismissals: number;
  leavers: number;
  availableNextQuarter: number;
}

export interface ResourceAvailabilitySection {
  machines: MachinesAvailability;
  assemblyHours: AssemblyWorkersHours;
  machineHours: MachineHours;
  materialStock: MaterialStock;
  personnelMovement: PersonnelMovementRow[];
}

export interface ProductMovementRow {
  productName: string;
  scheduled: number;
  produced: number;
  rejected: number;
  serviced: number;
}

export interface RegionDeliveryRow {
  region: Region;
  product1: number;
  product2: number;
  product3: number;
}

export interface OrderBacklogRow {
  region: Region;
  product1: number;
  product2: number;
  product3: number;
}

export interface WarehouseStockRow {
  region: Region;
  product1: number;
  product2: number;
  product3: number;
}

export interface ProductImprovementsSummary {
  product1: "NONE" | "MINOR" | "MAJOR";
  product2: "NONE" | "MINOR" | "MAJOR";
  product3: "NONE" | "MINOR" | "MAJOR";
}

export interface ProductMovementsSection {
  productQuantities: ProductMovementRow[];
  delivered: RegionDeliveryRow[];
  ordersFrom: RegionDeliveryRow[];
  salesTo: RegionDeliveryRow[];
  orderBacklog: OrderBacklogRow[];
  warehouseStock: WarehouseStockRow[];
  productImprovements: ProductImprovementsSummary;
}

// Accounts

export interface OverheadCostRow {
  label: string;
  amount: number;
}

export interface ProfitAndLoss {
  salesRevenue: number;
  openingStockValue: number;
  materialsPurchased: number;
  assemblyWages: number;
  machinistsWages: number;
  machineRunningCosts: number;
  closingStockValue: number;
  overheads: number;
  depreciation: number;
  taxAssessed: number;
  interestReceived: number;
  interestPaid: number;
  netProfitOrLoss: number;
  dividendPaid: number;
  transferredToReserves: number;
}

export interface BalanceSheetAssets {
  property: number;
  machines: number;
  vehicles: number;
  productStocks: number;
  materialStock: number;
  debtors: number;
  cashInvested: number;
}

export interface BalanceSheetLiabilities {
  taxAssessedAndDue: number;
  creditors: number;
  overdraft: number;
  unsecuredLoans: number;
}

export interface BalanceSheetSection {
  assets: BalanceSheetAssets;
  liabilities: BalanceSheetLiabilities;
  netAssets: number;
  ordinaryCapital: number;
  reserves: number;
  totalFunding: number;
}

export interface CashFlowStatementSection {
  tradingReceipts: number;
  tradingPayments: number;
  taxPaid: number;
  interestReceived: number;
  capitalReceipts: number;
  capitalPayments: number;
  interestPaid: number;
  dividendPaid: number;
  netCashFlow: number;
  overdraftLimitNextQuarter: number;
}

export interface AccountsSection {
  overheads: OverheadCostRow[];
  taxableAccumulated: number;
  pnl: ProfitAndLoss;
  balanceSheet: BalanceSheetSection;
  cashFlow: CashFlowStatementSection;
}

// Business intelligence

export interface CompanyBI {
  companyNumber: number;
  sharePricePence: number;
  dividendPaidPct: number;
}

export interface BusinessActivityFreeInfoRow {
  companyNumber: number;
  product1ExportPrice: number;
  product1HomePrice: number;
  product2ExportPrice: number;
  product2HomePrice: number;
  product3ExportPrice: number;
  product3HomePrice: number;
  totalEmployed: number;
  assemblyWageRate: number;
}

export interface BusinessActivityPurchasedInfo {
  totalAdvertising: number;
  productDevelopment: number;
  consumerRatingProduct1: string; // e.g. *** / ***** etc.
  consumerRatingProduct2: string;
  consumerRatingProduct3: string;
}

export interface MarketShareRow {
  companyNumber: number;
  product: 1 | 2 | 3;
  exportArea?: number;
  southArea?: number;
  westArea?: number;
  northArea?: number;
}

export interface EconomicInformation {
  gdpIndex: number;
  unemploymentRatePct: number;
  annualCentralBankRatePct: number;
  materialPriceNextQuarterPerThousand: number;
}

export interface BusinessIntelligenceSection {
  companyBI: CompanyBI[];
  freeInfo: BusinessActivityFreeInfoRow[];
  purchasedInfo: BusinessActivityPurchasedInfo[];
  marketShare: MarketShareRow[] | "NOT REQUESTED";
  economicInfo: EconomicInformation;
}

// Whole quarter

export interface QuarterState {
  group: number;
  company: number;
  year: number;
  quarter: number;
  historyCode: string;
  decisions: DecisionsSection;
  resources: ResourceAvailabilitySection;
  productMovements: ProductMovementsSection;
  accounts: AccountsSection;
  businessIntelligence: BusinessIntelligenceSection;
}
