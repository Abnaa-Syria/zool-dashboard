import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallets } from '../hooks/useFinancials';
import { WalletsMetricsCards } from '../components/WalletsMetricsCards';
import { WalletsLiquidityBuffer } from '../components/WalletsLiquidityBuffer';
import { WalletsTable } from '../components/WalletsTable';
import { WalletDepositModal } from '../components/WalletDepositModal';
import type { BrokerWalletSummary, PaymentChannel } from '../types/financials';

export const WalletsOverviewPage: React.FC = () => {
  const {
    metrics,
    wallets,
    total,
    page,
    pageSize,
    totalPages,
    filters,
    setSearchQuery,
    setStatus,
    setAgencyTier,
    setState,
    setPage,
    setPageSize,
    resetFilters,
    recordTopUp,
    downloadCsv,
  } = useWallets();

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedBrokerForTopUp, setSelectedBrokerForTopUp] = useState<BrokerWalletSummary | null>(null);

  const handleOpenTopUp = (wallet?: BrokerWalletSummary) => {
    setSelectedBrokerForTopUp(wallet || null);
    setIsDepositModalOpen(true);
  };

  const handleCloseTopUp = () => {
    setIsDepositModalOpen(false);
    setSelectedBrokerForTopUp(null);
  };

  const handleConfirmDeposit = (
    brokerId: string,
    amount: number,
    channel: PaymentChannel,
    referenceNumber: string,
    notes?: string
  ) => {
    recordTopUp(brokerId, amount, channel, referenceNumber, notes);
    handleCloseTopUp();
  };

  const statesList = [
    { value: 'all', label: 'كافة الولايات' },
    { value: 'الخرطوم', label: 'ولاية الخرطوم' },
    { value: 'البحر الأحمر', label: 'ولاية البحر الأحمر' },
    { value: 'نهر النيل', label: 'ولاية نهر النيل' },
    { value: 'الشمالية', label: 'الولاية الشمالية' },
    { value: 'القضارف', label: 'ولاية القضارف' },
  ];

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
          <span className="hover:text-secondary transition-colors">
            المالية والتسويات
          </span>
          <span className="material-symbols-outlined text-[16px] text-outline rotate-180">
            chevron_left
          </span>
          <span className="text-tertiary font-bold">
            المحافظ والمعاملات المالية
          </span>
        </nav>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md mt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary flex items-center justify-center text-on-tertiary shadow-sm">
              <span className="material-symbols-outlined text-[24px]">
                account_balance_wallet
              </span>
            </div>
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                المحافظ والسيولة التشغيلية{' '}
                <span className="font-label-md text-label-md text-outline font-normal">
                  (Wallets & Liquidity)
                </span>
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                المتابعة المركزية لأرصدة الوكلاء، حركات الشحن الاستثنائي، والحدود الائتمانية لشبكة ZoolGo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/financials/ledger"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-colors border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>سجل القيود العام</span>
            </Link>

            <Link
              to="/financials/topup-queue"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-colors border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px]">pending_actions</span>
              <span>طابور الحوالات</span>
              <span className="px-1.5 py-0.2 rounded-full text-xs bg-primary-fixed text-on-primary-fixed font-bold font-mono">
                4
              </span>
            </Link>

            <button
              onClick={downloadCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-secondary font-label-lg text-label-lg shadow-sm transition-colors border border-surface-container-high"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>تصدير CSV</span>
            </button>

            <button
              onClick={() => handleOpenTopUp()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg shadow-sm transition-all duration-150"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ تسجيل شحن رصيد استثنائي</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Cards */}
      <WalletsMetricsCards
        metrics={metrics}
        onFilterCritical={() => setStatus('critical')}
      />

      {/* 3. Liquidity Buffer Strip */}
      <WalletsLiquidityBuffer metrics={metrics} />

      {/* 4. Filter Toolbar */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Search */}
          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="font-label-lg text-label-lg text-on-surface font-semibold">
              بحث في المحافظ
            </label>
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                search
              </span>
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الكود (AG-...)، أو المدينة..."
                className="w-full h-[42px] pr-10 pl-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all outline-none border border-transparent focus:border-secondary/30"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3 flex flex-col gap-1.5">
            <label className="font-label-lg text-label-lg text-on-surface font-semibold">
              حالة المحفظة
            </label>
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-[42px] px-3 appearance-none rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all outline-none border border-transparent focus:border-secondary/30"
              >
                <option value="all">كافة الحالات</option>
                <option value="safe">آمن (Safe Float)</option>
                <option value="critical">حرج دون حد الأمان (Critical &lt; 500 SDG)</option>
                <option value="halted">متوقف مؤقتاً (Halted)</option>
              </select>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[20px]">
                expand_more
              </span>
            </div>
          </div>

          {/* Tier Filter */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="font-label-lg text-label-lg text-on-surface font-semibold">
              تصنيف الوكيل
            </label>
            <div className="relative">
              <select
                value={filters.agencyTier}
                onChange={(e) => setAgencyTier(e.target.value as any)}
                className="w-full h-[42px] px-3 appearance-none rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all outline-none border border-transparent focus:border-secondary/30"
              >
                <option value="all">كافة الفئات</option>
                <option value="A">الفئة الممتازة (Tier A)</option>
                <option value="B">الفئة المعيارية (Tier B)</option>
              </select>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[20px]">
                expand_more
              </span>
            </div>
          </div>

          {/* State Filter */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="font-label-lg text-label-lg text-on-surface font-semibold">
              الولاية
            </label>
            <div className="relative">
              <select
                value={filters.state}
                onChange={(e) => setState(e.target.value)}
                className="w-full h-[42px] px-3 appearance-none rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 transition-all outline-none border border-transparent focus:border-secondary/30"
              >
                {statesList.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[20px]">
                expand_more
              </span>
            </div>
          </div>

          {/* Reset button */}
          <div className="md:col-span-1 flex items-center justify-end">
            <button
              onClick={resetFilters}
              className="h-[42px] w-[42px] rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
              title="إعادة ضبط الفلاتر"
            >
              <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. High Density Wallets Table */}
      <WalletsTable
        wallets={wallets}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onOpenDepositModal={handleOpenTopUp}
      />

      {/* 6. Deposit Modal Dialog */}
      <WalletDepositModal
        isOpen={isDepositModalOpen}
        onClose={handleCloseTopUp}
        selectedWallet={selectedBrokerForTopUp}
        wallets={wallets}
        onConfirmDeposit={handleConfirmDeposit}
      />
    </div>
  );
};
