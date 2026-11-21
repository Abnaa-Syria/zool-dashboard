import * as React from 'react';
import type { OfficeRef } from '../api';
import { selectClass } from '../listState';

/** Office filter/picker fed by `useOfficeLookup` (renders nothing until loaded or without permission). */
export const OfficeSelect: React.FC<{ offices: OfficeRef[] | undefined; value: string; onChange: (id: string) => void; allLabel?: string }> = ({
  offices,
  value,
  onChange,
  allLabel = 'كل المكاتب',
}) => {
  if (!offices) return null;
  return (
    <select aria-label="المكتب" value={value} onChange={(e) => onChange(e.target.value)} className={`${selectClass} max-w-64`}>
      <option value="">{allLabel}</option>
      {offices.map((o) => (
        <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
      ))}
    </select>
  );
};
