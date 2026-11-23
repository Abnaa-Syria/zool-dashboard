import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api/client';

export type CustomerStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

/** GET /admin/customers row (backend customers-admin.service `toDto`). */
export type CustomerListItem = {
  id: string;
  displayName: string | null;
  phone: string | null;
  email: string | null;
  status: CustomerStatus;
  preferredLanguage: string;
  /** D-CASH-01: unpaid cash tickets not boarded. */
  cashNoShowCount: number;
  bookingsCount: number;
  lastLoginAt: string | null;
  createdAt: string;
};

/** GET/PATCH /admin/customers/:id. */
export type CustomerDetail = CustomerListItem & { bookings: { confirmed: number; cancelled: number } };

export type CustomerFilters = { page?: number; pageSize?: number; q?: string; status?: CustomerStatus };

export type CustomerPatch = { status?: 'ACTIVE' | 'SUSPENDED'; resetCashNoShows?: true };

export const customerKeys = {
  all: ['admin-customers'] as const,
  list: (f: CustomerFilters) => [...customerKeys.all, 'list', f] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
};

export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: ({ signal }) => api.get<CustomerListItem[]>('/admin/customers', filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: customerKeys.detail(id ?? ''),
    queryFn: ({ signal }) => api.get<CustomerDetail>(`/admin/customers/${id}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(id),
  });
}

/** Suspension revokes every customer session at once (backend bumps authzVersion). */
export function useUpdateCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: CustomerPatch) => api.patch<CustomerDetail>(`/admin/customers/${id}`, patch).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(customerKeys.detail(id), data);
      return qc.invalidateQueries({ queryKey: [...customerKeys.all, 'list'] });
    },
  });
}

/**
 * DELETE /admin/customers/:id — anonymises personal data (name, phone, email), revokes sessions and marks the
 * account DELETED; bookings and tickets stay for accounting. 409 ACCOUNT_HAS_ACTIVE_BOOKINGS while a trip is ahead.
 */
export function useDeleteCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete<{ deleted: boolean }>(`/admin/customers/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: customerKeys.all }),
  });
}

export const CUSTOMER_STATUS_LABEL: Record<CustomerStatus, string> = {
  ACTIVE: 'نشط',
  SUSPENDED: 'موقوف',
  DELETED: 'محذوف',
};

export const CUSTOMER_STATUS_VARIANT: Record<CustomerStatus, 'success' | 'error' | 'neutral'> = {
  ACTIVE: 'success',
  SUSPENDED: 'error',
  DELETED: 'neutral',
};

/** Fallback when the admin cannot read system settings (`cash.noShowLimit` default, D-CASH-01). */
export const DEFAULT_CASH_NO_SHOW_LIMIT = 2;

/**
 * `cash.noShowLimit` from GET /admin/settings (needs settings.view). Shares the settings page cache key
 * (`['sys-settings']`, same response shape). Returns null when unavailable → caller shows the default.
 */
export function useCashNoShowLimit(enabled: boolean) {
  return useQuery({
    queryKey: ['sys-settings'],
    queryFn: ({ signal }) => api.get<Array<{ key: string; value: unknown }>>('/admin/settings', undefined, signal).then((r) => r.data),
    enabled,
    select: (rows) => {
      const v = rows.find((s) => s.key === 'cash.noShowLimit')?.value;
      return typeof v === 'number' ? v : null;
    },
  });
}
