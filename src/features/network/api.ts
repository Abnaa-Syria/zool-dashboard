import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api/client';

// ---------------- DTOs (backend src/modules/network/network.service.ts)

export type CityLite = { id: string; code: string; nameAr: string; nameEn: string };
export type StationLite = { id: string; nameAr: string; nameEn: string; city: CityLite };
export type CompanyLite = { id: string; key: string; name: string };

export type RouteStop = { sequence: number; station: StationLite; offsetMinutes: number; dwellMinutes: number };

/** GET /admin/routes row, GET/POST/PATCH /admin/routes/:id */
export type RouteDto = {
  id: string;
  code: string | null;
  company: CompanyLite;
  originStation: StationLite;
  destinationStation: StationLite;
  durationMinutes: number;
  isActive: boolean;
  stops: RouteStop[];
  createdAt: string;
};

export type StopInput = { stationId: string; offsetMinutes: number; dwellMinutes?: number };

export type CreateRouteInput = {
  companyId: string;
  code?: string;
  originStationId: string;
  destinationStationId: string;
  durationMinutes: number;
  stops?: StopInput[];
};

/** Only these fields are editable after creation (backend `patchRouteSchema`). */
export type PatchRouteInput = Partial<{ durationMinutes: number; isActive: boolean; stops: StopInput[] }>;

export type TripStatus = 'SCHEDULED' | 'BOARDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type SeatStatus = 'FREE' | 'HELD' | 'SOLD';
export type ServiceClass = 'STANDARD' | 'VIP';

export type TripSeat = { seatLabel: string; status: SeatStatus; layoutRow: number | null; layoutColumn: number | null; isWomenOnly: boolean };
export type SeatCounts = { total: number; free: number; held: number; sold: number };

/** GET /admin/trips/:id — structured trip (`toScheduledTripDto`). */
export type ScheduledTrip = {
  id: string;
  tripNumber: string | null;
  status: TripStatus;
  company: CompanyLite;
  route: { id: string; code: string | null } | null;
  origin: string;
  destination: string;
  originStation: StationLite | null;
  destinationStation: StationLite | null;
  departureAt: string;
  arrivalAt: string | null;
  durationMinutes: number | null;
  basePriceMinor: number;
  currency: 'SDG';
  serviceClass: ServiceClass;
  isActive: boolean;
  vehicle: { id: string; plateNumber: string; model: string; capacity: number } | null;
  driver: { id: string; driverCode: string; displayName: string } | null;
  stops: Array<{
    sequence: number;
    station: StationLite;
    scheduledArrivalAt: string | null;
    scheduledDepartureAt: string | null;
    actualArrivalAt: string | null;
  }>;
  seatCounts: SeatCounts;
  seats: TripSeat[];
};

/** GET /catalog/trips row (`toAdminTripDto`): legacy fields + structured trip fields. */
export type CatalogTrip = {
  id: string;
  tripNumber: string | null;
  status: TripStatus;
  serviceClass: 'STANDARD' | 'VIP';
  arrivalAt: string | null;
  route: { id: string; code: string | null } | null;
  vehicle: { id: string; plateNumber: string; model: string } | null;
  driver: { id: string; driverCode: string; displayName: string } | null;
  company: CompanyLite;
  origin: string;
  destination: string;
  departureAt: string;
  basePrice: number;
  isActive: boolean;
  seats: SeatCounts;
  createdAt: string;
};

export type ScheduleTripsInput = {
  routeId: string;
  vehicleId: string;
  driverId?: string;
  departures: string[];
  basePrice: number;
  serviceClass?: ServiceClass;
};

export type CancelTripResult = {
  trip: ScheduledTrip;
  refundedBookings: number;
  refundedAmountMinor: number;
  failed: Array<{ bookingId: string; code: string; message: string }>;
};

/** `details` of VEHICLE_BUSY / DRIVER_BUSY (overlapping trips, max 5). */
export type BusyTrip = { id: string; tripNumber: string | null; departureAt: string; arrivalAt: string | null };

