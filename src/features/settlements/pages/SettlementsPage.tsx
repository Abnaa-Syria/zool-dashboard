import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettlements } from '../hooks/useSettlements';
import { SettlementsMetricsCards } from '../components/SettlementsMetricsCards';
import { SettlementBatchesTable } from '../components/SettlementBatchesTable';
import { CarrierPayoutsTable } from '../components/CarrierPayoutsTable';
import { BrokerCommissionsTable } from '../components/BrokerCommissionsTable';
import { SettlementApprovalDrawer } from '../components/SettlementApprovalDrawer';
import type { SettlementBatch } from '../types/settlements';

export const SettlementsPage: React.FC = () => {
  const {
    batches,
    metrics,
    carrierItems,
    brokerItems,
    filters,
    applyFilters,
    approveBatch,
    creditBrokerWallet,
    disburseBrokerBank,
    disburseCarrier,
    exportBankakCsv,
    exportSummaryCsv,
  } = useSettlements();

  const [activeTab, setActiveTab] = useState<'batches' | 'carriers' | 'brokers'>('batches');
  const [selectedBatchForApproval, setSelectedBatchForApproval] = useState<SettlementBatch | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleApproveBatch = (batchId: string, approver: string, source: string) => {
    const approved = approveBatch(batchId, approver, source);
    showNotification(`تم اعتماد وصرف الدورة (${approved.id}) وتوليد الإشعار البنكي ${approved.bankReference} بنجاح!`);
    setSelectedBatchForApproval(null);
  };

  const handleCreditWallet = (brokerId: string, amount: number) => {
    creditBrokerWallet(brokerId, amount);
    showNotification(`تم إيداع مبلغ ${amount.toLocaleString('en-US')} ج.س في محفظة الوكيل (${brokerId}) بنجاح.`);
  };

  const handleDisburseBrokerBank = (brokerId: string) => {
    disburseBrokerBank(brokerId);
    showNotification(`تم تحويل عمولة الوكيل (${brokerId}) بنكياً بنجاح.`);
  };

  const handleDisburseCarrier = (carrierId: string) => {
    disburseCarrier(carrierId);
    showNotification(`تم اعتماد وصرف حصة شركة النقل (${carrierId}) بنجاح.`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Top Banner & Header Area */}
      <div className="px-space-lg pt-space-lg pb-space-md">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 font-label-md text-xs text-on-surface-variant mb-space-sm">
          <Link to="/overview" className="hover:text-secondary transition-colors">
            الرئيسية والعمليات
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          <span className="text-on-surface-variant">المالية والتسويات</span>
          <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          <span className="text-secondary font-bold">العمولات ودورات التسوية</span>
        </div>

        {/* Main Header Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md pb-space-md">
          <div>
            <div className="flex items-center gap-space-sm">
              <h1 className="font-display-md text-xl md:text-2xl text-on-surface font-bold tracking-tight">
                العمولات ودورات التسوية المالية
              </h1>
              <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-xs font-bold">
                {metrics.pendingBatchesCount} دورات معلقة
              </span>
            </div>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant mt-1 max-w-3xl leading-relaxed">
              إدارة دورات تسوية الحصص لشركات النقل البري وعمولات مكاتب الوكلاء المعتمدة، جدولة الصرف
              المصرفي المجمع، ومطابقة قيود اليومية العامة.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-space-sm shrink-0">
            <button
              type="button"
              onClick={exportSummaryCsv}
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-surface-container-lowest text-secondary hover:bg-surface-container-high transition-colors font-label-lg text-xs font-bold shadow-sm border border-surface-container-high/60 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>تصدير كشوفات التسوية (CSV)</span>
            </button>
            <Link
              to="/financials/ledger"
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary-container text-on-primary hover:opacity-95 transition-opacity font-label-lg text-xs font-bold shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>سجل القيود العامة (GL)</span>
            </Link>
          </div>
        </div>

        {/* Floating Notification */}
        {notification && (
          <div className="mb-4 p-3 bg-secondary-container text-on-secondary-container rounded-xl flex items-center justify-between font-label-md text-xs font-bold shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{notification}</span>
            </div>
            <button type="button" onClick={() => setNotification(null)} className="cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Metrics */}
      <div className="px-space-lg">
        <SettlementsMetricsCards metrics={metrics} />
      </div>

      {/* Tabs & Content Area */}
      <div className="px-space-lg pb-space-xl space-y-space-md">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-surface-container-high/60">
          <button
            type="button"
            onClick={() => setActiveTab('batches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-lg text-xs transition-all cursor-pointer ${
              activeTab === 'batches'
                ? 'bg-secondary text-on-secondary font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
            <span>دورات التسوية المجمعة ({batches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('carriers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-lg text-xs transition-all cursor-pointer ${
              activeTab === 'carriers'
                ? 'bg-secondary text-on-secondary font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">directions_bus</span>
            <span>حصص شركات النقل ({carrierItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('brokers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-lg text-xs transition-all cursor-pointer ${
              activeTab === 'brokers'
                ? 'bg-secondary text-on-secondary font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            <span>عمولات مكاتب الوكلاء ({brokerItems.length})</span>
          </button>
        </div>

        {/* Tab View Render */}
        {activeTab === 'batches' && (
          <SettlementBatchesTable
            batches={batches}
            filters={filters}
            onFilterChange={applyFilters}
            onSelectBatchForApproval={(b) => setSelectedBatchForApproval(b)}
            onExportBankakCsv={exportBankakCsv}
            onExportSummaryCsv={exportSummaryCsv}
          />
        )}

        {activeTab === 'carriers' && (
          <CarrierPayoutsTable
            items={carrierItems}
            onDisburseCarrier={handleDisburseCarrier}
          />
        )}

        {activeTab === 'brokers' && (
          <BrokerCommissionsTable
            items={brokerItems}
            onCreditWallet={handleCreditWallet}
            onDisburseBank={handleDisburseBrokerBank}
          />
        )}
      </div>

      {/* Approval Drawer */}
      <SettlementApprovalDrawer
        batch={selectedBatchForApproval}
        isOpen={Boolean(selectedBatchForApproval)}
        onClose={() => setSelectedBatchForApproval(null)}
        onApprove={handleApproveBatch}
      />
    </div>
  );
};
