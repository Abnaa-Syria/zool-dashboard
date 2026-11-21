import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { useUpdateCarrier, type CarrierDetail, type CarrierPatch } from '../api';

type Form = { name: string; shortName: string; legalName: string; logoUrl: string; cashEnabled: boolean };

const fromCarrier = (c: CarrierDetail): Form => ({
  name: c.name,
  shortName: c.shortName ?? '',
  legalName: c.legalName ?? '',
  logoUrl: c.logoUrl ?? '',
  cashEnabled: c.cashEnabled,
});

function isUrl(v: string): boolean {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

/** PATCH /carriers/:id with only the changed profile fields (empty optional text → null). */
export const EditCarrierModal: React.FC<{ carrier: CarrierDetail; open: boolean; onOpenChange: (open: boolean) => void }> = ({
  carrier,
  open,
  onOpenChange,
}) => {
  const update = useUpdateCarrier(carrier.id);
  const [form, setForm] = React.useState<Form>(() => fromCarrier(carrier));

  const close = (next: boolean) => {
    if (next) setForm(fromCarrier(carrier));
    else update.reset();
    onOpenChange(next);
  };

  const errors = {
    name: form.name.trim().length < 2 ? 'الاسم مطلوب (حرفان على الأقل)' : undefined,
    legalName: form.legalName.trim() && form.legalName.trim().length < 2 ? 'الاسم القانوني قصير جدًا' : undefined,
    logoUrl: form.logoUrl.trim() && !isUrl(form.logoUrl.trim()) ? 'رابط غير صالح (https://...)' : undefined,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const patch: CarrierPatch = {};
  const original = fromCarrier(carrier);
  if (form.name.trim() !== original.name) patch.name = form.name.trim();
  for (const k of ['shortName', 'legalName', 'logoUrl'] as const) {
    const v = form[k].trim();
    if (v !== original[k]) patch[k] = v || null;
  }
  if (form.cashEnabled !== original.cashEnabled) patch.cashEnabled = form.cashEnabled;
  const dirty = Object.keys(patch).length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors || !dirty) return;
    update.mutate(patch, { onSuccess: () => close(false) });
  };

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent>
        <form onSubmit={submit} className="grid gap-4">
          <ModalHeader>
            <ModalTitle>تعديل بيانات الشركة</ModalTitle>
            <ModalDescription>المفتاح <span dir="ltr" className="font-mono">{carrier.key}</span> ثابت.</ModalDescription>
          </ModalHeader>
          <Input label="الاسم" value={form.name} onChange={set('name')} error={errors.name} maxLength={160} />
          <Input label="الاسم المختصر" value={form.shortName} onChange={set('shortName')} maxLength={80} hint="اختياري — يظهر في التذاكر والتطبيق" />
          <Input label="الاسم القانوني" value={form.legalName} onChange={set('legalName')} error={errors.legalName} maxLength={200} />
          <Input label="رابط الشعار" dir="ltr" value={form.logoUrl} onChange={set('logoUrl')} error={errors.logoUrl} maxLength={512} placeholder="https://" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.cashEnabled} onChange={(e) => setForm((f) => ({ ...f, cashEnabled: e.target.checked }))} />
            السماح بالدفع نقدًا عند الصعود (D-CASH-01)
          </label>
          {update.isError && <p className="text-xs text-error">{errorMessage(update.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>إلغاء</Button>
            <Button type="submit" disabled={hasErrors || !dirty} isLoading={update.isPending}>حفظ</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
