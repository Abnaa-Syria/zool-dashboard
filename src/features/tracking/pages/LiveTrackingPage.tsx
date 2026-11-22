import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { cn } from '../../../lib/utils';
import { selectClass } from '../../financials/listState';
import { TRIP_STATUS_LABEL, TRIP_STATUS_VARIANT } from '../../network/api';
import { DEFAULT_POLL_SECONDS, useLiveTrips, type LiveTrip } from '../api';
import { TrackingMap, type LatLng } from '../components/TrackingMap';
import { TrackingMetricsHeader } from '../components/TrackingMetricsHeader';
import { TripMarker } from '../components/TripMarker';
import { MARKER_COLORS, formatAge, isDelayed, liveMetrics, markerTone, matchesQuery, routeLabel, signalState, type MarkerTone, type SignalState } from '../liveState';

type StatusFilter = '' | 'BOARDING' | 'IN_PROGRESS';
type SignalFilter = '' | SignalState | 'delayed';

const timeOnly = new Intl.DateTimeFormat('ar-SD', { timeZone: 'Africa/Khartoum', hour: '2-digit', minute: '2-digit', second: '2-digit' });

/**
 * Live board (D-GPS-01): every trip boarding or on the road, with the last fix sent by the driver
 * app. Polled every `pollSeconds` (15 s) — no websockets (API_CONVENTIONS §12).
 */
