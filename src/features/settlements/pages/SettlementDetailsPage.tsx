import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Field, FieldGrid, Mono, NotDeletableNote } from '../../../components/shared/DetailFields';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { Section } from '../../admin/components/AdminUi';
import { useAuth } from '../../auth/auth-context';
import { financeErrorMessage, useOfficeLookup } from '../../financials/api';
import { Pager } from '../../financials/components/Pager';
import {
  ACCRUAL_STATUS_LABEL,
  ACCRUAL_STATUS_VARIANT,
  SETTLEMENT_STATUS_LABEL,
  SETTLEMENT_STATUS_VARIANT,
  useCancelSettlement,
  useFinalizeSettlement,
  useSettlement,
  useSettlementAccruals,
  type Settlement,
} from '../api';
import { formatPeriod } from '../period';

/** Broker commission settlement (D-SET-01): fields, reserved accruals, finalize / cancel for DRAFT. */
export const SettlementDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { can } = useAuth();
  const settlement = useSettlement(id);
  const offices = useOfficeLookup();
  const [action, setAction] = React.useState<'finalize' | 'cancel' | null>(null);
  const s = settlement.data;
  const officeName = s ? offices.data?.find((o) => o.id === s.officeId)?.name : undefined;
  const officeLabel = s ? (officeName ?? s.officeCode ?? s.officeId) : '';

  const crumbs = [
    { label: 'الرئيسية والعمليات', path: '/overview' },
    { label: 'العمولات والتسويات', path: '/financials/settlements' },
    { label: s ? `تسوية ${officeLabel}` : '...' },
  ];

  if (settlement.isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (settlement.isError || !s) {
    return (
      <div className="flex flex-col gap-space-md">
        <Breadcrumbs items={crumbs} />
        <ErrorState title="تعذّر تحميل التسوية" message={financeErrorMessage(settlement.error)} onRetry={() => settlement.refetch()} />
      </div>
    );
  }

  const canPayout = can('commissions.payout') && s.status === 'DRAFT';

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title={`تسوية عمولات ${officeLabel}`}
        subtitle={`الفترة ${formatPeriod(s.periodFrom, s.periodTo)}`}
        badge={<Badge variant={SETTLEMENT_STATUS_VARIANT[s.status]} dot>{SETTLEMENT_STATUS_LABEL[s.status]}</Badge>}
        className="mb-0"
        actions={
          canPayout && action === null ? (
            <>
              <Button icon="paid" onClick={() => setAction('finalize')}>تسجيل الصرف واعتماد التسوية</Button>
              <Button variant="outline" icon="block" onClick={() => setAction('cancel')}>إلغاء المسودة</Button>
            </>
          ) : null
        }
      />

      {canPayout && action === 'finalize' && <FinalizeForm settlement={s} onClose={() => setAction(null)} />}
      {canPayout && action === 'cancel' && <CancelConfirm settlement={s} onClose={() => setAction(null)} />}

      <Section title="بيانات التسوية">
        <FieldGrid>
          <Field label="المكتب">
            <Link to={`/brokers/${s.officeId}`} className="text-secondary font-semibold hover:underline">{officeLabel}</Link>
            {s.officeCode && <div><Mono>{s.officeCode}</Mono></div>}
          </Field>
          <Field label="الفترة"><span dir="ltr" className="tabular-nums">{formatPeriod(s.periodFrom, s.periodTo)}</span></Field>
          <Field label="إجمالي العمولة"><span className="font-bold tabular-nums">{formatSdg(s.totalAmountMinor)}</span></Field>
          <Field label="عدد الحجوزات"><span className="tabular-nums">{s.accrualCount ?? '—'}</span></Field>
          <Field label="مرجع الصرف"><Mono>{s.payoutReference ?? '—'}</Mono></Field>
          <Field label="ملاحظة">{s.note ?? '—'}</Field>
          <Field label="العملة">{s.currency}</Field>
          <Field label="أُنشئت">{formatDateTime(s.createdAt)}</Field>
          <Field label="صُرفت">{formatDateTime(s.finalizedAt)}</Field>
          <Field label="آخر تحديث">{formatDateTime(s.updatedAt)}</Field>
          <Field label="أنشأها (معرّف المشرف)">
            {s.initiatedByAdminId ? <Link to={`/admin/team/${s.initiatedByAdminId}`} className="text-secondary"><Mono>{s.initiatedByAdminId}</Mono></Link> : '—'}
          </Field>
          <Field label="اعتمدها (معرّف المشرف)">
            {s.finalizedByAdminId ? <Link to={`/admin/team/${s.finalizedByAdminId}`} className="text-secondary"><Mono>{s.finalizedByAdminId}</Mono></Link> : '—'}
          </Field>
          <Field label="المعرّف"><Mono>{s.id}</Mono></Field>
        </FieldGrid>
      </Section>

      <AccrualsSection id={s.id} />

      <NotDeletableNote>
        التسويات سجل مالي ولا تُحذف. المسودة تُلغى (فتعود عمولاتها «غير مسوّاة»)، والتسوية المصروفة نهائية.
      </NotDeletableNote>
    </div>
  );
};

