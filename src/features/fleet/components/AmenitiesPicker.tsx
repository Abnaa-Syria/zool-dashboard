import * as React from 'react';
import { Skeleton } from '../../../components/ui/Skeleton';
import { errorMessage } from '../../../lib/api/errors';
import { cn } from '../../../lib/utils';
import { useAmenities } from '../../geo/api';
import type { AmenityInput } from '../api';

/** Pick amenities from GET /admin/amenities, each with an optional short value (e.g. "20 كغ"). */
export const AmenitiesPicker: React.FC<{ value: AmenityInput[]; onChange: (next: AmenityInput[]) => void }> = ({ value, onChange }) => {
  const catalog = useAmenities();
  if (catalog.isLoading) return <Skeleton className="h-24 rounded-lg" />;
  if (catalog.isError) return <p className="text-xs text-error">{errorMessage(catalog.error)}</p>;
  const items = catalog.data ?? [];
  if (items.length === 0) return <p className="text-xs text-on-surface-variant">لا توجد مزايا في الكتالوج. أضفها من صفحة مزايا الحافلات.</p>;

  const byCode = new Map(value.map((a) => [a.code, a]));
  const toggle = (code: string) =>
    onChange(byCode.has(code) ? value.filter((a) => a.code !== code) : [...value, { code }]);
  const setValue = (code: string, v: string) => onChange(value.map((a) => (a.code === code ? { code, ...(v ? { value: v } : {}) } : a)));

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((a) => {
        const picked = byCode.get(a.code);
        return (
          <div
            key={a.id}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2',
              picked ? 'border-secondary bg-secondary/5' : 'border-outline-variant/50',
            )}
          >
            <label className="flex items-center gap-2 text-sm flex-1 cursor-pointer min-w-0">
              <input type="checkbox" checked={Boolean(picked)} onChange={() => toggle(a.code)} />
              <span className="material-symbols-outlined text-[18px] text-secondary">{a.icon}</span>
              <span className="truncate">{a.nameAr}</span>
            </label>
            {picked && (
              <input
                aria-label={`قيمة ${a.nameAr}`}
                value={picked.value ?? ''}
                maxLength={32}
                onChange={(e) => setValue(a.code, e.target.value)}
                placeholder="قيمة اختيارية"
                className="h-8 w-28 rounded-md border border-outline-variant/60 bg-surface-container-lowest px-2 text-xs"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
