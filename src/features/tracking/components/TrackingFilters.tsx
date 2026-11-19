import * as React from 'react';
import type { TrackingFiltersState, CorridorId } from '../types/tracking';

export interface TrackingFiltersProps {
  filters: TrackingFiltersState;
  onChange: (filters: TrackingFiltersState) => void;
  onClear: () => void;
  filteredCount: number;
  totalCount: number;
}

export const TrackingFilters: React.FC<TrackingFiltersProps> = ({
  filters,
  onChange,
  onClear,
  filteredCount,
  totalCount,
}) => {
  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.carrierId !== '' ||
    filters.corridorId !== 'all' ||
    filters.operationalStatus !== '' ||
    filters.gpsStatus !== '';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, searchQuery: e.target.value });
  };

  const handleCarrierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, carrierId: e.target.value });
  };

  const handleCorridorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, corridorId: e.target.value as CorridorId });
  };

  const handleOperationalStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, operationalStatus: e.target.value });
  };

  const handleGpsStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, gpsStatus: e.target.value });
  };

  return (
    <div
      className="bg-surface-container-lowest/95 backdrop-blur-md p-space-sm rounded-2xl shadow-card border border-outline-variant/30 flex flex-wrap items-center justify-between gap-space-sm"
      dir="rtl"
    >
      {/* Search Bar & Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="بحث برقم الحافلة (ZG-BUS)، اللوحة، أو الرحلة..."
            className="w-full h-9 pr-9 pl-3 rounded-xl bg-surface-container-low text-xs font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/40 border border-outline-variant/20 transition-all"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Carrier Dropdown */}
        <div className="relative">
          <select
            value={filters.carrierId}
            onChange={handleCarrierChange}
            aria-label="تصفية حسب شركة النقل"
            className="h-9 px-3 rounded-xl bg-surface-container-low text-xs font-medium text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-secondary/40 appearance-none pl-7 cursor-pointer"
          >
            <option value="">جميع شركات النقل</option>
            <option value="CO-NL-01">شركة النيل للنقل البري</option>
            <option value="CO-TJ-02">شركة التاج للنقل</option>
            <option value="CO-SH-03">شركة شريان الشمال</option>
            <option value="CO-AR-04">شركة أركويت إكسبريس</option>
          </select>
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Corridor Route Dropdown */}
        <div className="relative">
          <select
            value={filters.corridorId}
            onChange={handleCorridorChange}
            aria-label="تصفية حسب الممر الحيوي"
            className="h-9 px-3 rounded-xl bg-surface-container-low text-xs font-medium text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-secondary/40 appearance-none pl-7 cursor-pointer"
          >
            <option value="all">كافة المسارات الحيوية</option>
            <option value="northern">شريان الشمال (مروي / دنقلا)</option>
            <option value="port_sudan">طريق التحدي (بورتسودان)</option>
            <option value="gezira_kassala">طريق الشرق (مدني / كسلا)</option>
            <option value="western">شريان الغرب (كوستي / الأبيض)</option>
          </select>
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Operational Status Dropdown */}
        <div className="relative">
          <select
            value={filters.operationalStatus}
            onChange={handleOperationalStatusChange}
            aria-label="تصفية حسب الحالة التشغيلية"
            className="h-9 px-3 rounded-xl bg-surface-container-low text-xs font-medium text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-secondary/40 appearance-none pl-7 cursor-pointer"
          >
            <option value="">الحالة التشغيلية: الكل</option>
            <option value="moving">في الطريق (نشطة)</option>
            <option value="stopped">متوقفة بالمحطة</option>
            <option value="delayed">متأخرة</option>
          </select>
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
            expand_more
          </span>
        </div>

        {/* GPS Status Dropdown */}
        <div className="relative">
          <select
            value={filters.gpsStatus}
            onChange={handleGpsStatusChange}
            aria-label="تصفية حسب حالة الـ GPS"
            className="h-9 px-3 rounded-xl bg-surface-container-low text-xs font-medium text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-secondary/40 appearance-none pl-7 cursor-pointer"
          >
            <option value="">حالة التتبع GPS: الكل</option>
            <option value="connected">GPS متصل (4G Active)</option>
            <option value="disconnected">GPS منقطع / غير متصل</option>
          </select>
          <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] pointer-events-none">
            expand_more
          </span>
        </div>
      </div>

      {/* Filter Status & Reset Action */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-surface-container text-secondary border border-outline-variant/20">
          الحافلات المعروضة: {filteredCount} من {totalCount}
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="h-9 px-3 rounded-xl bg-error-container text-on-error-container hover:bg-red-200 font-bold text-xs transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
            <span>إلغاء التصفية</span>
          </button>
        )}
      </div>
    </div>
  );
};
