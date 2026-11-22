/** Client-side mirrors of backend geo.validation rules (pure; unit-tested). */

export const CITY_CODE_RE = /^[A-Z]{2,16}$/;
export const AMENITY_CODE_RE = /^[a-z][a-z0-9_]{1,31}$/;

export function isUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Name length check (backend: trimmed, 2..max). Returns an Arabic error or undefined. */
export function nameError(v: string, max: number): string | undefined {
  const t = v.trim();
  if (t.length < 2) return 'مطلوب (حرفان على الأقل)';
  if (t.length > max) return `الحد الأقصى ${max} حرفًا`;
  return undefined;
}

/** Optional integer 0..10000; '' → undefined value. */
export function parseSortOrder(v: string): { value?: number; error?: string } {
  const t = v.trim();
  if (!t) return {};
  if (!/^\d+$/.test(t)) return { error: 'رقم صحيح موجب' };
  const n = Number(t);
  if (n > 10_000) return { error: 'الحد الأقصى 10000' };
  return { value: n };
}

export type CoordinatesResult =
  | { ok: true; latitude: number; longitude: number }
  | { ok: true; latitude: null; longitude: null }
  | { ok: false; error: string };

/** Latitude/longitude are optional but must be given (or cleared) together. */
export function parseCoordinates(latText: string, lngText: string): CoordinatesResult {
  const lat = latText.trim();
  const lng = lngText.trim();
  if (!lat && !lng) return { ok: true, latitude: null, longitude: null };
  if (!lat || !lng) return { ok: false, error: 'أدخل خط العرض وخط الطول معًا أو اتركهما فارغين.' };
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return { ok: false, error: 'خط العرض بين ‎-90 و 90.' };
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return { ok: false, error: 'خط الطول بين ‎-180 و 180.' };
  return { ok: true, latitude, longitude };
}
