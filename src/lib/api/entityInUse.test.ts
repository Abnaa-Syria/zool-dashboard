import { describe, expect, it } from 'vitest';
import { ApiError } from './client';
import { parseEntityInUse, usageLines } from './entityInUse';
import { errorMessage } from './errors';

const inUse = (details: unknown) => new ApiError({ status: 409, code: 'ENTITY_IN_USE', message: 'in use', details });

describe('parseEntityInUse', () => {
  it('reads entity, numeric usage and alternative', () => {
    const r = parseEntityInUse(inUse({ entity: 'city', usage: { stations: 2, recentSearches: 0, bad: 'x' }, alternative: 'Deactivate' }));
    expect(r).toEqual({ entity: 'city', usage: { stations: 2, recentSearches: 0 }, alternative: 'Deactivate' });
  });

  it('returns null for other errors', () => {
    expect(parseEntityInUse(new ApiError({ status: 409, code: 'CONFLICT', message: 'x' }))).toBeNull();
    expect(parseEntityInUse(new Error('x'))).toBeNull();
  });

  it('tolerates missing details and empty alternative', () => {
    expect(parseEntityInUse(inUse(undefined))).toEqual({ entity: '', usage: {}, alternative: null });
    expect(parseEntityInUse(inUse({ entity: 'content', usage: {}, alternative: '' }))?.alternative).toBeNull();
  });
});

describe('usageLines', () => {
  it('lists only blocking usages in Arabic', () => {
    expect(usageLines({ trips: 12, routes: 0, recentSearches: 5, positions: 1 })).toEqual(['رحلات: 12', 'مواقع GPS مسجّلة: 1']);
  });

  it('formats the wallet balance as money and explains the last manager rule', () => {
    expect(usageLines({ bookings: 0, walletBalanceMinor: 1250000, lastActiveManager: 1 })).toEqual([
      'رصيد متبقٍ في المحفظة: 12,500 ج.س',
      'هذا آخر مدير نشط للشركة — عيّن مديرًا آخر أولًا',
    ]);
  });

  it('falls back to the raw key for unknown usages', () => {
    expect(usageLines({ widgets: 3 })).toEqual(['widgets: 3']);
  });
});

describe('errorMessage', () => {
  it('has Arabic text for the delete conflict codes', () => {
    expect(errorMessage(inUse({}))).toMatch(/لا يمكن حذف/);
    expect(errorMessage(new ApiError({ status: 409, code: 'ACCOUNT_HAS_ACTIVE_BOOKINGS', message: 'x' }))).toMatch(/رحلات قادمة/);
  });
});
