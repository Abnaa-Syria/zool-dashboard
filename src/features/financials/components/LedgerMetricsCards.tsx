import React from 'react';
import type { LedgerMetrics } from '../types/financials';

interface LedgerMetricsCardsProps {
  metrics: LedgerMetrics;
  onFilterPending?: () => void;
}

export const LedgerMetricsCards: React.FC<LedgerMetricsCardsProps> = ({
  metrics,
  onFilterPending,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* Hero / Main Metric */}
      <div className="bg-[#0E5C3E] text-white p-5 rounded-xl flex flex-col justify-between shadow-md relative overflow-hidden">
        <div className="absolute -left-6 -bottom-6 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-emerald-200">حجم التداول الإجمالي لليوم</span>
          <span className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">payments</span>
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight tabular-nums">
            {metrics.todayVolumeSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-emerald-200">ج.س</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-200">
          <span className="material-symbols-outlined text-[14px]">trending_up</span>
          <span>+{metrics.volumeGrowthPercent}% مقارنة بنفس التوقيت أمس</span>
        </div>
      </div>

      {/* Metric 2: Today Transactions */}
      <div className="bg-white p-5 rounded-xl border border-border shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted font-medium">إجمالي القيود المسجلة اليوم</span>
          <span className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-primary-dark">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl text-text-primary font-bold tabular-nums">
            {metrics.todayTransactionsCount.toLocaleString('en-US')}
          </span>
          <span className="text-xs text-text-muted">قيداً محاسبياً</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 w-full bg-surface-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${metrics.todayTransactionsCapacityPercent}%` }}
            />
          </div>
          <span className="text-xs text-emerald-700 font-bold tabular-nums">
            {metrics.todayTransactionsCapacityPercent}%
          </span>
        </div>
      </div>

      {/* Metric 3: Pending Settle */}
      <div className="bg-white p-5 rounded-xl border border-border shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted font-medium">قيود قيد التسوية البنكية</span>
          <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
            <span className="material-symbols-outlined text-[20px]">sync_problem</span>
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl text-amber-800 font-bold tabular-nums">
            {metrics.pendingSettlementsCount}
          </span>
          <span className="text-xs text-amber-800 font-bold">قيود معلقة</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
          <span>قيمة: {metrics.pendingSettlementsValueSdg.toLocaleString('en-US')} ج.س</span>
          {onFilterPending ? (
            <button
              type="button"
              onClick={onFilterPending}
              className="text-amber-700 font-bold hover:underline"
            >
              بانتظار التأكيد
            </button>
          ) : (
            <span className="text-amber-700 font-bold">بانتظار التأكيد</span>
          )}
        </div>
      </div>

      {/* Metric 4: Auto Match Rate */}
      <div className="bg-white p-5 rounded-xl border border-border shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted font-medium">نسبة المطابقة الآلية</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl text-emerald-700 font-bold tabular-nums">
            {metrics.autoMatchRatePercent}%
          </span>
          <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
            مطابقة تامة
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
          <span>كافة القيود مدققة وموقعة خوارزمياً</span>
        </div>
      </div>
    </div>
  );
};
