import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, downloadFile } from '../../lib/api/client';
import type { AdminRefund } from '../refunds/api';

/** Admin booking as returned by GET /admin/bookings (backend `toBookingDto`). */
export type AdminBooking = {
  id: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING_PAYMENT' | 'CHANGED' | 'EXPIRED';
  bookingRef: string | null;
  channel: 'BROKER' | 'DIRECT';
  paymentMethod: 'WALLET' | 'ONLINE' | 'CASH_ON_BOARD';
  paymentStatus: 'PENDING' | 'PAID' | 'UNPAID_CASH' | 'PAID_CASH' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  officeId: string | null;
  office: { id: string; code: string; name: string } | null;
  customerId: string | null;
  /** DIRECT (customer app) bookings only; null for broker bookings. */
  customer: { id: string; displayName: string | null; phone: string | null } | null;
  employee: { id: string; displayName: string } | null;
  trip: {
    id: string;
    origin: string;
    destination: string;
    departureAt: string;
    company: { id: string; key: string; name: string };
  };
  totalAmountMinor: number;
  commissionAmountMinor: number;
  commissionStatus: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  passengers: Array<{ id: string; fullName: string; phone: string | null; idNumber: string | null; gender?: 'MALE' | 'FEMALE' | null }>;
  /** D-CHG-01: on a CHANGED booking, the booking that replaced it. */
  replacedByBookingId?: string | null;
  /** D-CHG-01: on a booking created by a trip change, the booking it replaced. */
  replacesBookingId?: string | null;
  changeCount?: number;
  /** Round trip: both legs share the group id. */
  groupId?: string | null;
  leg?: 'OUTBOUND' | 'RETURN' | null;
  tickets: Array<{
    id: string;
    ticketNumber: string;
    status: string;
    seatId: string | null;
    seatLabel: string | null;
    passengerId: string;
    passengerName: string | null;
    boardingStatus?: 'PENDING' | 'BOARDED' | 'NO_SHOW';
    qrPayload?: string | null;
  }>;
  /** Refunds to the original payment (app bookings); empty for wallet-refunded broker bookings. */
  refunds?: Array<{ id: string; amountMinor: number; status: AdminRefund['status']; reason: AdminRefund['reason']; createdAt: string; processedAt: string | null }>;
};

export type AdminBookingFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  /** The admin list API only accepts CONFIRMED | CANCELLED. */
  status?: 'CONFIRMED' | 'CANCELLED';
  officeId?: string;
  companyId?: string;
  customerId?: string;
  employeeId?: string;
  from?: string;
  to?: string;
};

export const bookingKeys = {
  all: ['admin-bookings'] as const,
  list: (f: AdminBookingFilters) => [...bookingKeys.all, 'list', f] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
};

