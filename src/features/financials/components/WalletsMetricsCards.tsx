import React from 'react';
import type { WalletsLiquidityMetrics } from '../types/financials';

interface WalletsMetricsCardsProps {
  metrics: WalletsLiquidityMetrics;
  onFilterCritical: () => void;
}

export const WalletsMetricsCards: React.FC<WalletsMetricsCardsProps> = ({
  metrics,
  onFilterCritical,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Total Float Hero Emerald */}
      <div className="relative overflow-hidden rounded-xl bg-[#0E5C3E] text-white p-5 shadow-md flex flex-col justify-between">
        <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-emerald-600/30 blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-emerald-200 uppercase tracking-wider mb-1">
              إجمالي أرصدة محافظ الوكلاء المودعة (Float)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold tracking-tight tabular-nums">
                {metrics.totalFloatSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-emerald-200">ج.س</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-800 flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 mt-3 bg-black/15 -mx-5 -mb-5 px-5 py-2.5 text-xs">
          <span className="text-emerald-100">مودعة في {metrics.totalWalletsCount} محفظة وكيل معتمد</span>
          <span className="bg-emerald-300 text-emerald-950 font-bold px-2 py-0.5 rounded-full text-[11px]">
            جاهز للخصم
          </span>
        </div>
      </div>

      {/* Card 2: Today's Inflow */}
      <div className="rounded-xl bg-white p-5 border border-border shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-text-muted mb-1">إجمالي إيداعات اليوم (Top-ups)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl text-emerald-700 font-bold tracking-tight tabular-nums">
                +{metrics.todayInflowSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-emerald-700 font-bold">ج.س</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-xs">
            <span className="material-symbols-outlined text-[24px]">move_to_inbox</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 mt-1 text-xs text-text-muted">
          <span className="truncate">عبر {metrics.todayInflowCount} حوالة بنكية (بنكك/سداد)</span>
          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            12.4%+
          </span>
        </div>
      </div>

      {/* Card 3: Instant Ticket Deductions */}
      <div className="rounded-xl bg-white p-5 border border-border shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-text-muted mb-1">حجم الخصم اللحظي للتذاكر اليوم</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl text-text-primary font-bold tracking-tight tabular-nums">
                -{metrics.todayDeductionsSdg.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-text-muted">ج.س</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-surface-subtle flex items-center justify-center text-primary-dark shadow-xs">
            <span className="material-symbols-outlined text-[24px]">confirmation_number</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 mt-1 text-xs text-text-muted">
          <span>خصم آلي مقابل {metrics.todayTicketsIssuedCount.toLocaleString('en-US')} تذكرة</span>
          <span className="text-primary-dark font-semibold bg-surface-subtle px-2 py-0.5 rounded-full">
            معدل تذاكر نشط
          </span>
        </div>
      </div>

      {/* Card 4: Critical Balances Crimson Alert */}
      <div className="rounded-xl bg-[#ffdadb] text-[#8a182f] p-5 border border-red-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#8a182f] mb-1">تنبيه الحد الأدنى للرصيد</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl text-red-700 font-bold tracking-tight tabular-nums">
                {metrics.criticalWalletsCount}
              </span>
              <span className="text-sm font-bold text-red-800">محفظة حرجة</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-700 text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 mt-1 text-xs">
          <span className="text-[#8a182f] font-medium truncate max-w-[130px]">أقل من 500 ج.س</span>
          <button
            type="button"
            onClick={onFilterCritical}
            className="text-xs font-bold bg-red-700 text-white px-2.5 py-1 rounded-lg hover:bg-red-800 transition-colors shrink-0 shadow-xs"
          >
            استعراض المحافظ
          </button>
        </div>
      </div>
    </div>
  );
};
