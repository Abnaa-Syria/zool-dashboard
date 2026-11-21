import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { SimpleTooltip } from '../../components/ui/Tooltip';

import { navigationConfig } from './navigationConfig';
import { useAuth } from '../../features/auth/auth-context';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();
  const { can } = useAuth();
  const sections = navigationConfig
    .map((section) => ({ ...section, items: section.items.filter((item) => !item.permission || can(item.permission)) }))
    .filter((section) => section.items.length > 0);

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between overflow-y-auto overflow-x-hidden text-right select-none">
      {/* Brand Header */}
      <div className="flex flex-col border-b border-outline-variant/30">
        <div className={cn('p-space-lg flex flex-col gap-space-xs bg-surface-container transition-all', isCollapsed ? 'p-3 items-center' : '')}>
          <div className="flex items-center gap-space-sm justify-between">
            {isCollapsed ? (
              <SimpleTooltip content="ZoolGo - لوحة الإدارة">
                <NavLink
                  to="/overview"
                  className="flex items-center justify-center group focus:outline-none"
                  aria-label="الذهاب إلى لوحة الإدارة ZoolGo"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#003b27] flex items-center justify-center p-1.5 shadow-sm shrink-0 border border-white/10 ring-1 ring-[#003b27]/20 group-hover:scale-105 group-hover:shadow-md transition-all duration-200">
                    <img
                      src="/log-zool.svg"
                      alt="شعار ZoolGo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </NavLink>
              </SimpleTooltip>
            ) : (
              <NavLink
                to="/overview"
                className="flex items-center gap-space-sm group focus:outline-none"
                title="ZoolGo - لوحة التحكم المركزية"
              >
                <div className="w-11 h-11 rounded-xl bg-[#003b27] flex items-center justify-center p-1.5 shadow-sm shrink-0 border border-white/10 ring-1 ring-[#003b27]/20 group-hover:scale-105 group-hover:shadow-md transition-all duration-200">
                  <img
                    src="/log-zool.svg"
                    alt="شعار ZoolGo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tight text-primary leading-tight font-display group-hover:text-brand-burgundyLight transition-colors">
                    ZoolGo
                  </span>
                  <span className="text-[11px] text-secondary font-medium">سفريات المدن وإدارة النقل</span>
                </div>
              </NavLink>
            )}

            {/* Desktop Collapse Toggle Button */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="طي القائمة الجانبية"
                title="طي القائمة الجانبية"
                className="hidden lg:flex p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">menu_open</span>
              </button>
            )}
          </div>

          {!isCollapsed && (
            <div className="mt-space-xs inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest text-secondary text-[11px] font-semibold w-fit border border-surface-container-high shadow-xs">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>لوحة الإدارة المركزية (Super Admin v1.0)</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 py-space-sm px-space-xs space-y-space-md">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="text-[11px] font-bold text-on-surface-variant/80 px-space-sm py-1 uppercase tracking-wider">
                {section.title}
              </div>
            )}
            <nav className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/overview' && location.pathname.startsWith(item.path));

                const linkElement = (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={cn(
                      'flex items-center justify-between px-space-sm py-2 rounded-lg text-sm font-medium transition-all group',
                      isCollapsed ? 'justify-center px-2 py-2.5' : '',
                      isActive
                        ? 'bg-tertiary text-on-tertiary font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    )}
                  >
                    <div className="flex items-center gap-space-sm">
                      <span
                        className={cn(
                          'material-symbols-outlined text-[20px] transition-transform group-hover:scale-105',
                          isActive ? 'text-on-tertiary' : 'text-on-surface-variant'
                        )}
                      >
                        {item.icon}
                      </span>
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>

                    {!isCollapsed && item.data === 'mock' && (
                      <span
                        title="هذه الصفحة ما زالت تعرض بيانات تجريبية"
                        className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-surface-container-high text-on-surface-variant"
                      >
                        تجريبي
                      </span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold',
                          item.badgeVariant === 'secondary'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : item.badgeVariant === 'warning'
                            ? 'bg-secondary-fixed text-on-secondary-fixed'
                            : item.badgeVariant === 'error'
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-surface-container-high text-on-surface'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );

                if (isCollapsed) {
                  return (
                    <SimpleTooltip key={item.path} content={item.name}>
                      <div>{linkElement}</div>
                    </SimpleTooltip>
                  );
                }

                return linkElement;
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Admin User Persona Footer */}
      <div className={cn('p-space-sm m-space-xs rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-card flex items-center justify-between gap-space-sm transition-all', isCollapsed ? 'p-2 justify-center' : '')}>
        <div className="flex items-center gap-space-sm">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-bold text-sm">
              أس
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-surface-container-lowest" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-on-surface leading-tight">أحمد السر</span>
              <span className="text-[10px] text-on-surface-variant font-medium">المشرف العام (Persona)</span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <SimpleTooltip content="تسجيل الخروج (محاكاة هوية التطوير)">
            <button
              type="button"
              onClick={() => alert('تنبيه بيئة التطوير: هذا الحساب يمثل هوية محاكاة للمشرف العام.')}
              aria-label="تسجيل الخروج"
              className="text-on-surface-variant hover:text-error hover:bg-error-container/40 p-1.5 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </SimpleTooltip>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'fixed right-0 top-0 h-screen bg-surface-container-low shadow-sidebar z-40 transition-all duration-300 hidden lg:block border-l border-outline-variant/20',
          isCollapsed ? 'w-20' : 'w-72'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#162B22]/40 backdrop-blur-sm z-50 lg:hidden animate-in fade-in-0 duration-200"
          aria-hidden="true"
        />
      )}

      {/* Mobile / Tablet Drawer Sidebar */}
      <aside
        className={cn(
          'fixed right-0 top-0 h-screen w-72 bg-surface-container-low shadow-modal z-50 transition-transform duration-300 ease-in-out lg:hidden border-l border-outline-variant/30',
          isMobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="relative h-full flex flex-col">
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="إغلاق القائمة"
            className="absolute left-3 top-3 p-1 rounded-lg text-on-surface-variant hover:bg-surface-container z-10"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          {sidebarContent}
        </div>
      </aside>
    </>
  );
};
