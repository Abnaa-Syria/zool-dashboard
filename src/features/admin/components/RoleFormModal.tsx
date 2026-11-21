import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { adminErrorMessage, useCreateRole, useUpdateRole, type Role } from '../api';
import { InlineError } from './AdminUi';

const KEY_RE = /^[a-z][a-z0-9_]*$/;

export interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit mode when set; create mode otherwise. */
  role?: Role;
  /** Roles whose permissions can be copied into a new role. */
  roles: Role[];
  onSaved: (role: Role) => void;
}

export const RoleFormModal: React.FC<RoleFormModalProps> = (props) => (
  <Modal open={props.open} onOpenChange={props.onOpenChange}>
    <ModalContent size="md">{props.open && <RoleForm {...props} />}</ModalContent>
  </Modal>
);

/** Mounted per opening so state and mutation status start fresh. */
const RoleForm: React.FC<RoleFormModalProps> = ({ onOpenChange, role, roles, onSaved }) => {
  const create = useCreateRole();
  const update = useUpdateRole();
  const mutation = role ? update : create;
  const [key, setKey] = React.useState(role?.key ?? '');
  const [name, setName] = React.useState(role?.name ?? '');
  const [description, setDescription] = React.useState(role?.description ?? '');
  const [copyFrom, setCopyFrom] = React.useState('');

  const keyValid = role ? true : key.length >= 2 && key.length <= 64 && KEY_RE.test(key);
  const valid = keyValid && name.trim().length >= 2;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    if (role) {
      update.mutate(
        { id: role.id, name: name.trim(), description: description.trim() || null },
        { onSuccess: (r) => (onOpenChange(false), onSaved(r)) },
      );
    } else {
      const source = roles.find((r) => r.id === copyFrom);
      create.mutate(
        { key, name: name.trim(), ...(description.trim() ? { description: description.trim() } : {}), permissionKeys: source?.permissions ?? [] },
        { onSuccess: (r) => (onOpenChange(false), onSaved(r)) },
      );
    }
  };

  return (
        <form onSubmit={submit} className="grid gap-4">
          <ModalHeader>
            <ModalTitle>{role ? 'تعديل الدور' : 'دور جديد'}</ModalTitle>
            <ModalDescription>{role ? 'تعديل الاسم والوصف. المفتاح ثابت بعد الإنشاء.' : 'أنشئ الدور ثم حدّد صلاحياته من المصفوفة.'}</ModalDescription>
          </ModalHeader>
          {!role && (
            <Input
              label="مفتاح الدور (snake_case)"
              value={key}
              onChange={(e) => setKey(e.target.value.toLowerCase())}
              placeholder="finance_reviewer"
              dir="ltr"
              className="text-left font-mono"
              error={key && !keyValid ? 'حروف إنجليزية صغيرة وأرقام و _ ويبدأ بحرف.' : undefined}
              required
            />
          )}
          <Input label="اسم الدور" value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={120} required />
          <div className="flex flex-col gap-1">
            <label htmlFor="role-desc" className="text-xs font-semibold text-on-surface">الوصف</label>
            <textarea
              id="role-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full rounded-lg bg-surface-container-lowest text-on-surface text-sm border border-outline-variant/60 p-3 focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>
          {!role && roles.length > 0 && (
            <div className="flex flex-col gap-1">
              <label htmlFor="role-copy" className="text-xs font-semibold text-on-surface">نسخ الصلاحيات من</label>
              <select
                id="role-copy"
                value={copyFrom}
                onChange={(e) => setCopyFrom(e.target.value)}
                className="h-10 rounded-lg bg-surface-container-lowest text-sm border border-outline-variant/60 px-3"
              >
                <option value="">بدون صلاحيات (فارغ)</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.permissions.length})
                  </option>
                ))}
              </select>
            </div>
          )}
          <InlineError message={mutation.isError ? adminErrorMessage(mutation.error) : null} />
          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={!valid} isLoading={mutation.isPending}>
              {role ? 'حفظ' : 'إنشاء الدور'}
            </Button>
          </ModalFooter>
        </form>
  );
};
