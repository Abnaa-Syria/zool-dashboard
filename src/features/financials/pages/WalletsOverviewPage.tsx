import * as React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '../../../components/ui/Drawer';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { SearchInput } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import { LEDGER_TYPE_LABEL, OFFICE_STATUS_LABEL, useOfficeWallet } from '../../brokers/api';
import { useDebouncedValue } from '../../brokers/useDebouncedValue';
import { financeErrorMessage, useAdminWallets, type AdminWalletRow, type WalletSort } from '../api';
import { Pager } from '../components/Pager';
import { selectClass, usePageReset } from '../listState';

const PAGE_SIZE = 20;

const SORTS: Array<{ key: string; label: string; sort: WalletSort; order: 'asc' | 'desc' }> = [
  { key: 'balance-desc', label: 'الرصيد: الأعلى أولًا', sort: 'balanceMinor', order: 'desc' },
  { key: 'balance-asc', label: 'الرصيد: الأدنى أولًا', sort: 'balanceMinor', order: 'asc' },
  { key: 'updated-desc', label: 'آخر حركة', sort: 'updatedAt', order: 'desc' },
  { key: 'name-asc', label: 'اسم المكتب', sort: 'officeName', order: 'asc' },
];

/**
 * Office wallets (GET /admin/wallets). Read-only: balances change only through confirmed top-ups,
 * bookings, refunds and commission payouts — there is no direct credit/debit (D-ADJ-01).
 */
