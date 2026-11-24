import type { Coupon, PromoInput } from './api';

/** Form state of the customer-app promo banner (D-PROMO-01). */
export type PromoDraft = { showInApp: boolean; title: string; subtitle: string; imageUrl: string; sortOrder: string };

export const EMPTY_PROMO: PromoDraft = { showInApp: false, title: '', subtitle: '', imageUrl: '', sortOrder: '0' };

export const promoDraftOf = (c: Coupon): PromoDraft => ({
  showInApp: c.showInApp,
  title: c.promoTitleAr ?? '',
  subtitle: c.promoSubtitleAr ?? '',
  imageUrl: c.promoImageUrl ?? '',
  sortOrder: String(c.promoSortOrder ?? 0),
});

/** Validation messages (null fields are valid). */
export function promoErrors(p: PromoDraft): { title?: string; imageUrl?: string; sortOrder?: string } {
  const out: { title?: string; imageUrl?: string; sortOrder?: string } = {};
  if (p.showInApp && p.title.trim().length > 0 && p.title.trim().length < 2) out.title = 'حرفان على الأقل';
  if (p.imageUrl.trim() && !/^https?:\/\/\S+$/i.test(p.imageUrl.trim())) out.imageUrl = 'رابط صورة يبدأ بـ https://';
  if (!/^-?\d{1,4}$/.test(p.sortOrder.trim() || '0')) out.sortOrder = 'رقم صحيح';
  return out;
}

/** API body fields; empty texts are sent as null so they can be cleared. */
export function promoInput(p: PromoDraft): PromoInput {
  return {
    showInApp: p.showInApp,
    promoTitleAr: p.title.trim() || null,
    promoSubtitleAr: p.subtitle.trim() || null,
    promoImageUrl: p.imageUrl.trim() || null,
    promoSortOrder: Number(p.sortOrder.trim() || '0'),
  };
}

/** Only the fields that changed compared with the coupon (for PATCH). */
export function promoPatch(p: PromoDraft, c: Coupon): Partial<PromoInput> {
  const next = promoInput(p);
  const out: Partial<PromoInput> = {};
  if (next.showInApp !== c.showInApp) out.showInApp = next.showInApp;
  if (next.promoTitleAr !== (c.promoTitleAr ?? null)) out.promoTitleAr = next.promoTitleAr;
  if (next.promoSubtitleAr !== (c.promoSubtitleAr ?? null)) out.promoSubtitleAr = next.promoSubtitleAr;
  if (next.promoImageUrl !== (c.promoImageUrl ?? null)) out.promoImageUrl = next.promoImageUrl;
  if (next.promoSortOrder !== (c.promoSortOrder ?? 0)) out.promoSortOrder = next.promoSortOrder;
  return out;
}
