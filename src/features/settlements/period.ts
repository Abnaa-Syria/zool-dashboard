import { sudanDate } from '../../lib/dates';

/** Sudan is UTC+2 year-round (no DST since 2017). */
const SUDAN_OFFSET = '+02:00';

/** Inclusive Sudan days → the backend's half-open instant range [from 00:00, day-after-`to` 00:00). */
export function sudanDaysToPeriod(from: string, to: string): { periodFrom: string; periodTo: string } {
  const next = new Date(`${to}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return { periodFrom: `${from}T00:00:00${SUDAN_OFFSET}`, periodTo: `${next.toISOString().slice(0, 10)}T00:00:00${SUDAN_OFFSET}` };
}

/** Half-open [periodFrom, periodTo) → "2026-11-01 ← 2026-11-07" in inclusive Sudan days. */
export function formatPeriod(periodFrom: string, periodTo: string): string {
  const from = sudanDate(new Date(periodFrom));
  const to = sudanDate(new Date(new Date(periodTo).getTime() - 1));
  return from === to ? from : `${from} — ${to}`;
}
