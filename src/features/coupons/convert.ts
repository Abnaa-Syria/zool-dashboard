import { minorToSdg, sdgToMinor } from '../../lib/money';

/** Coupon PERCENT values are basis points on the API (2500 = 25%, 1..10000). */
export function percentToBasisPoints(percent: number): number {
  return Math.round(percent * 100);
}

export function basisPointsToPercent(bp: number): number {
  return bp / 100;
}

/** "25%" / "12.5%" */
export function formatPercent(bp: number): string {
  return `${basisPointsToPercent(bp).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;
}

/**
 * Parses an optional positive number field. '' → undefined; invalid / ≤ 0 → null (error).
 */
export function parsePositive(raw: string): number | undefined | null {
  const s = raw.trim();
  if (s === '') return undefined;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Optional SDG amount field → minor units ('' → undefined; invalid / < 0.01 SDG → null). */
export function parseSdgToMinor(raw: string): number | undefined | null {
  const n = parsePositive(raw);
  if (n === undefined || n === null) return n;
  const minor = sdgToMinor(n);
  return minor >= 1 ? minor : null;
}

/** Optional positive integer field ('' → undefined; non-integer / ≤ 0 → null). */
export function parsePositiveInt(raw: string): number | undefined | null {
  const n = parsePositive(raw);
  if (n === undefined || n === null) return n;
  return Number.isInteger(n) ? n : null;
}

export { minorToSdg, sdgToMinor };

/** Sudan is UTC+2 all year (no DST) — the platform calendar (API_CONVENTIONS §6). */
const SUDAN_OFFSET = '+02:00';

/** `<input type="datetime-local">` value in Sudan time → ISO instant. */
export function sudanLocalToIso(local: string): string {
  return new Date(`${local}:00${SUDAN_OFFSET}`).toISOString();
}

/** ISO instant → `YYYY-MM-DDTHH:mm` in Sudan time (for datetime-local inputs). */
export function isoToSudanLocal(iso: string): string {
  const shifted = new Date(new Date(iso).getTime() + 2 * 3_600_000);
  return shifted.toISOString().slice(0, 16);
}
