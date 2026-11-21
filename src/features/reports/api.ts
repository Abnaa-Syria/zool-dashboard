import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, downloadFile } from '../../lib/api/client';
import type { DateRange } from './range';

/** GET /admin/reports/summary (insights.service `summary`). */
export type ReportSummary = {
  range: { from: string; to: string };
  filters: { officeId: string | null; companyId: string | null };
  bookingsCount: number;
  bookingsAmountMinor: number;
  cancelledCount: number;
  refundedAmountMinor: number;
  unsettledCommissionMinor: number;
  settledCommissionMinor: number;
  /** Current balance across wallets — not bound to the range. */
  walletsBalanceMinor: number;
  currency: 'SDG';
};

export type OfficeReportRow = {
  office: { id: string | null; code: string | null; name: string | null };
  bookingsCount: number;
  bookingsAmountMinor: number;
  commissionAmountMinor: number;
};

export type CarrierReportRow = {
  company: { id: string; name: string };
  bookingsCount: number;
  bookingsAmountMinor: number;
  commissionAmountMinor: number;
};

export const reportKeys = {
  all: ['admin-reports'] as const,
  summary: (r: DateRange) => ['admin-reports', 'summary', r] as const,
  byOffice: (r: DateRange) => ['admin-reports', 'by-office', r] as const,
  byCarrier: (r: DateRange) => ['admin-reports', 'by-carrier', r] as const,
};

function reportQuery<T>(key: readonly unknown[], path: string, range: DateRange, enabled: boolean) {
  return {
    queryKey: key,
    queryFn: ({ signal }: { signal: AbortSignal }) => api.get<T>(path, range, signal).then((r) => r.data),
    enabled,
    placeholderData: keepPreviousData<T>,
  };
}

export function useReportSummary(r: DateRange, enabled: boolean) {
  return useQuery(reportQuery<ReportSummary>(reportKeys.summary(r), '/admin/reports/summary', r, enabled));
}

export function useReportByOffice(r: DateRange, enabled: boolean) {
  return useQuery(reportQuery<OfficeReportRow[]>(reportKeys.byOffice(r), '/admin/reports/by-office', r, enabled));
}

export function useReportByCarrier(r: DateRange, enabled: boolean) {
  return useQuery(reportQuery<CarrierReportRow[]>(reportKeys.byCarrier(r), '/admin/reports/by-carrier', r, enabled));
}

/** Bookings CSV for the same Sudan-day range (GET /admin/bookings/export.csv, bookings.view). */
export function exportBookingsCsv(range: DateRange) {
  return downloadFile('/admin/bookings/export.csv', range, `bookings-${range.from}-${range.to}.csv`);
}