const FinalizeForm: React.FC<{ settlement: Settlement; onClose: () => void }> = ({ settlement, onClose }) => {
  const finalize = useFinalizeSettlement();
  const [payoutReference, setPayoutReference] = React.useState('');
  const [note, setNote] = React.useState('');
  return (
    <form
      className="rounded-xl border border-surface-container-high bg-surface-container-lowest p-space-md space-y-space-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (!payoutReference.trim()) return;
        finalize.mutate({ id: settlement.id, payoutReference: payoutReference.trim(), note: note.trim() || undefined }, { onSuccess: onClose });
      }}
    >
      <p className="text-sm">
        سجّل مرجع التحويل الخارجي الذي صُرفت به العمولة ({formatSdg(settlement.totalAmountMinor)}) للمكتب. الاعتماد نهائي: تتحول العمولات المحجوزة إلى «مسوّاة»، ولا يُخصم شيء من المحفظة.
      </p>
      <Input label="مرجع الصرف" value={payoutReference} onChange={(e) => setPayoutReference(e.target.value)} maxLength={128} dir="ltr" required />
      <Input label="ملاحظة (اختياري)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
      {finalize.isError && <p className="text-xs text-error">{financeErrorMessage(finalize.error)}</p>}
      <div className="flex gap-2">
        <Button type="submit" isLoading={finalize.isPending} disabled={!payoutReference.trim()}>تأكيد الاعتماد</Button>
        <Button type="button" variant="outline" onClick={onClose}>تراجع</Button>
      </div>
    </form>
  );
};

const CancelConfirm: React.FC<{ settlement: Settlement; onClose: () => void }> = ({ settlement, onClose }) => {
  const cancel = useCancelSettlement();
  return (
    <div className="rounded-xl border border-error/40 bg-surface-container-lowest p-space-md space-y-space-sm">
      <p className="text-sm">ستُلغى المسودة وتعود عمولاتها إلى «غير مسوّاة» لتدخل في تسوية لاحقة.</p>
      {cancel.isError && <p className="text-xs text-error">{financeErrorMessage(cancel.error)}</p>}
      <div className="flex gap-2">
        <Button variant="danger" isLoading={cancel.isPending} onClick={() => cancel.mutate(settlement.id, { onSuccess: onClose })}>تأكيد الإلغاء</Button>
        <Button variant="outline" onClick={onClose}>تراجع</Button>
      </div>
    </div>
  );
};

const AccrualsSection: React.FC<{ id: string }> = ({ id }) => {
  const [page, setPage] = React.useState(1);
  const accruals = useSettlementAccruals(id, page);
  const rows = accruals.data?.data ?? [];
  return (
    <Section title="العمولات المرتبطة">
      {accruals.isLoading ? (
        <Skeleton className="h-32 rounded-lg" />
      ) : accruals.isError ? (
        <ErrorState title="تعذّر تحميل العمولات" message={financeErrorMessage(accruals.error)} onRetry={() => accruals.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="لا توجد عمولات مرتبطة" description="تُفك العمولات عند إلغاء المسودة." icon="currency_exchange" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-on-surface-variant text-xs">
              <tr className="text-right">
                <th className="py-2 px-2 font-medium">الحجز</th>
                <th className="py-2 px-2 font-medium">العمولة</th>
                <th className="py-2 px-2 font-medium">الحالة</th>
                <th className="py-2 px-2 font-medium">تأكيد الحجز</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-t border-surface-container">
                  <td className="py-2 px-2 font-mono text-xs" dir="ltr">
                    <Link to={`/bookings/${a.bookingId}`} className="text-secondary">{a.bookingId.slice(-8).toUpperCase()}</Link>
                  </td>
                  <td className="py-2 px-2 tabular-nums">{formatSdg(a.amountMinor)}</td>
                  <td className="py-2 px-2"><Badge variant={ACCRUAL_STATUS_VARIANT[a.status]} size="sm">{ACCRUAL_STATUS_LABEL[a.status]}</Badge></td>
                  <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(a.confirmedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager meta={accruals.data?.meta} busy={accruals.isFetching} onPage={setPage} />
    </Section>
  );
};
