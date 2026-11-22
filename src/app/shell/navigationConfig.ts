export interface NavItem {
  name: string;
  path: string;
  icon: string;
  /** Hidden unless the admin holds this permission (the API enforces it as well). */
  permission?: string;
  /** `mock` = page still runs on fixtures (MASTER_PLAN phase 4 in progress) — shown with a banner. */
  data: 'live' | 'mock';
  badge?: string;
  badgeVariant?: 'neutral' | 'success' | 'warning' | 'error' | 'secondary';
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationConfig: NavSection[] = [
  {
    title: 'الرئيسية والعمليات',
    items: [
      { name: 'نظرة عامة', path: '/overview', icon: 'grid_view', permission: 'bookings.view', data: 'live' },
      { name: 'التتبع المباشر', path: '/tracking', icon: 'share_location', permission: 'catalog.view', data: 'live' },
      { name: 'الحجوزات والتذاكر', path: '/bookings', icon: 'confirmation_number', permission: 'bookings.view', data: 'live' },
      { name: 'شركات النقل', path: '/companies', icon: 'departure_board', permission: 'carriers.view', data: 'live' },
      { name: 'مكاتب الوكلاء', path: '/brokers', icon: 'storefront', permission: 'brokers.view', data: 'live' },
      { name: 'حسابات المسافرين', path: '/travelers', icon: 'group', permission: 'customers.view', data: 'live' },
    ],
  },
  {
    title: 'الشبكة والأسطول',
    items: [
      { name: 'المسارات', path: '/network/routes', icon: 'route', permission: 'catalog.view', data: 'live' },
      { name: 'الرحلات والجدولة', path: '/network/trips', icon: 'event_repeat', permission: 'catalog.view', data: 'live' },
      // geo + fleet
      { name: 'المدن', path: '/network/cities', icon: 'location_city', permission: 'geo.view', data: 'live' },
      { name: 'المحطات', path: '/network/stations', icon: 'pin_drop', permission: 'geo.view', data: 'live' },
      { name: 'مزايا الحافلات', path: '/network/amenities', icon: 'featured_seasonal_and_gifts', permission: 'geo.view', data: 'live' },
      { name: 'الحافلات', path: '/fleet/vehicles', icon: 'directions_bus', permission: 'fleet.view', data: 'live' },
      { name: 'السائقون', path: '/fleet/drivers', icon: 'badge', permission: 'fleet.view', data: 'live' },
    ],
  },
  {
    title: 'التسويق والمحتوى',
    items: [
      { name: 'الكوبونات', path: '/marketing/coupons', icon: 'sell', permission: 'coupons.view', data: 'live' },
      { name: 'صفحات المحتوى', path: '/content', icon: 'article', permission: 'content.manage', data: 'live' },
    ],
  },
  {
    title: 'المالية والتسويات',
    items: [
      { name: 'محافظ المكاتب', path: '/financials/wallets', icon: 'account_balance_wallet', permission: 'wallets.view', data: 'live' },
      { name: 'مراجعة طلبات الشحن', path: '/financials/topup-queue', icon: 'receipt_long', permission: 'wallets.topups.review', data: 'live' },
      { name: 'العمولات ودورات التسوية', path: '/financials/settlements', icon: 'currency_exchange', permission: 'commissions.view', data: 'live' },
      { name: 'الإلغاءات والاسترداد', path: '/refunds/queue', icon: 'assignment_return', permission: 'bookings.view', data: 'live' },
      { name: 'التقارير المالية والإحصاءات', path: '/reports', icon: 'bar_chart_4_bars', permission: 'reports.view', data: 'live' },
    ],
  },
  {
    title: 'إدارة النظام والصلاحيات',
    items: [
      { name: 'فريق الإدارة', path: '/admin/team', icon: 'shield_person', permission: 'admins.view', data: 'live' },
      { name: 'الأدوار والصلاحيات', path: '/admin/roles', icon: 'lock_person', permission: 'roles.view', data: 'live' },
      { name: 'سجل الأنشطة والتدقيق', path: '/admin/audit', icon: 'history_toggle_off', permission: 'audit.view', data: 'live' },
      { name: 'الإعدادات العامة', path: '/admin/settings', icon: 'settings', permission: 'settings.view', data: 'live' },
    ],
  },
];

/** Nav item that owns a pathname (longest prefix wins). */
export function findNavItem(pathname: string): NavItem | undefined {
  let best: NavItem | undefined;
  for (const section of navigationConfig) {
    for (const item of section.items) {
      const owns = pathname === item.path || pathname.startsWith(`${item.path}/`);
      if (owns && (!best || item.path.length > best.path.length)) best = item;
    }
  }
  return best;
}
