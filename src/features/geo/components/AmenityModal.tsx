import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { useCreateAmenity, useUpdateAmenity, type Amenity, type AmenityPatch } from '../api';
import { AMENITY_CODE_RE, nameError, parseSortOrder } from '../validation';
import { Icon } from './common';

type Form = { code: string; nameAr: string; nameEn: string; icon: string; sortOrder: string };

const fromAmenity = (a?: Amenity): Form => ({
  code: a?.code ?? '',
  nameAr: a?.nameAr ?? '',
  nameEn: a?.nameEn ?? '',
  icon: a?.icon ?? '',
  sortOrder: a ? String(a.sortOrder) : '',
});

const ICON_SUGGESTIONS = ['wifi', 'usb', 'ac_unit', 'restaurant', 'wc', 'tv', 'event_seat', 'luggage', 'power', 'local_drink', 'airline_seat_recline_extra', 'water_drop'];

/** Create (POST /admin/amenities) or edit (PATCH changed fields). The code is fixed after creation. */
export const AmenityModal: React.FC<{ amenity?: Amenity; open: boolean; onOpenChange: (open: boolean) => void }> = ({ amenity, open, onOpenChange }) => {
  const create = useCreateAmenity();
  const update = useUpdateAmenity();
  const mutation = amenity ? update : create;
  const [form, setForm] = React.useState<Form>(() => fromAmenity(amenity));

  const seedKey = `${open}|${amenity?.id ?? 'new'}`;
  const [prevSeed, setPrevSeed] = React.useState(seedKey);
  if (seedKey !== prevSeed) {
    setPrevSeed(seedKey);
    if (open) setForm(fromAmenity(amenity));
  }

  const close = (next: boolean) => {
    if (!next) {
      create.reset();
      update.reset();
    }
    onOpenChange(next);
  };

  const sort = parseSortOrder(form.sortOrder);
  const code = form.code.trim().toLowerCase();
  const icon = form.icon.trim();
  const errors = {
    code: !amenity && !AMENITY_CODE_RE.test(code) ? 'snake_case: يبدأ بحرف لاتيني صغير، ثم أحرف/أرقام/شرطة سفلية (2-32)' : undefined,
    nameAr: nameError(form.nameAr, 80),
    nameEn: nameError(form.nameEn, 80),
    icon: !icon ? 'اسم الأيقونة مطلوب' : icon.length > 64 ? 'الحد الأقصى 64 حرفًا' : undefined,
    sortOrder: sort.error,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const patch: AmenityPatch = {};
  if (amenity) {
    if (form.nameAr.trim() !== amenity.nameAr) patch.nameAr = form.nameAr.trim();
    if (form.nameEn.trim() !== amenity.nameEn) patch.nameEn = form.nameEn.trim();
    if (icon !== amenity.icon) patch.icon = icon;
    if ((sort.value ?? 0) !== amenity.sortOrder) patch.sortOrder = sort.value ?? 0;
  }
  const dirty = !amenity || Object.keys(patch).length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors || !dirty) return;
    const done = { onSuccess: () => close(false) };
    if (amenity) update.mutate({ id: amenity.id, patch }, done);
    else
      create.mutate(
        { code, nameAr: form.nameAr.trim(), nameEn: form.nameEn.trim(), icon, ...(sort.value !== undefined ? { sortOrder: sort.value } : {}) },
        done,
      );
  };

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent>
        <form onSubmit={submit} className="grid gap-4">
          <ModalHeader>
            <ModalTitle>{amenity ? `تعديل ${amenity.nameAr}` : 'إضافة ميزة'}</ModalTitle>
            <ModalDescription>
              {amenity ? <>الرمز <span dir="ltr" className="font-mono">{amenity.code}</span> ثابت بعد الإنشاء.</> : 'ميزة يمكن إسنادها إلى الحافلات وتظهر للمسافرين.'}
            </ModalDescription>
          </ModalHeader>
          {!amenity && (
            <Input label="الرمز" dir="ltr" value={form.code} onChange={set('code')} error={form.code ? errors.code : undefined} maxLength={32} placeholder="usb_charging" />
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="الاسم بالعربية" value={form.nameAr} onChange={set('nameAr')} error={form.nameAr ? errors.nameAr : undefined} maxLength={80} />
            <Input label="الاسم بالإنجليزية" dir="ltr" value={form.nameEn} onChange={set('nameEn')} error={form.nameEn ? errors.nameEn : undefined} maxLength={80} />
          </div>
          <div className="flex items-end gap-3">
            <Input
              label="الأيقونة (Material Symbols)"
              dir="ltr"
              value={form.icon}
              onChange={set('icon')}
              error={form.icon ? errors.icon : undefined}
              maxLength={64}
              placeholder="wifi"
            />
            <div className="w-10 h-10 shrink-0 rounded-lg border border-outline-variant/60 bg-surface-container flex items-center justify-center text-secondary" title="معاينة">
              {icon ? <Icon name={icon} className="text-[22px]" /> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ICON_SUGGESTIONS.map((name) => (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => setForm((f) => ({ ...f, icon: name }))}
                className="w-8 h-8 rounded-md border border-outline-variant/40 hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <Icon name={name} className="text-[18px]" />
              </button>
            ))}
            <a href="https://fonts.google.com/icons" target="_blank" rel="noreferrer" className="text-xs text-secondary self-center ms-2">تصفح كل الأيقونات</a>
          </div>
          <Input label="ترتيب العرض" dir="ltr" inputMode="numeric" value={form.sortOrder} onChange={set('sortOrder')} error={errors.sortOrder} placeholder="0" />
          {mutation.isError && <p className="text-xs text-error">{errorMessage(mutation.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>إلغاء</Button>
            <Button type="submit" disabled={hasErrors || !dirty} isLoading={mutation.isPending}>{amenity ? 'حفظ' : 'إضافة'}</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
