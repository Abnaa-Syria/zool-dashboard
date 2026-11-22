import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, api } from '../../lib/api/client';
import { errorMessage } from '../../lib/api/errors';
import type { CommissionBearer, PlatformFeeType } from '../carriers/api';

export type CarrierSettlementStatus = 'DRAFT' | 'FINALIZED' | 'PAID' | 'CANCELLED';
export type SettlementDirection = 'PLATFORM_PAYS_CARRIER' | 'CARRIER_PAYS_PLATFORM';
export type SettlementConfig = { feeType: PlatformFeeType; feeValue: number; commissionBearer: CommissionBearer };

/** One trip of the statement (stored on the settlement and returned by the preview). */
export type StatementLine = {
  tripId: string;
  tripNumber: string | null;
  departureAt: string;
  tickets: number;
  onlineMinor: number;
  brokerMinor: number;
  cashMinor: number;
  refundsMinor: number;
  platformDiscountMinor: number;
  platformFeeMinor: number;
  brokerCommissionMinor: number;
};

/** backend carrier-settlements `toSettlementDto`. Period is [periodFrom, periodTo). */
export type CarrierSettlement = {
  id: string;
  company: { id: string; name: string };
  periodFrom: string;
  periodTo: string;
  status: CarrierSettlementStatus;
  config: SettlementConfig;
  ticketsCount: number;
  onlineSalesMinor: number;
  brokerSalesMinor: number;
  cashSalesMinor: number;
  refundsMinor: number;
  platformDiscountMinor: number;
  platformFeeMinor: number;
  brokerCommissionMinor: number;
  netPayableMinor: number;
  direction: SettlementDirection;
  paymentReference: string | null;
  notes: string | null;
  finalizedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  lines?: StatementLine[];
};

/** GET /admin/carrier-settlements/preview — live statement; note the `*Amount` names (minor units). */
export type StatementPreview = {
  periodFrom: string;
  periodTo: string;
  config: SettlementConfig;
  ticketsCount: number;
  onlineSalesAmount: number;
  brokerSalesAmount: number;
  cashSalesAmount: number;
  refundsAmount: number;
  platformDiscountAmount: number;
  platformFeeAmount: number;
  brokerCommissionAmount: number;
  netPayableAmount: number;
  lines: StatementLine[];
};

export type CarrierSettlementFilters = { page?: number; pageSize?: number; companyId?: string; status?: CarrierSettlementStatus };

export const carrierSettlementKeys = {
  all: ['carrier-settlements'] as const,
  list: (f: CarrierSettlementFilters) => ['carrier-settlements', 'list', f] as const,
  detail: (id: string) => ['carrier-settlements', 'detail', id] as const,
  preview: (companyId: string, from: string, to: string) => ['carrier-settlements', 'preview', companyId, from, to] as const,
};

const BASE = '/admin/carrier-settlements';

export function useCarrierSettlements(filters: CarrierSettlementFilters) {
  return useQuery({
    queryKey: carrierSettlementKeys.list(filters),
    queryFn: ({ signal }) => api.get<CarrierSettlement[]>(BASE, filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useCarrierSettlement(id: string | undefined) {
  return useQuery({
    queryKey: carrierSettlementKeys.detail(id ?? ''),
    queryFn: ({ signal }) => api.get<CarrierSettlement>(`${BASE}/${id}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(id),
  });
}

/** Sudan days [from, to] inclusive. Only runs when `enabled` (the admin pressed «معاينة»). */
export function useStatementPreview(input: { companyId: string; from: string; to: string } | null) {
  return useQuery({
    queryKey: carrierSettlementKeys.preview(input?.companyId ?? '', input?.from ?? '', input?.to ?? ''),
    queryFn: ({ signal }) => api.get<StatementPreview>(`${BASE}/preview`, input!, signal).then((r) => r.data),
    enabled: Boolean(input),
    staleTime: 0,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: carrierSettlementKeys.all });
}

export function useCreateCarrierSettlement() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: { companyId: string; fromDate: string; toDate: string; notes?: string }) =>
      api.post<CarrierSettlement>(BASE, input).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export type SettlementAction = 'recalculate' | 'finalize' | 'mark-paid' | 'cancel';

export function useCarrierSettlementAction(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ action, reference }: { action: SettlementAction; reference?: string }) =>
      api.post<CarrierSettlement>(`${BASE}/${id}/${action}`, action === 'mark-paid' ? { reference } : undefined).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(carrierSettlementKeys.detail(id), data);
      return qc.invalidateQueries({ queryKey: carrierSettlementKeys.all });
    },
  });
}

export const CARRIER_SETTLEMENT_STATUS_LABEL: Record<CarrierSettlementStatus, string> = {
  DRAFT: 'مسودة',
  FINALIZED: 'معتمدة (بانتظار الدفع)',
  PAID: 'مدفوعة',
  CANCELLED: 'ملغاة',
};

export const CARRIER_SETTLEMENT_STATUS_VARIANT: Record<CarrierSettlementStatus, 'warning' | 'info' | 'success' | 'neutral'> = {
  DRAFT: 'warning',
  FINALIZED: 'info',
  PAID: 'success',
  CANCELLED: 'neutral',
};

/** SETTLEMENT_OVERLAP: another statement covers the period; SETTLEMENT_STATE_INVALID: wrong status for the action. */
export function carrierSettlementErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === 'SETTLEMENT_STATE_INVALID') {
    const status = (error.details as { status?: CarrierSettlementStatus } | undefined)?.status;
    return `لا يمكن تنفيذ هذا الإجراء على تسوية حالتها «${status ? CARRIER_SETTLEMENT_STATUS_LABEL[status] ?? status : '—'}». حدّث الصفحة.`;
  }
  if (error instanceof ApiError && error.code === 'SETTLEMENT_OVERLAP') {
    return 'توجد تسوية أخرى (غير ملغاة) لهذه الشركة تغطي جزءًا من هذه الفترة.';
  }
  if (error instanceof ApiError && error.code === 'VALIDATION_ERROR' && (error.details as { field?: string } | undefined)?.field === 'toDate') {
    return 'يجب أن تكون الفترة قد انتهت: اختر يوم نهاية قبل اليوم (بتوقيت السودان).';
  }
  return errorMessage(error);
}
