import * as React from 'react';
import { DeleteEntityDialog } from '../../../components/shared/DeleteEntityDialog';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState, ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { ApiError } from '../../../lib/api/client';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { useAuth } from '../../auth/auth-context';
import {
  useCarrierStaff,
  useCreateCarrierStaff,
  useDeleteCarrierStaff,
  useUpdateCarrierStaff,
  type CarrierEmployee,
  type CarrierStaffFlags,
  type CarrierStaffRole,
  type CarrierStaffStatus,
  type UpdateCarrierStaffInput,
} from '../api';

const CARRIER_FLAG_LABEL: Record<keyof CarrierStaffFlags, string> = {
  canManageFleet: 'إدارة الأسطول',
  canManageSchedule: 'الجدولة والأسعار',
  canViewFinance: 'المالية',
  canManageStaff: 'إدارة الموظفين',
};
const FLAG_KEYS = Object.keys(CARRIER_FLAG_LABEL) as Array<keyof CarrierStaffFlags>;
const ROLE_LABEL: Record<CarrierStaffRole, string> = { MANAGER: 'مدير', STAFF: 'موظف' };
const STATUS_LABEL: Record<CarrierStaffStatus, string> = { ACTIVE: 'نشط', SUSPENDED: 'موقوف' };
const ALL_FLAGS: CarrierStaffFlags = { canManageFleet: true, canManageSchedule: true, canViewFinance: true, canManageStaff: true };
const selectClass = 'h-10 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm font-normal';

function staffErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === 'PHONE_ALREADY_REGISTERED') return 'رقم الهاتف مسجّل مسبقًا لحساب آخر.';
  if (error instanceof ApiError && error.code === 'LAST_MANAGER') return 'لا يمكن إيقاف أو تخفيض آخر مدير نشط؛ يجب أن يبقى للشركة مدير نشط واحد على الأقل.';
  return errorMessage(error);
}

