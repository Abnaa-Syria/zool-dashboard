import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api/client';
import type { TripStatus } from '../network/api';

type CityRef = { id: string; code: string; nameAr: string; nameEn: string };

export type TrackingStation = { id: string; nameAr: string; nameEn: string; city: CityRef; lat?: number; lng?: number };

export type TimelineEntry = {
  kind: 'ORIGIN' | 'STOP' | 'DESTINATION';
  stopId?: string;
  station: TrackingStation | null;
  scheduledAt: string | null;
  actualAt: string | null;
  passed: boolean;
};

/** Last GPS fix sent by the driver app (D-GPS-01). `ageSeconds` is computed by the server at response time. */
export type LivePosition = { lat: number; lng: number; speedKmh: number | null; heading: number | null; recordedAt: string; ageSeconds: number };

/** GET /admin/tracking/live item (backend tracking.service `view`). */
export type LiveTrip = {
  tripId: string;
  tripNumber: string | null;
  /** The live board only returns BOARDING / IN_PROGRESS; the trip detail can be any status. */
  status: TripStatus;
  carrier: { id: string; name: string };
  vehicle: { id: string; plateNumber: string; model: string } | null;
  driver: { id: string; displayName: string; driverCode: string } | null;
  position: LivePosition | null;
  progressPercent: number;
  remainingKm: number | null;
  etaAt: string;
  delayMinutes: number;
  nextStop: { kind: TimelineEntry['kind']; nameAr: string; nameEn: string; city: CityRef } | null;
  timeline: TimelineEntry[];
  pollSeconds: number;
};

export type TrailPoint = { lat: number | null; lng: number | null; speedKmh: number | null; recordedAt: string };

/** GET /admin/tracking/trips/:tripId. */
export type TrackedTrip = LiveTrip & { trail: TrailPoint[] };

/** Backend default (API_CONVENTIONS §12: polled, no sockets). */
export const DEFAULT_POLL_SECONDS = 15;

export const trackingKeys = {
  all: ['admin-tracking'] as const,
  live: () => [...trackingKeys.all, 'live'] as const,
  trip: (id: string) => [...trackingKeys.all, 'trip', id] as const,
};

/** Live board, polled every `pollSeconds` (catalog.view). */
export function useLiveTrips() {
  return useQuery({
    queryKey: trackingKeys.live(),
    queryFn: ({ signal }) => api.get<LiveTrip[]>('/admin/tracking/live', undefined, signal).then((r) => r.data),
    refetchInterval: (query) => (query.state.data?.[0]?.pollSeconds ?? DEFAULT_POLL_SECONDS) * 1000,
  });
}

/** One trip with its GPS trail, polled while it is live. */
export function useTrackedTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: trackingKeys.trip(tripId ?? ''),
    queryFn: ({ signal }) => api.get<TrackedTrip>(`/admin/tracking/trips/${tripId}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(tripId),
    refetchInterval: (query) => {
      const t = query.state.data;
      if (!t) return DEFAULT_POLL_SECONDS * 1000;
      return t.status === 'BOARDING' || t.status === 'IN_PROGRESS' ? t.pollSeconds * 1000 : false;
    },
  });
}