export function busyTrips(error: unknown): BusyTrip[] {
  if (!(error instanceof ApiError) || (error.code !== 'VEHICLE_BUSY' && error.code !== 'DRIVER_BUSY')) return [];
  const details = error.details as { trips?: BusyTrip[] } | undefined;
  return Array.isArray(details?.trips) ? details.trips : [];
}

/** VEHICLE_BUSY raised by two departures of the same request (`details.departure`). */
export function selfBusyDeparture(error: unknown): string | null {
  if (!(error instanceof ApiError) || error.code !== 'VEHICLE_BUSY') return null;
  const details = error.details as { departure?: string } | undefined;
  return typeof details?.departure === 'string' ? details.departure : null;
}

// ---------------- Lookup lists (local; geo/fleet feature folders are owned elsewhere)

export type StationOption = StationLite & { isActive: boolean };
export type VehicleOption = {
  id: string;
  company: CompanyLite;
  plateNumber: string;
  model: string;
  capacity: number;
  serviceClass: ServiceClass;
  status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
  seatLayout?: { rows: number; columns: number; aisleAfterColumn: number; driverSide: 'LEFT' | 'RIGHT' };
};
export type DriverOption = { id: string; company: CompanyLite; driverCode: string; displayName: string; status: 'ACTIVE' | 'SUSPENDED' };

type Query = Record<string, string | number | boolean | undefined>;

/** Follows pagination (pageSize 100) up to `maxPages` — lookup lists are small. */
async function fetchAll<T>(path: string, query: Query, signal?: AbortSignal, maxPages = 10): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const res = await api.get<T[]>(path, { ...query, page, pageSize: 100 }, signal);
    out.push(...res.data);
    if (!res.meta || page >= res.meta.totalPages) break;
  }
  return out;
}

export const networkKeys = {
  all: ['network'] as const,
  routes: (f: RouteFilters) => [...networkKeys.all, 'routes', f] as const,
  allRoutes: (companyId?: string) => [...networkKeys.all, 'routes-all', companyId ?? ''] as const,
  route: (id: string) => [...networkKeys.all, 'route', id] as const,
  trips: (f: TripFilters) => [...networkKeys.all, 'trips', f] as const,
  trip: (id: string) => [...networkKeys.all, 'trip', id] as const,
  stations: () => [...networkKeys.all, 'lookup', 'stations'] as const,
  vehicles: (companyId: string) => [...networkKeys.all, 'lookup', 'vehicles', companyId] as const,
  vehicle: (id: string) => [...networkKeys.all, 'lookup', 'vehicle', id] as const,
  drivers: (companyId: string) => [...networkKeys.all, 'lookup', 'drivers', companyId] as const,
};

/** Active stations (GET /admin/stations, geo.view). */
export function useStationOptions(enabled = true) {
  return useQuery({
    queryKey: networkKeys.stations(),
    queryFn: ({ signal }) => fetchAll<StationOption>('/admin/stations', { isActive: true }, signal),
    staleTime: 5 * 60_000,
    enabled,
  });
}

/** Active vehicles of a carrier (GET /admin/vehicles, fleet.view). */
export function useVehicleOptions(companyId: string | undefined) {
  return useQuery({
    queryKey: networkKeys.vehicles(companyId ?? ''),
    queryFn: ({ signal }) => fetchAll<VehicleOption>('/admin/vehicles', { companyId, status: 'ACTIVE' }, signal),
    enabled: Boolean(companyId),
    staleTime: 60_000,
  });
}

