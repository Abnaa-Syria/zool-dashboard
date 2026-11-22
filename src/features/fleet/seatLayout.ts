/**
 * Client-side seat-layout model mirroring backend `src/shared/utils/seat-layout.ts`.
 * Pure functions only (unit-tested) — the editor component just renders and dispatches these.
 */

export type DriverSide = 'LEFT' | 'RIGHT';

export type Seat = { label: string; row: number; column: number; isWomenOnly: boolean };

export type SeatLayout = {
  rows: number;
  columns: number;
  /** Aisle is drawn after this column (0 = no aisle). */
  aisleAfterColumn: number;
  driverSide: DriverSide;
  seats: Seat[];
};

/** Body for POST/PATCH /admin/vehicles `layout`. */
export type LayoutInput =
  | { numbered: { rows: number; columns?: number; womenOnlyLabels?: string[] } }
  | { seatLayout: SeatLayout };

export const LAYOUT_LIMITS = { minRows: 1, maxRows: 30, minColumns: 2, maxColumns: 6, maxLabel: 8 } as const;

const cellKey = (row: number, column: number) => `${row}:${column}`;

const byPosition = (a: Seat, b: Seat) => a.row - b.row || a.column - b.column;

/** Same result as the backend `buildNumberedLayout`: labels "1".."N" left-to-right, front-to-back. */
export function buildNumberedLayout(input: {
  rows: number;
  columns?: number;
  aisleAfterColumn?: number;
  driverSide?: DriverSide;
  womenOnlyLabels?: Iterable<string>;
}): SeatLayout {
  const columns = input.columns ?? 4;
  const womenOnly = new Set(input.womenOnlyLabels ?? []);
  const seats: Seat[] = [];
  let n = 1;
  for (let row = 1; row <= input.rows; row += 1) {
    for (let column = 1; column <= columns; column += 1) {
      const label = String(n);
      seats.push({ label, row, column, isWomenOnly: womenOnly.has(label) });
      n += 1;
    }
  }
  return {
    rows: input.rows,
    columns,
    aisleAfterColumn: input.aisleAfterColumn ?? Math.floor(columns / 2),
    driverSide: input.driverSide ?? 'LEFT',
    seats,
  };
}

export function seatAt(layout: SeatLayout, row: number, column: number): Seat | undefined {
  return layout.seats.find((s) => s.row === row && s.column === column);
}

/**
 * Change the grid size/shape. Seats inside the new grid keep their flags; missing cells are filled
 * (rows/columns grew). When `autoNumber` is on, labels are re-assigned in reading order.
 */
export function resizeLayout(
  layout: SeatLayout,
  next: { rows: number; columns: number; aisleAfterColumn?: number },
  autoNumber: boolean,
): SeatLayout {
  const existing = new Map(layout.seats.map((s) => [cellKey(s.row, s.column), s]));
  const seats: Seat[] = [];
  for (let row = 1; row <= next.rows; row += 1) {
    for (let column = 1; column <= next.columns; column += 1) {
      const prev = existing.get(cellKey(row, column));
      const insideOld = row <= layout.rows && column <= layout.columns;
      // A cell that was deliberately emptied inside the old grid stays empty.
      if (prev) seats.push({ ...prev });
      else if (!insideOld) seats.push({ label: '', row, column, isWomenOnly: false });
    }
  }
  const aisle = Math.min(next.aisleAfterColumn ?? layout.aisleAfterColumn, next.columns);
  const out: SeatLayout = { ...layout, rows: next.rows, columns: next.columns, aisleAfterColumn: aisle, seats };
  return autoNumber ? renumber(out) : fillMissingLabels(out);
}

/** Labels "1".."N" in reading order (front-to-back, column 1 first); flags stay with the seat. */
export function renumber(layout: SeatLayout): SeatLayout {
  const seats = [...layout.seats].sort(byPosition).map((s, i) => ({ ...s, label: String(i + 1) }));
  return { ...layout, seats };
}

/** Give unlabelled seats the next free numeric labels (manual-label mode). */
function fillMissingLabels(layout: SeatLayout): SeatLayout {
  const used = new Set(layout.seats.map((s) => s.label).filter(Boolean));
  let n = 1;
  const seats = [...layout.seats].sort(byPosition).map((s) => {
    if (s.label) return s;
    while (used.has(String(n))) n += 1;
    const label = String(n);
    used.add(label);
    return { ...s, label };
  });
  return { ...layout, seats };
}

export function toggleWomenOnly(layout: SeatLayout, row: number, column: number): SeatLayout {
  return {
    ...layout,
    seats: layout.seats.map((s) => (s.row === row && s.column === column ? { ...s, isWomenOnly: !s.isWomenOnly } : s)),
  };
}

