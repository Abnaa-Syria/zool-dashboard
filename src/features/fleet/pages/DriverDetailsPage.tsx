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
import { formatDateTime, sudanDate } from '../../../lib/dates';
import { Section } from '../../admin/components/AdminUi';
import { useAuth } from '../../auth/auth-context';
import { ConfirmDialog } from '../../geo/components/common';
import { RelatedTripsSection } from '../../network/components/RelatedTripsSection';
import { DRIVER_STATUS_LABEL, useDeleteDriver, useDriver, useUpdateDriver } from '../api';
import { DriverModal } from '../components/DriverModal';

/** `/fleet/drivers/:id` — driver profile, login account status and trips. */
export const DriverDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManage = can('fleet.manage');
  const driver = useDriver(id);
  const update = useUpdateDriver();
  const remove = useDeleteDriver();
  const [modal, setModal] = React.useState<'edit' | 'toggle' | 'delete' | null>(null);
  const d = driver.data;
  const today = sudanDate();

  const crumbs = [
    { label: 'الشبكة والأسطول' },
    { label: 'السائقون', path: '/fleet/drivers' },
    { label: d?.displayName ?? '...' },
  ];

  if (driver.isLoading) {
    return (
      <div className="flex flex-col gap-space-md">
        <Breadcrumbs items={crumbs} />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }
  if (driver.isError || !d) {
    return (
      <div className="flex flex-col gap-space-md">
        <Breadcrumbs items={crumbs} />
        <ErrorState title="تعذّر تحميل السائق" message={errorMessage(driver.error)} onRetry={() => driver.refetch()} />
      </div>
    );
  }

  const suspending = d.status === 'ACTIVE';
  const expired = d.licenseExpiry !== null && d.licenseExpiry < today;
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
        title={d.displayName}
        subtitle={`${d.driverCode} · ${d.company.name}`}
        className="mb-0"
        badge={
          <Badge variant={d.status === 'ACTIVE' ? 'success' : 'error'} dot>
            {DRIVER_STATUS_LABEL[d.status]}
          </Badge>
        }
        actions={
          canManage ? (
            <>
              <Button variant="outline" icon="edit" onClick={() => setModal('edit')}>
                تعديل
              </Button>
              <Button variant="outline" icon={suspending ? 'block' : 'check_circle'} onClick={() => setModal('toggle')}>
                {suspending ? 'إيقاف' : 'إعادة التفعيل'}
              </Button>
              <Button variant="danger" icon="delete" onClick={() => setModal('delete')}>
                حذف
              </Button>
            </>
          ) : null
        }
      />

      {d.status === 'SUSPENDED' && (
        <div className="rounded-xl border border-error/30 bg-error-container/30 p-space-md text-sm">
          <strong>السائق موقوف.</strong> لا يستطيع تسجيل الدخول إلى تطبيق السائق ولا يظهر في خيارات تعيين الرحلات.
        </div>
      )}

      <Section title="بيانات السائق">
        <FieldGrid>
          <Field label="الاسم">{d.displayName}</Field>
          <Field label="رمز السائق">
            <Mono>{d.driverCode}</Mono>
          </Field>
          <Field label="هاتف الدخول">
            <Mono>{d.phone ?? '—'}</Mono>
          </Field>
          <Field label="شركة النقل">
            <Link to={`/companies/${d.company.id}`} className="text-secondary font-medium">
              {d.company.name}
            </Link>
          </Field>
          <Field label="رقم الرخصة">{d.licenseNumber ? <Mono>{d.licenseNumber}</Mono> : '—'}</Field>
          <Field label="انتهاء الرخصة">
            {d.licenseExpiry ? (
              <span className={expired ? 'text-error font-medium' : undefined}>
                <span dir="ltr">{d.licenseExpiry}</span>
                {expired ? ' (منتهية)' : ''}
              </span>
            ) : (
              '—'
            )}
          </Field>
          <Field label="آخر دخول">{formatDateTime(d.lastLoginAt)}</Field>
          <Field label="تاريخ الإضافة">{formatDateTime(d.createdAt)}</Field>
          <Field label="المعرّف">
            <Mono>{d.id}</Mono>
          </Field>
        </FieldGrid>
      </Section>

      <RelatedTripsSection scope={{ driverId: d.id }} title="رحلات السائق" hide={['driver']} />

      <DriverModal driver={d} open={modal === 'edit'} onOpenChange={(o) => !o && setModal(null)} />
      <ConfirmDialog
        open={modal === 'toggle'}
        onOpenChange={closeToggle}
        title={suspending ? `إيقاف السائق ${d.displayName}؟` : `إعادة تفعيل ${d.displayName}؟`}
        confirmText={suspending ? 'إيقاف وإنهاء الجلسات' : 'إعادة التفعيل'}
        danger={suspending}
        pending={update.isPending}
        error={update.error}
        onConfirm={() => update.mutate({ id: d.id, patch: { status: suspending ? 'SUSPENDED' : 'ACTIVE' } }, { onSuccess: () => closeToggle(false) })}
      >
        {suspending
          ? 'سيتم إنهاء كل جلسات السائق فورًا وتسجيل خروجه من تطبيق السائق، ولن يتمكن من الدخول حتى يُعاد تفعيله.'
          : 'سيتمكن السائق من تسجيل الدخول مجددًا برقم هاتفه.'}
      </ConfirmDialog>
      <DeleteEntityDialog
        open={modal === 'delete'}
        onOpenChange={(o) => !o && setModal(null)}
        entityLabel="السائق"
        name={d.displayName}
        description={<p>يُحذف حساب الدخول أيضًا. السائق الذي له رحلات أو سجل صعود أو تحصيل نقدي لا يُحذف؛ أوقفه بدلًا من ذلك.</p>}
        onDelete={() => remove.mutateAsync(d.id)}
        onDeleted={() => navigate('/fleet/drivers', { replace: true })}
        alternative={
          d.status === 'ACTIVE'
            ? {
                label: 'إيقاف السائق',
                description: 'إيقاف السائق ينهي جلساته ويمنعه من الدخول والتعيين مع الإبقاء على سجل رحلاته.',
                run: () => update.mutateAsync({ id: d.id, patch: { status: 'SUSPENDED' } }),
              }
            : undefined
        }
      />
    </div>
  );
};
