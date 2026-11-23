import { describe, expect, it } from 'vitest';
import { routeLabel, type StationLite } from './api';

const st = (city: string): StationLite => ({ id: city, nameAr: `محطة ${city}`, nameEn: city, city: { id: city, code: city, nameAr: city, nameEn: city } });

describe('routeLabel', () => {
  it('prefers the route code', () => {
    expect(routeLabel({ code: 'KRT-PZU', originStation: st('الخرطوم'), destinationStation: st('بورتسودان') })).toBe('KRT-PZU');
  });

  it('falls back to the origin and destination cities', () => {
    expect(routeLabel({ code: null, originStation: st('الخرطوم'), destinationStation: st('بورتسودان') })).toBe('الخرطوم ← بورتسودان');
    expect(routeLabel({ code: '', originStation: st('أ'), destinationStation: st('ب') })).toBe('أ ← ب');
  });
});
