import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatSdg } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import { SERVICE_CLASS_LABEL, stationLabel, TRIP_STATUS_LABEL, TRIP_STATUS_VARIANT, useTrip, useVehicle, type ScheduledTrip } from '../api';
import { SeatMap } from '../components/SeatMap';
import { AssignmentModal, CancelTripModal } from '../components/TripModals';
import { formatDuration, formatSudanFull, formatSudanTime } from '../time';

const card = 'bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md';

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { can } = useAuth();
  const trip = useTrip(id);
  const t = trip.data;
  const vehicle = useVehicle(t?.vehicle?.id, can('fleet.view'));
  const [modal, setModal] = React.useState<'assign' | 'cancel' | null>(null);

  const crumbs = [{ label: 'الشبكة والأسطول' }, { label: 'الرحلات والجدولة', path: '/network/trips' }, { label: t?.tripNumber ?? 'رحلة' }];

  if (trip.isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (trip.isError || !t) {
    return (
      <div className="flex flex-col gap-space-md">
        <Breadcrumbs items={crumbs} />
        <ErrorState title="تعذّر تحميل الرحلة" message={errorMessage(trip.error)} onRetry={() => trip.refetch()} />
      </div>
    );
  }

  const open = t.status !== 'COMPLETED' && t.status !== 'CANCELLED';
  const canAssign = can('catalog.manage') && open;
  const canCancel = can('catalog.manage') && can('bookings.cancel') && (t.status === 'SCHEDULED' || t.status === 'BOARDING');

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title={`رحلة ${t.tripNumber ?? t.id.slice(-8).toUpperCase()}`}
        badge={<Badge variant={TRIP_STATUS_VARIANT[t.status]} dot>{TRIP_STATUS_LABEL[t.status]}</Badge>}
        subtitle={`${t.company.name} · ${t.origin} ← ${t.destination}${t.route?.code ? ` · مسار ${t.route.code}` : ''}`}
        className="mb-0"
        actions={
          <div className="flex gap-2">
            {canAssign && <Button variant="outline" icon="swap_horiz" onClick={() => setModal('assign')}>تغيير التعيين</Button>}
            {canCancel && <Button variant="danger" icon="cancel" onClick={() => setModal('cancel')}>إلغاء مع استرداد كامل</Button>}
          </div>
        }
      />

      <div className="grid gap-space-md lg:grid-cols-3">
        <section className={`${card} grid grid-cols-2 gap-3 text-sm lg:col-span-2`}>
          <Info label="المغادرة" value={formatSudanFull(t.departureAt)} />
          <Info label="الوصول المتوقع" value={formatSudanFull(t.arrivalAt)} />
          <Info label="المدة" value={formatDuration(t.durationMinutes)} />
          <Info label="سعر المقعد" value={formatSdg(t.basePriceMinor)} />
          <Info label="فئة الخدمة" value={SERVICE_CLASS_LABEL[t.serviceClass]} />
          <Info label="البيع" value={t.isActive ? 'مفتوح' : 'متوقف'} />
        </section>
        <section className={`${card} space-y-3 text-sm`}>
          <h2 className="font-bold">الحافلة والسائق</h2>
          <Info label="الحافلة" value={t.vehicle ? `${t.vehicle.plateNumber} — ${t.vehicle.model} (${t.vehicle.capacity} مقعد)` : 'غير معيّنة'} />
          <Info label="السائق" value={t.driver ? `${t.driver.displayName} (${t.driver.driverCode})` : 'غير معيّن'} />
        </section>
      </div>

      <div className="grid gap-space-md lg:grid-cols-2">
        <section className={card}>
          <h2 className="font-bold mb-3">المحطات والأوقات (توقيت السودان)</h2>
          <StopsTimeline trip={t} />
        </section>
        <section className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="font-bold">خريطة المقاعد</h2>
            <div className="flex gap-2 text-xs">
              <Badge variant="neutral">الإجمالي {t.seatCounts.total}</Badge>
              <Badge variant="success">متاح {t.seatCounts.free}</Badge>
              <Badge variant="warning">مؤقت {t.seatCounts.held}</Badge>
              <Badge variant="secondary">مباع {t.seatCounts.sold}</Badge>
            </div>
          </div>
          {t.seats.length === 0 ? (
            <p className="text-sm text-on-surface-variant">لا توجد مقاعد.</p>
          ) : (
            <SeatMap seats={t.seats} aisleAfterColumn={vehicle.data?.seatLayout?.aisleAfterColumn} />
          )}
        </section>
      </div>

      {modal === 'assign' && <AssignmentModal trip={t} onClose={() => setModal(null)} />}
      {modal === 'cancel' && <CancelTripModal trip={t} onClose={() => setModal(null)} />}
    </div>
  );
};

const Info: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div className="text-xs text-on-surface-variant">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);

const StopsTimeline: React.FC<{ trip: ScheduledTrip }> = ({ trip }) => {
  const points: Array<{ key: string; name: string; arrive: string | null; depart: string | null; actual?: string | null; kind: 'start' | 'stop' | 'end' }> = [
    { key: 'origin', name: trip.originStation ? stationLabel(trip.originStation) : trip.origin, arrive: null, depart: trip.departureAt, kind: 'start' },
    ...trip.stops.map((s) => ({
      key: `s${s.sequence}`,
      name: stationLabel(s.station),
      arrive: s.scheduledArrivalAt,
      depart: s.scheduledDepartureAt,
      actual: s.actualArrivalAt,
      kind: 'stop' as const,
    })),
    { key: 'dest', name: trip.destinationStation ? stationLabel(trip.destinationStation) : trip.destination, arrive: trip.arrivalAt, depart: null, kind: 'end' },
  ];
  return (
    <ol className="relative border-r-2 border-outline-variant/50 mr-2 space-y-4">
      {points.map((p) => (
        <li key={p.key} className="pr-5 relative">
          <span
            className={`absolute -right-[9px] top-1 h-4 w-4 rounded-full border-2 border-surface-container-lowest ${p.kind === 'stop' ? 'bg-outline' : 'bg-secondary'}`}
          />
          <div className="font-semibold text-sm">{p.name}</div>
          <div className="text-xs text-on-surface-variant flex flex-wrap gap-x-3">
            {p.arrive && <span>وصول {formatSudanTime(p.arrive)}</span>}
            {p.depart && <span>مغادرة {formatSudanTime(p.depart)}</span>}
            {p.actual && <span className="text-[#15803D]">وصل فعليًا {formatSudanTime(p.actual)}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
};