/** Remove the seat at a cell, or put one back on an empty cell. */
export function toggleSeat(layout: SeatLayout, row: number, column: number, autoNumber: boolean): SeatLayout {
  const present = seatAt(layout, row, column);
  const seats = present
    ? layout.seats.filter((s) => s !== present)
    : [...layout.seats, { label: '', row, column, isWomenOnly: false }].sort(byPosition);
  const out = { ...layout, seats };
  return autoNumber ? renumber(out) : fillMissingLabels(out);
}

export function relabelSeat(layout: SeatLayout, row: number, column: number, label: string): SeatLayout {
  return {
    ...layout,
    seats: layout.seats.map((s) => (s.row === row && s.column === column ? { ...s, label } : s)),
  };
}

/** Problems that the backend schema would reject (empty list = valid). */
export function layoutErrors(layout: SeatLayout): string[] {
  const errors: string[] = [];
  if (layout.seats.length === 0) errors.push('يجب أن تحتوي الحافلة على مقعد واحد على الأقل.');
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const s of layout.seats) {
    const label = s.label.trim();
    if (!label) errors.push(`المقعد في الصف ${s.row} العمود ${s.column} بلا تسمية.`);
    else if (label.length > LAYOUT_LIMITS.maxLabel) errors.push(`تسمية المقعد "${label}" أطول من ${LAYOUT_LIMITS.maxLabel} أحرف.`);
    if (seen.has(label)) dup.add(label);
    seen.add(label);
  }
  if (dup.size > 0) errors.push(`تسميات مكررة: ${[...dup].join('، ')}`);
  return errors;
}

/** True when the layout is exactly what the `numbered` shortcut would produce. */
export function isNumberedShape(layout: SeatLayout): boolean {
  if (layout.columns < LAYOUT_LIMITS.minColumns) return false;
  if (layout.driverSide !== 'LEFT' || layout.aisleAfterColumn !== Math.floor(layout.columns / 2)) return false;
  if (layout.seats.length !== layout.rows * layout.columns) return false;
  const reference = buildNumberedLayout({ rows: layout.rows, columns: layout.columns });
  const labels = new Map(layout.seats.map((s) => [cellKey(s.row, s.column), s.label]));
  return reference.seats.every((s) => labels.get(cellKey(s.row, s.column)) === s.label);
}

/** Smallest request body: the `numbered` shortcut when possible, otherwise the full `seatLayout`. */
export function toLayoutInput(layout: SeatLayout): LayoutInput {
  const seats = [...layout.seats].sort(byPosition).map((s) => ({ ...s, label: s.label.trim() }));
  if (isNumberedShape(layout)) {
    const womenOnlyLabels = seats.filter((s) => s.isWomenOnly).map((s) => s.label);
    return {
      numbered: { rows: layout.rows, columns: layout.columns, ...(womenOnlyLabels.length ? { womenOnlyLabels } : {}) },
    };
  }
  return { seatLayout: { ...layout, seats } };
}

/** Order-insensitive equality (decides whether an edit actually changed the layout). */
export function sameLayout(a: SeatLayout, b: SeatLayout): boolean {
  if (a.rows !== b.rows || a.columns !== b.columns || a.aisleAfterColumn !== b.aisleAfterColumn || a.driverSide !== b.driverSide) {
    return false;
  }
  if (a.seats.length !== b.seats.length) return false;
  const bySeat = new Map(b.seats.map((s) => [cellKey(s.row, s.column), s]));
  return a.seats.every((s) => {
    const o = bySeat.get(cellKey(s.row, s.column));
    return o !== undefined && o.label === s.label && o.isWomenOnly === s.isWomenOnly;
  });
}

export type GridCell =
  | { kind: 'seat'; row: number; column: number; seat: Seat }
  | { kind: 'empty'; row: number; column: number }
  | { kind: 'aisle'; row: number };

/** Rows of cells to render left-to-right (column 1 on the left), with the aisle gap inserted. */
export function buildGridRows(layout: SeatLayout): GridCell[][] {
  const index = new Map(layout.seats.map((s) => [cellKey(s.row, s.column), s]));
  const rows: GridCell[][] = [];
  for (let row = 1; row <= layout.rows; row += 1) {
    const cells: GridCell[] = [];
    for (let column = 1; column <= layout.columns; column += 1) {
      const seat = index.get(cellKey(row, column));
      cells.push(seat ? { kind: 'seat', row, column, seat } : { kind: 'empty', row, column });
      if (column === layout.aisleAfterColumn && column < layout.columns) cells.push({ kind: 'aisle', row });
    }
    rows.push(cells);
  }
  return rows;
}

export function layoutStats(layout: SeatLayout): { capacity: number; womenOnly: number } {
  return { capacity: layout.seats.length, womenOnly: layout.seats.filter((s) => s.isWomenOnly).length };
}
