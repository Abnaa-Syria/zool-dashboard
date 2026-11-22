import type { LiveTrip } from './api';

/** A trip is "delayed" past this many minutes behind schedule. */
export const DELAY_THRESHOLD_MINUTES = 15;
/** A GPS fix older than this is considered stale (driver app offline / no signal). */
export const STALE_FIX_SECONDS = 120;

export type SignalState = 'fresh' | 'stale' | 'none';

export function signalState(trip: Pick<LiveTrip, 'position'>): SignalState {
  if (!trip.position) return 'none';
  return trip.position.ageSeconds > STALE_FIX_SECONDS ? 'stale' : 'fresh';
}

export function isDelayed(trip: Pick<LiveTrip, 'delayMinutes'>): boolean {
  return trip.delayMinutes > DELAY_THRESHOLD_MINUTES;
}

export type LiveMetrics = { total: number; boarding: number; inProgress: number; delayed: number; withoutFreshFix: number; onMap: number };

export function liveMetrics(trips: Array<Pick<LiveTrip, 'status' | 'delayMinutes' | 'position'>>): LiveMetrics {
  const m: LiveMetrics = { total: trips.length, boarding: 0, inProgress: 0, delayed: 0, withoutFreshFix: 0, onMap: 0 };
  for (const t of trips) {
    if (t.status === 'BOARDING') m.boarding++;
    if (t.status === 'IN_PROGRESS') m.inProgress++;
    if (isDelayed(t)) m.delayed++;
    if (signalState(t) !== 'fresh') m.withoutFreshFix++;
    if (t.position) m.onMap++;
  }
  return m;
}

/** "منذ 45 ث" / "منذ 3 د" / "منذ 2 س" — age of the last GPS fix. */
export function formatAge(seconds: number): string {
  if (seconds < 60) return `منذ ${Math.max(0, Math.round(seconds))} ث`;
  if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} د`;
  if (seconds < 86_400) return `منذ ${Math.floor(seconds / 3600)} س`;
  return `منذ ${Math.floor(seconds / 86_400)} يوم`;
}

/** Case-insensitive match on trip number, carrier, plate, driver name/code and next stop. */
export function matchesQuery(trip: LiveTrip, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [
    trip.tripNumber,
    trip.carrier.name,
    trip.vehicle?.plateNumber,
    trip.driver?.displayName,
    trip.driver?.driverCode,
    trip.nextStop?.nameAr,
    trip.nextStop?.city.nameAr,
  ].some((v) => v?.toLowerCase().includes(needle));
}

/** Origin → destination label from the timeline (Arabic station names). */
export function routeLabel(trip: Pick<LiveTrip, 'timeline'>): string {
  const first = trip.timeline[0]?.station;
  const last = trip.timeline[trip.timeline.length - 1]?.station;
  const name = (s: typeof first) => (s ? s.city.nameAr || s.nameAr : '—');
  return `${name(first)} ← ${name(last)}`;
}

export type MarkerTone = 'moving' | 'boarding' | 'delayed' | 'stale';

/** Marker palette; the legend uses the same colours. */
export const MARKER_COLORS: Record<MarkerTone, { bg: string; border: string; label: string }> = {
  moving: { bg: '#003b27', border: '#226a4b', label: 'في الطريق' },
  boarding: { bg: '#b45309', border: '#f59e0b', label: 'صعود الركاب' },
  delayed: { bg: '#8e1b32', border: '#ba1a1a', label: 'متأخرة أكثر من 15 دقيقة' },
  stale: { bg: '#574142', border: '#8b7172', label: 'إشارة GPS قديمة' },
};

export function markerTone(trip: Pick<LiveTrip, 'status' | 'delayMinutes' | 'position'>): MarkerTone {
  if (signalState(trip) !== 'fresh') return 'stale';
  if (isDelayed(trip)) return 'delayed';
  return trip.status === 'BOARDING' ? 'boarding' : 'moving';
}
