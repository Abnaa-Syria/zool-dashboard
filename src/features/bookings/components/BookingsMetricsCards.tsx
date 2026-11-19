import * as React from 'react';
import type { BookingsMetrics } from '../types/booking';

interface BookingsMetricsCardsProps {
  metrics: BookingsMetrics;
}

export const BookingsMetricsCards: React.FC<BookingsMetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Card 1: Total Bookings */}
      <div className="p-6 rounded-xl bg-white shadow-sm flex flex-col justify-between relative overflow-hidden group border border-slate-100 hover:shadow-md transition-shadow">
        <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-emerald-100/40 blur-2xl group-hover:scale-125 transition-transform"></div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500">إجمالي الحجوزات</span>
          <div className="w-9 h-9 rounded-lg bg-emerald-100/70 flex items-center justify-center text-emerald-800">
            <span className="material-symbols-outlined text-xl">confirmation_number</span>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
            {metrics.totalBookings.toLocaleString('ar-EG')}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+12.4% مقارنة بالفترة السابقة</span>
          </div>
        </div>
      </div>

      {/* Card 2: Confirmed Bookings */}
      <div className="p-6 rounded-xl bg-white shadow-sm flex flex-col justify-between relative overflow-hidden group border border-slate-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500">الحجوزات المؤكدة</span>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-800">
            <span className="material-symbols-outlined text-xl">check_circle</span>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
            {metrics.confirmedCount.toLocaleString('ar-EG')}
          </span>
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold">75.8% من الإجمالي</span>
            <span className="text-slate-500">رحلات مجدولة</span>
          </div>
        </div>
      </div>

      {/* Card 3: Pending Payment */}
      <div className="p-6 rounded-xl bg-white shadow-sm flex flex-col justify-between relative overflow-hidden group border border-slate-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-500">في انتظار الدفع</span>
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
            <span className="material-symbols-outlined text-xl">pending_actions</span>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
            {metrics.pendingPaymentCount.toLocaleString('ar-EG')}
          </span>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">8.0% من الإجمالي</span>
            <span className="text-amber-700 font-medium">مهلة الإلغاء نشطة</span>
          </div>
        </div>
      </div>

      {/* Card 4: Ticket Issue Failures (Critical Warning Metric in Burgundy #8E1B32) */}
      <div className="p-6 rounded-xl bg-[#8E1B32] text-white shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-[#6d001e]/50 blur-2xl"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xl text-rose-200">error</span>
            <span className="text-sm font-bold text-rose-100">تعذر إصدار التذكرة</span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-300 animate-ping"></span>
        </div>
        <div className="mt-4 flex flex-col gap-1 relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">
              {metrics.ticketIssueFailedCount}
            </span>
            <span className="text-xs font-semibold text-rose-200">حالة حرجة</span>
          </div>
          <p className="text-xs text-rose-100/90 leading-snug">
            تتطلب مراجعة تكامل النظام مع شركة النقل
          </p>
        </div>
      </div>
    </div>
  );
};
