import React from 'react';
import type {
  TravelerFilterState,
  TravelerAccountStatus,
  TravelerVerificationStatus,
} from '../types/traveler';

interface TravelersFiltersToolbarProps {
  filters: TravelerFilterState;
  totalResults: number;
  onSearchChange: (val: string) => void;
  onAccountStatusChange: (status: TravelerAccountStatus | 'all') => void;
  onVerificationStatusChange: (status: TravelerVerificationStatus | 'all') => void;
  onBookingActivityChange: (activity: TravelerFilterState['bookingActivity']) => void;
  onMainCityChange: (city: string) => void;
  onResetFilters: () => void;
}

export const TravelersFiltersToolbar: React.FC<TravelersFiltersToolbarProps> = ({
  filters,
  totalResults,
  onSearchChange,
  onAccountStatusChange,
  onVerificationStatusChange,
  onBookingActivityChange,
  onMainCityChange,
  onResetFilters,
}) => {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.accountStatus !== 'all' ||
    filters.verificationStatus !== 'all' ||
    filters.bookingActivity !== 'all' ||
    filters.mainCity !== '';

  return (
    <div className="bg-white rounded-xl p-4 border border-border shadow-xs mb-4 flex flex-col gap-3">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="lg:col-span-5 relative w-full">
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">
            search
          </span>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pr-11 pl-4 rounded-lg bg-surface-subtle text-text-primary placeholder:text-text-muted text-sm font-body-md focus:outline-none focus:ring-2 focus:ring-primary-dark/20 border border-transparent focus:border-primary-dark transition-all"
            placeholder="البحث باسم المسافر، المعرف (USR-XXXX)، رقم الهاتف، أو رقم الهوية..."
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Filter: Account Status */}
          <div className="relative">
            <select
              aria-label="حالة الحساب"
              value={filters.accountStatus}
              onChange={(e) =>
                onAccountStatusChange(e.target.value as TravelerAccountStatus | 'all')
              }
              className="w-full h-11 px-3 appearance-none rounded-lg bg-surface-subtle text-text-primary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-dark/20 border border-transparent focus:border-primary-dark transition-all cursor-pointer"
            >
              <option value="all">حالة الحساب: الكل</option>
              <option value="active">نشط</option>
              <option value="suspended">معلق مؤقتاً</option>
              <option value="review">قيد المراجعة</option>
            </select>
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[18px]">
              expand_more
            </span>
          </div>

          {/* Filter: Identity Verification */}
          <div className="relative">
            <select
              aria-label="توثيق الهوية"
              value={filters.verificationStatus}
              onChange={(e) =>
                onVerificationStatusChange(e.target.value as TravelerVerificationStatus | 'all')
              }
              className="w-full h-11 px-3 appearance-none rounded-lg bg-surface-subtle text-text-primary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-dark/20 border border-transparent focus:border-primary-dark transition-all cursor-pointer"
            >
              <option value="all">توثيق الهوية: الكل</option>
              <option value="verified">موثق بالكامل</option>
              <option value="pending">بانتظار المراجعة</option>
              <option value="rejected">مرفوض</option>
              <option value="unregistered">غير مكتمل</option>
            </select>
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[18px]">
              expand_more
            </span>
          </div>

          {/* Filter: Booking Activity */}
          <div className="relative">
            <select
              aria-label="نشاط الحجز"
              value={filters.bookingActivity}
              onChange={(e) =>
                onBookingActivityChange(
                  e.target.value as TravelerFilterState['bookingActivity']
                )
              }
              className="w-full h-11 px-3 appearance-none rounded-lg bg-surface-subtle text-text-primary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-dark/20 border border-transparent focus:border-primary-dark transition-all cursor-pointer"
            >
              <option value="all">نشاط الحجز: الكل</option>
              <option value="on_road">لديه رحلات جارية</option>
              <option value="upcoming">حجز قادم</option>
              <option value="inactive">غير نشط حديثاً</option>
            </select>
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[18px]">
              expand_more
            </span>
          </div>

          {/* Filter: Main City */}
          <div className="relative">
            <select
              aria-label="المدينة الرئيسية"
              value={filters.mainCity}
              onChange={(e) => onMainCityChange(e.target.value)}
              className="w-full h-11 px-3 appearance-none rounded-lg bg-surface-subtle text-text-primary text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-dark/20 border border-transparent focus:border-primary-dark transition-all cursor-pointer"
            >
              <option value="">كافة المدن</option>
              <option value="الخرطوم">الخرطوم</option>
              <option value="بورتسودان">بورتسودان</option>
              <option value="مروي">مروي</option>
              <option value="عطبرة">عطبرة</option>
              <option value="ود مدني">ود مدني</option>
            </select>
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[18px]">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Active Filter Tags Bar */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-border flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-text-muted ml-1">الفلاتر المطبقة:</span>

            {filters.searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle text-text-primary font-medium">
                <span>
                  بحث: <strong>{filters.searchQuery}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-text-muted hover:text-red-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}

            {filters.accountStatus !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle text-text-primary font-medium">
                <span>
                  الحالة:{' '}
                  <strong>
                    {filters.accountStatus === 'active'
                      ? 'نشط'
                      : filters.accountStatus === 'suspended'
                      ? 'معلق'
                      : 'قيد المراجعة'}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => onAccountStatusChange('all')}
                  className="text-text-muted hover:text-red-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}

            {filters.verificationStatus !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle text-text-primary font-medium">
                <span>
                  التوثيق:{' '}
                  <strong>
                    {filters.verificationStatus === 'verified'
                      ? 'موثق'
                      : filters.verificationStatus === 'pending'
                      ? 'بانتظار المراجعة'
                      : filters.verificationStatus === 'rejected'
                      ? 'مرفوض'
                      : 'غير مكتمل'}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => onVerificationStatusChange('all')}
                  className="text-text-muted hover:text-red-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}

            {filters.bookingActivity !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle text-text-primary font-medium">
                <span>
                  النشاط:{' '}
                  <strong>
                    {filters.bookingActivity === 'on_road'
                      ? 'رحلات جارية'
                      : filters.bookingActivity === 'upcoming'
                      ? 'حجز قادم'
                      : 'غير نشط'}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => onBookingActivityChange('all')}
                  className="text-text-muted hover:text-red-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}

            {filters.mainCity && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle text-text-primary font-medium">
                <span>
                  المدينة: <strong>{filters.mainCity}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => onMainCityChange('')}
                  className="text-text-muted hover:text-red-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={onResetFilters}
              className="text-primary-ruby hover:text-primary-dark font-semibold underline mr-2"
            >
              مسح الفلاتر
            </button>
          </div>

          <div className="flex items-center gap-2 text-text-muted">
            <span>
              عرض النتائج: <strong>{totalResults}</strong> مسافر
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
