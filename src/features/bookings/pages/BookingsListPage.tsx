import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Booking, BookingsFilterState, DateFilterType } from '../types/booking';
import { useBookings } from '../hooks/useBookings';
import { bookingService } from '../services/bookingService';
import { BookingsMetricsCards } from '../components/BookingsMetricsCards';
import { BookingsFiltersToolbar } from '../components/BookingsFiltersToolbar';
import { BookingsTable } from '../components/BookingsTable';
import { TicketPreviewModal } from '../components/TicketPreviewModal';

export const BookingsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL search params into filter state to ensure context is preserved on navigation
  const filters: BookingsFilterState = React.useMemo(() => {
    return {
      searchQuery: searchParams.get('q') || '',
      source: searchParams.get('source') || 'all',
      bookingStatus: searchParams.get('bStatus') || 'all',
      paymentStatus: searchParams.get('pStatus') || 'all',
      ticketStatus: searchParams.get('tStatus') || 'all',
      carrierId: searchParams.get('carrier') || 'all',
      brokerId: searchParams.get('broker') || 'all',
      routeId: searchParams.get('route') || 'all',
      dateFilterType: (searchParams.get('dateType') as DateFilterType) || 'booking_created',
      datePreset: (searchParams.get('preset') as BookingsFilterState['datePreset']) || 'all',
      startDate: searchParams.get('start') || undefined,
      endDate: searchParams.get('end') || undefined,
      sortBy: (searchParams.get('sort') as BookingsFilterState['sortBy']) || 'createdAt',
      sortOrder: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('size')) || 10,
    };
  }, [searchParams]);

  // Query Hook
  const { data, isLoading, refetch } = useBookings(filters);

  // Modal ticket preview state
  const [previewBooking, setPreviewBooking] = React.useState<Booking | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  // Helper to update search params
  const updateFilters = (newFilters: Partial<BookingsFilterState>) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const merged = { ...filters, ...newFilters };

        if (merged.searchQuery) next.set('q', merged.searchQuery);
        else next.delete('q');

        if (merged.source !== 'all') next.set('source', merged.source);
        else next.delete('source');

        if (merged.bookingStatus !== 'all') next.set('bStatus', merged.bookingStatus);
        else next.delete('bStatus');

        if (merged.paymentStatus !== 'all') next.set('pStatus', merged.paymentStatus);
        else next.delete('pStatus');

        if (merged.ticketStatus !== 'all') next.set('tStatus', merged.ticketStatus);
        else next.delete('tStatus');

        if (merged.carrierId !== 'all') next.set('carrier', merged.carrierId);
        else next.delete('carrier');

        if (merged.brokerId !== 'all') next.set('broker', merged.brokerId);
        else next.delete('broker');

        if (merged.routeId !== 'all') next.set('route', merged.routeId);
        else next.delete('route');

        if (merged.dateFilterType !== 'booking_created') next.set('dateType', merged.dateFilterType);
        else next.delete('dateType');

        if (merged.datePreset !== 'all') next.set('preset', merged.datePreset);
        else next.delete('preset');

        if (merged.sortBy !== 'createdAt') next.set('sort', merged.sortBy);
        else next.delete('sort');

        if (merged.sortOrder !== 'desc') next.set('order', merged.sortOrder);
        else next.delete('order');

        if (merged.page > 1) next.set('page', String(merged.page));
        else next.delete('page');

        if (merged.pageSize !== 10) next.set('size', String(merged.pageSize));
        else next.delete('size');

        return next;
      },
      { replace: true }
    );
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleExportCsv = () => {
    if (!data?.bookings) return;
    setIsExporting(true);
    try {
      bookingService.exportBookingsCsv(data.bookings);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectBookingForTicket = (booking: Booking) => {
    setPreviewBooking(booking);
    setIsTicketModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header (Matching Stitch _5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">الحجوزات والتذاكر</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>تحديث حي مباشر</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            متابعة الحجوزات والمدفوعات وإصدار التذاكر من جميع قنوات زولغو
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {data?.metrics && <BookingsMetricsCards metrics={data.metrics} />}

      {/* Advanced Filters Toolbar */}
      <BookingsFiltersToolbar
        filters={filters}
        onFilterChange={updateFilters}
        onResetFilters={handleResetFilters}
        onExportCsv={handleExportCsv}
        onRefresh={() => refetch()}
        isExporting={isExporting}
      />

      {/* Main Table */}
      <BookingsTable
        bookings={data?.bookings || []}
        totalCount={data?.totalCount || 0}
        filteredCount={data?.filteredCount || 0}
        filters={filters}
        onFilterChange={updateFilters}
        onSelectBookingForTicket={handleSelectBookingForTicket}
        isLoading={isLoading}
      />

      {/* Ticket Preview Modal */}
      {previewBooking && (
        <TicketPreviewModal
          booking={previewBooking}
          isOpen={isTicketModalOpen}
          onClose={() => {
            setIsTicketModalOpen(false);
            setPreviewBooking(null);
          }}
        />
      )}
    </div>
  );
};
