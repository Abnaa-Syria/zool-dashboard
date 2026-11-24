import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { formatSdg } from '../../../lib/money';
import type { CarrierListItem } from '../../carriers/api';
import { CODE_RE, useCreateCoupon, type DiscountType } from '../api';
import { parsePositive, parsePositiveInt, parseSdgToMinor, percentToBasisPoints, sdgToMinor, sudanLocalToIso } from '../convert';
import { EMPTY_PROMO, promoErrors, promoInput, type PromoDraft } from '../promo';
import { PromoFields } from './PromoFields';

const selectCls = 'h-10 w-full rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm';

const EMPTY = {
  code: '',
  discountType: 'PERCENT' as DiscountType,
  amount: '',
  maxDiscount: '',
  minSubtotal: '',
  companyId: '',
  validFrom: '',
  validTo: '',
  maxRedemptions: '',
  perCustomerLimit: '1',
};

/** POST /admin/coupons. PERCENT is entered in % (sent as basis points); amounts in SDG (sent as minor units). */
export const CreateCouponModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carriers: CarrierListItem[];
  carriersUnavailable: boolean;
}> = ({ open, onOpenChange, carriers, carriersUnavailable }) => {
  const create = useCreateCoupon();
  const [f, setF] = React.useState(EMPTY);
  const [promo, setPromo] = React.useState<PromoDraft>(EMPTY_PROMO);
  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => setF((prev) => ({ ...prev, [k]: v }));

  const isPercent = f.discountType === 'PERCENT';
  const amount = parsePositive(f.amount);
  const value =
    amount == null ? null : isPercent ? percentToBasisPoints(amount) : sdgToMinor(amount);
  const maxDiscount = parseSdgToMinor(f.maxDiscount);
  const minSubtotal = parseSdgToMinor(f.minSubtotal);
  const maxRedemptions = parsePositiveInt(f.maxRedemptions);
  const perCustomer = parsePositiveInt(f.perCustomerLimit);

  const errors = {
    code: f.code && !CODE_RE.test(f.code) ? '3–32 حرفًا: أحرف إنجليزية كبيرة وأرقام و _ و -' : undefined,
    amount:
      f.amount === ''
        ? undefined
        : value === null || value < 1
          ? 'قيمة غير صحيحة'
          : isPercent && value > 10_000
            ? 'النسبة بين 0.01% و 100%'
            : undefined,
    maxDiscount: maxDiscount === null ? 'مبلغ غير صحيح' : undefined,
    minSubtotal: minSubtotal === null ? 'مبلغ غير صحيح' : undefined,
    validTo: f.validFrom && f.validTo && f.validTo <= f.validFrom ? 'يجب أن يكون بعد تاريخ البداية' : undefined,
    maxRedemptions: maxRedemptions === null ? 'عدد صحيح موجب' : undefined,
    perCustomer: perCustomer === null || (perCustomer !== undefined && perCustomer > 100) ? 'عدد صحيح بين 1 و 100' : undefined,
  };
  const valid =
    CODE_RE.test(f.code) &&
    value !== null &&
    f.amount !== '' &&
    f.validFrom !== '' &&
    f.validTo !== '' &&
    Object.values(errors).every((e) => !e);

  const close = (next: boolean) => {
    if (!next) {
      setF(EMPTY);
      setPromo(EMPTY_PROMO);
      create.reset();
    }
    onOpenChange(next);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || value === null) return;
    create.mutate(
      {
        code: f.code,
        discountType: f.discountType,
        value,
        ...(isPercent && maxDiscount ? { maxDiscountAmountMinor: maxDiscount } : {}),
        ...(minSubtotal ? { minSubtotalAmountMinor: minSubtotal } : {}),
        ...(f.companyId ? { companyId: f.companyId } : {}),
        validFrom: sudanLocalToIso(f.validFrom),
        validTo: sudanLocalToIso(f.validTo),
        ...(maxRedemptions ? { maxRedemptions } : {}),
        ...(perCustomer ? { perCustomerLimit: perCustomer } : {}),
        ...(promo.showInApp ? promoInput(promo) : {}),
      },
      { onSuccess: () => close(false) },
    );
  };

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={submit} className="grid gap-4">
          <ModalHeader>
            <ModalTitle>إنشاء كوبون</ModalTitle>
            <ModalDescription>الرمز ونوع الخصم وقيمته وتاريخ البداية لا تتغير بعد الإنشاء. الأوقات بتوقيت السودان.</ModalDescription>
          </ModalHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="رمز الكوبون" dir="ltr" value={f.code} onChange={(e) => set('code', e.target.value.trim().toUpperCase())} error={errors.code} placeholder="EID25" maxLength={32} required />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface" htmlFor="coupon-type">نوع الخصم</label>
              <select id="coupon-type" className={selectCls} value={f.discountType} onChange={(e) => set('discountType', e.target.value as DiscountType)}>
                <option value="PERCENT">نسبة مئوية (%)</option>
                <option value="FIXED">مبلغ ثابت (ج.س)</option>
              </select>
            </div>
            <Input
              label={isPercent ? 'نسبة الخصم (%)' : 'مبلغ الخصم (ج.س)'}
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              dir="ltr"
              value={f.amount}
              onChange={(e) => set('amount', e.target.value)}
              error={errors.amount}
              hint={value !== null && !errors.amount ? (isPercent ? `يُرسل ${value} نقطة أساس` : `= ${formatSdg(value)}`) : undefined}
              required
            />
            {isPercent ? (
              <Input label="أقصى خصم (ج.س) — اختياري" type="number" inputMode="decimal" min={0} step="0.01" dir="ltr" value={f.maxDiscount} onChange={(e) => set('maxDiscount', e.target.value)} error={errors.maxDiscount} hint="سقف الخصم لكل حجز" />
            ) : (
              <div />
            )}
            <Input label="أدنى قيمة للحجز (ج.س) — اختياري" type="number" inputMode="decimal" min={0} step="0.01" dir="ltr" value={f.minSubtotal} onChange={(e) => set('minSubtotal', e.target.value)} error={errors.minSubtotal} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface" htmlFor="coupon-carrier">شركة النقل</label>
              <select id="coupon-carrier" className={selectCls} value={f.companyId} onChange={(e) => set('companyId', e.target.value)}>
                <option value="">كل الشركات</option>
                {carriers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {carriersUnavailable && <span className="text-xs text-on-surface-variant">تعذّر تحميل الشركات (يتطلب صلاحية carriers.view).</span>}
            </div>
            <Input label="يبدأ في" type="datetime-local" dir="ltr" value={f.validFrom} onChange={(e) => set('validFrom', e.target.value)} required />
            <Input label="ينتهي في" type="datetime-local" dir="ltr" value={f.validTo} onChange={(e) => set('validTo', e.target.value)} error={errors.validTo} required />
            <Input label="أقصى عدد استخدامات — اختياري" type="number" min={1} step={1} dir="ltr" value={f.maxRedemptions} onChange={(e) => set('maxRedemptions', e.target.value)} error={errors.maxRedemptions} hint="فارغ = بلا حد" />
            <Input label="الحد لكل عميل" type="number" min={1} max={100} step={1} dir="ltr" value={f.perCustomerLimit} onChange={(e) => set('perCustomerLimit', e.target.value)} error={errors.perCustomer} hint="الافتراضي 1" />
          </div>

          <PromoFields value={promo} onChange={setPromo} />

          {create.isError && <p className="text-xs text-error">{errorMessage(create.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>إلغاء</Button>
            <Button type="submit" disabled={!valid || Object.keys(promoErrors(promo)).length > 0} isLoading={create.isPending}>إنشاء</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
