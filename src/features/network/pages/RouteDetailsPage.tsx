import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { DeleteEntityDialog } from '../../../components/shared/DeleteEntityDialog';
import { Field, FieldGrid, Mono } from '../../../components/shared/DetailFields';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { Section } from '../../admin/components/AdminUi';
import { useAuth } from '../../auth/auth-context';
import { ConfirmDialog } from '../../geo/components/common';
import { routeLabel, useDeleteRoute, useRoute, useUpdateRoute, type RouteDto, type StationLite } from '../api';
import { RelatedTripsSection } from '../components/RelatedTripsSection';
import { RouteFormModal } from '../components/RouteFormModal';
import { ScheduleTripsModal } from '../components/ScheduleTripsModal';
import { formatDuration } from '../time';

const StationLink: React.FC<{ station: StationLite }> = ({ station }) => (
  <Link to={`/network/stations/${station.id}`} className="text-secondary font-medium">
    {station.city.nameAr} — {station.nameAr}
  </Link>
);

/** Ordered points of the route: origin, intermediate stops (offset from departure, dwell), destination. */
const RouteTimeline: React.FC<{ route: RouteDto }> = ({ route }) => {
  const points = [
    { key: 'o', station: route.originStation, note: 'الانطلاق (الدقيقة 0)', kind: 'end' as const },
    ...route.stops
      .slice()
      .sort((a, b) => a.sequence - b.sequence)
      .map((s) => ({
        key: `s${s.sequence}`,
        station: s.station,
        note: `توقف ${s.sequence} · بعد ${formatDuration(s.offsetMinutes)}${s.dwellMinutes ? ` · انتظار ${s.dwellMinutes} د` : ''}`,
        kind: 'stop' as const,
      })),
    { key: 'd', station: route.destinationStation, note: `الوصول · بعد ${formatDuration(route.durationMinutes)}`, kind: 'end' as const },
  ];
  return (
    <ol className="relative border-r-2 border-outline-variant/50 mr-2 space-y-4">
      {points.map((p) => (
        <li key={p.key} className="pr-5 relative">
          <span
            className={`absolute -right-[9px] top-1 h-4 w-4 rounded-full border-2 border-surface-container-lowest ${p.kind === 'stop' ? 'bg-outline' : 'bg-secondary'}`}
          />
          <div className="text-sm">
            <StationLink station={p.station} />
            <span className="text-xs text-on-surface-variant" dir="ltr">
              {' '}
              ({p.station.nameEn})
            </span>
          </div>
          <div className="text-xs text-on-surface-variant">{p.note}</div>
        </li>
      ))}
    </ol>
  );
};

