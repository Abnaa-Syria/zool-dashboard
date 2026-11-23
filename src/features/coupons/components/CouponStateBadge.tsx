import * as React from 'react';
import { Badge } from '../../../components/ui/Badge';
import type { Coupon } from '../api';
import { COUPON_STATE_LABEL, COUPON_STATE_VARIANT, couponState } from '../state';

export const CouponStateBadge: React.FC<{ coupon: Coupon; now: number }> = ({ coupon, now }) => {
  const s = couponState(coupon, now);
  return <Badge variant={COUPON_STATE_VARIANT[s]} dot>{COUPON_STATE_LABEL[s]}</Badge>;
};
