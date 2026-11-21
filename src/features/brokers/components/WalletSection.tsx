import * as React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import { LEDGER_TYPE_LABEL, useOfficeWallet, type BrokerOfficeDetail } from '../api';
import { TopUpWalletModal } from './TopUpWalletModal';

/** Wallet balance + ledger from GET /admin/wallets/:officeId (read-only; no direct credit — D-ADJ-01). */
export const WalletSection: React.FC<{ office: BrokerOfficeDetail }> = ({ office }) => {
  const { can } = useAuth();
  const canView = can('wallets.view');
  const [page, setPage] = React.useState(1);
  const [topUpOpen, setTopUpOpen] = React.useState(false);
  const wallet = useOfficeWallet(office.id, page, canView);
  const w = wallet.data?.data.wallet;
  const ledger = wallet.data?.data.ledger ?? [];
  const meta = wallet.data?.meta;
  const canTopUp = can('wallets.topups.create_for_office') && office.status === 'ACTIVE';

  return (
    <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md space-y-space-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-on-surface">المحفظة</h2>
        {can('wallets.topups.create_for_office') && (
          <Button
            size="sm"
            icon="receipt_long"
            disabled={!canTopUp}
            title={office.status !== 'ACTIVE' ? 'المحفظة مجمّدة أثناء إيقاف المكتب' : undefined}
            onClick={() => setTopUpOpen(true)}
          >
            طلب شحن يدوي (بإيصال)
          </Button>
        )}
      </div>

      {!canView ? (
        <p className="text-sm">
          الرصيد الحالي: <strong className="tabular-nums">{formatSdg(office.wallet?.balanceMinor)}</strong>
          <span className="text-xs text-on-surface-variant"> — عرض الحركات يتطلب صلاحية المحافظ.</span>
        </p>
      ) : wallet.isLoading ? (
        <Skeleton className="h-40 rounded-lg" />
      ) : wallet.isError ? (
        <ErrorState title="تعذّر تحميل المحفظة" message={errorMessage(wallet.error)} onRetry={() => wallet.refetch()} />
      ) : w ? (
        <>
          <div className="flex flex-wrap items-baseline gap-space-md">
            <span className="text-2xl font-bold tabular-nums">{formatSdg(w.balanceMinor)}</span>
            {w.lowBalance && <Badge variant="warning">رصيد منخفض (الحد {formatSdg(w.lowBalanceThresholdMinor)})</Badge>}
            {office.status === 'SUSPENDED' && <Badge variant="error">مجمّدة — المكتب موقوف</Badge>}
            <span className="text-xs text-on-surface-variant">آخر تحديث {formatDateTime(w.updatedAt)}</span>
          </div>
          {ledger.length === 0 ? (
            <EmptyState title="لا توجد حركات" description="تظهر هنا عمليات الشحن والخصم والاسترداد." icon="receipt_long" className="my-0 shadow-none" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-on-surface-variant text-xs">
                  <tr className="text-right">
                    <th className="py-2 px-2 font-medium">التاريخ</th>
                    <th className="py-2 px-2 font-medium">النوع</th>
                    <th className="py-2 px-2 font-medium">المبلغ</th>
                    <th className="py-2 px-2 font-medium">الرصيد بعد</th>
                    <th className="py-2 px-2 font-medium">المرجع</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((e) => (
                    <tr key={e.id} className="border-t border-surface-container">
                      <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(e.createdAt)}</td>
                      <td className="py-2 px-2">{LEDGER_TYPE_LABEL[e.type] ?? e.type}</td>
                      <td className={`py-2 px-2 tabular-nums ${e.direction === 'CREDIT' ? 'text-[#15803D]' : 'text-error'}`} dir="ltr">
                        {e.direction === 'CREDIT' ? '+' : '−'}
                        {formatSdg(e.amountMinor)}
                      </td>
                      <td className="py-2 px-2 tabular-nums">{formatSdg(e.balanceAfterMinor)}</td>
                      <td className="py-2 px-2 font-mono text-[11px] text-on-surface-variant" dir="ltr">
                        {e.referenceType ? `${e.referenceType}:${e.referenceId?.slice(-8) ?? ''}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>صفحة {meta.page} من {meta.totalPages}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>السابق</Button>
                <Button size="sm" variant="outline" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>التالي</Button>
              </div>
            </div>
          )}
        </>
      ) : null}

      {topUpOpen && <TopUpWalletModal office={office} onClose={() => setTopUpOpen(false)} />}
    </section>
  );
};
