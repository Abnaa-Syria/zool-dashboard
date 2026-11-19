import * as React from 'react';
import type { BrokersMetrics } from '../types/broker';

interface BrokersMetricsCardsProps {
  metrics: BrokersMetrics;
  onLowBalanceClick?: () => void;
}

export const BrokersMetricsCards: React.FC<BrokersMetricsCardsProps> = ({
  metrics,
  onLowBalanceClick,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Brokers */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              إجمالي مكاتب الوسطاء
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-slate-900">
                {metrics.totalBrokers}
              </span>
              <span className="text-xs text-slate-500">مكتب معتمد</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <span className="material-symbols-outlined text-[22px]">storefront</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 text-emerald-700 text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
          <span>+18 مكتباً جديداً هذا الربع</span>
        </div>
      </div>

      {/* Card 2: Active Brokers */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              المكاتب النشطة تشغيلياً
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-slate-900">
                {metrics.activeBrokers}
              </span>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                95.5% تشغيل
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{metrics.totalBrokers - metrics.activeBrokers} مكاتب موقوفة مؤقتاً</span>
          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '95.5%' }} />
          </div>
        </div>
      </div>

      {/* Card 3: Today's Sales (Institutional Emerald Hero) */}
      <div className="bg-[#003B27] text-white rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="text-xs font-semibold text-emerald-200 block mb-1">
              إجمالي مبيعات اليوم
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-bold">
                {metrics.todaySalesSdg.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-300">ج.س</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-900/60 flex items-center justify-center text-emerald-300">
            <span className="material-symbols-outlined text-[22px]">payments</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-emerald-800/80 flex items-center justify-between text-xs text-emerald-200 relative z-10">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
            <span>عبر {metrics.todayTicketsIssued.toLocaleString()} تذكرة مصدرة</span>
          </span>
          <span className="text-emerald-300 font-bold font-mono">+14.2%</span>
        </div>
      </div>

      {/* Card 4: Low Balance Alert */}
      <div
        onClick={onLowBalanceClick}
        className={`bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between transition-all ${
          onLowBalanceClick ? 'cursor-pointer hover:border-amber-300 hover:shadow-md' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              تنبيه الرصيد الأدنى للمحفظة
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-[#8E1B32]">
                {metrics.lowBalanceCount}
              </span>
              <span className="text-xs font-semibold text-[#8E1B32]">مكتب يحتاج شحن</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-[#8E1B32]">
            <span className="material-symbols-outlined text-[22px]">notification_important</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-[#8E1B32] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#8E1B32] animate-ping" />
          <span>رصيد &lt; 500 ج.س (خطر توقف الحجز)</span>
        </div>
      </div>
    </div>
  );
};
