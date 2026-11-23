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
import { useCity, useStations, useUpdateCity } from '../api';
import { CityModal } from '../components/CityModal';
import { ConfirmDialog, Pager, TableShell, Td, Th } from '../components/common';
import { CityDeleteDialog } from '../components/GeoDeleteDialogs';
import { StationModal } from '../components/StationModal';

const CityStationsTable: React.FC<{ cityId: string; canManage: boolean }> = ({ cityId, canManage }) => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [adding, setAdding] = React.useState(false);
  const stations = useStations({ cityId, page, pageSize: 50 });
  const rows = stations.data?.data ?? [];
  return (
    <Section
      title={`المحطات${stations.data?.meta ? ` (${stations.data.meta.total.toLocaleString('en-US')})` : ''}`}
      actions={canManage ? <Button size="sm" variant="outline" icon="add" onClick={() => setAdding(true)}>إضافة محطة</Button> : null}
    >
      {stations.isLoading ? (
        <Skeleton className="h-24 rounded-lg" />
      ) : stations.isError ? (
        <ErrorState title="تعذّر تحميل المحطات" message={errorMessage(stations.error)} onRetry={() => stations.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="لا توجد محطات في هذه المدينة" icon="pin_drop" className="my-0" />
      ) : (
        <TableShell
          head={
            <>
              <Th>المحطة</Th>
              <Th>العنوان</Th>
              <Th>الحالة</Th>
              <Th className="text-left" />
            </>
          }
        >
          {rows.map((s) => (
            <tr key={s.id} className="border-t border-surface-container hover:bg-surface-container/50 cursor-pointer" onClick={() => navigate(`/network/stations/${s.id}`)}>
              <Td>
                <div className="font-semibold">{s.nameAr}</div>
                <div className="text-xs text-on-surface-variant" dir="ltr">{s.nameEn}</div>
              </Td>
              <Td className="text-xs">{s.address ?? '—'}</Td>
              <Td>
                <Badge variant={s.isActive ? 'success' : 'neutral'} dot>{s.isActive ? 'نشطة' : 'غير نشطة'}</Badge>
              </Td>
              <Td className="text-left">
                <Link to={`/network/stations/${s.id}`} className="text-secondary text-xs font-medium" onClick={(e) => e.stopPropagation()}>عرض</Link>
              </Td>
            </tr>
          ))}
        </TableShell>
      )}
      <Pager meta={stations.data?.meta} busy={stations.isFetching} onPage={setPage} />
      <StationModal defaultCityId={cityId} open={adding} onOpenChange={setAdding} />
    </Section>
  );
};

export const CityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManage = can('geo.manage');
  const city = useCity(id);
  const update = useUpdateCity();
  const [modal, setModal] = React.useState<'edit' | 'toggle' | 'delete' | null>(null);
  const c = city.data;

  const crumbs = [
    { label: 'الشبكة والأسطول' },
    { label: 'المدن', path: '/network/cities' },
    { label: c?.nameAr ?? '...' },
  ];

  if (city.isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (city.isError || !c) {
    return (
      <div className="flex flex-col gap-space-md">
        <Breadcrumbs items={crumbs} />
        <ErrorState title="تعذّر تحميل المدينة" message={errorMessage(city.error)} onRetry={() => city.refetch()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title={c.nameAr}
        subtitle={`${c.nameEn} · ${c.code}`}
        className="mb-0"
        badge={<Badge variant={c.isActive ? 'success' : 'neutral'} dot>{c.isActive ? 'نشطة' : 'غير نشطة'}</Badge>}
        actions={
          canManage ? (
            <>
              <Button variant="outline" icon="edit" onClick={() => setModal('edit')}>تعديل</Button>
              <Button variant="outline" icon={c.isActive ? 'toggle_off' : 'toggle_on'} onClick={() => setModal('toggle')}>
                {c.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
              </Button>
              <Button variant="danger" icon="delete" onClick={() => setModal('delete')}>حذف</Button>
            </>
          ) : null
        }
      />

      <Section title="بيانات المدينة">
        <FieldGrid>
          <Field label="الرمز"><Mono>{c.code}</Mono></Field>
          <Field label="الاسم بالعربية">{c.nameAr}</Field>
          <Field label="الاسم بالإنجليزية"><span dir="ltr">{c.nameEn}</span></Field>
          <Field label="الحالة">{c.isActive ? 'نشطة' : 'غير نشطة'}</Field>
          <Field label="مدينة شائعة">{c.isPopular ? 'نعم — تظهر في المدن الشائعة بالتطبيق' : 'لا'}</Field>
          <Field label="ترتيب العرض"><span className="tabular-nums">{c.sortOrder}</span></Field>
          <Field label="عدد المحطات"><span className="tabular-nums">{c.stationCount.toLocaleString('en-US')}</span></Field>
          <Field label="المعرّف"><Mono>{c.id}</Mono></Field>
          <Field label="تاريخ الإنشاء">{formatDateTime(c.createdAt)}</Field>
          <Field label="آخر تحديث">{formatDateTime(c.updatedAt)}</Field>
          <Field label="رابط الصورة" className="col-span-2">
            {c.imageUrl ? (
              <a href={c.imageUrl} target="_blank" rel="noreferrer" className="text-secondary break-all" dir="ltr">{c.imageUrl}</a>
            ) : (
              '—'
            )}
          </Field>
        </FieldGrid>
        {c.imageUrl && <img src={c.imageUrl} alt={c.nameAr} className="mt-space-sm max-h-48 rounded-lg border border-surface-container-high object-cover" />}
      </Section>

      <CityStationsTable cityId={c.id} canManage={canManage} />

      <CityModal city={c} open={modal === 'edit'} onOpenChange={(o) => !o && setModal(null)} />
      <ConfirmDialog
        open={modal === 'toggle'}
        onOpenChange={(o) => {
          if (!o) {
            setModal(null);
            update.reset();
          }
        }}
        title={c.isActive ? `إلغاء تفعيل ${c.nameAr}؟` : `تفعيل ${c.nameAr}؟`}
        confirmText={c.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
        danger={c.isActive}
        pending={update.isPending}
        error={update.error}
        onConfirm={() => update.mutate({ id: c.id, patch: { isActive: !c.isActive } }, { onSuccess: () => setModal(null) })}
      >
        {c.isActive
          ? 'ستُعلَّم المدينة كغير نشطة في البيانات المرجعية. محطاتها والرحلات والحجوزات القائمة لا تُحذف ولا تتغير.'
          : 'ستعود المدينة نشطة في البيانات المرجعية.'}
      </ConfirmDialog>
      <CityDeleteDialog record={modal === 'delete' ? c : null} onClose={() => setModal(null)} onDeleted={() => navigate('/network/cities')} />
    </div>
  );
};
