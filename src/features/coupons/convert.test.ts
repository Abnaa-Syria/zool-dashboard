import { describe, expect, it } from 'vitest';
import {
  basisPointsToPercent,
  formatPercent,
  isoToSudanLocal,
  minorToSdg,
  parsePositiveInt,
  parseSdgToMinor,
  percentToBasisPoints,
  sdgToMinor,
  sudanLocalToIso,
} from './convert';

describe('coupon percent ↔ basis points', () => {
  it('converts percent to basis points', () => {
    expect(percentToBasisPoints(25)).toBe(2500);
    expect(percentToBasisPoints(12.5)).toBe(1250);
    expect(percentToBasisPoints(0.01)).toBe(1);
    expect(percentToBasisPoints(100)).toBe(10_000);
    expect(percentToBasisPoints(33.333)).toBe(3333);
  });

  it('converts basis points back to percent', () => {
    expect(basisPointsToPercent(2500)).toBe(25);
    expect(basisPointsToPercent(1250)).toBe(12.5);
    expect(formatPercent(2500)).toBe('25%');
    expect(formatPercent(1250)).toBe('12.5%');
    for (const bp of [1, 99, 2500, 10_000]) expect(percentToBasisPoints(basisPointsToPercent(bp))).toBe(bp);
  });
});

describe('coupon SDG ↔ minor units', () => {
  it('round-trips SDG and minor units', () => {
    expect(sdgToMinor(500)).toBe(50_000);
    expect(sdgToMinor(0.1 + 0.2)).toBe(30);
    expect(minorToSdg(12_550)).toBe(125.5);
  });

  it('parses optional SDG inputs', () => {
    expect(parseSdgToMinor('')).toBeUndefined();
    expect(parseSdgToMinor(' 250 ')).toBe(25_000);
    expect(parseSdgToMinor('19.99')).toBe(1999);
    expect(parseSdgToMinor('0')).toBeNull();
    expect(parseSdgToMinor('0.001')).toBeNull();
    expect(parseSdgToMinor('abc')).toBeNull();
    expect(parseSdgToMinor('-5')).toBeNull();
  });

  it('parses optional positive integers', () => {
    expect(parsePositiveInt('')).toBeUndefined();
    expect(parsePositiveInt('10')).toBe(10);
    expect(parsePositiveInt('1.5')).toBeNull();
    expect(parsePositiveInt('0')).toBeNull();
  });
});

describe('Sudan datetime-local ↔ ISO', () => {
  it('interprets inputs as Sudan time (UTC+2)', () => {
    expect(sudanLocalToIso('2026-12-01T00:00')).toBe('2026-11-30T22:00:00.000Z');
    expect(isoToSudanLocal('2026-11-30T22:00:00.000Z')).toBe('2026-12-01T00:00');
  });
});
