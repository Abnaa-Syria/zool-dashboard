import type { Booking } from '../types/booking';
import { mockBookings } from '../fixtures/bookingFixtures';

/**
 * Legacy mock lookup kept ONLY for the travelers feature (TravelerDetailsPage → TicketPreviewModal),
 * which is not yet wired to the API. The bookings pages use `../api.ts`. Delete this file,
 * `fixtures/`, `types/booking.ts`, `TicketPreviewModal` and `ThermalTicketPaper` once travelers is live.
 */
export const bookingService = {
  async getBookingById(id: string): Promise<Booking | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockBookings.find((b) => b.id.toLowerCase() === id.toLowerCase()) ?? null;
  },
};
