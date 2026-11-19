import * as React from 'react';
import type { CarriersFilterState } from '../types/carrier';

interface CarriersFiltersToolbarProps {
  filters: CarriersFilterState;
  onFilterChange: (newFilters: Partial<CarriersFilterState>) => void;
  onResetFilters: () => void;
  onExportCsv: () => void;
  onRefresh: () => void;
  onOpenAddModal: () => void;
}

export const CarriersFiltersToolbar: React.FC<CarriersFiltersToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onExportCsv,
  onRefresh,
  onOpenAddModal,
}) => {
  const activeChips: { key: keyof CarriersFilterState; label: string; valueLabel: string }[] = [];

  if (filters.searchQuery) {
    activeChips.push({ key: 'searchQuery', label: 'البحث', valueLabel: filters.searchQuery });
  }
  if (filters.status !== 'all') {
    activeChips.push({
      key: 'status',
      label: 'الحالة',
      valueLabel:
        filters.status === 'active'
          ? 'نشطة تشغيلياً'
          : filters.status === 'under_review'
          ? 'قيد المراجعة'
          : 'معلقة',
    });
  }
  if (filters.state !== 'all') {
    activeChips.push({ key: 'state', label: 'الولاية', valueLabel: filters.state });
  }
  if (filters.activeTripsOnly) {
    activeChips.push({ key: 'activeTripsOnly', label: 'الرحلات', valueLabel: 'يوجد رحلات جارية' });
  }
  if (filters.linkedBrokersOnly) {
    activeChips.push({ key: 'linkedBrokersOnly', label: 'الوسطاء', valueLabel: 'مرتبطة بوسطاء' });
  }

  const handleRemoveChip = (key: keyof CarriersFilterState) => {
    if (key === 'searchQuery') onFilterChange({ searchQuery: '', page: 1 });
    else if (key === 'activeTripsOnly') onFilterChange({ activeTripsOnly: false, page: 1 });
    else if (key === 'linkedBrokersOnly') onFilterChange({ linkedBrokersOnly: false, page: 1 });
    else onFilterChange({ [key]: 'all', page: 1 });
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500">
          تصفية وبحث شركات النقل المعتمدة
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
            title="تحديث البيانات"
          >
            <span className="material-symbols-outlined text-base">sync</span>
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <span className="material-symbols-outlined text-base text-emerald-700">download</span>
            <span>تصدير (CSV)</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-base">add_business</span>
            <span>+ إضافة شركة نقل جديدة</span>
          </button>
        </div>
      </div>

      {/* Search Input & Dropdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="md:col-span-4 relative">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value, page: 1 })}
            placeholder="البحث باسم الشركة، المعرّف (TC-XXX)، السجل التجاري..."
            className="w-full h-9 pr-9 pl-3 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs rounded-lg border border-slate-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        {/* Dropdowns */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
            className="h-9 px-2 bg-slate-50 text-slate-800 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
          >
            <option value="all">حالة الشركة: الكل</option>
            <option value="active">نشطة تشغيلياً</option>
            <option value="under_review">قيد المراجعة والتدقيق</option>
            <option value="inactive">معلقة / غير نشطة</option>
          </select>

          <select
            value={filters.state}
            onChange={(e) => onFilterChange({ state: e.target.value, page: 1 })}
            className="h-9 px-2 bg-slate-50 text-slate-800 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
          >
            <option value="all">الولاية: كافة الولايات</option>
            <option value="ولاية الخرطوم">ولاية الخرطوم</option>
            <option value="ولاية نهر النيل">ولاية نهر النيل</option>
            <option value="ولاية البحر الأحمر">ولاية البحر الأحمر</option>
            <option value="الولاية الشمالية">الولاية الشمالية</option>
          </select>

          <select
            value={filters.activeTripsOnly ? 'yes' : 'all'}
            onChange={(e) => onFilterChange({ activeTripsOnly: e.target.value === 'yes', page: 1 })}
            className="h-9 px-2 bg-slate-50 text-slate-800 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
          >
            <option value="all">الرحلات: الكل</option>
            <option value="yes">رحلات جارية الآن</option>
          </select>

          <select
            value={filters.linkedBrokersOnly ? 'yes' : 'all'}
            onChange={(e) => onFilterChange({ linkedBrokersOnly: e.target.value === 'yes', page: 1 })}
            className="h-9 px-2 bg-slate-50 text-slate-800 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
          >
            <option value="all">الوسطاء: الكل</option>
            <option value="yes">مرتبطة بوسطاء</option>
          </select>
        </div>
      </div>

      {/* Applied Filters Chips */}
      {activeChips.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-500">الفلاتر المطبقة:</span>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-100 text-xs font-semibold"
              >
                <span>{chip.label}: {chip.valueLabel}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveChip(chip.key)}
                  className="hover:text-rose-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={onResetFilters}
            className="text-rose-600 hover:underline font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">filter_alt_off</span>
            <span>مسح جميع الفلاتر</span>
          </button>
        </div>
      )}
    </div>
  );
};
