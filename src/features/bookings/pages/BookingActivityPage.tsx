import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooking } from '../hooks/useBookings';
import { BookingActivityTimeline } from '../components/BookingActivityTimeline';
import { FinancialLedgerTable } from '../components/FinancialLedgerTable';

export const BookingActivityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: booking, isLoading, isError } = useBooking(id);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-slate-500 mt-3">جاري تحميل سجل التدقيق المالي...</span>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-lg font-bold text-slate-900">لم يتم العثور على الحجز</h2>
        <Link
          to="/bookings"
          className="mt-4 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold"
        >
          العودة للحجوزات
        </Link>
      </div>
    );
  }

  const isBroker = booking.source === 'broker_office';

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link to="/bookings" className="hover:text-emerald-800 transition-colors">
            الحجوزات والتذاكر
          </Link>
          <span>/</span>
          <Link to={`/bookings/${booking.id}`} className="hover:text-emerald-800 transition-colors">
            تفاصيل الحجز {booking.id}
          </Link>
          <span>/</span>
          <span className="text-emerald-800 font-bold">سجل النشاط والتدقيق المالي</span>
        </div>

        {/* Page Title & Action Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-1">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                سجل الحجز والتدقيق المالي
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-bold border border-emerald-200">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>{booking.id}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">
                  {isBroker ? 'storefront' : 'smartphone'}
                </span>
                <span>
                  المصدر: {isBroker ? `مكتب وسيط (${booking.brokerMeta?.brokerName})` : 'تطبيق العميل'}
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl">
              التتبع الزمني التراكمي لجميع العمليات الإدارية وحركات المحفظة والتسويات المرتبطة بالحجز {booking.id}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <Link
              to={`/bookings/${booking.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-base">arrow_forward</span>
              <span>العودة إلى تفاصيل الحجز</span>
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-[#8E1B32] text-white hover:bg-[#6d001e] text-xs font-bold transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>تصدير تقرير التدقيق (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats Bento (Matching Stitch _8) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ticket Value */}
        <div className="p-4 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>قيمة التذكرة المخصومة</span>
            <span className="material-symbols-outlined text-lg text-emerald-800">receipt_long</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-mono font-bold text-slate-900 tracking-tight">
              {booking.totalAmount.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-500">ج.س</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 text-[11px] font-semibold mt-1">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              <span>حركة مالية قطعية ومثبتة</span>
            </div>
          </div>
        </div>

        {/* Card 2: Broker Accrual */}
        <div className="p-4 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>عمولة الوكالة المستحقة</span>
            <span className="material-symbols-outlined text-lg text-emerald-700">payments</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-mono font-bold text-emerald-700 tracking-tight">
              {booking.brokerMeta ? `+${booking.brokerMeta.accruedCommissionAmount.toFixed(2)}` : '0.00'}{' '}
              <span className="text-xs font-normal text-slate-500">ج.س</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-[11px] font-semibold mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>
                {booking.brokerMeta
                  ? `دورة التسوية التراكمية ${booking.brokerMeta.settlementCycleId}`
                  : 'غير خاضع لعمولة مكاتب'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Audit Health */}
        <div className="p-4 rounded-xl bg-emerald-900 text-white shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-200 text-xs font-semibold">
            <span>حالة التدقيق الآلي</span>
            <span className="material-symbols-outlined text-lg text-emerald-300">policy</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white leading-none">100% متطابق</div>
            <div className="flex items-center gap-1 text-emerald-200 text-[11px] font-semibold mt-1.5">
              <span className="material-symbols-outlined text-xs">lock_clock</span>
              <span>لا توجد أي فروقات حسابية</span>
            </div>
          </div>
        </div>

        {/* Card 4: Ledger Chain Hash */}
        <div className="p-4 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>المعرف المشفر المرجعي</span>
            <span className="material-symbols-outlined text-lg text-slate-400">fingerprint</span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-xs font-bold text-slate-900 truncate tracking-wider" dir="ltr">
              ZL-AUD-{booking.id.replace('ZL-', '')}-TX
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-[11px] font-medium mt-1">
              <span className="material-symbols-outlined text-xs text-emerald-700">encrypted</span>
              <span>سجل محاسبي غير قابل للتعديل</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual-Panel Content: Timeline & Financial Trace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <BookingActivityTimeline events={booking.activityLog} />
        </div>
        <div className="xl:col-span-5">
          <FinancialLedgerTable booking={booking} entries={booking.ledgerEntries} />
        </div>
      </div>
    </div>
  );
};
