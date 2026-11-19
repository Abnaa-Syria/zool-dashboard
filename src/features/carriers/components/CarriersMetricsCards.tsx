import * as React from 'react';
import type { CarriersMetrics } from '../types/carrier';

interface CarriersMetricsCardsProps {
  metrics: CarriersMetrics;
}

export const CarriersMetricsCards: React.FC<CarriersMetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Carriers */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">إجمالي شركات النقل</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900">{metrics.totalCarriers}</span>
              <span className="text-xs text-slate-500">شركة مسجلة</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-800">
            <span className="material-symbols-outlined text-2xl">corporate_fare</span>
          </div>
        </div>
        <div className="mt-4 pt-1 flex items-center gap-1 text-emerald-700 text-xs font-semibold">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          <span>+3 شركات جديدة هذا الربع</span>
        </div>
      </div>

      {/* Card 2: Operational Carriers */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">الشركات النشطة تشغيلياً</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900">{metrics.activeCarriers}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                87.5% تشغيل
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
        </div>
        <div className="mt-4 pt-1 flex items-center justify-between text-slate-500 text-xs">
          <span>{metrics.underReviewCarriers} شركات قيد تدقيق الترخيص</span>
          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '87.5%' }}></div>
          </div>
        </div>
      </div>

      {/* Card 3: Active Intercity Trips Now */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">الرحلات الجارية الآن</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900">{metrics.totalActiveTripsNow}</span>
              <span className="text-xs text-slate-500">رحلة بين المدن</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-[#8E1B32]">
            <span className="material-symbols-outlined text-2xl">alt_route</span>
          </div>
        </div>
        <div className="mt-4 pt-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="text-xs font-semibold text-emerald-700">96.4% التزام بالمواعيد المجدولة</span>
        </div>
      </div>

      {/* Card 4: GPS Connected Buses (High Impact Hero in Emerald #0E5C3E) */}
      <div className="bg-emerald-900 text-white rounded-xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-200 block mb-1">الحافلات المتصلة بالـ GPS</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white">{metrics.gpsConnectedBuses}</span>
              <span className="text-xs text-emerald-200/80">من أصل {metrics.totalFleetBuses} حافلة</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-200">
            <span className="material-symbols-outlined text-2xl">satellite_alt</span>
          </div>
        </div>
        <div className="mt-4 pt-1 flex items-center justify-between text-emerald-100 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>تغطية لحظية نشطة</span>
          </span>
          <span className="font-bold font-mono">90.4%</span>
        </div>
      </div>
    </div>
  );
};
