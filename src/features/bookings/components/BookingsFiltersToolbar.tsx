import * as React from 'react';
import type { BookingsFilterState } from '../types/booking';

interface BookingsFiltersToolbarProps {
  filters: BookingsFilterState;
  onFilterChange: (newFilters: Partial<BookingsFilterState>) => void;
  onResetFilters: () => void;
  onExportCsv: () => void;
  onRefresh: () => void;
  isExporting?: boolean;
}

export const BookingsFiltersToolbar: React.FC<BookingsFiltersToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onExportCsv,
  onRefresh,
  isExporting = false,
}) => {
  // Determine active filter count for badge/chips
  const activeChips: { key: keyof BookingsFilterState; label: string; valueLabel: string }[] = [];

  if (filters.searchQuery) {
    activeChips.push({
      key: 'searchQuery',
      label: 'البحث',
      valueLabel: filters.searchQuery,
    });
  }
  if (filters.source !== 'all') {
    activeChips.push({
      key: 'source',
      label: 'المصدر',
      valueLabel: filters.source === 'direct_customer' ? 'تطبيق العميل' : 'مكتب وسيط',
    });
  }
  if (filters.bookingStatus !== 'all') {
    activeChips.push({
      key: 'bookingStatus',
      label: 'حالة الحجز',
      valueLabel:
        filters.bookingStatus === 'confirmed'
          ? 'مؤكد'
          : filters.bookingStatus === 'pending'
          ? 'في انتظار الدفع'
          : 'ملغى',
    });
  }
  if (filters.paymentStatus !== 'all') {
    activeChips.push({
      key: 'paymentStatus',
      label: 'حالة الدفع',
      valueLabel:
        filters.paymentStatus === 'paid'
          ? 'مدفوع'
          : filters.paymentStatus === 'pending_verification'
          ? 'في انتظار التحقق'
          : 'مسترد',
    });
  }
  if (filters.ticketStatus !== 'all') {
    activeChips.push({
      key: 'ticketStatus',
      label: 'حالة التذكرة',
      valueLabel:
        filters.ticketStatus === 'issued'
          ? 'صادرة'
          : filters.ticketStatus === 'issue_failed'
          ? 'تعذر الإصدار'
          : filters.ticketStatus === 'pending_issue'
          ? 'لم تصدر'
          : 'ملغاة',
    });
  }
  if (filters.carrierId !== 'all') {
    activeChips.push({
      key: 'carrierId',
      label: 'الشركة',
      valueLabel:
        filters.carrierId === 'CO-NL-01'
          ? 'شركة النيل / سابتكو'
          : filters.carrierId === 'CO-TJ-02'
          ? 'شركة التاج'
          : 'شركة شريان الشمال',
    });
  }
  if (filters.datePreset !== 'all') {
    const presetLabel =
      filters.datePreset === 'today'
        ? 'اليوم'
        : filters.datePreset === '7days'
        ? 'آخر 7 أيام'
        : filters.datePreset === '30days'
        ? 'آخر 30 يوماً'
        : 'نطاق مخصص';
    const typeLabel =
      filters.dateFilterType === 'booking_created' ? 'تاريخ الإنشاء' : 'موعد الرحلة';
    activeChips.push({
      key: 'datePreset',
      label: typeLabel,
      valueLabel: presetLabel,
    });
  }

  const handleRemoveChip = (key: keyof BookingsFilterState) => {
    if (key === 'searchQuery') onFilterChange({ searchQuery: '', page: 1 });
    else if (key === 'datePreset') onFilterChange({ datePreset: 'all', page: 1 });
    else onFilterChange({ [key]: 'all', page: 1 });
  };

  return (
    <div className="p-5 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col gap-4">
      {/* Top Header Controls: Date Range Selector + Date Range Target Indicator + Action Buttons */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Date Filter Target Type (CRITICAL RULE: Clearly separate creation vs departure) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs">
            <span className="material-symbols-outlined text-emerald-800 text-sm">tune</span>
            <span className="text-slate-700 font-semibold">تطبيق نطاق التاريخ على:</span>
            <div className="inline-flex rounded-md p-0.5 bg-white border border-emerald-200">
              <button
                type="button"
                onClick={() =>
                  onFilterChange({ dateFilterType: 'booking_created', page: 1 })
                }
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                  filters.dateFilterType === 'booking_created'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="الفلترة بناءً على وقت إجراء وتسجيل الحجز"
              >
                تاريخ إنشاء الحجز
              </button>
              <button
                type="button"
                onClick={() =>
                  onFilterChange({ dateFilterType: 'trip_departure', page: 1 })
                }
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                  filters.dateFilterType === 'trip_departure'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="الفلترة بناءً على موعد تحرك الحافلة المجدول"
              >
                تاريخ موعد الرحلة
              </button>
            </div>
          </div>

          {/* Date Range Presets */}
          <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-medium">
            <button
              type="button"
              onClick={() => onFilterChange({ datePreset: 'all', page: 1 })}
              className={`px-2.5 py-1 rounded transition-colors ${
                filters.datePreset === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ datePreset: 'today', page: 1 })}
              className={`px-2.5 py-1 rounded transition-colors ${
                filters.datePreset === 'today'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              اليوم
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ datePreset: '7days', page: 1 })}
              className={`px-2.5 py-1 rounded transition-colors ${
                filters.datePreset === '7days'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              آخر 7 أيام
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ datePreset: '30days', page: 1 })}
              className={`px-2.5 py-1 rounded transition-colors ${
                filters.datePreset === '30days'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              آخر 30 يوماً
            </button>
          </div>
        </div>

        {/* Action Controls: Export CSV & Refresh */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportCsv}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
            title="تصدير السجلات الحالية كملف Excel متوافق مع الحروف العربية UTF-8"
          >
            <span className="material-symbols-outlined text-base text-emerald-700">file_download</span>
            <span>تصدير كشف الحجوزات (CSV)</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-slate-50 shadow-xs transition-colors"
            title="تحديث فوري للسجلات"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
          </button>
        </div>
      </div>

      {/* Primary Search Input */}
      <div className="relative w-full">
        <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value, page: 1 })}
          placeholder="البحث برقم الحجز (ZL-...)، رقم التذكرة، اسم المسافر، هاتف المسافر، أو رقم الرحلة..."
          className="w-full h-10 pr-11 pl-4 rounded-lg bg-slate-50 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-700/20 border border-slate-200 transition-all"
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={() => onFilterChange({ searchQuery: '', page: 1 })}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      {/* Multi-Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* 1. Source */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-500">مصدر الحجز</label>
          <select
            value={filters.source}
            onChange={(e) => onFilterChange({ source: e.target.value, page: 1 })}
            className="w-full h-8 px-2 rounded-lg bg-slate-50 text-slate-800 text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
          >
            <option value="all">الكل</option>
            <option value="direct_customer">تطبيق العميل</option>
            <option value="broker_office">مكتب وسيط</option>
          </select>
        </div>

        {/* 2. Booking Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-500">حالة الحجز</label>
          <select
            value={filters.bookingStatus}
            onChange={(e) => onFilterChange({ bookingStatus: e.target.value, page: 1 })}
            className="w-full h-8 px-2 rounded-lg bg-slate-50 text-slate-800 text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
          >
            <option value="all">الكل</option>
            <option value="confirmed">مؤكد</option>
            <option value="pending">في انتظار الدفع</option>
            <option value="cancelled">ملغى</option>
          </select>
        </div>

        {/* 3. Payment Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-500">حالة الدفع</label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => onFilterChange({ paymentStatus: e.target.value, page: 1 })}
            className="w-full h-8 px-2 rounded-lg bg-slate-50 text-slate-800 text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
          >
            <option value="all">الكل</option>
            <option value="paid">مدفوع</option>
            <option value="pending_verification">في انتظار التحقق</option>
            <option value="refunded">مسترد</option>
          </select>
        </div>

        {/* 4. Ticket Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-500">حالة التذكرة</label>
          <select
            value={filters.ticketStatus}
            onChange={(e) => onFilterChange({ ticketStatus: e.target.value, page: 1 })}
            className={`w-full h-8 px-2 rounded-lg bg-slate-50 text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer ${
              filters.ticketStatus === 'issue_failed'
                ? 'font-bold text-[#8E1B32] bg-rose-50 border-rose-200'
                : 'text-slate-800'
            }`}
          >
            <option value="all">الكل</option>
            <option value="issued">صادرة</option>
            <option value="pending_issue">لم تصدر</option>
            <option value="issue_failed">تعذر الإصدار (حالات حرجة)</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>

        {/* 5. Carrier */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-500">شركة النقل</label>
          <select
            value={filters.carrierId}
            onChange={(e) => onFilterChange({ carrierId: e.target.value, page: 1 })}
            className="w-full h-8 px-2 rounded-lg bg-slate-50 text-slate-800 text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
          >
            <option value="all">الكل</option>
            <option value="CO-NL-01">شركة النيل / سابتكو</option>
            <option value="CO-TJ-02">شركة التاج</option>
            <option value="CO-SH-03">شركة شريان الشمال</option>
          </select>
        </div>

        {/* 6. Broker Office */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-500">مكتب الوكيل</label>
          <select
            value={filters.brokerId}
            onChange={(e) => onFilterChange({ brokerId: e.target.value, page: 1 })}
            className="w-full h-8 px-2 rounded-lg bg-slate-50 text-slate-800 text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
          >
            <option value="all">الكل</option>
            <option value="AG-882">وكالة النيل للسفر (الخرطوم)</option>
            <option value="AG-710">مكتب الصفا للخدمات (بحري)</option>
          </select>
        </div>

        {/* 7. Route */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-500">المسار</label>
          <select
            value={filters.routeId}
            onChange={(e) => onFilterChange({ routeId: e.target.value, page: 1 })}
            className="w-full h-8 px-2 rounded-lg bg-slate-50 text-slate-800 text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
          >
            <option value="all">الكل</option>
            <option value="KRT-MRW-01">الخرطوم ← مروي</option>
            <option value="KRT-PTS-02">الخرطوم ← بورتسودان</option>
            <option value="KRT-KST-03">الخرطوم ← كوستي</option>
            <option value="KRT-GDF-04">الخرطوم ← القضارف</option>
          </select>
        </div>
      </div>

      {/* Applied Filters Chips & Reset Action */}
      {activeChips.length > 0 && (
        <div className="flex items-center justify-between pt-1 flex-wrap gap-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 ml-1">الفلاتر المطبقة:</span>
            {activeChips.map((chip) => {
              const isCritical =
                chip.key === 'ticketStatus' && filters.ticketStatus === 'issue_failed';
              return (
                <span
                  key={chip.key}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isCritical
                      ? 'bg-rose-100 text-[#8E1B32] border border-rose-200'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-100'
                  }`}
                >
                  <span>
                    {chip.label}: {chip.valueLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChip(chip.key)}
                    className="hover:opacity-75 transition-opacity"
                    title="إزالة الفلتر"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 transition-all"
          >
            <span className="material-symbols-outlined text-sm">filter_alt_off</span>
            <span>مسح جميع الفلاتر</span>
          </button>
        </div>
      )}
    </div>
  );
};
