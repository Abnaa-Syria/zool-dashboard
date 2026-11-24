import { describe, expect, it } from 'vitest';
import type { Coupon } from './api';
import { EMPTY_PROMO, promoErrors, promoInput, promoPatch } from './promo';

const coupon = { showInApp: false, promoTitleAr: null, promoSubtitleAr: null, promoImageUrl: null, promoSortOrder: 0 } as Coupon;

describe('coupon promo banner fields (D-PROMO-01)', () => {
  it('sends empty texts as null and the sort order as a number', () => {
    expect(promoInput({ ...EMPTY_PROMO, showInApp: true, title: ' خصم 20% ', sortOrder: '5' })).toEqual({
      showInApp: true,
      promoTitleAr: 'خصم 20%',
      promoSubtitleAr: null,
      promoImageUrl: null,
      promoSortOrder: 5,
    });
  });

  it('patches only what changed', () => {
    expect(promoPatch({ ...EMPTY_PROMO, showInApp: true, title: 'عرض' }, coupon)).toEqual({ showInApp: true, promoTitleAr: 'عرض' });
    expect(promoPatch(EMPTY_PROMO, coupon)).toEqual({});
  });

  it('validates the image link and sort order', () => {
    expect(promoErrors({ ...EMPTY_PROMO, imageUrl: 'not a url' }).imageUrl).toBeDefined();
    expect(promoErrors({ ...EMPTY_PROMO, imageUrl: 'https://cdn.example.com/a.jpg' }).imageUrl).toBeUndefined();
    expect(promoErrors({ ...EMPTY_PROMO, sortOrder: 'x' }).sortOrder).toBeDefined();
  });
});
