export type RefundStatus =
  | 'pending_review'
  | 'scheduled_settlement'
  | 'approved_refunded'
  | 'rejected'
  | 'disputed';

export type RefundReasonType =
  | 'carrier_fault_breakdown'
  | 'major_delay'
  | 'early_cancellation'
  | 'medium_cancellation'
  | 'critical_cancellation'
  | 'no_show'
  | 'customer_emergency';

export type RefundDecision =
  | 'full_refund'
  | 'partial_refund'
  | 'voucher'
  | 'reject';

export type RefundChannel =
  | 'zoolgo_wallet'
  | 'bankak'
  | 'cash_voucher';

export interface RefundRequest {
  id: string; // e.g. REF-2024-8840
  ticketNumber: string; // e.g. ZL-902144
  bookingId: string; // e.g. BK-77892
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  passengerTier: 'Silver' | 'Gold' | 'VIP';
  completedTripsCount: number;
  carrierId: string;
  carrierName: string;
  tripCode: string; // e.g. VIP-104
  routeText: string; // e.g. الخرطوم (الميناء البري) ⟵ بورتسودان
  originCity: string;
  destinationCity: string;
  seatNumber: string; // e.g. A04
  seatClass: 'VIP' | 'Economy';
  scheduledDeparture: string;
  requestedAt: string;
  requestAgeText: string; // e.g. منذ 18 دقيقة
  ticketFareSdg: number;
  requestedAmountSdg: number;
  approvedRefundSdg: number;
  platformCommissionDeductionSdg: number;
  carrierCompensationDeductionSdg: number;
  status: RefundStatus;
  statusLabel: string;
  reasonType: RefundReasonType;
  reasonTitle: string;
  reasonDescription: string;
  incidentNotes?: string;
  supervisorReport?: {
    supervisorName: string;
    supervisorRole: string;
    terminalName: string;
    reportedAt: string;
    statement: string;
  };
  telemetryEvidence?: {
    vehicleCode: string;
    gpsCoordinates: string;
    technicalIssue: string;
    speedLast4Hours: string;
    delayHours: string;
  };
  affectedAccountsSummary?: {
    debitCarrierSdg: number;
    debitCarrierCode: string;
    debitCarrierName: string;
    debitPlatformSdg: number;
    debitPlatformCode: string;
    creditAgentOrWalletSdg: number;
    creditAccountCode: string;
    creditAccountName: string;
    sha256Seal: string;
  };
  attachments?: {
    name: string;
    sizeText: string;
    type: 'image' | 'sms' | 'pdf';
  }[];
  decision?: RefundDecision;
  justificationNotes?: string;
  destinationChannel: RefundChannel;
  isEmergencyOverride: boolean;
}

export interface CancellationPolicyTier {
  tierId: 'T-1' | 'T-2' | 'T-3' | 'T-4';
  name: string; // إلغاء مبكر, إلغاء متوسط, إلغاء حرج, تخلف عن الحضور
  timeWindow: string; // قبل أكثر من 24 ساعة
  passengerRefundPercent: number; // 100, 85, 50, 0
  cancellationFeePercent: number; // 0, 15, 50, 100
  carrierSharePercent: number;
  platformSharePercent: number;
  isMandatory: boolean;
  canEditByAdmin: boolean;
  isActive: boolean;
}

export interface CarrierFaultPolicyRule {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  isEnabled: boolean;
  gracePeriodMinutes?: number;
  autoReversal: boolean;
  smsNotification: boolean;
  compensationCouponPercent?: number;
}

export interface RefundsQueueMetrics {
  pendingReviewCount: number;
  pendingReviewNotice: string;
  emergencyFundBalanceSdg: number;
  pendingRequestsToday: number;
  processedTodayDiff: string;
  totalRefundedTodaySdg: number;
  autoCancellationRatePercent: number;
  manualOverrideCount: number;
}
