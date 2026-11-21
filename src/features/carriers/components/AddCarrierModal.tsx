import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { useCreateCarrier } from '../api';

const KEY_RE = /^[a-z][a-z0-9_]*$/;

/** POST /carriers { key (snake_case), name }. Profile fields are edited on the details page. */
export const AddCarrierModal: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const create = useCreateCarrier();
  const [key, setKey] = React.useState('');
  const [name, setName] = React.useState('');

  const keyError = key && (key.length < 2 || !KEY_RE.test(key)) ? 'حروف إنجليزية صغيرة وأرقام و _ فقط، تبدأ بحرف (مثال: sudan_express)' : undefined;
  const nameError = name && name.trim().length < 2 ? 'الاسم قصير جدًا' : undefined;
  const valid = key.length >= 2 && !keyError && name.trim().length >= 2;

  const close = (next: boolean) => {
    if (!next) {
      setKey('');
      setName('');
      create.reset();
    }
    onOpenChange(next);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    create.mutate(
      { key, name: name.trim() },
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
