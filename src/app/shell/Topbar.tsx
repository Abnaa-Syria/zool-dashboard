import * as React from 'react';
import { cn } from '../../lib/utils';
import { SearchInput } from '../../components/ui/Input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../components/ui/DropdownMenu';

export interface TopbarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
  onOpenMobileSidebar: () => void;
  lastUpdated?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  onOpenMobileSidebar,
  lastUpdated = 'مزامنة الخوادم: نشطة',
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <header
      className={cn(
        'fixed top-0 left-0 z-30 h-16 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-space-md lg:px-space-lg flex items-center justify-between gap-space-md transition-all duration-300',
        isSidebarCollapsed ? 'lg:right-20 right-0' : 'lg:right-72 right-0'
      )}
    >
      {/* Right side: Mobile Menu + Collapse Toggle + Search */}
      <div className="flex items-center gap-space-sm flex-1 max-w-xl">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="فتح القائمة الرئيسية"
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Desktop Expand Button if collapsed */}
        {isSidebarCollapsed && (
          <button
            type="button"
            onClick={onToggleSidebarCollapse}
            aria-label="توسيع القائمة الجانبية"
            title="توسيع القائمة الجانبية"
            className="hidden lg:flex p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
        )}

        {/* Search Input with Scope Indicator */}
        <div className="w-full max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="بحث برقم الحجز، الوكيل، أو الشركة..."
            scopeLabel="نطاق البحث العام"
          />
        </div>

        {/* Operational Status Pill (Neutral, truthful) */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-xs font-semibold shrink-0 border border-outline-variant/20">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span>{lastUpdated}</span>
        </div>
      </div>

      {/* Left side: Date Badge + Notifications + User Avatar */}
      <div className="flex items-center gap-space-sm">
        {/* Date Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold shadow-xs border border-outline-variant/30">
          <span className="material-symbols-outlined text-secondary text-[16px]">calendar_today</span>
          <span>اليوم: 24 أكتوبر 2024</span>
        </div>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="التنبيهات والإشعارات"
              className="relative p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shadow-xs border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/40"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container ring-2 ring-surface-container-lowest" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2 text-right">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/30">
              <span className="text-xs font-bold text-on-surface">الإشعارات والتنبيهات</span>
              <span className="text-[10px] bg-primary-fixed text-on-primary-fixed font-bold px-2 py-0.5 rounded-full">
                4 جديدة
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer">
                <span className="font-semibold block text-primary">تحقق بنكي معلق</span>
                <span className="text-on-surface-variant text-[11px]">
                  4 إيداعات جديدة بانتظار المطابقة والاعتماد
                </span>
              </div>
              <div className="p-2 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer">
                <span className="font-semibold block text-secondary">حركة أسطول نشطة</span>
                <span className="text-on-surface-variant text-[11px]">
                  انطلاق الرحلة #TRIP-983 نحو مروي
                </span>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar with Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="قائمة حساب المشرف"
              className="flex items-center gap-space-xs p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-transform active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-secondary-container text-secondary font-bold flex items-center justify-center text-xs ring-2 ring-surface-container-high shadow-xs">
                أس
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 text-right">
            <div className="px-2 py-1.5 border-b border-outline-variant/30 mb-1">
              <span className="text-xs font-bold block text-on-surface">أحمد السر</span>
              <span className="text-[11px] text-on-surface-variant block">المشرف العام (Super Admin)</span>
              <span className="text-[10px] text-outline block mt-0.5 font-mono">persona@zoolgo.sd</span>
            </div>
            <DropdownMenuItem onClick={() => alert('إعدادات الحساب الإداري')}>
              <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
              <span>الملف الإداري</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert('سجل الجلسات والأمان')}>
              <span className="material-symbols-outlined text-[16px]">security</span>
              <span>سجل الأمان</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              onClick={() => alert('تنبيه: هذا الحساب يمثل هوية محاكاة للمشرف العام في بيئة التطوير.')}
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>تسجيل الخروج (محاكاة)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
