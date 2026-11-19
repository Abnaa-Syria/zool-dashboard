import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Booking } from '../types/booking';

interface BookingHeroHeaderProps {
  booking: Booking;
  onOpenTicketPreview?: () => void;
  onPrintPdf?: () => void;
}

export const BookingHeroHeader: React.FC<BookingHeroHeaderProps> = ({
  booking,
  onOpenTicketPreview,
  onPrintPdf,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(booking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb & Context Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="hover:text-emerald-800 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
            <span>العودة للقائمة</span>
          </button>
          <span>/</span>
          <Link to="/bookings" className="hover:text-emerald-800 transition-colors">
            الحجوزات والتذاكر
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold font-mono">{booking.id}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-emerald-700">schedule</span>
            <span>
              تاريخ الإنشاء: <strong className="text-slate-800 font-mono">{booking.createdAt.replace('T', ' — ')}</strong>
            </span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-emerald-700">update</span>
            <span>آخر تحديث: 24 أكتوبر 2024</span>
          </div>
        </div>
      </div>

      {/* Main Hero Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-gradient-to-br from-rose-50 via-emerald-50 to-transparent rounded-full pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Title & Multi-Status Badges */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
                تفاصيل الحجز {booking.id}
              </h1>

              {/* Source Tag */}
              {booking.source === 'broker_office' ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">storefront</span>
                  <span>مكتب وسيط: {booking.brokerMeta?.brokerName}</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">smartphone</span>
                  <span>تطبيق العميل</span>
                </span>
              )}

              {/* Copy Reference Button */}
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                title="نسخ رقم الحجز المرجعي"
              >
                <span className="material-symbols-outlined text-xs">content_copy</span>
                <span>{copied ? 'تم النسخ!' : 'نسخ رقم الحجز'}</span>
              </button>
            </div>

            {/* Separate Status Badges Row (MANDATORY REQUIREMENT) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* 1. Booking Status */}
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  booking.status === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-900'
                    : booking.status === 'pending'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-rose-100 text-rose-900'
                }`}
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>
                  حالة الحجز:{' '}
                  <strong>
                    {booking.status === 'confirmed'
                      ? 'مؤكد'
                      : booking.status === 'pending'
                      ? 'في انتظار الدفع'
                      : 'ملغى'}
                  </strong>
                </span>
              </div>

              {/* 2. Payment Status */}
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  booking.paymentStatus === 'paid'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : booking.paymentStatus === 'pending_verification'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-purple-50 text-purple-800 border border-purple-200'
                }`}
              >
                <span className="material-symbols-outlined text-sm">payments</span>
                <span>
                  حالة الدفع:{' '}
                  <strong>
                    {booking.paymentStatus === 'paid'
                      ? booking.source === 'broker_office'
                        ? 'مدفوع (خصم من المحفظة)'
                        : 'مدفوع'
                      : booking.paymentStatus === 'pending_verification'
                      ? 'في انتظار التحقق'
                      : 'مسترد'}
                  </strong>
                </span>
              </div>

              {/* 3. Ticket Status */}
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  booking.ticketStatus === 'issued'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : booking.ticketStatus === 'issue_failed'
                    ? 'bg-[#8E1B32] text-white animate-pulse'
                    : booking.ticketStatus === 'pending_issue'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {booking.ticketStatus === 'issue_failed' ? 'report_problem' : 'confirmation_number'}
                </span>
                <span>
                  حالة التذكرة:{' '}
                  <strong>
                    {booking.ticketStatus === 'issued'
                      ? 'صادرة ومؤكدة'
                      : booking.ticketStatus === 'issue_failed'
                      ? 'تعذر الإصدار (مزامنة الناقل)'
                      : booking.ticketStatus === 'pending_issue'
                      ? 'لم تصدر بعد'
                      : 'ملغاة'}
                  </strong>
                </span>
              </div>

              {/* 4. Broker Commission Accrual Badge */}
              {booking.source === 'broker_office' && booking.brokerMeta && (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>
                    العمولة: <strong>متراكمة غير مسواة ({booking.brokerMeta.settlementCycleId})</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {/* View Ticket Action */}
            {booking.tickets.length > 0 && (
              <button
                type="button"
                onClick={onOpenTicketPreview}
                className="h-9 px-3.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-200"
              >
                <span className="material-symbols-outlined text-base">qr_code</span>
                <span>معاينة التذكرة الرقمية</span>
              </button>
            )}

            {/* Vehicle Tracking Direct Navigation */}
            {booking.vehicleId ? (
              <Link
                to={`/tracking?busId=${booking.vehicleId}`}
                className="h-9 px-3.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                title="الانتقال إلى خريطة التتبع المباشر وتحديد هذه الحافلة تلقائياً"
              >
                <span className="material-symbols-outlined text-base">share_location</span>
                <span>عرض الحافلة على الخريطة ({booking.vehicleId})</span>
              </Link>
            ) : (
              <div
                className="h-9 px-3 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium flex items-center gap-1.5 cursor-not-allowed border border-slate-200"
                title="لم يتم تخصيص رقم حافلة لهذه الرحلة حتى الآن"
              >
                <span className="material-symbols-outlined text-base">location_off</span>
                <span>الحافلة غير مخصصة بعد</span>
              </div>
            )}

            {/* Activity & Financial Trace Link */}
            <Link
              to={`/bookings/${booking.id}/activity`}
              className="h-9 px-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
            >
              <span className="material-symbols-outlined text-base text-emerald-700">history</span>
              <span>سجل التدقيق المالي</span>
            </Link>

            {/* Download/Print PDF Action */}
            <button
              type="button"
              onClick={onPrintPdf}
              className="h-9 px-3.5 rounded-lg bg-[#8E1B32] text-white hover:bg-[#6d001e] text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              title="طباعة أو تصدير قسيمة الحجز كملف PDF"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>طباعة قسيمة الحجز (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
