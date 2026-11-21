import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, downloadFile } from '../../lib/api/client';

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
  createdAt: string;
  passengers: Array<{ id: string; fullName: string; phone: string | null; idNumber: string | null }>;
  tickets: Array<{
    id: string;
    ticketNumber: string;
    status: string;
    seatId: string | null;
    seatLabel: string | null;
    passengerId: string;
    passengerName: string | null;
  }>;
};

export type AdminBookingFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  officeId?: string;
  companyId?: string;
  from?: string;
  to?: string;
};

export const bookingKeys = {
  all: ['admin-bookings'] as const,
  list: (f: AdminBookingFilters) => [...bookingKeys.all, 'list', f] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
};

export function useAdminBookings(filters: AdminBookingFilters) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: ({ signal }) => api.get<AdminBooking[]>('/admin/bookings', filters, signal),
    placeholderData: keepPreviousData,
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
