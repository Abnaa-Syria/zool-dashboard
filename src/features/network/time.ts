/**
 * Sudan-time helpers for route/trip scheduling. Africa/Khartoum is a fixed UTC+2 (no DST since
 * 2017), so local wall-clock → UTC is a constant shift. Dates are `YYYY-MM-DD`, times `HH:mm`.
 */
import { PLATFORM_TZ } from '../../lib/dates';

export const SUDAN_UTC_OFFSET_MINUTES = 120;
export const MAX_DEPARTURES = 60;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Validated `{ y, m, d }` or null (rejects 2026-02-30 etc.). */
function parseDate(date: string): { y: number; m: number; d: number } | null {
  const match = DATE_RE.exec(date);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) return null;
  return { y, m, d };
}

export function isValidTime(time: string): boolean {
  return TIME_RE.test(time);
}

/** Sudan local date + time → ISO 8601 UTC instant, e.g. ('2026-12-01', '06:30') → '2026-12-01T04:30:00.000Z'. */
export function sudanLocalToIso(date: string, time: string): string | null {
  const day = parseDate(date);
  const t = TIME_RE.exec(time);
  if (!day || !t) return null;
  const ms = Date.UTC(day.y, day.m - 1, day.d, Number(t[1]), Number(t[2])) - SUDAN_UTC_OFFSET_MINUTES * 60_000;
  return new Date(ms).toISOString();
}

/** 0 = Sunday … 6 = Saturday, for a calendar date (timezone-independent). */
export function weekdayOf(date: string): number | null {
  const day = parseDate(date);
  return day ? new Date(Date.UTC(day.y, day.m - 1, day.d)).getUTCDay() : null;
}

export const WEEKDAYS: Array<{ value: number; label: string }> = [
  { value: 6, label: 'السبت' },
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الاثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
];

export type DeparturePlan = {
  /** Sudan date range (inclusive). */
  from: string;
  to: string;
  /** Departure times `HH:mm` in Sudan time. */
  times: string[];
  /** Allowed weekdays (0=Sun); empty = every day. */
  weekdays: number[];
};

export type GeneratedDepartures = {
  /** Future departures, ascending, de-duplicated (ISO UTC). */
  departures: string[];
  /** Matching slots dropped because they are not in the future. */
  skippedPast: number;
  error: string | null;
};

const MAX_RANGE_DAYS = 366;

/** Expands a date range × weekdays × times plan into ISO departures. */
export function generateDepartures(plan: DeparturePlan, now: Date = new Date()): GeneratedDepartures {
  const from = parseDate(plan.from);
  const to = parseDate(plan.to);
  if (!from || !to) return { departures: [], skippedPast: 0, error: 'حدد تاريخ البداية والنهاية.' };
  const start = Date.UTC(from.y, from.m - 1, from.d);
  const end = Date.UTC(to.y, to.m - 1, to.d);
  if (end < start) return { departures: [], skippedPast: 0, error: 'تاريخ النهاية قبل تاريخ البداية.' };
  if ((end - start) / 86_400_000 + 1 > MAX_RANGE_DAYS) return { departures: [], skippedPast: 0, error: 'الفترة أطول من سنة.' };
  const times = [...new Set(plan.times.filter(Boolean))];
  if (times.length === 0) return { departures: [], skippedPast: 0, error: 'أضف وقت مغادرة واحدًا على الأقل.' };
  if (times.some((t) => !isValidTime(t))) return { departures: [], skippedPast: 0, error: 'صيغة الوقت غير صحيحة (HH:mm).' };

  const weekdays = new Set(plan.weekdays);
  const out = new Set<string>();
  let skippedPast = 0;
  for (let day = start; day <= end; day += 86_400_000) {
    const date = new Date(day);
    if (weekdays.size > 0 && !weekdays.has(date.getUTCDay())) continue;
    const ymd = date.toISOString().slice(0, 10);
    for (const time of times) {
      const iso = sudanLocalToIso(ymd, time)!;
      if (new Date(iso).getTime() <= now.getTime()) skippedPast += 1;
      else out.add(iso);
    }
  }
  const departures = [...out].sort();
  if (departures.length === 0) return { departures, skippedPast, error: 'لا توجد مواعيد مستقبلية مطابقة للاختيار.' };
  if (departures.length > MAX_DEPARTURES) {
    return { departures, skippedPast, error: `عدد الرحلات (${departures.length}) يتجاوز الحد الأقصى ${MAX_DEPARTURES} في الطلب الواحد. ضيّق الفترة أو الأيام.` };
  }
  return { departures, skippedPast, error: null };
}

/** First pair of departures closer than the route duration (same vehicle cannot run both), or null. */
export function findSelfOverlap(departures: string[], durationMinutes: number): [string, string] | null {
  const sorted = [...departures].sort();
  for (let i = 1; i < sorted.length; i += 1) {
    if (new Date(sorted[i]!).getTime() < new Date(sorted[i - 1]!).getTime() + durationMinutes * 60_000) return [sorted[i - 1]!, sorted[i]!];
  }
  return null;
}

const timeFmt = new Intl.DateTimeFormat('ar-SD', { timeZone: PLATFORM_TZ, hour: '2-digit', minute: '2-digit' });
const fullFmt = new Intl.DateTimeFormat('ar-SD', { timeZone: PLATFORM_TZ, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** "06:30 ص" in Sudan time. */
export function formatSudanTime(iso: string | null | undefined): string {
  return iso ? timeFmt.format(new Date(iso)) : '—';
}

/** "الثلاثاء، 1 ديسمبر 2026، 06:30 ص" in Sudan time. */
export function formatSudanFull(iso: string | null | undefined): string {
  return iso ? fullFmt.format(new Date(iso)) : '—';
}

/** 330 → "5 س 30 د". */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} د`;
  return m === 0 ? `${h} س` : `${h} س ${m} د`;
}

// ---------------- Route stops

export type StopDraft = { stationId: string; offsetMinutes: number | ''; dwellMinutes: number | '' };

/**
 * Mirrors backend `normalizeStops`: offsets ≥ 1 and strictly increasing past the previous stop's
 * departure (offset + dwell), every stop leaves before arrival, no endpoint/duplicate stations.
 * Returns an error per stop index (null = ok).
 */
export function validateStops(
  stops: StopDraft[],
  durationMinutes: number,
  endpoints: { originStationId: string; destinationStationId: string },
): Array<string | null> {
  let last = 0;
  const seen = new Set<string>();
  return stops.map((s) => {
    if (!s.stationId) return 'اختر المحطة.';
    if (s.stationId === endpoints.originStationId || s.stationId === endpoints.destinationStationId) return 'لا يمكن تكرار محطة البداية أو النهاية.';
    if (seen.has(s.stationId)) return 'المحطة مكررة.';
    seen.add(s.stationId);
    if (s.offsetMinutes === '' || !Number.isInteger(s.offsetMinutes) || s.offsetMinutes < 1) return 'وقت الوصول (بالدقائق) مطلوب ≥ 1.';
    const dwell = s.dwellMinutes === '' ? 0 : s.dwellMinutes;
    if (!Number.isInteger(dwell) || dwell < 0 || dwell > 240) return 'مدة التوقف بين 0 و 240 دقيقة.';
    if (s.offsetMinutes <= last) return `يجب أن يكون الوصول بعد ${last} دقيقة (مغادرة المحطة السابقة).`;
    if (s.offsetMinutes + dwell >= durationMinutes) return `يجب أن تنتهي المحطة قبل الوصول النهائي (${durationMinutes} دقيقة).`;
    last = s.offsetMinutes + dwell;
    return null;
  });
}
