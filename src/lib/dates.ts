/** Platform calendar is Sudan time (API_CONVENTIONS §6). */
export const PLATFORM_TZ = 'Africa/Khartoum';

/** YYYY-MM-DD of `date` in Sudan time. */
export function sudanDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: PLATFORM_TZ }).format(date);
}

/** `{ from, to }` Sudan days covering the last `days` days including today. */
export function lastDays(days: number, now: Date = new Date()): { from: string; to: string } {
  return { from: sudanDate(new Date(now.getTime() - (days - 1) * 86_400_000)), to: sudanDate(now) };
}

const dateTime = new Intl.DateTimeFormat('ar-SD', {
  timeZone: PLATFORM_TZ,
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** "22 نوفمبر، 06:30 ص" in Sudan time. */
export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dateTime.format(new Date(iso)) : '—';
}
