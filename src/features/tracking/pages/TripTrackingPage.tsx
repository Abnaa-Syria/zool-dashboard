import * as React from 'react';
import { CircleMarker, Polyline, Tooltip } from 'react-leaflet';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { cn } from '../../../lib/utils';
import { useAuth } from '../../auth/auth-context';
import { TRIP_STATUS_LABEL, TRIP_STATUS_VARIANT } from '../../network/api';
import { useTrackedTrip, type TimelineEntry, type TrackedTrip } from '../api';
import { TrackingMap, type LatLng } from '../components/TrackingMap';
import { TripMarker } from '../components/TripMarker';
import { formatAge, isDelayed, routeLabel, signalState } from '../liveState';

const card = 'bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md';

const KIND_LABEL: Record<TimelineEntry['kind'], string> = { ORIGIN: 'الانطلاق', STOP: 'محطة توقف', DESTINATION: 'الوصول' };

const hasCoords = (e: TimelineEntry): e is TimelineEntry & { station: { lat: number; lng: number } } =>
  typeof e.station?.lat === 'number' && typeof e.station?.lng === 'number';

/** One trip: GPS trail, stations and stop timeline (polled while boarding / on the road). */
export const TripTrackingPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const trip = useTrackedTrip(tripId);
  const t = trip.data;
  const crumbs = [
    { label: 'الرئيسية والعمليات', path: '/overview' },
    { label: 'التتبع المباشر', path: '/tracking' },
    { label: t?.tripNumber ?? 'رحلة' },
  ];

  if (trip.isLoading) {
    return (
      <div className="flex flex-col gap-space-md">
        <Breadcrumbs items={crumbs} />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-[480px] rounded-2xl" />
      </div>
    );
  }
  if (!t) {
    return (
      <div className="flex flex-col gap-space-md">
        <Breadcrumbs items={crumbs} />
        <ErrorState title="تعذّر تحميل تتبع الرحلة" message={errorMessage(trip.error)} onRetry={() => trip.refetch()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={crumbs} />
      <TripView trip={t} fetching={trip.isFetching} updatedAt={trip.dataUpdatedAt} refreshError={trip.isError ? trip.error : null} onRefresh={() => trip.refetch()} />
    </div>
  );
};

const TripView: React.FC<{ trip: TrackedTrip; fetching: boolean; updatedAt: number; refreshError: unknown; onRefresh: () => void }> = ({
  trip: t,
  fetching,
  updatedAt,
  refreshError,
  onRefresh,
}) => {
  const { can } = useAuth();
  const live = t.status === 'BOARDING' || t.status === 'IN_PROGRESS';
  const sig = signalState(t);
  const stations = React.useMemo(() => t.timeline.filter(hasCoords), [t.timeline]);
  const planned = React.useMemo(() => stations.map<LatLng>((e) => [e.station.lat, e.station.lng]), [stations]);
  const trail = React.useMemo<LatLng[]>(
    () => t.trail.flatMap((p) => (p.lat !== null && p.lng !== null ? [[p.lat, p.lng] as LatLng] : [])),
    [t.trail],
  );
  const fitPoints = React.useMemo<LatLng[]>(
    () => [...trail, ...planned, ...(t.position ? [[t.position.lat, t.position.lng] as LatLng] : [])],
    [trail, planned, t.position],
  );

  return (
    <>
      <PageHeader
        title={`تتبع الرحلة ${t.tripNumber ?? t.tripId.slice(-8).toUpperCase()}`}
        badge={<Badge variant={TRIP_STATUS_VARIANT[t.status]} dot>{TRIP_STATUS_LABEL[t.status]}</Badge>}
        subtitle={`${t.carrier.name} · ${routeLabel(t)}`}
        className="mb-0"
        actions={
          <>
            {updatedAt > 0 && <span className="text-xs text-on-surface-variant">آخر تحديث {formatDateTime(new Date(updatedAt).toISOString())}</span>}
            <Button variant="outline" icon="refresh" isLoading={fetching} onClick={onRefresh}>تحديث</Button>
            {can('catalog.view') && (
              <Link to={`/network/trips/${t.tripId}`}>
                <Button variant="outline" icon="event_repeat">تفاصيل الرحلة</Button>
              </Link>
            )}
          </>
        }
      />

      {!live && (
        <div role="status" className="rounded-lg px-3 py-2 text-sm bg-surface-container text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">info</span>
          الرحلة ليست في مرحلة الصعود أو على الطريق، لذا توقف التحديث التلقائي. يُعرض آخر مسار مسجّل.
        </div>
      )}
      {refreshError != null && (
        <div role="status" className="rounded-lg px-3 py-2 text-sm bg-error-container text-on-error-container">
          تعذّر آخر تحديث ({errorMessage(refreshError)}). البيانات المعروضة قد تكون قديمة.
        </div>
      )}

      <div className="grid gap-space-md grid-cols-2 lg:grid-cols-4">
        <section className={card}>
          <div className="text-xs text-on-surface-variant">التقدم</div>
          <div className="text-2xl font-bold tabular-nums">{t.progressPercent}%</div>
          <div className="mt-2 h-1.5 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full bg-secondary" style={{ width: `${t.progressPercent}%` }} />
          </div>
        </section>
        <section className={card}>
          <div className="text-xs text-on-surface-variant">الوصول المتوقع</div>
          <div className="text-lg font-bold">{formatDateTime(t.etaAt)}</div>
          {isDelayed(t) ? (
            <Badge variant="error" size="sm">متأخرة {t.delayMinutes} دقيقة</Badge>
          ) : (
            <span className="text-xs text-on-surface-variant">{t.delayMinutes > 0 ? `تأخير ${t.delayMinutes} دقيقة` : 'في الموعد'}</span>
          )}
        </section>
        <section className={card}>
          <div className="text-xs text-on-surface-variant">المسافة المتبقية</div>
          <div className="text-2xl font-bold tabular-nums">{t.remainingKm !== null ? `${t.remainingKm.toLocaleString('en-US')} كم` : '—'}</div>
          <span className="text-xs text-on-surface-variant">
            المحطة التالية: {t.nextStop ? t.nextStop.city.nameAr || t.nextStop.nameAr : '—'}
          </span>
        </section>
        <section className={card}>
          <div className="text-xs text-on-surface-variant">آخر إشارة GPS</div>
          <div className={cn('text-lg font-bold', sig === 'fresh' ? 'text-[#15803D]' : 'text-on-surface-variant')}>
            {t.position ? formatAge(t.position.ageSeconds) : 'لا يوجد موقع'}
          </div>
          <span className="text-xs text-on-surface-variant">
            {t.position
              ? `${t.position.speedKmh !== null ? `${t.position.speedKmh} كم/س` : 'السرعة غير متاحة'} · ${t.trail.length.toLocaleString('en-US')} نقطة مسجّلة`
              : 'يرسل تطبيق السائق الموقع أثناء الرحلة فقط'}
          </span>
        </section>
      </div>

      <div className="grid gap-space-md lg:grid-cols-[minmax(0,1fr)_360px]">
        <TrackingMap
          fitPoints={fitPoints}
          fitTitle="عرض كامل المسار"
          overlay={
            fitPoints.length === 0 ? (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[450] px-4 py-2 rounded-xl bg-surface-container-lowest/95 border border-outline-variant/40 shadow-card text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">location_searching</span>
                لا يوجد موقع مسجّل للرحلة ولا إحداثيات للمحطات بعد.
              </div>
            ) : undefined
          }
        >
          {planned.length > 1 && <Polyline positions={planned} pathOptions={{ color: '#8b7172', weight: 3, dashArray: '6 8', opacity: 0.8 }} />}
          {trail.length > 1 && <Polyline positions={trail} pathOptions={{ color: '#226a4b', weight: 5, opacity: 0.9 }} />}
          {stations.map((e, i) => (
            <CircleMarker
              key={`${e.station.id}-${i}`}
              center={[e.station.lat, e.station.lng]}
              radius={e.kind === 'STOP' ? 6 : 8}
              pathOptions={{ color: '#ffffff', weight: 2, fillColor: e.passed ? '#226a4b' : '#8b7172', fillOpacity: 1 }}
            >
              <Tooltip direction="top" offset={[0, -6]}>
                <div className="text-right text-xs" dir="rtl">
                  <div className="font-bold">{e.station.nameAr}</div>
                  <div className="text-on-surface-variant">{KIND_LABEL[e.kind]} · {e.passed ? 'تم المرور' : 'لم تُبلغ بعد'}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
          {t.position && <TripMarker trip={t} position={t.position} selected />}
        </TrackingMap>

        <div className="flex flex-col gap-space-md">
          <section className={`${card} text-sm flex flex-col gap-2`}>
            <h2 className="font-bold">الحافلة والسائق</h2>
            <div className="flex justify-between gap-2">
              <span className="text-on-surface-variant">الحافلة</span>
              {t.vehicle ? (
                can('fleet.view') ? (
                  <Link to={`/fleet/vehicles/${t.vehicle.id}`} className="font-semibold text-secondary">{t.vehicle.plateNumber} — {t.vehicle.model}</Link>
                ) : (
                  <span className="font-semibold">{t.vehicle.plateNumber} — {t.vehicle.model}</span>
                )
              ) : (
                <span>غير معيّنة</span>
              )}
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-on-surface-variant">السائق</span>
              <span>{t.driver ? `${t.driver.displayName} (${t.driver.driverCode})` : 'غير معيّن'}</span>
            </div>
          </section>

          <section className={card}>
            <h2 className="font-bold text-sm mb-3">المحطات (توقيت السودان)</h2>
            <ol className="flex flex-col">
              {t.timeline.map((e, i) => (
                <li key={e.stopId ?? `${e.kind}-${i}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={cn('w-3 h-3 rounded-full mt-1 border-2', e.passed ? 'bg-secondary border-secondary' : 'bg-surface-container-lowest border-outline')} />
                    {i < t.timeline.length - 1 && <span className={cn('w-0.5 flex-1 min-h-6', e.passed ? 'bg-secondary' : 'bg-outline-variant/50')} />}
                  </div>
                  <div className="pb-3 text-sm flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{e.station ? e.station.nameAr : 'محطة غير محددة'}</span>
                      <span className="text-[11px] text-on-surface-variant">{KIND_LABEL[e.kind]}</span>
                    </div>
                    {e.station && <div className="text-xs text-on-surface-variant">{e.station.city.nameAr}</div>}
                    <div className="text-xs mt-0.5">
                      <span className="text-on-surface-variant">المجدول: </span>{formatDateTime(e.scheduledAt)}
                      {e.actualAt && (
                        <>
                          <span className="text-on-surface-variant"> · الفعلي: </span>
                          <span className="text-[#15803D] font-semibold">{formatDateTime(e.actualAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </>
  );
};
