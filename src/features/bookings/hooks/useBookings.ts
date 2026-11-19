import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../services/bookingService';
import type { BookingsFilterState } from '../types/booking';

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (filters: Partial<BookingsFilterState>) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

export function useBookings(filters: Partial<BookingsFilterState>) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => bookingService.getBookings(filters),
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id || ''),
    queryFn: () => (id ? bookingService.getBookingById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
    staleTime: 1000 * 60,
  });
}
