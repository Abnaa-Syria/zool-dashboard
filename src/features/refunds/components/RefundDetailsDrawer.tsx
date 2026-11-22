import * as React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '../../../components/ui/Drawer';
import { ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import { useAuth } from '../../auth/auth-context';
import { BOOKING_STATUS_LABEL, PAYMENT_METHOD_LABEL } from '../../bookings/api';
import {
  MANUAL_REF_PREFIX,
  REFUND_REASON_LABEL,
  REFUND_STATUS_LABEL,
  REFUND_STATUS_VARIANT,
  refundErrorMessage,
  useMarkRefundPaid,
  useRefund,
  useRetryRefund,
  type AdminRefund,
} from '../api';

type Props = {
  refundId: string;
  /** Row from the list, shown while the detail request loads. */
  initial: AdminRefund | undefined;
  onClose: () => void;
  onDone: (message: string) => void;
};

/** Refund detail + actions (retry with the provider / record a manual payout). */
export const RefundDetailsDrawer: React.FC<Props> = ({ refundId, initial, onClose, onDone }) => {
  const detail = useRefund(refundId);
  const refund = detail.data ?? initial;

  return (
    <Drawer open onOpenChange={(o) => !o && onClose()}>
      <DrawerContent side="left" className="max-w-lg">
        <DrawerHeader>
          <DrawerTitle>تفاصيل الاسترداد</DrawerTitle>
          <DrawerDescription>
            <span className="font-mono" dir="ltr">{refundId}</span>
          </DrawerDescription>
        </DrawerHeader>
        {!refund ? (
          detail.isError ? (
            <ErrorState title="تعذّر تحميل الاسترداد" message={refundErrorMessage(detail.error)} onRetry={() => detail.refetch()} />
          ) : (
            <Skeleton className="h-64 rounded-lg" />
          )
        ) : (
          <RefundBody refund={refund} onDone={onDone} />
        )}
      </DrawerContent>
    </Drawer>
  );
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <>
    <dt className="text-on-surface-variant">{label}</dt>
    <dd className="min-w-0 break-words">{children}</dd>
  </>
);

const RefundBody: React.FC<{ refund: AdminRefund; onDone: (message: string) => void }> = ({ refund: r, onDone }) => {
  const { can } = useAuth();
  const canAct = can('bookings.cancel') && r.status !== 'SUCCEEDED';
  const manual = r.providerRef?.startsWith(MANUAL_REF_PREFIX) ?? false;

  return (
    <div className="flex flex-col gap-space-md text-sm">
      <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-space-md">
        <div className="flex flex-col">
          <span className="text-xs text-on-surface-variant">مبلغ الاسترداد</span>
          <span className="text-2xl font-bold tabular-nums">{formatSdg(r.amountMinor)}</span>
        </div>
        <Badge variant={REFUND_STATUS_VARIANT[r.status]} dot>{REFUND_STATUS_LABEL[r.status]}</Badge>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        <Row label="السبب">{REFUND_REASON_LABEL[r.reason] ?? r.reason}</Row>
        <Row label="تاريخ الطلب">{formatDateTime(r.createdAt)}</Row>
        <Row label="تاريخ التنفيذ">{formatDateTime(r.processedAt)}</Row>
        <Row label={manual ? 'مرجع الدفع اليدوي' : 'مرجع المزوّد'}>
          <span className="font-mono text-xs" dir="ltr">{manual ? r.providerRef!.slice(MANUAL_REF_PREFIX.length) : r.providerRef ?? '—'}</span>
        </Row>
      </dl>

      <section className="flex flex-col gap-1.5 border-t border-outline-variant/30 pt-space-sm">
        <h3 className="text-xs font-bold text-on-surface-variant">الحجز</h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
          <Row label="رقم الحجز">
            <Link to={`/bookings/${r.booking.id}`} className="font-mono text-xs font-semibold text-secondary" dir="ltr">
              {r.booking.bookingRef ?? r.booking.id}
            </Link>
          </Row>
          <Row label="حالة الحجز">{BOOKING_STATUS_LABEL[r.booking.status] ?? r.booking.status}</Row>
          <Row label="وسيلة الدفع">{PAYMENT_METHOD_LABEL[r.booking.paymentMethod] ?? r.booking.paymentMethod}</Row>
          <Row label="إجمالي الحجز">{formatSdg(r.booking.totalAmountMinor)}</Row>
          <Row label="الرحلة">
            <Link to={`/network/trips/${r.booking.trip.id}`} className="text-secondary font-semibold">
              {r.booking.trip.origin} ← {r.booking.trip.destination}
            </Link>
            <div className="text-xs text-on-surface-variant">
              {r.booking.trip.company.name}
              {r.booking.trip.tripNumber && <span className="font-mono" dir="ltr"> · {r.booking.trip.tripNumber}</span>} · {formatDateTime(r.booking.trip.departureAt)}
            </div>
          </Row>
        </dl>
      </section>

      <section className="flex flex-col gap-1.5 border-t border-outline-variant/30 pt-space-sm">
        <h3 className="text-xs font-bold text-on-surface-variant">العميل والدفع</h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
          <Row label="العميل">
            {r.customer ? (
              <Link to={`/travelers/${r.customer.id}`} className="text-secondary font-semibold">{r.customer.displayName ?? 'بدون اسم'}</Link>
            ) : (
              '—'
            )}
          </Row>
          <Row label="الهاتف"><span className="font-mono text-xs" dir="ltr">{r.customer?.phone ?? '—'}</span></Row>
          <Row label="مزوّد الدفع">{r.payment?.provider ?? '—'}</Row>
          <Row label="مرجع الدفع الأصلي"><span className="font-mono text-xs" dir="ltr">{r.payment?.providerRef ?? '—'}</span></Row>
          <Row label="المبلغ المدفوع">{r.payment ? formatSdg(r.payment.amount) : '—'}</Row>
        </dl>
      </section>

      {canAct && <RefundActions refund={r} onDone={onDone} />}
    </div>
  );
};

const RefundActions: React.FC<{ refund: AdminRefund; onDone: (message: string) => void }> = ({ refund, onDone }) => {
  const retry = useRetryRefund();
  const markPaid = useMarkRefundPaid();
  const [mode, setMode] = React.useState<'idle' | 'manual'>('idle');
  const [reference, setReference] = React.useState('');
  const [note, setNote] = React.useState('');
  const ref = reference.trim();
  const refError = ref.length > 0 && ref.length < 2 ? 'حرفان على الأقل' : undefined;
  const busy = retry.isPending || markPaid.isPending;
  const error = retry.error ?? markPaid.error;

  function doRetry() {
    markPaid.reset();
    retry.mutate(refund.id, {
      onSuccess: (r) =>
        onDone(r.status === 'SUCCEEDED' ? `تم تنفيذ الاسترداد بنجاح (${formatSdg(r.amountMinor)}).` : `أُعيد إرسال الاسترداد؛ الحالة الآن: ${REFUND_STATUS_LABEL[r.status]}.`),
    });
  }

  function doMarkPaid() {
    retry.reset();
    markPaid.mutate(
      { id: refund.id, reference: ref, note: note.trim() || undefined },
      { onSuccess: () => onDone(`تم تسجيل الاسترداد كمدفوع يدويًا بالمرجع ${ref}.`) },
    );
  }

  return (
    <section className="flex flex-col gap-space-sm border-t border-outline-variant/30 pt-space-sm">
      <h3 className="text-xs font-bold text-on-surface-variant">الإجراءات</h3>
      {error && <p className="text-xs text-error">{refundErrorMessage(error)}</p>}
      {mode === 'idle' ? (
        <div className="flex flex-wrap gap-2">
          <Button icon="replay" isLoading={retry.isPending} disabled={busy} onClick={doRetry}>إعادة الإرسال لمزوّد الدفع</Button>
          <Button variant="outline" icon="price_check" disabled={busy} onClick={() => setMode('manual')}>تسجيل كمدفوع يدويًا</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-space-sm rounded-xl border border-outline-variant/40 p-space-sm">
          <p className="text-xs text-on-surface-variant">
            استخدم هذا الخيار فقط إذا حُوّل المبلغ <b>{formatSdg(refund.amountMinor)}</b> للعميل خارج مزوّد الدفع (تحويل بنكي مثلًا). يُسجَّل الإجراء في سجل التدقيق باسمك ولا يمكن التراجع عنه.
          </p>
          <Input
            label="مرجع التحويل"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            maxLength={191}
            dir="ltr"
            error={refError}
            placeholder="مثال: BOK-123456"
          />
          <label className="flex flex-col gap-1 text-xs font-semibold">
            ملاحظة (اختياري)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-2 text-sm font-normal"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={busy} onClick={() => setMode('idle')}>تراجع</Button>
            <Button icon="check" isLoading={markPaid.isPending} disabled={busy || ref.length < 2} onClick={doMarkPaid}>تأكيد الدفع اليدوي</Button>
          </div>
        </div>
      )}
    </section>
  );
};
