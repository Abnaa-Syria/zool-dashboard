import * as React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '../../../components/ui/Drawer';
import { ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { useAuth } from '../../auth/auth-context';
import { formatPeriod } from '../../settlements/period';
import {
  CARRIER_SETTLEMENT_STATUS_LABEL,
  CARRIER_SETTLEMENT_STATUS_VARIANT,
  carrierSettlementErrorMessage,
  useCarrierSettlement,
  useCarrierSettlementAction,
} from '../api';
import { totalsFromSettlement } from '../breakdown';
import { NetBreakdownCard, StatementLinesTable } from './StatementView';

type Pending = 'finalize' | 'mark-paid' | 'cancel' | null;

/** Statement detail + lifecycle: DRAFT → (recalculate) → FINALIZED → PAID, or CANCELLED (carriers.manage). */
export const CarrierSettlementDrawer: React.FC<{ id: string; onClose: () => void }> = ({ id, onClose }) => {
  const { can } = useAuth();
  const settlement = useCarrierSettlement(id);
  const action = useCarrierSettlementAction(id);
  const [pending, setPending] = React.useState<Pending>(null);
  const [reference, setReference] = React.useState('');
  const s = settlement.data;
  const manage = can('carriers.manage');
  const isDraft = s?.status === 'DRAFT';
  const isFinalized = s?.status === 'FINALIZED';

  const run = (a: 'recalculate' | 'finalize' | 'mark-paid' | 'cancel') =>
    action.mutate({ action: a, ...(a === 'mark-paid' ? { reference: reference.trim() } : {}) }, { onSuccess: () => setPending(null) });

  return (
    <Drawer open onOpenChange={(o) => !o && onClose()}>
      <DrawerContent side="left" className="max-w-3xl">
        <DrawerHeader>
          <DrawerTitle>كشف تسوية شركة النقل</DrawerTitle>
          <DrawerDescription className="font-mono text-xs" dir="ltr">{id}</DrawerDescription>
        </DrawerHeader>

        <div className="mt-space-md flex-1 space-y-space-md">
          {settlement.isLoading ? (
            <Skeleton className="h-64 rounded-lg" />
          ) : settlement.isError ? (
            <ErrorState title="تعذّر تحميل الكشف" message={carrierSettlementErrorMessage(settlement.error)} onRetry={() => settlement.refetch()} />
          ) : s ? (
            <>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-on-surface-variant">الشركة</dt>
                <dd><Link to={`/companies/${s.company.id}`} className="text-secondary font-semibold">{s.company.name}</Link></dd>
                <dt className="text-on-surface-variant">الفترة</dt>
                <dd dir="ltr" className="text-right tabular-nums">{formatPeriod(s.periodFrom, s.periodTo)}</dd>
                <dt className="text-on-surface-variant">الحالة</dt>
                <dd><Badge variant={CARRIER_SETTLEMENT_STATUS_VARIANT[s.status]}>{CARRIER_SETTLEMENT_STATUS_LABEL[s.status]}</Badge></dd>
                <dt className="text-on-surface-variant">مرجع الدفع</dt>
                <dd className="font-mono text-xs" dir="ltr">{s.paymentReference ?? '—'}</dd>
                <dt className="text-on-surface-variant">ملاحظات</dt>
                <dd className="whitespace-pre-wrap">{s.notes ?? '—'}</dd>
                <dt className="text-on-surface-variant">أُنشئ</dt>
                <dd>{formatDateTime(s.createdAt)}</dd>
                {s.finalizedAt && (
                  <>
                    <dt className="text-on-surface-variant">اعتُمد</dt>
                    <dd>{formatDateTime(s.finalizedAt)}</dd>
                  </>
                )}
                {s.paidAt && (
                  <>
                    <dt className="text-on-surface-variant">دُفع</dt>
                    <dd>{formatDateTime(s.paidAt)}</dd>
                  </>
                )}
              </dl>

              {isDraft && (
                <p className="text-xs text-on-surface-variant">
                  المسودة تعكس البيانات وقت إنشائها أو آخر إعادة احتساب. الاعتماد يعيد الاحتساب تلقائيًا ثم يجمّد الأرقام نهائيًا.
                </p>
              )}

              <NetBreakdownCard totals={totalsFromSettlement(s)} />

              {manage && (isDraft || isFinalized) && pending === null && (
                <div className="flex flex-wrap gap-2">
                  {isDraft && (
                    <>
                      <Button variant="outline" icon="refresh" isLoading={action.isPending && action.variables?.action === 'recalculate'} onClick={() => run('recalculate')}>
                        إعادة الاحتساب
                      </Button>
                      <Button icon="verified" onClick={() => setPending('finalize')}>اعتماد الكشف</Button>
                    </>
                  )}
                  {isFinalized && <Button icon="paid" onClick={() => setPending('mark-paid')}>تسجيل الدفع</Button>}
                  <Button variant="outline" icon="block" onClick={() => setPending('cancel')}>إلغاء الكشف</Button>
                </div>
              )}

              {manage && pending === 'finalize' && (
                <div className="rounded-xl border border-surface-container-high p-space-md space-y-space-sm">
                  <p className="text-sm">
                    سيُعاد احتساب الكشف بأحدث البيانات وإعدادات الشركة الحالية، ثم يُعتمد. لا يمكن تعديل الكشف المعتمد؛ يمكن إلغاؤه فقط قبل تسجيل الدفع.
                  </p>
                  <div className="flex gap-2">
                    <Button isLoading={action.isPending} onClick={() => run('finalize')}>تأكيد الاعتماد</Button>
                    <Button variant="outline" onClick={() => setPending(null)}>تراجع</Button>
                  </div>
                </div>
              )}

              {manage && pending === 'mark-paid' && (
                <form
                  className="rounded-xl border border-surface-container-high p-space-md space-y-space-sm"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (reference.trim().length >= 2) run('mark-paid');
                  }}
                >
                  <p className="text-sm">
                    {s.direction === 'PLATFORM_PAYS_CARRIER'
                      ? 'سجّل مرجع التحويل الذي دفعت به المنصة صافي المستحق للشركة.'
                      : 'سجّل مرجع التحويل الذي دفعت به الشركة المبلغ المستحق للمنصة.'}
                  </p>
                  <Input label="مرجع الدفع" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={191} dir="ltr" required />
                  <div className="flex gap-2">
                    <Button type="submit" isLoading={action.isPending} disabled={reference.trim().length < 2}>تأكيد الدفع</Button>
                    <Button type="button" variant="outline" onClick={() => setPending(null)}>تراجع</Button>
                  </div>
                </form>
              )}

              {manage && pending === 'cancel' && (
                <div className="rounded-xl border border-error/40 p-space-md space-y-space-sm">
                  <p className="text-sm">سيُلغى الكشف وتصبح فترته متاحة لكشف جديد.</p>
                  <div className="flex gap-2">
                    <Button variant="danger" isLoading={action.isPending} onClick={() => run('cancel')}>تأكيد الإلغاء</Button>
                    <Button variant="outline" onClick={() => setPending(null)}>تراجع</Button>
                  </div>
                </div>
              )}

              {action.isError && <p className="text-xs text-error">{carrierSettlementErrorMessage(action.error)}</p>}

              <section className="space-y-space-sm">
                <h3 className="font-bold text-on-surface">تفاصيل الرحلات</h3>
                <StatementLinesTable lines={s.lines} carrierBearsCommission={s.config.commissionBearer === 'CARRIER'} />
              </section>
            </>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
