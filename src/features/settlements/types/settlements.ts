export type SettlementBatchStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'disbursed';

export type SettlementType = 'carrier_payout' | 'broker_commission' | 'mixed';

export interface CarrierSettlementItem {
  id: string;
  carrierId: string;
  carrierName: string;
  ticketsCount: number;
  grossSalesSdg: number;
  platformCommissionPercent: number;
  platformCommissionSdg: number;
  emergencyFundDeductionSdg: number;
  netPayableSdg: number;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  status: 'pending' | 'ready' | 'transferred';
  paymentReference?: string;
}

export interface BrokerCommissionItem {
  id: string;
  brokerId: string;
  brokerName: string;
  agencyTier: 'A' | 'B';
  ticketsCount: number;
  grossSalesSdg: number;
  commissionRatePercent: number;
  commissionAmountSdg: number;
  payoutPreference: 'wallet_credit' | 'bank_transfer';
  walletBalanceSdg: number;
  status: 'pending' | 'credited_to_wallet' | 'transferred';
  settlementDate?: string;
  paymentReference?: string;
}

export interface SettlementBatch {
  id: string; // e.g. 'STL-2024-W42'
  batchNumber: string;
  title: string;
  type: SettlementType;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  ticketsCount: number;
  totalGrossSdg: number;
  carrierPayoutSdg: number;
  brokerCommissionSdg: number;
  platformFeeSdg: number;
  netDisbursementSdg: number;
  status: SettlementBatchStatus;
  targetBank: string;
  sourceAccount: string;
  approvedBy?: string;
  approvedAt?: string;
  bankReference?: string;
  journalEntryRef?: string;
  notes?: string;
  carrierItems: CarrierSettlementItem[];
  brokerItems: BrokerCommissionItem[];
}

export interface SettlementsMetrics {
  totalPendingSettlementsSdg: number;
  pendingBatchesCount: number;
  totalSettledThisMonthSdg: number;
  reconciliationAccuracyPercent: number;
  totalBrokerCommissionsDueSdg: number;
}
