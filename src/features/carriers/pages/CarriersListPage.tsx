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
import { useAuth } from '../../auth/auth-context';
import { CARRIER_STATUS_LABEL, useCarriers, type CarrierStatus } from '../api';
import { AddCarrierModal } from '../components/AddCarrierModal';
import { useDebouncedValue } from '../useDebouncedValue';

const PAGE_SIZE = 20;

export const CarriersListPage: React.FC = () => {
  const { can } = useAuth();
  const [search, setSearch] = React.useState('');
  const q = useDebouncedValue(search.trim(), 300);
  const [status, setStatus] = React.useState<CarrierStatus | ''>('');
  const [page, setPage] = React.useState(1);
  const [addOpen, setAddOpen] = React.useState(false);

  // Reset to page 1 whenever the filters change (render-time state adjustment, no effect).
  const filterKey = `${q}|${status}`;
  const [prevFilterKey, setPrevFilterKey] = React.useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const carriers = useCarriers({ page, pageSize: PAGE_SIZE, q: q || undefined, status: status || undefined });
  const rows = carriers.data?.data ?? [];
  const meta = carriers.data?.meta;

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'الرئيسية والعمليات', path: '/overview' }, { label: 'شركات النقل' }]} />
      <PageHeader
        title="شركات النقل"
        subtitle="الشركات المشغّلة للرحلات. إيقاف شركة يوقف البيع فورًا (D-SUS-01)."
        className="mb-0"
        actions={can('carriers.manage') ? <Button icon="add" onClick={() => setAddOpen(true)}>إضافة شركة</Button> : null}
      />

      <div className="flex flex-wrap items-center gap-space-sm">
        <div className="w-full sm:w-80">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="بحث بالاسم أو المفتاح..." />
        </div>
        <select
          aria-label="الحالة"
          value={status}
          onChange={(e) => setStatus(e.target.value as CarrierStatus | '')}
          className="h-10 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm"
        >
          <option value="">كل الحالات</option>
          <option value="ACTIVE">{CARRIER_STATUS_LABEL.ACTIVE}</option>
          <option value="SUSPENDED">{CARRIER_STATUS_LABEL.SUSPENDED}</option>
        </select>
        {meta && <span className="text-xs text-on-surface-variant">{meta.total.toLocaleString('en-US')} شركة</span>}
      </div>

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
        {carriers.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : carriers.isError ? (
          <ErrorState title="تعذّر تحميل الشركات" message={errorMessage(carriers.error)} onRetry={() => carriers.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={q || status ? 'لا توجد نتائج مطابقة' : 'لا توجد شركات بعد'}
            description={q || status ? 'غيّر البحث أو عامل التصفية.' : 'أضف أول شركة نقل لبدء جدولة الرحلات.'}
            icon="departure_board"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">الشركة</th>
                  <th className="py-2 px-2 font-medium">المفتاح</th>
                  <th className="py-2 px-2 font-medium">الحالة</th>
                  <th className="py-2 px-2 font-medium">المكاتب المرتبطة</th>
                  <th className="py-2 px-2 font-medium">تاريخ الإضافة</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-t border-surface-container hover:bg-surface-container/50">
                    <td className="py-2 px-2">
                      <Link to={`/companies/${c.id}`} className="font-semibold text-secondary">{c.name}</Link>
                    </td>
                    <td className="py-2 px-2 font-mono text-xs" dir="ltr">{c.key}</td>
                    <td className="py-2 px-2">
                      <Badge variant={c.status === 'ACTIVE' ? 'success' : 'error'} dot>{CARRIER_STATUS_LABEL[c.status]}</Badge>
                    </td>
                    <td className="py-2 px-2 tabular-nums">{c.assignmentCount?.toLocaleString('en-US') ?? '—'}</td>
                    <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(c.createdAt)}</td>
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
              <Button size="sm" variant="outline" disabled={page <= 1 || carriers.isFetching} onClick={() => setPage((p) => p - 1)}>السابق</Button>
              <Button size="sm" variant="outline" disabled={page >= meta.totalPages || carriers.isFetching} onClick={() => setPage((p) => p + 1)}>التالي</Button>
            </div>
          </div>
        )}
      </section>

      <AddCarrierModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
};
