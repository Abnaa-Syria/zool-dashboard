import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { MetricCard } from '../../../components/ui/Card';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import { financeErrorMessage, useOfficeLookup, type OfficeRef } from '../../financials/api';
import { OfficeSelect } from '../../financials/components/OfficeSelect';
import { Pager } from '../../financials/components/Pager';
import { selectClass, usePageReset } from '../../financials/listState';
import {
  ACCRUAL_STATUS_LABEL,
  ACCRUAL_STATUS_VARIANT,
  SETTLEMENT_STATUS_LABEL,
  SETTLEMENT_STATUS_VARIANT,
  useAccruals,
  useSettlements,
  type AccrualStatus,
  type CommissionSummary,
  type SettlementStatus,
} from '../api';
import { CreateSettlementModal } from '../components/CreateSettlementModal';
import { formatPeriod } from '../period';

const PAGE_SIZE = 20;
type Tab = 'settlements' | 'accruals';

/** Broker commission settlements (D-SET-01) + the accrual ledger behind them. */
export const SettlementsPage: React.FC = () => {
  const { can } = useAuth();
  const [tab, setTab] = React.useState<Tab>('settlements');
  const [officeId, setOfficeId] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);
  const navigate = useNavigate();
  const openSettlement = (id: string) => navigate(`/financials/settlements/${id}`);
  const offices = useOfficeLookup();
  const officeById = React.useMemo(() => new Map((offices.data ?? []).map((o) => [o.id, o])), [offices.data]);

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'المالية والتسويات', path: '/financials/wallets' }, { label: 'العمولات والتسويات' }]} />
      <PageHeader
        title="عمولات الوكلاء والتسويات"
        subtitle="تُستحق عمولة المكتب عند تأكيد الحجز. التسوية تحجز العمولات غير المسوّاة لفترة، ثم تُعتمد يدويًا بعد صرفها خارجيًا."
        className="mb-0"
        actions={can('commissions.payout') ? <Button icon="add" onClick={() => setCreateOpen(true)}>تسوية جديدة</Button> : null}
      />

      <div className="flex flex-wrap items-center gap-space-sm">
        <div className="flex gap-1 bg-surface-container rounded-lg p-1" role="tablist" aria-label="العرض">
          {(
            [
              ['settlements', 'التسويات'],
              ['accruals', 'سجل العمولات'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`px-3 py-1 rounded-md text-sm ${tab === key ? 'bg-surface-container-lowest shadow-sm font-semibold text-on-surface' : 'text-on-surface-variant'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <OfficeSelect offices={offices.data} value={officeId} onChange={setOfficeId} />
      </div>

      {tab === 'settlements' ? (
        <SettlementsTab officeId={officeId} officeById={officeById} onOpen={openSettlement} />
      ) : (
        <AccrualsTab officeId={officeId} officeById={officeById} onOpenSettlement={openSettlement} />
      )}

      {createOpen && (
        <CreateSettlementModal
          onClose={() => setCreateOpen(false)}
          onCreated={(s) => {
            setCreateOpen(false);
            openSettlement(s.id);
          }}
        />
      )}
    </div>
  );
};

type TabProps = { officeId: string; officeById: Map<string, OfficeRef> };

const SettlementsTab: React.FC<TabProps & { onOpen: (id: string) => void }> = ({ officeId, officeById, onOpen }) => {
  const [status, setStatus] = React.useState<SettlementStatus | ''>('');
  const [page, setPage] = usePageReset(`${officeId}|${status}`);
  const list = useSettlements({ page, pageSize: PAGE_SIZE, officeId: officeId || undefined, status: status || undefined });
  const rows = list.data?.data ?? [];

  return (
    <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md space-y-space-sm">
      <select aria-label="حالة التسوية" value={status} onChange={(e) => setStatus(e.target.value as SettlementStatus | '')} className={selectClass}>
        <option value="">كل الحالات</option>
        {(Object.keys(SETTLEMENT_STATUS_LABEL) as SettlementStatus[]).map((s) => (
          <option key={s} value={s}>{SETTLEMENT_STATUS_LABEL[s]}</option>
        ))}
      </select>
      {list.isLoading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : list.isError ? (
        <ErrorState title="تعذّر تحميل التسويات" message={financeErrorMessage(list.error)} onRetry={() => list.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="لا توجد تسويات" description="أنشئ تسوية لمكتب وفترة لحجز عمولاته غير المسوّاة." icon="currency_exchange" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-on-surface-variant text-xs">
              <tr className="text-right">
                <th className="py-2 px-2 font-medium">المكتب</th>
                <th className="py-2 px-2 font-medium">الفترة</th>
                <th className="py-2 px-2 font-medium">الإجمالي</th>
                <th className="py-2 px-2 font-medium">الحجوزات</th>
                <th className="py-2 px-2 font-medium">الحالة</th>
                <th className="py-2 px-2 font-medium">مرجع الصرف</th>
                <th className="py-2 px-2 font-medium">أُنشئت</th>
                <th className="py-2 px-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} onClick={() => onOpen(s.id)} className="border-t border-surface-container hover:bg-surface-container/50 cursor-pointer">
                  <td className="py-2 px-2">
                    <Link to={`/brokers/${s.officeId}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-secondary">{officeById.get(s.officeId)?.name ?? s.officeCode ?? s.officeId}</Link>
                  </td>
                  <td className="py-2 px-2 tabular-nums whitespace-nowrap" dir="ltr">{formatPeriod(s.periodFrom, s.periodTo)}</td>
                  <td className="py-2 px-2 tabular-nums font-semibold">{formatSdg(s.totalAmountMinor)}</td>
                  <td className="py-2 px-2 tabular-nums">{s.accrualCount ?? '—'}</td>
                  <td className="py-2 px-2"><Badge variant={SETTLEMENT_STATUS_VARIANT[s.status]}>{SETTLEMENT_STATUS_LABEL[s.status]}</Badge></td>
                  <td className="py-2 px-2 font-mono text-xs" dir="ltr">{s.payoutReference ?? '—'}</td>
                  <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(s.createdAt)}</td>
                  <td className="py-2 px-2 text-left">
                    <Link to={`/financials/settlements/${s.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" icon="visibility">عرض</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager meta={list.data?.meta} busy={list.isFetching} onPage={setPage} />
    </section>
  );
};

const AccrualsTab: React.FC<TabProps & { onOpenSettlement: (id: string) => void }> = ({ officeId, officeById, onOpenSettlement }) => {
  const [status, setStatus] = React.useState<AccrualStatus | ''>('');
  const [page, setPage] = usePageReset(`${officeId}|${status}`);
  const list = useAccruals({ page, pageSize: PAGE_SIZE, officeId: officeId || undefined, status: status || undefined });
  const rows = list.data?.data ?? [];
  const summary = list.data?.meta?.summary as CommissionSummary | undefined;

  return (
    <>
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          <MetricCard title="غير مسوّاة" value={formatSdg(summary.unsettledTotalMinor)} subValue={`${summary.unsettledCount} حجز`} icon="pending" />
          <MetricCard title="محجوزة في مسودات" value={formatSdg(summary.reservedTotalMinor)} subValue={`${summary.reservedCount} حجز`} icon="lock_clock" />
          <MetricCard title="مسوّاة (مصروفة)" value={formatSdg(summary.settledTotalMinor)} icon="task_alt" />
          <MetricCard title="مستردة بسبب الإلغاء" value={formatSdg(summary.clawedBackTotalMinor)} icon="undo" />
        </div>
      )}
      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md space-y-space-sm">
        <select aria-label="حالة العمولة" value={status} onChange={(e) => setStatus(e.target.value as AccrualStatus | '')} className={selectClass}>
          <option value="">كل الحالات</option>
          {(Object.keys(ACCRUAL_STATUS_LABEL) as AccrualStatus[]).map((s) => (
            <option key={s} value={s}>{ACCRUAL_STATUS_LABEL[s]}</option>
          ))}
        </select>
        {list.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : list.isError ? (
          <ErrorState title="تعذّر تحميل العمولات" message={financeErrorMessage(list.error)} onRetry={() => list.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState title="لا توجد عمولات مطابقة" description="تُستحق العمولة تلقائيًا عند تأكيد حجز من مكتب وكيل." icon="currency_exchange" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">الحجز</th>
                  <th className="py-2 px-2 font-medium">المكتب</th>
                  <th className="py-2 px-2 font-medium">قيمة الحجز</th>
                  <th className="py-2 px-2 font-medium">العمولة</th>
                  <th className="py-2 px-2 font-medium">الحالة</th>
                  <th className="py-2 px-2 font-medium">التسوية</th>
                  <th className="py-2 px-2 font-medium">تأكيد الحجز</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="border-t border-surface-container hover:bg-surface-container/50">
                    <td className="py-2 px-2 font-mono text-xs" dir="ltr">
                      <Link to={`/bookings/${a.bookingId}`} className="text-secondary">{a.bookingId.slice(-8).toUpperCase()}</Link>
                    </td>
                    <td className="py-2 px-2">
                      <Link to={`/brokers/${a.officeId}`} className="text-secondary">{officeById.get(a.officeId)?.name ?? a.officeCode}</Link>
                    </td>
                    <td className="py-2 px-2 tabular-nums">{formatSdg(a.booking.totalAmountMinor)}</td>
                    <td className="py-2 px-2 tabular-nums font-semibold">{formatSdg(a.amountMinor)}</td>
                    <td className="py-2 px-2"><Badge variant={ACCRUAL_STATUS_VARIANT[a.status]} size="sm">{ACCRUAL_STATUS_LABEL[a.status]}</Badge></td>
                    <td className="py-2 px-2">
                      {a.settlementId ? (
                        <button type="button" className="text-secondary text-xs" onClick={() => onOpenSettlement(a.settlementId!)}>عرض</button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(a.booking.confirmedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={list.data?.meta} busy={list.isFetching} onPage={setPage} />
      </section>
    </>
  );
};
