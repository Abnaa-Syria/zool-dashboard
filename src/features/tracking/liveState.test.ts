import { describe, expect, it } from 'vitest';
import type { LiveTrip } from './api';
import { formatAge, liveMetrics, matchesQuery, routeLabel, signalState } from './liveState';

const city = (nameAr: string) => ({ id: nameAr, code: nameAr, nameAr, nameEn: nameAr });

function trip(over: Partial<LiveTrip> = {}): LiveTrip {
  return {
    tripId: 't1',
    tripNumber: 'TR-100',
    status: 'IN_PROGRESS',
    carrier: { id: 'c1', name: 'Nile Express' },
    vehicle: { id: 'v1', plateNumber: 'KH 1234', model: 'Yutong' },
    driver: { id: 'd1', displayName: 'Ahmed', driverCode: 'DRV-7' },
    position: { lat: 15.5, lng: 32.5, speedKmh: 80, heading: 10, recordedAt: '2026-11-22T10:00:00Z', ageSeconds: 30 },
    progressPercent: 40,
    remainingKm: 120,
    etaAt: '2026-11-22T13:00:00Z',
    delayMinutes: 0,
    nextStop: null,
    timeline: [
      { kind: 'ORIGIN', station: { id: 's1', nameAr: 'الموقف', nameEn: 'Main', city: city('الخرطوم') }, scheduledAt: null, actualAt: null, passed: true },
      { kind: 'DESTINATION', station: { id: 's2', nameAr: 'الميناء', nameEn: 'Port', city: city('بورتسودان') }, scheduledAt: null, actualAt: null, passed: false },
    ],
    pollSeconds: 15,
    ...over,
  };
}

describe('tracking live state', () => {
  it('classifies GPS freshness', () => {
    expect(signalState(trip())).toBe('fresh');
    expect(signalState(trip({ position: { ...trip().position!, ageSeconds: 121 } }))).toBe('stale');
    expect(signalState(trip({ position: null }))).toBe('none');
  });

  it('counts metrics by status, delay and fix freshness', () => {
    const m = liveMetrics([
      trip(),
      trip({ status: 'BOARDING', position: null }),
      trip({ delayMinutes: 16, position: { ...trip().position!, ageSeconds: 500 } }),
      trip({ delayMinutes: 15 }),
    ]);
    expect(m).toEqual({ total: 4, boarding: 1, inProgress: 3, delayed: 1, withoutFreshFix: 2, onMap: 3 });
  });

  it('formats fix age', () => {
    expect(formatAge(42)).toBe('منذ 42 ث');
    expect(formatAge(185)).toBe('منذ 3 د');
    expect(formatAge(7300)).toBe('منذ 2 س');
  });

  it('searches plate, driver and trip number', () => {
    expect(matchesQuery(trip(), 'kh 12')).toBe(true);
    expect(matchesQuery(trip(), 'drv-7')).toBe(true);
    expect(matchesQuery(trip(), 'tr-100')).toBe(true);
    expect(matchesQuery(trip(), 'zzz')).toBe(false);
  });

  it('labels the route by city', () => {
    expect(routeLabel(trip())).toBe('الخرطوم ← بورتسودان');
  });
});
