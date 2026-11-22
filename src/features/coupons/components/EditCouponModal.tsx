import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { useUpdateCoupon, type Coupon, type CouponPatch } from '../api';
import { isoToSudanLocal, parsePositiveInt, sudanLocalToIso } from '../convert';

/**
 * PATCH /admin/coupons/:id — only isActive, validTo and maxRedemptions are editable.
 * maxRedemptions cannot go below redeemedCount; validTo must stay after validFrom.
 */
export const EditCouponModal: React.FC<{ coupon: Coupon; onClose: () => void }> = ({ coupon, onClose }) => {
  const update = useUpdateCoupon();
  const [isActive, setIsActive] = React.useState(coupon.isActive);
  const [validTo, setValidTo] = React.useState(isoToSudanLocal(coupon.validTo));
  const [maxRedemptions, setMaxRedemptions] = React.useState(coupon.maxRedemptions?.toString() ?? '');

  const fromLocal = isoToSudanLocal(coupon.validFrom);
  const parsedMax = parsePositiveInt(maxRedemptions);
  const errors = {
    validTo: !validTo ? 'مطلوب' : validTo <= fromLocal ? `يجب أن يكون بعد البداية (${formatDateTime(coupon.validFrom)})` : undefined,
    max:
      parsedMax === null
        ? 'عدد صحيح موجب'
        : parsedMax !== undefined && parsedMax < coupon.redeemedCount
          ? `لا يمكن أن يقل عن عدد الاستخدامات الحالية (${coupon.redeemedCount})`
          : undefined,
  };

  const patch: CouponPatch = {};
  if (isActive !== coupon.isActive) patch.isActive = isActive;
  if (validTo && validTo !== isoToSudanLocal(coupon.validTo)) patch.validTo = sudanLocalToIso(validTo);
  const nextMax = parsedMax ?? null;
  if (parsedMax !== null && nextMax !== coupon.maxRedemptions) patch.maxRedemptions = nextMax;
  const dirty = Object.keys(patch).length > 0;
  const valid = !errors.validTo && !errors.max;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty || !valid) return;
    update.mutate({ id: coupon.id, patch }, { onSuccess: onClose });
  };

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent>
        <form onSubmit={submit} className="grid gap-4">
          <ModalHeader>
            <ModalTitle>
              تعديل الكوبون <span dir="ltr" className="font-mono">{coupon.code}</span>
            </ModalTitle>
            <ModalDescription>يمكن تغيير التفعيل وتاريخ الانتهاء وأقصى عدد استخدامات فقط. الأوقات بتوقيت السودان.</ModalDescription>
          </ModalHeader>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
            الكوبون مفعّل
            <span className="text-xs text-on-surface-variant">(إيقافه يمنع استخدامه فورًا دون حذفه)</span>
          </label>

          <Input label="ينتهي في" type="datetime-local" dir="ltr" value={validTo} onChange={(e) => setValidTo(e.target.value)} error={errors.validTo} hint="مدّد التاريخ لإطالة صلاحية الكوبون" />

          <Input
            label="أقصى عدد استخدامات"
            type="number"
            min={Math.max(1, coupon.redeemedCount)}
            step={1}
            dir="ltr"
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            error={errors.max}
            hint={`فارغ = بلا حد. استُخدم ${coupon.redeemedCount} مرة حتى الآن، ولا يمكن خفض الحد عن ذلك.`}
          />

          {update.isError && <p className="text-xs text-error">{errorMessage(update.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={!dirty || !valid} isLoading={update.isPending}>حفظ</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
