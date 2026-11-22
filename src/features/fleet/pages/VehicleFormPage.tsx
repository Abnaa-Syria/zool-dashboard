import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumbs } from '../../../app/shell/Breadcrumbs';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { useCarriers } from '../../carriers/api';
import { Panel, Select } from '../../geo/components/common';
import {
  SERVICE_CLASS_LABEL,
  useCreateVehicle,
  useUpdateVehicle,
  useVehicle,
  VEHICLE_STATUS_LABEL,
  type AmenityInput,
  type ServiceClass,
  type Vehicle,
  type VehiclePatch,
  type VehicleStatus,
} from '../api';
import { AmenitiesPicker } from '../components/AmenitiesPicker';
import { SeatLayoutEditor } from '../components/SeatLayoutEditor';
import { buildNumberedLayout, layoutErrors, sameLayout, toLayoutInput, type SeatLayout } from '../seatLayout';

const normAmenities = (list: AmenityInput[]) =>
  [...list]
    .map((a) => ({ code: a.code, ...(a.value?.trim() ? { value: a.value.trim() } : {}) }))
    .sort((a, b) => a.code.localeCompare(b.code));

const sameAmenities = (a: AmenityInput[], b: AmenityInput[]) => JSON.stringify(normAmenities(a)) === JSON.stringify(normAmenities(b));

const vehicleAmenities = (v: Vehicle): AmenityInput[] => v.amenities.map((a) => ({ code: a.code, ...(a.value ? { value: a.value } : {}) }));

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <Panel className="flex flex-col gap-space-sm">
    <div>
      <h2 className="text-base font-bold">{title}</h2>
      {description && <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>}
    </div>
    {children}
  </Panel>
);

