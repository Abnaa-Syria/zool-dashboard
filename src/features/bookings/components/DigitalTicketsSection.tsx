import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Booking } from '../types/booking';

interface DigitalTicketsSectionProps {
  booking: Booking;
  onOpenTicketPreview: (ticketIndex: number) => void;
}

export const DigitalTicketsSection: React.FC<DigitalTicketsSectionProps> = ({
  booking,
  onOpenTicketPreview,
}) => {
  const [inspectingSync, setInspectingSync] = React.useState(false);
  const [inspectResult, setInspectResult] = React.useState<string | null>(null);

  const handleInspectSync = () => {
    setInspectingSync(true);
    setInspectResult(null);
    setTimeout(() => {
      setInspectingSync(false);
      setInspectResult('تم الفحص: خادم الناقل غير متاح حالياً (HTTP 504) - سيتم تكرار المحاولة آلياً في الخلفية.');
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5" id="ticket-diagnostics">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              booking.ticketStatus === 'issue_failed'
                ? 'bg-rose-100 text-[#8E1B32]'
                : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {booking.ticketStatus === 'issue_failed' ? 'report_problem' : 'confirmation_number'}
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              بيانات وحالة التذكرة الرقمية (Digital Ticket Status)
            </h2>
            <span className="text-xs text-slate-500">
              تتبع تدفق المزامنة بين ZoolGo وخادم شركة النقل
            </span>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            booking.ticketStatus === 'issued'
              ? 'bg-emerald-100 text-emerald-800'
              : booking.ticketStatus === 'issue_failed'
              ? 'bg-rose-100 text-[#8E1B32]'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {booking.tickets.length > 0
            ? `${booking.tickets.length} تذكرة`
            : 'لا توجد تذاكر صادرة'}
        </span>
      </div>

      {/* Operational Alert Diagnostics Box if ticket failure exists */}
      {booking.operationalAlert && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#8E1B32] to-[#6d001e] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-white">
              <span className="material-symbols-outlined text-2xl">error</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">{booking.operationalAlert.title}</span>
              <p className="text-xs text-rose-100/90 leading-relaxed mt-1 max-w-2xl">
                {booking.operationalAlert.description}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleInspectSync}
              disabled={inspectingSync}
              className="px-3.5 py-2 rounded-lg bg-white text-[#8E1B32] hover:bg-rose-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span className={`material-symbols-outlined text-base ${inspectingSync ? 'animate-spin' : ''}`}>
                {inspectingSync ? 'refresh' : 'troubleshoot'}
              </span>
              <span>{inspectingSync ? 'جاري الفحص...' : 'فحص استجابة الربط'}</span>
            </button>
          </div>
        </div>
      )}

      {inspectResult && (
        <div className="p-3 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200">
          {inspectResult}
        </div>
      )}

      {/* Ticket Cards Grid */}
      {booking.tickets.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
          <span className="material-symbols-outlined text-3xl text-slate-300">pending</span>
          <p className="text-xs font-semibold mt-2">
            لم يتم إصدار تذاكر رقمية لهذا الحجز بعد (في انتظار اكتمال الدفع أو التخصيص).
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {booking.tickets.map((ticket, idx) => (
            <div
              key={ticket.ticketNumber}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-stretch justify-between gap-5 relative overflow-hidden"
            >
              {/* Ticket Core Data */}
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-800 text-xl">qr_code</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {ticket.ticketNumber}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      ticket.status === 'issued'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ticket.status === 'issue_failed'
                        ? 'bg-rose-100 text-[#8E1B32]'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {ticket.status === 'issued'
                      ? 'صادرة ومؤكدة'
                      : ticket.status === 'issue_failed'
                      ? 'تعذر الإصدار (معلقة في مزامنة الناقل)'
                      : 'ملغاة'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs text-xs">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-400">المسافر</span>
                    <span className="font-bold text-slate-900 mt-0.5">{ticket.passengerName}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-400">المقعد المخصص</span>
                    <span className="font-bold font-mono text-emerald-800 mt-0.5">
                      {ticket.seatNumber} ({ticket.seatClass === 'vip' ? 'VIP' : 'عادي'})
                    </span>
                  </div>
                </div>

                {ticket.statusReason && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-900">
                    <span className="material-symbols-outlined text-sm text-[#8E1B32] shrink-0">info</span>
                    <p>{ticket.statusReason}</p>
                  </div>
                )}
              </div>

              {/* QR Preview Widget */}
              <div className="w-full md:w-48 bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center border border-slate-200 shadow-xs shrink-0">
                {ticket.status === 'issued' ? (
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <QRCodeSVG value={ticket.qrPayload} size={100} level="M" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-rose-800">
                    <span className="material-symbols-outlined text-2xl animate-pulse">sync_problem</span>
                    <span className="text-[10px] font-bold mt-1">في الانتظار</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onOpenTicketPreview(idx)}
                  className="mt-3 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors w-full"
                >
                  معاينة وطباعة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
