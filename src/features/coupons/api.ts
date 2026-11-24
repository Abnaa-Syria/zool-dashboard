import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api/client';

export type DiscountType = 'PERCENT' | 'FIXED';

/** GET /admin/coupons row (backend coupons.service `toCouponDto`). */
export type Coupon = {
  id: string;
  code: string;
  discountType: DiscountType;
  /** PERCENT: basis points (2500 = 25%); FIXED: minor units. */
  value: number;
  maxDiscountAmountMinor: number | null;
  minSubtotalAmountMinor: number | null;
  /** Null = all carriers. */
  companyId: string | null;
  validFrom: string;
  validTo: string;
  maxRedemptions: number | null;
  perCustomerLimit: number;
  redeemedCount: number;
  isActive: boolean;
  /** D-PROMO-01: shown as a banner on the customer app home while valid. */
  showInApp: boolean;
  promoTitleAr: string | null;
  promoSubtitleAr: string | null;
  promoImageUrl: string | null;
  promoSortOrder: number;
  createdAt: string;
};

export type PromoInput = {
  showInApp: boolean;
  promoTitleAr: string | null;
  promoSubtitleAr: string | null;
  promoImageUrl: string | null;
  promoSortOrder: number;
};

export type CouponFilters = { page?: number; pageSize?: number; q?: string; isActive?: 'true' | 'false' };

export type CreateCouponInput = {
  code: string;
  discountType: DiscountType;
  value: number;
  maxDiscountAmountMinor?: number;
  minSubtotalAmountMinor?: number;
  companyId?: string;
  validFrom: string;
  validTo: string;
  maxRedemptions?: number;
  perCustomerLimit?: number;
} & Partial<PromoInput>;

export type CouponPatch = { isActive?: boolean; validTo?: string; maxRedemptions?: number | null } & Partial<PromoInput>;

export const couponKeys = {
  all: ['admin-coupons'] as const,
  list: (f: CouponFilters) => [...couponKeys.all, 'list', f] as const,
  detail: (id: string) => [...couponKeys.all, 'detail', id] as const,
};

export function useCoupons(filters: CouponFilters) {
  return useQuery({
    queryKey: couponKeys.list(filters),
    queryFn: ({ signal }) => api.get<Coupon[]>('/admin/coupons', filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useCoupon(id: string | undefined) {
  return useQuery({
    queryKey: couponKeys.detail(id ?? ''),
    queryFn: ({ signal }) => api.get<Coupon>(`/admin/coupons/${id}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(id),
  });
}

/** DELETE /admin/coupons/:id — only when never redeemed (409 ENTITY_IN_USE otherwise; deactivate instead). */
export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/admin/coupons/${id}`).then((r) => r.data),
    onSuccess: (_d, id) => {
      qc.removeQueries({ queryKey: couponKeys.detail(id) });
      return qc.invalidateQueries({ queryKey: [...couponKeys.all, 'list'] });
    },
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCouponInput) => api.post<Coupon>('/admin/coupons', input).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: couponKeys.all }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: CouponPatch }) => api.patch<Coupon>(`/admin/coupons/${id}`, patch).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: couponKeys.all }),
  });
}

export const CODE_RE = /^[A-Z0-9_-]{3,32}$/;
