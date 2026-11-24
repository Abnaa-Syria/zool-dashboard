import * as React from 'react';
import { Input } from '../../../components/ui/Input';
import { promoErrors, type PromoDraft } from '../promo';

/** «العرض في تطبيق العميل»: banner on the customer home while the coupon is valid. */
export const PromoFields: React.FC<{ value: PromoDraft; onChange: (v: PromoDraft) => void }> = ({ value, onChange }) => {
  const set = <K extends keyof PromoDraft>(k: K, v: PromoDraft[K]) => onChange({ ...value, [k]: v });
  const errors = promoErrors(value);
  return (
    <fieldset className="grid gap-3 rounded-xl border border-outline-variant p-3">
      <legend className="px-1 text-sm font-semibold">العرض في تطبيق العميل</legend>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={value.showInApp} onChange={(e) => set('showInApp', e.target.checked)} className="h-4 w-4" />
        إظهار الكوبون كبانر عرض في الصفحة الرئيسية للتطبيق
      </label>
      {value.showInApp && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="عنوان البانر" value={value.title} onChange={(e) => set('title', e.target.value)} error={errors.title} hint="مثال: خصم 20% على أول رحلة — فارغ = يُكتب تلقائيًا من قيمة الخصم" />
          <Input label="وصف قصير — اختياري" value={value.subtitle} onChange={(e) => set('subtitle', e.target.value)} hint="مثال: استخدم الكود عند الدفع" />
          <Input label="رابط صورة البانر — اختياري" dir="ltr" value={value.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} error={errors.imageUrl} hint="فارغ = تصميم البانر الافتراضي" />
          <Input label="ترتيب الظهور" type="number" dir="ltr" step={1} value={value.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} error={errors.sortOrder} hint="الأكبر يظهر أولًا" />
        </div>
      )}
    </fieldset>
  );
};
