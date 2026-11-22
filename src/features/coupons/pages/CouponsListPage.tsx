import * as React from 'react';
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
import { useCarriers } from '../../carriers/api';
import { useDebouncedValue } from '../../carriers/useDebouncedValue';
import { Pager } from '../../financials/components/Pager';
import { useCoupons, type Coupon, type CouponFilters } from '../api';
import { CreateCouponModal } from '../components/CreateCouponModal';
import { EditCouponModal } from '../components/EditCouponModal';
import { formatPercent } from '../convert';

const PAGE_SIZE = 20;

const CouponState: React.FC<{ coupon: Coupon; now: number }> = ({ coupon: c, now }) => {
  if (!c.isActive) return <Badge variant="neutral" dot>موقوف</Badge>;
  if (new Date(c.validTo).getTime() <= now) return <Badge variant="warning" dot>منتهي</Badge>;
  if (c.maxRedemptions !== null && c.redeemedCount >= c.maxRedemptions) return <Badge variant="warning" dot>استُنفد</Badge>;
  if (new Date(c.validFrom).getTime() > now) return <Badge variant="info" dot>مجدول</Badge>;
  return <Badge variant="success" dot>ساري</Badge>;
};

export const CouponsListPage: React.FC = () => {
  const { can } = useAuth();
  const canManage = can('coupons.manage');
  const [now] = React.useState(() => Date.now());
  const [search, setSearch] = React.useState('');
  const q = useDebouncedValue(search.trim().toUpperCase(), 300);
  const [active, setActive] = React.useState<CouponFilters['isActive'] | ''>('');
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Coupon | null>(null);

  const filterKey = `${q}|${active}`;
  const [prevFilterKey, setPrevFilterKey] = React.useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const coupons = useCoupons({ page, pageSize: PAGE_SIZE, q: q || undefined, isActive: active || undefined });
  // Carrier names for the restriction column / create form (GET /carriers caps pageSize at 100).
  const carriers = useCarriers({ page: 1, pageSize: 100 });
  const carrierList = carriers.data?.data ?? [];
  const carrierName = React.useMemo(() => new Map((carriers.data?.data ?? []).map((c) => [c.id, c.name])), [carriers.data]);
  const rows = coupons.data?.data ?? [];
  const meta = coupons.data?.meta;
  const filtered = Boolean(q || active);

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'التسويق والمحتوى' }, { label: 'الكوبونات' }]} />
      <PageHeader
        title="الكوبونات"
        subtitle="كوبونات الخصم لتطبيق المسافر. لا تُحذف الكوبونات؛ أوقفها لمنع استخدامها."
        className="mb-0"
        actions={canManage ? <Button icon="add" onClick={() => setCreateOpen(true)}>كوبون جديد</Button> : null}
      />

      <div className="flex flex-wrap items-center gap-space-sm">
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="بحث بالرمز..." dir="ltr" />
        </div>
        <select
          aria-label="التفعيل"
          value={active}
          onChange={(e) => setActive(e.target.value as CouponFilters['isActive'] | '')}
          className="h-10 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm"
        >
          <option value="">الكل</option>
          <option value="true">مفعّلة</option>
          <option value="false">موقوفة</option>
        </select>
        {meta && <span className="text-xs text-on-surface-variant">{meta.total.toLocaleString('en-US')} كوبون</span>}
      </div>

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
        {coupons.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : coupons.isError ? (
          <ErrorState title="تعذّر تحميل الكوبونات" message={errorMessage(coupons.error)} onRetry={() => coupons.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={filtered ? 'لا توجد نتائج مطابقة' : 'لا توجد كوبونات بعد'}
            description={filtered ? 'غيّر البحث أو عامل التصفية.' : 'أنشئ أول كوبون لحملات التسويق.'}
            icon="sell"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">الرمز</th>
                  <th className="py-2 px-2 font-medium">الخصم</th>
                  <th className="py-2 px-2 font-medium">الشروط</th>
                  <th className="py-2 px-2 font-medium">الشركة</th>
                  <th className="py-2 px-2 font-medium">الصلاحية</th>
                  <th className="py-2 px-2 font-medium">الاستخدام</th>
                  <th className="py-2 px-2 font-medium">الحالة</th>
                  {canManage && <th className="py-2 px-2 font-medium" />}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-t border-surface-container hover:bg-surface-container/50 align-top">
                    <td className="py-2 px-2 font-mono font-semibold" dir="ltr">{c.code}</td>
                    <td className="py-2 px-2 whitespace-nowrap">
                      {c.discountType === 'PERCENT' ? formatPercent(c.value) : formatSdg(c.value)}
                      {c.maxDiscountAmountMinor !== null && (
                        <div className="text-xs text-on-surface-variant">حتى {formatSdg(c.maxDiscountAmountMinor)}</div>
                      )}
                    </td>
                    <td className="py-2 px-2 text-xs text-on-surface-variant">
                      {c.minSubtotalAmountMinor !== null ? <div>حد أدنى {formatSdg(c.minSubtotalAmountMinor)}</div> : null}
                      <div>{c.perCustomerLimit} لكل عميل</div>
                    </td>
                    <td className="py-2 px-2 text-xs">{c.companyId ? (carrierName.get(c.companyId) ?? <span dir="ltr" className="font-mono">{c.companyId}</span>) : 'كل الشركات'}</td>
                    <td className="py-2 px-2 text-xs text-on-surface-variant whitespace-nowrap">
                      <div>من {formatDateTime(c.validFrom)}</div>
                      <div>إلى {formatDateTime(c.validTo)}</div>
                    </td>
                    <td className="py-2 px-2 tabular-nums whitespace-nowrap">
                      {c.redeemedCount.toLocaleString('en-US')} / {c.maxRedemptions?.toLocaleString('en-US') ?? '∞'}
                    </td>
                    <td className="py-2 px-2"><CouponState coupon={c} now={now} /></td>
                    {canManage && (
                      <td className="py-2 px-2">
                        <Button size="sm" variant="outline" icon="edit" onClick={() => setEditing(c)}>تعديل</Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={meta} busy={coupons.isFetching} onPage={setPage} />
      </section>

      {canManage && (
        <CreateCouponModal open={createOpen} onOpenChange={setCreateOpen} carriers={carrierList} carriersUnavailable={carriers.isError} />
      )}
      {editing && <EditCouponModal key={editing.id} coupon={editing} onClose={() => setEditing(null)} />}
    </div>
  );
};
