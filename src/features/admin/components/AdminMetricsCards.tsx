import React from 'react';
import type { AdminMetrics } from '../types/admin';

interface AdminMetricsCardsProps {
  metrics: AdminMetrics;
}

export const AdminMetricsCards: React.FC<AdminMetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
      {/* KPI 1: Active Admins */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[128px] border border-surface-container-high/60">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
            إجمالي المشرفين الإداريين
          </span>
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[20px]">badge</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <div>
            <div className="font-tabular-stat text-tabular-stat text-on-surface">
              {metrics.totalAdmins}{' '}
              <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">مشرفاً</span>
            </div>
            <div className="font-body-sm text-body-sm text-secondary font-medium">موزعون عبر 5 قطاعات تشغيلية</div>
          </div>
          {/* Sparkline Mini Visual */}
          <svg className="w-16 h-8 text-secondary shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 32">
            <polyline points="0,24 14,20 28,14 42,18 56,8 64,10" />
          </svg>
        </div>
      </div>

      {/* KPI 2: 2FA Compliance */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[128px] border border-surface-container-high/60">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
            امتثال التحقق الثنائي (2FA/OTP)
          </span>
          <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <span className="material-symbols-outlined text-[20px]">security</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <div>
            <div className="font-tabular-stat text-tabular-stat text-secondary flex items-center gap-1.5">
              <span>{metrics.twoFactorCompliancePercent}%</span>
              <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">كافة الحسابات ملزمة ومحمية بمفتاح أمني</div>
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
              strokeDashoffset="0"
              strokeLinecap="round"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>

      {/* KPI 3: Live Sessions */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[128px] border border-surface-container-high/60">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
            الجلسات المتصلة الآن
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>بث حي</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <div>
            <div className="font-tabular-stat text-tabular-stat text-on-surface">
              {String(metrics.onlineNowCount).padStart(2, '0')}{' '}
              <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">أجهزة موثوقة</span>
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">عبر البوابة الإدارية المشفرة TLS 1.3</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">devices</span>
          </div>
        </div>
      </div>

      {/* KPI 4: Suspended / Audited Accounts */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[128px] border border-surface-container-high/60">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
            حسابات مقيدة أو معلقة
          </span>
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">lock_clock</span>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <div>
            <div className="font-tabular-stat text-tabular-stat text-on-surface">
              {String(metrics.restrictedCount).padStart(2, '0')}{' '}
              <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">حساب معلق مؤقتاً</span>
            </div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">بداعي الإجازة والتدقيق الدوري</div>
          </div>
          <span className="px-2 py-1 rounded-md bg-surface-container-highest text-on-surface-variant font-label-md text-label-md font-bold">
            {metrics.restrictedCount} قيد الحصر
          </span>
        </div>
      </div>
    </div>
  );
};
