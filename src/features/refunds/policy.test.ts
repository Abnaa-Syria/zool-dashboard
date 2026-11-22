import { describe, expect, it } from 'vitest';
import { formatPolicyValue } from './policy';

describe('formatPolicyValue', () => {
  it('formats basis points as a percentage', () => {
    expect(formatPolicyValue({ key: 'refund.customerFeeBasisPoints', type: 'integer', value: 1000 })).toBe('10%');
    expect(formatPolicyValue({ key: 'refund.customerFeeBasisPoints', type: 'integer', value: 250 })).toBe('2.5%');
  });

  it('formats minor-unit money in SDG', () => {
    expect(formatPolicyValue({ key: 'change.feeMinor', type: 'integer', value: 50000 })).toBe('500 ج.س');
  });

  it('formats minutes, counts and booleans', () => {
    expect(formatPolicyValue({ key: 'refund.customerCutoffMinutesBeforeDeparture', type: 'integer', value: 120 })).toBe('120 دقيقة');
    expect(formatPolicyValue({ key: 'change.maxChangesPerBooking', type: 'integer', value: 2 })).toBe('2');
    expect(formatPolicyValue({ key: 'cash.enabled', type: 'boolean', value: false })).toBe('معطّل');
  });
});