export const LiveTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const live = useLiveTrips();
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<StatusFilter>('');
  const [signal, setSignal] = React.useState<SignalFilter>('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const trips = React.useMemo(() => live.data ?? [], [live.data]);
  const metrics = React.useMemo(() => liveMetrics(trips), [trips]);
  const visible = React.useMemo(
    () =>
      trips.filter(
        (t) =>
          matchesQuery(t, search) &&
          (!status || t.status === status) &&
          (!signal || (signal === 'delayed' ? isDelayed(t) : signalState(t) === signal)),
      ),
    [trips, search, status, signal],
  );
  const onMap = React.useMemo(
    () => visible.filter((t): t is LiveTrip & { position: NonNullable<LiveTrip['position']> } => t.position !== null),
    [visible],
  );
  const fitPoints = React.useMemo<LatLng[]>(() => onMap.map((t) => [t.position.lat, t.position.lng]), [onMap]);
  const toneCounts = React.useMemo(() => {
    const c: Record<MarkerTone, number> = { moving: 0, boarding: 0, delayed: 0, stale: 0 };
    visible.forEach((t) => c[markerTone(t)]++);
    return c;
  }, [visible]);
  const filtered = Boolean(search.trim() || status || signal);
  const pollSeconds = trips[0]?.pollSeconds ?? DEFAULT_POLL_SECONDS;

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setSignal('');
  };

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'الرئيسية والعمليات', path: '/overview' }, { label: 'التتبع المباشر' }]} />
      <PageHeader
        title="التتبع المباشر"
        subtitle="الرحلات في مرحلة صعود الركاب أو على الطريق، بموقعها من هاتف السائق (GPS). تُحدَّث البيانات تلقائيًا."
        className="mb-0"
        badge={
          <Badge variant="info" dot>
            تحديث كل {pollSeconds} ث
          </Badge>
        }
        actions={
          <>
            {live.dataUpdatedAt > 0 && <span className="text-xs text-on-surface-variant">آخر تحديث {timeOnly.format(live.dataUpdatedAt)}</span>}
            <Button variant="outline" icon="refresh" isLoading={live.isFetching} onClick={() => live.refetch()}>
              تحديث
            </Button>
          </>
        }
      />

      {live.isLoading ? (
        <>
          <div className="grid gap-space-md grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[520px] rounded-2xl" />
        </>
      ) : live.isError && !live.data ? (
        <ErrorState title="تعذّر تحميل الرحلات النشطة" message={errorMessage(live.error)} onRetry={() => live.refetch()} />
      ) : trips.length === 0 ? (
        <EmptyState
          icon="share_location"
          title="لا توجد رحلات نشطة الآن"
          description={`تظهر الرحلات هنا تلقائيًا عندما يبدأ السائق صعود الركاب أو الانطلاق من تطبيق السائق، ويُرسل التطبيق موقع الحافلة أثناء الرحلة فقط. تتحقق الصفحة من وجود رحلات جديدة كل ${pollSeconds} ثانية.`}
          actionText="عرض الرحلات المجدولة"
          onAction={() => navigate('/network/trips')}
        />
      ) : (
        <>
          {live.isError && (
            <div role="status" className="rounded-lg px-3 py-2 text-sm bg-error-container text-on-error-container">
              تعذّر آخر تحديث ({errorMessage(live.error)}). البيانات المعروضة من {timeOnly.format(live.dataUpdatedAt)}.
            </div>
          )}
          <TrackingMetricsHeader metrics={metrics} />

          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="w-full sm:w-80">
              <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="رقم الرحلة، اللوحة، السائق، الناقل..." />
            </div>
            <select aria-label="الحالة" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className={selectClass}>
              <option value="">كل الحالات</option>
              <option value="BOARDING">{TRIP_STATUS_LABEL.BOARDING}</option>
              <option value="IN_PROGRESS">{TRIP_STATUS_LABEL.IN_PROGRESS}</option>
            </select>
            <select aria-label="الإشارة والتأخير" value={signal} onChange={(e) => setSignal(e.target.value as SignalFilter)} className={selectClass}>
              <option value="">كل الإشارات</option>
              <option value="fresh">إشارة حديثة</option>
              <option value="stale">إشارة قديمة</option>
              <option value="none">بدون موقع بعد</option>
              <option value="delayed">متأخرة فقط</option>
            </select>
            <span className="text-xs text-on-surface-variant">
              {visible.length.toLocaleString('en-US')} من {trips.length.toLocaleString('en-US')} رحلة
            </span>
            {filtered && (
              <Button variant="ghost" size="sm" icon="filter_alt_off" onClick={clearFilters}>
                مسح التصفية
              </Button>
            )}
          </div>

          <div className="grid gap-space-md lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex flex-col gap-space-sm">
              <TrackingMap
                fitPoints={fitPoints}
                fitTitle="عرض كل الحافلات على الخريطة"
                className="lg:h-[calc(100vh-24rem)] lg:min-h-[520px]"
                overlay={
                  onMap.length === 0 ? (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[450] px-4 py-2 rounded-xl bg-surface-container-lowest/95 border border-outline-variant/40 shadow-card text-xs font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">location_searching</span>
                      لم تُرسل أي من الرحلات المعروضة موقعًا بعد.
                    </div>
                  ) : undefined
                }
              >
                {onMap.map((t) => (
                  <TripMarker key={t.tripId} trip={t} position={t.position} selected={t.tripId === selectedId} onSelect={setSelectedId} />
                ))}
              </TrackingMap>
              <ul className="flex flex-wrap gap-x-space-md gap-y-1 text-xs text-on-surface-variant">
                {(Object.keys(MARKER_COLORS) as MarkerTone[]).map((tone) => (
                  <li key={tone} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: MARKER_COLORS[tone].bg }} />
                    {MARKER_COLORS[tone].label}
                    <span className="font-bold tabular-nums text-on-surface">{toneCounts[tone]}</span>
                  </li>
                ))}
              </ul>
            </div>

            <section aria-label="الرحلات النشطة" className="flex flex-col gap-space-sm lg:max-h-[calc(100vh-22rem)] lg:min-h-[520px] lg:overflow-y-auto">
              {visible.length === 0 ? (
                <EmptyState title="لا توجد رحلات مطابقة" description="غيّر البحث أو عوامل التصفية." icon="filter_alt" actionText="مسح التصفية" onAction={clearFilters} className="my-0" />
              ) : (
                visible.map((t) => <LiveTripCard key={t.tripId} trip={t} selected={t.tripId === selectedId} onSelect={() => setSelectedId(t.tripId)} />)
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
};

const LiveTripCard: React.FC<{ trip: LiveTrip; selected: boolean; onSelect: () => void }> = ({ trip: t, selected, onSelect }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const sig = signalState(t);

  // Bring the card into view when it is selected from the map.
  React.useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selected]);

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      className={cn(
        'rounded-xl border bg-surface-container-lowest p-space-sm text-sm flex flex-col gap-1.5 cursor-pointer transition-colors',
        selected ? 'border-secondary ring-2 ring-secondary/30' : 'border-surface-container-high hover:bg-surface-container/50',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{routeLabel(t)}</span>
        <Badge variant={TRIP_STATUS_VARIANT[t.status]} size="sm" dot>{TRIP_STATUS_LABEL[t.status]}</Badge>
      </div>
      <div className="text-xs text-on-surface-variant flex flex-wrap gap-x-2">
        <span>{t.carrier.name}</span>
        {t.tripNumber && <span className="font-mono" dir="ltr">{t.tripNumber}</span>}
        {t.vehicle && <span className="font-mono" dir="ltr">{t.vehicle.plateNumber}</span>}
        {t.driver && <span>· {t.driver.displayName}</span>}
      </div>
      <div className="h-1.5 rounded-full bg-surface-container overflow-hidden" aria-label={`التقدم ${t.progressPercent}%`}>
        <div className="h-full bg-secondary" style={{ width: `${t.progressPercent}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
        <span className="text-on-surface-variant">المحطة التالية</span>
        <span>{t.nextStop ? t.nextStop.city.nameAr || t.nextStop.nameAr : '—'}</span>
        <span className="text-on-surface-variant">الوصول المتوقع</span>
        <span>
          {formatDateTime(t.etaAt)}
          {t.remainingKm !== null && <span className="text-on-surface-variant"> · {t.remainingKm} كم</span>}
        </span>
        <span className="text-on-surface-variant">آخر إشارة</span>
        <span className={cn(sig === 'fresh' ? 'text-[#15803D]' : 'text-on-surface-variant')}>
          {t.position ? `${formatAge(t.position.ageSeconds)}${t.position.speedKmh !== null ? ` · ${t.position.speedKmh} كم/س` : ''}` : 'لا يوجد موقع بعد'}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        {isDelayed(t) ? <Badge variant="error" size="sm">متأخرة {t.delayMinutes} دقيقة</Badge> : <span />}
        <Link to={`/tracking/trips/${t.tripId}`} onClick={(e) => e.stopPropagation()} className="text-xs font-semibold text-secondary hover:underline">
          تفاصيل التتبع ←
        </Link>
      </div>
    </div>
  );
};
