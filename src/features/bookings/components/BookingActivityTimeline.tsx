import * as React from 'react';
import type { BookingActivityEvent } from '../types/booking';

interface BookingActivityTimelineProps {
  events: BookingActivityEvent[];
}

export const BookingActivityTimeline: React.FC<BookingActivityTimelineProps> = ({ events }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">timeline</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">المسار الزمني التراكمي للعمليات</h2>
            <span className="text-xs text-slate-500">توثيق تسلسلي لحظي لجميع الإجراءات والأحداث</span>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
          {events.length} عمليات موثقة
        </span>
      </div>

      {/* Vertical Timeline Track */}
      <div className="relative pr-4 flex flex-col gap-6">
        {/* Continuous Track Line */}
        <div className="absolute right-[27px] top-4 bottom-6 w-0.5 bg-slate-200 pointer-events-none"></div>

        {events.map((event) => {
          const isError = event.resultStatus === 'error';
          const isWarning = event.resultStatus === 'warning';
          const isSuccess = event.resultStatus === 'success';

          return (
            <div key={event.id} className="relative flex items-start gap-4 group">
              {/* Timeline Icon Node */}
              <div
                className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs border ${
                  isError
                    ? 'bg-rose-100 text-[#8E1B32] border-rose-200'
                    : isWarning
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : isSuccess
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {event.eventType === 'booking_created'
                    ? 'event_seat'
                    : event.eventType === 'wallet_debited'
                    ? 'account_balance_wallet'
                    : event.eventType === 'commission_accrued'
                    ? 'savings'
                    : event.eventType === 'ticket_generated'
                    ? 'qr_code_2'
                    : event.eventType === 'ticket_printed'
                    ? 'print'
                    : event.eventType === 'payment_received'
                    ? 'payments'
                    : event.eventType === 'refund_initiated'
                    ? 'assignment_return'
                    : event.eventType === 'sync_failed'
                    ? 'sync_problem'
                    : 'verified'}
                </span>
              </div>

              {/* Event Content Card */}
              <div className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200/80 transition-colors hover:bg-slate-50/90 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-slate-900 text-sm">{event.title}</span>
                  <div className="flex items-center gap-1.5">
                    {event.relatedReference && (
                      <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {event.relatedReference}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isError
                          ? 'bg-rose-100 text-[#8E1B32]'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isError ? 'فشل / خطأ' : isWarning ? 'تحذير' : 'ناجح ومثبت'}
                    </span>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed mb-3">{event.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px] pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-slate-400">schedule</span>
                    <span>{event.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-slate-400">person</span>
                    <span>
                      الفاعل: <strong className="text-slate-800">{event.actor}</strong> ({event.actorRole})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
