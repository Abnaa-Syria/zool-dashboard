import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api/client';
import { sudanDaysToPeriod } from './period';

export type SettlementStatus = 'DRAFT' | 'FINALIZED' | 'CANCELLED';
export type AccrualStatus = 'UNSETTLED' | 'RESERVED' | 'SETTLED' | 'CLAWED_BACK';

/** backend commissions.service `toSettlementDto`. Period is [periodFrom, periodTo). */
export type Settlement = {
  id: string;
  officeId: string;
  officeCode: string | null;
  periodFrom: string;
  periodTo: string;
  status: SettlementStatus;
  totalAmountMinor: number;
  initiatedByAdminId: string | null;
  finalizedByAdminId: string | null;
  note: string | null;
  payoutReference: string | null;
  currency: 'SDG';
  accrualCount: number | null;
  finalizedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** GET /admin/commissions row (`toAccrualDto`). */
export type Accrual = {
  id: string;
  bookingId: string;
  officeId: string;
  officeCode: string;
  amountMinor: number;
  status: AccrualStatus;
  settlementId: string | null;
  booking: { tripId: string; totalAmountMinor: number; status: string; employeeId: string | null; confirmedAt: string | null };
  createdAt: string;
  updatedAt: string;
};

/** GET /admin/commissions/settlements/:id/accruals row. */
export type SettlementAccrual = {
  id: string;
  bookingId: string;
  officeCode: string;
  amountMinor: number;
  currency: 'SDG';
  status: AccrualStatus;
  confirmedAt: string | null;
  createdAt: string;
};

export type CommissionSummary = {
  unsettledTotalMinor: number;
  unsettledCount: number;
  reservedTotalMinor: number;
  reservedCount: number;
  settledTotalMinor: number;
  clawedBackTotalMinor: number;
};

export type SettlementFilters = { page?: number; pageSize?: number; officeId?: string; status?: SettlementStatus };
export type AccrualFilters = { page?: number; pageSize?: number; officeId?: string; status?: AccrualStatus };

export const settlementKeys = {
  all: ['commissions'] as const,
  list: (f: SettlementFilters) => ['commissions', 'settlements', f] as const,
  detail: (id: string) => ['commissions', 'settlement', id] as const,
  detailAccruals: (id: string, page: number) => ['commissions', 'settlement', id, 'accruals', page] as const,
  accruals: (f: AccrualFilters) => ['commissions', 'accruals', f] as const,
};

export function useSettlements(filters: SettlementFilters) {
  return useQuery({
    queryKey: settlementKeys.list(filters),
    queryFn: ({ signal }) => api.get<Settlement[]>('/admin/commissions/settlements', filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useSettlement(id: string | undefined) {
  return useQuery({
    queryKey: settlementKeys.detail(id ?? ''),
    queryFn: ({ signal }) => api.get<Settlement>(`/admin/commissions/settlements/${id}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useSettlementAccruals(id: string | undefined, page: number) {
  return useQuery({
    queryKey: settlementKeys.detailAccruals(id ?? '', page),
    queryFn: ({ signal }) => api.get<SettlementAccrual[]>(`/admin/commissions/settlements/${id}/accruals`, { page, pageSize: 20 }, signal),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });
}

export function useAccruals(filters: AccrualFilters) {
  return useQuery({
    queryKey: settlementKeys.accruals(filters),
    queryFn: ({ signal }) => api.get<Accrual[]>('/admin/commissions', filters, signal),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateCommissions() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: settlementKeys.all }),
      qc.invalidateQueries({ queryKey: ['admin-overview'] }),
      qc.invalidateQueries({ queryKey: ['brokers'] }),
    ]);
}

export function useCreateSettlement() {
  const invalidate = useInvalidateCommissions();
  return useMutation({
    mutationFn: (input: { officeId: string; from: string; to: string; note?: string }) =>
      api
        .post<Settlement>('/admin/commissions/settlements', {
          officeId: input.officeId,
          ...sudanDaysToPeriod(input.from, input.to),
          ...(input.note ? { note: input.note } : {}),
        })
        .then((r) => r.data),
    onSuccess: invalidate,
  });
}

export function useFinalizeSettlement() {
  const invalidate = useInvalidateCommissions();
  return useMutation({
    mutationFn: ({ id, payoutReference, note }: { id: string; payoutReference: string; note?: string }) =>
      api.post<Settlement>(`/admin/commissions/settlements/${id}/finalize`, { payoutReference, ...(note ? { note } : {}) }).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export function useCancelSettlement() {
  const invalidate = useInvalidateCommissions();
  return useMutation({
    mutationFn: (id: string) => api.post<Settlement>(`/admin/commissions/settlements/${id}/cancel`).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export const SETTLEMENT_STATUS_LABEL: Record<SettlementStatus, string> = {
  DRAFT: 'مسودة',
  FINALIZED: 'مصروفة',
  CANCELLED: 'ملغاة',
};

export const SETTLEMENT_STATUS_VARIANT: Record<SettlementStatus, 'warning' | 'success' | 'neutral'> = {
  DRAFT: 'warning',
  FINALIZED: 'success',
  CANCELLED: 'neutral',
};

export const ACCRUAL_STATUS_LABEL: Record<AccrualStatus, string> = {
  UNSETTLED: 'غير مسوّاة',
  RESERVED: 'محجوزة في تسوية',
  SETTLED: 'مسوّاة',
  CLAWED_BACK: 'مستردة (إلغاء)',
};

export const ACCRUAL_STATUS_VARIANT: Record<AccrualStatus, 'warning' | 'info' | 'success' | 'error'> = {
  UNSETTLED: 'warning',
  RESERVED: 'info',
  SETTLED: 'success',
  CLAWED_BACK: 'error',
};
