import { describe, expect, it } from 'vitest';
import { describeFee, feeInputToValue, feeValueToInput, formatBasisPoints } from './billing';

describe('carrier platform fee helpers', () => {
  it('formats basis points as a percentage', () => {
    expect(formatBasisPoints(500)).toBe('5%');
    expect(formatBasisPoints(250)).toBe('2.5%');
    expect(formatBasisPoints(10_000)).toBe('100%');
  });

  it('describes each fee type', () => {
    expect(describeFee('NONE', 0)).toBe('بدون رسوم');
    expect(describeFee('PERCENT', 750)).toBe('7.5% من قيمة كل تذكرة');
    expect(describeFee('FIXED', 50_000)).toBe('500 ج.س لكل تذكرة');
  });

  it('converts stored values to editable text', () => {
    expect(feeValueToInput('PERCENT', 500)).toBe('5');
    expect(feeValueToInput('PERCENT', 125)).toBe('1.25');
    expect(feeValueToInput('FIXED', 15_050)).toBe('150.5');
    expect(feeValueToInput('NONE', 0)).toBe('');
  });

  it('converts edited text back to basis points / minor units', () => {
    expect(feeInputToValue('PERCENT', '5')).toEqual({ value: 500 });
    expect(feeInputToValue('PERCENT', '2.75')).toEqual({ value: 275 });
    expect(feeInputToValue('FIXED', '150.5')).toEqual({ value: 15_050 });
    expect(feeInputToValue('FIXED', '0.1')).toEqual({ value: 10 });
    expect(feeInputToValue('NONE', 'anything')).toEqual({ value: 0 });
  });

  it('rejects invalid input', () => {
    expect(feeInputToValue('PERCENT', '')).toHaveProperty('error');
    expect(feeInputToValue('PERCENT', '-1')).toHaveProperty('error');
    expect(feeInputToValue('PERCENT', '1.234')).toHaveProperty('error');
    expect(feeInputToValue('PERCENT', '100.01')).toHaveProperty('error');
    expect(feeInputToValue('PERCENT', '100')).toEqual({ value: 10_000 });
    expect(feeInputToValue('FIXED', 'abc')).toHaveProperty('error');
    expect(feeInputToValue('FIXED', '1000001')).toHaveProperty('error');
  });
});
