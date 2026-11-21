import * as React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import { OFFICE_STATUS_LABEL, SETTLEMENT_PERIOD_LABEL, useBrokerOffices, type OfficeStatus } from '../api';
import { AddBrokerModal } from '../components/AddBrokerModal';
import { useDebouncedValue } from '../useDebouncedValue';

const PAGE_SIZE = 20;

export const BrokersListPage: React.FC = () => {
  const { can } = useAuth();
  const [search, setSearch] = React.useState('');
  const q = useDebouncedValue(search.trim(), 300);
  const [status, setStatus] = React.useState<OfficeStatus | ''>('');
  const [page, setPage] = React.useState(1);
  const [addOpen, setAddOpen] = React.useState(false);

  // Reset to page 1 whenever the filters change (render-time state adjustment, no effect).
  const filterKey = `${q}|${status}`;
  const [prevFilterKey, setPrevFilterKey] = React.useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const offices = useBrokerOffices({ page, pageSize: PAGE_SIZE, q: q || undefined, status: status || undefined });
  const rows = offices.data?.data ?? [];
  const meta = offices.data?.meta;

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'الرئيسية والعمليات', path: '/overview' }, { label: 'مكاتب الوكلاء' }]} />
      <PageHeader
        title="مكاتب الوكلاء"
        subtitle="مكاتب البيع بالمحفظة المسبقة الدفع، وموظفوها والشركات المرتبطة بها."
        className="mb-0"
        actions={can('brokers.manage') ? <Button icon="add" onClick={() => setAddOpen(true)}>إضافة مكتب</Button> : null}
      />

      <div className="flex flex-wrap items-center gap-space-sm">
        <div className="w-full sm:w-80">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="بحث بالاسم أو الرمز..." />
        </div>
        <select
          aria-label="الحالة"
          value={status}
          onChange={(e) => setStatus(e.target.value as OfficeStatus | '')}
          className="h-10 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm"
        >
          <option value="">كل الحالات</option>
          <option value="ACTIVE">{OFFICE_STATUS_LABEL.ACTIVE}</option>
          <option value="SUSPENDED">{OFFICE_STATUS_LABEL.SUSPENDED}</option>
        </select>
        {meta && <span className="text-xs text-on-surface-variant">{meta.total.toLocaleString('en-US')} مكتب</span>}
      </div>

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
        {offices.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : offices.isError ? (
          <ErrorState title="تعذّر تحميل المكاتب" message={errorMessage(offices.error)} onRetry={() => offices.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={q || status ? 'لا توجد نتائج مطابقة' : 'لا توجد مكاتب بعد'}
            description={q || status ? 'غيّر البحث أو عامل التصفية.' : 'أضف أول مكتب وكيل مع مديره.'}
            icon="storefront"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">المكتب</th>
                  <th className="py-2 px-2 font-medium">الرمز</th>
                  <th className="py-2 px-2 font-medium">رصيد المحفظة</th>
                  <th className="py-2 px-2 font-medium">دورة التسوية</th>
                  <th className="py-2 px-2 font-medium">الحالة</th>
                  <th className="py-2 px-2 font-medium">تاريخ الإضافة</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id} className="border-t border-surface-container hover:bg-surface-container/50">
                    <td className="py-2 px-2">
                      <Link to={`/brokers/${o.id}`} className="font-semibold text-secondary">{o.name}</Link>
                    </td>
                    <td className="py-2 px-2 font-mono text-xs" dir="ltr">{o.code}</td>
                    <td className="py-2 px-2 tabular-nums">{formatSdg(o.wallet?.balanceMinor)}</td>
                    <td className="py-2 px-2">{SETTLEMENT_PERIOD_LABEL[o.settlementPeriod]}</td>
                    <td className="py-2 px-2">
                      <Badge variant={o.status === 'ACTIVE' ? 'success' : 'error'} dot>{OFFICE_STATUS_LABEL[o.status]}</Badge>
                    </td>
                    <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-space-sm mt-space-sm border-t border-surface-container text-xs text-on-surface-variant">
            <span>صفحة {meta.page} من {meta.totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1 || offices.isFetching} onClick={() => setPage((p) => p - 1)}>السابق</Button>
              <Button size="sm" variant="outline" disabled={page >= meta.totalPages || offices.isFetching} onClick={() => setPage((p) => p + 1)}>التالي</Button>
            </div>
          </div>
        )}
      </section>

      <AddBrokerModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
};
