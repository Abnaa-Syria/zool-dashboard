import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGeneralLedger } from '../hooks/useFinancials';
import { LedgerMetricsCards } from '../components/LedgerMetricsCards';
import { LedgerFiltersToolbar } from '../components/LedgerFiltersToolbar';
import { LedgerTable } from '../components/LedgerTable';

export const GeneralLedgerPage: React.FC = () => {
  const {
    metrics,
    entries,
    total,
    page,
    pageSize,
    totalPages,
    filters,
    setSearchQuery,
    setTransactionType,
    setTargetParty,
    setDateRange,
    setPage,
    setPageSize,
    resetFilters,
    downloadCsv,
    refresh,
  } = useGeneralLedger();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full gap-space-lg p-space-lg">
      {/* 1. Breadcrumbs & Header */}
      <div className="flex flex-col gap-space-sm">
        <nav className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
          <Link to="/overview" className="hover:text-secondary transition-colors">
            الرئيسية والعمليات
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline rotate-180">
            chevron_left
          </span>
          <Link to="/financials/wallets" className="hover:text-secondary transition-colors">
            المالية والتسويات
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline rotate-180">
            chevron_left
          </span>
          <Link to="/financials/wallets" className="hover:text-secondary transition-colors">
            المحافظ والمعاملات المالية
          </Link>
          <span className="material-symbols-outlined text-[16px] text-outline rotate-180">
            chevron_left
          </span>
          <span className="text-tertiary font-bold">سجل القيود العام</span>
        </nav>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md mt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary flex items-center justify-center text-on-tertiary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            </div>
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                سجل القيود والمعاملات المالية العام{' '}
                <span className="font-label-md text-label-md text-outline font-normal">
                  (Financial Ledger)
                </span>
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                دفتر الأستاذ المركزي الموحد لكافة حركات الإيداع والخصم وتوزيع العمولات والتسويات البنكية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-colors border border-surface-container-high"
            >
              <span
                className={`material-symbols-outlined text-[18px] text-outline transition-transform duration-300 ${
                  isRefreshing ? 'rotate-180 text-secondary' : ''
                }`}
              >
                refresh
              </span>
              <span>تحديث القيود ↺</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-secondary font-label-lg text-label-lg shadow-sm transition-colors border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>طباعة اليومية المالية</span>
            </button>

            <button
              onClick={downloadCsv}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg shadow-sm transition-all duration-150"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>تصدير دفتر الأستاذ (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Metrics Strip */}
      <LedgerMetricsCards metrics={metrics} />

      {/* 3. Advanced Filter & Query Bar */}
      <LedgerFiltersToolbar
        filters={filters}
        totalResults={total}
        onSearchChange={setSearchQuery}
        onTypeChange={setTransactionType}
        onPartyChange={setTargetParty}
        onDateRangeChange={setDateRange}
        onResetFilters={resetFilters}
      />

      {/* 4. Dense General Ledger Table */}
      <LedgerTable
        entries={entries}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};
