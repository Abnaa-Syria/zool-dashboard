export type FinancialQuarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface CashFlowWeekPoint {
  week: string; // e.g. W-40, W-41
  weekLabel: string;
  gmvSdg: number; // Volume in SDG
  takeRateSdg: number; // Platform cut
  agentCommissionsSdg: number; // Broker commission
  isPeak?: boolean;
  peakLabel?: string;
}

export interface RouteCorridorPerformance {
  id: string;
  rank: number;
  routeTitle: string;
  routeDescription: string;
  totalVolumeSdg: number;
  passengerCount: number;
  marketSharePercent: number;
}

export interface SalesChannelShare {
  id: string;
  name: string;
  type: 'b2b_brokers' | 'b2c_direct' | 'field_pos';
  amountSdg: number;
  percentage: number;
  color: string;
}

export interface PaymentGatewayShare {
  id: string;
  name: string;
  sharePercent: number;
  reliabilityRate: string;
  type: 'bankak' | 'fawry' | 'sadad';
}

export interface FinancialReportsDashboardMetrics {
  gmvTotalSdg: number;
  gmvGrowthPercent: number;
  totalTicketsIssued: number;
  takeRateNetSdg: number;
  takeRatePercent: number;
  takeRateGrowthPercent: number;
  avgTicketSizeSdg: number;
  avgVipTicketSdg: number;
  avgStandardTicketSdg: number;
  settlementPunctualityPercent: number;
  settlementDisputesCount: number;
  cashFlowWeeks: CashFlowWeekPoint[];
  routeCorridors: RouteCorridorPerformance[];
  salesChannels: SalesChannelShare[];
  paymentGateways: PaymentGatewayShare[];
}

// Trial Balance Data Structures
export interface TrialBalanceAccount {
  accountCode: string; // e.g. 1101, 1205
  accountName: string;
  englishSubtext: string;
  category: 'current_assets' | 'intermediary_liabilities' | 'operational_liabilities' | 'accrued_commissions' | 'operating_revenues' | 'platform_expenses';
  categoryLabel: string;
  openingDebitSdg: number;
  openingCreditSdg: number;
  periodDebitSdg: number;
  periodCreditSdg: number;
  closingDebitSdg: number;
  closingCreditSdg: number;
  status: 'automated_match' | 'ledger_verified' | 'pending_cycle' | 'audited';
  statusLabel: string;
}

export interface TrialBalanceMetrics {
  totalDebitsSdg: number;
  totalCreditsSdg: number;
  varianceSdg: number;
  isBalanced: boolean;
  auditChecksum: string;
  ledgerBlock: string;
  collectionGatewaysSdg: number;
  agentPrepaidFloatSdg: number;
  carrierPayablesSdg: number;
  netCommissionsSdg: number;
  accounts: TrialBalanceAccount[];
}

// Carrier Performance & Shares Data Structures
export interface CarrierPerformanceSummary {
  carrierId: string; // e.g. SAP-8802
  carrierName: string;
  rank: number;
  tier: 'VIP' | 'Standard';
  marketSharePercent: number;
  completedTripsCount: number;
  totalPassengersCount: number;
  occupancyRatePercent: number;
  totalTicketSalesSdg: number;
  platformCommissionSdg: number;
  netPayableSdg: number;
  mostProfitableRoute: string;
  brokerSharePercent: number;
  directAppSharePercent: number;
}

export interface CarrierSharesMetrics {
  totalCarrierSalesSdg: number;
  averageLoadFactorPercent: number;
  totalTripsCompleted: number;
  totalNetPayableSdg: number;
  avgPlatformTakeRatePercent: number;
  totalTakeRateSdg: number;
  carriers: CarrierPerformanceSummary[];
}

// Reports Catalog & Export Structures
export interface ExportableReportItem {
  id: string;
  title: string;
  description: string;
  category: 'periodic_executive' | 'regulatory_compliance';
  updateFrequency: string;
  supportedFormats: ('PDF' | 'Excel' | 'CSV')[];
  icon: string;
  badge?: string;
  badgeVariant?: 'neutral' | 'success' | 'warning' | 'error';
  isMandatoryLegal?: boolean;
}

export interface ExportHistoryRecord {
  id: string;
  reportTitle: string;
  exportedAt: string;
  exportedBy: string;
  format: 'PDF' | 'Excel' | 'CSV';
  fileSizeBytes: number;
  sha256Seal: string;
}
