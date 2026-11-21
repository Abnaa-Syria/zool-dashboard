import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { ApiError } from '../../../lib/api/client';
import { errorMessage } from '../../../lib/api/errors';
import { formatSdg, sdgToMinor } from '../../../lib/money';
import { useCreateManualTopUp, type BrokerOfficeDetail, type TopUpIntent } from '../api';

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
const RECEIPT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

function topUpError(err: unknown): string {
  if (err instanceof ApiError && err.code === 'TOP_UP_BELOW_MINIMUM') {
    const min = (err.details as { minTopUpMinor?: number } | undefined)?.minTopUpMinor;
    return `المبلغ أقل من الحد الأدنى للشحن${min !== undefined ? ` (${formatSdg(min)})` : ''}.`;
  }
  return errorMessage(err);
}

/**
 * Audited manual top-up fallback (D-ADMIN-TOPUP-01) on behalf of an office: bank-transfer reference +
 * receipt → PENDING_REVIEW intent. The wallet is credited only after approval in the top-up queue;
 * admins never credit wallets directly (D-ADJ-01).
 */
export const TopUpWalletModal: React.FC<{ office: BrokerOfficeDetail; onClose: () => void }> = ({ office, onClose }) => {
  const create = useCreateManualTopUp(office.id);
  const [amount, setAmount] = React.useState('');
  const [reference, setReference] = React.useState('');
  const [note, setNote] = React.useState('');
  const [receipt, setReceipt] = React.useState<File | null>(null);
  const [done, setDone] = React.useState<TopUpIntent | null>(null);

  const sdg = Number(amount);
  const amountMinor = Number.isFinite(sdg) ? sdgToMinor(sdg) : 0;
  const amountError = amount && (!(sdg > 0) || !/^\d+(\.\d{1,2})?$/.test(amount)) ? 'أدخل مبلغًا موجبًا (حتى خانتين عشريتين)' : undefined;
  const receiptError =
    receipt && (!RECEIPT_TYPES.includes(receipt.type) ? 'PDF أو JPG أو PNG فقط' : receipt.size > MAX_RECEIPT_BYTES ? 'الحد الأقصى 5 ميجابايت' : undefined);
  const valid = amountMinor > 0 && !amountError && reference.trim().length > 0 && receipt !== null && !receiptError;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !receipt) return;
    create.mutate(
      { amountMinor, paymentReference: reference.trim(), note: note.trim() || undefined, receipt },
      { onSuccess: setDone },
    );
  };

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>طلب شحن يدوي — {office.name}</ModalTitle>
          <ModalDescription>
            يُنشئ طلب شحن بانتظار المراجعة مرفقًا بإيصال التحويل. لا يُضاف الرصيد إلا بعد اعتماده من طابور طلبات الشحن.
          </ModalDescription>
        </ModalHeader>
        {done ? (
          <div className="space-y-3 text-sm">
            <p>
              تم إرسال طلب شحن بمبلغ <strong>{formatSdg(done.amountMinor)}</strong> للمراجعة. الحالة:{' '}
              <strong>{done.status === 'PENDING_REVIEW' ? 'بانتظار المراجعة' : done.status}</strong>.
            </p>
            <ModalFooter>
              <Button onClick={onClose}>تم</Button>
            </ModalFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-3">
            <Input label="المبلغ (ج.س)" inputMode="decimal" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value.trim())} error={amountError} required />
            <Input label="مرجع التحويل البنكي" dir="ltr" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120} required />
            <label className="flex flex-col gap-1 text-xs font-semibold">
              إيصال التحويل (PDF / JPG / PNG، حتى 5 ميجابايت)
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                className="text-sm font-normal"
                required
              />
              {receiptError && <span className="text-error font-medium">{receiptError}</span>}
            </label>
            <Input label="ملاحظة (اختياري)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
            {create.isError && <p className="text-xs text-error">{topUpError(create.error)}</p>}
            <ModalFooter>
              <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
              <Button type="submit" disabled={!valid} isLoading={create.isPending}>إرسال للمراجعة</Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};
