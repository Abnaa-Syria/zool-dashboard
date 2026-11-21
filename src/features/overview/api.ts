import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api/client';

/**
 * GET /admin/overview (REQ-ADM-10). Wallet / top-up / commission fields are present only when
 * the admin holds the matching view permission.
 */
export type OverviewKpis = {
  range: { from: string; to: string };
  currency: 'SDG';
  bookingsCount: number;
  bookingsAmountMinor: number;
  cancelledCount: number;
  walletsBalanceMinor?: number;
  lowBalanceOfficesCount?: number;
  pendingTopUpsCount?: number;
  unsettledCommissionMinor?: number;
  draftSettlementsCount?: number;
};

export function useOverview(range: { from: string; to: string }) {
  return useQuery({
    queryKey: ['admin-overview', range],
    queryFn: ({ signal }) => api.get<OverviewKpis>('/admin/overview', range, signal).then((r) => r.data),
    refetchInterval: 60_000,
  });
}
