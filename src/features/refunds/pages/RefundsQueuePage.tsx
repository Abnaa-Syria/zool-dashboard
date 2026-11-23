import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { MetricCard } from '../../../components/ui/Card';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { useDebouncedValue } from '../../carriers/useDebouncedValue';
import { Pager } from '../../financials/components/Pager';
import { selectClass, usePageReset } from '../../financials/listState';
import { REFUND_REASON_LABEL, REFUND_STATUS_LABEL, REFUND_STATUS_VARIANT, refundErrorMessage, useRefunds, type RefundReason, type RefundStatus } from '../api';

const PAGE_SIZE = 20;

/**
 * Refunds queue (D-REF-02): customer-app refunds sent back to the original payment method.
 * PENDING/FAILED refunds can be re-sent to the provider or recorded as paid manually (bookings.cancel).
 */
export const RefundsQueuePage: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const q = useDebouncedValue(search.trim(), 300);
  const [status, setStatus] = React.useState<RefundStatus | ''>('');
  const [reason, setReason] = React.useState<RefundReason | ''>('');
  const [page, setPage] = usePageReset(`${q}|${status}|${reason}`);
  const navigate = useNavigate();

  const refunds = useRefunds({ page, pageSize: PAGE_SIZE, q: q || undefined, status: status || undefined, reason: reason || undefined });
  const rows = refunds.data?.data ?? [];
  const meta = refunds.data?.meta;
  const filtered = Boolean(q || status || reason);

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'المالية والتسويات', path: '/financials/wallets' }, { label: 'الإلغاءات والاسترداد' }]} />
      <PageHeader
        title="طابور الاسترداد"
        subtitle="مبالغ الحجوزات الملغاة أو المعدّلة من تطبيق العميل، تُعاد إلى وسيلة الدفع الأصلية. يمكن إعادة إرسال الاسترداد المعلّق أو تسجيله كمدفوع يدويًا مع مرجع التحويل."
        className="mb-0"
        actions={
          <Link to="/refunds/policies">
            <Button variant="outline" icon="policy">سياسة الإلغاء والاسترداد</Button>
          </Link>
        }
      />

      <div className="grid gap-space-md sm:grid-cols-3">
        <MetricCard
          title="استردادات قيد التنفيذ"
          value={meta ? meta.pendingCount.toLocaleString('en-US') : '—'}
          icon="pending_actions"
          iconBg="bg-[#FEF3C7] text-[#B45309]"
        />
        <MetricCard title="إجمالي المبالغ المعلّقة" value={meta ? formatSdg(meta.pendingAmountMinor) : '—'} icon="account_balance" />
        <MetricCard
          title={filtered ? 'نتائج التصفية الحالية' : 'إجمالي طلبات الاسترداد'}
          value={meta ? meta.total.toLocaleString('en-US') : '—'}
          icon="assignment_return"
        />
      </div>

      <div className="flex flex-wrap items-center gap-space-sm">
        <div className="w-full sm:w-80">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="بحث برقم الحجز أو مرجع الدفع..." />
        </div>
        <select aria-label="الحالة" value={status} onChange={(e) => setStatus(e.target.value as RefundStatus | '')} className={selectClass}>
          <option value="">كل الحالات</option>
          {(Object.keys(REFUND_STATUS_LABEL) as RefundStatus[]).map((s) => (
            <option key={s} value={s}>{REFUND_STATUS_LABEL[s]}</option>
          ))}
        </select>
        <select aria-label="السبب" value={reason} onChange={(e) => setReason(e.target.value as RefundReason | '')} className={selectClass}>
          <option value="">كل الأسباب</option>
          {(Object.keys(REFUND_REASON_LABEL) as RefundReason[]).map((r) => (
            <option key={r} value={r}>{REFUND_REASON_LABEL[r]}</option>
          ))}
        </select>
      </div>

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
        {refunds.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : refunds.isError ? (
          <ErrorState title="تعذّر تحميل طلبات الاسترداد" message={refundErrorMessage(refunds.error)} onRetry={() => refunds.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={filtered ? 'لا توجد نتائج مطابقة' : 'لا توجد طلبات استرداد'}
            description={
              filtered
                ? 'غيّر البحث أو عوامل التصفية.'
                : 'تظهر هنا الاستردادات تلقائيًا عند إلغاء عميل لحجز مدفوع إلكترونيًا، أو إلغاء الناقل للرحلة، أو تعديل رحلة بفرق سعر.'
            }
            icon="assignment_return"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">الحجز</th>
                  <th className="py-2 px-2 font-medium">العميل</th>
                  <th className="py-2 px-2 font-medium">الرحلة</th>
                  <th className="py-2 px-2 font-medium">المبلغ</th>
                  <th className="py-2 px-2 font-medium">السبب</th>
                  <th className="py-2 px-2 font-medium">الحالة</th>
                  <th className="py-2 px-2 font-medium">تاريخ الطلب</th>
                  <th className="py-2 px-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} onClick={() => navigate(`/refunds/${r.id}`)} className="border-t border-surface-container hover:bg-surface-container/50 align-top cursor-pointer">
                    <td className="py-2 px-2">
                      <Link to={`/bookings/${r.booking.id}`} onClick={(e) => e.stopPropagation()} className="font-mono text-xs font-semibold text-secondary" dir="ltr">
                        {r.booking.bookingRef ?? r.booking.id}
                      </Link>
                    </td>
                    <td className="py-2 px-2">
                      {r.customer ? (
                        <>
                          <Link to={`/travelers/${r.customer.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-secondary">{r.customer.displayName ?? 'بدون اسم'}</Link>
                          {r.customer.phone && <div className="font-mono text-xs text-on-surface-variant" dir="ltr">{r.customer.phone}</div>}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2 px-2">
                      <div>{r.booking.trip.origin} ← {r.booking.trip.destination}</div>
                      <div className="text-xs text-on-surface-variant">{r.booking.trip.company.name} · {formatDateTime(r.booking.trip.departureAt)}</div>
                    </td>
                    <td className="py-2 px-2 tabular-nums font-semibold">{formatSdg(r.amountMinor)}</td>
                    <td className="py-2 px-2 text-xs">{REFUND_REASON_LABEL[r.reason] ?? r.reason}</td>
                    <td className="py-2 px-2">
                      <Badge variant={REFUND_STATUS_VARIANT[r.status]} dot>{REFUND_STATUS_LABEL[r.status]}</Badge>
                      {r.processedAt && <div className="text-xs text-on-surface-variant mt-1">{formatDateTime(r.processedAt)}</div>}
                    </td>
                    <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(r.createdAt)}</td>
                    <td className="py-2 px-2">
                      <Link to={`/refunds/${r.id}`} onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" variant="outline" icon="visibility">عرض</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={meta} busy={refunds.isFetching} onPage={setPage} />
      </section>
    </div>
  );
};
