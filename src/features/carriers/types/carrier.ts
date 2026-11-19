export type CarrierStatus = 'active' | 'under_review' | 'inactive';

export interface CarrierRoute {
  id: string; // e.g. 'RT-001'
  name: string; // e.g. 'الخرطوم ← مروي'
  originCity: string;
  destinationCity: string;
  originTerminal: string;
  destinationTerminal: string;
  distanceKm: number;
  durationFormatted: string; // e.g. '5 ساعات و 30 دقيقة'
  approvedStopsCount: number;
  dailyDeparturesCount: number;
  activeBusesCount: number;
  baseFareSdg: number;
  status: 'active' | 'suspended';
}

export interface CarrierAssignedBroker {
  brokerId: string; // e.g. 'AG-882'
  brokerName: string; // e.g. 'وكالة النيل للسفر والسياحة'
  brokerBranch: string; // e.g. 'الخرطوم — الميناء البري'
  commissionRatePercent: number; // e.g. 10%
  authorizedRoutesCount: number;
  assignedAt: string;
  assignedBy: string; // e.g. 'أحمد السر (المشرف العام)'
  status: 'active' | 'paused';
  totalBookingsThisMonth: number;
  totalGmvThisMonthSdg: number;
}

export interface CommissionChangeRecord {
  id: string;
  brokerId: string;
  brokerName: string;
  previousRatePercent: number;
  newRatePercent: number;
  decisionDate: string;
  decisionReference: string; // e.g. 'DEC-ADM-2024-88'
  authorizerName: string;
  reason: string;
}

export interface CarrierContactPerson {
  name: string;
  role: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface TransportCarrier {
  id: string; // 'CO-NL-01'
  code: string; // 'TC-001'
  name: string; // 'شركة النيل للنقل البري'
  commercialName: string; // 'النيل للنقل البري المحدودة'
  status: CarrierStatus;
  statusLabel: string; // 'نشطة تشغيلياً' | 'قيد المراجعة والتدقيق' | 'معلقة'
  serviceClasses: string[]; // ['VIP Express', 'ستاندرد']
  logoSymbol: string; // 'ن'

  // Licensing & Legal
  commercialRegistrationNumber: string; // 'CR-104928'
  taxIdentificationNumber: string; // 'TIN-994102-SD'
  transportLicenseDoc: string; // 'ترخيص الهيئة القومية للطرق رقم 44102'
  licenseExpiryDate: string; // '2025-11-30'
  headOfficeAddress: string; // 'الخرطوم، تقاطع شارع الستين مع المشتل'
  city: string; // 'الخرطوم'
  state: string; // 'ولاية الخرطوم'
  phone: string; // '+249 183 456 789'
  email: string; // 'operations@niletransit.sd'
  website?: string;

  // Operational metrics
  totalFleetCount: number; // 48
  activeGpsBusesCount: number; // 42
  activeTripsNowCount: number; // 28
  totalRoutesCount: number; // 14
  linkedBrokersCount: number; // 16
  onTimePunctualityPercent: number; // 96.4
  operatingCorridors: string[]; // ['الخرطوم', 'عطبرة', 'مروي', 'بورتسودان']

  // Key Persons
  contacts: CarrierContactPerson[];

  // Linked Domain Collections
  routes: CarrierRoute[];
  assignedBrokers: CarrierAssignedBroker[];
  commissionHistory: CommissionChangeRecord[];
}

export interface CarriersFilterState {
  searchQuery: string;
  status: string; // 'all' | 'active' | 'under_review' | 'inactive'
  state: string; // 'all' | state name
  activeTripsOnly: boolean;
  linkedBrokersOnly: boolean;
  sortBy: 'name' | 'fleetCount' | 'activeTrips' | 'routesCount';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface CarriersMetrics {
  totalCarriers: number;
  activeCarriers: number;
  underReviewCarriers: number;
  totalActiveTripsNow: number;
  gpsConnectedBuses: number;
  totalFleetBuses: number;
}
