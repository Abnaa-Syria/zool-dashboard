import * as React from 'react';
import type { CarrierListItem } from '../../carriers/api';
import { selectClass } from '../../financials/listState';

/** Carrier filter/picker fed by GET /carriers (first 100). */
export const CarrierSelect: React.FC<{ carriers: CarrierListItem[] | undefined; value: string; onChange: (id: string) => void; allLabel?: string }> = ({
  carriers,
  value,
  onChange,
  allLabel = 'كل الشركات',
}) => (
  <select aria-label="شركة النقل" value={value} onChange={(e) => onChange(e.target.value)} className={`${selectClass} max-w-64`}>
    <option value="">{allLabel}</option>
    {(carriers ?? []).map((c) => (
      <option key={c.id} value={c.id}>{c.name}</option>
    ))}
    {/* Keep a selected id visible even if it is outside the loaded page. */}
    {value && carriers && !carriers.some((c) => c.id === value) && <option value={value}>{value}</option>}
  </select>
);
