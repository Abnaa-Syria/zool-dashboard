export type TravelerAccountStatus = 'active' | 'suspended' | 'review';
export type TravelerVerificationStatus = 'verified' | 'pending' | 'unregistered' | 'rejected';
export type TravelerDocumentType = 'national_id' | 'passport';
export type LoyaltyTier = 'platinum' | 'gold' | 'silver' | 'regular';

export interface TravelerEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  availableImmediately?: boolean;
}

export interface TravelerCompanion {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  tripsCount: number;
}

export interface TravelerPreference {
  preferredSeat: string;
  preferredClass: string;
  preferredCorridor?: string;
  notificationsEnabled: boolean;
  smsAlertsEnabled: boolean;
}

export interface TravelerAdminNote {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  content: string;
}

export interface Traveler {
  id: string; // e.g. USR-9482
  fullName: string;
  legalFullName: string;
  avatarText: string;
  email: string;
  phone: string;
  nationalId: string;
  maskedNationalId: string;
  documentType: TravelerDocumentType;
  verificationStatus: TravelerVerificationStatus;
  verificationProvider?: string;
  verifiedAt?: string;
  accountStatus: TravelerAccountStatus;
  loyaltyTier: LoyaltyTier;
  mainCity: string;
  residenceArea: string;
  birthDate: string;
  age: number;
  totalTrips: number;
  completedTrips: number;
  activeTrips: number;
  cancelledTrips: number;
  totalSpendSdg: number;
  walletBalanceSdg: number;
  rewardPoints: number;
  attendanceRatePercent: number; // e.g. 98.5
  registrationDate: string;
  lastActivity: {
    timestamp: string;
    description: string;
    bookingReference?: string;
  };
  isOnline: boolean;
  emergencyContact?: TravelerEmergencyContact;
  companions?: TravelerCompanion[];
  preferences?: TravelerPreference;
  notes?: TravelerAdminNote[];
}

export interface TravelerTripItem {
  id: string;
  bookingReference: string; // e.g. ZL-854921
  tripNumber: string; // e.g. TRIP-983
  carrierName: string;
  busId: string; // e.g. ZG-BUS-018
  origin: {
    city: string;
    stationName: string;
    departureTime: string;
  };
  destination: {
    city: string;
    stationName: string;
    arrivalTimeEstimated: string;
  };
  corridorName: string;
  dateStr: string;
  seatNumber: string;
  seatType: string; // e.g. نافذة أمامية
  classType: string; // e.g. VIP Express
  priceSdg: number;
  status: 'active' | 'completed' | 'cancelled';
  progressPercent?: number;
  distanceRemainingKm?: number;
  paymentMethod: string;
  departureTimeText: string;
  arrivalTimeText: string;
  gpsLiveAvailable: boolean;
}

export interface TravelerSecuritySession {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  osInfo: string;
  appVersion: string;
  ipAddress: string;
  isp: string;
  location: string;
  lastActivity: string;
  authKey: string;
  isCurrent: boolean;
}

export interface TravelerSecurityLog {
  id: string;
  timestamp: string;
  eventType: 'login' | 'logout' | 'password_reset' | 'wallet_topup' | 'device_registered' | 'status_change';
  description: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'failed';
}

export interface TravelerKpi {
  totalRegistered: number;
  activeAccounts: number;
  activeAccountsRatePercent: number;
  inTransitToday: number;
  activeTripsCount: number;
  activeStatesCount: number;
  pendingVerificationCount: number;
}

export interface TravelerFilterState {
  searchQuery: string;
  accountStatus: TravelerAccountStatus | 'all';
  verificationStatus: TravelerVerificationStatus | 'all';
  bookingActivity: 'all' | 'on_road' | 'upcoming' | 'inactive';
  mainCity: string;
  page: number;
  pageSize: number;
}