/** D-CARRIER-PORTAL-01: portal accounts of the carrier (phone + OTP login to the carrier web portal). */
export const CarrierStaffSection: React.FC<{ companyId: string }> = ({ companyId }) => {
  const { can } = useAuth();
  const manage = can('carriers.manage');
  const staff = useCarrierStaff(companyId);
  const [editing, setEditing] = React.useState<CarrierEmployee | 'new' | null>(null);
  const [deleting, setDeleting] = React.useState<CarrierEmployee | null>(null);
  const remove = useDeleteCarrierStaff(companyId);
  const rows = staff.data ?? [];

  return (
    <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md space-y-space-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-on-surface">حسابات بوابة الشركة</h2>
          <p className="text-xs text-on-surface-variant">يسجّل الموظف الدخول إلى بوابة شركة النقل برقم الهاتف ورمز التحقق.</p>
        </div>
        {manage && <Button size="sm" variant="outline" icon="person_add" onClick={() => setEditing('new')}>إضافة حساب</Button>}
      </div>
      {staff.isLoading ? (
        <Skeleton className="h-24 rounded-lg" />
      ) : staff.isError ? (
        <ErrorState title="تعذّر تحميل الحسابات" message={errorMessage(staff.error)} onRetry={() => staff.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState title="لا توجد حسابات" description="أضف مدير الشركة ليتمكن من إدارة الأسطول والرحلات من البوابة." icon="group" className="my-0 shadow-none" />
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
              {rows.map((e) => (
                <tr key={e.id} className="border-t border-surface-container">
                  <td className="py-2 px-2">{e.displayName}</td>
                  <td className="py-2 px-2 font-mono text-xs" dir="ltr">{e.phone ?? '—'}</td>
                  <td className="py-2 px-2">
                    <Badge size="sm" variant={e.role === 'MANAGER' ? 'secondary' : 'neutral'}>{ROLE_LABEL[e.role]}</Badge>
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex flex-wrap gap-1">
                      {FLAG_KEYS.filter((k) => e.flags[k]).map((k) => (
                        <Badge key={k} size="sm" variant="info">{CARRIER_FLAG_LABEL[k]}</Badge>
                      ))}
                      {!FLAG_KEYS.some((k) => e.flags[k]) && <span className="text-xs text-on-surface-variant">عرض فقط</span>}
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <Badge variant={e.status === 'ACTIVE' ? 'success' : 'error'} dot>{STATUS_LABEL[e.status]}</Badge>
                  </td>
                  <td className="py-2 px-2 text-on-surface-variant">{formatDateTime(e.lastLoginAt)}</td>
                  {manage && (
                    <td className="py-2 px-2 text-left">
                      <Button size="sm" variant="ghost" icon="edit" onClick={() => setEditing(e)}>تعديل</Button>
                      <Button size="sm" variant="ghost" icon="delete" className="text-error" onClick={() => setDeleting(e)}>حذف</Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <DeleteEntityDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        entityLabel="حساب الموظف"
        name={deleting?.displayName ?? ''}
        description={<p>يُحذف حساب البوابة ويفقد الموظف الدخول فورًا. لا يمكن حذف آخر مدير نشط للشركة؛ لإيقاف الدخول مؤقتًا استخدم «تعديل ← الحالة: موقوف».</p>}
        onDelete={() => remove.mutateAsync(deleting!.id)}
      />
      {editing && <StaffModal companyId={companyId} employee={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </section>
  );
};

/** POST /carriers/:id/staff, or PATCH /carriers/:id/staff/:employeeId with the changed fields only. */
const StaffModal: React.FC<{ companyId: string; employee: CarrierEmployee | null; onClose: () => void }> = ({ companyId, employee, onClose }) => {
  const create = useCreateCarrierStaff(companyId);
  const update = useUpdateCarrierStaff(companyId);
  const mutation = employee ? update : create;
  const [displayName, setDisplayName] = React.useState(employee?.displayName ?? '');
  const [phone, setPhone] = React.useState('');
  const [role, setRole] = React.useState<CarrierStaffRole>(employee?.role ?? 'STAFF');
  const [status, setStatus] = React.useState<CarrierStaffStatus>(employee?.status ?? 'ACTIVE');
  const [flags, setFlags] = React.useState<CarrierStaffFlags>(
    employee?.flags ?? { canManageFleet: false, canManageSchedule: true, canViewFinance: false, canManageStaff: false },
  );

  const nameError = displayName && displayName.trim().length < 2 ? 'الاسم قصير جدًا' : undefined;
  const phoneError = !employee && phone && phone.trim().length < 8 ? 'رقم غير صالح (مثال: +249912345678)' : undefined;
  // A manager holds every permission (the backend grants them on creation).
  const effectiveFlags = role === 'MANAGER' ? ALL_FLAGS : flags;

  const changes: UpdateCarrierStaffInput = {};
  if (employee) {
    if (displayName.trim() !== employee.displayName) changes.displayName = displayName.trim();
    if (role !== employee.role) changes.role = role;
    if (status !== employee.status) changes.status = status;
    const flagChanges: Partial<CarrierStaffFlags> = {};
    for (const k of FLAG_KEYS) if (effectiveFlags[k] !== employee.flags[k]) flagChanges[k] = effectiveFlags[k];
    if (Object.keys(flagChanges).length > 0) changes.flags = flagChanges;
  }
  const valid = employee
    ? Object.keys(changes).length > 0 && displayName.trim().length >= 2
    : displayName.trim().length >= 2 && phone.trim().length >= 8;
  const demotingManager = employee?.role === 'MANAGER' && (changes.role === 'STAFF' || changes.status === 'SUSPENDED');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    if (employee) update.mutate({ employeeId: employee.id, changes }, { onSuccess: onClose });
    else create.mutate({ displayName: displayName.trim(), phone: phone.trim(), role, flags: effectiveFlags }, { onSuccess: onClose });
  };

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent>
        <form onSubmit={submit} className="grid gap-3">
          <ModalHeader>
            <ModalTitle>{employee ? `تعديل ${employee.displayName}` : 'إضافة حساب للبوابة'}</ModalTitle>
            <ModalDescription>
              {employee
                ? 'رقم الهاتف لا يُعدَّل من هنا. تغيير الدور أو الصلاحيات أو الإيقاف يُنهي جلسات الموظف فورًا.'
                : 'يسجّل الموظف الدخول إلى بوابة شركة النقل برقم الهاتف.'}
            </ModalDescription>
          </ModalHeader>
          <Input label="الاسم" value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={nameError} maxLength={160} required />
          {!employee && (
            <Input label="الهاتف" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} error={phoneError} placeholder="+2499xxxxxxxx" maxLength={32} required />
          )}
          <label className="flex flex-col gap-1 text-xs font-semibold">
            الدور
            <select value={role} onChange={(e) => setRole(e.target.value as CarrierStaffRole)} className={selectClass}>
              <option value="STAFF">{ROLE_LABEL.STAFF}</option>
              <option value="MANAGER">{ROLE_LABEL.MANAGER} (كل الصلاحيات)</option>
            </select>
          </label>
          <fieldset className="grid grid-cols-2 gap-2" disabled={role === 'MANAGER'}>
            <legend className="text-xs font-semibold mb-1">الصلاحيات</legend>
            {FLAG_KEYS.map((k) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={effectiveFlags[k]} onChange={(e) => setFlags((f) => ({ ...f, [k]: e.target.checked }))} />
                {CARRIER_FLAG_LABEL[k]}
              </label>
            ))}
          </fieldset>
          {employee && (
            <label className="flex flex-col gap-1 text-xs font-semibold">
              الحالة
              <select value={status} onChange={(e) => setStatus(e.target.value as CarrierStaffStatus)} className={selectClass}>
                <option value="ACTIVE">{STATUS_LABEL.ACTIVE}</option>
                <option value="SUSPENDED">{STATUS_LABEL.SUSPENDED}</option>
              </select>
            </label>
          )}
          {demotingManager && (
            <p className="text-xs text-on-surface-variant">يجب أن يبقى للشركة مدير نشط واحد على الأقل.</p>
          )}
          {mutation.isError && <p className="text-xs text-error">{staffErrorMessage(mutation.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={!valid} isLoading={mutation.isPending}>حفظ</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
