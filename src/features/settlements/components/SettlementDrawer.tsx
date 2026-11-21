import * as React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '../../../components/ui/Drawer';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import { financeErrorMessage, useOfficeLookup } from '../../financials/api';
import { Pager } from '../../financials/components/Pager';
import {
  ACCRUAL_STATUS_LABEL,
  ACCRUAL_STATUS_VARIANT,
  SETTLEMENT_STATUS_LABEL,
  SETTLEMENT_STATUS_VARIANT,
  useCancelSettlement,
  useFinalizeSettlement,
  useSettlement,
  useSettlementAccruals,
} from '../api';
import { formatPeriod } from '../period';

type Action = 'finalize' | 'cancel' | null;

/** Settlement detail + reserved accruals; finalize / cancel for DRAFT (commissions.payout). */
export const SettlementDrawer: React.FC<{ id: string; onClose: () => void }> = ({ id, onClose }) => {
  const { can } = useAuth();
  const settlement = useSettlement(id);
  const [page, setPage] = React.useState(1);
  const accruals = useSettlementAccruals(id, page);
  const [action, setAction] = React.useState<Action>(null);
  const [payoutReference, setPayoutReference] = React.useState('');
  const [note, setNote] = React.useState('');
  const finalize = useFinalizeSettlement();
  const cancel = useCancelSettlement();
  const s = settlement.data;
  const offices = useOfficeLookup();
  const officeName = s ? offices.data?.find((o) => o.id === s.officeId)?.name : undefined;
  const canPayout = can('commissions.payout') && s?.status === 'DRAFT';

  return (
    <Drawer open onOpenChange={(o) => !o && onClose()}>
      <DrawerContent side="left" className="max-w-2xl">
        <DrawerHeader>
          <DrawerTitle>تفاصيل التسوية</DrawerTitle>
          <DrawerDescription className="font-mono text-xs" dir="ltr">{id}</DrawerDescription>
        </DrawerHeader>

        <div className="mt-space-md flex-1 space-y-space-md">
          {settlement.isLoading ? (
            <Skeleton className="h-32 rounded-lg" />
          ) : settlement.isError ? (
            <ErrorState title="تعذّر تحميل التسوية" message={financeErrorMessage(settlement.error)} onRetry={() => settlement.refetch()} />
          ) : s ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-on-surface-variant">المكتب</dt>
              <dd>
                <Link to={`/brokers/${s.officeId}`} className="text-secondary font-semibold">{officeName ?? s.officeCode ?? s.officeId}</Link>
                {s.officeCode && <span className="ms-2 font-mono text-xs text-on-surface-variant" dir="ltr">{s.officeCode}</span>}
              </dd>
              <dt className="text-on-surface-variant">الفترة</dt>
              <dd>{formatPeriod(s.periodFrom, s.periodTo)}</dd>
              <dt className="text-on-surface-variant">الحالة</dt>
              <dd><Badge variant={SETTLEMENT_STATUS_VARIANT[s.status]}>{SETTLEMENT_STATUS_LABEL[s.status]}</Badge></dd>
              <dt className="text-on-surface-variant">إجمالي العمولة</dt>
              <dd className="font-bold tabular-nums">{formatSdg(s.totalAmountMinor)}</dd>
              <dt className="text-on-surface-variant">عدد الحجوزات</dt>
              <dd className="tabular-nums">{s.accrualCount ?? accruals.data?.meta?.total ?? '—'}</dd>
              <dt className="text-on-surface-variant">مرجع الصرف</dt>
              <dd className="font-mono text-xs" dir="ltr">{s.payoutReference ?? '—'}</dd>
              <dt className="text-on-surface-variant">ملاحظة</dt>
              <dd>{s.note ?? '—'}</dd>
              <dt className="text-on-surface-variant">أُنشئت</dt>
              <dd>{formatDateTime(s.createdAt)}</dd>
              {s.finalizedAt && (
                <>
                  <dt className="text-on-surface-variant">صُرفت</dt>
                  <dd>{formatDateTime(s.finalizedAt)}</dd>
                </>
              )}
            </dl>
          ) : null}

          {canPayout && action === null && (
            <div className="flex gap-2">
              <Button icon="paid" onClick={() => setAction('finalize')}>تسجيل الصرف واعتماد التسوية</Button>
              <Button variant="outline" icon="block" onClick={() => setAction('cancel')}>إلغاء المسودة</Button>
            </div>
          )}

          {canPayout && action === 'finalize' && (
            <form
              className="rounded-xl border border-surface-container-high p-space-md space-y-space-sm"
              onSubmit={(e) => {
                e.preventDefault();
                if (!payoutReference.trim()) return;
                finalize.mutate(
                  { id, payoutReference: payoutReference.trim(), note: note.trim() || undefined },
                  { onSuccess: () => setAction(null) },
                );
              }}
            >
              <p className="text-sm">
                سجّل مرجع التحويل الخارجي الذي صُرفت به العمولة للمكتب. الاعتماد نهائي: تتحول العمولات المحجوزة إلى «مسوّاة»، ولا يُخصم شيء من المحفظة.
              </p>
              <Input label="مرجع الصرف" value={payoutReference} onChange={(e) => setPayoutReference(e.target.value)} maxLength={128} dir="ltr" required />
              <Input label="ملاحظة (اختياري)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
              {finalize.isError && <p className="text-xs text-error">{financeErrorMessage(finalize.error)}</p>}
              <div className="flex gap-2">
                <Button type="submit" isLoading={finalize.isPending} disabled={!payoutReference.trim()}>تأكيد الاعتماد</Button>
                <Button type="button" variant="outline" onClick={() => setAction(null)}>تراجع</Button>
              </div>
            </form>
          )}

          {canPayout && action === 'cancel' && (
            <div className="rounded-xl border border-error/40 p-space-md space-y-space-sm">
              <p className="text-sm">ستُلغى المسودة وتعود عمولاتها إلى «غير مسوّاة» لتدخل في تسوية لاحقة.</p>
              {cancel.isError && <p className="text-xs text-error">{financeErrorMessage(cancel.error)}</p>}
              <div className="flex gap-2">
                <Button variant="danger" isLoading={cancel.isPending} onClick={() => cancel.mutate(id, { onSuccess: () => setAction(null) })}>تأكيد الإلغاء</Button>
                <Button variant="outline" onClick={() => setAction(null)}>تراجع</Button>
              </div>
            </div>
          )}

          <section className="space-y-space-sm">
            <h3 className="font-bold text-on-surface">العمولات المرتبطة</h3>
            {accruals.isLoading ? (
              <Skeleton className="h-32 rounded-lg" />
            ) : accruals.isError ? (
              <ErrorState title="تعذّر تحميل العمولات" message={financeErrorMessage(accruals.error)} onRetry={() => accruals.refetch()} />
            ) : !accruals.data?.data.length ? (
              <EmptyState title="لا توجد عمولات مرتبطة" description="تُفك العمولات عند إلغاء المسودة." icon="currency_exchange" />
            ) : (
              <table className="w-full text-sm">
                <thead className="text-on-surface-variant text-xs">
                  <tr className="text-right">
                    <th className="py-2 px-2 font-medium">الحجز</th>
                    <th className="py-2 px-2 font-medium">العمولة</th>
                    <th className="py-2 px-2 font-medium">الحالة</th>
                    <th className="py-2 px-2 font-medium">تأكيد الحجز</th>
                  </tr>
                </thead>
                <tbody>
                  {accruals.data.data.map((a) => (
                    <tr key={a.id} className="border-t border-surface-container">
                      <td className="py-2 px-2 font-mono text-xs" dir="ltr">
                        <Link to={`/bookings/${a.bookingId}`} className="text-secondary">{a.bookingId.slice(-8).toUpperCase()}</Link>
                      </td>
                      <td className="py-2 px-2 tabular-nums">{formatSdg(a.amountMinor)}</td>
                      <td className="py-2 px-2"><Badge variant={ACCRUAL_STATUS_VARIANT[a.status]} size="sm">{ACCRUAL_STATUS_LABEL[a.status]}</Badge></td>
                      <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(a.confirmedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <Pager meta={accruals.data?.meta} busy={accruals.isFetching} onPage={setPage} />
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
