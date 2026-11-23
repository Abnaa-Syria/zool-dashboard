import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { sdgToMinor } from '../../../lib/money';
import { useUpdateOfficePolicy, type BrokerOfficeDetail, type OfficePolicyPatch, type SettlementPeriod } from '../api';

const selectClass = 'h-10 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm font-normal';

/** Empty input = platform default (null). Money inputs are in SDG; the API takes minor units. */
const moneyText = (minor: number | null) => (minor === null ? '' : String(minor / 100));
const parseOptional = (text: string, toValue: (n: number) => number): number | null | 'invalid' => {
  const t = text.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? toValue(n) : 'invalid';
};

/** PATCH /brokers/:officeId with the changed policy overrides only. */
export const EditOfficeModal: React.FC<{ office: BrokerOfficeDetail; onClose: () => void }> = ({ office, onClose }) => {
  const update = useUpdateOfficePolicy(office.id);
  const [period, setPeriod] = React.useState<SettlementPeriod>(office.settlementPeriod);
  const [minTopUp, setMinTopUp] = React.useState(moneyText(office.minTopUpMinorOverride));
  const [lowBalance, setLowBalance] = React.useState(moneyText(office.lowBalanceThresholdMinorOverride));
  const [ceiling, setCeiling] = React.useState(office.exposureCeilingOverride === null ? '' : String(office.exposureCeilingOverride));
  const [timeZone, setTimeZone] = React.useState(office.timeZone ?? '');

  const minTopUpV = parseOptional(minTopUp, sdgToMinor);
  const lowBalanceV = parseOptional(lowBalance, sdgToMinor);
  const ceilingV = parseOptional(ceiling, (n) => (Number.isInteger(n) ? n : NaN));
  const errors = {
    minTopUp: minTopUpV === 'invalid' || minTopUpV === 0 ? 'أدخل مبلغًا موجبًا أو اتركه فارغًا' : undefined,
    lowBalance: lowBalanceV === 'invalid' ? 'أدخل مبلغًا صالحًا أو اتركه فارغًا' : undefined,
    ceiling: ceilingV === 'invalid' || ceilingV === 0 || Number.isNaN(ceilingV) ? 'عدد صحيح موجب أو اتركه فارغًا' : undefined,
    timeZone: timeZone.trim() && timeZone.trim().length < 3 ? 'مثال: Africa/Khartoum' : undefined,
  };

  const patch: OfficePolicyPatch = {};
  if (period !== office.settlementPeriod) patch.settlementPeriod = period;
  if (typeof minTopUpV !== 'string' && minTopUpV !== office.minTopUpMinorOverride) patch.minTopUpMinorOverride = minTopUpV;
  if (typeof lowBalanceV !== 'string' && lowBalanceV !== office.lowBalanceThresholdMinorOverride) patch.lowBalanceThresholdMinorOverride = lowBalanceV;
  if (typeof ceilingV !== 'string' && !Number.isNaN(ceilingV) && ceilingV !== office.exposureCeilingOverride) patch.exposureCeilingOverride = ceilingV;
  const tz = timeZone.trim() || null;
  if (tz !== office.timeZone) patch.timeZone = tz;

  const valid = !Object.values(errors).some(Boolean) && Object.keys(patch).length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valid) update.mutate(patch, { onSuccess: onClose });
  };

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent>
        <form onSubmit={submit} className="grid gap-3">
          <ModalHeader>
            <ModalTitle>تعديل سياسة المكتب {office.name}</ModalTitle>
            <ModalDescription>
              الحقول الفارغة تعني استخدام القيمة الافتراضية للمنصة. اسم المكتب ورمزه لا يُعدَّلان من الواجهة الحالية.
            </ModalDescription>
          </ModalHeader>
          <label className="flex flex-col gap-1 text-xs font-semibold">
            دورة التسوية
            <select value={period} onChange={(e) => setPeriod(e.target.value as SettlementPeriod)} className={selectClass}>
              <option value="WEEKLY">أسبوعية</option>
              <option value="MONTHLY">شهرية</option>
            </select>
          </label>
          <Input label="الحد الأدنى للشحن (ج.س)" inputMode="decimal" dir="ltr" value={minTopUp} onChange={(e) => setMinTopUp(e.target.value)} error={errors.minTopUp} placeholder="افتراضي المنصة" />
          <Input label="حد تنبيه الرصيد المنخفض (ج.س)" inputMode="decimal" dir="ltr" value={lowBalance} onChange={(e) => setLowBalance(e.target.value)} error={errors.lowBalance} placeholder="افتراضي المنصة" />
          <Input label="سقف التذاكر اليومي" inputMode="numeric" dir="ltr" value={ceiling} onChange={(e) => setCeiling(e.target.value)} error={errors.ceiling} placeholder="افتراضي المنصة" />
          <Input label="المنطقة الزمنية" dir="ltr" value={timeZone} onChange={(e) => setTimeZone(e.target.value)} error={errors.timeZone} placeholder="Africa/Khartoum" maxLength={64} />
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
