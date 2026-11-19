import * as React from 'react';
import { Link } from 'react-router-dom';
import type { Booking } from '../types/booking';

interface TripSummarySectionProps {
  booking: Booking;
}

export const TripSummarySection: React.FC<TripSummarySectionProps> = ({ booking }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">directions_bus</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">بيانات الرحلة والمسار (Trip Summary)</h2>
            <span className="text-xs text-slate-500">تفاصيل الخط والمواعيد المجدولة للحافلة</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg bg-emerald-900 text-white text-xs font-mono font-bold">
          {booking.tripId}
        </span>
      </div>

      {/* Carrier & Bus Identity Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-800 shadow-xs">
            <span className="material-symbols-outlined text-2xl">airport_shuttle</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900">{booking.carrierName}</span>
            <span className="text-xs text-slate-500">
              {booking.vehicleModel || 'حافلة سياحية'} {booking.vehiclePlate ? `— ترخيص (${booking.vehiclePlate})` : ''}
            </span>
          </div>
        </div>

        {/* Bus ID & Tracking Direct Action */}
        <div className="flex items-center gap-2">
          {booking.vehicleId ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs text-slate-800 font-mono">
                <span className="material-symbols-outlined text-sm text-emerald-700">pin</span>
                <span>رقم الحافلة: {booking.vehicleId}</span>
              </div>
              <Link
                to={`/tracking?busId=${booking.vehicleId}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-colors"
                title="فتح موقع الحافلة الحي المباشر"
              >
                <span className="material-symbols-outlined text-sm">share_location</span>
                <span>تتبع الحافلة</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>الحافلة غير مخصصة بعد لهذه الرحلة</span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Route Progression */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative z-10">
          {/* Origin */}
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>محطة الانطلاق</span>
            </div>
            <span className="text-xl font-bold text-slate-900">{booking.routeName.split('←')[0].trim()}</span>
            <span className="text-xs text-slate-500">{booking.originTerminal}</span>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-800 w-fit shadow-xs">
              <span className="material-symbols-outlined text-sm text-emerald-700">schedule</span>
              <span>
                {booking.departureDate} — {booking.departureTime}
              </span>
            </div>
          </div>

          {/* Path Mid Indicator */}
          <div className="flex flex-col items-center justify-center px-4 py-2">
            <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
              {booking.travelDurationHours}
            </span>
            <div className="w-full md:w-36 flex items-center justify-center my-2 text-emerald-700">
              <span className="h-0.5 w-full bg-emerald-300"></span>
              <span className="material-symbols-outlined text-lg">arrow_left</span>
              <span className="h-0.5 w-full bg-emerald-300"></span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">خط مباشر بين المدن</span>
          </div>

          {/* Destination */}
          <div className="flex flex-col gap-1 flex-1 text-right">
            <div className="flex items-center gap-1.5 text-[#8E1B32] text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8E1B32]"></span>
              <span>محطة الوصول</span>
            </div>
            <span className="text-xl font-bold text-slate-900">{booking.routeName.split('←')[1]?.trim() || ''}</span>
            <span className="text-xs text-slate-500">{booking.destinationTerminal}</span>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-800 w-fit shadow-xs">
              <span className="material-symbols-outlined text-sm text-[#8E1B32]">timer</span>
              <span>
                {booking.departureDate} — {booking.estimatedArrivalTime} (تقديري)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-emerald-700 text-xl">signpost</span>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500">رصيف المغادرة والتفتيش</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5">{booking.originTerminal}</span>
            <span className="text-[11px] text-slate-500 mt-0.5">يُرجى الحضور قبل 20 دقيقة من موعد التحرك للتحقق من التذكرة</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-emerald-700 text-xl">location_city</span>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-slate-500">موقع الاستقبال والنزول</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5">{booking.destinationTerminal}</span>
            <span className="text-[11px] text-slate-500 mt-0.5">خدمة تسليم أمتعة الركاب المعتمدة</span>
          </div>
        </div>
      </div>
    </div>
  );
};
