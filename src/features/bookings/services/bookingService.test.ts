import { describe, it, expect } from 'vitest';
import { bookingService } from './bookingService';

describe('Booking Service', () => {
  it('returns all mock bookings when no filters are provided', async () => {
    const result = await bookingService.getBookings();
    expect(result.bookings.length).toBeGreaterThan(0);
    expect(result.totalCount).toBeGreaterThanOrEqual(6);
    expect(result.metrics.totalBookings).toBe(14820);
  });

  it('filters by search query matching booking reference or passenger name', async () => {
    const searchById = await bookingService.getBookings({ searchQuery: 'ZL-854921' });
    expect(searchById.bookings).toHaveLength(1);
    expect(searchById.bookings[0].id).toBe('ZL-854921');

    const searchByName = await bookingService.getBookings({ searchQuery: 'حسن عبد الله' });
    expect(searchByName.bookings).toHaveLength(1);
    expect(searchByName.bookings[0].id).toBe('ZL-BR-19482');
  });

  it('filters by booking source accurately (direct customer vs broker office)', async () => {
    const customers = await bookingService.getBookings({ source: 'direct_customer' });
    expect(customers.bookings.every((b) => b.source === 'direct_customer')).toBe(true);

    const brokers = await bookingService.getBookings({ source: 'broker_office' });
    expect(brokers.bookings.every((b) => b.source === 'broker_office')).toBe(true);
    expect(brokers.bookings.some((b) => b.id === 'ZL-BR-19482')).toBe(true);
  });

  it('identifies critical ticket issuance failure cases (Stitch _5 case)', async () => {
    const failedTickets = await bookingService.getBookings({ ticketStatus: 'issue_failed' });
    expect(failedTickets.bookings.length).toBeGreaterThanOrEqual(2);
    expect(failedTickets.bookings.some((b) => b.id === 'ZL-854921')).toBe(true);
    expect(failedTickets.bookings.some((b) => b.id === 'ZL-854935')).toBe(true);
  });

  it('strictly distinguishes between booking creation date and trip departure date', async () => {
    // Departure date filter for 2024-10-25
    const departedOn25th = await bookingService.getBookings({
      dateFilterType: 'trip_departure',
      datePreset: 'custom',
      startDate: '2024-10-25',
      endDate: '2024-10-25',
    });
    expect(departedOn25th.bookings.every((b) => b.departureDate === '2024-10-25')).toBe(true);

    // Created date filter for 2024-10-23
    const createdOn23rd = await bookingService.getBookings({
      dateFilterType: 'booking_created',
      datePreset: 'custom',
      startDate: '2024-10-23',
      endDate: '2024-10-23',
    });
    expect(createdOn23rd.bookings.every((b) => b.createdAt.startsWith('2024-10-23'))).toBe(true);
  });

  it('verifies explicit financial separation for broker booking ZL-BR-19482', async () => {
    const brokerBooking = await bookingService.getBookingById('ZL-BR-19482');
    expect(brokerBooking).not.toBeNull();
    expect(brokerBooking?.brokerMeta).toBeDefined();

    const meta = brokerBooking!.brokerMeta!;
    // Ticket Face Value: 350
    expect(meta.walletDebitAmount).toBe(350);
    // Wallet debit is exactly 350 (never netted against commission)
    expect(meta.walletDebitAmount).toBe(brokerBooking!.totalAmount);
    // Accrued Commission is separate record (+35)
    expect(meta.accruedCommissionAmount).toBe(35);
    // Historical balance post-debit is preserved
    expect(meta.walletBalanceAfterDebit).toBe(15150);
    expect(meta.walletCurrentBalance).toBe(84200);

    // Check financial ledger
    const ledger = brokerBooking!.ledgerEntries;
    const debitEntry = ledger.find((e) => e.type === 'broker_wallet_debit');
    const accrualEntry = ledger.find((e) => e.type === 'accrued_commission');

    expect(debitEntry).toBeDefined();
    expect(debitEntry?.amount).toBe(350);
    expect(debitEntry?.direction).toBe('debit');

    expect(accrualEntry).toBeDefined();
    expect(accrualEntry?.amount).toBe(35);
    expect(accrualEntry?.direction).toBe('accrual');
  });

  it('returns null for non-existent booking ID', async () => {
    const notFound = await bookingService.getBookingById('NON-EXISTENT-ID');
    expect(notFound).toBeNull();
  });
});
