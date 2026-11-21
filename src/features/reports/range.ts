import { lastDays, sudanDate } from '../../lib/dates';

/** Backend limit for /admin/reports/* (insights.service MAX_RANGE_DAYS); inclusive Sudan days. */
export const MAX_RANGE_DAYS = 92;

export type DateRange = { from: string; to: string };

export const RANGE_PRESETS = [
  { key: 'today', label: 'اليوم' },
  { key: '7days', label: 'آخر 7 أيام' },
  { key: '30days', label: 'آخر 30 يومًا' },
  { key: 'month', label: 'هذا الشهر' },
  { key: '90days', label: 'آخر 90 يومًا' },
  { key: 'custom', label: 'مخصص' },
] as const;

export type RangePresetKey = (typeof RANGE_PRESETS)[number]['key'];

export function presetRange(key: Exclude<RangePresetKey, 'custom'>, now: Date = new Date()): DateRange {
  switch (key) {
    case 'today':
      return lastDays(1, now);
    case '7days':
      return lastDays(7, now);
    case '30days':
      return lastDays(30, now);
    case '90days':
      return lastDays(90, now);
    case 'month': {
      const to = sudanDate(now);
      return { from: `${to.slice(0, 8)}01`, to };
    }
  }
}

/** Inclusive day count between two YYYY-MM-DD dates. */
export function daysInRange({ from, to }: DateRange): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) + 1;
}

/** Arabic validation message, or null when the range is acceptable to the API. */
export function validateRange(range: DateRange): string | null {
  if (!range.from || !range.to) return 'اختر تاريخ البداية والنهاية.';
  if (range.from > range.to) return 'تاريخ البداية يجب أن يسبق تاريخ النهاية.';
  if (daysInRange(range) > MAX_RANGE_DAYS) return `الحد الأقصى للفترة ${MAX_RANGE_DAYS} يومًا.`;
  return null;
}
