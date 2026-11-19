import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatNumber } from './utils';

describe('Utility Functions', () => {
  it('combines class names with tailwind-merge correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
    expect(cn('p-4', 'p-2')).toBe('p-2'); // Tailwid merge overrides p-4 with p-2
  });

  it('formats numbers with comma separators', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(4890000)).toBe('4,890,000');
  });

  it('formats currency in Sudanese Pounds (ج.س)', () => {
    expect(formatCurrency(35000)).toBe('35,000 ج.س');
    expect(formatCurrency(35000, false)).toBe('35,000');
  });
});
