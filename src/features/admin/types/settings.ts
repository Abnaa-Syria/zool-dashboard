export interface OperationsSettings {
  seatHoldMinutes: number; // e.g. 15
  maxSeatsPerBooking: number; // e.g. 6
  cancellationCutoffHours: number; // e.g. 2
  manifestLockMinutesBeforeDeparture: number; // e.g. 30
  allowOverbookingBuffer: boolean;
  emergencyRoutingMode: boolean;
  emergencyNoticeText: string;
}

export interface FinancialSettings {
  primaryCurrency: string; // 'SDG'
  currencySymbolAr: string; // 'ج.س'
  platformCommissionPercent: number; // e.g. 8.0
  brokerCommissionPercent: number; // e.g. 3.0
  brokerMinWalletThreshold: number; // e.g. 50000 SDG
  sodThresholdAmount: number; // e.g. 1000000 SDG
  autoSettlementCycle: 'weekly' | 'biweekly' | 'monthly';
  defaultDisbursementBank: string; // 'بنك الخرطوم (Bank of Khartoum - بنكك)'
  vatEnabled: boolean;
  vatPercentage: number;
}

export interface NotificationSettings {
  smsProvider: 'zain' | 'mtn' | 'sudani' | 'twilio';
  smsSenderId: string; // 'ZoolGo'
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappProvider: string;
  autoNotifyDelayMinutes: number; // e.g. 30
  brokerLowBalanceAlert: boolean;
  ticketConfirmationViaWhatsapp: boolean;
}

export interface SecuritySettings {
  sessionTimeoutMinutes: number; // e.g. 30
  enforce2FAForAdmins: boolean;
  enforce2FAForFinance: boolean;
  maxLoginAttempts: number; // e.g. 5
  auditRetentionDays: number; // e.g. 365
  ipWhitelistingEnabled: boolean;
}

export interface SystemMaintenanceSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  autoBackupHour: number; // 3 AM
  systemVersion: string;
  environment: 'production' | 'staging';
  lastBackupTimestamp: string;
  databaseStatus: 'healthy' | 'degraded' | 'maintenance';
}

export interface PlatformSettings {
  operations: OperationsSettings;
  financials: FinancialSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  system: SystemMaintenanceSettings;
}