const VehicleForm: React.FC<{ vehicle?: Vehicle }> = ({ vehicle }) => {
  const navigate = useNavigate();
  const carriers = useCarriers({ pageSize: 100 });
  const create = useCreateVehicle();
  const update = useUpdateVehicle(vehicle?.id ?? '');
  const mutation = vehicle ? update : create;

  const [companyId, setCompanyId] = React.useState('');
  const [plateNumber, setPlateNumber] = React.useState('');
  const [model, setModel] = React.useState(vehicle?.model ?? '');
  const [serviceClass, setServiceClass] = React.useState<ServiceClass>(vehicle?.serviceClass ?? 'STANDARD');
  const [status, setStatus] = React.useState<VehicleStatus>(vehicle?.status ?? 'ACTIVE');
  const [layout, setLayout] = React.useState<SeatLayout>(() => vehicle?.seatLayout ?? buildNumberedLayout({ rows: 10, columns: 4 }));
  const [amenities, setAmenities] = React.useState<AmenityInput[]>(() => (vehicle ? vehicleAmenities(vehicle) : []));
  const [touched, setTouched] = React.useState(false);

  const errors = {
    companyId: !vehicle && !companyId ? 'اختر الشركة' : undefined,
    plateNumber: !vehicle && (plateNumber.trim().length < 2 || plateNumber.trim().length > 32) ? 'رقم اللوحة مطلوب (2-32 حرفًا)' : undefined,
    model: model.trim().length < 2 || model.trim().length > 120 ? 'الطراز مطلوب (2-120 حرفًا)' : undefined,
    layout: layoutErrors(layout)[0],
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const patch: VehiclePatch = {};
  const layoutChanged = vehicle ? !sameLayout(layout, vehicle.seatLayout) : true;
  if (vehicle) {
    if (model.trim() !== vehicle.model) patch.model = model.trim();
    if (serviceClass !== vehicle.serviceClass) patch.serviceClass = serviceClass;
    if (status !== vehicle.status) patch.status = status;
    if (layoutChanged) patch.layout = toLayoutInput(layout);
    if (!sameAmenities(amenities, vehicleAmenities(vehicle))) patch.amenities = normAmenities(amenities);
  }
  const dirty = !vehicle || Object.keys(patch).length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (hasErrors || !dirty) return;
    const goTo = (v: Vehicle) => navigate(`/fleet/vehicles/${v.id}`);
    if (vehicle) update.mutate(patch, { onSuccess: goTo });
    else
      create.mutate(
        {
          companyId,
          plateNumber: plateNumber.trim(),
          model: model.trim(),
          serviceClass,
          layout: toLayoutInput(layout),
          ...(amenities.length ? { amenities: normAmenities(amenities) } : {}),
        },
        { onSuccess: goTo },
      );
  };

  const show = (err: string | undefined, value: string) => (touched || value ? err : undefined);

  return (
    <form onSubmit={submit} className="flex flex-col gap-space-md">
      <Section title="البيانات الأساسية" description={vehicle ? 'الشركة ورقم اللوحة ثابتان بعد الإنشاء.' : undefined}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {vehicle ? (
            <>
              <Input label="الشركة" value={vehicle.company.name} disabled />
              <Input label="رقم اللوحة" value={vehicle.plateNumber} disabled />
            </>
          ) : (
            <>
              <Select label="الشركة" value={companyId} onChange={(e) => setCompanyId(e.target.value)} error={touched ? errors.companyId : undefined}>
                <option value="">اختر الشركة...</option>
                {(carriers.data?.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.status === 'SUSPENDED' ? ' — موقوفة' : ''}</option>
                ))}
              </Select>
              <Input label="رقم اللوحة" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} error={show(errors.plateNumber, plateNumber)} maxLength={32} placeholder="خ ر ط 1234" />
            </>
          )}
          <Input label="الطراز" value={model} onChange={(e) => setModel(e.target.value)} error={show(errors.model, model)} maxLength={120} placeholder="Toyota Coaster" />
          <Select label="فئة الخدمة" value={serviceClass} onChange={(e) => setServiceClass(e.target.value as ServiceClass)}>
            {(Object.keys(SERVICE_CLASS_LABEL) as ServiceClass[]).map((s) => <option key={s} value={s}>{SERVICE_CLASS_LABEL[s]}</option>)}
          </Select>
          {vehicle && (
            <Select label="الحالة" value={status} onChange={(e) => setStatus(e.target.value as VehicleStatus)}>
              {(Object.keys(VEHICLE_STATUS_LABEL) as VehicleStatus[]).map((s) => <option key={s} value={s}>{VEHICLE_STATUS_LABEL[s]}</option>)}
            </Select>
          )}
        </div>
      </Section>

      <Section title="تخطيط المقاعد" description="ابدأ بعدد الصفوف والمقاعد في الصف، ثم خصّص المقاعد للنساء أو أزل مقاعد عند الحاجة.">
        {vehicle && (
          <div className="flex items-start gap-2 rounded-lg border border-[#FDE68A] bg-[#FEF3C7] p-3 text-xs text-[#92400E]">
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>
              التخطيط الجديد يُطبَّق فقط على الرحلات التي تُجدوَل بعد الحفظ. الرحلات الحالية تحتفظ بمقاعدها وحجوزاتها كما هي.
              {layoutChanged && <strong> (تم تعديل التخطيط)</strong>}
            </span>
          </div>
        )}
        <SeatLayoutEditor value={layout} onChange={setLayout} />
      </Section>

      <Section title="المزايا" description="اختر مزايا الحافلة؛ أضف قيمة اختيارية مثل وزن الأمتعة المسموح (20 كغ).">
        <AmenitiesPicker value={amenities} onChange={setAmenities} />
      </Section>

      <div className="flex items-center justify-end gap-2">
        {mutation.isError && <p className="text-xs text-error me-auto">{errorMessage(mutation.error)}</p>}
        {touched && hasErrors && !mutation.isError && <p className="text-xs text-error me-auto">راجع الحقول المطلوبة وأخطاء تخطيط المقاعد.</p>}
        <Button type="button" variant="outline" onClick={() => navigate(vehicle ? `/fleet/vehicles/${vehicle.id}` : '/fleet/vehicles')}>إلغاء</Button>
        <Button type="submit" disabled={!dirty || (touched && hasErrors)} isLoading={mutation.isPending}>{vehicle ? 'حفظ التعديلات' : 'إضافة الحافلة'}</Button>
      </div>
    </form>
  );
};

/** `/fleet/vehicles/new` and `/fleet/vehicles/:id/edit`. */
export const VehicleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const vehicle = useVehicle(id);
  const title = id ? `تعديل الحافلة ${vehicle.data?.plateNumber ?? ''}` : 'إضافة حافلة';

  return (
    <div className="flex flex-col w-full pb-space-xl gap-space-md">
      <Breadcrumbs
        items={[
          { label: 'الشبكة والأسطول' },
          { label: 'الحافلات', path: '/fleet/vehicles' },
          ...(id ? [{ label: vehicle.data?.plateNumber ?? '...', path: `/fleet/vehicles/${id}` }] : []),
          { label: id ? 'تعديل' : 'إضافة' },
        ]}
      />
      <PageHeader title={title} className="mb-0" />
      {!id ? (
        <VehicleForm />
      ) : vehicle.isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : vehicle.isError ? (
        <ErrorState title="تعذّر تحميل الحافلة" message={errorMessage(vehicle.error)} onRetry={() => vehicle.refetch()} />
      ) : vehicle.data ? (
        <VehicleForm key={vehicle.data.id} vehicle={vehicle.data} />
      ) : null}
    </div>
  );
};
