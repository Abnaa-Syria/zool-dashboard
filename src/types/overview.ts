export type BookingChannel = 'direct_customer' | 'broker_office';

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'on_route' | 'completed';

export interface RecentBookingItem {
  id: string; // e.g. ZL-854921, ZL-BR-19482
  passengerName: string;
  carrierName: string;
  carrierId: string;
  route: string;
  tripId: string;
  departureTime: string;
  seatNumber: string;
  amount: number;
  channel: BookingChannel;
  channelLabel: string; // 'مسافر مباشر' | 'مكتب وسيط'
  brokerName?: string;
  brokerId?: string;
  clerkName?: string;
  status: BookingStatus;
  paymentMethod: string; // 'بنكك (Bankak)' | 'خصم من المحفظة'
  walletDebitAmount?: number;
  accumulatedCommission?: number;
  createdAt: string;
}

export interface ImmediateActionItem {
  id: string;
  type: 'bank_transfer' | 'cancellation_request' | 'bus_delay' | 'broker_low_balance';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'info';
  timestamp: string;
  actionText: string;
  linkTo: string;
  entityId?: string;
}

export interface BookingChannelSplit {
  channel: BookingChannel;
  label: string;
  count: number;
  percentage: number;
  volume: number; // In SDG
}

export interface BookingStatusDistribution {
  status: BookingStatus;
  label: string;
  count: number;
  percentage: number;
}

export interface FinancialSummary {
  totalFloat: number; // Total broker wallet balance in platform custody
  totalCommissionUnsettled: number; // Accumulated broker commissions pending manual payout
  pendingBankDeposits: number; // Value of transfers waiting in verification queue
  settledThisCycle: number; // Disbursed payouts
  totalRefundsProcessed: number;
  currency: string; // 'ج.س'
}

export interface OverviewMetrics {
  totalRevenue: number;
  revenueTrend: { value: string; isPositive: boolean };
  totalBookings: number;
  bookingsTrend: { value: string; isPositive: boolean };
  activeFleetCount: number;
  fleetOccupancyRate: number; // percentage e.g. 88
  pendingActionsCount: number;
  financialSummary: FinancialSummary;
  channelSplit: BookingChannelSplit[];
  statusDistribution: BookingStatusDistribution[];
  immediateActions: ImmediateActionItem[];
  recentBookings: RecentBookingItem[];
  lastUpdated: string;
}
