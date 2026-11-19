import React from 'react';
import { Link } from 'react-router-dom';
import type { TravelerKpi } from '../types/traveler';

interface TravelersMetricsCardsProps {
  kpis: TravelerKpi;
  onFilterPendingVerification?: () => void;
}

export const TravelersMetricsCards: React.FC<TravelersMetricsCardsProps> = ({
  kpis,
  onFilterPendingVerification,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Total Registered */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-text-muted">إجمالي المسافرين المسجلين</span>
          <div className="w-9 h-9 rounded-lg bg-surface-subtle text-primary-dark flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">group</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-text-primary tabular-nums">
            {kpis.totalRegistered.toLocaleString('en-US')}
          </span>
          <span className="text-xs text-text-muted">حساب نشط ومسجل</span>
        </div>
        <div className="flex items-center gap-1.5 pt-2 border-t border-border">
          <span className="flex items-center text-primary-dark font-semibold text-xs">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            +8.4%
          </span>
          <span className="text-[11px] text-text-muted">مقارنة بالشهر الماضي</span>
        </div>
      </div>

      {/* Card 2: Active Accounts */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-text-muted">الحسابات النشطة</span>
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-primary-dark flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">person_check</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-primary-dark tabular-nums">
            {kpis.activeAccounts.toLocaleString('en-US')}
          </span>
          <span className="text-xs text-text-muted">مستخدم متفاعل</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[11px] text-text-muted">نسبة النشاط الإجمالية</span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-2 rounded-full bg-surface-subtle overflow-hidden">
              <div
                className="bg-primary-dark h-full rounded-full transition-all duration-500"
                style={{ width: `${kpis.activeAccountsRatePercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-primary-dark tabular-nums">
              {kpis.activeAccountsRatePercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: In Transit Today (Deep Emerald Accent) */}
      <div className="bg-[#0E5C3E] text-white p-4 rounded-xl shadow-md relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-emerald-100">مسافرون برحلات جارية اليوم</span>
          <div className="w-9 h-9 rounded-lg bg-emerald-800 text-emerald-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">directions_bus</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-white tabular-nums">
            {kpis.inTransitToday.toLocaleString('en-US')}
          </span>
          <span className="text-xs text-emerald-200">راكب على الطريق الآن</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-emerald-700/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs text-emerald-100">
              {kpis.activeTripsCount} رحلة نشطة عبر {kpis.activeStatesCount} ولاية
            </span>
          </div>
          <Link
            to="/tracking"
            className="text-xs text-emerald-200 underline hover:text-white transition-colors"
          >
            عرض التتبع
          </Link>
        </div>
      </div>

      {/* Card 4: Pending Identity Verification Alert (Burgundy Fixed Accent) */}
      <div className="bg-[#ffdadb] p-4 rounded-xl border border-red-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#8a182f]">مراجعة وتوثيق الهوية</span>
          <div className="w-9 h-9 rounded-lg bg-white text-[#8E1B32] flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-[#6d001e] tabular-nums">
            {kpis.pendingVerificationCount}
          </span>
          <span className="text-xs text-[#8a182f]">حساب بانتظار التدقيق</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-red-200/60">
          <span className="text-xs text-[#6d001e] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#8E1B32]">priority_high</span>
            تتطلب موافقة أمنية
          </span>
          <button
            type="button"
            onClick={onFilterPendingVerification}
            className="px-2.5 py-1 rounded-md bg-[#8E1B32] text-white text-xs font-semibold hover:bg-[#6d001e] transition-colors"
          >
            بدء التدقيق
          </button>
        </div>
      </div>
    </div>
  );
};
