import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRefundsQueue } from '../hooks/useRefunds';
import { RefundsQueueMetricsCards } from '../components/RefundsQueueMetricsCards';
import { RefundsTable } from '../components/RefundsTable';
import { ManualOverrideDrawer } from '../components/ManualOverrideDrawer';
import type { RefundRequest } from '../types/refunds';

export const RefundsQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    requests,
    metrics,
    statusFilter,
    setStatusFilter,
    carrierFilter,
    setCarrierFilter,
    searchQuery,
    setSearchQuery,
    executeOverride,
    exportCsv,
  } = useRefundsQueue();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRequestForOverride, setSelectedRequestForOverride] = useState<RefundRequest | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenOverride = (request?: RefundRequest) => {
    setSelectedRequestForOverride(request || requests[0] || null);
    setIsDrawerOpen(true);
  };

  const handleConfirmOverride = (params: Parameters<typeof executeOverride>[0]) => {
    const res = executeOverride(params);
    setToastMessage(`تم تنفيذ الاسترداد الاستثنائي للتذكرة ${res.ticketNumber} بنجاح بقيمة ${res.approvedRefundSdg.toFixed(2)} ج.س`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="p-space-lg space-y-space-lg max-w-[1520px] mx-auto w-full">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-secondary text-on-secondary rounded-xl shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-label-lg text-sm">
            <span className="material-symbols-outlined text-[20px]">verified</span>
            {toastMessage}
          </div>
          <button onClick={() => setToastMessage(null)} className="text-on-secondary/80 hover:text-on-secondary">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Top Action Breadcrumb & Title Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container-high">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
            <a className="hover:text-secondary transition-colors" href="/reports">
              المالية والتسويات
            </a>
            <span className="material-symbols-outlined text-sm">chevron_left</span>
            <span className="text-secondary font-medium">الإلغاءات واسترداد المبالغ</span>
            <span className="material-symbols-outlined text-sm">chevron_left</span>
            <span className="text-on-surface font-semibold">طابور العمليات الاستثنائية</span>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm mt-1">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              طابور طلبات الاسترداد والإلغاء المعلقة
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-md text-label-md font-semibold">
              {metrics.pendingReviewNotice}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            إدارة طلبات استرداد التذاكر، معالجة النزاعات الميدانية، وتنفيذ بروتوكول التجاوز الإداري الفوري
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="px-3 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-2 border border-surface-container-high">
            <span className="material-symbols-outlined text-secondary text-headline-sm">account_balance_wallet</span>
            <span>
              رصيد صندوق الطوارئ:{' '}
              <strong className="font-tabular-stat text-tabular-stat text-secondary font-bold">
                {metrics.emergencyFundBalanceSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.س
              </strong>
            </span>
          </div>

          <button
            onClick={() => navigate('/refunds/policies')}
            className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container text-secondary font-label-lg text-label-lg flex items-center gap-1.5 transition-colors shadow-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>سياسات الإلغاء</span>
          </button>

          <button
            onClick={() => handleOpenOverride()}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-lg text-label-lg flex items-center gap-2 shadow-sm transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-headline-sm">bolt</span>
            <span>استرداد يدوي استثنائي</span>
          </button>
        </div>
      </div>

      {/* Metric Banner Strip */}
      <RefundsQueueMetricsCards metrics={metrics} />

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high flex flex-col md:flex-row items-center justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-space-sm w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container-high">
            <span className="text-on-surface-variant font-label-md text-xs font-semibold">الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-on-surface font-label-md text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">كافة الحالات</option>
              <option value="pending_review">قيد المراجعة والنزاع</option>
              <option value="scheduled_settlement">قيد جدولة التسوية</option>
              <option value="approved_refunded">مكتمل ومسترد</option>
              <option value="rejected">مرفوض (No-Show)</option>
            </select>
          </div>

          {/* Carrier Filter */}
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container-high">
            <span className="text-on-surface-variant font-label-md text-xs font-semibold">الشركة:</span>
            <select
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              className="bg-transparent border-none text-on-surface font-label-md text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">جميع الشركات</option>
              <option value="SAP-8802">شركة سابتكو للنقل</option>
              <option value="NIL-4421">شركة النيل للنقل البري</option>
              <option value="RFW-9920">سفريات الرفاعي والوليد</option>
              <option value="EDL-1102">شركة إيست دلتا</option>
              <option value="SHR-3004">شريان الشمال للنقل</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 md:w-72">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="بحث برقم التذكرة أو اسم المسافر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pr-9 pl-3 rounded-lg bg-surface-container-low border border-surface-container-high text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>

        {/* Export CSV Button */}
        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs transition-colors self-end md:self-auto border border-surface-container-high"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px] text-secondary">download</span>
          <span>تصدير الكشف (CSV)</span>
        </button>
      </div>

      {/* High Density Table */}
      <RefundsTable
        requests={requests}
        onOpenOverride={(req) => handleOpenOverride(req)}
      />

      {/* Manual Override Drawer */}
      <ManualOverrideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedRequest={selectedRequestForOverride}
        onConfirmOverride={handleConfirmOverride}
      />
    </div>
  );
};

export default RefundsQueuePage;
