import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, IconButton } from '../../../components/ui/Button';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { ApiError } from '../../../lib/api/client';
import { errorMessage } from '../../../lib/api/errors';
import { sudanDate } from '../../../lib/dates';
import { formatSdg, sdgToMinor } from '../../../lib/money';
import {
  busyTrips,
  selfBusyDeparture,
  SERVICE_CLASS_LABEL,
  stationLabel,
  useActiveRoutes,
  useDriverOptions,
  useScheduleTrips,
  useVehicleOptions,
  type ScheduledTrip,
  type ServiceClass,
} from '../api';
import { findSelfOverlap, formatDuration, formatSudanFull, generateDepartures, MAX_DEPARTURES, WEEKDAYS } from '../time';
import { BusyTripsList, Field, selectClass } from './fields';

const dateInput = 'h-10 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm font-normal';

/** POST /admin/trips/schedule: route → vehicle → driver → price → departures (Sudan time). */
export const ScheduleTripsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const routes = useActiveRoutes();
  const schedule = useScheduleTrips();
  const [tomorrow] = React.useState(() => sudanDate(new Date(Date.now() + 86_400_000)));

  const [routeId, setRouteId] = React.useState('');
  const [vehicleId, setVehicleId] = React.useState('');
  const [driverId, setDriverId] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [serviceClass, setServiceClass] = React.useState<ServiceClass | ''>('');
  const [from, setFrom] = React.useState(tomorrow);
  const [to, setTo] = React.useState(tomorrow);
  const [times, setTimes] = React.useState<string[]>(['06:00']);
  const [weekdays, setWeekdays] = React.useState<number[]>([]);
  const [created, setCreated] = React.useState<ScheduledTrip[] | null>(null);

  const route = routes.data?.find((r) => r.id === routeId);
  const vehicles = useVehicleOptions(route?.company.id);
  const drivers = useDriverOptions(route?.company.id);
  const vehicle = vehicles.data?.find((v) => v.id === vehicleId);

  const plan = React.useMemo(() => generateDepartures({ from, to, times, weekdays }), [from, to, times, weekdays]);
  const overlap = route && !plan.error ? findSelfOverlap(plan.departures, route.durationMinutes) : null;

  const priceNumber = Number(price);
  const priceError = price !== '' && (!Number.isFinite(priceNumber) || priceNumber <= 0) ? 'أدخل سعرًا موجبًا بالجنيه.' : null;
  const valid = Boolean(route && vehicle && price && !priceError && !plan.error && !overlap);

  const pickRoute = (id: string) => {
    setRouteId(id);
    setVehicleId('');
    setDriverId('');
    schedule.reset();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !route || !vehicle) return;
    schedule.mutate(
      {
        routeId: route.id,
        vehicleId: vehicle.id,
        driverId: driverId || undefined,
        departures: plan.departures,
        basePrice: sdgToMinor(priceNumber),
        serviceClass: serviceClass || undefined,
      },
      { onSuccess: setCreated },
    );
  };

  const busy = busyTrips(schedule.error);
  const selfBusy = selfBusyDeparture(schedule.error);

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent size="xl" className="max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle>جدولة رحلات</ModalTitle>
          <ModalDescription>تُنشأ رحلة لكل موعد مغادرة: المقاعد من مخطط الحافلة وأوقات المحطات من المسار. كل الأوقات بتوقيت السودان (UTC+2).</ModalDescription>
        </ModalHeader>

        {created ? (
          <div className="space-y-3 text-sm">
            <p>تمت جدولة <strong>{created.length}</strong> رحلة.</p>
            <ul className="max-h-72 overflow-y-auto divide-y divide-surface-container rounded-lg border border-outline-variant/40">
              {created.map((t) => (
                <li key={t.id} className="flex justify-between px-3 py-1.5">
                  <Link to={`/network/trips/${t.id}`} className="font-mono text-xs text-secondary" dir="ltr">{t.tripNumber}</Link>
                  <span className="text-xs text-on-surface-variant">{formatSudanFull(t.departureAt)}</span>
                </li>
              ))}
            </ul>
            <ModalFooter>
              <Button onClick={onClose}>تم</Button>
            </ModalFooter>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="المسار" error={routes.isError ? errorMessage(routes.error) : null} hint={route ? `${route.company.name} · ${stationLabel(route.originStation)} ← ${stationLabel(route.destinationStation)} · ${formatDuration(route.durationMinutes)}` : undefined}>
                <select value={routeId} onChange={(e) => pickRoute(e.target.value)} className={`${selectClass} font-normal`} required>
                  <option value="">{routes.isLoading ? 'جارٍ التحميل…' : 'اختر المسار'}</option>
                  {(routes.data ?? []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code ?? r.id.slice(-6)} — {r.originStation.city.nameAr} ← {r.destinationStation.city.nameAr} ({r.company.name})
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="الحافلة (نشطة، من نفس الشركة)"
                error={vehicles.isError ? errorMessage(vehicles.error) : route && vehicles.data?.length === 0 ? 'لا توجد حافلات نشطة لهذه الشركة.' : null}
              >
                <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} disabled={!route} className={`${selectClass} font-normal`} required>
                  <option value="">اختر الحافلة</option>
                  {(vehicles.data ?? []).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} — {v.model} · {v.capacity} مقعد · {SERVICE_CLASS_LABEL[v.serviceClass]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="السائق (اختياري)" error={drivers.isError ? errorMessage(drivers.error) : null}>
                <select value={driverId} onChange={(e) => setDriverId(e.target.value)} disabled={!route} className={`${selectClass} font-normal`}>
                  <option value="">بدون سائق الآن</option>
                  {(drivers.data ?? []).map((d) => (
                    <option key={d.id} value={d.id}>{d.displayName} ({d.driverCode})</option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="سعر المقعد (ج.س)" error={priceError} hint={price && !priceError ? formatSdg(sdgToMinor(priceNumber)) : undefined}>
                  <input type="number" min={0} step="0.01" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className={dateInput} required />
                </Field>
                <Field label="فئة الخدمة" hint={vehicle && !serviceClass ? `افتراضي: ${SERVICE_CLASS_LABEL[vehicle.serviceClass]}` : undefined}>
                  <select value={serviceClass} onChange={(e) => setServiceClass(e.target.value as ServiceClass | '')} className={`${selectClass} font-normal`}>
                    <option value="">حسب الحافلة</option>
                    <option value="STANDARD">{SERVICE_CLASS_LABEL.STANDARD}</option>
                    <option value="VIP">{SERVICE_CLASS_LABEL.VIP}</option>
                  </select>
                </Field>
              </div>
            </div>

            <fieldset className="rounded-lg border border-outline-variant/40 p-3 space-y-3">
              <legend className="px-1 text-xs font-bold">مواعيد المغادرة (توقيت السودان)</legend>
              <div className="flex flex-wrap gap-3">
                <Field label="من تاريخ">
                  <input type="date" value={from} min={sudanDate()} onChange={(e) => setFrom(e.target.value)} className={dateInput} />
                </Field>
                <Field label="إلى تاريخ">
                  <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={dateInput} />
                </Field>
                <div className="flex flex-col gap-1 text-xs font-semibold">
                  أوقات المغادرة
                  <div className="flex flex-wrap items-center gap-2">
                    {times.map((t, i) => (
                      <span key={i} className="flex items-center">
                        <input
                          type="time"
                          aria-label={`وقت ${i + 1}`}
                          value={t}
                          onChange={(e) => setTimes((ts) => ts.map((x, j) => (j === i ? e.target.value : x)))}
                          className={`${dateInput} w-32`}
                        />
                        {times.length > 1 && (
                          <IconButton type="button" size="sm" variant="ghost" icon="close" label="حذف الوقت" onClick={() => setTimes((ts) => ts.filter((_, j) => j !== i))} />
                        )}
                      </span>
                    ))}
                    <Button type="button" size="sm" variant="outline" icon="add" onClick={() => setTimes((ts) => [...ts, ''])}>وقت</Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-xs font-semibold">الأيام:</span>
                {WEEKDAYS.map((d) => (
                  <label key={d.value} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={weekdays.includes(d.value)}
                      onChange={(e) => setWeekdays((ws) => (e.target.checked ? [...ws, d.value] : ws.filter((w) => w !== d.value)))}
                    />
                    {d.label}
                  </label>
                ))}
                <span className="text-xs text-on-surface-variant">{weekdays.length === 0 ? '(بدون اختيار = كل الأيام)' : ''}</span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold">
                    المعاينة: {plan.departures.length} رحلة (الحد {MAX_DEPARTURES})
                  </span>
                  {plan.skippedPast > 0 && <span className="text-on-surface-variant">تم تجاهل {plan.skippedPast} موعد في الماضي</span>}
                </div>
                {plan.error && <p className="text-xs text-error mb-1">{plan.error}</p>}
                {overlap && (
                  <p className="text-xs text-error mb-1">
                    موعدان أقرب من مدة المسار ({formatDuration(route?.durationMinutes)}) لنفس الحافلة: {formatSudanFull(overlap[0])} و {formatSudanFull(overlap[1])}.
                  </p>
                )}
                {plan.departures.length > 0 && (
                  <ol className="max-h-48 overflow-y-auto grid sm:grid-cols-2 gap-x-4 text-xs rounded-lg bg-surface-container/40 p-2 list-decimal pr-6">
                    {plan.departures.slice(0, 120).map((d) => (
                      <li key={d} className={overlap?.includes(d) ? 'text-error' : undefined}>{formatSudanFull(d)}</li>
                    ))}
                  </ol>
                )}
              </div>
            </fieldset>

            {schedule.isError && (
              <div className="rounded-lg border border-error/30 bg-error-container/30 p-2 text-xs text-error">
                <p className="font-semibold">{errorMessage(schedule.error)}</p>
                {selfBusy && <p>تداخل بين مواعيد الطلب نفسه عند {formatSudanFull(selfBusy)}.</p>}
                {busy.length > 0 && (
                  <>
                    <p className="mt-1">الرحلات المتعارضة:</p>
                    <BusyTripsList trips={busy} />
                  </>
                )}
                {schedule.error instanceof ApiError && schedule.error.code === 'VALIDATION_ERROR' && !Array.isArray(schedule.error.details) && (
                  <p>{schedule.error.message}</p>
                )}
              </div>
            )}

            <ModalFooter>
              <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
              <Button type="submit" disabled={!valid} isLoading={schedule.isPending}>
                جدولة {plan.error ? '' : plan.departures.length} رحلة
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};
