import { describe, expect, it } from 'vitest';
import { daysInRange, presetRange, validateRange } from './range';

describe('report date ranges', () => {
  const now = new Date('2026-11-21T10:00:00Z');

  it('builds presets in Sudan days', () => {
    expect(presetRange('today', now)).toEqual({ from: '2026-11-21', to: '2026-11-21' });
    expect(presetRange('7days', now)).toEqual({ from: '2026-11-15', to: '2026-11-21' });
    expect(presetRange('month', now)).toEqual({ from: '2026-11-01', to: '2026-11-21' });
    expect(daysInRange(presetRange('90days', now))).toBe(90);
  });

  it('enforces order and the 92-day API limit', () => {
    expect(validateRange({ from: '2026-11-21', to: '2026-11-21' })).toBeNull();
    expect(validateRange({ from: '2026-11-22', to: '2026-11-21' })).not.toBeNull();
    expect(validateRange({ from: '2026-08-22', to: '2026-11-21' })).toBeNull(); // 92 days
    expect(validateRange({ from: '2026-08-21', to: '2026-11-21' })).not.toBeNull(); // 93 days
    expect(validateRange({ from: '', to: '2026-11-21' })).not.toBeNull();
  });
});
