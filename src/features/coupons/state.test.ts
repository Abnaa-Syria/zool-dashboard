import { describe, expect, it } from 'vitest';
import { couponState } from './state';

const now = Date.parse('2026-06-15T00:00:00Z');
const base = { isActive: true, validFrom: '2026-06-01T00:00:00Z', validTo: '2026-07-01T00:00:00Z', maxRedemptions: null, redeemedCount: 0 };

describe('couponState', () => {
  it('is live inside the window', () => expect(couponState(base, now)).toBe('LIVE'));
  it('inactive wins over everything', () => expect(couponState({ ...base, isActive: false, validTo: '2026-01-01T00:00:00Z' }, now)).toBe('INACTIVE'));
  it('expired at or after validTo', () => expect(couponState({ ...base, validTo: '2026-06-15T00:00:00Z' }, now)).toBe('EXPIRED'));
  it('exhausted when redemptions reach the cap', () => expect(couponState({ ...base, maxRedemptions: 3, redeemedCount: 3 }, now)).toBe('EXHAUSTED'));
  it('scheduled before validFrom', () => expect(couponState({ ...base, validFrom: '2026-06-20T00:00:00Z' }, now)).toBe('SCHEDULED'));
});
