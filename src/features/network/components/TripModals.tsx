import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { ApiError } from '../../../lib/api/client';
import { errorMessage } from '../../../lib/api/errors';
import { formatDateTime } from '../../../lib/dates';
import { formatSdg } from '../../../lib/money';
import {
  busyTrips,
  useCancelScheduledTrip,
  useDriverOptions,
  useUpdateAssignment,
  useVehicleOptions,
  type CancelTripResult,
  type ScheduledTrip,
} from '../api';
import { BusyTripsList, Field, selectClass } from './fields';

const NO_DRIVER = '__none__';

/**
 * PATCH /admin/trips/:id/assignment. Vehicle only while SCHEDULED with no held/sold seat (the
 * seat map is rebuilt from the new layout); driver any time before completion, or cleared.
 */
export const AssignmentModal: React.FC<{ trip: ScheduledTrip; onClose: () => void }> = ({ trip, onClose }) => {
  const vehicles = useVehicleOptions(trip.company.id);
  const drivers = useDriverOptions(trip.company.id);
  const update = useUpdateAssignment(trip.id);
  const canChangeVehicle = trip.status === 'SCHEDULED' && trip.seatCounts.held + trip.seatCounts.sold === 0;
  const [vehicleId, setVehicleId] = React.useState(trip.vehicle?.id ?? '');
  const [driverId, setDriverId] = React.useState(trip.driver?.id ?? NO_DRIVER);

  const patch: { vehicleId?: string; driverId?: string | null } = {};
  if (canChangeVehicle && vehicleId && vehicleId !== trip.vehicle?.id) patch.vehicleId = vehicleId;
  const currentDriver = trip.driver?.id ?? NO_DRIVER;
  if (driverId !== currentDriver) patch.driverId = driverId === NO_DRIVER ? null : driverId;
  const changed = Object.keys(patch).length > 0;

  // Current vehicle/driver may be inactive now — keep them listed.
  const vehicleOptions = [...(vehicles.data ?? [])];
  if (trip.vehicle && !vehicleOptions.some((v) => v.id === trip.vehicle!.id)) {
    vehicleOptions.unshift({ ...trip.vehicle, company: trip.company, serviceClass: trip.serviceClass, status: 'ACTIVE' });
  }
  const driverOptions = [...(drivers.data ?? [])];
  if (trip.driver && !driverOptions.some((d) => d.id === trip.driver!.id)) {
    driverOptions.unshift({ ...trip.driver, company: trip.company, status: 'ACTIVE' });
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (changed) update.mutate(patch, { onSuccess: onClose });
  };
  const busy = busyTrips(update.error);
  const taken = update.error instanceof ApiError && update.error.code === 'TRIP_SEATS_TAKEN';

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent>
        <form onSubmit={submit} className="grid gap-4">
          <ModalHeader>
            <ModalTitle>تغيير الحافلة / السائق</ModalTitle>
            <ModalDescription>يُرفض التعيين إذا كانت الحافلة أو السائق مرتبطين برحلة متداخلة زمنيًا.</ModalDescription>
          </ModalHeader>
          <Field
            label="الحافلة"
            error={vehicles.isError ? errorMessage(vehicles.error) : null}
            hint={canChangeVehicle ? 'تغيير الحافلة يعيد بناء خريطة المقاعد من مخطط الحافلة الجديدة.' : 'لا يمكن تغيير الحافلة: الرحلة ليست مجدولة أو توجد مقاعد محجوزة/مباعة.'}
          >
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} disabled={!canChangeVehicle} className={`${selectClass} font-normal`}>
              {!trip.vehicle && <option value="">بدون حافلة</option>}
              {vehicleOptions.map((v) => (
                <option key={v.id} value={v.id}>{v.plateNumber} — {v.model} · {v.capacity} مقعد</option>
              ))}
            </select>
          </Field>
          <Field label="السائق" error={drivers.isError ? errorMessage(drivers.error) : null}>
            <select value={driverId} onChange={(e) => setDriverId(e.target.value)} className={`${selectClass} font-normal`}>
              <option value={NO_DRIVER}>بدون سائق (إزالة التعيين)</option>
              {driverOptions.map((d) => (
                <option key={d.id} value={d.id}>{d.displayName} ({d.driverCode})</option>
              ))}
            </select>
          </Field>
          {update.isError && (
            <div className="text-xs text-error">
              <p>{errorMessage(update.error)}</p>
              {taken && <p>حدّث الصفحة: تغيّرت حالة المقاعد.</p>}
              {busy.length > 0 && <BusyTripsList trips={busy} />}
            </div>
          )}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={!changed} isLoading={update.isPending}>حفظ</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

/** POST /admin/trips/:id/cancel — D-SUS-01 full refund of every confirmed booking. */
export const CancelTripModal: React.FC<{ trip: ScheduledTrip; onClose: () => void }> = ({ trip, onClose }) => {
  const cancel = useCancelScheduledTrip(trip.id);
  const [reason, setReason] = React.useState('');
  const [result, setResult] = React.useState<CancelTripResult | null>(null);
  const valid = reason.trim().length >= 3;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (valid) cancel.mutate(reason.trim(), { onSuccess: setResult });
  };

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>إلغاء الرحلة {trip.tripNumber ?? ''}</ModalTitle>
          <ModalDescription>
            {trip.origin} ← {trip.destination} · {formatDateTime(trip.departureAt)}
          </ModalDescription>
        </ModalHeader>
        {result ? (
          <div className="space-y-2 text-sm">
            <p>
              أُلغيت الرحلة. تم استرداد <strong>{result.refundedBookings}</strong> حجز بقيمة <strong>{formatSdg(result.refundedAmountMinor)}</strong>.
            </p>
            {result.failed.length > 0 && (
              <div className="rounded-lg border border-error/30 bg-error-container/30 p-2 space-y-1">
                <p className="font-semibold text-error">
                  تعذّر استرداد {result.failed.length} حجز — أعد تنفيذ الإلغاء لاحقًا لإكمالها (العملية آمنة للتكرار) أو راجعها من صفحة الحجوزات:
                </p>
                <ul className="text-xs space-y-0.5">
                  {result.failed.map((f) => (
                    <li key={f.bookingId}>
                      <span dir="ltr" className="font-mono">{f.bookingId}</span> — {errorMessage(new ApiError({ status: 0, code: f.code, message: f.message }))}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <ModalFooter>
              <Button onClick={onClose}>تم</Button>
            </ModalFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-3">
            <p className="text-sm">
              ستتوقف المبيعات فورًا وتُحرَّر المقاعد المحجوزة مؤقتًا، ثم يُسترد كل حجز مؤكد ({trip.seatCounts.sold} مقعد مباع) بالكامل بدون رسوم
              إلغاء: حجوزات الوكلاء إلى محفظة المكتب مع استرجاع العمولة، والحجوزات المباشرة إلى وسيلة الدفع الأصلية. لا يمكن التراجع.
            </p>
            <label className="flex flex-col gap-1 text-xs font-semibold">
              سبب الإلغاء
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                rows={3}
                required
                className="rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-2 text-sm font-normal"
                placeholder="مثال: عطل في الحافلة"
              />
            </label>
            {cancel.isError && <p className="text-xs text-error">{errorMessage(cancel.error)}</p>}
            <ModalFooter>
              <Button type="button" variant="outline" onClick={onClose}>تراجع</Button>
              <Button type="submit" variant="danger" disabled={!valid} isLoading={cancel.isPending}>تأكيد الإلغاء والاسترداد</Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};
