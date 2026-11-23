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
import { formatSdg } from '../../../lib/money';
import { Section } from '../../admin/components/AdminUi';
import { useAuth } from '../../auth/auth-context';
import { RelatedBookingsTable } from '../../bookings/components/RelatedBookingsTable';
import { OFFICE_STATUS_LABEL, SETTLEMENT_PERIOD_LABEL, useBrokerOffice, useDeleteOffice, useUpdateOfficeStatus } from '../api';
import { AssignmentsSection } from '../components/AssignmentsSection';
import { EditOfficeModal } from '../components/EditOfficeModal';
import { OfficeSettlementsSection } from '../components/OfficeSettlementsSection';
import { OfficeStatusModal } from '../components/OfficeStatusModal';
import { StaffSection } from '../components/StaffSection';
import { WalletSection } from '../components/WalletSection';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-xs text-on-surface-variant">{label}</dt>
    <dd className="text-sm text-on-surface">{children}</dd>
  </div>
);

export const BrokerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { can } = useAuth();
  const office = useBrokerOffice(id);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const navigate = useNavigate();
  const remove = useDeleteOffice();
  const setStatus = useUpdateOfficeStatus(id ?? '');
  const o = office.data;

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs
        items={[
          { label: 'الرئيسية والعمليات', path: '/overview' },
          { label: 'مكاتب الوكلاء', path: '/brokers' },
          { label: o?.name ?? '...' },
        ]}
      />

      {office.isLoading ? (
        <Skeleton className="h-56 rounded-xl" />
      ) : office.isError ? (
        <ErrorState title="تعذّر تحميل المكتب" message={errorMessage(office.error)} onRetry={() => office.refetch()} />
      ) : o ? (
        <>
          <PageHeader
            title={o.name}
            className="mb-0"
            badge={<Badge variant={o.status === 'ACTIVE' ? 'success' : 'error'} dot>{OFFICE_STATUS_LABEL[o.status]}</Badge>}
            actions={
              can('brokers.manage') ? (
                <>
                  <Button variant="outline" icon="edit" onClick={() => setEditOpen(true)}>تعديل السياسة</Button>
                  {o.status === 'ACTIVE' ? (
                    <Button variant="danger" icon="block" onClick={() => setStatusOpen(true)}>إيقاف المكتب</Button>
                  ) : (
                    <Button icon="check_circle" onClick={() => setStatusOpen(true)}>إعادة التفعيل</Button>
                  )}
                  <Button variant="outline" icon="delete" className="text-error" onClick={() => setDeleteOpen(true)}>حذف</Button>
                </>
              ) : null
            }
          />

          <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
              <Field label="الرمز"><span dir="ltr" className="font-mono text-xs">{o.code}</span></Field>
              <Field label="دورة التسوية">{SETTLEMENT_PERIOD_LABEL[o.settlementPeriod]}</Field>
              <Field label="آخر تسوية">{formatDateTime(o.lastSettledAt)}</Field>
              <Field label="المنطقة الزمنية">{o.timeZone ?? 'افتراضي المنصة'}</Field>
              <Field label="الحد الأدنى للشحن">{o.minTopUpMinorOverride !== null ? formatSdg(o.minTopUpMinorOverride) : 'افتراضي المنصة'}</Field>
              <Field label="حد تنبيه الرصيد المنخفض">
                {o.lowBalanceThresholdMinorOverride !== null ? formatSdg(o.lowBalanceThresholdMinorOverride) : 'افتراضي المنصة'}
              </Field>
              <Field label="سقف التذاكر اليومي">{o.exposureCeilingOverride !== null ? `${o.exposureCeilingOverride} تذكرة` : 'افتراضي المنصة'}</Field>
              <Field label="تاريخ الإنشاء">{formatDateTime(o.createdAt)}</Field>
            </dl>
          </section>

          <WalletSection office={o} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-md items-start">
            <div className="xl:col-span-1">
              <AssignmentsSection office={o} />
            </div>
            <div className="xl:col-span-2">
              <StaffSection office={o} />
            </div>
          </div>

          {can('bookings.view') && (
            <Section title="حجوزات المكتب">
              <RelatedBookingsTable scope={{ officeId: o.id }} hide={['office']} emptyText="لم يُصدر هذا المكتب حجوزات بعد." />
            </Section>
          )}
          {can('commissions.view') && <OfficeSettlementsSection officeId={o.id} />}

          {statusOpen && <OfficeStatusModal office={o} onClose={() => setStatusOpen(false)} />}
          {editOpen && <EditOfficeModal office={o} onClose={() => setEditOpen(false)} />}
          <DeleteEntityDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            entityLabel="مكتب الوكيل"
            name={o.name}
            description={<p>يُحذف المكتب مع محفظته وموظفيه وإسناداته. لا يُسمح بالحذف إذا كانت له حجوزات أو حركات محفظة أو طلبات شحن أو عمولات أو رصيد متبقٍ.</p>}
            onDelete={() => remove.mutateAsync(o.id)}
            onDeleted={() => navigate('/brokers', { replace: true })}
            alternative={
              o.status === 'ACTIVE'
                ? {
                    label: 'إيقاف المكتب',
                    description: 'إيقاف المكتب يمنع موظفيه من الدخول والحجز مع الإبقاء على المحفظة والسجل المالي كاملًا.',
                    run: () => setStatus.mutateAsync('SUSPENDED'),
                  }
                : undefined
            }
          />
        </>
      ) : null}
    </div>
  );
};
