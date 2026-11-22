import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { useCreateCity, useUpdateCity, type City, type CityPatch } from '../api';
import { CITY_CODE_RE, isUrl, nameError, parseSortOrder } from '../validation';

type Form = { code: string; nameAr: string; nameEn: string; imageUrl: string; isPopular: boolean; sortOrder: string };

const fromCity = (c?: City): Form => ({
  code: c?.code ?? '',
  nameAr: c?.nameAr ?? '',
  nameEn: c?.nameEn ?? '',
  imageUrl: c?.imageUrl ?? '',
  isPopular: c?.isPopular ?? false,
  sortOrder: c ? String(c.sortOrder) : '',
});

/** Create (POST /admin/cities) or edit (PATCH with changed fields only). The code is fixed after creation. */
export const CityModal: React.FC<{ city?: City; open: boolean; onOpenChange: (open: boolean) => void }> = ({ city, open, onOpenChange }) => {
  const create = useCreateCity();
  const update = useUpdateCity();
  const mutation = city ? update : create;
  const [form, setForm] = React.useState<Form>(() => fromCity(city));

  // Re-seed the form whenever the dialog opens for a (possibly different) city.
  const seedKey = `${open}|${city?.id ?? 'new'}|${city?.updatedAt ?? ''}`;
  const [prevSeed, setPrevSeed] = React.useState(seedKey);
  if (seedKey !== prevSeed) {
    setPrevSeed(seedKey);
    if (open) setForm(fromCity(city));
  }

  const close = (next: boolean) => {
    if (!next) {
      create.reset();
      update.reset();
    }
    onOpenChange(next);
  };

  const sort = parseSortOrder(form.sortOrder);
  const code = form.code.trim().toUpperCase();
  const errors = {
    code: !city && !CITY_CODE_RE.test(code) ? 'من 2 إلى 16 حرفًا لاتينيًا (مثل KRT)' : undefined,
    nameAr: nameError(form.nameAr, 120),
    nameEn: nameError(form.nameEn, 120),
    imageUrl: form.imageUrl.trim() && !isUrl(form.imageUrl.trim()) ? 'رابط غير صالح (https://...)' : undefined,
    sortOrder: sort.error,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const patch: CityPatch = {};
  if (city) {
    if (form.nameAr.trim() !== city.nameAr) patch.nameAr = form.nameAr.trim();
    if (form.nameEn.trim() !== city.nameEn) patch.nameEn = form.nameEn.trim();
    if (form.imageUrl.trim() !== (city.imageUrl ?? '')) patch.imageUrl = form.imageUrl.trim() || null;
    if (form.isPopular !== city.isPopular) patch.isPopular = form.isPopular;
    if ((sort.value ?? 0) !== city.sortOrder) patch.sortOrder = sort.value ?? 0;
  }
  const dirty = !city || Object.keys(patch).length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors || !dirty) return;
    const done = { onSuccess: () => close(false) };
    if (city) update.mutate({ id: city.id, patch }, done);
    else
      create.mutate(
        {
          code,
          nameAr: form.nameAr.trim(),
          nameEn: form.nameEn.trim(),
          ...(form.imageUrl.trim() ? { imageUrl: form.imageUrl.trim() } : {}),
          isPopular: form.isPopular,
          ...(sort.value !== undefined ? { sortOrder: sort.value } : {}),
        },
        done,
      );
  };

  const set = (k: 'code' | 'nameAr' | 'nameEn' | 'imageUrl' | 'sortOrder') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent>
        <form onSubmit={submit} className="grid gap-4">
          <ModalHeader>
            <ModalTitle>{city ? `تعديل مدينة ${city.nameAr}` : 'إضافة مدينة'}</ModalTitle>
            <ModalDescription>
              {city ? <>الرمز <span dir="ltr" className="font-mono">{city.code}</span> ثابت بعد الإنشاء.</> : 'تظهر المدن النشطة في البحث وجدولة الرحلات.'}
            </ModalDescription>
          </ModalHeader>
          {!city && (
            <Input label="الرمز" dir="ltr" value={form.code} onChange={set('code')} error={form.code ? errors.code : undefined} maxLength={16} placeholder="KRT" hint="أحرف لاتينية كبيرة، لا يمكن تغييره لاحقًا" />
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="الاسم بالعربية" value={form.nameAr} onChange={set('nameAr')} error={form.nameAr ? errors.nameAr : undefined} maxLength={120} />
            <Input label="الاسم بالإنجليزية" dir="ltr" value={form.nameEn} onChange={set('nameEn')} error={form.nameEn ? errors.nameEn : undefined} maxLength={120} />
          </div>
          <Input label="رابط الصورة" dir="ltr" value={form.imageUrl} onChange={set('imageUrl')} error={errors.imageUrl} maxLength={512} placeholder="https://" hint="اختياري" />
          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <Input label="ترتيب العرض" dir="ltr" inputMode="numeric" value={form.sortOrder} onChange={set('sortOrder')} error={errors.sortOrder} placeholder="0" />
            <label className="flex items-center gap-2 text-sm h-10">
              <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm((f) => ({ ...f, isPopular: e.target.checked }))} />
              مدينة شائعة (تظهر في الواجهة الرئيسية للتطبيق)
            </label>
          </div>
          {mutation.isError && <p className="text-xs text-error">{errorMessage(mutation.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>إلغاء</Button>
            <Button type="submit" disabled={hasErrors || !dirty} isLoading={mutation.isPending}>{city ? 'حفظ' : 'إضافة'}</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
