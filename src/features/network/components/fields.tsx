import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { formatDateTime } from '../../../lib/dates';
import type { BusyTrip, StationOption } from '../api';

export const selectClass = 'h-10 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 text-sm disabled:opacity-60';

export const Field: React.FC<{ label: string; error?: string | null; hint?: string; className?: string; children: React.ReactNode }> = ({ label, error, hint, className, children }) => (
  <label className={cn('flex flex-col gap-1 text-xs font-semibold text-on-surface', className)}>
    {label}
    {children}
    {error ? <span className="text-xs text-error font-medium">{error}</span> : hint ? <span className="text-xs font-normal text-on-surface-variant">{hint}</span> : null}
  </label>
);

/** Station picker grouped by city (optgroup per city, sorted by Arabic name). */
export const StationSelect: React.FC<{
  stations: StationOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  exclude?: string[];
  className?: string;
  ariaLabel?: string;
}> = ({ stations, value, onChange, placeholder = 'اختر المحطة', disabled, exclude = [], className, ariaLabel }) => {
  const groups = React.useMemo(() => {
    const byCity = new Map<string, { city: string; items: StationOption[] }>();
    for (const s of stations) {
      const g = byCity.get(s.city.id) ?? { city: s.city.nameAr, items: [] };
      g.items.push(s);
      byCity.set(s.city.id, g);
    }
    return [...byCity.values()]
      .sort((a, b) => a.city.localeCompare(b.city, 'ar'))
      .map((g) => ({ ...g, items: g.items.sort((a, b) => a.nameAr.localeCompare(b.nameAr, 'ar')) }));
  }, [stations]);
  return (
    <select aria-label={ariaLabel} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={cn(selectClass, 'font-normal', className)}>
      <option value="">{placeholder}</option>
      {groups.map((g) => (
        <optgroup key={g.city} label={g.city}>
          {g.items.map((s) => (
            <option key={s.id} value={s.id} disabled={exclude.includes(s.id) && s.id !== value}>
              {s.nameAr}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};

/** Hours + minutes → total minutes. */
export const DurationInput: React.FC<{ minutes: number; onChange: (minutes: number) => void }> = ({ minutes, onChange }) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const num = 'h-10 w-20 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-2 text-sm font-normal tabular-nums';
  return (
    <div className="flex items-center gap-2">
      <input type="number" min={0} max={168} aria-label="ساعات" value={h} onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0) * 60 + m)} className={num} />
      <span className="text-xs text-on-surface-variant font-normal">ساعة</span>
      <input type="number" min={0} max={59} aria-label="دقائق" value={m} onChange={(e) => onChange(h * 60 + Math.min(59, Math.max(0, Number(e.target.value) || 0)))} className={num} />
      <span className="text-xs text-on-surface-variant font-normal">دقيقة</span>
    </div>
  );
};

/** Conflicting trips from VEHICLE_BUSY / DRIVER_BUSY details. */
export const BusyTripsList: React.FC<{ trips: BusyTrip[] }> = ({ trips }) =>
  trips.length === 0 ? null : (
    <ul className="mt-1 space-y-0.5 text-xs">
      {trips.map((t) => (
        <li key={t.id}>
          <Link to={`/network/trips/${t.id}`} target="_blank" className="font-mono text-secondary" dir="ltr">
            {t.tripNumber ?? t.id.slice(-8).toUpperCase()}
          </Link>{' '}
          — من {formatDateTime(t.departureAt)} حتى {formatDateTime(t.arrivalAt)}
        </li>
      ))}
    </ul>
  );
