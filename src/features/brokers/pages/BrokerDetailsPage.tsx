import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import { OFFICE_STATUS_LABEL, SETTLEMENT_PERIOD_LABEL, useBrokerOffice } from '../api';
import { AssignmentsSection } from '../components/AssignmentsSection';
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
                o.status === 'ACTIVE' ? (
                  <Button variant="danger" icon="block" onClick={() => setStatusOpen(true)}>إيقاف المكتب</Button>
                ) : (
                  <Button icon="check_circle" onClick={() => setStatusOpen(true)}>إعادة التفعيل</Button>
                )
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

          {statusOpen && <OfficeStatusModal office={o} onClose={() => setStatusOpen(false)} />}
        </>
      ) : null}
    </div>
  );
};
