import * as React from 'react';
import { cn } from '../../../lib/utils';
import type { SeatStatus, TripSeat } from '../api';

const STATUS_STYLE: Record<SeatStatus, string> = {
  FREE: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
  HELD: 'bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]',
  SOLD: 'bg-secondary text-on-secondary border-secondary',
};

const SEAT_STATUS_LABEL: Record<SeatStatus, string> = { FREE: 'متاح', HELD: 'محجوز مؤقتًا', SOLD: 'مباع' };

/**
 * Seat grid from TripSeat.layoutRow/layoutColumn (row 1 = front). The aisle is drawn after
 * `aisleAfterColumn` when known (vehicle layout); otherwise after the middle column.
 */
export const SeatMap: React.FC<{ seats: TripSeat[]; aisleAfterColumn?: number }> = ({ seats, aisleAfterColumn }) => {
  const placed = seats.filter((s) => s.layoutRow !== null && s.layoutColumn !== null);
  const unplaced = seats.filter((s) => s.layoutRow === null || s.layoutColumn === null);
  const rows = Math.max(0, ...placed.map((s) => s.layoutRow!));
  const cols = Math.max(0, ...placed.map((s) => s.layoutColumn!));
  const aisle = aisleAfterColumn ?? Math.floor(cols / 2);
  const byCell = new Map(placed.map((s) => [`${s.layoutRow}:${s.layoutColumn}`, s]));

  const seatBox = (s: TripSeat) => (
    <div
      key={s.seatLabel}
      title={`مقعد ${s.seatLabel} — ${SEAT_STATUS_LABEL[s.status]}${s.isWomenOnly ? ' — للنساء فقط' : ''}`}
      className={cn(
        'relative h-10 w-10 rounded-lg border-2 flex items-center justify-center text-xs font-bold tabular-nums',
        STATUS_STYLE[s.status],
        s.isWomenOnly && 'ring-2 ring-[#EC4899] ring-offset-1',
      )}
    >
      {s.seatLabel}
      {s.isWomenOnly && <span className="material-symbols-outlined absolute -top-2 -left-2 text-[14px] text-[#EC4899] bg-surface-container-lowest rounded-full">woman</span>}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 text-xs">
        {(Object.keys(STATUS_STYLE) as SeatStatus[]).map((st) => (
          <span key={st} className="flex items-center gap-1">
            <span className={cn('h-3 w-3 rounded border-2', STATUS_STYLE[st])} /> {SEAT_STATUS_LABEL[st]}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded ring-2 ring-[#EC4899]" /> للنساء فقط
        </span>
      </div>
      {rows > 0 && (
        <div className="inline-block rounded-2xl border border-outline-variant/50 p-3 bg-surface-container/30" dir="ltr">
          <div className="text-[10px] text-on-surface-variant text-center mb-2" dir="rtl">مقدمة الحافلة</div>
          <div className="space-y-1.5">
            {Array.from({ length: rows }, (_, r) => (
              <div key={r} className="flex gap-1.5">
                {Array.from({ length: cols }, (_, c) => {
                  const seat = byCell.get(`${r + 1}:${c + 1}`);
                  return (
                    <React.Fragment key={c}>
                      {seat ? seatBox(seat) : <div className="h-10 w-10" />}
                      {c + 1 === aisle && c + 1 < cols && <div className="w-5" />}
                    </React.Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
      {unplaced.length > 0 && (
        <div>
          <p className="text-xs text-on-surface-variant mb-1">مقاعد بدون موضع في المخطط:</p>
          <div className="flex flex-wrap gap-1.5">{unplaced.map(seatBox)}</div>
        </div>
      )}
    </div>
  );
};
