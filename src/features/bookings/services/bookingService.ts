import type {
  Booking,
  BookingsFilterState,
  BookingsMetrics,
} from '../types/booking';
import { mockBookings, mockInitialBookingsMetrics } from '../fixtures/bookingFixtures';

export interface GetBookingsResult {
  bookings: Booking[];
  totalCount: number;
  filteredCount: number;
  metrics: BookingsMetrics;
}

export const bookingService = {
  /**
   * Fetches bookings list with filtering, searching, sorting, and pagination
   */
  async getBookings(filters: Partial<BookingsFilterState> = {}): Promise<GetBookingsResult> {
    // Simulate lightweight network latency for authentic UI state handling
    await new Promise((resolve) => setTimeout(resolve, 150));

    let filtered = [...mockBookings];

    // Search query
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter((b) => {
        const matchesId = b.id.toLowerCase().includes(q);
        const matchesPassenger = b.passengers.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.phone.includes(q) ||
            (p.ticketNumber && p.ticketNumber.toLowerCase().includes(q))
        );
        const matchesTrip = b.tripId.toLowerCase().includes(q) || b.routeName.toLowerCase().includes(q);
        const matchesCarrier = b.carrierName.toLowerCase().includes(q);
        const matchesBroker =
          b.brokerMeta?.brokerName.toLowerCase().includes(q) ||
          b.brokerMeta?.clerkName.toLowerCase().includes(q);
        const matchesTickets = b.tickets.some((t) => t.ticketNumber.toLowerCase().includes(q));

        return (
          matchesId ||
          matchesPassenger ||
          matchesTrip ||
          matchesCarrier ||
          matchesBroker ||
          matchesTickets
        );
      });
    }

    // Source filter
    if (filters.source && filters.source !== 'all') {
      filtered = filtered.filter((b) => b.source === filters.source);
    }

    // Booking status filter
    if (filters.bookingStatus && filters.bookingStatus !== 'all') {
      filtered = filtered.filter((b) => b.status === filters.bookingStatus);
    }

    // Payment status filter
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      filtered = filtered.filter((b) => b.paymentStatus === filters.paymentStatus);
    }

    // Ticket issuance status filter
    if (filters.ticketStatus && filters.ticketStatus !== 'all') {
      filtered = filtered.filter((b) => b.ticketStatus === filters.ticketStatus);
    }

    // Carrier filter
    if (filters.carrierId && filters.carrierId !== 'all') {
      filtered = filtered.filter((b) => b.carrierId === filters.carrierId);
    }

    // Broker filter
    if (filters.brokerId && filters.brokerId !== 'all') {
      filtered = filtered.filter((b) => b.brokerMeta?.brokerId === filters.brokerId);
    }

    // Route filter
    if (filters.routeId && filters.routeId !== 'all') {
      filtered = filtered.filter((b) => b.routeId === filters.routeId);
    }

    // Date range filter: strictly respects dateFilterType ('booking_created' vs 'trip_departure')
    const dateType = filters.dateFilterType || 'booking_created';
    if (filters.datePreset && filters.datePreset !== 'all') {
      const todayStr = '2024-10-24'; // Using dashboard reference date

      if (filters.datePreset === 'today') {
        filtered = filtered.filter((b) => {
          const targetDate =
            dateType === 'booking_created'
              ? b.createdAt.substring(0, 10)
              : b.departureDate;
          return targetDate === todayStr;
        });
      } else if (filters.datePreset === '7days') {
        filtered = filtered.filter((b) => {
          const targetDate =
            dateType === 'booking_created'
              ? b.createdAt.substring(0, 10)
              : b.departureDate;
          return targetDate >= '2024-10-18' && targetDate <= '2024-10-25';
        });
      } else if (filters.datePreset === '30days') {
        filtered = filtered.filter((b) => {
          const targetDate =
            dateType === 'booking_created'
              ? b.createdAt.substring(0, 10)
              : b.departureDate;
          return targetDate >= '2024-10-01' && targetDate <= '2024-10-31';
        });
      } else if (filters.datePreset === 'custom' && (filters.startDate || filters.endDate)) {
        filtered = filtered.filter((b) => {
          const targetDate =
            dateType === 'booking_created'
              ? b.createdAt.substring(0, 10)
              : b.departureDate;
          if (filters.startDate && targetDate < filters.startDate) return false;
          if (filters.endDate && targetDate > filters.endDate) return false;
          return true;
        });
      }
    }

    // Sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison = a.createdAt.localeCompare(b.createdAt);
      } else if (sortBy === 'departureTime') {
        comparison = a.departureDate.localeCompare(b.departureDate);
      } else if (sortBy === 'totalAmount') {
        comparison = a.totalAmount - b.totalAmount;
      } else if (sortBy === 'passengerCount') {
        comparison = a.passengerCount - b.passengerCount;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const totalCount = mockBookings.length;
    const filteredCount = filtered.length;

    // Pagination
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedBookings = filtered.slice(startIndex, startIndex + pageSize);

    return {
      bookings: paginatedBookings,
      totalCount,
      filteredCount,
      metrics: mockInitialBookingsMetrics,
    };
  },

  /**
   * Fetches single booking by ID
   */
  async getBookingById(id: string): Promise<Booking | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const booking = mockBookings.find((b) => b.id.toLowerCase() === id.toLowerCase());
    return booking || null;
  },

  /**
   * Generates a UTF-8 CSV string with BOM for Arabic compatibility in Excel
   */
  exportBookingsCsv(bookings: Booking[]): void {
    const headers = [
      'رقم الحجز',
      'المسافر الرئيسي',
      'عدد الركاب',
      'هاتف المسافر',
      'مصدر الحجز',
      'اسم الوكيل / الحساب',
      'شركة النقل',
      'المسار',
      'تاريخ موعد الرحلة',
      'وقت التحرك',
      'إجمالي الحجز (ج.س)',
      'حالة الحجز',
      'حالة الدفع',
      'حالة التذكرة',
      'رقم الحافلة',
      'تاريخ إنشاء الحجز',
    ];

    const escapeCsv = (val: string | number | undefined): string => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = bookings.map((b) => [
      escapeCsv(b.id),
      escapeCsv(b.mainPassengerName),
      escapeCsv(b.passengerCount),
      escapeCsv(b.mainPassengerPhone),
      escapeCsv(b.source === 'broker_office' ? 'مكتب وسيط' : 'مسافر مباشر'),
      escapeCsv(b.brokerMeta?.brokerName || b.customerMeta?.registeredName || 'حساب زائر'),
      escapeCsv(b.carrierName),
      escapeCsv(b.routeName),
      escapeCsv(b.departureDate),
      escapeCsv(b.departureTime),
      escapeCsv(b.totalAmount),
      escapeCsv(
        b.status === 'confirmed'
          ? 'مؤكد'
          : b.status === 'pending'
          ? 'في انتظار الدفع'
          : b.status === 'cancelled'
          ? 'ملغى'
          : b.status
      ),
      escapeCsv(
        b.paymentStatus === 'paid'
          ? 'مدفوع'
          : b.paymentStatus === 'pending_verification'
          ? 'في انتظار التحقق'
          : b.paymentStatus === 'refunded'
          ? 'مسترد'
          : b.paymentStatus
      ),
      escapeCsv(
        b.ticketStatus === 'issued'
          ? 'صادرة'
          : b.ticketStatus === 'issue_failed'
          ? 'تعذر الإصدار'
          : b.ticketStatus === 'pending_issue'
          ? 'لم تصدر'
          : b.ticketStatus
      ),
      escapeCsv(b.vehicleId || 'غير مخصصة'),
      escapeCsv(b.createdAt),
    ]);

    // Prepend UTF-8 BOM \uFEFF
    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `zoolgo_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
