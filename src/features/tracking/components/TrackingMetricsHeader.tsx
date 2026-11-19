import * as React from 'react';
import type { FleetTrackingMetrics } from '../types/tracking';
import { telemetryService } from '../services/telemetrySimulator';

export interface TrackingMetricsHeaderProps {
  metrics: FleetTrackingMetrics;
  onRefresh?: () => void;
}

export const TrackingMetricsHeader: React.FC<TrackingMetricsHeaderProps> = ({
  metrics,
  onRefresh,
}) => {
  const [isPaused, setIsPaused] = React.useState(telemetryService.isPaused());
  const [speedMultiplier, setSpeedMultiplier] = React.useState(telemetryService.getSpeedMultiplier());

  const handleTogglePause = () => {
    const paused = telemetryService.togglePause();
    setIsPaused(paused);
  };

  const handleSpeedChange = (mult: number) => {
    telemetryService.setSpeedMultiplier(mult);
    setSpeedMultiplier(mult);
  };

  return (
    <div className="flex flex-col gap-3" dir="rtl">
      {/* Title & Live Status Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-surface-container-lowest p-space-md rounded-2xl shadow-card border border-outline-variant/30">
        <div className="flex items-center gap-space-sm">
          <div className="w-11 h-11 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[24px]">share_location</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-on-surface font-display leading-tight">
                التتبع المباشر للأسطول (Sudan Live GIS)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>بث حي مستمر</span>
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">
              متابعة مواقع الحافلات والرحلات الجارية بين المدن السودانية لحظياً مع مؤشرات السرعة والجدولة
            </p>
          </div>
        </div>

        {/* Simulation Controls & Label */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          {/* Simulation Watermark Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-secondary text-xs font-bold border border-secondary/20 shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-secondary">model_training</span>
            <span>محاكاة تتبع — بيانات تجريبية</span>
            <span className="text-[10px] text-on-surface-variant px-1 rounded bg-surface-container-highest">
              ({speedMultiplier}x)
            </span>
          </div>

          {/* Pause / Resume Simulator */}
          <button
            type="button"
            onClick={handleTogglePause}
            title={isPaused ? 'استئناف المحاكاة' : 'إيقاف مؤقت للمحاكاة'}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border shadow-xs ${
              isPaused
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high border-outline-variant/30'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPaused ? 'play_arrow' : 'pause'}
            </span>
            <span>{isPaused ? 'استئناف' : 'إيقاف مؤقت'}</span>
          </button>

          {/* Speed Toggle Options */}
          <div className="flex items-center bg-surface-container rounded-xl p-0.5 border border-outline-variant/30">
            {[1, 5, 15].map((mult) => (
              <button
                key={mult}
                type="button"
                onClick={() => handleSpeedChange(mult)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  speedMultiplier === mult
                    ? 'bg-secondary text-on-secondary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {mult}x
              </button>
            ))}
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              title="تحديث الإشارات اللحظية"
              className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip matching Stitch _12 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* 1. المرصودة */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[18px]">directions_bus</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-medium">المرصودة</span>
            <span className="text-base font-bold font-tabular-stat text-on-surface leading-tight">
              {metrics.totalMonitored}
            </span>
          </div>
        </div>

        {/* 2. في رحلة نشطة */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <span className="w-3 h-3 rounded-full bg-secondary shrink-0 ring-2 ring-secondary/20" />
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-medium">في رحلة نشطة</span>
            <span className="text-base font-bold font-tabular-stat text-secondary leading-tight">
              {metrics.activeOnRoute}
            </span>
          </div>
        </div>

        {/* 3. محطة / توقف */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <span className="w-3 h-3 rounded-full bg-tertiary shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-medium">محطة / توقف</span>
            <span className="text-base font-bold font-tabular-stat text-tertiary leading-tight">
              {metrics.stoppedAtStation}
            </span>
          </div>
        </div>

        {/* 4. متأخرة */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-medium">متأخرة</span>
            <span className="text-base font-bold font-tabular-stat text-amber-700 leading-tight">
              {metrics.delayed}
            </span>
          </div>
        </div>

        {/* 5. تنبيه تشغيلي */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <span className="w-3 h-3 rounded-full bg-error shrink-0 ring-2 ring-error/20" />
          <div className="flex flex-col">
            <span className="text-[10px] text-error font-medium">تنبيه تشغيلي</span>
            <span className="text-base font-bold font-tabular-stat text-error leading-tight">
              {metrics.operationalAlerts}
            </span>
          </div>
        </div>

        {/* 6. GPS منقطع */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
          <span className="w-3 h-3 rounded-full bg-outline shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-medium">GPS منقطع</span>
            <span className="text-base font-bold font-tabular-stat text-on-surface-variant leading-tight">
              {metrics.gpsDisconnected}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
