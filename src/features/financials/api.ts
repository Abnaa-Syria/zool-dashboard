import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, api, downloadFile } from '../../lib/api/client';
import { errorMessage } from '../../lib/api/errors';
import { useAuth } from '../auth/auth-context';
import type { BrokerOffice } from '../brokers/api';

/** GET /admin/wallets row (backend wallets.service `listAdmin`). */
export type AdminWalletRow = {
  officeId: string;
  officeCode: string;
  officeName: string;
  officeStatus: 'ACTIVE' | 'SUSPENDED';
  walletId: string;
  balanceMinor: number;
  currency: 'SDG';
  lowBalanceThresholdMinor: number;
  lowBalance: boolean;
  updatedAt: string;
};

export type WalletSort = 'balanceMinor' | 'updatedAt' | 'officeCode' | 'officeName';

export type WalletFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  officeStatus?: 'ACTIVE' | 'SUSPENDED';
  lowBalance?: boolean;
  sort?: WalletSort;
  order?: 'asc' | 'desc';
};

export type TopUpStatus = 'PENDING' | 'PENDING_REVIEW' | 'CONFIRMED' | 'FAILED';

/** GET /admin/wallets/top-ups row (backend payments `TopUpIntentDto`). */
export type AdminTopUp = {
  id: string;
  officeId: string;
  amountMinor: number;
  status: TopUpStatus;
  confirmationPath: 'AUTOMATIC' | 'MANUAL_FALLBACK';
  provider: string;
  providerRef: string | null;
  paymentReferenceNormalized: string | null;
  idempotencyKey: string;
  hasEvidence: boolean;
  createdAt: string;
  confirmedAt: string | null;
};

export type TopUpFilters = { page?: number; pageSize?: number; officeId?: string; status?: TopUpStatus };

export const financeKeys = {
  wallets: ['admin-wallets'] as const,
  walletList: (f: WalletFilters) => ['admin-wallets', 'list', f] as const,
  topUps: ['admin-top-ups'] as const,
  topUpList: (f: TopUpFilters) => ['admin-top-ups', 'list', f] as const,
  offices: ['finance-office-lookup'] as const,
};

export function useAdminWallets(filters: WalletFilters) {
  return useQuery({
    queryKey: financeKeys.walletList(filters),
    queryFn: ({ signal }) => api.get<AdminWalletRow[]>('/admin/wallets', filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useAdminTopUps(filters: TopUpFilters) {
  return useQuery({
    queryKey: financeKeys.topUpList(filters),
    queryFn: ({ signal }) => api.get<AdminTopUp[]>('/admin/wallets/top-ups', filters, signal),
    placeholderData: keepPreviousData,
  });
}

/** Approving credits the wallet (ledger CREDIT_TOPUP); the amount is never editable. */
export function useApproveTopUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ intent: AdminTopUp; balanceMinor: number; replayed: boolean }>(`/admin/wallets/top-ups/${id}/approve`).then((r) => r.data),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: financeKeys.topUps }),
        qc.invalidateQueries({ queryKey: financeKeys.wallets }),
        qc.invalidateQueries({ queryKey: ['brokers'] }),
        qc.invalidateQueries({ queryKey: ['admin-overview'] }),
      ]),
  });
}

export function useRejectTopUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      api.post<{ intent: AdminTopUp; replayed: boolean }>(`/admin/wallets/top-ups/${id}/reject`, note ? { note } : {}).then((r) => r.data),
    onSuccess: () =>
      Promise.all([qc.invalidateQueries({ queryKey: financeKeys.topUps }), qc.invalidateQueries({ queryKey: ['admin-overview'] })]),
  });
}

export function downloadTopUpEvidence(id: string) {
  return downloadFile(`/admin/wallets/top-ups/${id}/evidence`, undefined, `receipt-${id}`);
}

export type OfficeRef = { id: string; code: string; name: string };

/**
 * Office id → code/name lookup for screens whose DTO only carries `officeId` (top-ups) and for
 * office pickers. Uses GET /brokers when allowed, otherwise GET /admin/wallets; first 100 offices.
 */
export function useOfficeLookup() {
  const { can } = useAuth();
  const viaBrokers = can('brokers.view');
  const viaWallets = !viaBrokers && can('wallets.view');
  return useQuery({
    queryKey: [...financeKeys.offices, viaBrokers ? 'brokers' : 'wallets'] as const,
    enabled: viaBrokers || viaWallets,
    staleTime: 5 * 60_000,
    queryFn: async ({ signal }): Promise<OfficeRef[]> => {
      if (viaBrokers) {
        const res = await api.get<BrokerOffice[]>('/brokers', { page: 1, pageSize: 100 }, signal);
        return res.data.map((o) => ({ id: o.id, code: o.code, name: o.name }));
      }
      const res = await api.get<AdminWalletRow[]>('/admin/wallets', { page: 1, pageSize: 100, sort: 'officeName' }, signal);
      return res.data.map((w) => ({ id: w.officeId, code: w.officeCode, name: w.officeName }));
    },
  });
}

/** Finance-specific error codes not covered by the shared table (errors.ts is owned elsewhere). */
const FINANCE_MESSAGES: Record<string, string> = {
  TOP_UP_NOT_REVIEWABLE: 'لا يمكن مراجعة هذا الطلب: لم يعد بانتظار المراجعة (ربما رُوجع من مشرف آخر).',
  NOTHING_TO_SETTLE: 'لا توجد عمولات غير مسوّاة لهذا المكتب في الفترة المحددة.',
  SETTLEMENT_OVERLAP: 'توجد تسوية مسودة متداخلة مع هذه الفترة، أو عمولات محجوزة في تسوية أخرى.',
  UNSUPPORTED_CURRENCY: 'عملة غير مدعومة (الجنيه السوداني فقط).',
};

export function financeErrorMessage(error: unknown, fallback?: string): string {
  if (error instanceof ApiError && FINANCE_MESSAGES[error.code]) return FINANCE_MESSAGES[error.code]!;
  return errorMessage(error, fallback);
}

export const TOP_UP_STATUS_LABEL: Record<TopUpStatus, string> = {
  PENDING: 'بانتظار الدفع',
  PENDING_REVIEW: 'بانتظار المراجعة',
  CONFIRMED: 'مؤكد',
  FAILED: 'مرفوض / فاشل',
};

export const TOP_UP_STATUS_VARIANT: Record<TopUpStatus, 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'info',
  PENDING_REVIEW: 'warning',
  CONFIRMED: 'success',
  FAILED: 'error',
};

export const CONFIRMATION_PATH_LABEL: Record<AdminTopUp['confirmationPath'], string> = {
  AUTOMATIC: 'تلقائي (مزوّد الدفع)',
  MANUAL_FALLBACK: 'يدوي (إيصال)',
};
