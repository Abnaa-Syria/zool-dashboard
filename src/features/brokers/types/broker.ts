export type BrokerStatus = 'active' | 'suspended' | 'pending_accreditation';

export interface BrokerClerk {
  id: string; // 'EMP-0419'
  name: string; // 'مروان الكاتب'
  phone: string; // '+249 912 334 455'
  nationalId?: string;
  roleTitle: string; // 'موظف حجز وإصدار'
  permissions: 'booking_only' | 'full_access' | 'supervisor';
  permissionsLabel: string; // 'حجز وإصدار فقط' | 'صلاحيات كاملة' | 'مشرف فرع'
  assignedPosTerminal: string; // 'POS-Terminal #KRT-04'
  status: 'active' | 'suspended';
  totalBookingsThisMonth: number;
  lastActiveAt: string;
}

export interface BrokerPosTerminal {
  id: string; // 'POS-KRT-04'
  serialNumber: string; // 'SN-EPS-9912048'
  model: string; // 'Sunmi V2s Pro'
  ipAddress: string; // '192.168.10.45'
  status: 'online' | 'offline';
  assignedClerkName: string; // 'مروان الكاتب'
  batteryLevelPercent: number; // 92
  lastSyncAt: string; // '24 أكتوبر 2024 — 09:20:11 ص'
}

export interface BrokerCarrierLink {
  carrierId: string; // 'CO-NL-01'
  carrierName: string; // 'شركة النيل للنقل البري'
  carrierCode: string; // 'TC-001'
  commissionRatePercent: number; // 10%
  authorizedCorridors: string[]; // ['الخرطوم ← مروي', 'الخرطوم ← بورتسودان']
  status: 'authorized' | 'paused';
  authorizedSince: string; // '2023-01-15'
  authorizerAdmin: string; // 'أحمد السر'
}

export interface BrokerWalletTransaction {
  id: string; // 'WLT-TXN-449102'
  timestamp: string; // '24 أكتوبر 2024 — 09:20:14 ص'
  type: 'prepaid_topup' | 'booking_debit' | 'refund_credit' | 'commission_payout' | 'adjustment';
  typeLabel: string;
  amount: number; // in SDG
  direction: 'debit' | 'credit';
  balanceAfter: number;
  relatedReference?: string; // e.g. booking ID 'ZL-BR-19482' or receipt 'RCP-BANK-4410'
  executedBy: string; // 'مروان الكاتب' or 'نظام التسويات الآلي'
  notes?: string;
}

export interface BrokerOffice {
  id: string; // 'AG-882'
  code: string; // 'AG-882'
  name: string; // 'وكالة النيل للسفر والسياحة'
  branchName: string; // 'فرع الميناء البري — الخرطوم'
  city: string; // 'الخرطوم'
  state: string; // 'ولاية الخرطوم'
  address: string; // 'الميناء البري، الصالة الجنوبية، مكتب رقم 14'
  phone: string; // '+249 183 998 877'
  email: string; // 'agency@niletravel.sd'
  status: BrokerStatus;
  statusLabel: string; // 'معتمد ونشط' | 'قيد المراجعة' | 'معلق'

  // Licensing & Accreditation
  licenseNumber: string; // 'LIC-TT-2023-882'
  commercialRegistrationNumber: string; // 'CR-449108'
  licenseExpiryDate: string; // '2025-12-31'
  accreditedSince: string; // '2022-04-10'
  accreditationAuthority: string; // 'وزارة السياحة والنقل البري'

  // Financial Wallet Float & Commission
  walletBalance: number; // 84200.0 (SDG)
  minimumBalanceAlertThreshold: number; // 500.0 (SDG)
  isLowBalanceAlert: boolean; // true if balance < threshold
  unsettledAccruedCommissionSdg: number; // 4850.0 (SDG)
  activeSettlementCycle: string; // '#W-44 (2024)'

  // Operational KPIs
  todaySalesSdg: number; // 1,240,500
  todayTicketsCount: number; // 142
  clerksCount: number; // 4
  posCount: number; // 2
  assignedCarriersCount: number; // 6

  // Key Persons
  managerName: string; // 'عمر الفاتح'
  managerPhone: string; // '+249 912 345 678'

  // Collections
  clerks: BrokerClerk[];
  posTerminals: BrokerPosTerminal[];
  carrierLinks: BrokerCarrierLink[];
  walletLedger: BrokerWalletTransaction[];
}

export interface BrokersFilterState {
  searchQuery: string;
  state: string; // 'all' | state name
  status: string; // 'all' | 'active' | 'low_balance' | 'suspended'
  carrierId: string; // 'all' | carrierId
  sortBy: 'name' | 'walletBalance' | 'todaySales' | 'clerksCount';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface BrokersMetrics {
  totalBrokers: number;
  activeBrokers: number;
  todaySalesSdg: number;
  todayTicketsIssued: number;
  lowBalanceCount: number; // Offices with balance < threshold requiring recharge
}
