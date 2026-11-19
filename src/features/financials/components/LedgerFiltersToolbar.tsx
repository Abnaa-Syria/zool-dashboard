import React from 'react';
import type { LedgerFilterState, TransactionType } from '../types/financials';

interface LedgerFiltersToolbarProps {
  filters: LedgerFilterState;
  totalResults: number;
  onSearchChange: (val: string) => void;
  onTypeChange: (type: TransactionType | 'all') => void;
  onPartyChange: (party: string) => void;
  onDateRangeChange: (range: LedgerFilterState['dateRange']) => void;
  onResetFilters: () => void;
}

export const LedgerFiltersToolbar: React.FC<LedgerFiltersToolbarProps> = ({
  filters,
  totalResults,
  onSearchChange,
  onTypeChange,
  onPartyChange,
  onDateRangeChange,
  onResetFilters,
}) => {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.transactionType !== 'all' ||
    filters.targetParty !== 'all' ||
    filters.dateRange !== 'today';

  return (
    <div className="bg-white rounded-xl p-4 border border-border shadow-xs mb-4 flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* Search Input */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">بحث متقدم في القيود:</label>
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">
              search
            </span>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="رقم القيد TXN-XXXXXX، الحجز، الوكيل..."
              className="w-full h-10 pr-9 pl-3 rounded-lg bg-surface-subtle text-text-primary placeholder:text-text-muted text-xs border border-transparent focus:border-primary-dark transition-all outline-none"
            />
          </div>
        </div>

        {/* Transaction Type */}
        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">نوع الحركة المحاسبية:</label>
          <div className="relative">
            <select
              aria-label="نوع الحركة المحاسبية"
              value={filters.transactionType}
              onChange={(e) => onTypeChange(e.target.value as TransactionType | 'all')}
              className="w-full h-10 px-3 appearance-none rounded-lg bg-surface-subtle text-text-primary text-xs font-semibold border border-transparent focus:border-primary-dark transition-all outline-none cursor-pointer"
            >
              <option value="all">الكل (جميع القيود)</option>
              <option value="ticket_debit">خصم حجز تذكرة</option>
              <option value="wallet_topup">شحن رصيد محفظة</option>
              <option value="commission_credit">استحقاق عمولة وسيط</option>
              <option value="refund_reversal">استرداد تذكرة ملغاة</option>
              <option value="settlement_payout">تسوية أسبوعية وتحويل بنكي</option>
            </select>
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[18px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Target Party */}
        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-primary">طرف المعاملة:</label>
          <div className="relative">
            <select
              aria-label="طرف المعاملة"
              value={filters.targetParty}
              onChange={(e) => onPartyChange(e.target.value)}
              className="w-full h-10 px-3 appearance-none rounded-lg bg-surface-subtle text-text-primary text-xs font-semibold border border-transparent focus:border-primary-dark transition-all outline-none cursor-pointer"
            >
              <option value="all">كافة الأطراف</option>
              <option value="وكالة النيل">وكالة النيل للسفر (AG-882)</option>
              <option value="تاركو">وكالة تاركو لخدمات السفر</option>
              <option value="سابتكو">شركة سابتكو للنقل</option>
              <option value="شريان الشمال">شركة شريان الشمال</option>
            </select>
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[18px]">
              expand_more
            </span>
          </div>
        </div>

        {/* Date Range & Reset */}
        <div className="md:col-span-2 flex items-center gap-2">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-primary">نطاق التاريخ:</label>
            <select
              aria-label="نطاق التاريخ"
              value={filters.dateRange}
              onChange={(e) => onDateRangeChange(e.target.value as LedgerFilterState['dateRange'])}
              className="w-full h-10 px-2 rounded-lg bg-surface-subtle text-text-primary text-xs font-semibold border border-transparent focus:border-primary-dark transition-all outline-none cursor-pointer"
            >
              <option value="today">اليوم (24 أكتوبر)</option>
              <option value="yesterday">أمس (23 أكتوبر)</option>
              <option value="week">الأسبوع الحالي</option>
              <option value="all">جميع التواريخ</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onResetFilters}
            className="h-10 w-10 mt-5 rounded-lg bg-surface-subtle hover:bg-border text-text-muted hover:text-text-primary flex items-center justify-center transition-colors border border-border"
            title="إعادة ضبط الفلاتر"
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
          </button>
        </div>
      </div>

      {/* Active Filter Tags Strip */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-border flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-text-muted">الفلاتر المطبقة:</span>

            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle text-text-primary font-medium">
                <span>بحث: <strong>{filters.searchQuery}</strong></span>
                <button type="button" onClick={() => onSearchChange('')} className="hover:text-red-600">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}

            {filters.transactionType !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle text-text-primary font-medium">
                <span>النوع: <strong>{filters.transactionType}</strong></span>
                <button type="button" onClick={() => onTypeChange('all')} className="hover:text-red-600">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}

            {filters.targetParty !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle text-text-primary font-medium">
                <span>الطرف: <strong>{filters.targetParty}</strong></span>
                <button type="button" onClick={() => onPartyChange('all')} className="hover:text-red-600">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={onResetFilters}
              className="text-primary-ruby hover:text-primary-dark font-semibold underline mr-2"
            >
              مسح الكل
            </button>
          </div>

          <div className="text-text-muted">
            <span>إجمالي القيود المطابقة: <strong>{totalResults}</strong> قيد</span>
          </div>
        </div>
      )}
    </div>
  );
};
