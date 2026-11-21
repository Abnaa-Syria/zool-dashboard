import { describe, expect, it } from 'vitest';
import { formatPeriod, sudanDaysToPeriod } from './period';

describe('settlement periods', () => {
  it('maps inclusive Sudan days to a half-open instant range', () => {
    expect(sudanDaysToPeriod('2026-11-01', '2026-11-30')).toEqual({
      periodFrom: '2026-11-01T00:00:00+02:00',
      periodTo: '2026-12-01T00:00:00+02:00',
    });
  });

  it('round-trips through formatPeriod', () => {
    const p = sudanDaysToPeriod('2026-12-25', '2026-12-31');
    expect(formatPeriod(p.periodFrom, p.periodTo)).toBe('2026-12-25 — 2026-12-31');
    const day = sudanDaysToPeriod('2026-11-21', '2026-11-21');
    expect(formatPeriod(new Date(day.periodFrom).toISOString(), new Date(day.periodTo).toISOString())).toBe('2026-11-21');
  });
});
