import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Field, FieldGrid, Mono, NotDeletableNote } from '../../../components/shared/DetailFields';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { Section } from '../../admin/components/AdminUi';
import { useAuth } from '../../auth/auth-context';
import { COMMISSION_BEARER_LABEL, describeFee } from '../../carriers/billing';
import { formatPeriod } from '../../settlements/period';
import {
  CARRIER_SETTLEMENT_STATUS_LABEL,
  CARRIER_SETTLEMENT_STATUS_VARIANT,
  carrierSettlementErrorMessage,
  useCarrierSettlement,
  useCarrierSettlementAction,
  type CarrierSettlement,
} from '../api';
import { DIRECTION_LABEL, totalsFromSettlement } from '../breakdown';
import { NetBreakdownCard, StatementLinesTable } from '../components/StatementView';

type Pending = 'finalize' | 'mark-paid' | 'cancel' | null;

/** D-REV-02 carrier statement: fields, net breakdown, trip lines, lifecycle DRAFT → FINALIZED → PAID / CANCELLED. */
export const CarrierSettlementDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const settlement = useCarrierSettlement(id);
  const s = settlement.data;

  const crumbs = [
    { label: 'الرئيسية والعمليات', path: '/overview' },
    { label: 'تسويات شركات النقل', path: '/financials/carrier-settlements' },
    { label: s ? `كشف ${s.company.name}` : '...' },
  ];

  if (settlement.isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (settlement.isError || !s) {
    return (
      <div className="flex flex-col gap-space-md">
        <Breadcrumbs items={crumbs} />
        <ErrorState title="تعذّر تحميل الكشف" message={carrierSettlementErrorMessage(settlement.error)} onRetry={() => settlement.refetch()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={crumbs} />
      <SettlementBody s={s} />
    </div>
  );
};

const SettlementBody: React.FC<{ s: CarrierSettlement }> = ({ s }) => {
  const { can } = useAuth();
  const action = useCarrierSettlementAction(s.id);
  const [pending, setPending] = React.useState<Pending>(null);
  const [reference, setReference] = React.useState('');
  const manage = can('carriers.manage');
  const isDraft = s.status === 'DRAFT';
  const isFinalized = s.status === 'FINALIZED';

  const run = (a: 'recalculate' | 'finalize' | 'mark-paid' | 'cancel') =>
    action.mutate({ action: a, ...(a === 'mark-paid' ? { reference: reference.trim() } : {}) }, { onSuccess: () => setPending(null) });

  return (
    <>
      <PageHeader
        title={`كشف تسوية ${s.company.name}`}
        subtitle={`الفترة ${formatPeriod(s.periodFrom, s.periodTo)}`}
        badge={<Badge variant={CARRIER_SETTLEMENT_STATUS_VARIANT[s.status]} dot>{CARRIER_SETTLEMENT_STATUS_LABEL[s.status]}</Badge>}
        className="mb-0"
        actions={
          manage && (isDraft || isFinalized) && pending === null ? (
            <>
              {isDraft && (
                <>
                  <Button variant="outline" icon="refresh" isLoading={action.isPending && action.variables?.action === 'recalculate'} onClick={() => run('recalculate')}>
                    إعادة الاحتساب
                  </Button>
                  <Button icon="verified" onClick={() => setPending('finalize')}>اعتماد الكشف</Button>
                </>
              )}
              {isFinalized && <Button icon="paid" onClick={() => setPending('mark-paid')}>تسجيل الدفع</Button>}
              <Button variant="outline" icon="block" onClick={() => setPending('cancel')}>إلغاء الكشف</Button>
            </>
          ) : null
        }
      />

      {manage && pending === 'finalize' && (
        <div className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-space-md space-y-space-sm">
          <p className="text-sm">
            سيُعاد احتساب الكشف بأحدث البيانات وإعدادات الشركة الحالية، ثم يُعتمد. لا يمكن تعديل الكشف المعتمد؛ يمكن إلغاؤه فقط قبل تسجيل الدفع.
          </p>
          <div className="flex gap-2">
            <Button isLoading={action.isPending} onClick={() => run('finalize')}>تأكيد الاعتماد</Button>
            <Button variant="outline" onClick={() => setPending(null)}>تراجع</Button>
          </div>
        </div>
      )}

      {manage && pending === 'mark-paid' && (
        <form
          className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-space-md space-y-space-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (reference.trim().length >= 2) run('mark-paid');
          }}
        >
          <p className="text-sm">
            {s.direction === 'PLATFORM_PAYS_CARRIER'
              ? 'سجّل مرجع التحويل الذي دفعت به المنصة صافي المستحق للشركة.'
              : 'سجّل مرجع التحويل الذي دفعت به الشركة المبلغ المستحق للمنصة.'}
          </p>
          <Input label="مرجع الدفع" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={191} dir="ltr" required />
          <div className="flex gap-2">
            <Button type="submit" isLoading={action.isPending} disabled={reference.trim().length < 2}>تأكيد الدفع</Button>
            <Button type="button" variant="outline" onClick={() => setPending(null)}>تراجع</Button>
          </div>
        </form>
      )}

      {manage && pending === 'cancel' && (
        <div className="rounded-xl border border-error/40 bg-surface-container-lowest p-space-md space-y-space-sm">
          <p className="text-sm">سيُلغى الكشف وتصبح فترته متاحة لكشف جديد.</p>
          <div className="flex gap-2">
            <Button variant="danger" isLoading={action.isPending} onClick={() => run('cancel')}>تأكيد الإلغاء</Button>
            <Button variant="outline" onClick={() => setPending(null)}>تراجع</Button>
          </div>
        </div>
      )}

      {action.isError && <p role="alert" className="text-xs text-error">{carrierSettlementErrorMessage(action.error)}</p>}

      {isDraft && (
        <p className="text-xs text-on-surface-variant">
          المسودة تعكس البيانات وقت إنشائها أو آخر إعادة احتساب. الاعتماد يعيد الاحتساب تلقائيًا ثم يجمّد الأرقام نهائيًا.
        </p>
      )}

      <div className="grid gap-space-md lg:grid-cols-3">
        <Section title="بيانات الكشف" className="lg:col-span-2">
          <FieldGrid className="md:grid-cols-3">
            <Field label="شركة النقل">
              <Link to={`/companies/${s.company.id}`} className="text-secondary font-semibold hover:underline">{s.company.name}</Link>
            </Field>
            <Field label="الفترة"><span dir="ltr" className="tabular-nums">{formatPeriod(s.periodFrom, s.periodTo)}</span></Field>
            <Field label="عدد التذاكر"><span className="tabular-nums">{s.ticketsCount.toLocaleString('en-US')}</span></Field>
            <Field label="صافي المستحق"><span className="font-bold tabular-nums">{formatSdg(Math.abs(s.netPayableMinor))}</span></Field>
            <Field label="الاتجاه">{s.netPayableMinor === 0 ? '—' : DIRECTION_LABEL[s.direction]}</Field>
            <Field label="رسوم المنصة">{describeFee(s.config.feeType, s.config.feeValue)}</Field>
            <Field label="يتحمل عمولة الوكلاء">{COMMISSION_BEARER_LABEL[s.config.commissionBearer]}</Field>
            <Field label="مرجع الدفع"><Mono>{s.paymentReference ?? '—'}</Mono></Field>
            <Field label="ملاحظات"><span className="whitespace-pre-wrap">{s.notes ?? '—'}</span></Field>
            <Field label="أُنشئ">{formatDateTime(s.createdAt)}</Field>
            <Field label="اعتُمد">{formatDateTime(s.finalizedAt)}</Field>
            <Field label="دُفع">{formatDateTime(s.paidAt)}</Field>
            <Field label="المعرّف"><Mono>{s.id}</Mono></Field>
          </FieldGrid>
        </Section>
        <NetBreakdownCard totals={totalsFromSettlement(s)} />
      </div>

      <Section title="تفاصيل الرحلات">
        <StatementLinesTable lines={s.lines} carrierBearsCommission={s.config.commissionBearer === 'CARRIER'} />
      </Section>

      <NotDeletableNote>
        كشوف التسوية سجل مالي ولا تُحذف. الكشف غير المدفوع يُلغى فتصبح فترته متاحة لكشف جديد؛ الكشف المدفوع نهائي.
      </NotDeletableNote>
    </>
  );
};
