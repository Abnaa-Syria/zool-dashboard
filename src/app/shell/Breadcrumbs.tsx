import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

const routeLabelMap: Record<string, string> = {
  overview: 'نظرة عامة',
  tracking: 'التتبع المباشر',
  bookings: 'الحجوزات والرحلات',
  companies: 'شركات النقل',
  brokers: 'مكاتب الوكلاء',
  travelers: 'حسابات المسافرين',
  financials: 'المالية والتسويات',
  wallets: 'المحافظ والمعاملات المالية',
  settlements: 'العمولات ودورات التسوية',
  refunds: 'الإلغاءات والاسترداد',
  queue: 'طابور الطلبات',
  policies: 'سياسة الإلغاء والاسترداد',
  reports: 'التقارير المالية والإحصاءات',
  admin: 'إدارة النظام',
  team: 'فريق الإدارة',
  roles: 'الأدوار والصلاحيات',
  audit: 'سجل الأنشطة والتدقيق',
  settings: 'الإعدادات العامة',
  network: 'الشبكة والأسطول',
  fleet: 'الأسطول',
  cities: 'المدن',
  stations: 'المحطات',
  amenities: 'المزايا',
  routes: 'المسارات',
  trips: 'الرحلات والجدولة',
  vehicles: 'الحافلات',
  drivers: 'السائقون',
  marketing: 'التسويق',
  coupons: 'القسائم',
  content: 'صفحات المحتوى',
  'carrier-settlements': 'تسويات شركات النقل',
  'topup-queue': 'طلبات الشحن',
  activity: 'سجل النشاط',
  new: 'جديد',
  edit: 'تعديل',
};

export const Breadcrumbs: React.FC<{ items?: BreadcrumbItem[]; className?: string }> = ({
  items,
  className,
}) => {
  const location = useLocation();

  const generatedItems: BreadcrumbItem[] = React.useMemo(() => {
    if (items && items.length > 0) return items;

    const segments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'الرئيسية والعمليات', path: '/overview' }];

    let currentPath = '';
    segments.forEach((seg, idx) => {
      currentPath += `/${seg}`;
      const label = routeLabelMap[seg] || seg;
      const isLast = idx === segments.length - 1;
      breadcrumbs.push({
        label,
        path: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  }, [items, location.pathname]);

  return (
    <nav aria-label="مسار التنقل" className={cn('flex items-center gap-1.5 text-xs text-on-surface-variant font-medium select-none mb-space-sm', className)}>
      {generatedItems.map((item, idx) => {
        const isLast = idx === generatedItems.length - 1;

        return (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <span className="material-symbols-outlined text-[14px] text-outline opacity-60">
                chevron_left
              </span>
            )}
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="hover:text-secondary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast ? 'text-on-surface font-semibold' : '')}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