export function useAdminBookings(filters: AdminBookingFilters, enabled = true) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: ({ signal }) => api.get<AdminBooking[]>('/admin/bookings', filters, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useAdminBooking(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ''),
    queryFn: ({ signal }) => api.get<AdminBooking>(`/admin/bookings/${id}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function exportBookingsCsv(filters: Omit<AdminBookingFilters, 'page' | 'pageSize'>) {
  return downloadFile('/admin/bookings/export.csv', filters, 'bookings.csv');
}

export const BOOKING_STATUS_LABEL: Record<AdminBooking['status'], string> = {
  CONFIRMED: 'مؤكد',
  CANCELLED: 'ملغى',
  PENDING_PAYMENT: 'بانتظار الدفع',
  CHANGED: 'مُعدّل',
  EXPIRED: 'منتهي',
};

/** Result of POST /admin/bookings/:id/cancel (broker bookings only; refunds the office wallet). */
export type AdminCancelResult = {
  booking: AdminBooking;
  refundedAmountMinor: number;
  commissionClawedBackMinor: number;
  /** null for app (direct) bookings: no wallet involved */
  balanceAfterMinor: number | null;
  replayed: boolean;
};

export function useCancelAdminBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post<AdminCancelResult>(`/admin/bookings/${id}/cancel`, { reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: bookingKeys.all }),
  });
}

export function downloadTicketPdf(bookingId: string, ticketNumber: string) {
  return downloadFile(
    `/admin/bookings/${bookingId}/tickets/${encodeURIComponent(ticketNumber)}/pdf`,
    undefined,
    `ticket-${ticketNumber}.pdf`,
  );
}

/** Audit entry from GET /audit-logs (requires `audit.view`). */
export type AuditLogEntry = {
  id: string;
  actorAdminId: string | null;
  actor: { id: string; displayName: string } | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  requestId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
};

export function useBookingAuditLogs(bookingId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: [...bookingKeys.detail(bookingId ?? ''), 'audit'] as const,
    queryFn: ({ signal }) =>
      api
        .get<AuditLogEntry[]>('/audit-logs', { resourceType: 'booking', resourceId: bookingId, pageSize: 100 }, signal)
        .then((r) => r.data),
    enabled: enabled && Boolean(bookingId),
  });
}

export const AUDIT_ACTION_LABEL: Record<string, string> = {
  'booking.confirmed': 'تأكيد الحجز وإصدار التذاكر',
  'booking.cancelled': 'إلغاء الحجز من مكتب الوكيل',
  'booking.cancelled.admin': 'إلغاء الحجز من الإدارة',
  'booking.dispatched': 'إرسال التذاكر',
};

export const CHANNEL_LABEL: Record<AdminBooking['channel'], string> = {
  BROKER: 'مكتب وكيل',
  DIRECT: 'تطبيق العميل',
};

export const PAYMENT_METHOD_LABEL: Record<AdminBooking['paymentMethod'], string> = {
  WALLET: 'محفظة المكتب',
  ONLINE: 'دفع إلكتروني',
  CASH_ON_BOARD: 'نقدًا عند الصعود',
};

export const PAYMENT_STATUS_LABEL: Record<AdminBooking['paymentStatus'], string> = {
  PENDING: 'بانتظار الدفع',
  PAID: 'مدفوع',
  UNPAID_CASH: 'نقدي غير مدفوع',
  PAID_CASH: 'نقدي مدفوع',
  REFUNDED: 'مسترد',
  PARTIALLY_REFUNDED: 'مسترد جزئيًا',
};

export const COMMISSION_STATUS_LABEL: Record<string, string> = {
  UNSETTLED: 'غير مسوّاة',
  RESERVED: 'محجوزة لتسوية',
  SETTLED: 'مسوّاة',
  CLAWED_BACK: 'مستردة',
};

export const TICKET_STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'صالحة',
  CANCELLED: 'ملغاة',
  CHANGED: 'منقولة لرحلة أخرى',
};

export const BOARDING_STATUS_LABEL: Record<string, string> = {
  PENDING: 'لم يصعد بعد',
  BOARDED: 'صعد',
  NO_SHOW: 'لم يحضر',
};

export const GENDER_LABEL: Record<string, string> = { MALE: 'ذكر', FEMALE: 'أنثى' };

export const LEG_LABEL: Record<string, string> = { OUTBOUND: 'رحلة الذهاب', RETURN: 'رحلة العودة' };

/**
 * The other leg of a round trip among `candidates` (same groupId, different id), or null.
 * The admin list API has no groupId filter, so callers pass a page of the same customer's/office's bookings.
 */
export function findOtherLeg<T extends Pick<AdminBooking, 'id' | 'groupId'>>(booking: Pick<AdminBooking, 'id' | 'groupId'>, candidates: T[]): T | null {
  if (!booking.groupId) return null;
  return candidates.find((c) => c.id !== booking.id && c.groupId === booking.groupId) ?? null;
}

export function bookingStatusVariant(status: AdminBooking['status']): 'success' | 'error' | 'warning' | 'neutral' {
  if (status === 'CONFIRMED') return 'success';
  if (status === 'CANCELLED') return 'error';
  if (status === 'PENDING_PAYMENT') return 'warning';
  return 'neutral';
}

export function bookingRefLabel(b: Pick<AdminBooking, 'bookingRef' | 'id'>): string {
  return b.bookingRef ?? b.id.slice(-8).toUpperCase();
}
