export type BookingSource = 'direct_customer' | 'broker_office';

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'on_route' | 'completed';

export type PaymentStatus = 'paid' | 'pending_verification' | 'refunded' | 'failed';

export type TicketIssuanceStatus = 'issued' | 'pending_issue' | 'issue_failed' | 'cancelled';

export interface Passenger {
  id: string;
  name: string;
  phone: string;
  maskedPhone: string;
  nationalId?: string;
  maskedNationalId?: string;
  seatNumber: string;
  seatClass: 'standard' | 'vip';
  ticketNumber: string;
  isMainPassenger: boolean;
  passengerType: 'adult' | 'child';
}

export interface IssuedTicket {
  ticketNumber: string; // e.g. ZL-TKT-854921-1
  passengerId: string;
  passengerName: string;
  seatNumber: string;
  seatClass: 'standard' | 'vip';
  qrPayload: string;
  verificationUrl: string;
  barcode: string;
  fareAmount: number;
  issueTimestamp: string;
  status: TicketIssuanceStatus;
  statusReason?: string;
  isDemoQr: boolean;
}

export interface BookingActivityEvent {
  id: string;
  timestamp: string;
  actor: string; // e.g. 'المسافر عبر التطبيق', 'عمر الفاتح (وكالة النيل)', 'النظام المركزي'
  actorRole: string;
  eventType:
    | 'booking_created'
    | 'seat_locked'
    | 'payment_received'
    | 'wallet_debited'
    | 'commission_accrued'
    | 'ticket_generated'
    | 'ticket_printed'
    | 'sms_dispatched'
    | 'system_audited'
    | 'cancellation_requested'
    | 'refund_initiated'
    | 'sync_failed';
  title: string;
  description: string;
  resultStatus: 'success' | 'warning' | 'error' | 'info';
  relatedReference?: string;
}

export interface FinancialLedgerEntry {
  id: string;
  referenceNumber: string; // e.g. WLT-TXN-449102, COMM-REC-88210
  timestamp: string;
  type:
    | 'customer_payment'
    | 'broker_wallet_debit'
    | 'accrued_commission'
    | 'commission_reversal'
    | 'platform_fee'
    | 'refund_disbursement'
    | 'settlement_payout';
  typeLabel: string;
  amount: number; // in SDG
  direction: 'debit' | 'credit' | 'accrual';
  accountHead: string; // e.g. 'محفظة الوكيل AG-882', 'إيراد الناقل CO-NL-01'
  status: 'settled' | 'accrued_pending_settlement' | 'pending' | 'cleared';
  notes?: string;
}

export interface BrokerBookingMeta {
  brokerId: string; // e.g. AG-882
  brokerName: string; // e.g. 'وكالة النيل للسفر والسياحة'
  brokerBranch: string; // e.g. 'الخرطوم — الميناء البري'
  clerkId: string; // e.g. EMP-0419
  clerkName: string; // e.g. 'مروان الكاتب' / 'عمر الفاتح'
  posTerminalId: string; // e.g. 'POS-Terminal #KRT-04'
  posIpAddress?: string;
  walletDebitAmount: number; // e.g. 35000 (Exact face value)
  walletTransactionRef: string; // e.g. 'WLT-TXN-449102'
  walletBalanceAfterDebit: number; // e.g. 15150 (Historical balance immediately after transaction)
  walletCurrentBalance: number; // e.g. 84200 (Current real-time balance)
  accruedCommissionAmount: number; // e.g. 3500 (10% separate accrual)
  commissionRatePercent: number; // e.g. 10%
  settlementCycleId: string; // e.g. '#W-44 (2024)'
  deliveryChannels: {
    digitalPdfReady: boolean;
    paperPrinted: boolean;
    printerModel?: string;
    smsDispatched: boolean;
    smsGatewayRef?: string;
  };
}

export interface CustomerBookingMeta {
  customerAccountId?: string;
  registeredName?: string;
  contactEmail?: string;
  contactPhone: string;
  paymentMethod: string; // e.g. 'بنكك (Bankak)', 'سداد إلكتروني (Sadad Pay)'
  paymentTransactionRef: string; // e.g. 'TXN-SADAD-994182'
  paymentTimestamp: string;
  cardOrAccountLast4?: string;
  gatewayStatus: 'settled' | 'pending' | 'failed';
}

export interface Booking {
  id: string; // e.g. 'ZL-854921', 'ZL-BR-19482'
  source: BookingSource;
  sourceLabel: string; // 'مسافر مباشر' | 'مكتب وسيط'
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  ticketStatus: TicketIssuanceStatus;
  createdAt: string; // ISO or formatted '24 أكتوبر 2024 — 08:15:22 ص'
  updatedAt: string;

  // Trip details
  tripId: string; // e.g. 'TRIP-983'
  routeId: string;
  routeName: string; // 'الخرطوم ← مروي'
  originTerminal: string; // 'ميناء الخرطوم البري — رصيف 4'
  destinationTerminal: string; // 'صالة مروي المركزية'
  departureDate: string; // '2024-10-24'
  departureTime: string; // '08:30 ص'
  estimatedArrivalTime: string; // '02:30 م'
  travelDurationHours: string; // '5 ساعات و 30 دقيقة'
  carrierId: string; // 'CO-NL-01'
  carrierName: string; // 'شركة النيل للنقل البري'
  carrierServiceClass: string; // 'VIP Express'
  vehicleId?: string; // 'ZG-BUS-018' (undefined if not assigned yet)
  vehiclePlate?: string; // 'خ ر ط - 1234'
  vehicleModel?: string; // 'تويوتا كوستر VIP'

  // Financial figures (SDG)
  baseTicketFare: number;
  serviceFee: number;
  discountAmount: number;
  totalAmount: number; // Base * passengers - discount + fees

  // Passengers & Tickets
  mainPassengerName: string;
  mainPassengerPhone: string;
  passengerCount: number;
  passengers: Passenger[];
  tickets: IssuedTicket[];

  // Source-specific metadata
  customerMeta?: CustomerBookingMeta;
  brokerMeta?: BrokerBookingMeta;

  // Activity & Ledger
  activityLog: BookingActivityEvent[];
  ledgerEntries: FinancialLedgerEntry[];

  // Alerts
  operationalAlert?: {
    severity: 'error' | 'warning' | 'info';
    title: string;
    description: string;
    actionRequired?: string;
  };
}
