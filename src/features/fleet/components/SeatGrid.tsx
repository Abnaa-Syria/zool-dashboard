import * as React from 'react';
import { cn } from '../../../lib/utils';
import { buildGridRows, type SeatLayout } from '../seatLayout';

/**
 * Bus seat map. Drawn left-to-right as seen from inside facing forward (column 1 on the left),
 * front of the bus at the top, regardless of the page's RTL direction.
 */
export const SeatGrid: React.FC<{
  layout: SeatLayout;
  /** Interactive when set: called for seats and empty cells. */
  onCellClick?: (row: number, column: number) => void;
  selected?: { row: number; column: number } | null;
  /** Show empty (removed) cells as clickable placeholders. */
  showEmpty?: boolean;
}> = ({ layout, onCellClick, selected, showEmpty }) => {
  const rows = buildGridRows(layout);
  const interactive = Boolean(onCellClick);
  const driverRight = layout.driverSide === 'RIGHT';

  return (
    <div dir="ltr" className="inline-flex flex-col gap-1.5 rounded-2xl border-2 border-outline-variant/60 bg-surface-container/40 p-3">
      <div className={cn('flex items-center gap-2 pb-2 mb-1 border-b border-dashed border-outline-variant/60', driverRight ? 'justify-end' : 'justify-start')}>
        <div className="flex items-center gap-1 rounded-lg bg-surface-container-high px-2 py-1 text-[11px] text-on-surface-variant" title="جهة السائق">
          <span className="material-symbols-outlined text-[18px]">search_hands_free</span>
          <span dir="rtl">السائق</span>
        </div>
      </div>
      {rows.map((cells, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {cells.map((cell, j) => {
            if (cell.kind === 'aisle') return <div key={`a${j}`} className="w-6" aria-hidden />;
            const isSelected = selected?.row === cell.row && selected.column === cell.column;
            if (cell.kind === 'empty') {
              if (!showEmpty) return <div key={`e${j}`} className="w-10 h-10" aria-hidden />;
              return (
                <button
                  key={`e${j}`}
                  type="button"
                  disabled={!interactive}
                  onClick={() => onCellClick?.(cell.row, cell.column)}
                  title={`خانة فارغة — صف ${cell.row}، عمود ${cell.column}`}
                  className="w-10 h-10 rounded-lg border border-dashed border-outline-variant/70 text-outline hover:bg-surface-container text-xs"
                >
                  +
                </button>
              );
            }
            const { seat } = cell;
            const Comp = interactive ? 'button' : 'div';
            return (
              <Comp
                key={`s${j}`}
                {...(interactive ? { type: 'button' as const, onClick: () => onCellClick?.(cell.row, cell.column) } : {})}
                title={`مقعد ${seat.label}${seat.isWomenOnly ? ' — للنساء فقط' : ''}`}
                className={cn(
                  'relative w-10 h-10 rounded-lg border text-xs font-semibold flex items-center justify-center tabular-nums select-none',
                  seat.isWomenOnly
                    ? 'bg-[#FCE7F3] border-[#F9A8D4] text-[#9D174D]'
                    : 'bg-surface-container-lowest border-outline-variant text-on-surface',
                  interactive && 'hover:ring-2 hover:ring-secondary/40 cursor-pointer',
                  isSelected && 'ring-2 ring-secondary',
                )}
              >
                {seat.label}
                {seat.isWomenOnly && <span className="material-symbols-outlined absolute -top-1.5 -right-1.5 text-[14px] text-[#BE185D]">woman</span>}
              </Comp>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const SeatLegend: React.FC = () => (
  <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
    <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border border-outline-variant bg-surface-container-lowest" /> مقعد عادي</span>
    <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border border-[#F9A8D4] bg-[#FCE7F3]" /> للنساء فقط</span>
  </div>
);