export const WalletsOverviewPage: React.FC = () => {
  const { can } = useAuth();
  const [search, setSearch] = React.useState('');
  const q = useDebouncedValue(search.trim(), 300);
  const [officeStatus, setOfficeStatus] = React.useState<'' | 'ACTIVE' | 'SUSPENDED'>('');
  const [lowOnly, setLowOnly] = React.useState(false);
  const [sortKey, setSortKey] = React.useState('balance-desc');
  const [page, setPage] = usePageReset(`${q}|${officeStatus}|${lowOnly}|${sortKey}`);
  const [selected, setSelected] = React.useState<AdminWalletRow | null>(null);
  const sort = SORTS.find((s) => s.key === sortKey) ?? SORTS[0]!;

  const wallets = useAdminWallets({
    page,
    pageSize: PAGE_SIZE,
    q: q || undefined,
    officeStatus: officeStatus || undefined,
    lowBalance: lowOnly || undefined,
    sort: sort.sort,
    order: sort.order,
  });
  const rows = wallets.data?.data ?? [];
  const filtered = Boolean(q || officeStatus || lowOnly);

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs items={[{ label: 'المالية والتسويات', path: '/financials/wallets' }, { label: 'محافظ المكاتب' }]} />
      <PageHeader
        title="محافظ مكاتب الوكلاء"
        subtitle="أرصدة المحافظ المسبقة الدفع. يتغيّر الرصيد فقط عبر الشحن المؤكد والحجوزات والاستردادات — لا يوجد إيداع مباشر."
        className="mb-0"
        actions={
          can('wallets.topups.view') || can('wallets.topups.review') ? (
            <Link to="/financials/topup-queue">
              <Button variant="outline" icon="receipt_long">طابور مراجعة الشحن</Button>
            </Link>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-space-sm">
        <div className="w-full sm:w-72">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="بحث باسم المكتب أو رمزه..." />
        </div>
        <select aria-label="حالة المكتب" value={officeStatus} onChange={(e) => setOfficeStatus(e.target.value as typeof officeStatus)} className={selectClass}>
          <option value="">كل المكاتب</option>
          <option value="ACTIVE">{OFFICE_STATUS_LABEL.ACTIVE}</option>
          <option value="SUSPENDED">{OFFICE_STATUS_LABEL.SUSPENDED}</option>
        </select>
        <select aria-label="الترتيب" value={sortKey} onChange={(e) => setSortKey(e.target.value)} className={selectClass}>
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} className="accent-error h-4 w-4" />
          رصيد منخفض فقط
        </label>
      </div>

      <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md">
        {wallets.isLoading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : wallets.isError ? (
          <ErrorState title="تعذّر تحميل المحافظ" message={financeErrorMessage(wallets.error)} onRetry={() => wallets.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={filtered ? 'لا توجد محافظ مطابقة' : 'لا توجد محافظ بعد'}
            description={lowOnly ? 'لا يوجد مكتب برصيد أقل من حدّ التنبيه.' : filtered ? 'غيّر البحث أو عوامل التصفية.' : 'تُنشأ المحفظة تلقائيًا مع كل مكتب وكيل.'}
            icon="account_balance_wallet"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">المكتب</th>
                  <th className="py-2 px-2 font-medium">الرمز</th>
                  <th className="py-2 px-2 font-medium">الرصيد</th>
                  <th className="py-2 px-2 font-medium">حدّ التنبيه</th>
                  <th className="py-2 px-2 font-medium">حالة المكتب</th>
                  <th className="py-2 px-2 font-medium">آخر تحديث</th>
                  <th className="py-2 px-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((w) => (
                  <tr key={w.walletId} className="border-t border-surface-container hover:bg-surface-container/50">
                    <td className="py-2 px-2">
                      <Link to={`/brokers/${w.officeId}`} className="font-semibold text-secondary">{w.officeName}</Link>
                    </td>
                    <td className="py-2 px-2 font-mono text-xs" dir="ltr">{w.officeCode}</td>
                    <td className="py-2 px-2 tabular-nums">
                      <span className={w.lowBalance ? 'text-error font-semibold' : ''}>{formatSdg(w.balanceMinor)}</span>
                      {w.lowBalance && <Badge variant="error" size="sm" className="ms-2">منخفض</Badge>}
                    </td>
                    <td className="py-2 px-2 tabular-nums text-on-surface-variant">{formatSdg(w.lowBalanceThresholdMinor)}</td>
                    <td className="py-2 px-2">
                      <Badge variant={w.officeStatus === 'ACTIVE' ? 'success' : 'error'} dot>{OFFICE_STATUS_LABEL[w.officeStatus]}</Badge>
                    </td>
                    <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(w.updatedAt)}</td>
                    <td className="py-2 px-2 text-left">
                      <Button size="sm" variant="ghost" icon="receipt" onClick={() => setSelected(w)}>كشف الحركات</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager meta={wallets.data?.meta} busy={wallets.isFetching} onPage={setPage} />
      </section>

      {selected && <WalletLedgerDrawer wallet={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

/** GET /admin/wallets/:officeId — wallet + paginated immutable ledger. */
const WalletLedgerDrawer: React.FC<{ wallet: AdminWalletRow; onClose: () => void }> = ({ wallet, onClose }) => {
  const [page, setPage] = React.useState(1);
  const detail = useOfficeWallet(wallet.officeId, page);
  const ledger = detail.data?.data.ledger ?? [];

  return (
    <Drawer open onOpenChange={(o) => !o && onClose()}>
      <DrawerContent side="left" className="max-w-xl">
        <DrawerHeader>
          <DrawerTitle>كشف حركات محفظة {wallet.officeName}</DrawerTitle>
          <DrawerDescription>
            الرصيد الحالي: <span className="font-semibold tabular-nums">{formatSdg(detail.data?.data.wallet.balanceMinor ?? wallet.balanceMinor)}</span>
          </DrawerDescription>
        </DrawerHeader>
        <div className="mt-space-md flex-1">
          {detail.isLoading ? (
            <Skeleton className="h-48 rounded-lg" />
          ) : detail.isError ? (
            <ErrorState title="تعذّر تحميل الحركات" message={financeErrorMessage(detail.error)} onRetry={() => detail.refetch()} />
          ) : ledger.length === 0 ? (
            <EmptyState title="لا توجد حركات بعد" icon="receipt" />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-on-surface-variant text-xs">
                <tr className="text-right">
                  <th className="py-2 px-2 font-medium">النوع</th>
                  <th className="py-2 px-2 font-medium">المبلغ</th>
                  <th className="py-2 px-2 font-medium">الرصيد بعدها</th>
                  <th className="py-2 px-2 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((e) => (
                  <tr key={e.id} className="border-t border-surface-container">
                    <td className="py-2 px-2">
                      {LEDGER_TYPE_LABEL[e.type] ?? e.type}
                      {e.referenceType === 'booking' && e.referenceId && (
                        <Link to={`/bookings/${e.referenceId}`} className="block text-xs text-secondary">عرض الحجز</Link>
                      )}
                    </td>
                    <td className={`py-2 px-2 tabular-nums ${e.direction === 'CREDIT' ? 'text-primary' : 'text-error'}`} dir="ltr">
                      {e.direction === 'CREDIT' ? '+' : '−'}
                      {formatSdg(e.amountMinor)}
                    </td>
                    <td className="py-2 px-2 tabular-nums">{formatSdg(e.balanceAfterMinor)}</td>
                    <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pager meta={detail.data?.meta} busy={detail.isFetching} onPage={setPage} />
        </div>
        <div className="pt-space-md">
          <Link to={`/brokers/${wallet.officeId}`} className="text-sm text-secondary">فتح صفحة المكتب ←</Link>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
