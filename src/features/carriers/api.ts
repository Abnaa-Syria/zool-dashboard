import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api/client';

export type CarrierStatus = 'ACTIVE' | 'SUSPENDED';

/** GET /carriers row (backend carriers.service `toDto`). */
export type CarrierListItem = {
  id: string;
  key: string;
  name: string;
  status: CarrierStatus;
  createdAt: string;
  assignmentCount?: number;
};

/** GET/PATCH /carriers/:companyId (backend `toDetailDto`). */
export type CarrierDetail = {
  id: string;
  key: string;
  name: string;
  status: CarrierStatus;
  shortName: string | null;
  legalName: string | null;
  logoUrl: string | null;
  rating: { average: number; count: number };
  cashEnabled: boolean;
  suspendedAt: string | null;
  assignmentCount: number;
  createdAt: string;
};

/** GET /carriers/:companyId/affected-trips row (D-SUS-01 review list). */
export type AffectedTrip = {
  tripId: string;
  tripNumber: string | null;
  origin: string;
  destination: string;
  departureAt: string;
  status: string;
  confirmedBookings: number;
  ticketCount: number;
  totalAmountMinor: number;
  byChannel: { BROKER: number; DIRECT: number };
};

/** POST /admin/trips/:id/cancel result (trip DTO omitted — not used here). */
export type CancelTripResult = {
  refundedBookings: number;
  refundedAmountMinor: number;
  failed: Array<{ bookingId: string; code: string; message: string }>;
};

export type CarrierFilters = { page?: number; pageSize?: number; q?: string; status?: CarrierStatus };

export type CarrierPatch = Partial<{
  name: string;
  status: CarrierStatus;
  shortName: string | null;
  legalName: string | null;
  logoUrl: string | null;
  cashEnabled: boolean;
}>;

export const carrierKeys = {
  all: ['carriers'] as const,
  list: (f: CarrierFilters) => [...carrierKeys.all, 'list', f] as const,
  detail: (id: string) => [...carrierKeys.all, 'detail', id] as const,
  affected: (id: string, page: number) => [...carrierKeys.all, 'affected-trips', id, page] as const,
};

export function useCarriers(filters: CarrierFilters) {
  return useQuery({
    queryKey: carrierKeys.list(filters),
    queryFn: ({ signal }) => api.get<CarrierListItem[]>('/carriers', filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useCarrier(id: string | undefined) {
  return useQuery({
    queryKey: carrierKeys.detail(id ?? ''),
    queryFn: ({ signal }) => api.get<CarrierDetail>(`/carriers/${id}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useAffectedTrips(id: string | undefined, page: number) {
  return useQuery({
    queryKey: carrierKeys.affected(id ?? '', page),
    queryFn: ({ signal }) => api.get<AffectedTrip[]>(`/carriers/${id}/affected-trips`, { page, pageSize: 20 }, signal),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });
}

export function useCreateCarrier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { key: string; name: string }) => api.post<CarrierListItem>('/carriers', input).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: carrierKeys.all }),
  });
}

export function useUpdateCarrier(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: CarrierPatch) => api.patch<CarrierDetail>(`/carriers/${id}`, patch).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(carrierKeys.detail(id), data);
      return qc.invalidateQueries({ queryKey: carrierKeys.all });
    },
  });
}

/** D-SUS-01: cancel every booking on the trip with a 100% refund (no fee). */
export function useCancelTrip(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { tripId: string; reason: string }) =>
      api.post<CancelTripResult>(`/admin/trips/${input.tripId}/cancel`, { reason: input.reason }).then((r) => r.data),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: [...carrierKeys.all, 'affected-trips', companyId] }),
        qc.invalidateQueries({ queryKey: ['admin-bookings'] }),
      ]),
  });
}

export const CARRIER_STATUS_LABEL: Record<CarrierStatus, string> = {
  ACTIVE: 'نشطة',
  SUSPENDED: 'موقوفة',
};
