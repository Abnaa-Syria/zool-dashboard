import { describe, expect, it } from 'vitest';
import {
  buildGridRows,
  buildNumberedLayout,
  isNumberedShape,
  layoutErrors,
  layoutStats,
  relabelSeat,
  renumber,
  resizeLayout,
  sameLayout,
  toggleSeat,
  toggleWomenOnly,
  toLayoutInput,
} from './seatLayout';

describe('buildNumberedLayout', () => {
  it('numbers seats front-to-back, left-to-right with the aisle in the middle', () => {
    const l = buildNumberedLayout({ rows: 2, columns: 4, womenOnlyLabels: ['3'] });
    expect(l.aisleAfterColumn).toBe(2);
    expect(l.driverSide).toBe('LEFT');
    expect(l.seats.map((s) => s.label)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
    expect(l.seats.find((s) => s.label === '3')).toMatchObject({ row: 1, column: 3, isWomenOnly: true });
  });

  it('defaults to 4 columns and floors the aisle for odd widths', () => {
    expect(buildNumberedLayout({ rows: 1 }).columns).toBe(4);
    expect(buildNumberedLayout({ rows: 1, columns: 5 }).aisleAfterColumn).toBe(2);
  });
});

describe('buildGridRows', () => {
  it('inserts the aisle after the configured column and marks removed seats as empty', () => {
    const l = toggleSeat(buildNumberedLayout({ rows: 1, columns: 4 }), 1, 2, false);
    const [row] = buildGridRows(l);
    expect(row.map((c) => c.kind)).toEqual(['seat', 'empty', 'aisle', 'seat', 'seat']);
  });

  it('omits the aisle when it is at the edge', () => {
    const l = { ...buildNumberedLayout({ rows: 1, columns: 3 }), aisleAfterColumn: 3 };
    expect(buildGridRows(l)[0].some((c) => c.kind === 'aisle')).toBe(false);
  });
});

describe('editing', () => {
  it('toggles women-only by position', () => {
    const l = toggleWomenOnly(buildNumberedLayout({ rows: 2, columns: 2 }), 2, 1);
    expect(l.seats.filter((s) => s.isWomenOnly).map((s) => s.label)).toEqual(['3']);
    expect(layoutStats(l)).toEqual({ capacity: 4, womenOnly: 1 });
  });

  it('removing a seat renumbers in auto mode and keeps flags with seats', () => {
    let l = buildNumberedLayout({ rows: 2, columns: 2 });
    l = toggleWomenOnly(l, 2, 2); // seat "4"
    l = toggleSeat(l, 1, 1, true);
    expect(l.seats.map((s) => s.label)).toEqual(['1', '2', '3']);
    expect(l.seats.find((s) => s.row === 2 && s.column === 2)).toMatchObject({ label: '3', isWomenOnly: true });
  });

  it('adding a seat back in manual mode picks the next free label', () => {
    let l = buildNumberedLayout({ rows: 1, columns: 3 });
    l = toggleSeat(l, 1, 2, false);
    expect(l.seats.map((s) => s.label)).toEqual(['1', '3']);
    l = toggleSeat(l, 1, 2, false);
    expect(l.seats.find((s) => s.column === 2)?.label).toBe('2');
  });

  it('resizing keeps flags, drops seats outside the grid, and keeps removed cells empty', () => {
    let l = buildNumberedLayout({ rows: 2, columns: 4 });
    l = toggleWomenOnly(l, 1, 1);
    l = toggleSeat(l, 2, 4, true);
    l = resizeLayout(l, { rows: 3, columns: 4 }, true);
    expect(l.seats).toHaveLength(11);
    expect(l.seats.find((s) => s.row === 2 && s.column === 4)).toBeUndefined();
    expect(l.seats[0].isWomenOnly).toBe(true);
    l = resizeLayout(l, { rows: 1, columns: 2 }, true);
    expect(l.seats.map((s) => s.label)).toEqual(['1', '2']);
    expect(l.aisleAfterColumn).toBe(2);
  });

  it('renumber follows reading order', () => {
    const l = relabelSeat(buildNumberedLayout({ rows: 1, columns: 2 }), 1, 1, 'A1');
    expect(renumber(l).seats.map((s) => s.label)).toEqual(['1', '2']);
  });
});

describe('validation and submission', () => {
  it('reports duplicate, empty and too-long labels', () => {
    let l = buildNumberedLayout({ rows: 1, columns: 3 });
    l = relabelSeat(l, 1, 2, '1');
    l = relabelSeat(l, 1, 3, '');
    expect(layoutErrors(l).length).toBe(2);
    expect(layoutErrors(relabelSeat(l, 1, 3, 'TOOLONGLABEL')).some((e) => e.includes('أطول'))).toBe(true);
    expect(layoutErrors(buildNumberedLayout({ rows: 1, columns: 2 }))).toEqual([]);
  });

  it('submits the numbered shortcut with women-only labels when the shape is standard', () => {
    const l = toggleWomenOnly(buildNumberedLayout({ rows: 7, columns: 4 }), 3, 3);
    expect(isNumberedShape(l)).toBe(true);
    expect(toLayoutInput(l)).toEqual({ numbered: { rows: 7, columns: 4, womenOnlyLabels: ['11'] } });
    expect(toLayoutInput(buildNumberedLayout({ rows: 2, columns: 3 }))).toEqual({ numbered: { rows: 2, columns: 3 } });
  });

  it('falls back to a full seatLayout for removed seats, custom labels, aisle or driver side changes', () => {
    const base = buildNumberedLayout({ rows: 2, columns: 4 });
    expect('seatLayout' in toLayoutInput(toggleSeat(base, 1, 1, true))).toBe(true);
    expect('seatLayout' in toLayoutInput(relabelSeat(base, 1, 1, 'A'))).toBe(true);
    expect('seatLayout' in toLayoutInput({ ...base, aisleAfterColumn: 1 })).toBe(true);
    expect('seatLayout' in toLayoutInput({ ...base, driverSide: 'RIGHT' })).toBe(true);
  });

  it('compares layouts regardless of seat order', () => {
    const a = buildNumberedLayout({ rows: 2, columns: 2 });
    const b = { ...a, seats: [...a.seats].reverse() };
    expect(sameLayout(a, b)).toBe(true);
    expect(sameLayout(a, toggleWomenOnly(a, 1, 1))).toBe(false);
  });
});
