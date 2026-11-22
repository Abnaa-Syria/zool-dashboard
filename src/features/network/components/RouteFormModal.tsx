import * as React from 'react';
import { Button, IconButton } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { errorMessage } from '../../../lib/api/errors';
import { useCarriers } from '../../carriers/api';
import { stationLabel, useCreateRoute, useStationOptions, useUpdateRoute, type RouteDto, type StopInput } from '../api';
import { formatDuration, validateStops, type StopDraft } from '../time';
import { DurationInput, Field, selectClass, StationSelect } from './fields';

type Row = StopDraft & { key: number };

let rowSeq = 0;
const newRow = (s?: Partial<StopDraft>): Row => ({ key: (rowSeq += 1), stationId: s?.stationId ?? '', offsetMinutes: s?.offsetMinutes ?? '', dwellMinutes: s?.dwellMinutes ?? 0 });

const CODE_RE = /^[A-Z0-9-]{2,32}$/;

/**
 * Create (POST /admin/routes) or edit (PATCH /admin/routes/:id). Carrier, code and endpoints are
 * fixed after creation (backend accepts only duration / isActive / stops on PATCH).
 */
export const RouteFormModal: React.FC<{ route: RouteDto | null; onClose: () => void }> = ({ route, onClose }) => {
  const editing = route !== null;
  const carriers = useCarriers({ page: 1, pageSize: 100 });
  const stations = useStationOptions();
  const create = useCreateRoute();
  const update = useUpdateRoute();
  const mutation = editing ? update : create;

  const [companyId, setCompanyId] = React.useState(route?.company.id ?? '');
  const [code, setCode] = React.useState(route?.code ?? '');
  const [originId, setOriginId] = React.useState(route?.originStation.id ?? '');
  const [destinationId, setDestinationId] = React.useState(route?.destinationStation.id ?? '');
  const [duration, setDuration] = React.useState(route?.durationMinutes ?? 240);
  const [isActive, setIsActive] = React.useState(route?.isActive ?? true);
  const [rows, setRows] = React.useState<Row[]>(() => (route?.stops ?? []).map((s) => newRow({ stationId: s.station.id, offsetMinutes: s.offsetMinutes, dwellMinutes: s.dwellMinutes })));

  const stationOptions = React.useMemo(() => {
    const list = stations.data ?? [];
    // Keep stations already on the route selectable even if since deactivated.
    const extra = route ? [route.originStation, route.destinationStation, ...route.stops.map((s) => s.station)].filter((s) => !list.some((x) => x.id === s.id)) : [];
    return [...list, ...extra.map((s) => ({ ...s, isActive: false }))];
  }, [stations.data, route]);

  const stopErrors = validateStops(rows, duration, { originStationId: originId, destinationStationId: destinationId });
  const codeError = !editing && code && !CODE_RE.test(code) ? 'حروف إنجليزية كبيرة وأرقام و - (2–32)، مثال: KRT-PZU' : null;
  const durationError = duration < 10 ? 'المدة 10 دقائق على الأقل.' : duration > 10_080 ? 'المدة أكثر من 7 أيام.' : null;
  const endpointsError = originId && destinationId && originId === destinationId ? 'يجب أن تختلف محطة الوصول عن محطة الانطلاق.' : null;
  const valid =
    Boolean(companyId && originId && destinationId) && !codeError && !durationError && !endpointsError && stopErrors.every((e) => e === null);

  const setRow = (key: number, patch: Partial<StopDraft>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const move = (index: number, delta: number) =>
    setRows((rs) => {
      const next = [...rs];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item!);
      return next;
    });
  const addRow = () => {
    const last = rows.at(-1);
    const after = last && last.offsetMinutes !== '' ? last.offsetMinutes + (last.dwellMinutes || 0) : 0;
    setRows((rs) => [...rs, newRow({ offsetMinutes: Math.min(after + 60, Math.max(duration - 1, 1)), dwellMinutes: 15 })]);
  };

  const stopsPayload = (): StopInput[] =>
    rows.map((r) => ({ stationId: r.stationId, offsetMinutes: Number(r.offsetMinutes), dwellMinutes: r.dwellMinutes === '' ? 0 : r.dwellMinutes }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    if (route) {
      update.mutate({ id: route.id, patch: { durationMinutes: duration, isActive, stops: stopsPayload() } }, { onSuccess: onClose });
    } else {
      create.mutate(
        { companyId, code: code || undefined, originStationId: originId, destinationStationId: destinationId, durationMinutes: duration, stops: stopsPayload() },
        { onSuccess: onClose },
      );
    }
  };

  const numClass = 'h-9 w-full rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-2 text-sm tabular-nums';

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent size="xl" className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={submit} className="grid gap-4">
          <ModalHeader>
            <ModalTitle>{editing ? `تعديل المسار ${route.code ?? ''}` : 'إضافة مسار'}</ModalTitle>
            <ModalDescription>
              {editing
                ? 'تعديل المدة والمحطات يسري على الرحلات المجدولة بعد الحفظ فقط. الشركة ونقطتا البداية والنهاية ثابتة.'
                : 'المسار خط ثابت لشركة نقل: محطة انطلاق ووصول ومحطات توقف بأوقات نسبية من موعد المغادرة.'}
            </ModalDescription>
          </ModalHeader>

          {stations.isError && <p className="text-xs text-error">تعذّر تحميل المحطات: {errorMessage(stations.error)}</p>}

          {editing ? (
            <div className="grid sm:grid-cols-3 gap-3 text-sm rounded-lg bg-surface-container/50 p-3">
              <div><span className="text-xs text-on-surface-variant block">الشركة</span>{route.company.name}</div>
              <div><span className="text-xs text-on-surface-variant block">الانطلاق</span>{stationLabel(route.originStation)}</div>
              <div><span className="text-xs text-on-surface-variant block">الوصول</span>{stationLabel(route.destinationStation)}</div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="شركة النقل" error={carriers.isError ? errorMessage(carriers.error) : null}>
                <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={`${selectClass} font-normal`} required>
                  <option value="">اختر الشركة</option>
                  {(carriers.data?.data ?? []).map((c) => (
                    <option key={c.id} value={c.id} disabled={c.status !== 'ACTIVE'}>
                      {c.name}{c.status !== 'ACTIVE' ? ' (موقوفة)' : ''}
                    </option>
                  ))}
                </select>
              </Field>
              <Input label="رمز المسار (اختياري)" dir="ltr" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().trim())} error={codeError ?? undefined} placeholder="KRT-PZU" maxLength={32} />
              <Field label="محطة الانطلاق">
                <StationSelect stations={stationOptions} value={originId} onChange={setOriginId} />
              </Field>
              <Field label="محطة الوصول" error={endpointsError}>
                <StationSelect stations={stationOptions} value={destinationId} onChange={setDestinationId} exclude={[originId]} />
              </Field>
            </div>
          )}

          <div className="flex flex-wrap items-end gap-6">
            <Field label="مدة الرحلة" error={durationError} hint={`= ${duration} دقيقة`}>
              <DurationInput minutes={duration} onChange={setDuration} />
            </Field>
            {editing && (
              <label className="flex items-center gap-2 text-sm pb-2">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
                المسار نشط (متاح للجدولة)
              </label>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">محطات التوقف ({rows.length})</h3>
                <p className="text-xs text-on-surface-variant">الوصول = دقائق بعد المغادرة من محطة الانطلاق، والتوقف = دقائق الانتظار في المحطة. يجب أن تكون متزايدة وقبل الوصول النهائي.</p>
              </div>
              <Button type="button" size="sm" variant="outline" icon="add" onClick={addRow} disabled={rows.length >= 30}>إضافة محطة</Button>
            </div>
            {rows.length === 0 ? (
              <p className="text-xs text-on-surface-variant rounded-lg border border-dashed border-outline-variant/60 p-3 text-center">رحلة مباشرة بدون توقف.</p>
            ) : (
              <ol className="space-y-2">
                {rows.map((r, i) => (
                  <li key={r.key} className="rounded-lg border border-outline-variant/40 p-2">
                    <div className="grid grid-cols-[2rem_minmax(0,1fr)_6rem_6rem_auto] items-center gap-2">
                      <span className="text-xs font-bold text-on-surface-variant text-center">{i + 1}</span>
                      <StationSelect
                        ariaLabel={`محطة التوقف ${i + 1}`}
                        stations={stationOptions}
                        value={r.stationId}
                        onChange={(id) => setRow(r.key, { stationId: id })}
                        exclude={[originId, destinationId, ...rows.filter((x) => x.key !== r.key).map((x) => x.stationId)]}
                        className="h-9"
                      />
                      <input
                        aria-label="الوصول بعد (دقيقة)"
                        title="الوصول بعد (دقيقة)"
                        type="number"
                        min={1}
                        value={r.offsetMinutes}
                        onChange={(e) => setRow(r.key, { offsetMinutes: e.target.value === '' ? '' : Math.trunc(Number(e.target.value)) })}
                        className={numClass}
                        placeholder="وصول"
                      />
                      <input
                        aria-label="مدة التوقف (دقيقة)"
                        title="مدة التوقف (دقيقة)"
                        type="number"
                        min={0}
                        max={240}
                        value={r.dwellMinutes}
                        onChange={(e) => setRow(r.key, { dwellMinutes: e.target.value === '' ? '' : Math.trunc(Number(e.target.value)) })}
                        className={numClass}
                        placeholder="توقف"
                      />
                      <div className="flex gap-1">
                        <IconButton type="button" size="sm" variant="ghost" icon="arrow_upward" label="تحريك لأعلى" disabled={i === 0} onClick={() => move(i, -1)} />
                        <IconButton type="button" size="sm" variant="ghost" icon="arrow_downward" label="تحريك لأسفل" disabled={i === rows.length - 1} onClick={() => move(i, 1)} />
                        <IconButton type="button" size="sm" variant="ghost" icon="delete" label="حذف" onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))} />
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px] mt-1 pr-10">
                      <span className="text-on-surface-variant">
                        {r.offsetMinutes !== '' && `وصول بعد ${formatDuration(r.offsetMinutes)} · مغادرة بعد ${formatDuration(r.offsetMinutes + (r.dwellMinutes || 0))}`}
                      </span>
                      {stopErrors[i] && <span className="text-error font-medium">{stopErrors[i]}</span>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {mutation.isError && <p className="text-xs text-error">{errorMessage(mutation.error)}</p>}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={!valid} isLoading={mutation.isPending}>{editing ? 'حفظ التعديلات' : 'إضافة المسار'}</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
