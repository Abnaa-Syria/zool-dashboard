export type OperationalStatus = 'moving' | 'stopped' | 'delayed' | 'incident' | 'arrived';
export type TripStatus = 'scheduled' | 'boarding' | 'on_route' | 'completed' | 'delayed';
export type GpsConnectionStatus = 'connected' | 'stale' | 'disconnected';
export type SignalQuality = 'excellent' | 'good' | 'fair' | 'weak' | 'lost';
export type CorridorId = 'all' | 'northern' | 'port_sudan' | 'gezira_kassala' | 'western';

export interface RouteStop {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lng]
  scheduledArrival: string;
  actualArrival?: string;
  status: 'completed' | 'current' | 'upcoming';
  stopType: 'terminal' | 'station' | 'rest_stop' | 'checkpoint';
  passengerCountChange: number; // + for boarding, - for alighting
  notes?: string;
}

export interface Vehicle {
  id: string; // e.g. 'ZG-BUS-018'
  plateNumber: string; // e.g. 'خ ر ط - 1234'
  model: string; // e.g. 'تويوتا كوستر VIP'
  year: number;
  carrierId: string;
  carrierName: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
  deviceImei: string; // e.g. 'TELTONIKA-FMB920 #88204'
  simCard: string; // e.g. 'Sudani 4G LTE'
  batteryVoltage: number;
  engineStatus: 'ignition_on' | 'ignition_off' | 'idle';
  licenseDoc: string;
  inspectionExpiry: string;
  acWorking: boolean;
  chassisNumber: string;
}

export interface Trip {
  id: string; // e.g. 'TRIP-983'
  vehicleId: string;
  routeId: string;
  routeName: string; // e.g. 'الخرطوم ← مروي (شريان الشمال)'
  corridorId: CorridorId;
  origin: string; // 'الخرطوم (الميناء البري)'
  destination: string; // 'مروي (الوجهة النهائية)'
  scheduledDeparture: string;
  actualDeparture: string;
  estimatedArrival: string;
  delayMinutes: number;
  totalDistanceKm: number;
  stops: RouteStop[];
  bookedSeats: number;
  boardedPassengers: number;
  waypointPickup: number;
  ticketPriceSdg: number;
}

export interface LiveTelemetry {
  vehicleId: string;
  timestamp: string; // e.g. '14:35:42'
  coordinates: [number, number]; // [lat, lng]
  heading: number; // 0 - 360 degrees
  speed: number; // km/h
  speedLimit: number; // e.g. 100 km/h
  altitude: number; // meters
  roadLabel: string; // e.g. 'طريق شريان الشمال — الكيلو 142'
  operationalStatus: OperationalStatus;
  tripStatus: TripStatus;
  gpsStatus: GpsConnectionStatus;
  signalQuality: SignalQuality;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  routeProgressPercent: number;
  batteryVoltage: number;
  engineOn: boolean;
  lastPingAgeSeconds: number;
}

export interface TelemetryPing {
  id: string;
  vehicleId: string;
  timestamp: string;
  coordinates: [number, number];
  roadLabel: string;
  speed: number;
  operationalStatus: OperationalStatus;
  gpsStatus: GpsConnectionStatus;
  signalQuality: SignalQuality;
  event?: string;
}

export interface TrackingCorridor {
  id: CorridorId;
  name: string;
  nameEnglish: string;
  activeBusesCount: number;
  totalPassengers: number;
  avgSpeed: number;
  description: string;
}

export interface TrackingFiltersState {
  searchQuery: string;
  carrierId: string;
  corridorId: CorridorId;
  operationalStatus: string;
  gpsStatus: string;
}

export interface FleetTrackingMetrics {
  totalMonitored: number;
  activeOnRoute: number;
  stoppedAtStation: number;
  delayed: number;
  operationalAlerts: number;
  gpsDisconnected: number;
  avgFleetSpeed: number;
  totalActivePassengers: number;
}
