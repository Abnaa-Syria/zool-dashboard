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
import { useAuth } from '../../auth/auth-context';
import { Panel } from '../../geo/components/common';
import { RelatedTripsSection } from '../../network/components/RelatedTripsSection';
import { SERVICE_CLASS_LABEL, useDeleteVehicle, useUpdateVehicle, useVehicle, VEHICLE_STATUS_LABEL, VEHICLE_STATUS_VARIANT } from '../api';
import { SeatGrid, SeatLegend } from '../components/SeatGrid';
import { layoutStats } from '../seatLayout';

/** `/fleet/vehicles/:id` — profile, amenities, seat layout and trips; edit / delete (or retire). */
export const FleetVehicleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { can } = useAuth();
  const navigate = useNavigate();
  const vehicle = useVehicle(id);
  const update = useUpdateVehicle(id ?? '');
  const remove = useDeleteVehicle();
  const [deleting, setDeleting] = React.useState(false);
  const canManage = can('fleet.manage');
  const v = vehicle.data;
  const stats = v ? layoutStats(v.seatLayout) : null;

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'الشبكة والأسطول' }, { label: 'الحافلات', path: '/fleet/vehicles' }, { label: v?.plateNumber ?? '...' }]} />
      {vehicle.isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : vehicle.isError ? (
        <ErrorState title="تعذّر تحميل الحافلة" message={errorMessage(vehicle.error)} onRetry={() => vehicle.refetch()} />
      ) : v && stats ? (
        <>
          <PageHeader
            title={v.plateNumber}
            subtitle={`${v.model} · ${v.company.name}`}
            className="mb-0"
            badge={<Badge variant={VEHICLE_STATUS_VARIANT[v.status]} dot>{VEHICLE_STATUS_LABEL[v.status]}</Badge>}
            actions={
              canManage ? (
                <>
                  <Button variant="outline" icon="edit" onClick={() => navigate(`/fleet/vehicles/${v.id}/edit`)}>تعديل</Button>
                  <Button variant="danger" icon="delete" onClick={() => setDeleting(true)}>حذف</Button>
                </>
              ) : null
            }
          />

          <Panel>
            <FieldGrid>
              <Field label="رقم اللوحة"><Mono>{v.plateNumber}</Mono></Field>
              <Field label="الطراز">{v.model}</Field>
              <Field label="الشركة">
                <Link to={`/companies/${v.company.id}`} className="text-secondary font-medium">{v.company.name}</Link>
              </Field>
              <Field label="الحالة">{VEHICLE_STATUS_LABEL[v.status]}</Field>
              <Field label="فئة الخدمة">{SERVICE_CLASS_LABEL[v.serviceClass]}</Field>
              <Field label="السعة"><span className="tabular-nums">{v.capacity}</span> مقعدًا ({stats.womenOnly} للنساء)</Field>
              <Field label="تاريخ الإضافة">{formatDateTime(v.createdAt)}</Field>
              <Field label="آخر تحديث">{formatDateTime(v.updatedAt)}</Field>
              <Field label="المعرّف"><Mono>{v.id}</Mono></Field>
            </FieldGrid>
          </Panel>

          <Panel className="flex flex-col gap-space-sm">
            <h2 className="text-base font-bold">المزايا</h2>
            {v.amenities.length === 0 ? (
              <p className="text-xs text-on-surface-variant">لا توجد مزايا مسندة.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {v.amenities.map((a) => (
                  <li key={a.code} className="flex items-center gap-1.5 rounded-lg border border-surface-container-high px-3 py-1.5 text-sm">
                    <span className="material-symbols-outlined text-[18px] text-secondary">{a.icon}</span>
                    {a.nameAr}
                    {a.value && <span className="text-xs text-on-surface-variant">({a.value})</span>}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel className="flex flex-col gap-space-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold">تخطيط المقاعد</h2>
              <SeatLegend />
            </div>
            <p className="text-xs text-on-surface-variant">
              {v.seatLayout.rows} صفوف × {v.seatLayout.columns} مقاعد، الممر بعد العمود {v.seatLayout.aisleAfterColumn}، السائق على
              {v.seatLayout.driverSide === 'LEFT' ? ' اليسار' : ' اليمين'}. أي تعديل على التخطيط يُطبَّق على الرحلات المجدولة بعده فقط.
            </p>
            <div className="max-w-full overflow-x-auto">
              <SeatGrid layout={v.seatLayout} />
            </div>
          </Panel>

          <RelatedTripsSection scope={{ vehicleId: v.id }} title="رحلات الحافلة" hide={['vehicle']} />

          <DeleteEntityDialog
            open={deleting}
            onOpenChange={setDeleting}
            entityLabel="الحافلة"
            name={v.plateNumber}
            description={<p>الحافلة التي لها رحلات أو سجل مواقع GPS لا تُحذف؛ أخرجها من الخدمة بدلًا من ذلك.</p>}
            onDelete={() => remove.mutateAsync(v.id)}
            onDeleted={() => navigate('/fleet/vehicles', { replace: true })}
            alternative={
              v.status !== 'RETIRED'
                ? {
                    label: 'إخراج من الخدمة',
                    description: 'تُعلَّم الحافلة «خارج الخدمة» فلا تظهر في التعيين والجدولة، ويبقى سجل رحلاتها كما هو.',
                    run: () => update.mutateAsync({ status: 'RETIRED' }),
                  }
                : undefined
            }
          />
        </>
      ) : null}
    </div>
  );
};
