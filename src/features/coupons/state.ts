import type { Coupon } from './api';

export type CouponState = 'INACTIVE' | 'EXPIRED' | 'EXHAUSTED' | 'SCHEDULED' | 'LIVE';

/** Effective state shown to admins: switched off, expired, used up, not started yet, or live. */
export function couponState(c: Pick<Coupon, 'isActive' | 'validFrom' | 'validTo' | 'maxRedemptions' | 'redeemedCount'>, now: number): CouponState {
  if (!c.isActive) return 'INACTIVE';
  if (new Date(c.validTo).getTime() <= now) return 'EXPIRED';
  if (c.maxRedemptions !== null && c.redeemedCount >= c.maxRedemptions) return 'EXHAUSTED';
  if (new Date(c.validFrom).getTime() > now) return 'SCHEDULED';
  return 'LIVE';
}

export const COUPON_STATE_LABEL: Record<CouponState, string> = {
  INACTIVE: 'موقوف',
  EXPIRED: 'منتهي',
  EXHAUSTED: 'استُنفد',
  SCHEDULED: 'مجدول',
  LIVE: 'ساري',
};

export const COUPON_STATE_VARIANT: Record<CouponState, 'neutral' | 'warning' | 'info' | 'success'> = {
  INACTIVE: 'neutral',
  EXPIRED: 'warning',
  EXHAUSTED: 'warning',
  SCHEDULED: 'info',
  LIVE: 'success',
};