/** One vehicle (for the seat-map aisle position). */
export function useVehicle(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: networkKeys.vehicle(id ?? ''),
    queryFn: ({ signal }) => api.get<VehicleOption>(`/admin/vehicles/${id}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(id) && enabled,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

/** Active drivers of a carrier (GET /admin/drivers, fleet.view). */
export function useDriverOptions(companyId: string | undefined) {
  return useQuery({
    queryKey: networkKeys.drivers(companyId ?? ''),
    queryFn: ({ signal }) => fetchAll<DriverOption>('/admin/drivers', { companyId, status: 'ACTIVE' }, signal),
    enabled: Boolean(companyId),
    staleTime: 60_000,
  });
}

// ---------------- Routes

export type RouteFilters = { page: number; pageSize: number; companyId?: string; stationId?: string; isActive?: 'true' | 'false' };

export function useRoutes(filters: RouteFilters) {
  return useQuery({
    queryKey: networkKeys.routes(filters),
    queryFn: ({ signal }) => api.get<RouteDto[]>('/admin/routes', filters, signal),
    placeholderData: keepPreviousData,
  });
}

/** Active routes (for the scheduling picker). */
export function useActiveRoutes(enabled = true) {
  return useQuery({
    queryKey: networkKeys.allRoutes(),
    queryFn: ({ signal }) => fetchAll<RouteDto>('/admin/routes', { isActive: 'true' }, signal),
    enabled,
  });
}

export function useCreateRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRouteInput) => api.post<RouteDto>('/admin/routes', input).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: networkKeys.all }),
  });
}

export function useUpdateRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; patch: PatchRouteInput }) => api.patch<RouteDto>(`/admin/routes/${input.id}`, input.patch).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: networkKeys.all }),
  });
}

// ---------------- Trips

/** GET /catalog/trips filters (backend `adminTripsQuerySchema`; dates are Sudan days). */
export type TripFilters = {
  page: number;
  pageSize: number;
  companyId?: string;
  origin?: string;
  destination?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: TripStatus;
  routeId?: string;
  vehicleId?: string;
  driverId?: string;
  q?: string;
};

export function useTrips(filters: TripFilters) {
  return useQuery({
    queryKey: networkKeys.trips(filters),
    queryFn: ({ signal }) => api.get<CatalogTrip[]>('/catalog/trips', filters, signal),
    placeholderData: keepPreviousData,
  });
}

const fetchTrip = (id: string, signal?: AbortSignal) => api.get<ScheduledTrip>(`/admin/trips/${id}`, undefined, signal).then((r) => r.data);

export function useTrip(id: string | undefined) {
  return useQuery({ queryKey: networkKeys.trip(id ?? ''), queryFn: ({ signal }) => fetchTrip(id!, signal), enabled: Boolean(id) });
}

export function useScheduleTrips() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ScheduleTripsInput) => api.post<ScheduledTrip[]>('/admin/trips/schedule', input).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: networkKeys.all }),
  });
}

export function useUpdateAssignment(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: { vehicleId?: string; driverId?: string | null }) =>
      api.patch<ScheduledTrip>(`/admin/trips/${tripId}/assignment`, patch).then((r) => r.data),
    onSuccess: (trip) => {
      qc.setQueryData(networkKeys.trip(tripId), trip);
      return qc.invalidateQueries({ queryKey: [...networkKeys.all, 'trips'] });
    },
  });
}

/** D-SUS-01: cancel the trip and refund every confirmed booking in full. */
export function useCancelScheduledTrip(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => api.post<CancelTripResult>(`/admin/trips/${tripId}/cancel`, { reason }).then((r) => r.data),
    onSuccess: (res) => {
      qc.setQueryData(networkKeys.trip(tripId), res.trip);
      return Promise.all([
        qc.invalidateQueries({ queryKey: [...networkKeys.all, 'trips'] }),
        qc.invalidateQueries({ queryKey: ['admin-bookings'] }),
        qc.invalidateQueries({ queryKey: ['carriers'] }),
      ]);
    },
  });
}

// ---------------- Labels

export const TRIP_STATUS_LABEL: Record<TripStatus, string> = {
  SCHEDULED: 'مجدولة',
  BOARDING: 'صعود الركاب',
  IN_PROGRESS: 'في الطريق',
  COMPLETED: 'مكتملة',
  CANCELLED: 'ملغاة',
};

export const TRIP_STATUS_VARIANT: Record<TripStatus, 'info' | 'warning' | 'success' | 'neutral' | 'error'> = {
  SCHEDULED: 'info',
  BOARDING: 'warning',
  IN_PROGRESS: 'success',
  COMPLETED: 'neutral',
  CANCELLED: 'error',
};

export const SERVICE_CLASS_LABEL: Record<ServiceClass, string> = { STANDARD: 'عادية', VIP: 'VIP' };

export function stationLabel(s: StationLite | null | undefined): string {
  return s ? `${s.city.nameAr} — ${s.nameAr}` : '—';
}


