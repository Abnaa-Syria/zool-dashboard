import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { findNavItem } from './navigationConfig';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '../../lib/utils';

export const AppShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const location = useLocation();
  const isMockPage = findNavItem(location.pathname)?.data === 'mock';

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col">
      {/* Navigation Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Top Application Bar */}
      <Topbar
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebarCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main Scrollable Content Canvas */}
      <div
        className={cn(
          'pt-16 min-h-screen flex flex-col transition-all duration-300',
          isSidebarCollapsed ? 'lg:pr-20' : 'lg:pr-72'
        )}
      >
        <main className="flex-1 p-space-md lg:p-space-lg w-full max-w-[1600px] mx-auto">
          {isMockPage && (
            <div role="status" className="mb-space-md rounded-lg border border-secondary-fixed bg-secondary-fixed/40 text-on-secondary-fixed px-space-md py-2 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">science</span>
              هذه الصفحة ما زالت تعرض بيانات تجريبية ولم تُربط بالخادم بعد.
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
