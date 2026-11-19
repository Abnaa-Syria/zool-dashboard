import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { mockVehicles, mockTrips } from '../fixtures/trackingFixtures';
import { CORRIDOR_ROUTES } from '../fixtures/geoRoutes';
import { telemetryService } from '../services/telemetrySimulator';
import type { LiveTelemetry } from '../types/tracking';
import { MAP_CONFIG } from '../components/FleetMap';

export const VehicleDetailsPage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();

  const [activeTab, setActiveTab] = React.useState<
    'overview' | 'trip' | 'telemetry' | 'specs' | 'alerts'
  >('overview');

  const [telemetry, setTelemetry] = React.useState<LiveTelemetry | undefined>(() =>
    telemetryService.getTelemetry(vehicleId || '')
  );

  // Subscribe to live updates for this specific vehicle
  React.useEffect(() => {
    const unsub = telemetryService.subscribe((map) => {
      if (vehicleId) {
        setTelemetry(map.get(vehicleId));
      }
    });
    return () => unsub();
  }, [vehicleId]);

  const vehicle = React.useMemo(
    () => mockVehicles.find((v) => v.id.toLowerCase() === vehicleId?.toLowerCase()),
    [vehicleId]
  );

  const trip = React.useMemo(
    () => mockTrips.find((t) => t.vehicleId.toLowerCase() === vehicleId?.toLowerCase()),
    [vehicleId]
  );

  const routeDef = React.useMemo(() => {
    if (!trip) return CORRIDOR_ROUTES[0];
    return CORRIDOR_ROUTES.find((r) => r.id === trip.routeId) || CORRIDOR_ROUTES[0];
  }, [trip]);

  const pings = React.useMemo(
    () => (vehicleId ? telemetryService.getTelemetryPings(vehicleId) : []),
    [vehicleId]
  );

  // Handle invalid vehicle ID (Not Found state)
  if (!vehicle) {
    return (
      <div className="p-space-lg flex flex-col items-center justify-center min-h-[50vh] text-center" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-error-container text-error flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[36px]">directions_bus</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface">لم يتم العثور على الحافلة ({vehicleId})</h2>
        <p className="text-xs text-on-surface-variant max-w-md mt-1 mb-6">
          معرّف الحافلة غير موجود في سجلات الأسطول النشطة أو قد تم إيقاف بث الجهاز مؤقتاً.
        </p>
        <Link
          to="/tracking"
          className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-brand-burgundyLight transition-colors"
        >
          العودة إلى خريطة الأسطول
        </Link>
      </div>
    );
  }

  // Handle CSV Export
  const handleExportCsv = () => {
    const headers = 'وقت الإشارة,الإحداثيات,الموقع التقريبي على الطريق,السرعة (كم/س),الحالة,الحدث\n';
    const rows = pings
      .map(
        (p) =>
          `"${p.timestamp}","${p.coordinates[0].toFixed(4)}, ${p.coordinates[1].toFixed(4)}","${p.roadLabel}",${p.speed},"${p.operationalStatus}","${p.event || 'بث لحظي'}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `telemetry-${vehicle.id}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom vehicle marker icon for the route map
  const vehicleMarkerIcon = L.divIcon({
    className: 'zg-details-bus-icon',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; inset: 2px; border-radius: 9999px; background: rgba(34, 106, 75, 0.35); animation: zg-radar-ping 1.5s infinite;"></span>
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #003b27; border: 2.5px solid #aaf2ca; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3); transform: rotate(${telemetry?.heading || 0}deg);">
          <span class="material-symbols-outlined" style="color: #ffffff; font-size: 18px;">navigation</span>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

  return (
    <div className="flex flex-col gap-space-lg w-full animate-in fade-in-50 duration-300 select-none" dir="rtl">
      {/* 1. Breadcrumbs & Top Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-space-md rounded-2xl shadow-card border border-outline-variant/30">
        <div className="flex items-center gap-2 text-xs">
          <Link
            to={`/tracking?busId=${vehicle.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-secondary font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            <span>العودة إلى خريطة الأسطول</span>
          </Link>
          <span className="text-outline-variant">/</span>
          <span className="text-on-surface-variant font-medium">التتبع المباشر</span>
          <span className="text-outline-variant">/</span>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-tertiary font-bold font-mono">
            {vehicle.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-bold text-xs"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>تحديث البيانات اللحظية</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:bg-brand-burgundyLight transition-colors font-bold text-xs shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>طباعة تقرير الرحلة</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Vehicle Identity & Live Status Banner */}
      <div className="relative overflow-hidden bg-surface-container-lowest p-space-lg rounded-2xl shadow-card border border-outline-variant/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md relative z-10">
          <div className="flex items-start md:items-center gap-space-md">
            <div className="w-16 h-16 rounded-2xl bg-tertiary flex items-center justify-center text-on-tertiary shadow-md shrink-0 border border-emerald-950/20">
              <span className="material-symbols-outlined text-[32px]">directions_bus</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-tertiary font-display leading-tight">
                  الحافلة {vehicle.id} — {vehicle.model}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-surface-container-high font-mono text-xs font-bold text-tertiary shadow-xs">
                  {vehicle.plateNumber}
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span>في الطريق (نشطة)</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-on-surface-variant mt-1">
                <span className="flex items-center gap-1 text-secondary font-bold">
                  <span className="material-symbols-outlined text-[15px]">corporate_fare</span>
                  <span>{vehicle.carrierName}</span>
                </span>
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-secondary">alt_route</span>
                  <span>رحلة رقم: <strong className="text-on-surface font-mono">#{trip?.id || 'TRIP-983'}</strong></span>
                </span>
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-1 text-tertiary font-semibold">
                  <span className="material-symbols-outlined text-[15px]">sensors</span>
                  <span>GPS متصل (إشارة ممتازة 4G)</span>
                </span>
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-1 text-on-surface-variant font-medium">
                  <span className="material-symbols-outlined text-[15px]">schedule</span>
                  <span>آخر تحديث: {telemetry?.timestamp || '14:35:42'} (مباشر)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Tiles on Header */}
          <div className="flex items-center gap-2 bg-surface-container-low p-2 rounded-2xl self-start lg:self-center border border-outline-variant/20">
            <div className="px-4 py-2 bg-surface-container-lowest rounded-xl text-center shadow-xs border border-outline-variant/10">
              <span className="text-[10px] text-on-surface-variant block font-medium">السرعة</span>
              <span className="text-lg font-bold font-tabular-stat text-tertiary">
                {telemetry?.speed || 85} <span className="text-xs text-on-surface-variant">كم/س</span>
              </span>
            </div>
            <div className="px-4 py-2 bg-surface-container-lowest rounded-xl text-center shadow-xs border border-outline-variant/10">
              <span className="text-[10px] text-on-surface-variant block font-medium">الإنجاز</span>
              <span className="text-lg font-bold font-tabular-stat text-secondary">
                {telemetry?.routeProgressPercent || 47}%
              </span>
            </div>
            <div className="px-4 py-2 bg-surface-container-lowest rounded-xl text-center shadow-xs border border-outline-variant/10">
              <span className="text-[10px] text-on-surface-variant block font-medium">التأخير</span>
              <span className="text-lg font-bold font-tabular-stat text-primary">
                +{trip?.delayMinutes || 12} <span className="text-xs text-on-surface-variant">دقيقة</span>
              </span>
            </div>
          </div>
        </div>

        {/* Sub-navigation Tabs Strip */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto border-t border-outline-variant/20 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-tertiary text-on-tertiary shadow-sm'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            <span>نظرة عامة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trip')}
            className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition-all flex items-center gap-1.5 ${
              activeTab === 'trip'
                ? 'bg-tertiary text-on-tertiary shadow-sm'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">route</span>
            <span>الرحلة الحالية</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition-all flex items-center gap-1.5 ${
              activeTab === 'telemetry'
                ? 'bg-tertiary text-on-tertiary shadow-sm'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">timeline</span>
            <span>سجل التتبع اللحظي (Telemetry Log)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition-all flex items-center gap-1.5 ${
              activeTab === 'specs'
                ? 'bg-tertiary text-on-tertiary shadow-sm'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">commute</span>
            <span>بيانات الحافلة والمواصفات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition-all flex items-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'bg-tertiary text-on-tertiary shadow-sm'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>التنبيهات التشغيلية</span>
            <span className="px-1.5 py-0.2 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">
              1
            </span>
          </button>
        </div>
      </div>

      {/* Operational Alert Strip */}
      <div className="flex items-center justify-between gap-space-md p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-card">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
            <span className="material-symbols-outlined text-[20px]">info</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-on-surface">
              إشارة مراقبة آلية: تأخر طفيف بمقدار 12 دقيقة
            </span>
            <span className="text-[11px] text-on-surface-variant mt-0.5">
              تم تسجيل وقوف استثنائي إضافي في استراحة شندي لتزود الوقود - لا توجد عوائق أمنية أو بلاغات أعطال.
            </span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-xl bg-surface-container text-secondary text-xs font-bold shrink-0">
          تحت المتابعة الآلية
        </span>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-space-lg">
          {/* Main Grid: 2/3 Interactive Route Map & 1/3 Telemetry Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md items-start">
            {/* 2/3 Interactive Map */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/30 p-space-md flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-tertiary">map</span>
                  <span className="text-sm font-bold text-tertiary">
                    خريطة الرواق الحي ({trip?.origin} ↔ {trip?.destination})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-container font-bold text-on-surface">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <span>بث الأقمار الصناعية نشط</span>
                  </span>
                </div>
              </div>

              {/* Map Viewport */}
              <div className="relative w-full h-[440px] rounded-xl overflow-hidden border border-outline-variant/20 shadow-inner">
                {/* Distance metrics overlay */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 z-[400] pointer-events-none">
                  <div className="bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-card border border-outline-variant/30 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-[18px]">route</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant font-medium">المسافة المقطوعة</span>
                      <span className="text-sm font-bold font-tabular-stat text-tertiary">
                        {telemetry?.distanceCoveredKm || 165} <span className="text-[10px] text-on-surface-variant">كم</span>
                      </span>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-card border border-outline-variant/30 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined text-[18px]">flag</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant font-medium">المتبقي حتى الوصول</span>
                      <span className="text-sm font-bold font-tabular-stat text-on-surface">
                        {telemetry?.distanceRemainingKm || 185} <span className="text-[10px] text-on-surface-variant">كم</span>
                      </span>
                    </div>
                  </div>
                </div>

                <MapContainer
                  center={telemetry?.coordinates || [16.69, 33.43]}
                  zoom={8}
                  className="w-full h-full"
                  zoomControl={false}
                >
                  <TileLayer url={MAP_CONFIG.tileUrl} attribution={MAP_CONFIG.attribution} />

                  {/* Route Polyline */}
                  <Polyline
                    positions={routeDef.waypoints}
                    pathOptions={{ color: '#003b27', weight: 5, opacity: 0.85 }}
                  />

                  {/* Stops Markers */}
                  {trip?.stops.map((stop) => (
                    <CircleMarker
                      key={stop.id}
                      center={stop.coordinates}
                      radius={6}
                      pathOptions={{
                        fillColor: stop.status === 'completed' ? '#226a4b' : '#8e1b32',
                        fillOpacity: 1,
                        color: '#ffffff',
                        weight: 2,
                      }}
                    >
                      <Tooltip direction="bottom" offset={[0, 6]} permanent={stop.stopType === 'terminal'}>
                        <div className="font-sans text-xs font-bold" dir="rtl">{stop.name}</div>
                      </Tooltip>
                    </CircleMarker>
                  ))}

                  {/* Live Bus Marker */}
                  {telemetry && (
                    <Marker position={telemetry.coordinates} icon={vehicleMarkerIcon}>
                      <Tooltip direction="top" offset={[0, -22]} permanent>
                        <div className="font-sans font-bold text-xs" dir="rtl">
                          {vehicle.id} • {telemetry.speed} كم/س
                        </div>
                      </Tooltip>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>

            {/* 1/3 Telemetry & Diagnostics Side Panel */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-card border border-outline-variant/30 p-space-md space-y-space-md">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">sensors</span>
                  <span>التشخيص والقياس عن بعد (Telemetry)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                  مباشر
                </span>
              </div>

              {/* Speed Meter */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">السرعة اللحظية:</span>
                  <span className="text-[11px] text-on-surface-variant font-medium">حد الطريق: 100 كم/س</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-tabular-stat text-tertiary">
                    {telemetry?.speed || 85}
                  </span>
                  <span className="text-xs text-on-surface-variant">كم/س</span>
                  <span className="text-[11px] font-bold text-secondary mr-auto">ضمن النطاق الآمن</span>
                </div>
              </div>

              {/* Geocoordinates */}
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">pin_drop</span>
                  <span className="text-on-surface-variant">الإحداثيات الجغرافية:</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-on-surface" dir="ltr">
                  {telemetry ? `${telemetry.coordinates[0].toFixed(4)}° N, ${telemetry.coordinates[1].toFixed(4)}° E` : '16.6912° N, 33.4321° E'}
                </span>
              </div>

              {/* Altitude */}
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">terrain</span>
                  <span className="text-on-surface-variant">الارتفاع عن البحر:</span>
                </div>
                <span className="font-bold text-on-surface">{telemetry?.altitude || 362} متر</span>
              </div>

              {/* Engine Status */}
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">engine</span>
                  <span className="text-on-surface-variant">حالة المحرك:</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed font-bold text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span>يعمل (Ignition ON)</span>
                </span>
              </div>

              {/* Battery Voltage */}
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">bolt</span>
                  <span className="text-on-surface-variant">جهد بطارية الجهاز:</span>
                </div>
                <span className="font-mono font-bold text-on-surface">13.8V (مستقر)</span>
              </div>

              {/* SIM Card */}
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">sim_card</span>
                  <span className="text-on-surface-variant">شريحة الاتصال:</span>
                </div>
                <span className="font-semibold text-on-surface">{vehicle.simCard}</span>
              </div>

              {/* Driver info */}
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold text-xs shrink-0">
                  {vehicle.driverName.slice(0, 2)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">{vehicle.driverName}</span>
                  <span className="text-[10px] text-on-surface-variant">السائق المكلف • رخصة عامة سارية</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Summary Dossier Cards Below Map */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {/* Card 1: تفاصيل الحافلة والمركبة */}
            <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-card border border-outline-variant/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary pb-2 border-b border-outline-variant/20">
                <span className="material-symbols-outlined text-[18px]">directions_bus</span>
                <span>تفاصيل الحافلة والمركبة</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-surface-container-low rounded-xl">
                  <span className="text-[10px] text-on-surface-variant block">سنة الصنع</span>
                  <span className="font-bold text-on-surface">{vehicle.year}</span>
                </div>
                <div className="p-2 bg-surface-container-low rounded-xl">
                  <span className="text-[10px] text-on-surface-variant block">السعة الإجمالية</span>
                  <span className="font-bold text-on-surface">{vehicle.capacity} مقعد</span>
                </div>
                <div className="p-2 bg-surface-container-low rounded-xl">
                  <span className="text-[10px] text-on-surface-variant block">نظام التكييف</span>
                  <span className="font-bold text-secondary">يعمل بكفاءة</span>
                </div>
                <div className="p-2 bg-surface-container-low rounded-xl">
                  <span className="text-[10px] text-on-surface-variant block">الفحص الدوري</span>
                  <span className="font-bold text-on-surface">{vehicle.inspectionExpiry}</span>
                </div>
              </div>
              <div className="text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/20">
                رقم الشاسيه: <span className="font-mono text-on-surface font-semibold">{vehicle.chassisNumber}</span>
              </div>
            </div>

            {/* Card 2: بيانات الرحلة والجدول الزمني */}
            <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-card border border-outline-variant/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary pb-2 border-b border-outline-variant/20">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                <span>بيانات الرحلة والجدول الزمني</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-xl">
                  <span className="text-on-surface-variant text-[11px]">المسار الكلي:</span>
                  <span className="font-bold text-on-surface">{trip?.routeName || 'الخرطوم ↔ مروي (350 كم)'}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-xl">
                  <span className="text-on-surface-variant text-[11px]">المدة الزمنية المقدرة:</span>
                  <span className="font-bold text-on-surface">5 ساعات و 30 دقيقة</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-xl">
                  <span className="text-on-surface-variant text-[11px]">فارق الجدول التشغيلي:</span>
                  <span className="font-bold text-primary">+{trip?.delayMinutes || 12} دقيقة (استراحة شندي)</span>
                </div>
              </div>
              <div className="text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/20">
                وقت الانطلاق الفعلي: <strong className="text-on-surface">{trip?.actualDeparture || '09:12 ص'}</strong>
              </div>
            </div>

            {/* Card 3: ملخص المقاعد والإشغال */}
            <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-card border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-secondary pb-2 border-b border-outline-variant/20">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">airline_seat_recline_normal</span>
                  <span>ملخص المقاعد والإشغال</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px]">
                  84% مشغولة
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-surface-container-low rounded-xl text-center">
                  <span className="text-[10px] text-on-surface-variant block">المقاعد المحجوزة</span>
                  <span className="text-lg font-bold font-tabular-stat text-on-surface">
                    {trip?.bookedSeats || 21} <span className="text-xs font-normal">من {vehicle.capacity}</span>
                  </span>
                </div>
                <div className="p-2 bg-surface-container-low rounded-xl text-center">
                  <span className="text-[10px] text-on-surface-variant block">المصعدون فعلياً</span>
                  <span className="text-lg font-bold font-tabular-stat text-secondary">
                    {trip?.boardedPassengers || 18} <span className="text-xs font-normal">راكب</span>
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/20 flex items-center justify-between">
                <span>تذاكر قيد الصعود بالمحطات: <strong className="text-primary">{trip?.waypointPickup || 3}</strong></span>
                <span>مبيعات المنصة: 14</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CURRENT TRIP & STOPS SEQUENCE */}
      {activeTab === 'trip' && (
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-card border border-outline-variant/30 space-y-space-md">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-secondary">route</span>
              <h2 className="text-base font-bold text-on-surface">الخط الزمني لمحطات الرحلة (Stops Sequence)</h2>
            </div>
            <span className="px-3 py-1 rounded-xl bg-surface-container text-xs font-bold text-tertiary">
              مسار شريان الشمال المعتمد
            </span>
          </div>

          {/* Stops Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            {trip?.stops.map((stop, idx) => {
              const isCompleted = stop.status === 'completed';
              const isCurrent = stop.status === 'current';

              return (
                <div
                  key={stop.id}
                  className={`p-space-sm rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-primary-fixed/20 border-primary-container shadow-sm'
                      : isCompleted
                      ? 'bg-surface-container-low border-secondary/30'
                      : 'bg-surface-container-lowest border-outline-variant/30 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-secondary-container text-on-secondary-container'
                          : isCurrent
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {isCompleted ? 'تم المرور' : isCurrent ? 'المحطة القادمة' : 'نهاية المسار'}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant font-mono">
                      #{idx + 1}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-on-surface leading-tight mb-2">
                    {stop.name}
                  </h3>

                  <div className="space-y-1 text-xs text-on-surface-variant">
                    <div className="flex items-center justify-between">
                      <span>المجدول:</span>
                      <span className="font-medium">{stop.scheduledArrival}</span>
                    </div>
                    {stop.actualArrival && (
                      <div className="flex items-center justify-between font-bold text-secondary">
                        <span>الفعلي/المتوقع:</span>
                        <span>{stop.actualArrival}</span>
                      </div>
                    )}
                  </div>

                  {stop.notes && (
                    <p className="mt-2 text-[10px] text-on-surface-variant pt-2 border-t border-outline-variant/20">
                      {stop.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TELEMETRY LOG TABLE */}
      {activeTab === 'telemetry' && (
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-card border border-outline-variant/30 space-y-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-secondary">timeline</span>
              <div>
                <h2 className="text-base font-bold text-on-surface">سجل الإشارات اللحظية الأخير (Recent Tracking Pings)</h2>
                <span className="text-xs text-on-surface-variant">تردد الإرسال: كل 30 ثانية عبر شبكة 4G</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-secondary font-bold text-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>تصدير السجل الكامل (CSV)</span>
            </button>
          </div>

          {/* Tabular Log */}
          <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
            <table className="w-full text-right text-xs">
              <thead className="bg-surface-container text-on-surface-variant font-bold border-b border-outline-variant/30">
                <tr>
                  <th className="p-3">وقت الإشارة</th>
                  <th className="p-3">الإحداثيات الجغرافية</th>
                  <th className="p-3">الموقع التقريبي على الطريق</th>
                  <th className="p-3">السرعة المسجلة</th>
                  <th className="p-3">الحالة التشغيلية</th>
                  <th className="p-3">جودة الإشارة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {pings.map((ping) => (
                  <tr key={ping.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-3 font-mono font-bold text-on-surface">{ping.timestamp}</td>
                    <td className="p-3 font-mono text-[11px] text-on-surface-variant" dir="ltr">
                      {ping.coordinates[0].toFixed(4)}° N, {ping.coordinates[1].toFixed(4)}° E
                    </td>
                    <td className="p-3 font-medium text-on-surface">{ping.roadLabel}</td>
                    <td className="p-3 font-bold font-tabular-stat text-tertiary">{ping.speed} كم/س</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                        {ping.event || 'سير طبيعي'}
                      </span>
                    </td>
                    <td className="p-3 text-secondary font-bold text-[11px]">ممتازة (98% - 4G)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BUS SPECS & TECHNICAL DOSSIER */}
      {activeTab === 'specs' && (
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-card border border-outline-variant/30 space-y-space-md">
          <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-[22px] text-secondary">commute</span>
            <h2 className="text-base font-bold text-on-surface">بيانات ومواصفات الحافلة الفنية</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md text-xs">
            <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2">
              <span className="font-bold text-secondary text-sm block">البيانات الميكانيكية والترخيص</span>
              <div className="flex justify-between py-1 border-b border-outline-variant/10">
                <span className="text-on-surface-variant">الناقل المشغل:</span>
                <span className="font-bold text-on-surface">{vehicle.carrierName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/10">
                <span className="text-on-surface-variant">رقم اللوحة:</span>
                <span className="font-bold font-mono text-on-surface">{vehicle.plateNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/10">
                <span className="text-on-surface-variant">رقم الهيكل (Chassis):</span>
                <span className="font-mono text-on-surface">{vehicle.chassisNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/10">
                <span className="text-on-surface-variant">انتهاء الفحص الدوري:</span>
                <span className="font-bold text-secondary">{vehicle.inspectionExpiry}</span>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2">
              <span className="font-bold text-secondary text-sm block">جهاز التتبع السلكي المعتمد</span>
              <div className="flex justify-between py-1 border-b border-outline-variant/10">
                <span className="text-on-surface-variant">موديل الجهاز:</span>
                <span className="font-mono font-bold text-on-surface">{vehicle.deviceImei}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/10">
                <span className="text-on-surface-variant">مزود شريحة البيانات:</span>
                <span className="font-bold text-on-surface">{vehicle.simCard}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/10">
                <span className="text-on-surface-variant">السائق المعتمد:</span>
                <span className="font-bold text-on-surface">{vehicle.driverName} ({vehicle.driverPhone})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/10">
                <span className="text-on-surface-variant">حالة التكييف والسلامة:</span>
                <span className="font-bold text-secondary">معتمد ومطابق لمواصفات النقل القومي</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: OPERATIONAL ALERTS */}
      {activeTab === 'alerts' && (
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-card border border-outline-variant/30 space-y-space-md">
          <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-[22px] text-error">warning</span>
            <h2 className="text-base font-bold text-on-surface">سجل التنبيهات التشغيلية والمراقبة</h2>
          </div>

          <div className="p-space-md rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>تنبيه تأخير طفيف بمقدار 12 دقيقة</span>
              <span>11:50 ص</span>
            </div>
            <p className="text-xs text-amber-800">
              تم تسجيل توقف إضافي في استراحة شندي لتزود الحافلة بالوقود. تم تحديث وقت الوصول التقديري إلى 02:30 م.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
