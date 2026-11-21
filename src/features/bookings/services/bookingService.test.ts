import { describe, it, expect } from 'vitest';
import { bookingService } from './bookingService';

describe('bookingService (legacy mock for travelers)', () => {
  it('finds a mock booking by id case-insensitively', async () => {
    const booking = await bookingService.getBookingById('zl-br-19482');
    expect(booking?.id).toBe('ZL-BR-19482');
  });

  it('returns null for non-existent booking ID', async () => {
    expect(await bookingService.getBookingById('NON-EXISTENT-ID')).toBeNull();
  });
});
