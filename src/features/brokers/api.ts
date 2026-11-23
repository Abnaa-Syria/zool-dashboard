import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api/client';

export type OfficeStatus = 'ACTIVE' | 'SUSPENDED';
export type SettlementPeriod = 'WEEKLY' | 'MONTHLY';

/** GET /brokers row (backend brokers.dto `toOfficeDto`). */
export type BrokerOffice = {
  id: string;
  code: string;
  name: string;
  status: OfficeStatus;
  settlementPeriod: SettlementPeriod;
  minTopUpMinorOverride: number | null;
  exposureCeilingOverride: number | null;
  lowBalanceThresholdMinorOverride: number | null;
  timeZone: string | null;
  lastSettledAt: string | null;
  wallet: { id: string; balanceMinor: number; currency: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type StaffFlags = { canBook: boolean; canTopUp: boolean; canViewReports: boolean; canManageStaff: boolean };

/** backend `toEmployeeDto`. */
export type BrokerEmployee = {
  id: string;
  officeId: string;
  displayName: string;
  role: 'MANAGER' | 'CLERK';
  status: OfficeStatus;
  phone: string | null;
  flags: StaffFlags;
  permissions: string[];
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CarrierAssignment = {
  id: string;
  companyId: string;
  companyKey: string;
  companyName: string;
  commissionPercent: number;
};

/** GET /brokers/:id (backend `toOfficeDetailDto`). */
export type BrokerOfficeDetail = BrokerOffice & {
  employees: BrokerEmployee[];
  carrierAssignments: CarrierAssignment[];
};

/** GET /admin/wallets/:officeId → `{ wallet, ledger }` + pagination meta. */
export type OfficeWallet = {
  id: string;
  officeId: string;
  balanceMinor: number;
  currency: string;
  lowBalanceThresholdMinor: number;
  lowBalance: boolean;
  updatedAt: string;
};

export type LedgerEntry = {
  id: string;
  type: 'CREDIT_TOPUP' | 'DEBIT_BOOKING' | 'CREDIT_REFUND' | 'DEBIT_COMMISSION_PAYOUT';
  direction: 'CREDIT' | 'DEBIT';
  amountMinor: number;
  balanceAfterMinor: number;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
};

/** POST /admin/wallets/:officeId/top-ups result (backend payments `toDto`). */
export type TopUpIntent = {
  id: string;
  officeId: string;
  amountMinor: number;
  status: 'PENDING' | 'PENDING_REVIEW' | 'CONFIRMED' | 'FAILED';
  confirmationPath: string;
  provider: string;
  paymentReferenceNormalized: string | null;
  hasEvidence: boolean;
  createdAt: string;
  confirmedAt: string | null;
};

export type BrokerFilters = { page?: number; pageSize?: number; q?: string; status?: OfficeStatus };

export type CreateOfficeInput = {
  code: string;
  name: string;
  settlementPeriod?: SettlementPeriod;
  manager?: { displayName: string; phone: string };
};

export type CreateStaffInput = StaffFlags & { displayName: string; phone: string };
/** PATCH /brokers/:officeId — policy overrides only (name and code are not editable by the API). */
export type OfficePolicyPatch = Partial<{
  settlementPeriod: SettlementPeriod;
  minTopUpMinorOverride: number | null;
  exposureCeilingOverride: number | null;
  lowBalanceThresholdMinorOverride: number | null;
  timeZone: string | null;
}>;
export type UpdateStaffInput = Partial<StaffFlags & { displayName: string; status: OfficeStatus }>;

export const brokerKeys = {
  all: ['brokers'] as const,
  list: (f: BrokerFilters) => [...brokerKeys.all, 'list', f] as const,
  detail: (id: string) => [...brokerKeys.all, 'detail', id] as const,
  wallet: (id: string, page: number) => ['admin-wallets', 'office', id, page] as const,
};

export function useBrokerOffices(filters: BrokerFilters) {
  return useQuery({
    queryKey: brokerKeys.list(filters),
    queryFn: ({ signal }) => api.get<BrokerOffice[]>('/brokers', filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useBrokerOffice(id: string | undefined) {
  return useQuery({
    queryKey: brokerKeys.detail(id ?? ''),
    queryFn: ({ signal }) => api.get<BrokerOfficeDetail>(`/brokers/${id}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useOfficeWallet(id: string | undefined, page: number, enabled = true) {
  return useQuery({
    queryKey: brokerKeys.wallet(id ?? '', page),
    queryFn: ({ signal }) =>
      api.get<{ wallet: OfficeWallet; ledger: LedgerEntry[] }>(`/admin/wallets/${id}`, { page, pageSize: 20 }, signal),
    enabled: Boolean(id) && enabled,
    placeholderData: keepPreviousData,
  });
}

function useInvalidateBrokers() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: brokerKeys.all });
}

export function useCreateOffice() {
  const invalidate = useInvalidateBrokers();
  return useMutation({
    mutationFn: (input: CreateOfficeInput) => api.post<BrokerOfficeDetail>('/brokers', input).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export function useUpdateOfficePolicy(id: string) {
  const invalidate = useInvalidateBrokers();
  return useMutation({
    mutationFn: (patch: OfficePolicyPatch) => api.patch<BrokerOfficeDetail>(`/brokers/${id}`, patch).then((r) => r.data),
    onSuccess: invalidate,
  });
}

/** DELETE /brokers/:officeId — only without bookings, wallet history or balance (409 ENTITY_IN_USE otherwise). */
export function useDeleteOffice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ deleted: boolean }>(`/brokers/${id}`).then((r) => r.data),
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: [...brokerKeys.all, 'list'] }), qc.invalidateQueries({ queryKey: ['admin-wallets'] })]),
  });
}

/** DELETE /brokers/:officeId/staff/:employeeId — only for staff without bookings or top-ups. */
export function useDeleteStaff(id: string) {
  const invalidate = useInvalidateBrokers();
  return useMutation({
    mutationFn: (employeeId: string) => api.delete<{ deleted: boolean }>(`/brokers/${id}/staff/${employeeId}`).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export function useUpdateOfficeStatus(id: string) {
  const invalidate = useInvalidateBrokers();
  return useMutation({
    mutationFn: (status: OfficeStatus) => api.patch<BrokerOfficeDetail>(`/brokers/${id}/status`, { status }).then((r) => r.data),
    onSuccess: invalidate,
  });
}

/** PUT replaces the whole assignment list. */
export function useReplaceAssignments(id: string) {
  const invalidate = useInvalidateBrokers();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignments: Array<{ companyId: string; commissionPercent: number }>) =>
      api.put<BrokerOfficeDetail>(`/brokers/${id}/carriers`, { assignments }).then((r) => r.data),
    onSuccess: () => Promise.all([invalidate(), qc.invalidateQueries({ queryKey: ['carriers'] })]),
  });
}

export function useCreateStaff(id: string) {
  const invalidate = useInvalidateBrokers();
  return useMutation({
    mutationFn: (input: CreateStaffInput) => api.post<BrokerEmployee>(`/brokers/${id}/staff`, input).then((r) => r.data),
    onSuccess: invalidate,
  });
}

export function useUpdateStaff(id: string) {
  const invalidate = useInvalidateBrokers();
  return useMutation({
    mutationFn: ({ employeeId, changes }: { employeeId: string; changes: UpdateStaffInput }) =>
      api.patch<BrokerEmployee>(`/brokers/${id}/staff/${employeeId}`, changes).then((r) => r.data),
    onSuccess: invalidate,
  });
}

/**
 * Audited manual top-up fallback (D-ADMIN-TOPUP-01): creates a PENDING_REVIEW intent with a
 * receipt; the wallet is credited only after approval in the top-up queue. Never a direct credit (D-ADJ-01).
 */
export function useCreateManualTopUp(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { amountMinor: number; paymentReference: string; note?: string; receipt: File }) => {
      const form = new FormData();
      form.set('amountMinor', String(input.amountMinor));
      form.set('paymentReference', input.paymentReference);
      if (input.note) form.set('note', input.note);
      form.set('receipt', input.receipt);
      return api.post<TopUpIntent>(`/admin/wallets/${id}/top-ups`, form).then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-wallets'] }),
  });
}

export const OFFICE_STATUS_LABEL: Record<OfficeStatus, string> = { ACTIVE: 'نشط', SUSPENDED: 'موقوف' };
export const SETTLEMENT_PERIOD_LABEL: Record<SettlementPeriod, string> = { WEEKLY: 'أسبوعية', MONTHLY: 'شهرية' };
export const LEDGER_TYPE_LABEL: Record<LedgerEntry['type'], string> = {
  CREDIT_TOPUP: 'شحن رصيد',
  DEBIT_BOOKING: 'خصم حجز',
  CREDIT_REFUND: 'استرداد',
  DEBIT_COMMISSION_PAYOUT: 'صرف عمولة',
};
