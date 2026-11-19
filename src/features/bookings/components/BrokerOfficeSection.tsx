import * as React from 'react';
import type { Booking } from '../types/booking';

interface BrokerOfficeSectionProps {
  booking: Booking;
}

export const BrokerOfficeSection: React.FC<BrokerOfficeSectionProps> = ({ booking }) => {
  const meta = booking.brokerMeta;
  if (!meta) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Broker Office & Clerk Operational Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">storefront</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">بيانات المكتب الوسيط وموظف الحجز</h2>
              <span className="text-xs text-slate-500">تفاصيل نقطة البيع المعتمدة وسجل العملية الإدارية</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
            {meta.brokerId}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500">اسم المكتب / الوكالة</span>
            <span className="font-bold text-slate-900 mt-0.5">{meta.brokerName}</span>
            <span className="text-[10px] text-slate-500">{meta.brokerBranch}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500">موظف الحجز والتوثيق</span>
            <span className="font-bold text-slate-900 mt-0.5">{meta.clerkName}</span>
            <span className="text-[10px] text-slate-400 font-mono">كود الموظف: {meta.clerkId}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500">جهاز نقطة البيع (POS)</span>
            <span className="font-bold text-slate-900 mt-0.5">{meta.posTerminalId}</span>
            {meta.posIpAddress && (
              <span className="text-[10px] text-slate-400 font-mono">IP: {meta.posIpAddress}</span>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500">قنوات تسليم التذكرة</span>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {meta.deliveryChannels.paperPrinted && (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  طباعة حرارية
                </span>
              )}
              {meta.deliveryChannels.smsDispatched && (
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                  إرسال SMS
                </span>
              )}
              {meta.deliveryChannels.digitalPdfReady && (
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                  PDF رقمي
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actual Passenger Info & Assigned Seats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">airline_seat_recline_extra</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">بيانات المسافر الفعلي والمقعد</h2>
              <span className="text-xs text-slate-500">الراكب المحجوز له عبر مكتب الوكالة</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            {booking.passengerCount} {booking.passengerCount === 1 ? 'مسافر' : 'ركاب'}
          </span>
        </div>

        <div className="flex flex-col divide-y divide-slate-100">
          {booking.passengers.map((passenger, idx) => (
            <div
              key={passenger.id}
              className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {idx + 1}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{passenger.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      {passenger.passengerType === 'child' ? 'طفل' : 'بالغ'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-mono" dir="ltr">
                      <span className="material-symbols-outlined text-xs text-slate-400">phone</span>
                      <span>{passenger.maskedPhone}</span>
                    </span>
                    {passenger.maskedNationalId && (
                      <span className="flex items-center gap-1 font-mono">
                        <span className="material-symbols-outlined text-xs text-slate-400">fingerprint</span>
                        <span>{passenger.maskedNationalId}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-100 font-bold">
                  <span className="material-symbols-outlined text-sm text-emerald-700">airline_seat_recline_extra</span>
                  <span>مقعد {passenger.seatNumber}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{passenger.ticketNumber}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
