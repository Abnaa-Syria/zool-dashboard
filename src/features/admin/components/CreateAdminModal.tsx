import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { adminErrorMessage, useCreateAdmin, type AdminUser, type Role } from '../api';
import { InlineError } from './AdminUi';

export interface CreateAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[] | undefined;
  rolesError?: string | null;
  onCreated: (admin: AdminUser) => void;
}

/** POST /admins — the new admin signs in with OTP on the given phone (no invite email). */
export const CreateAdminModal: React.FC<CreateAdminModalProps> = ({ open, onOpenChange, roles, rolesError, onCreated }) => {
  const create = useCreateAdmin();
  const [displayName, setDisplayName] = React.useState('');
  const [employeeCode, setEmployeeCode] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [roleIds, setRoleIds] = React.useState<string[]>([]);

  const reset = () => {
    setDisplayName('');
    setEmployeeCode('');
    setPhone('');
    setRoleIds([]);
    create.reset();
  };

  const valid = displayName.trim().length >= 2 && employeeCode.trim().length >= 2 && phone.trim().length >= 8 && roleIds.length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    create.mutate(
      { displayName: displayName.trim(), employeeCode: employeeCode.trim(), phone: phone.trim(), roleIds },
      {
        onSuccess: (admin) => {
          reset();
          onOpenChange(false);
          onCreated(admin);
        },
      },
    );
  };

  const activeRoles = (roles ?? []).filter((r) => r.isActive);

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <ModalContent size="md">
        <form onSubmit={submit} className="grid gap-4">
          <ModalHeader>
            <ModalTitle>إضافة مشرف جديد</ModalTitle>
            <ModalDescription>يسجّل المشرف الدخول برمز تحقق يُرسل إلى رقم الهاتف المحدد.</ModalDescription>
          </ModalHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="الاسم المعروض" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required minLength={2} maxLength={160} />
            <Input label="الرقم الوظيفي" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} required minLength={2} maxLength={64} dir="ltr" className="text-left" />
            <div className="sm:col-span-2">
              <Input
                label="رقم الهاتف"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+2499XXXXXXXX"
                hint="رقم سوداني: ‎+249 أو 09…"
                dir="ltr"
                className="text-left"
                inputMode="tel"
              />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-on-surface mb-1">الأدوار (دور واحد على الأقل)</legend>
            {rolesError ? (
              <InlineError message={rolesError} />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto">
                {activeRoles.map((r) => (
                  <label key={r.id} className="flex items-start gap-2 rounded-lg border border-outline-variant/40 px-3 py-2 text-sm cursor-pointer hover:bg-surface-container-low">
                    <input
                      type="checkbox"
                      className="mt-1 accent-secondary"
                      checked={roleIds.includes(r.id)}
                      onChange={(e) => setRoleIds((ids) => (e.target.checked ? [...ids, r.id] : ids.filter((id) => id !== r.id)))}
                    />
                    <span className="flex flex-col">
                      <span className="font-medium">{r.name}</span>
                      <span className="text-[11px] text-outline font-mono" dir="ltr">{r.key}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <InlineError message={create.isError ? adminErrorMessage(create.error) : null} />

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" icon="person_add" disabled={!valid} isLoading={create.isPending}>
              إضافة المشرف
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
