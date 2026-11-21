import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { lastDays, sudanDate } from '../../../lib/dates';
import { financeErrorMessage, useOfficeLookup } from '../../financials/api';
import { OfficeSelect } from '../../financials/components/OfficeSelect';
import { useCreateSettlement, type Settlement } from '../api';

/**
 * POST /admin/commissions/settlements — DRAFT for an office + Sudan-day period. Reserves every
 * UNSETTLED accrual of bookings confirmed in the period (D-SET-01).
 */
export const CreateSettlementModal: React.FC<{ onClose: () => void; onCreated: (s: Settlement) => void }> = ({ onClose, onCreated }) => {
  const offices = useOfficeLookup();
  const create = useCreateSettlement();
  const initial = React.useMemo(() => lastDays(30), []);
  const [officeId, setOfficeId] = React.useState('');
  const [manualOfficeId, setManualOfficeId] = React.useState('');
  const [from, setFrom] = React.useState(initial.from);
  const [to, setTo] = React.useState(initial.to);
  const [note, setNote] = React.useState('');
  const today = sudanDate();
  const office = offices.data ? officeId : manualOfficeId.trim();
  const invalidRange = !from || !to || from > to;

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>إنشاء تسوية عمولات (مسودة)</ModalTitle>
          <ModalDescription>
            تُحجز كل العمولات غير المسوّاة لحجوزات المكتب المؤكدة خلال الفترة (بتوقيت السودان). لا يُخصم أي مبلغ من المحفظة.
          </ModalDescription>
        </ModalHeader>
        <form
          className="flex flex-col gap-space-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (!office || invalidRange) return;
            create.mutate({ officeId: office, from, to, note: note.trim() || undefined }, { onSuccess: onCreated });
          }}
        >
          {offices.data ? (
            <label className="flex flex-col gap-1 text-sm">
              المكتب
              <OfficeSelect offices={offices.data} value={officeId} onChange={setOfficeId} allLabel="اختر المكتب..." />
            </label>
          ) : (
            <Input label="معرّف المكتب" value={manualOfficeId} onChange={(e) => setManualOfficeId(e.target.value)} dir="ltr" required />
          )}
          <div className="grid grid-cols-2 gap-space-sm">
            <Input label="من يوم" type="date" value={from} max={to || today} onChange={(e) => setFrom(e.target.value)} required />
            <Input label="إلى يوم (شامل)" type="date" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} required />
          </div>
          {invalidRange && <p className="text-xs text-error">تاريخ البداية يجب أن يسبق تاريخ النهاية أو يساويه.</p>}
          <label className="flex flex-col gap-1 text-sm">
            ملاحظة (اختياري)
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-2 text-sm" />
          </label>
          {create.isError && <p className="text-xs text-error">{financeErrorMessage(create.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" isLoading={create.isPending} disabled={!office || invalidRange}>إنشاء المسودة</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
