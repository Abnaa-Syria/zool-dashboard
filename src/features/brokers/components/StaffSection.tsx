import * as React from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { useAuth } from '../../auth/auth-context';
import {
  OFFICE_STATUS_LABEL,
  useCreateStaff,
  useUpdateStaff,
  type BrokerEmployee,
  type BrokerOfficeDetail,
  type OfficeStatus,
  type StaffFlags,
  type UpdateStaffInput,
} from '../api';

const FLAG_LABEL: Record<keyof StaffFlags, string> = {
  canBook: 'الحجز',
  canTopUp: 'شحن المحفظة',
  canViewReports: 'التقارير',
  canManageStaff: 'إدارة الموظفين',
};
const FLAG_KEYS = Object.keys(FLAG_LABEL) as Array<keyof StaffFlags>;

export const StaffSection: React.FC<{ office: BrokerOfficeDetail }> = ({ office }) => {
  const { can } = useAuth();
  const manage = can('brokers.manage');
  const [editing, setEditing] = React.useState<BrokerEmployee | 'new' | null>(null);

  return (
    <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md space-y-space-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-on-surface">موظفو المكتب</h2>
        {manage && <Button size="sm" variant="outline" icon="person_add" onClick={() => setEditing('new')}>إضافة موظف</Button>}
      </div>
      {office.employees.length === 0 ? (
        <EmptyState title="لا يوجد موظفون" icon="group" className="my-0 shadow-none" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-on-surface-variant text-xs">
              <tr className="text-right">
                <th className="py-2 px-2 font-medium">الاسم</th>
                <th className="py-2 px-2 font-medium">الهاتف</th>
                <th className="py-2 px-2 font-medium">الدور</th>
                <th className="py-2 px-2 font-medium">الصلاحيات</th>
                <th className="py-2 px-2 font-medium">الحالة</th>
                <th className="py-2 px-2 font-medium">آخر دخول</th>
                {manage && <th className="py-2 px-2" />}
              </tr>
            </thead>
            <tbody>
              {office.employees.map((e) => (
                <tr key={e.id} className="border-t border-surface-container">
                  <td className="py-2 px-2">{e.displayName}</td>
                  <td className="py-2 px-2 font-mono text-xs" dir="ltr">{e.phone ?? '—'}</td>
                  <td className="py-2 px-2">{e.role === 'MANAGER' ? 'مدير' : 'موظف'}</td>
                  <td className="py-2 px-2">
                    <div className="flex flex-wrap gap-1">
                      {FLAG_KEYS.filter((k) => e.flags[k]).map((k) => (
                        <Badge key={k} size="sm" variant="info">{FLAG_LABEL[k]}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <Badge variant={e.status === 'ACTIVE' ? 'success' : 'error'} dot>{OFFICE_STATUS_LABEL[e.status]}</Badge>
                  </td>
                  <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(e.lastLoginAt)}</td>
                  {manage && (
                    <td className="py-2 px-2 text-left">
                      <Button size="sm" variant="ghost" icon="edit" onClick={() => setEditing(e)}>تعديل</Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <StaffModal officeId={office.id} employee={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </section>
  );
};

/** POST /brokers/:id/staff (new clerk) or PATCH /brokers/:id/staff/:employeeId (changed fields only). */
const StaffModal: React.FC<{ officeId: string; employee: BrokerEmployee | null; onClose: () => void }> = ({ officeId, employee, onClose }) => {
  const create = useCreateStaff(officeId);
  const update = useUpdateStaff(officeId);
  const mutation = employee ? update : create;
  const [displayName, setDisplayName] = React.useState(employee?.displayName ?? '');
  const [phone, setPhone] = React.useState('');
  const [status, setStatus] = React.useState<OfficeStatus>(employee?.status ?? 'ACTIVE');
  const [flags, setFlags] = React.useState<StaffFlags>(
    employee?.flags ?? { canBook: true, canTopUp: false, canViewReports: false, canManageStaff: false },
  );

  const nameError = displayName && displayName.trim().length < 2 ? 'الاسم قصير جدًا' : undefined;
  const phoneError = !employee && phone && phone.trim().length < 8 ? 'رقم غير صالح (مثال: +249912345678)' : undefined;

  const changes: UpdateStaffInput = {};
  if (employee) {
    if (displayName.trim() !== employee.displayName) changes.displayName = displayName.trim();
    if (status !== employee.status) changes.status = status;
    for (const k of FLAG_KEYS) if (flags[k] !== employee.flags[k]) changes[k] = flags[k];
  }
  const valid = employee
    ? Object.keys(changes).length > 0 && displayName.trim().length >= 2
    : displayName.trim().length >= 2 && phone.trim().length >= 8;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    if (employee) update.mutate({ employeeId: employee.id, changes }, { onSuccess: onClose });
    else create.mutate({ displayName: displayName.trim(), phone: phone.trim(), ...flags }, { onSuccess: onClose });
  };

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent>
        <form onSubmit={submit} className="grid gap-3">
          <ModalHeader>
            <ModalTitle>{employee ? `تعديل ${employee.displayName}` : 'إضافة موظف'}</ModalTitle>
            <ModalDescription>
              {employee ? 'رقم الهاتف لا يُعدَّل من هنا. إيقاف الموظف يُنهي جلساته.' : 'يسجّل الموظف الدخول إلى تطبيق الوكيل برقم الهاتف.'}
            </ModalDescription>
          </ModalHeader>
          <Input label="الاسم" value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={nameError} maxLength={160} required />
          {!employee && (
            <Input label="الهاتف" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} error={phoneError} placeholder="+2499xxxxxxxx" maxLength={32} required />
          )}
          <fieldset className="grid grid-cols-2 gap-2">
            <legend className="text-xs font-semibold mb-1">الصلاحيات</legend>
            {FLAG_KEYS.map((k) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={flags[k]} onChange={(e) => setFlags((f) => ({ ...f, [k]: e.target.checked }))} />
                {FLAG_LABEL[k]}
              </label>
            ))}
          </fieldset>
          {employee && (
            <label className="flex flex-col gap-1 text-xs font-semibold">
              الحالة
              <select value={status} onChange={(e) => setStatus(e.target.value as OfficeStatus)} className="h-10 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm font-normal">
                <option value="ACTIVE">{OFFICE_STATUS_LABEL.ACTIVE}</option>
                <option value="SUSPENDED">{OFFICE_STATUS_LABEL.SUSPENDED}</option>
              </select>
            </label>
          )}
          {mutation.isError && <p className="text-xs text-error">{errorMessage(mutation.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={!valid} isLoading={mutation.isPending}>حفظ</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
