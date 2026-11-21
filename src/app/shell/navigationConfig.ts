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
      { name: 'نظرة عامة', path: '/overview', icon: 'grid_view', permission: 'bookings.view', data: 'mock' },
      { name: 'التتبع المباشر', path: '/tracking', icon: 'share_location', data: 'mock' },
      { name: 'الحجوزات والتذاكر', path: '/bookings', icon: 'confirmation_number', permission: 'bookings.view', data: 'mock' },
      { name: 'شركات النقل', path: '/companies', icon: 'departure_board', permission: 'carriers.view', data: 'mock' },
      { name: 'مكاتب الوكلاء', path: '/brokers', icon: 'storefront', permission: 'brokers.view', data: 'mock' },
      { name: 'حسابات المسافرين', path: '/travelers', icon: 'group', permission: 'customers.view', data: 'mock' },
    ],
  },
  {
    title: 'المالية والتسويات',
    items: [
      { name: 'المحافظ والمعاملات المالية', path: '/financials/wallets', icon: 'account_balance_wallet', permission: 'wallets.view', data: 'mock' },
      { name: 'العمولات ودورات التسوية', path: '/financials/settlements', icon: 'currency_exchange', permission: 'commissions.view', data: 'mock' },
      { name: 'الإلغاءات والاسترداد', path: '/refunds/queue', icon: 'assignment_return', permission: 'bookings.view', data: 'mock' },
      { name: 'التقارير المالية والإحصاءات', path: '/reports', icon: 'bar_chart_4_bars', permission: 'reports.view', data: 'mock' },
    ],
  },
  {
    title: 'إدارة النظام والصلاحيات',
    items: [
      { name: 'فريق الإدارة', path: '/admin/team', icon: 'shield_person', permission: 'admins.view', data: 'mock' },
      { name: 'الأدوار والصلاحيات', path: '/admin/roles', icon: 'lock_person', permission: 'roles.view', data: 'mock' },
      { name: 'سجل الأنشطة والتدقيق', path: '/admin/audit', icon: 'history_toggle_off', permission: 'audit.view', data: 'mock' },
      { name: 'الإعدادات العامة', path: '/admin/settings', icon: 'settings', permission: 'settings.view', data: 'mock' },
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
