import { formatSdg } from '../money';
import { ApiError } from './client';

/**
 * 409 ENTITY_IN_USE from the admin DELETE endpoints (backend admin-delete.service):
 * `details: { entity, usage: { name: count }, alternative }`. The dashboard lists what still uses the
 * record (in Arabic) and offers the safe alternative (deactivate / retire / suspend) instead.
 */
export type EntityInUse = {
  entity: string;
  usage: Record<string, number>;
  alternative: string | null;
};

export function parseEntityInUse(error: unknown): EntityInUse | null {
  if (!(error instanceof ApiError) || error.code !== 'ENTITY_IN_USE') return null;
  const d = (error.details ?? {}) as Partial<EntityInUse>;
  const usage: Record<string, number> = {};
  if (d.usage && typeof d.usage === 'object') {
    for (const [k, v] of Object.entries(d.usage)) if (typeof v === 'number') usage[k] = v;
  }
  return { entity: typeof d.entity === 'string' ? d.entity : '', usage, alternative: typeof d.alternative === 'string' && d.alternative ? d.alternative : null };
}

/** Arabic noun for each usage key the backend reports. */
export const USAGE_LABEL: Record<string, string> = {
  stations: 'محطات',
  routes: 'مسارات',
  routeStops: 'توقفات ضمن مسارات',
  trips: 'رحلات',
  tripStops: 'توقفات ضمن رحلات',
  vehicles: 'حافلات',
  drivers: 'سائقون',
  positions: 'مواقع GPS مسجّلة',
  boardings: 'تذاكر سجّل صعودها',
  cashCollections: 'تحصيلات نقدية',
  scans: 'عمليات مسح عند الصعود',
  redemptions: 'مرات استخدام',
  brokerAssignments: 'إسنادات لمكاتب وكلاء',
  settlements: 'تسويات مالية',
  coupons: 'قسائم خصم',
  ratings: 'تقييمات',
  bookings: 'حجوزات',
  walletEntries: 'قيود في المحفظة',
  topUps: 'طلبات شحن رصيد',
  commissions: 'عمولات',
};

/** Keys the backend reports for information only (never block a delete). */
const IGNORED_KEYS = new Set(['recentSearches']);

/** One Arabic line per blocking usage, e.g. "رحلات: 12". Unknown keys fall back to the raw key. */
export function usageLines(usage: Record<string, number>): string[] {
  const lines: string[] = [];
  for (const [key, count] of Object.entries(usage)) {
    if (IGNORED_KEYS.has(key) || count <= 0) continue;
    if (key === 'walletBalanceMinor') lines.push(`رصيد متبقٍ في المحفظة: ${formatSdg(count)}`);
    else if (key === 'lastActiveManager') lines.push('هذا آخر مدير نشط للشركة — عيّن مديرًا آخر أولًا');
    else lines.push(`${USAGE_LABEL[key] ?? key}: ${count.toLocaleString('en-US')}`);
  }
  return lines;
}

/** Arabic name of the entity kind (`details.entity`). */
export const ENTITY_LABEL: Record<string, string> = {
  city: 'المدينة',
  station: 'المحطة',
  amenity: 'الميزة',
  vehicle: 'الحافلة',
  driver: 'السائق',
  route: 'المسار',
  coupon: 'القسيمة',
  content: 'الصفحة',
  carrier: 'شركة النقل',
  brokerOffice: 'مكتب الوكيل',
  brokerEmployee: 'الموظف',
  carrierEmployee: 'الموظف',
};
