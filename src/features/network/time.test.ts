import { describe, expect, it } from 'vitest';
import { findSelfOverlap, generateDepartures, sudanLocalToIso, validateStops, weekdayOf } from './time';

describe('sudanLocalToIso', () => {
  it('shifts Sudan wall-clock (UTC+2) to UTC', () => {
    expect(sudanLocalToIso('2026-12-01', '06:30')).toBe('2026-12-01T04:30:00.000Z');
    expect(sudanLocalToIso('2026-07-15', '14:00')).toBe('2026-07-15T12:00:00.000Z'); // no DST in summer
  });

  it('crosses to the previous UTC day before 02:00', () => {
    expect(sudanLocalToIso('2026-12-01', '01:15')).toBe('2026-11-30T23:15:00.000Z');
    expect(sudanLocalToIso('2027-01-01', '00:00')).toBe('2026-12-31T22:00:00.000Z');
  });

  it('rejects invalid input', () => {
    expect(sudanLocalToIso('2026-02-30', '06:00')).toBeNull();
    expect(sudanLocalToIso('2026-12-01', '24:00')).toBeNull();
    expect(sudanLocalToIso('2026-12-01', '6:00')).toBeNull();
    expect(sudanLocalToIso('', '06:00')).toBeNull();
  });

  it('weekday of a calendar date', () => {
    expect(weekdayOf('2026-11-21')).toBe(6); // Saturday
    expect(weekdayOf('2026-11-22')).toBe(0);
  });
});

describe('generateDepartures', () => {
  const now = new Date('2026-11-21T10:00:00Z'); // 12:00 Sudan

  it('expands range × times, sorted, in UTC', () => {
    const r = generateDepartures({ from: '2026-12-01', to: '2026-12-03', times: ['18:00', '06:00'], weekdays: [] }, now);
    expect(r.error).toBeNull();
    expect(r.departures).toEqual([
      '2026-12-01T04:00:00.000Z',
      '2026-12-01T16:00:00.000Z',
      '2026-12-02T04:00:00.000Z',
      '2026-12-02T16:00:00.000Z',
      '2026-12-03T04:00:00.000Z',
      '2026-12-03T16:00:00.000Z',
    ]);
  });

  it('filters by Sudan weekday and dedupes times', () => {
    // 2026-11-29 is Sunday … 2026-12-05 Saturday
    const r = generateDepartures({ from: '2026-11-29', to: '2026-12-05', times: ['07:00', '07:00'], weekdays: [0, 3] }, now);
    expect(r.departures).toEqual(['2026-11-29T05:00:00.000Z', '2026-12-02T05:00:00.000Z']);
  });

  it('skips past slots (today before now)', () => {
    const r = generateDepartures({ from: '2026-11-21', to: '2026-11-21', times: ['08:00', '13:00'], weekdays: [] }, now);
    expect(r.skippedPast).toBe(1);
    expect(r.departures).toEqual(['2026-11-21T11:00:00.000Z']);
  });

  it('enforces the 60-departure limit and input errors', () => {
    const big = generateDepartures({ from: '2026-12-01', to: '2027-01-30', times: ['06:00', '18:00'], weekdays: [] }, now);
    expect(big.departures).toHaveLength(122);
    expect(big.error).toMatch(/60/);
    expect(generateDepartures({ from: '2026-12-01', to: '2027-01-29', times: ['06:00'], weekdays: [] }, now).error).toBeNull(); // exactly 60
    expect(generateDepartures({ from: '2026-12-05', to: '2026-12-01', times: ['06:00'], weekdays: [] }, now).error).not.toBeNull();
    expect(generateDepartures({ from: '2026-12-01', to: '2026-12-02', times: [], weekdays: [] }, now).error).not.toBeNull();
    expect(generateDepartures({ from: '2026-11-01', to: '2026-11-20', times: ['06:00'], weekdays: [] }, now).error).not.toBeNull();
  });
});

describe('findSelfOverlap', () => {
  it('detects departures closer than the route duration', () => {
    const d = ['2026-12-01T04:00:00.000Z', '2026-12-01T10:00:00.000Z'];
    expect(findSelfOverlap(d, 360)).toBeNull(); // exactly back-to-back
    expect(findSelfOverlap(d, 361)).toEqual(d);
  });
});

describe('validateStops', () => {
  const ends = { originStationId: 'o', destinationStationId: 'd' };
  it('accepts increasing stops before arrival', () => {
    expect(validateStops([{ stationId: 'a', offsetMinutes: 60, dwellMinutes: 10 }, { stationId: 'b', offsetMinutes: 71, dwellMinutes: '' }], 120, ends)).toEqual([null, null]);
  });
  it('rejects non-increasing, late, endpoint and duplicate stops', () => {
    const errs = validateStops(
      [
        { stationId: 'a', offsetMinutes: 60, dwellMinutes: 10 },
        { stationId: 'b', offsetMinutes: 70, dwellMinutes: 0 }, // must be > 70
        { stationId: 'c', offsetMinutes: 115, dwellMinutes: 5 }, // ends at arrival
        { stationId: 'o', offsetMinutes: 100, dwellMinutes: 0 },
        { stationId: 'a', offsetMinutes: 100, dwellMinutes: 0 },
      ],
      120,
      ends,
    );
    expect(errs.map((e) => e !== null)).toEqual([false, true, true, true, true]);
  });
});
