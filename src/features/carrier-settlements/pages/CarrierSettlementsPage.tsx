import * as React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import { useCarriers } from '../../carriers/api';
import { Pager } from '../../financials/components/Pager';
import { selectClass, usePageReset } from '../../financials/listState';
import { formatPeriod } from '../../settlements/period';
import {
  CARRIER_SETTLEMENT_STATUS_LABEL,
  CARRIER_SETTLEMENT_STATUS_VARIANT,
  carrierSettlementErrorMessage,
  useCarrierSettlements,
  type CarrierSettlementStatus,
} from '../api';
import { DIRECTION_LABEL } from '../breakdown';
import { CarrierSelect } from '../components/CarrierSelect';
import { CreateCarrierSettlementModal } from '../components/CreateCarrierSettlementModal';

const PAGE_SIZE = 20;

/** D-REV-02 carrier settlement statements (what the platform owes each transport company, or vice versa). */
export const CarrierSettlementsPage: React.FC = () => {
  const { can } = useAuth();
  const [params, setParams] = useSearchParams();
  const companyId = params.get('companyId') ?? '';
  const [status, setStatus] = React.useState<CarrierSettlementStatus | ''>('');
  const [page, setPage] = usePageReset(`${companyId}|${status}`);
  const [createOpen, setCreateOpen] = React.useState(false);
  const navigate = useNavigate();
  const carriers = useCarriers({ page: 1, pageSize: 100 });
  const list = useCarrierSettlements({ page, pageSize: PAGE_SIZE, companyId: companyId || undefined, status: status || undefined });
  const rows = list.data?.data ?? [];

  const setCompanyId = (id: string) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (id) next.set('companyId', id);
        else next.delete('companyId');
        return next;
      },
      { replace: true },
    );

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'المالية والتسويات', path: '/financials/wallets' }, { label: 'تسويات شركات النقل' }]} />
      <PageHeader
        title="تسويات شركات النقل"
        subtitle="كشف دوري لكل شركة: المبيعات الإلكترونية ومبيعات الوكلاء وخصومات المنصة، ناقص المستردات ورسوم المنصة وعمولة الوكلاء (إن تحملتها الشركة). النقد الذي حصّله السائقون يبقى لدى الشركة ويظهر للعلم."
        className="mb-0"
        actions={can('carriers.manage') ? <Button icon="add" onClick={() => setCreateOpen(true)}>كشف جديد</Button> : null}
      />

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md space-y-space-sm">
        <div className="flex flex-wrap gap-space-sm">
          <CarrierSelect carriers={carriers.data?.data} value={companyId} onChange={setCompanyId} />
          <select aria-label="حالة الكشف" value={status} onChange={(e) => setStatus(e.target.value as CarrierSettlementStatus | '')} className={selectClass}>
            <option value="">كل الحالات</option>
            {(Object.keys(CARRIER_SETTLEMENT_STATUS_LABEL) as CarrierSettlementStatus[]).map((s) => (
              <option key={s} value={s}>{CARRIER_SETTLEMENT_STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
        {list.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : list.isError ? (
          <ErrorState title="تعذّر تحميل الكشوف" message={carrierSettlementErrorMessage(list.error)} onRetry={() => list.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState title="لا توجد كشوف تسوية" description="أنشئ كشفًا لشركة وفترة منتهية بعد معاينة أرقامه." icon="request_quote" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">الشركة</th>
                  <th className="py-2 px-2 font-medium">الفترة</th>
                  <th className="py-2 px-2 font-medium">التذاكر</th>
                  <th className="py-2 px-2 font-medium">صافي المستحق</th>
                  <th className="py-2 px-2 font-medium">الاتجاه</th>
                  <th className="py-2 px-2 font-medium">الحالة</th>
                  <th className="py-2 px-2 font-medium">مرجع الدفع</th>
                  <th className="py-2 px-2 font-medium">أُنشئ</th>
                  <th className="py-2 px-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id} onClick={() => navigate(`/financials/carrier-settlements/${s.id}`)} className="border-t border-surface-container hover:bg-surface-container/50 cursor-pointer">
                    <td className="py-2 px-2">
                      <Link to={`/companies/${s.company.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-secondary">{s.company.name}</Link>
                    </td>
                    <td className="py-2 px-2 tabular-nums whitespace-nowrap" dir="ltr">{formatPeriod(s.periodFrom, s.periodTo)}</td>
                    <td className="py-2 px-2 tabular-nums">{s.ticketsCount}</td>
                    <td className="py-2 px-2 tabular-nums font-semibold whitespace-nowrap">{formatSdg(Math.abs(s.netPayableMinor))}</td>
                    <td className="py-2 px-2 text-xs">
                      {s.netPayableMinor === 0 ? '—' : (
                        <Badge size="sm" variant={s.direction === 'CARRIER_PAYS_PLATFORM' ? 'warning' : 'success'}>{DIRECTION_LABEL[s.direction]}</Badge>
                      )}
                    </td>
                    <td className="py-2 px-2"><Badge variant={CARRIER_SETTLEMENT_STATUS_VARIANT[s.status]}>{CARRIER_SETTLEMENT_STATUS_LABEL[s.status]}</Badge></td>
                    <td className="py-2 px-2 font-mono text-xs" dir="ltr">{s.paymentReference ?? '—'}</td>
                    <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(s.createdAt)}</td>
                    <td className="py-2 px-2 text-left">
                      <Link to={`/financials/carrier-settlements/${s.id}`} onClick={(e) => e.stopPropagation()}>
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

      {createOpen && (
        <CreateCarrierSettlementModal
          carriers={carriers.data?.data}
          initialCompanyId={companyId || undefined}
          onClose={() => setCreateOpen(false)}
          onCreated={(s) => {
            setCreateOpen(false);
            navigate(`/financials/carrier-settlements/${s.id}`);
          }}
        />
      )}
    </div>
  );
};
