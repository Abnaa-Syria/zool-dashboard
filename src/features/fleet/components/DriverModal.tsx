import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { useCarriers } from '../../carriers/api';
import { Select } from '../../geo/components/common';
import { useCreateDriver, useUpdateDriver, type Driver, type DriverPatch } from '../api';

type Form = { companyId: string; displayName: string; phone: string; driverCode: string; licenseNumber: string; licenseExpiry: string };

const fromDriver = (d?: Driver): Form => ({
  companyId: d?.company.id ?? '',
  displayName: d?.displayName ?? '',
  phone: d?.phone ?? '',
  driverCode: d?.driverCode ?? '',
  licenseNumber: d?.licenseNumber ?? '',
  licenseExpiry: d?.licenseExpiry ?? '',
});

const DRIVER_CODE_RE = /^[A-Z0-9-]{3,32}$/;

/**
 * Create (POST /admin/drivers) or edit (PATCH changed fields). Changing the phone revokes the driver's
 * sessions, so the edit asks for confirmation first.
 */
export const DriverModal: React.FC<{ driver?: Driver; open: boolean; onOpenChange: (open: boolean) => void }> = ({ driver, open, onOpenChange }) => {
  const carriers = useCarriers({ pageSize: 100 });
  const create = useCreateDriver();
  const update = useUpdateDriver();
  const mutation = driver ? update : create;
  const [form, setForm] = React.useState<Form>(() => fromDriver(driver));
  const [confirming, setConfirming] = React.useState(false);

  const seedKey = `${open}|${driver?.id ?? 'new'}`;
  const [prevSeed, setPrevSeed] = React.useState(seedKey);
  if (seedKey !== prevSeed) {
    setPrevSeed(seedKey);
    if (open) {
      setForm(fromDriver(driver));
      setConfirming(false);
    }
  }

  const close = (next: boolean) => {
    if (!next) {
      create.reset();
      update.reset();
    }
    onOpenChange(next);
  };

  const code = form.driverCode.trim().toUpperCase();
  const phone = form.phone.trim();
  const errors = {
    companyId: !driver && !form.companyId ? 'اختر الشركة' : undefined,
    displayName: form.displayName.trim().length < 2 ? 'الاسم مطلوب (حرفان على الأقل)' : undefined,
    phone: phone.length < 6 || phone.length > 32 ? 'رقم الهاتف مطلوب (مثل ‎+249912345678)' : undefined,
    driverCode: !driver && code && !DRIVER_CODE_RE.test(code) ? 'أحرف لاتينية/أرقام/شرطة (3-32)' : undefined,
    licenseNumber: form.licenseNumber.trim().length > 64 ? 'الحد الأقصى 64 حرفًا' : undefined,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const patch: DriverPatch = {};
  if (driver) {
    if (form.displayName.trim() !== driver.displayName) patch.displayName = form.displayName.trim();
    if (phone !== (driver.phone ?? '')) patch.phone = phone;
    if (form.licenseNumber.trim() !== (driver.licenseNumber ?? '')) patch.licenseNumber = form.licenseNumber.trim() || null;
    if (form.licenseExpiry !== (driver.licenseExpiry ?? '')) patch.licenseExpiry = form.licenseExpiry || null;
  }
  const dirty = !driver || Object.keys(patch).length > 0;

  const send = () => {
    const done = { onSuccess: () => close(false) };
    if (driver) update.mutate({ id: driver.id, patch }, done);
    else
      create.mutate(
        {
          companyId: form.companyId,
          displayName: form.displayName.trim(),
          phone,
          ...(code ? { driverCode: code } : {}),
          ...(form.licenseNumber.trim() ? { licenseNumber: form.licenseNumber.trim() } : {}),
          ...(form.licenseExpiry ? { licenseExpiry: form.licenseExpiry } : {}),
        },
        done,
      );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors || !dirty) return;
    if (driver && patch.phone !== undefined && !confirming) {
      setConfirming(true);
      return;
    }
    send();
  };

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent>
        <form onSubmit={submit} className="grid gap-4">
          <ModalHeader>
            <ModalTitle>{driver ? `تعديل السائق ${driver.displayName}` : 'إضافة سائق'}</ModalTitle>
            <ModalDescription>
              {driver ? (
                <>الرمز <span dir="ltr" className="font-mono">{driver.driverCode}</span> والشركة ثابتان. يسجّل السائق الدخول برقم هاتفه.</>
              ) : (
                'يسجّل السائق الدخول إلى تطبيق السائق برقم الهاتف (رمز تحقق).'
              )}
            </ModalDescription>
          </ModalHeader>

          {confirming ? (
            <div className="rounded-lg border border-error/30 bg-error-container/30 p-3 text-sm leading-relaxed">
              <strong>تغيير رقم الهاتف سينهي كل جلسات السائق فورًا.</strong>
              <br />
              سيُسجَّل خروج السائق من تطبيق السائق، وعليه الدخول مجددًا بالرقم الجديد{' '}
              <span dir="ltr" className="font-mono">{phone}</span>.
            </div>
          ) : (
            <>
              {!driver && (
                <Select label="الشركة" value={form.companyId} onChange={set('companyId')} error={form.displayName ? errors.companyId : undefined}>
                  <option value="">اختر الشركة...</option>
                  {(carriers.data?.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              )}
              <Input label="الاسم" value={form.displayName} onChange={set('displayName')} error={form.displayName ? errors.displayName : undefined} maxLength={160} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="رقم الهاتف"
                  dir="ltr"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  error={form.phone ? errors.phone : undefined}
                  maxLength={32}
                  placeholder="+249912345678"
                  hint={driver ? 'تغييره ينهي جلسات السائق' : undefined}
                />
                {!driver && (
                  <Input label="رمز السائق" dir="ltr" value={form.driverCode} onChange={set('driverCode')} error={errors.driverCode} maxLength={32} placeholder="ZGD-0002" hint="اختياري — يُولَّد تلقائيًا" />
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="رقم الرخصة" dir="ltr" value={form.licenseNumber} onChange={set('licenseNumber')} error={errors.licenseNumber} maxLength={64} hint="اختياري" />
                <Input label="انتهاء الرخصة" type="date" dir="ltr" value={form.licenseExpiry} onChange={set('licenseExpiry')} hint="اختياري" />
              </div>
            </>
          )}

          {mutation.isError && <p className="text-xs text-error">{errorMessage(mutation.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => (confirming ? setConfirming(false) : close(false))}>
              {confirming ? 'رجوع' : 'إلغاء'}
            </Button>
            <Button type="submit" variant={confirming ? 'danger' : 'primary'} disabled={hasErrors || !dirty} isLoading={mutation.isPending}>
              {confirming ? 'تأكيد وإنهاء الجلسات' : driver ? 'حفظ' : 'إضافة'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