/** `/network/routes/:id` — route profile, stops and scheduled trips; edit / (de)activate / schedule / delete. */
export const RouteDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManage = can('catalog.manage');
  const route = useRoute(id);
  const update = useUpdateRoute();
  const remove = useDeleteRoute();
  const [modal, setModal] = React.useState<'edit' | 'toggle' | 'delete' | 'schedule' | null>(null);
  const r = route.data;
  const name = r ? routeLabel(r) : '...';

  const crumbs = [{ label: 'الشبكة والأسطول' }, { label: 'المسارات', path: '/network/routes' }, { label: name }];

  if (route.isLoading) {
    return (
      <div className="flex flex-col gap-space-md">
        <Breadcrumbs items={crumbs} />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }
  if (route.isError || !r) {
    return (
      <div className="flex flex-col gap-space-md">
        <Breadcrumbs items={crumbs} />
        <ErrorState title="تعذّر تحميل المسار" message={errorMessage(route.error)} onRetry={() => route.refetch()} />
      </div>
    );
  }

  const closeToggle = (o: boolean) => {
    if (!o) {
      setModal(null);
      update.reset();
    }
  };

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title={`مسار ${name}`}
        subtitle={`${r.company.name} · ${r.originStation.nameAr} ← ${r.destinationStation.nameAr}`}
        className="mb-0"
        badge={
          <Badge variant={r.isActive ? 'success' : 'neutral'} dot>
            {r.isActive ? 'نشط' : 'غير نشط'}
          </Badge>
        }
        actions={
          canManage ? (
            <>
              {r.isActive && (
                <Button icon="event_repeat" onClick={() => setModal('schedule')}>
                  جدولة رحلات
                </Button>
              )}
              <Button variant="outline" icon="edit" onClick={() => setModal('edit')}>
                تعديل
              </Button>
              <Button variant="outline" icon={r.isActive ? 'toggle_off' : 'toggle_on'} onClick={() => setModal('toggle')}>
                {r.isActive ? 'تعطيل' : 'تفعيل'}
              </Button>
              <Button variant="danger" icon="delete" onClick={() => setModal('delete')}>
                حذف
              </Button>
            </>
          ) : null
        }
      />

      <Section title="بيانات المسار">
        <FieldGrid>
          <Field label="الرمز">{r.code ? <Mono>{r.code}</Mono> : '—'}</Field>
          <Field label="شركة النقل">
            <Link to={`/companies/${r.company.id}`} className="text-secondary font-medium">
              {r.company.name}
            </Link>
          </Field>
          <Field label="المدة">{formatDuration(r.durationMinutes)}</Field>
          <Field label="التوقفات">{r.stops.length === 0 ? 'مباشر' : `${r.stops.length} توقف`}</Field>
          <Field label="محطة الانطلاق">
            <StationLink station={r.originStation} />
          </Field>
          <Field label="محطة الوصول">
            <StationLink station={r.destinationStation} />
          </Field>
          <Field label="تاريخ الإنشاء">{formatDateTime(r.createdAt)}</Field>
          <Field label="المعرّف">
            <Mono>{r.id}</Mono>
          </Field>
        </FieldGrid>
      </Section>

      <Section title="المحطات والتوقفات">
        <RouteTimeline route={r} />
        <p className="text-xs text-on-surface-variant">
          الأوقات نسبية من موعد الانطلاق. تعديل المدة أو التوقفات يُطبَّق على الرحلات المجدولة بعد التعديل فقط.
        </p>
      </Section>

      <RelatedTripsSection scope={{ routeId: r.id }} title="رحلات المسار" hide={['route']} />

      {modal === 'edit' && <RouteFormModal route={r} onClose={() => setModal(null)} />}
      {modal === 'schedule' && <ScheduleTripsModal initialRouteId={r.id} onClose={() => setModal(null)} />}
      <ConfirmDialog
        open={modal === 'toggle'}
        onOpenChange={closeToggle}
        title={r.isActive ? `تعطيل المسار ${name}؟` : `تفعيل المسار ${name}؟`}
        confirmText={r.isActive ? 'تعطيل' : 'تفعيل'}
        danger={r.isActive}
        pending={update.isPending}
        error={update.error}
        onConfirm={() => update.mutate({ id: r.id, patch: { isActive: !r.isActive } }, { onSuccess: () => closeToggle(false) })}
      >
        {r.isActive
          ? 'لن يظهر المسار في جدولة رحلات جديدة. الرحلات المجدولة مسبقًا والحجوزات لا تتأثر.'
          : 'سيعود المسار متاحًا لجدولة رحلات جديدة.'}
      </ConfirmDialog>
      <DeleteEntityDialog
        open={modal === 'delete'}
        onOpenChange={(o) => !o && setModal(null)}
        entityLabel="المسار"
        name={name}
        description={<p>تُحذف التوقفات معه. المسار الذي جُدولت عليه رحلات لا يُحذف؛ عطّله بدلًا من ذلك.</p>}
        onDelete={() => remove.mutateAsync(r.id)}
        onDeleted={() => navigate('/network/routes', { replace: true })}
        alternative={
          r.isActive
            ? {
                label: 'تعطيل المسار',
                description: 'تعطيل المسار يمنع جدولة رحلات جديدة عليه ويُبقي رحلاته وحجوزاتها كما هي.',
                run: () => update.mutateAsync({ id: r.id, patch: { isActive: false } }),
              }
            : undefined
        }
      />
    </div>
  );
};
