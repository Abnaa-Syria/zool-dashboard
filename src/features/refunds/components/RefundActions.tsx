import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { formatSdg } from '../../../lib/money';
import { REFUND_STATUS_LABEL, refundErrorMessage, useMarkRefundPaid, useRetryRefund, type AdminRefund } from '../api';

/** Retry with the provider or record a manual payout (bookings.cancel; PENDING/FAILED refunds only). */
export const RefundActions: React.FC<{ refund: AdminRefund; onDone: (message: string) => void }> = ({ refund, onDone }) => {
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
    <div className="flex flex-col gap-space-sm">
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
    </div>
  );
};
