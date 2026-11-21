import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { useCreateOffice, type SettlementPeriod } from '../api';

const CODE_RE = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

/** POST /brokers { code, name, settlementPeriod, manager { displayName, phone } }. */
export const AddBrokerModal: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const create = useCreateOffice();
  const empty = { code: '', name: '', settlementPeriod: 'MONTHLY' as SettlementPeriod, managerName: '', managerPhone: '' };
  const [form, setForm] = React.useState(empty);

  const errors = {
    code: form.code && (form.code.length < 2 || !CODE_RE.test(form.code)) ? 'حروف إنجليزية وأرقام و - و _ (مثال: ZG-BRK-2)' : undefined,
    name: form.name && form.name.trim().length < 2 ? 'الاسم قصير جدًا' : undefined,
    managerName: form.managerName && form.managerName.trim().length < 2 ? 'الاسم قصير جدًا' : undefined,
    managerPhone: form.managerPhone && form.managerPhone.trim().length < 8 ? 'رقم غير صالح (مثال: +249912345678)' : undefined,
  };
  const managerPartial = Boolean(form.managerName.trim()) !== Boolean(form.managerPhone.trim());
  const valid =
    form.code.length >= 2 && form.name.trim().length >= 2 && !Object.values(errors).some(Boolean) && !managerPartial;

  const close = (next: boolean) => {
    if (!next) {
      setForm(empty);
      create.reset();
    }
    onOpenChange(next);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    create.mutate(
      {
        code: form.code,
        name: form.name.trim(),
        settlementPeriod: form.settlementPeriod,
        ...(form.managerName.trim()
          ? { manager: { displayName: form.managerName.trim(), phone: form.managerPhone.trim() } }
          : {}),
      },
      {
        onSuccess: (office) => {
          close(false);
          navigate(`/brokers/${office.id}`);
        },
      },
    );
  };

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent>
        <form onSubmit={submit} className="grid gap-4">
          <ModalHeader>
            <ModalTitle>إضافة مكتب وكيل</ModalTitle>
            <ModalDescription>تُنشأ محفظة المكتب تلقائيًا برصيد صفر. الرمز ثابت ولا يتغير.</ModalDescription>
          </ModalHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="رمز المكتب" dir="ltr" value={form.code} onChange={set('code')} error={errors.code} placeholder="ZG-BRK-2" maxLength={64} required />
            <Input label="اسم المكتب" value={form.name} onChange={set('name')} error={errors.name} maxLength={160} required />
          </div>
          <label className="flex flex-col gap-1 text-xs font-semibold">
            دورة تسوية العمولات
            <select value={form.settlementPeriod} onChange={set('settlementPeriod')} className="h-10 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm font-normal">
              <option value="MONTHLY">شهرية</option>
              <option value="WEEKLY">أسبوعية</option>
            </select>
          </label>
          <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-outline-variant/30 pt-3">
            <legend className="text-xs font-semibold text-on-surface-variant px-1">مدير المكتب (يسجّل الدخول برقم الهاتف)</legend>
            <Input label="اسم المدير" value={form.managerName} onChange={set('managerName')} error={errors.managerName} maxLength={160} />
            <Input label="هاتف المدير" dir="ltr" value={form.managerPhone} onChange={set('managerPhone')} error={errors.managerPhone} placeholder="+2499xxxxxxxx" maxLength={32} />
          </fieldset>
          {managerPartial && <p className="text-xs text-error">أدخل اسم المدير ورقم هاتفه معًا، أو اتركهما فارغين.</p>}
          {create.isError && <p className="text-xs text-error">{errorMessage(create.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>إلغاء</Button>
            <Button type="submit" disabled={!valid} isLoading={create.isPending}>إضافة</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
