import * as React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { useAuth } from '../../auth/auth-context';
import { useUpdateCarrier, type CarrierDetail, type CarrierPatch, type CommissionBearer, type PlatformFeeType } from '../api';
import { COMMISSION_BEARER_LABEL, FEE_TYPE_LABEL, describeFee, feeInputToValue, feeValueToInput } from '../billing';

const selectClass = 'h-10 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm font-normal';

const BEARER_HINT: Record<CommissionBearer, string> = {
  PLATFORM: 'تدفع المنصة عمولة مكتب الوكيل من حصتها؛ لا تُخصم من مستحقات الشركة.',
  CARRIER: 'تُخصم عمولة مكتب الوكيل على كل حجز من مستحقات الشركة في التسوية.',
};

/** D-REV-02 billing configuration: platform fee per ticket + who bears the broker commission. */
export const BillingSection: React.FC<{ carrier: CarrierDetail }> = ({ carrier }) => {
  const { can } = useAuth();
  const [editOpen, setEditOpen] = React.useState(false);
  const b = carrier.billing;

  return (
    <section className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-space-md space-y-space-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-on-surface">إعدادات التسوية</h2>
          <p className="text-xs text-on-surface-variant">تُطبَّق على كشوف التسوية الجديدة وعلى إعادة احتساب المسودات.</p>
        </div>
        <div className="flex gap-2">
          {can('carriers.view') && (
            <Link to={`/financials/carrier-settlements?companyId=${carrier.id}`} className="text-sm text-secondary self-center">كشوف التسوية</Link>
          )}
          {can('carriers.manage') && b && <Button size="sm" variant="outline" icon="edit" onClick={() => setEditOpen(true)}>تعديل</Button>}
        </div>
      </div>
      {b ? (
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-on-surface-variant">رسوم المنصة على كل تذكرة</dt>
            <dd className="text-sm text-on-surface flex items-center gap-2">
              <Badge variant={b.platformFeeType === 'NONE' ? 'neutral' : 'info'}>{FEE_TYPE_LABEL[b.platformFeeType]}</Badge>
              {b.platformFeeType !== 'NONE' && <span className="font-semibold tabular-nums">{describeFee(b.platformFeeType, b.platformFeeValue)}</span>}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-on-surface-variant">من يتحمل عمولة الوكيل</dt>
            <dd className="text-sm text-on-surface">
              <span className="font-semibold">{COMMISSION_BEARER_LABEL[b.brokerCommissionBearer]}</span>
              <p className="text-xs text-on-surface-variant">{BEARER_HINT[b.brokerCommissionBearer]}</p>
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-on-surface-variant">إعدادات التسوية غير متاحة من الخادم.</p>
      )}
      {editOpen && b && <EditBillingModal carrier={carrier} onClose={() => setEditOpen(false)} />}
    </section>
  );
};

const EditBillingModal: React.FC<{ carrier: CarrierDetail; onClose: () => void }> = ({ carrier, onClose }) => {
  const update = useUpdateCarrier(carrier.id);
  const b = carrier.billing;
  const [feeType, setFeeType] = React.useState<PlatformFeeType>(b.platformFeeType);
  const [feeInput, setFeeInput] = React.useState(feeValueToInput(b.platformFeeType, b.platformFeeValue));
  const [bearer, setBearer] = React.useState<CommissionBearer>(b.brokerCommissionBearer);

  const parsed = feeInputToValue(feeType, feeInput);
  const error = 'error' in parsed && feeInput.trim() ? parsed.error : undefined;
  const value = 'value' in parsed ? parsed.value : null;

  const patch: CarrierPatch = {};
  if (feeType !== b.platformFeeType) patch.platformFeeType = feeType;
  if (value !== null && value !== b.platformFeeValue) patch.platformFeeValue = value;
  if (bearer !== b.brokerCommissionBearer) patch.brokerCommissionBearer = bearer;
  const valid = value !== null && Object.keys(patch).length > 0;

  const changeType = (next: PlatformFeeType) => {
    setFeeType(next);
    // Units differ between types (percent vs SDG), so never carry a value across.
    setFeeInput(next === b.platformFeeType ? feeValueToInput(next, b.platformFeeValue) : '');
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    update.mutate(patch, { onSuccess: onClose });
  };

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent>
        <form onSubmit={submit} className="grid gap-4">
          <ModalHeader>
            <ModalTitle>تعديل إعدادات التسوية</ModalTitle>
            <ModalDescription>
              التغيير لا يمس الكشوف المعتمدة أو المدفوعة؛ يُطبَّق على الكشوف الجديدة وعند إعادة احتساب مسودة.
            </ModalDescription>
          </ModalHeader>
          <label className="flex flex-col gap-1 text-xs font-semibold">
            رسوم المنصة على كل تذكرة
            <select value={feeType} onChange={(e) => changeType(e.target.value as PlatformFeeType)} className={selectClass}>
              {(Object.keys(FEE_TYPE_LABEL) as PlatformFeeType[]).map((t) => (
                <option key={t} value={t}>{FEE_TYPE_LABEL[t]}</option>
              ))}
            </select>
          </label>
          {feeType === 'PERCENT' && (
            <Input
              label="النسبة (%)"
              dir="ltr"
              inputMode="decimal"
              value={feeInput}
              onChange={(e) => setFeeInput(e.target.value)}
              error={error}
              placeholder="5"
              hint="تُحسب من قيمة التذكرة قبل خصم كوبونات المنصة. الحد الأقصى 100%."
              required
            />
          )}
          {feeType === 'FIXED' && (
            <Input
              label="المبلغ لكل تذكرة (ج.س)"
              dir="ltr"
              inputMode="decimal"
              value={feeInput}
              onChange={(e) => setFeeInput(e.target.value)}
              error={error}
              placeholder="500"
              hint="يُخصم عن كل تذكرة مباعة بأي قناة (تطبيق، وكيل، نقدًا)."
              required
            />
          )}
          <fieldset className="grid gap-2">
            <legend className="text-xs font-semibold mb-1">من يتحمل عمولة الوكيل</legend>
            {(['PLATFORM', 'CARRIER'] as CommissionBearer[]).map((v) => (
              <label key={v} className="flex items-start gap-2 text-sm">
                <input type="radio" name="bearer" className="mt-1" checked={bearer === v} onChange={() => setBearer(v)} />
                <span>
                  <span className="font-semibold">{COMMISSION_BEARER_LABEL[v]}</span>
                  <span className="block text-xs text-on-surface-variant">{BEARER_HINT[v]}</span>
                </span>
              </label>
            ))}
          </fieldset>
          {update.isError && <p className="text-xs text-error">{errorMessage(update.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={!valid} isLoading={update.isPending}>حفظ</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
