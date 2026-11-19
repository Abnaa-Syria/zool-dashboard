import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Vehicle, LiveTelemetry, Trip } from '../types/tracking';
import { getHeadingArabic } from '../fixtures/geoRoutes';

export interface VehicleDetailsDrawerProps {
  vehicle: Vehicle;
  telemetry: LiveTelemetry;
  trip?: Trip;
  onClose: () => void;
}

export const VehicleDetailsDrawer: React.FC<VehicleDetailsDrawerProps> = ({
  vehicle,
  telemetry,
  trip,
  onClose,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const headingInfo = React.useMemo(
    () => getHeadingArabic(telemetry.heading),
    [telemetry.heading]
  );

  const handleCopyBusCode = () => {
    navigator.clipboard.writeText(vehicle.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewFullDetails = () => {
    navigate(`/tracking/vehicles/${vehicle.id}`);
  };

  const handleViewBookingsTrip = () => {
    if (trip) {
      navigate(`/bookings?tripId=${trip.id}`);
    } else {
      navigate('/bookings');
    }
  };

  return (
    <aside
      className="absolute left-4 top-4 bottom-4 w-96 max-w-[calc(100vw-2rem)] z-[450] bg-surface-container-lowest/95 backdrop-blur-md rounded-2xl shadow-modal border border-outline-variant/30 flex flex-col overflow-hidden animate-in slide-in-from-left duration-300 pointer-events-auto"
      dir="rtl"
    >
      {/* Header Banner */}
      <div className="p-space-md border-b border-outline-variant/20 bg-surface-container-low/50 relative">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center shadow-sm shrink-0 border border-emerald-950/20">
              <span className="material-symbols-outlined text-[26px]">directions_bus</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-on-surface leading-tight font-display">
                  {vehicle.id}
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  <span>موثق</span>
                </span>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">
                لوحة الترخيص: {vehicle.plateNumber}
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق تفاصيل الحافلة"
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Carrier & Hardware Sub-bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1 font-semibold text-secondary">
            <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
            <span>{vehicle.carrierName}</span>
          </span>

          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-lowest text-secondary text-[11px] font-bold border border-surface-container-high shadow-xs">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>GPS 4G Active</span>
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between text-[11px] text-on-surface-variant">
          <span>{vehicle.model} • سعة {vehicle.capacity} راكب</span>
          <span>آخر بث: منذ {telemetry.lastPingAgeSeconds} ثانية</span>
        </div>
      </div>

      {/* Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto p-space-md space-y-space-md">
        {/* Real-time Telemetry Metrics Card */}
        <div className="p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-space-sm">
          <div className="text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">speed</span>
            <span>المؤشرات الحيوية للمركبة (Live Telemetry)</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/20 shadow-xs">
              <span className="text-[10px] text-on-surface-variant block">السرعة اللحظية</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold font-tabular-stat text-tertiary">
                  {telemetry.speed}
                </span>
                <span className="text-[10px] text-on-surface-variant">كم/ساعة</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/20 shadow-xs">
              <span className="text-[10px] text-on-surface-variant block">الاتجاه الجغرافي</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold text-on-surface">
                  {headingInfo.code} {telemetry.heading}°
                </span>
                <span className="text-[10px] text-secondary">({headingInfo.label})</span>
              </div>
            </div>
          </div>

          {/* Location Description */}
          <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/20 shadow-xs space-y-1">
            <div className="flex items-center gap-1 text-[11px] text-on-surface-variant">
              <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
              <span className="font-semibold text-on-surface">الموقع الجغرافي الدقيق:</span>
            </div>
            <div className="text-xs font-medium text-tertiary pr-5">
              {telemetry.roadLabel}
            </div>
            <div className="text-[10px] text-on-surface-variant font-mono pr-5">
              وحدة التتبع: {vehicle.deviceImei}
            </div>
          </div>

          {/* Route Distance Progress */}
          {trip && (
            <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/20 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-on-surface-variant">
                  المسافة المقطوعة: <strong className="text-on-surface">{telemetry.distanceCoveredKm} كم</strong>
                </span>
                <span className="text-on-surface-variant">
                  المتبقية: <strong className="text-primary">{telemetry.distanceRemainingKm} كم</strong>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-secondary to-tertiary rounded-full transition-all duration-500"
                  style={{ width: `${telemetry.routeProgressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                <span>{trip.origin}</span>
                <span className="font-bold text-secondary">إنجاز المسار: {telemetry.routeProgressPercent}%</span>
                <span>{trip.destination}</span>
              </div>
            </div>
          )}
        </div>

        {/* Current Trip Dossier */}
        {trip ? (
          <div className="p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">route</span>
                <span>بيانات الرحلة الحالية</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold font-mono">
                #{trip.id}
              </span>
            </div>

            <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/20 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">المسار المعتمد:</span>
                <span className="font-bold text-on-surface text-right">{trip.routeName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">الانطلاق الفعلي:</span>
                <span className="font-medium text-on-surface">{trip.actualDeparture} (مجدول: {trip.scheduledDeparture})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">الوصول التقديري:</span>
                <span className="font-bold text-primary">{trip.estimatedArrival}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">إشغال المقاعد:</span>
                <span className="font-bold text-secondary">
                  {trip.boardedPassengers} صعدوا فعلياً من أصل {trip.bookedSeats} حجز مؤكد
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-space-sm rounded-xl bg-surface-container-low text-xs text-on-surface-variant text-center">
            لا توجد رحلة نشطة مجدولة لهذه الحافلة حالياً.
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-space-md border-t border-outline-variant/30 bg-surface-container-lowest space-y-2">
        <button
          type="button"
          onClick={handleViewFullDetails}
          className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary hover:bg-brand-burgundyLight font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 group"
        >
          <span>عرض التفاصيل الكاملة للحافلة والرحلة</span>
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleViewBookingsTrip}
            className="py-2 px-3 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">confirmation_number</span>
            <span>عرض الرحلة</span>
          </button>

          <button
            type="button"
            onClick={handleCopyBusCode}
            className="py-2 px-3 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'تم النسخ!' : 'نسخ رقم الحافلة'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
