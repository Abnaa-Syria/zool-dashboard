import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooking } from '../hooks/useBookings';
import { BookingHeroHeader } from '../components/BookingHeroHeader';
import { TripSummarySection } from '../components/TripSummarySection';
import { CustomerBookingSection } from '../components/CustomerBookingSection';
import { BrokerFinancialSeparationHero } from '../components/BrokerFinancialSeparationHero';
import { BrokerOfficeSection } from '../components/BrokerOfficeSection';
import { DigitalTicketsSection } from '../components/DigitalTicketsSection';
import { BookingActivityTimeline } from '../components/BookingActivityTimeline';
import { FinancialLedgerTable } from '../components/FinancialLedgerTable';
import { TicketPreviewModal } from '../components/TicketPreviewModal';

type DetailTab = 'overview' | 'passengers' | 'financials' | 'tickets' | 'activity';

export const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: booking, isLoading, isError } = useBooking(id);

  const [activeTab, setActiveTab] = React.useState<DetailTab>('overview');
  const [isTicketModalOpen, setIsTicketModalOpen] = React.useState(false);
  const [selectedTicketIndex, setSelectedTicketIndex] = React.useState(0);

  const handleOpenTicketPreview = (ticketIndex: number = 0) => {
    setSelectedTicketIndex(ticketIndex);
    setIsTicketModalOpen(true);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-slate-500 mt-3">جاري تحميل تفاصيل الحجز...</span>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-[#8E1B32] mb-3">
          <span className="material-symbols-outlined text-3xl">error_outline</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">لم يتم العثور على الحجز</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          لم يتم العثور على أي حجز مطابق للمعرف المرجعي &quot;{id}&quot;. قد يكون الرقم غير صحيح أو تم حذفه.
        </p>
        <Link
          to="/bookings"
          className="mt-4 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
        >
          العودة إلى جدول الحجوزات
        </Link>
      </div>
    );
  }

  const isBroker = booking.source === 'broker_office';

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* 1. Shared Booking Hero Header */}
      <BookingHeroHeader
        booking={booking}
        onOpenTicketPreview={() => handleOpenTicketPreview(0)}
        onPrintPdf={handlePrintPdf}
      />

      {/* 2. Broker High-Priority Financial Separation Hero (Only for Broker Bookings) */}
      {isBroker && <BrokerFinancialSeparationHero booking={booking} />}

      {/* 3. Detail Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-emerald-700 text-emerald-800 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">grid_view</span>
          <span>نظرة عامة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('passengers')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'passengers'
              ? 'border-emerald-700 text-emerald-800 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">airline_seat_recline_extra</span>
          <span>المسافرون والمقاعد</span>
          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px]">
            {booking.passengerCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('financials')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'financials'
              ? 'border-emerald-700 text-emerald-800 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">receipt_long</span>
          <span>الدفع والفوترة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'tickets'
              ? 'border-emerald-700 text-emerald-800 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">qr_code_2</span>
          <span>التذاكر الرقمية</span>
          {booking.ticketStatus === 'issue_failed' ? (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-[#8E1B32] text-[10px] font-bold">
              معلقة
            </span>
          ) : (
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">
              {booking.tickets.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'activity'
              ? 'border-emerald-700 text-emerald-800 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">history</span>
          <span>سجل النشاط والتدقيق</span>
        </button>
      </div>

      {/* 4. Tab Content Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Column: Trip Summary + Digital Tickets Diagnostics */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <TripSummarySection booking={booking} />
            <DigitalTicketsSection
              booking={booking}
              onOpenTicketPreview={handleOpenTicketPreview}
            />
          </div>

          {/* Side Column: Source-Specific Details (Customer vs Broker) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {isBroker ? (
              <BrokerOfficeSection booking={booking} />
            ) : (
              <CustomerBookingSection booking={booking} />
            )}
          </div>
        </div>
      )}

      {activeTab === 'passengers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            {isBroker ? (
              <BrokerOfficeSection booking={booking} />
            ) : (
              <CustomerBookingSection booking={booking} />
            )}
          </div>
          <div className="lg:col-span-4">
            <TripSummarySection booking={booking} />
          </div>
        </div>
      )}

      {activeTab === 'financials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <FinancialLedgerTable booking={booking} entries={booking.ledgerEntries} />
          </div>
          <div className="lg:col-span-5">
            {isBroker ? (
              <BrokerFinancialSeparationHero booking={booking} />
            ) : (
              <CustomerBookingSection booking={booking} />
            )}
          </div>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="flex flex-col gap-6">
          <DigitalTicketsSection
            booking={booking}
            onOpenTicketPreview={handleOpenTicketPreview}
          />
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-7">
            <BookingActivityTimeline events={booking.activityLog} />
          </div>
          <div className="xl:col-span-5">
            <FinancialLedgerTable booking={booking} entries={booking.ledgerEntries} />
          </div>
        </div>
      )}

      {/* Ticket Preview Modal */}
      <TicketPreviewModal
        booking={booking}
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        selectedTicketIndex={selectedTicketIndex}
      />
    </div>
  );
};
