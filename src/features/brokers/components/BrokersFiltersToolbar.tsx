import * as React from 'react';
import type { BrokersFilterState } from '../types/broker';

interface BrokersFiltersToolbarProps {
  filters: BrokersFilterState;
  onFilterChange: (newFilters: Partial<BrokersFilterState>) => void;
  onResetFilters: () => void;
}

export const BrokersFiltersToolbar: React.FC<BrokersFiltersToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.state !== 'all' ||
    filters.status !== 'all' ||
    filters.carrierId !== 'all';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Search input (5 cols) */}
        <div className="lg:col-span-5 relative">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value, page: 1 })}
            placeholder="البحث باسم المكتب، رمز الاعتماد (AG-XXX)، المدينة، أو المدير..."
            className="w-full h-10 pr-10 pl-3 bg-slate-50 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '', page: 1 })}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Filters Row (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* State Filter */}
          <div className="relative">
            <select
              value={filters.state}
              onChange={(e) => onFilterChange({ state: e.target.value, page: 1 })}
              className="w-full h-10 px-3 text-xs rounded-lg bg-slate-50 text-slate-800 border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-700 cursor-pointer"
            >
              <option value="all">الولاية: كافة الولايات</option>
              <option value="ولاية الخرطوم">ولاية الخرطوم</option>
              <option value="ولاية البحر الأحمر">ولاية البحر الأحمر</option>
              <option value="ولاية نهر النيل">ولاية نهر النيل</option>
              <option value="الولاية الشمالية">الولاية الشمالية</option>
              <option value="ولاية الجزيرة">ولاية الجزيرة</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
              className="w-full h-10 px-3 text-xs rounded-lg bg-slate-50 text-slate-800 border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-700 cursor-pointer"
            >
              <option value="all">حالة المكتب: الكل</option>
              <option value="active">نشط ومعتمد</option>
              <option value="low_balance">تنبيه الرصيد المنخفض (&lt; 500)</option>
              <option value="suspended">موقوف مؤقتاً</option>
            </select>
          </div>

          {/* Carrier Link Filter */}
          <div className="relative">
            <select
              value={filters.carrierId}
              onChange={(e) => onFilterChange({ carrierId: e.target.value, page: 1 })}
              className="w-full h-10 px-3 text-xs rounded-lg bg-slate-50 text-slate-800 border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-700 cursor-pointer"
            >
              <option value="all">الشركات المرتبطة: الكل</option>
              <option value="CO-NL-01">شركة النيل للنقل البري</option>
              <option value="CO-TJ-02">سابتكو السودان VIP</option>
              <option value="CO-SH-03">شركة شريان الشمال</option>
              <option value="CO-SD-04">شركة الصداقة للنقل</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">الفلاتر المطبقة:</span>

          {filters.searchQuery && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full font-medium">
              <span>البحث: {filters.searchQuery}</span>
              <button
                onClick={() => onFilterChange({ searchQuery: '', page: 1 })}
                className="hover:text-rose-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          )}

          {filters.state !== 'all' && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full font-medium">
              <span>الولاية: {filters.state}</span>
              <button
                onClick={() => onFilterChange({ state: 'all', page: 1 })}
                className="hover:text-rose-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          )}

          {filters.status !== 'all' && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full font-medium">
              <span>
                الحالة:{' '}
                {filters.status === 'active'
                  ? 'نشط'
                  : filters.status === 'low_balance'
                    ? 'تنبيه الرصيد'
                    : 'موقوف'}
              </span>
              <button
                onClick={() => onFilterChange({ status: 'all', page: 1 })}
                className="hover:text-rose-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          )}

          {filters.carrierId !== 'all' && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full font-medium">
              <span>الشركة المرتبطة</span>
              <button
                onClick={() => onFilterChange({ carrierId: 'all', page: 1 })}
                className="hover:text-rose-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          )}

          <button
            onClick={onResetFilters}
            className="text-[#8E1B32] hover:underline font-semibold pr-2"
          >
            مسح جميع الفلاتر
          </button>
        </div>
      )}
    </div>
  );
};
