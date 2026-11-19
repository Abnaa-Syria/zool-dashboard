import * as React from 'react';
import { useBrokers, useTopUpBrokerWallet } from '../hooks/useBrokers';
import { BrokersMetricsCards } from '../components/BrokersMetricsCards';
import { BrokersFiltersToolbar } from '../components/BrokersFiltersToolbar';
import { BrokersTable } from '../components/BrokersTable';
import { AddBrokerModal } from '../components/AddBrokerModal';
import { TopUpWalletModal } from '../components/TopUpWalletModal';
import { brokerService } from '../services/brokerService';
import { mockBrokersMetrics } from '../fixtures/brokerFixtures';
import type { BrokerOffice, BrokersFilterState } from '../types/broker';

export const BrokersListPage: React.FC = () => {
  const [filters, setFilters] = React.useState<BrokersFilterState>({
    searchQuery: '',
    state: 'all',
    status: 'all',
    carrierId: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading, refetch } = useBrokers(filters);
  const brokers = data?.brokers || [];
  const totalCount = data?.totalCount || 0;
  const filteredCount = data?.filteredCount || 0;
  const metrics = data?.metrics || mockBrokersMetrics;

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [selectedBrokerForTopUp, setSelectedBrokerForTopUp] = React.useState<BrokerOffice | null>(
    null
  );

  const topUpMutation = useTopUpBrokerWallet();

  const handleFilterChange = (newFilters: Partial<BrokersFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      state: 'all',
      status: 'all',
      carrierId: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      pageSize: 10,
    });
  };

  const handleExportCsv = () => {
    brokerService.exportBrokersCsv(brokers);
  };

  const handleTopUpConfirm = async (
    amount: number,
    _paymentMethod: string,
    reference: string,
    notes?: string
  ) => {
    if (!selectedBrokerForTopUp) return;
    await topUpMutation.mutateAsync({
      brokerId: selectedBrokerForTopUp.id,
      amount,
      transactionRef: reference,
      notes,
    });
    setSelectedBrokerForTopUp(null);
  };

  const handleFilterLowBalance = () => {
    setFilters((prev) => ({ ...prev, status: 'low_balance', page: 1 }));
  };

  return (
    <div className="p-6 max-w-[1560px] mx-auto w-full space-y-6 text-right" dir="rtl">
      {/* Sub-header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">مكاتب الوكلاء</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              {totalCount} وكيل ومكتب مرخص
            </span>
          </div>
          <p className="text-xs text-slate-500">
            متابعة شبكة وكلاء البيع المعتمدين والمحافظ اللحظية ونقاط البيع وإصدار التذاكر
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 bg-white text-slate-600 hover:text-slate-900 rounded-lg shadow-sm border border-slate-200 transition-all flex items-center justify-center"
            title="تحديث البيانات"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">sync</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white text-slate-700 hover:text-slate-900 font-semibold text-xs rounded-lg shadow-sm border border-slate-200 transition-all flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-700">download</span>
            <span>تصدير (Excel/CSV)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#003B27] hover:bg-[#002B1D] text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_business</span>
            <span>إضافة مكتب وكيل جديد</span>
          </button>
        </div>
      </div>

      {/* Low balance alert banner */}
      {metrics.lowBalanceCount > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-[#8E1B32]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] animate-pulse">
              notification_important
            </span>
            <span>
              يوجد <strong>{metrics.lowBalanceCount} مكاتب وكلاء</strong> برصيد أقل من حد
              الأمان الأدنى (500.00 ج.س). يتطلب شحن المحافظ فورياً لتجنب إيقاف إصدار التذاكر.
            </span>
          </div>
          <button
            onClick={handleFilterLowBalance}
            className="px-3 py-1 bg-[#8E1B32] text-white rounded-lg font-semibold hover:bg-[#6D001E] transition-colors"
          >
            عرض المكاتب المتأثرة
          </button>
        </div>
      )}

      {/* 4 Summary Metrics (Bento Style Cards) */}
      <BrokersMetricsCards
        metrics={metrics}
        onLowBalanceClick={handleFilterLowBalance}
      />

      {/* Search & Filters Toolbar */}
      <BrokersFiltersToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Brokers Data Table */}
      <BrokersTable
        brokers={brokers}
        totalCount={totalCount}
        filteredCount={filteredCount}
        filters={filters}
        onFilterChange={handleFilterChange}
        onTopUpClick={(b) => setSelectedBrokerForTopUp(b)}
        isLoading={isLoading}
      />

      {/* Modals */}
      <AddBrokerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data) => {
          await brokerService.addBroker(data);
          refetch();
        }}
      />

      <TopUpWalletModal
        isOpen={!!selectedBrokerForTopUp}
        broker={selectedBrokerForTopUp}
        onClose={() => setSelectedBrokerForTopUp(null)}
        onTopUp={handleTopUpConfirm}
      />
    </div>
  );
};
