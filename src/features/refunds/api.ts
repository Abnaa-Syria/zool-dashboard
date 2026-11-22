import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, api, type PageMeta } from '../../lib/api/client';
import { errorMessage } from '../../lib/api/errors';
import type { AdminBooking } from '../bookings/api';

export type RefundStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED';
export type RefundReason = 'CUSTOMER_CANCEL' | 'CARRIER_CANCEL' | 'CHANGE_DIFFERENCE' | 'ADMIN';

/** GET /admin/refunds row (backend refunds.routes `toDto`): direct-customer refunds to the original payment method (D-REF-02). */
export type AdminRefund = {
  id: string;
  amountMinor: number;
  status: RefundStatus;
  reason: RefundReason;
  /** Provider reference, or `manual:<reference>` when recorded as paid outside the provider. */
  providerRef: string | null;
  createdAt: string;
  processedAt: string | null;
  booking: {
    id: string;
    bookingRef: string | null;
    status: AdminBooking['status'];
    paymentMethod: AdminBooking['paymentMethod'];
    totalAmountMinor: number;
    trip: {
      id: string;
      tripNumber: string | null;
      origin: string;
      destination: string;
      departureAt: string;
      company: { id: string; name: string };
    };
  };
  customer: { id: string; displayName: string | null; phone: string | null } | null;
  /** Minor units (`amount` as stored on the payment intent). */
  payment: { id: string; provider: string; providerRef: string | null; amount: number } | null;
};

export type RefundFilters = { page?: number; pageSize?: number; status?: RefundStatus; reason?: RefundReason; q?: string };

export type RefundsMeta = PageMeta & { pendingCount: number; pendingAmountMinor: number };

export const refundKeys = {
  all: ['admin-refunds'] as const,
  list: (f: RefundFilters) => [...refundKeys.all, 'list', f] as const,
  detail: (id: string) => [...refundKeys.all, 'detail', id] as const,
};

export function useRefunds(filters: RefundFilters) {
  return useQuery({
    queryKey: refundKeys.list(filters),
    queryFn: async ({ signal }): Promise<{ data: AdminRefund[]; meta: RefundsMeta | undefined }> => {
      const r = await api.get<AdminRefund[]>('/admin/refunds', filters, signal);
      return { data: r.data, meta: r.meta as RefundsMeta | undefined };
    },
    placeholderData: keepPreviousData,
  });
}

export function useRefund(id: string | undefined) {
  return useQuery({
    queryKey: refundKeys.detail(id ?? ''),
    queryFn: ({ signal }) => api.get<AdminRefund>(`/admin/refunds/${id}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(id),
  });
}

function useRefundAction<V>(fn: (vars: V) => Promise<AdminRefund>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      qc.setQueryData(refundKeys.detail(data.id), data);
      return qc.invalidateQueries({ queryKey: [...refundKeys.all, 'list'] });
    },
  });
}

/** Re-sends a pending/failed refund to the payment provider (bookings.cancel). */
export function useRetryRefund() {
  return useRefundAction((id: string) => api.post<AdminRefund>(`/admin/refunds/${id}/retry`).then((r) => r.data));
}

/** Records a refund paid outside the provider (bank transfer, cash) with its reference (bookings.cancel). */
export function useMarkRefundPaid() {
  return useRefundAction(({ id, reference, note }: { id: string; reference: string; note?: string }) =>
    api.post<AdminRefund>(`/admin/refunds/${id}/mark-paid`, { reference, ...(note ? { note } : {}) }).then((r) => r.data),
  );
}

/** Both actions answer 409 CONFLICT once the refund is already SUCCEEDED. */
export function refundErrorMessage(error: unknown, fallback?: string): string {
  if (error instanceof ApiError && error.code === 'CONFLICT') return 'تم إكمال هذا الاسترداد مسبقًا؛ حدّث الصفحة لعرض حالته الحالية.';
  return errorMessage(error, fallback);
}

export const REFUND_STATUS_LABEL: Record<RefundStatus, string> = {
  PENDING: 'قيد التنفيذ',
  SUCCEEDED: 'مكتمل',
  FAILED: 'فشل',
};

export const REFUND_STATUS_VARIANT: Record<RefundStatus, 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  SUCCEEDED: 'success',
  FAILED: 'error',
};

export const REFUND_REASON_LABEL: Record<RefundReason, string> = {
  CUSTOMER_CANCEL: 'إلغاء من العميل',
  CARRIER_CANCEL: 'إلغاء الرحلة من الناقل',
  CHANGE_DIFFERENCE: 'فرق تعديل الرحلة',
  ADMIN: 'إجراء إداري',
};

export const MANUAL_REF_PREFIX = 'manual:';
