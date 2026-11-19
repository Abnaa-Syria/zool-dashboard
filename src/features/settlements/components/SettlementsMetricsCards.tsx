import React from 'react';
import type { SettlementsMetrics } from '../types/settlements';

interface SettlementsMetricsCardsProps {
  metrics: SettlementsMetrics;
}

export const SettlementsMetricsCards: React.FC<SettlementsMetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
      {/* KPI 1: Pending Settlements SDG */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[128px] border border-surface-container-high/60">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-xs text-on-surface-variant font-semibold">
            إجمالي المبالغ المعلقة للتسوية
          </span>
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">pending_actions</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <div>
            <div className="font-tabular-stat text-xl md:text-2xl text-on-surface font-bold">
              {metrics.totalPendingSettlementsSdg.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              <span className="font-body-sm text-xs text-on-surface-variant font-normal">ج.س</span>
            </div>
            <div className="font-body-sm text-xs text-secondary font-medium mt-0.5">
              حصص شركات النقل وعمولات الوكلاء
            </div>
          </div>
          {/* Sparkline Visual */}
          <svg className="w-16 h-8 text-secondary shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 32">
            <polyline points="0,20 16,14 32,22 48,10 64,12" />
          </svg>
        </div>
      </div>

      {/* KPI 2: Pending Batches Count */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[128px] border border-surface-container-high/60">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-xs text-on-surface-variant font-semibold">
            دورات التسوية قيد الاعتماد
          </span>
          <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined text-[20px]">currency_exchange</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <div>
            <div className="font-tabular-stat text-xl md:text-2xl text-primary font-bold flex items-center gap-2">
              <span>{String(metrics.pendingBatchesCount).padStart(2, '0')}</span>
              <span className="font-body-sm text-xs text-on-surface-variant font-normal">دورات معلقة</span>
            </div>
            <div className="font-body-sm text-xs text-primary font-medium mt-0.5">
              تتطلب مصادقة المدقق المالي المزدوجة
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-md text-xs font-bold">
            {metrics.pendingBatchesCount} معلقة
          </span>
        </div>
      </div>

      {/* KPI 3: Total Settled This Month */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[128px] border border-surface-container-high/60">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-xs text-on-surface-variant font-semibold">
            مبالغ سويت وصرفت هذا الشهر
          </span>
          <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <span className="material-symbols-outlined text-[20px]">verified</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <div>
            <div className="font-tabular-stat text-xl md:text-2xl text-secondary font-bold">
              {metrics.totalSettledThisMonthSdg.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              <span className="font-body-sm text-xs text-on-surface-variant font-normal">ج.س</span>
            </div>
            <div className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              محولة لحسابات بنك الخرطوم وبنكك
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">account_balance</span>
          </div>
        </div>
      </div>

      {/* KPI 4: Reconciliation Accuracy */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[128px] border border-surface-container-high/60">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-xs text-on-surface-variant font-semibold">
            دقة المطابقة البنكية الآلية
          </span>
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">fact_check</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <div>
            <div className="font-tabular-stat text-xl md:text-2xl text-secondary font-bold flex items-center gap-1.5">
              <span>{metrics.reconciliationAccuracyPercent}%</span>
              <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
            </div>
            <div className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              تطابق تام مع قيود اليومية العامة (GL)
            </div>
          </div>
          {/* Donut SVG Ring */}
          <svg className="w-10 h-10 -rotate-90 shrink-0" viewBox="0 0 36 36">
            <circle className="text-surface-container-high" cx="18" cy="18" fill="none" r="14" stroke="currentColor" strokeWidth="3" />
            <circle
              className="text-secondary"
              cx="18"
              cy="18"
              fill="none"
              r="14"
              stroke="currentColor"
              strokeDasharray="88 88"
              strokeDashoffset="1"
              strokeLinecap="round"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
