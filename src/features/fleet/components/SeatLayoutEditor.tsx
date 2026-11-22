import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { cn } from '../../../lib/utils';
import { Select } from '../../geo/components/common';
import {
  buildNumberedLayout,
  isNumberedShape,
  LAYOUT_LIMITS,
  layoutErrors,
  layoutStats,
  relabelSeat,
  renumber,
  resizeLayout,
  seatAt,
  toggleSeat,
  toggleWomenOnly,
  type DriverSide,
  type SeatLayout,
} from '../seatLayout';
import { SeatGrid, SeatLegend } from './SeatGrid';

type Tool = 'women' | 'seats' | 'label';

const TOOLS: Array<{ id: Tool; label: string; icon: string; hint: string }> = [
  { id: 'women', label: 'للنساء فقط', icon: 'woman', hint: 'انقر مقعدًا لتبديل تخصيصه للنساء.' },
  { id: 'seats', label: 'إزالة/إضافة مقعد', icon: 'event_seat', hint: 'انقر مقعدًا لإزالته (مثل مكان الباب) أو خانة فارغة لإعادته.' },
  { id: 'label', label: 'تسمية المقعد', icon: 'edit', hint: 'انقر مقعدًا ثم اكتب تسميته (حتى 8 أحرف).' },
];

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/**
 * Visual seat-layout editor. Starts from the numbered shortcut (rows × columns), then lets the admin
 * flag women-only seats, remove seats or relabel them. The parent submits `toLayoutInput(value)`.
 */
export const SeatLayoutEditor: React.FC<{ value: SeatLayout; onChange: (next: SeatLayout) => void }> = ({ value, onChange }) => {
  const [tool, setTool] = React.useState<Tool>('women');
  const [autoNumber, setAutoNumber] = React.useState(true);
  const [selected, setSelected] = React.useState<{ row: number; column: number } | null>(null);

  const stats = layoutStats(value);
  const errors = layoutErrors(value);
  const numbered = isNumberedShape(value);
  const selectedSeat = selected ? seatAt(value, selected.row, selected.column) : undefined;

  const onCellClick = (row: number, column: number) => {
    if (tool === 'women') {
      if (seatAt(value, row, column)) onChange(toggleWomenOnly(value, row, column));
    } else if (tool === 'seats') {
      onChange(toggleSeat(value, row, column, autoNumber));
    } else if (seatAt(value, row, column)) {
      setSelected({ row, column });
    }
  };

  const resize = (next: { rows?: number; columns?: number }) => {
    const columns = next.columns ?? value.columns;
    onChange(
      resizeLayout(
        value,
        {
          rows: next.rows ?? value.rows,
          columns,
          // A new width puts the aisle back in the middle.
          aisleAfterColumn: next.columns !== undefined ? Math.floor(columns / 2) : value.aisleAfterColumn,
        },
        autoNumber,
      ),
    );
    setSelected(null);
  };

  const reset = () => {
    onChange(buildNumberedLayout({ rows: value.rows, columns: value.columns }));
    setAutoNumber(true);
    setSelected(null);
  };

  return (
    <div className="grid gap-space-md lg:grid-cols-[minmax(0,18rem)_1fr]">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Select label="عدد الصفوف" value={value.rows} onChange={(e) => resize({ rows: Number(e.target.value) })}>
            {range(LAYOUT_LIMITS.minRows, LAYOUT_LIMITS.maxRows).map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
          <Select label="مقاعد في الصف" value={value.columns} onChange={(e) => resize({ columns: Number(e.target.value) })}>
            {range(LAYOUT_LIMITS.minColumns, LAYOUT_LIMITS.maxColumns).map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
          <Select label="الممر بعد العمود" value={value.aisleAfterColumn} onChange={(e) => onChange({ ...value, aisleAfterColumn: Number(e.target.value) })}>
            {range(0, value.columns).map((n) => (
              <option key={n} value={n}>{n === 0 || n === value.columns ? `${n} (بلا ممر)` : n}</option>
            ))}
          </Select>
          <Select label="جهة السائق" value={value.driverSide} onChange={(e) => onChange({ ...value, driverSide: e.target.value as DriverSide })}>
            <option value="LEFT">يسار</option>
            <option value="RIGHT">يمين</option>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold">أداة النقر</span>
          <div className="flex flex-col gap-1">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTool(t.id);
                  setSelected(null);
                }}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-right',
                  tool === t.id ? 'border-secondary bg-secondary/10 text-secondary font-semibold' : 'border-outline-variant/50 hover:bg-surface-container',
                )}
              >
                <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-on-surface-variant">{TOOLS.find((t) => t.id === tool)?.hint}</p>
        </div>

        {tool === 'label' && selectedSeat && selected && (
          <Input
            label={`تسمية المقعد (صف ${selected.row}، عمود ${selected.column})`}
            dir="ltr"
            value={selectedSeat.label}
            maxLength={LAYOUT_LIMITS.maxLabel}
            autoFocus
            onChange={(e) => {
              setAutoNumber(false);
              onChange(relabelSeat(value, selected.row, selected.column, e.target.value));
            }}
          />
        )}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoNumber}
            onChange={(e) => {
              setAutoNumber(e.target.checked);
              if (e.target.checked) onChange(renumber(value));
            }}
          />
          ترقيم تلقائي (1، 2، 3... من الأمام إلى الخلف)
        </label>
        <Button type="button" variant="outline" size="sm" icon="restart_alt" onClick={reset}>إعادة إلى التخطيط المرقّم</Button>
      </div>

      <div className="flex flex-col gap-3 items-start">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-lg bg-surface-container px-3 py-1.5">
            السعة: <strong className="tabular-nums">{stats.capacity}</strong> مقعدًا
          </span>
          <span className="rounded-lg bg-[#FCE7F3] text-[#9D174D] px-3 py-1.5">
            للنساء: <strong className="tabular-nums">{stats.womenOnly}</strong>
          </span>
          <span className="text-xs text-on-surface-variant">
            {numbered ? 'سيُرسل كتخطيط مرقّم قياسي.' : 'سيُرسل كتخطيط مخصص كامل.'}
          </span>
        </div>
        <SeatLegend />
        <div className="max-w-full overflow-x-auto">
          <SeatGrid layout={value} onCellClick={onCellClick} selected={tool === 'label' ? selected : null} showEmpty />
        </div>
        {errors.length > 0 && (
          <ul className="text-xs text-error list-disc pr-4">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
};
