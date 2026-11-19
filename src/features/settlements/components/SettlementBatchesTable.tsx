import React from 'react';
import type { SettlementBatch } from '../types/settlements';
import type { SettlementFilters } from '../services/settlementService';

interface SettlementBatchesTableProps {
  batches: SettlementBatch[];
  filters: SettlementFilters;
  onFilterChange: (filters: Partial<SettlementFilters>) => void;
  onSelectBatchForApproval: (batch: SettlementBatch) => void;
  onExportBankakCsv: (batchId: string) => void;
  onExportSummaryCsv: () => void;
}

export const SettlementBatchesTable: React.FC<SettlementBatchesTableProps> = ({
  batches,
  filters,
  onFilterChange,
  onSelectBatchForApproval,
  onExportBankakCsv,
  onExportSummaryCsv,
}) => {
  const getStatusBadge = (status: SettlementBatch['status']) => {
    switch (status) {
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            بانتظار الاعتماد المالي
          </span>
        );
      case 'disbursed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-semibold">
            <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
            تم الصرف والتحويل
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-md text-xs font-medium">
            <span className="material-symbols-outlined text-[14px]">check</span>
            معتمدة للصرف
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-md text-xs">
            مسودة
          </span>
        );
    }
  };

  const getTypeLabel = (type: SettlementBatch['type']) => {
    switch (type) {
      case 'carrier_payout':
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed font-label-md text-xs font-semibold">
            حصص شركات النقل
          </span>
        );
      case 'broker_commission':
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-surface-container-highest text-on-surface font-label-md text-xs font-semibold">
            عمولات مكاتب الوكلاء
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md bg-surface-container-high text-on-surface font-label-md text-xs">
            تسوية مجمعة مختلطة
          </span>
        );
    }
  };

  return (
    <div className="space-y-space-md">
      {/* Filtering Toolbar */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high/60">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-space-md">
          {/* Search Field */}
          <div className="relative w-full lg:max-w-md">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="search"
              value={filters.searchQuery || ''}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="البحث برقم الدورة، البنك، أو عنوان التسوية..."
              className="w-full h-10 pr-9 pl-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant text-xs border border-transparent focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Filters & Export */}
          <div className="flex flex-wrap items-center gap-space-sm w-full lg:w-auto">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={filters.status || 'all'}
                onChange={(e) => onFilterChange({ status: e.target.value })}
                className="h-10 pr-3 pl-8 rounded-lg bg-surface-container-low text-on-surface font-label-md text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer border border-transparent"
              >
                <option value="all">كافة الحالات</option>
                <option value="pending_approval">معلقة للاعتماد</option>
                <option value="disbursed">تم الصرف والتحويل</option>
              </select>
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={filters.type || 'all'}
                onChange={(e) => onFilterChange({ type: e.target.value })}
                className="h-10 pr-3 pl-8 rounded-lg bg-surface-container-low text-on-surface font-label-md text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer border border-transparent"
              >
                <option value="all">كافة أنواع التسويات</option>
                <option value="carrier_payout">حصص شركات النقل</option>
                <option value="broker_commission">عمولات مكاتب الوكلاء</option>
              </select>
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>

            {/* Reset Filters */}
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: '', status: 'all', type: 'all' })}
              className="h-10 px-3 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-dim transition-colors font-label-md text-xs flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>إعادة ضبط</span>
            </button>

            {/* Export Summary CSV */}
            <button
              type="button"
              onClick={onExportSummaryCsv}
              className="h-10 px-4 rounded-lg bg-surface-container-lowest text-secondary hover:bg-surface-container-high transition-colors font-label-md text-xs font-bold border border-surface-container-high/60 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>تصدير تقرير التسويات (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* High-Density Batches Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container-high/60">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-xs h-12 border-b border-surface-container-high">
                <th className="px-space-md py-3 text-right">كود وعنوان دورة التسوية</th>
                <th className="px-space-md py-3 text-right">فترة التسوية والتذاكر</th>
                <th className="px-space-md py-3 text-right">النوع والبنك المستهدف</th>
                <th className="px-space-md py-3 text-right">إجمالي المبيعات</th>
                <th className="px-space-md py-3 text-right">الصافي المعتمد للصرف</th>
                <th className="px-space-md py-3 text-right">حالة الاعتماد</th>
                <th className="px-space-md py-3 text-center sticky left-0 bg-surface-container-low shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] z-10 min-w-[140px]">
                  إجراءات الصرف والملفات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface font-body-sm text-xs">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2 block">
                      currency_exchange
                    </span>
                    لا توجد دورات تسوية مطابقة للبحث.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="h-18 hover:bg-surface-container-low/60 transition-colors group">
                    {/* Batch Title & ID */}
                    <td className="px-space-md py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0 font-bold">
                          <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-on-surface text-xs truncate">
                              {batch.title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-mono text-[10px] font-bold">
                              {batch.id}
                            </span>
                          </div>
                          <span className="text-[11px] text-on-surface-variant block mt-0.5">
                            {batch.notes}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Period & Tickets */}
                    <td className="px-space-md py-3">
                      <span className="text-on-surface font-semibold block text-xs">
                        {batch.periodStart} — {batch.periodEnd}
                      </span>
                      <span className="text-secondary font-medium text-[11px] block mt-0.5">
                        {batch.ticketsCount} تذكرة مشمولة
                      </span>
                    </td>

                    {/* Type & Bank */}
                    <td className="px-space-md py-3">
                      <div className="space-y-1">
                        <div>{getTypeLabel(batch.type)}</div>
                        <span className="text-[11px] text-on-surface-variant block">
                          {batch.targetBank}
                        </span>
                      </div>
                    </td>

                    {/* Gross SDG */}
                    <td className="px-space-md py-3 font-mono font-medium text-xs">
                      {batch.totalGrossSdg.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      <span className="text-on-surface-variant text-[10px]">ج.س</span>
                    </td>

                    {/* Net Disbursement SDG */}
                    <td className="px-space-md py-3 font-mono font-bold text-sm text-secondary">
                      {batch.netDisbursementSdg.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      <span className="text-[10px] text-on-surface-variant font-normal">ج.س</span>
                    </td>

                    {/* Status */}
                    <td className="px-space-md py-3">{getStatusBadge(batch.status)}</td>

                    {/* Actions Sticky on Left */}
                    <td className="px-space-md py-3 text-center sticky left-0 bg-surface-container-lowest group-hover:bg-surface-container-low shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] z-10 min-w-[140px]">
                      <div className="flex items-center justify-center gap-2">
                        {batch.status === 'pending_approval' ? (
                          <button
                            type="button"
                            onClick={() => onSelectBatchForApproval(batch)}
                            className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-xs font-bold hover:bg-primary transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">price_check</span>
                            <span>اعتماد وصرف</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onExportBankakCsv(batch.id)}
                            className="px-3 py-1.5 rounded-lg bg-surface-container text-secondary font-label-md text-xs font-bold hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer"
                            title="تنزيل ملف التحويل الجماعي لبنك الخرطوم"
                          >
                            <span className="material-symbols-outlined text-[16px]">file_download</span>
                            <span>ملف بنكك</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
