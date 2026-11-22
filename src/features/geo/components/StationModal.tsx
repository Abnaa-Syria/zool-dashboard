import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { useAllCities, useCreateStation, useUpdateStation, type Station, type StationPatch } from '../api';
import { nameError, parseCoordinates } from '../validation';
import { Select } from './common';

type Form = { cityId: string; nameAr: string; nameEn: string; address: string; latitude: string; longitude: string };

const fromStation = (s: Station | undefined, defaultCityId?: string): Form => ({
  cityId: s?.city.id ?? defaultCityId ?? '',
  nameAr: s?.nameAr ?? '',
  nameEn: s?.nameEn ?? '',
  address: s?.address ?? '',
  latitude: s?.latitude != null ? String(s.latitude) : '',
  longitude: s?.longitude != null ? String(s.longitude) : '',
});

/** Create (POST /admin/stations) or edit (PATCH changed fields). The city is fixed after creation. */
export const StationModal: React.FC<{
  station?: Station;
  defaultCityId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ station, defaultCityId, open, onOpenChange }) => {
  const cities = useAllCities();
  const create = useCreateStation();
  const update = useUpdateStation();
  const mutation = station ? update : create;
  const [form, setForm] = React.useState<Form>(() => fromStation(station, defaultCityId));

  const seedKey = `${open}|${station?.id ?? 'new'}|${station?.updatedAt ?? ''}|${defaultCityId ?? ''}`;
  const [prevSeed, setPrevSeed] = React.useState(seedKey);
  if (seedKey !== prevSeed) {
    setPrevSeed(seedKey);
    if (open) setForm(fromStation(station, defaultCityId));
  }

  const close = (next: boolean) => {
    if (!next) {
      create.reset();
      update.reset();
    }
    onOpenChange(next);
  };

  const coords = parseCoordinates(form.latitude, form.longitude);
  const address = form.address.trim();
  const errors = {
    cityId: !station && !form.cityId ? 'اختر المدينة' : undefined,
    nameAr: nameError(form.nameAr, 160),
    nameEn: nameError(form.nameEn, 160),
    address: address.length > 255 ? 'الحد الأقصى 255 حرفًا' : undefined,
    coords: coords.ok ? undefined : coords.error,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const patch: StationPatch = {};
  if (station && coords.ok) {
    if (form.nameAr.trim() !== station.nameAr) patch.nameAr = form.nameAr.trim();
    if (form.nameEn.trim() !== station.nameEn) patch.nameEn = form.nameEn.trim();
    if (address !== (station.address ?? '')) patch.address = address || null;
    if (coords.latitude !== station.latitude || coords.longitude !== station.longitude) {
      patch.latitude = coords.latitude;
      patch.longitude = coords.longitude;
    }
  }
  const dirty = !station || Object.keys(patch).length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors || !dirty || !coords.ok) return;
    const done = { onSuccess: () => close(false) };
    if (station) update.mutate({ id: station.id, patch }, done);
    else
      create.mutate(
        {
          cityId: form.cityId,
          nameAr: form.nameAr.trim(),
          nameEn: form.nameEn.trim(),
          ...(address ? { address } : {}),
          ...(coords.latitude !== null ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
        },
        done,
      );
  };

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onOpenChange={close}>
      <ModalContent>
        <form onSubmit={submit} className="grid gap-4">
          <ModalHeader>
            <ModalTitle>{station ? `تعديل محطة ${station.nameAr}` : 'إضافة محطة'}</ModalTitle>
            <ModalDescription>
              {station ? `المدينة: ${station.city.nameAr} (ثابتة بعد الإنشاء).` : 'نقطة صعود أو نزول داخل مدينة.'}
            </ModalDescription>
          </ModalHeader>
          {!station && (
            <Select label="المدينة" value={form.cityId} onChange={set('cityId')} error={errors.cityId && form.nameAr ? errors.cityId : undefined}>
              <option value="">اختر المدينة...</option>
              {(cities.data?.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.nameAr} ({c.code}){c.isActive ? '' : ' — غير نشطة'}</option>
              ))}
            </Select>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="الاسم بالعربية" value={form.nameAr} onChange={set('nameAr')} error={form.nameAr ? errors.nameAr : undefined} maxLength={160} />
            <Input label="الاسم بالإنجليزية" dir="ltr" value={form.nameEn} onChange={set('nameEn')} error={form.nameEn ? errors.nameEn : undefined} maxLength={160} />
          </div>
          <Input label="العنوان" value={form.address} onChange={set('address')} error={errors.address} maxLength={255} hint="اختياري" />
          <div className="grid gap-1">
            <div className="grid grid-cols-2 gap-4">
              <Input label="خط العرض (Latitude)" dir="ltr" inputMode="decimal" value={form.latitude} onChange={set('latitude')} placeholder="15.5007" />
              <Input label="خط الطول (Longitude)" dir="ltr" inputMode="decimal" value={form.longitude} onChange={set('longitude')} placeholder="32.5599" />
            </div>
            {errors.coords ? (
              <span className="text-xs text-error font-medium">{errors.coords}</span>
            ) : (
              <span className="text-xs text-on-surface-variant">اختياري — يُدخلان معًا أو يُتركان فارغين{station ? ' (إفراغهما يحذف الموقع)' : ''}.</span>
            )}
          </div>
          {mutation.isError && <p className="text-xs text-error">{errorMessage(mutation.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>إلغاء</Button>
            <Button type="submit" disabled={hasErrors || !dirty} isLoading={mutation.isPending}>{station ? 'حفظ' : 'إضافة'}</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
