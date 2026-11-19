export type WalletStatus = 'safe' | 'critical' | 'halted';
export type AgencyTier = 'A' | 'B';
export type TransactionType =
  | 'ticket_debit'
  | 'wallet_topup'
  | 'commission_credit'
  | 'refund_reversal'
  | 'settlement_payout';

export type PaymentChannel =
  | 'bankak'
  | 'sadad'
  | 'fauwr'
  | 'cash_deposit'
  | 'prepaid_wallet';

export type LedgerEntryStatus = 'reconciled' | 'pending' | 'flagged';

export interface BrokerWalletSummary {
  brokerId: string; // e.g. AG-882
  brokerName: string;
  bankAccountRef: string;
  city: string;
  locationArea: string;
  state: string;
  currentBalanceSdg: number;
  creditLimitSdg: number;
  status: WalletStatus;
  dailyAvgSpendSdg: number;
  todayTicketsCount: number;
  todaySpendSdg: number;
  lastTopUpDate: string;
  lastTopUpAmountSdg: number;
  agencyTier: AgencyTier;
  insuranceDepositSdg: number;
}

export interface DoubleEntryLeg {
  accountCode: string;
  accountName: string;
  type: 'debit' | 'credit';
  amountSdg: number;
  description: string;
}

export interface FinancialLedgerEntry {
  id: string; // e.g. WLT-TXN-449102
  timestamp: string;
  dateStr: string;
  timeStr: string;
  type: TransactionType;
  typeLabel: string;
  brokerId?: string;
  brokerName?: string;
  partyDescription: string;
  bookingReference?: string;
  paymentChannel: PaymentChannel;
  paymentChannelLabel: string;
  amountSdg: number; // positive for credit, negative for debit
  postBalanceSdg: number;
  status: LedgerEntryStatus;
  sha256Hash: string;
  doubleEntryLegs: DoubleEntryLeg[];
  executingClerk?: string;
  notes?: string;
}

export interface TopUpRequest {
  id: string; // e.g. REQ-TOP-104
  brokerId: string;
  brokerName: string;
  amountSdg: number;
  channel: PaymentChannel;
  bankReferenceNumber: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  slipImageUrl?: string;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface WalletsLiquidityMetrics {
  totalFloatSdg: number;
  totalWalletsCount: number;
  todayInflowSdg: number;
  todayInflowCount: number;
  todayDeductionsSdg: number;
  todayTicketsIssuedCount: number;
  criticalWalletsCount: number;
  circulatingFloatSdg: number;
  circulatingPercent: number;
  insuranceDepositSdg: number;
  insurancePercent: number;
  reserveCoverageRatio: number; // e.g. 1.8
}

export interface LedgerMetrics {
  todayVolumeSdg: number;
  volumeGrowthPercent: number;
  todayTransactionsCount: number;
  todayTransactionsCapacityPercent: number;
  pendingSettlementsCount: number;
  pendingSettlementsValueSdg: number;
  autoMatchRatePercent: number;
}

export interface WalletsFilterState {
  searchQuery: string;
  status: WalletStatus | 'all';
  agencyTier: AgencyTier | 'all';
  state: string;
  sortBy: 'balance_desc' | 'balance_asc' | 'name' | 'activity';
  page: number;
  pageSize: number;
}

export interface LedgerFilterState {
  searchQuery: string;
  transactionType: TransactionType | 'all';
  targetParty: string;
  dateRange: 'today' | 'yesterday' | 'week' | 'all';
  page: number;
  pageSize: number;
}
