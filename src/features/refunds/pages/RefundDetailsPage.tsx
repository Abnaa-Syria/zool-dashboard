import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Field, FieldGrid, Mono, NotDeletableNote } from '../../../components/shared/DetailFields';
import { Badge } from '../../../components/ui/Badge';
import { ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { Section } from '../../admin/components/AdminUi';
import { useAuth } from '../../auth/auth-context';
import { BOOKING_STATUS_LABEL, PAYMENT_METHOD_LABEL } from '../../bookings/api';
import { MANUAL_REF_PREFIX, REFUND_REASON_LABEL, REFUND_STATUS_LABEL, REFUND_STATUS_VARIANT, refundErrorMessage, useRefund } from '../api';
import { RefundActions } from '../components/RefundActions';

const linkClass = 'text-secondary font-semibold hover:underline';

/** One customer refund (D-REF-02) with its booking, trip, customer and payment, plus retry / manual payout. */
export const RefundDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { can } = useAuth();
  const refund = useRefund(id);
  const [notice, setNotice] = React.useState<string | null>(null);
  const r = refund.data;
  const ref = r?.booking.bookingRef ?? r?.booking.id;

  const crumbs = [
    { label: 'الرئيسية والعمليات', path: '/overview' },
    { label: 'طابور الاسترداد', path: '/refunds/queue' },
    { label: r ? `استرداد ${ref}` : '...' },
  ];

  if (refund.isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (refund.isError || !r) {
    return (
      <div className="flex flex-col gap-space-md">
        <Breadcrumbs items={crumbs} />
        <ErrorState title="تعذّر تحميل الاسترداد" message={refundErrorMessage(refund.error)} onRetry={() => refund.refetch()} />
      </div>
    );
  }

  const manual = r.providerRef?.startsWith(MANUAL_REF_PREFIX) ?? false;
  const canAct = can('bookings.cancel') && r.status !== 'SUCCEEDED';
  const trip = r.booking.trip;

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={crumbs} />
      <PageHeader
        title={`استرداد ${formatSdg(r.amountMinor)}`}
        subtitle={`الحجز ${ref} · ${REFUND_REASON_LABEL[r.reason] ?? r.reason}`}
        badge={<Badge variant={REFUND_STATUS_VARIANT[r.status]} dot>{REFUND_STATUS_LABEL[r.status]}</Badge>}
        className="mb-0"
      />

      {notice && (
        <div role="status" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm bg-primary-fixed text-on-primary-fixed">
          <span>{notice}</span>
          <button type="button" aria-label="إغلاق" onClick={() => setNotice(null)} className="material-symbols-outlined text-[18px]">close</button>
        </div>
      )}

      <Section title="بيانات الاسترداد">
        <FieldGrid>
          <Field label="المبلغ"><span className="tabular-nums font-semibold">{formatSdg(r.amountMinor)}</span></Field>
          <Field label="الحالة">{REFUND_STATUS_LABEL[r.status]}</Field>
          <Field label="السبب">{REFUND_REASON_LABEL[r.reason] ?? r.reason}</Field>
          <Field label={manual ? 'مرجع الدفع اليدوي' : 'مرجع المزوّد'}>
            <Mono>{manual ? r.providerRef!.slice(MANUAL_REF_PREFIX.length) : (r.providerRef ?? '—')}</Mono>
          </Field>
          <Field label="تاريخ الطلب">{formatDateTime(r.createdAt)}</Field>
          <Field label="تاريخ التنفيذ">{formatDateTime(r.processedAt)}</Field>
          <Field label="المعرّف"><Mono>{r.id}</Mono></Field>
        </FieldGrid>
      </Section>

      <div className="grid gap-space-md lg:grid-cols-2">
        <Section title="الحجز والرحلة">
          <FieldGrid className="md:grid-cols-2">
            <Field label="رقم الحجز">
              <Link to={`/bookings/${r.booking.id}`} className={`${linkClass} font-mono text-xs`} dir="ltr">{ref}</Link>
            </Field>
            <Field label="حالة الحجز">{BOOKING_STATUS_LABEL[r.booking.status] ?? r.booking.status}</Field>
            <Field label="وسيلة الدفع">{PAYMENT_METHOD_LABEL[r.booking.paymentMethod] ?? r.booking.paymentMethod}</Field>
            <Field label="إجمالي الحجز">{formatSdg(r.booking.totalAmountMinor)}</Field>
            <Field label="الرحلة">
              <Link to={`/network/trips/${trip.id}`} className={linkClass}>{trip.origin} ← {trip.destination}</Link>
              {trip.tripNumber && <div><Mono>{trip.tripNumber}</Mono></div>}
            </Field>
            <Field label="موعد المغادرة">{formatDateTime(trip.departureAt)}</Field>
            <Field label="شركة النقل">
              <Link to={`/companies/${trip.company.id}`} className={linkClass}>{trip.company.name}</Link>
            </Field>
          </FieldGrid>
        </Section>

        <Section title="العميل والدفع الأصلي">
          <FieldGrid className="md:grid-cols-2">
            <Field label="العميل">
              {r.customer ? <Link to={`/travelers/${r.customer.id}`} className={linkClass}>{r.customer.displayName ?? 'بدون اسم'}</Link> : '—'}
            </Field>
            <Field label="الهاتف"><Mono>{r.customer?.phone ?? '—'}</Mono></Field>
            <Field label="مزوّد الدفع">{r.payment?.provider ?? '—'}</Field>
            <Field label="المبلغ المدفوع">{r.payment ? formatSdg(r.payment.amount) : '—'}</Field>
            <Field label="مرجع الدفع الأصلي"><Mono>{r.payment?.providerRef ?? '—'}</Mono></Field>
            <Field label="معرّف عملية الدفع"><Mono>{r.payment?.id ?? '—'}</Mono></Field>
          </FieldGrid>
        </Section>
      </div>

      {canAct && (
        <Section title="الإجراءات">
          <RefundActions refund={r} onDone={setNotice} />
        </Section>
      )}

      <NotDeletableNote>
        طلبات الاسترداد جزء من السجل المالي ولا يمكن حذفها. الاسترداد المعلّق أو الفاشل يُعاد إرساله لمزوّد الدفع أو يُسجَّل كمدفوع يدويًا.
      </NotDeletableNote>
    </div>
  );
};
