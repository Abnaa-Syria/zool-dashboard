import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Field, FieldGrid, Mono } from '../../../components/shared/DetailFields';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { Section } from '../../admin/components/AdminUi';
import { useAuth } from '../../auth/auth-context';
import { stationLabel, useRoutes, type RouteDto } from '../../network/api';
import { useStation, useUpdateStation } from '../api';
import { ConfirmDialog, Pager, TableShell, Td, Th } from '../components/common';
import { StationDeleteDialog } from '../components/GeoDeleteDialogs';
import { StationModal } from '../components/StationModal';

/** How this station appears on a route. */
function roleOnRoute(r: RouteDto, stationId: string): string {
  if (r.originStation.id === stationId) return 'نقطة الانطلاق';
  if (r.destinationStation.id === stationId) return 'الوجهة';
  return 'توقف وسيط';
}

const StationRoutes: React.FC<{ stationId: string }> = ({ stationId }) => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const routes = useRoutes({ page, pageSize: 50, stationId });
  const rows = routes.data?.data ?? [];
  return (
    <Section title={`المسارات التي تمر بالمحطة${routes.data?.meta ? ` (${routes.data.meta.total.toLocaleString('en-US')})` : ''}`}>
      {routes.isLoading ? (
        <Skeleton className="h-24 rounded-lg" />
      ) : routes.isError ? (
        <ErrorState title="تعذّر تحميل المسارات" message={errorMessage(routes.error)} onRetry={() => routes.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="لا توجد مسارات تستخدم هذه المحطة" icon="route" className="my-0" />
      ) : (
        <TableShell
          head={
            <>
              <Th>المسار</Th>
              <Th>الشركة</Th>
              <Th>دور المحطة</Th>
              <Th>الحالة</Th>
              <Th className="text-left" />
            </>
          }
        >
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-surface-container hover:bg-surface-container/50 cursor-pointer" onClick={() => navigate(`/network/routes/${r.id}`)}>
              <Td>
                <div className="font-semibold">{stationLabel(r.originStation)} ← {stationLabel(r.destinationStation)}</div>
                {r.code && <div className="text-xs font-mono text-on-surface-variant" dir="ltr">{r.code}</div>}
              </Td>
              <Td>{r.company.name}</Td>
              <Td>{roleOnRoute(r, stationId)}</Td>
              <Td>
                <Badge variant={r.isActive ? 'success' : 'neutral'} dot>{r.isActive ? 'نشط' : 'غير نشط'}</Badge>
              </Td>
              <Td className="text-left">
                <Link to={`/network/routes/${r.id}`} className="text-secondary text-xs font-medium" onClick={(e) => e.stopPropagation()}>عرض</Link>
              </Td>
            </tr>
          ))}
        </TableShell>
      )}
      <Pager meta={routes.data?.meta} busy={routes.isFetching} onPage={setPage} />
    </Section>
  );
};

export const StationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManage = can('geo.manage');
  const station = useStation(id);
  const update = useUpdateStation();
  const [modal, setModal] = React.useState<'edit' | 'toggle' | 'delete' | null>(null);
  const s = station.data;

  const crumbs = [
    { label: 'الشبكة والأسطول' },
    { label: 'المحطات', path: '/network/stations' },
    { label: s?.nameAr ?? '...' },
  ];

  if (station.isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (station.isError || !s) {
    return (
      <div className="flex flex-col gap-space-md">
        <Breadcrumbs items={crumbs} />
        <ErrorState title="تعذّر تحميل المحطة" message={errorMessage(station.error)} onRetry={() => station.refetch()} />
      </div>
    );
  }

  const hasCoords = s.latitude !== null && s.longitude !== null;

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title={s.nameAr}
        subtitle={`${s.nameEn} · ${s.city.nameAr}`}
        className="mb-0"
        badge={<Badge variant={s.isActive ? 'success' : 'neutral'} dot>{s.isActive ? 'نشطة' : 'غير نشطة'}</Badge>}
        actions={
          canManage ? (
            <>
              <Button variant="outline" icon="edit" onClick={() => setModal('edit')}>تعديل</Button>
              <Button variant="outline" icon={s.isActive ? 'toggle_off' : 'toggle_on'} onClick={() => setModal('toggle')}>
                {s.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
              </Button>
              <Button variant="danger" icon="delete" onClick={() => setModal('delete')}>حذف</Button>
            </>
          ) : null
        }
      />

      <Section title="بيانات المحطة">
        <FieldGrid>
          <Field label="الاسم بالعربية">{s.nameAr}</Field>
          <Field label="الاسم بالإنجليزية"><span dir="ltr">{s.nameEn}</span></Field>
          <Field label="المدينة">
            <Link to={`/network/cities/${s.city.id}`} className="text-secondary font-medium">
              {s.city.nameAr} <span className="font-mono text-xs" dir="ltr">({s.city.code})</span>
            </Link>
          </Field>
          <Field label="الحالة">{s.isActive ? 'نشطة' : 'غير نشطة'}</Field>
          <Field label="العنوان" className="col-span-2">{s.address ?? '—'}</Field>
          <Field label="خط العرض"><Mono>{s.latitude ?? '—'}</Mono></Field>
          <Field label="خط الطول"><Mono>{s.longitude ?? '—'}</Mono></Field>
          <Field label="الخريطة">
            {hasCoords ? (
              <a
                href={`https://www.openstreetmap.org/?mlat=${s.latitude}&mlon=${s.longitude}#map=16/${s.latitude}/${s.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-secondary font-medium"
              >
                فتح في OpenStreetMap
              </a>
            ) : (
              'لا توجد إحداثيات'
            )}
          </Field>
          <Field label="المعرّف"><Mono>{s.id}</Mono></Field>
          <Field label="تاريخ الإنشاء">{formatDateTime(s.createdAt)}</Field>
          <Field label="آخر تحديث">{formatDateTime(s.updatedAt)}</Field>
        </FieldGrid>
      </Section>

      {can('catalog.view') ? (
        <StationRoutes stationId={s.id} />
      ) : (
        <Section title="المسارات التي تمر بالمحطة">
          <p className="text-xs text-on-surface-variant">عرض المسارات يتطلب صلاحية catalog.view.</p>
        </Section>
      )}

      <StationModal station={s} open={modal === 'edit'} onOpenChange={(o) => !o && setModal(null)} />
      <ConfirmDialog
        open={modal === 'toggle'}
        onOpenChange={(o) => {
          if (!o) {
            setModal(null);
            update.reset();
          }
        }}
        title={s.isActive ? `إلغاء تفعيل ${s.nameAr}؟` : `تفعيل ${s.nameAr}؟`}
        confirmText={s.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
        danger={s.isActive}
        pending={update.isPending}
        error={update.error}
        onConfirm={() => update.mutate({ id: s.id, patch: { isActive: !s.isActive } }, { onSuccess: () => setModal(null) })}
      >
        {s.isActive ? 'ستُعلَّم المحطة كغير نشطة. الرحلات والحجوزات القائمة لا تُحذف ولا تتغير.' : 'ستعود المحطة نشطة.'}
      </ConfirmDialog>
      <StationDeleteDialog record={modal === 'delete' ? s : null} onClose={() => setModal(null)} onDeleted={() => navigate('/network/stations')} />
    </div>
  );
};
