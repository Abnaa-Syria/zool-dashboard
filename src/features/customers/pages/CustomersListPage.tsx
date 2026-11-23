import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { useDebouncedValue } from '../../carriers/useDebouncedValue';
import { Pager } from '../../financials/components/Pager';
import { CUSTOMER_STATUS_LABEL, CUSTOMER_STATUS_VARIANT, useCustomers, type CustomerStatus } from '../api';

const PAGE_SIZE = 20;

export const CustomersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const q = useDebouncedValue(search.trim(), 300);
  const [status, setStatus] = React.useState<CustomerStatus | ''>('');
  const [page, setPage] = React.useState(1);

  // Reset to page 1 whenever the filters change (render-time state adjustment, no effect).
  const filterKey = `${q}|${status}`;
  const [prevFilterKey, setPrevFilterKey] = React.useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const customers = useCustomers({ page, pageSize: PAGE_SIZE, q: q || undefined, status: status || undefined });
  const rows = customers.data?.data ?? [];
  const meta = customers.data?.meta;
  const filtered = Boolean(q || status);

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'الرئيسية والعمليات', path: '/overview' }, { label: 'حسابات المسافرين' }]} />
      <PageHeader
        title="حسابات المسافرين"
        subtitle="حسابات العملاء في تطبيق المسافر: البحث، الإيقاف وإعادة التفعيل، وتصفير حالات عدم الحضور النقدي (D-CASH-01)."
        className="mb-0"
      />

      <div className="flex flex-wrap items-center gap-space-sm">
        <div className="w-full sm:w-80">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="بحث بالاسم أو الهاتف أو البريد..." />
        </div>
        <select
          aria-label="الحالة"
          value={status}
          onChange={(e) => setStatus(e.target.value as CustomerStatus | '')}
          className="h-10 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm"
        >
          <option value="">كل الحالات</option>
          {(Object.keys(CUSTOMER_STATUS_LABEL) as CustomerStatus[]).map((s) => (
            <option key={s} value={s}>{CUSTOMER_STATUS_LABEL[s]}</option>
          ))}
        </select>
        {meta && <span className="text-xs text-on-surface-variant">{meta.total.toLocaleString('en-US')} حساب</span>}
      </div>

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
        {customers.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : customers.isError ? (
          <ErrorState title="تعذّر تحميل الحسابات" message={errorMessage(customers.error)} onRetry={() => customers.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={filtered ? 'لا توجد نتائج مطابقة' : 'لا توجد حسابات بعد'}
            description={filtered ? 'غيّر البحث أو عامل التصفية.' : 'تظهر الحسابات هنا عند تسجيل العملاء في التطبيق.'}
            icon="group"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">الاسم</th>
                  <th className="py-2 px-2 font-medium">الهاتف</th>
                  <th className="py-2 px-2 font-medium">البريد</th>
                  <th className="py-2 px-2 font-medium">الحالة</th>
                  <th className="py-2 px-2 font-medium">الحجوزات</th>
                  <th className="py-2 px-2 font-medium">عدم حضور نقدي</th>
                  <th className="py-2 px-2 font-medium">آخر دخول</th>
                  <th className="py-2 px-2 font-medium">تاريخ التسجيل</th>
                  <th className="py-2 px-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-surface-container hover:bg-surface-container/50 cursor-pointer"
                    onClick={() => navigate(`/travelers/${c.id}`)}
                  >
                    <td className="py-2 px-2">
                      <Link to={`/travelers/${c.id}`} className="font-semibold text-secondary" onClick={(e) => e.stopPropagation()}>{c.displayName ?? 'بدون اسم'}</Link>
                    </td>
                    <td className="py-2 px-2 font-mono text-xs" dir="ltr">{c.phone ?? '—'}</td>
                    <td className="py-2 px-2 text-xs" dir="ltr">{c.email ?? '—'}</td>
                    <td className="py-2 px-2">
                      <Badge variant={CUSTOMER_STATUS_VARIANT[c.status]} dot>{CUSTOMER_STATUS_LABEL[c.status]}</Badge>
                    </td>
                    <td className="py-2 px-2 tabular-nums">{c.bookingsCount.toLocaleString('en-US')}</td>
                    <td className="py-2 px-2 tabular-nums">
                      {c.cashNoShowCount > 0 ? <Badge variant="warning">{c.cashNoShowCount}</Badge> : '0'}
                    </td>
                    <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(c.lastLoginAt)}</td>
                    <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(c.createdAt)}</td>
                    <td className="py-2 px-2">
                      <Link to={`/travelers/${c.id}`} className="inline-flex items-center gap-1 text-xs text-secondary font-medium" onClick={(e) => e.stopPropagation()}>
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        عرض
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={meta} busy={customers.isFetching} onPage={setPage} />
      </section>
    </div>
  );
};
