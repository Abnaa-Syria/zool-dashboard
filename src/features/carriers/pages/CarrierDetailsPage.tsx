import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { DeleteEntityDialog } from '../../../components/shared/DeleteEntityDialog';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { useAuth } from '../../auth/auth-context';
import { CARRIER_STATUS_LABEL, useCarrier, useDeleteCarrier, useUpdateCarrier } from '../api';
import { AffectedTripsSection } from '../components/AffectedTripsSection';
import { BillingSection } from '../components/BillingSection';
import { CarrierRelatedSections } from '../components/CarrierRelatedSections';
import { CarrierStaffSection } from '../components/CarrierStaffSection';
import { CarrierStatusModal } from '../components/CarrierStatusModal';
import { EditCarrierModal } from '../components/EditCarrierModal';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-xs text-on-surface-variant">{label}</dt>
    <dd className="text-sm text-on-surface">{children}</dd>
  </div>
);

export const CarrierDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { can } = useAuth();
  const carrier = useCarrier(id);
  const [editOpen, setEditOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const navigate = useNavigate();
  const remove = useDeleteCarrier();
  const update = useUpdateCarrier(id ?? '');
  const c = carrier.data;

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs
        items={[
          { label: 'الرئيسية والعمليات', path: '/overview' },
          { label: 'شركات النقل', path: '/companies' },
          { label: c?.name ?? '...' },
        ]}
      />

      {carrier.isLoading ? (
        <Skeleton className="h-56 rounded-xl" />
      ) : carrier.isError ? (
        <ErrorState title="تعذّر تحميل الشركة" message={errorMessage(carrier.error)} onRetry={() => carrier.refetch()} />
      ) : c ? (
        <>
          <PageHeader
            title={c.name}
            subtitle={c.legalName ?? undefined}
            className="mb-0"
            badge={<Badge variant={c.status === 'ACTIVE' ? 'success' : 'error'} dot>{CARRIER_STATUS_LABEL[c.status]}</Badge>}
            actions={
              can('carriers.manage') ? (
                <>
                  <Button variant="outline" icon="edit" onClick={() => setEditOpen(true)}>تعديل البيانات</Button>
                  {c.status === 'ACTIVE' ? (
                    <Button variant="danger" icon="block" onClick={() => setStatusOpen(true)}>إيقاف الشركة</Button>
                  ) : (
                    <Button icon="check_circle" onClick={() => setStatusOpen(true)}>إعادة التفعيل</Button>
                  )}
                  <Button variant="outline" icon="delete" className="text-error" onClick={() => setDeleteOpen(true)}>حذف</Button>
                </>
              ) : null
            }
          />

          {c.status === 'SUSPENDED' && (
            <div className="rounded-xl border border-error/30 bg-error-container/30 p-space-md text-sm">
              <strong>الشركة موقوفة منذ {formatDateTime(c.suspendedAt)}.</strong> البيع متوقف والمقاعد المؤقتة حُرّرت؛ الحجوزات
              المؤكدة باقية حتى تقرر بشأن كل رحلة أدناه.
            </div>
          )}

          <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
            <div className="flex items-start gap-space-md">
              {c.logoUrl ? (
                <img src={c.logoUrl} alt="" className="w-16 h-16 rounded-xl object-contain border border-surface-container-high bg-white" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[32px]">departure_board</span>
                </div>
              )}
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-space-md flex-1">
                <Field label="المفتاح"><span dir="ltr" className="font-mono text-xs">{c.key}</span></Field>
                <Field label="الاسم المختصر">{c.shortName ?? '—'}</Field>
                <Field label="الاسم القانوني">{c.legalName ?? '—'}</Field>
                <Field label="التقييم">
                  {c.rating.count > 0 ? `${c.rating.average.toFixed(2)} / 5 (${c.rating.count} تقييم)` : 'لا توجد تقييمات'}
                </Field>
                <Field label="الدفع نقدًا عند الصعود">
                  <Badge variant={c.cashEnabled ? 'success' : 'neutral'}>{c.cashEnabled ? 'مفعّل' : 'غير مفعّل'}</Badge>
                </Field>
                <Field label="مكاتب الوكلاء المرتبطة">{c.assignmentCount}</Field>
                <Field label="تاريخ الإضافة">{formatDateTime(c.createdAt)}</Field>
                <Field label="تاريخ الإيقاف">{formatDateTime(c.suspendedAt)}</Field>
              </dl>
            </div>
          </section>

          <BillingSection carrier={c} />

          <CarrierStaffSection companyId={c.id} />

          <AffectedTripsSection companyId={c.id} suspended={c.status === 'SUSPENDED'} />

          <CarrierRelatedSections companyId={c.id} />

          {editOpen && <EditCarrierModal carrier={c} open onOpenChange={setEditOpen} />}
          <CarrierStatusModal carrier={c} open={statusOpen} onOpenChange={setStatusOpen} />
          <DeleteEntityDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            entityLabel="شركة النقل"
            name={c.name}
            description={<p>يُحذف معها حسابات بوابة الشركة. لا يُسمح بالحذف إذا كانت لها رحلات أو مسارات أو حافلات أو سائقون أو إسنادات أو تسويات.</p>}
            onDelete={() => remove.mutateAsync(c.id)}
            onDeleted={() => navigate('/companies', { replace: true })}
            alternative={
              c.status === 'ACTIVE'
                ? {
                    label: 'إيقاف الشركة',
                    description: 'إيقاف الشركة يوقف البيع فورًا ويحرّر المقاعد المؤقتة مع الإبقاء على كل السجلات والحجوزات المؤكدة.',
                    run: () => update.mutateAsync({ status: 'SUSPENDED' }),
                  }
                : undefined
            }
          />
        </>
      ) : null}
    </div>
  );
};
