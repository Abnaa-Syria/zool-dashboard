export interface NavItem {
  name: string;
  path: string;
  icon: string;
  badge?: string;
  badgeVariant?: 'neutral' | 'success' | 'warning' | 'error' | 'secondary';
  isPlaceholder?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationConfig: NavSection[] = [
  {
    title: 'الرئيسية والعمليات',
    items: [
      { name: 'نظرة عامة', path: '/overview', icon: 'grid_view' },
      { name: 'التتبع المباشر', path: '/tracking', icon: 'share_location', badge: 'مباشر', badgeVariant: 'secondary', isPlaceholder: false },
      { name: 'الحجوزات والتذاكر', path: '/bookings', icon: 'confirmation_number', badge: '142', badgeVariant: 'neutral', isPlaceholder: false },
      { name: 'شركات النقل', path: '/companies', icon: 'departure_board', isPlaceholder: false },
      { name: 'مكاتب الوكلاء', path: '/brokers', icon: 'storefront', badge: '14 تنبيه', badgeVariant: 'error', isPlaceholder: false },
      { name: 'حسابات المسافرين', path: '/travelers', icon: 'group', isPlaceholder: false },
    ],
  },
  {
    title: 'المالية والتسويات',
    items: [
      { name: 'المحافظ والمعاملات المالية', path: '/financials/wallets', icon: 'account_balance_wallet', isPlaceholder: false },
      { name: 'العمولات ودورات التسوية', path: '/financials/settlements', icon: 'currency_exchange', badge: '4 معلقة', badgeVariant: 'warning', isPlaceholder: false },
      { name: 'الإلغاءات والاسترداد', path: '/refunds/queue', icon: 'assignment_return', badge: '2 مراجعة', badgeVariant: 'error', isPlaceholder: false },
      { name: 'التقارير المالية والإحصاءات', path: '/reports', icon: 'bar_chart_4_bars', isPlaceholder: false },
    ],
  },
  {
    title: 'إدارة النظام والصلاحيات',
    items: [
      { name: 'فريق الإدارة', path: '/admin/team', icon: 'shield_person', isPlaceholder: false },
      { name: 'الأدوار والصلاحيات', path: '/admin/roles', icon: 'lock_person', isPlaceholder: false },
      { name: 'سجل الأنشطة والتدقيق', path: '/admin/audit', icon: 'history_toggle_off', isPlaceholder: false },
      { name: 'الإعدادات العامة', path: '/admin/settings', icon: 'settings', isPlaceholder: false },
    ],
  },
];
