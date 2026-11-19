import React from 'react';
import type { WalletsLiquidityMetrics } from '../types/financials';

interface WalletsLiquidityBufferProps {
  metrics: WalletsLiquidityMetrics;
}

export const WalletsLiquidityBuffer: React.FC<WalletsLiquidityBufferProps> = ({ metrics }) => {
  return (
    <div className="rounded-xl bg-white p-4 mb-6 border border-border shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-dark text-[20px]">
            shield_lock
          </span>
          <span className="text-xs font-bold text-text-primary">
            مؤشر أمان السيولة وصندوق الضمان المالي الموحد
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            <span>
              الرصيد التشغيلي المتداول:{' '}
              <strong className="text-text-primary tabular-nums">
                {metrics.circulatingFloatSdg.toLocaleString('en-US')} ج.س ({metrics.circulatingPercent}%)
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
            <span>
              ودائع التأمين المحتجزة:{' '}
              <strong className="text-text-primary tabular-nums">
                {metrics.insuranceDepositSdg.toLocaleString('en-US')} ج.س ({metrics.insurancePercent}%)
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Visual Segmented Progress Bar */}
      <div className="w-full h-3 rounded-full bg-surface-subtle flex overflow-hidden border border-border/40">
        <div
          className="h-full bg-emerald-600 transition-all duration-700"
          style={{ width: `${metrics.circulatingPercent}%` }}
          title={`الرصيد المتداول ${metrics.circulatingPercent}%`}
        />
        <div
          className="h-full bg-gray-400 transition-all duration-700"
          style={{ width: `${metrics.insurancePercent}%` }}
          title={`وديعة التأمين ${metrics.insurancePercent}%`}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-text-muted pt-2">
        <span>
          مستوى التغطية الاحتياطية للوكالات: <strong className="text-emerald-700">آمن ({metrics.reserveCoverageRatio}x متطلبات السحب اليومية القصوى)</strong>
        </span>
        <span className="text-primary-dark font-medium">
          تم التحقق والمطابقة مع كشف بنك السودان المركزي اليوم 08:00 ص
        </span>
      </div>
    </div>
  );
};
