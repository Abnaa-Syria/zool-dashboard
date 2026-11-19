import React, { useState } from 'react';
import { useTravelers } from '../hooks/useTravelers';
import { TravelersMetricsCards } from '../components/TravelersMetricsCards';
import { TravelersFiltersToolbar } from '../components/TravelersFiltersToolbar';
import { TravelersTable } from '../components/TravelersTable';
import { TravelerQuickDrawer } from '../components/TravelerQuickDrawer';
import type { Traveler } from '../types/traveler';

export const TravelersListPage: React.FC = () => {
  const {
    kpis,
    travelers,
    total,
    page,
    pageSize,
    totalPages,
    filters,
    selectedTraveler,
    setSelectedTravelerId,
    setSearchQuery,
    setAccountStatus,
    setVerificationStatus,
    setBookingActivity,
    setMainCity,
    setPage,
    setPageSize,
    resetFilters,
    refresh,
    updateAccountStatus,
    downloadCsv,
  } = useTravelers();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  const handleOpenDrawer = (traveler: Traveler) => {
    setSelectedTravelerId(traveler.id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTravelerId(null);
  };

  const handleSuspendToggle = (traveler: Traveler) => {
    const nextStatus = traveler.accountStatus === 'suspended' ? 'active' : 'suspended';
    const reason =
      nextStatus === 'suspended'
        ? 'تم التعليق يدوياً عبر قائمة المعاينة السريعة'
        : 'تم رفع التعليق واستعادة الحساب النشط';
    updateAccountStatus(traveler.id, nextStatus, reason);
  };

  const handleFilterPendingVerification = () => {
    setVerificationStatus('pending');
  };

  return (
    <div className="w-full min-h-screen bg-surface p-6 font-body-md text-text-primary" dir="rtl">
      {/* Page Header & Command Bar */}
      <div className="flex flex-col gap-5 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-primary-dark text-xs mb-1">
              <span>الرئيسية والعمليات</span>
              <span className="material-symbols-outlined text-[14px]">arrow_back_ios</span>
              <span className="font-semibold text-emerald-900">حسابات المسافرين</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">
                حسابات المسافرين
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                128.4 ألف مسجل
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              إدارة ومتابعة سجلات المسافرين، التحقق من الهويات، ونشاط الحجوزات عبر تطبيق العميل
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white text-primary-dark hover:bg-surface-subtle transition-all border border-border shadow-xs text-xs font-semibold"
            >
              <span
                className={`material-symbols-outlined text-[18px] transition-transform duration-700 ${
                  isRefreshing ? 'rotate-180 text-emerald-600' : ''
                }`}
              >
                sync
              </span>
              <span>تحديث البيانات</span>
            </button>

            <button
              type="button"
              onClick={downloadCsv}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary-dark hover:bg-emerald-900 text-white transition-colors shadow-xs text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>تصدير الكشف (CSV/Excel)</span>
            </button>
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        <TravelersMetricsCards
          kpis={kpis}
          onFilterPendingVerification={handleFilterPendingVerification}
        />
      </div>

      {/* Search & Multi-Filter Control Hub */}
      <TravelersFiltersToolbar
        filters={filters}
        totalResults={total}
        onSearchChange={setSearchQuery}
        onAccountStatusChange={setAccountStatus}
        onVerificationStatusChange={setVerificationStatus}
        onBookingActivityChange={setBookingActivity}
        onMainCityChange={setMainCity}
        onResetFilters={resetFilters}
      />

      {/* High-Density Passenger Data Table */}
      <TravelersTable
        travelers={travelers}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onOpenQuickDrawer={handleOpenDrawer}
      />

      {/* Regulatory Compliance & Privacy Protection Banner (Mirroring Stitch _18 lines 621-637) */}
      <div className="mt-6 p-4 rounded-xl bg-surface-subtle border border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-primary-dark flex items-center justify-center shrink-0 shadow-xs border border-border">
            <span className="material-symbols-outlined text-[22px]">security</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary-dark">
              حماية وخصوصية بيانات المسافرين مشفرة بالكامل
            </span>
            <span className="text-[11px] text-text-muted leading-relaxed">
              تلتزم منصة ZoolGo بالمعايير الصارمة للائحة الوطنية لحماية البيانات الشخصية والاتصالات في
              السودان، مع تقييد الوصول لسجلات الهويات ومطابقة البصمة للمشرفين المعتمدين فقط.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-xs text-primary-dark font-bold px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200">
            ISO 27001 Compliant
          </span>
        </div>
      </div>

      {/* Slide-over Quick Drawer */}
      <TravelerQuickDrawer
        traveler={selectedTraveler}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSuspendToggle={handleSuspendToggle}
      />
    </div>
  );
};
