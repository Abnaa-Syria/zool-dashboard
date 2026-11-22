import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { ApiError } from '../../../lib/api/client';
import { errorMessage } from '../../../lib/api/errors';
import { useCreateCarrier } from '../api';

const KEY_RE = /^[a-z][a-z0-9_]*$/;

function createErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === 'CARRIER_KEY_EXISTS') return 'المفتاح مستخدم لشركة أخرى.';
  if (error instanceof ApiError && error.code === 'PHONE_ALREADY_REGISTERED') return 'رقم هاتف المدير مسجّل مسبقًا لحساب آخر.';
  return errorMessage(error);
}

/**
 * POST /carriers { key (snake_case), name, manager? } — the optional manager becomes the first carrier
 * portal account (D-CARRIER-PORTAL-01). Profile and billing fields are edited on the details page.
 */
export const AddCarrierModal: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const create = useCreateCarrier();
  const [key, setKey] = React.useState('');
  const [name, setName] = React.useState('');
  const [managerName, setManagerName] = React.useState('');
  const [managerPhone, setManagerPhone] = React.useState('');

  const keyError = key && (key.length < 2 || !KEY_RE.test(key)) ? 'حروف إنجليزية صغيرة وأرقام و _ فقط، تبدأ بحرف (مثال: sudan_express)' : undefined;
  const nameError = name && name.trim().length < 2 ? 'الاسم قصير جدًا' : undefined;
  const managerNameError = managerName && managerName.trim().length < 2 ? 'الاسم قصير جدًا' : undefined;
  const managerPhoneError = managerPhone && managerPhone.trim().length < 8 ? 'رقم غير صالح (مثال: +249912345678)' : undefined;
  const managerPartial = Boolean(managerName.trim()) !== Boolean(managerPhone.trim());
  const valid =
    key.length >= 2 && !keyError && name.trim().length >= 2 && !managerNameError && !managerPhoneError && !managerPartial;

  const close = (next: boolean) => {
    if (!next) {
      setKey('');
      setName('');
      setManagerName('');
      setManagerPhone('');
      create.reset();
    }
    onOpenChange(next);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    create.mutate(
      {
        key,
        name: name.trim(),
        ...(managerName.trim() ? { manager: { displayName: managerName.trim(), phone: managerPhone.trim() } } : {}),
      },
      {
        onSuccess: (carrier) => {
          close(false);
          navigate(`/companies/${carrier.id}`);
        },
      },
    );
  };

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent>
        <form onSubmit={submit} className="grid gap-4">
          <ModalHeader>
            <ModalTitle>إضافة شركة نقل</ModalTitle>
            <ModalDescription>المفتاح ثابت ولا يمكن تغييره لاحقًا.</ModalDescription>
          </ModalHeader>
          <Input label="المفتاح (key)" dir="ltr" value={key} onChange={(e) => setKey(e.target.value.trim().toLowerCase())} error={keyError} placeholder="sudan_express" maxLength={64} required />
          <Input label="اسم الشركة" value={name} onChange={(e) => setName(e.target.value)} error={nameError} maxLength={160} required />
          <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-outline-variant/30 pt-3">
            <legend className="text-xs font-semibold text-on-surface-variant px-1">مدير الشركة (اختياري — يدخل بوابة الشركة برقم الهاتف)</legend>
            <Input label="اسم المدير" value={managerName} onChange={(e) => setManagerName(e.target.value)} error={managerNameError} maxLength={160} />
            <Input label="هاتف المدير" dir="ltr" value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} error={managerPhoneError} placeholder="+2499xxxxxxxx" maxLength={32} />
          </fieldset>
          {managerPartial && <p className="text-xs text-error">أدخل اسم المدير ورقم هاتفه معًا، أو اتركهما فارغين.</p>}
          {create.isError && <p className="text-xs text-error">{createErrorMessage(create.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>إلغاء</Button>
            <Button type="submit" disabled={!valid} isLoading={create.isPending}>إضافة</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
