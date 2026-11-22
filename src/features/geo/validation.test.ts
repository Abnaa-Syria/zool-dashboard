import { describe, expect, it } from 'vitest';
import { AMENITY_CODE_RE, CITY_CODE_RE, isUrl, nameError, parseCoordinates, parseSortOrder } from './validation';

describe('geo validation', () => {
  it('requires coordinates together and in range', () => {
    expect(parseCoordinates('', '')).toEqual({ ok: true, latitude: null, longitude: null });
    expect(parseCoordinates('15.5', '32.53')).toEqual({ ok: true, latitude: 15.5, longitude: 32.53 });
    expect(parseCoordinates('15.5', '').ok).toBe(false);
    expect(parseCoordinates('', '32').ok).toBe(false);
    expect(parseCoordinates('91', '32').ok).toBe(false);
    expect(parseCoordinates('15', '-181').ok).toBe(false);
    expect(parseCoordinates('abc', '32').ok).toBe(false);
  });

  it('parses sort order', () => {
    expect(parseSortOrder('')).toEqual({});
    expect(parseSortOrder('7')).toEqual({ value: 7 });
    expect(parseSortOrder('-1').error).toBeDefined();
    expect(parseSortOrder('10001').error).toBeDefined();
  });

  it('matches backend code formats', () => {
    expect(CITY_CODE_RE.test('KRT')).toBe(true);
    expect(CITY_CODE_RE.test('K')).toBe(false);
    expect(AMENITY_CODE_RE.test('vip_seats')).toBe(true);
    expect(AMENITY_CODE_RE.test('1wifi')).toBe(false);
    expect(AMENITY_CODE_RE.test('Wi-Fi')).toBe(false);
  });

  it('checks names and urls', () => {
    expect(nameError(' a ', 10)).toBeDefined();
    expect(nameError('الخرطوم', 120)).toBeUndefined();
    expect(isUrl('https://x.test/a.png')).toBe(true);
    expect(isUrl('javascript:alert(1)')).toBe(false);
  });
});
