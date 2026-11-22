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
  createdAt: string;
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
};

export type CouponPatch = { isActive?: boolean; validTo?: string; maxRedemptions?: number | null };

export const couponKeys = {
  all: ['admin-coupons'] as const,
  list: (f: CouponFilters) => [...couponKeys.all, 'list', f] as const,
};

export function useCoupons(filters: CouponFilters) {
  return useQuery({
    queryKey: couponKeys.list(filters),
    queryFn: ({ signal }) => api.get<Coupon[]>('/admin/coupons', filters, signal),
    placeholderData: keepPreviousData,
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
