import React, { useState } from 'react';
import { useAdminTeam } from '../hooks/useAdmin';
import { AdminMetricsCards } from '../components/AdminMetricsCards';
import { AdminTable } from '../components/AdminTable';
import { AdminInviteModal } from '../components/AdminInviteModal';

export const AdminTeamPage: React.FC = () => {
  const {
    users,
    metrics,
    filters,
    applyFilters,
    inviteUser,
    freezeAccount,
    unfreezeAccount,
    exportCsv,
  } = useAdminTeam();

  const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Top Banner & Header Area */}
      <div className="px-space-lg pt-space-lg pb-space-md">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 font-label-md text-xs text-on-surface-variant mb-space-sm">
          <span className="hover:text-secondary cursor-pointer transition-colors">الرئيسية والعمليات</span>
          <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          <span className="hover:text-secondary cursor-pointer transition-colors">إدارة النظام والصلاحيات</span>
          <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          <span className="text-secondary font-bold">فريق الإدارة وحسابات المشرفين</span>
        </div>

        {/* Main Header Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md pb-space-md">
          <div>
            <div className="flex items-center gap-space-sm">
              <h1 className="font-display-md text-xl md:text-2xl text-on-surface font-bold tracking-tight">
                فريق الإدارة وحسابات المشرفين المعتمدة
              </h1>
              <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-bold">
                {users.length} حساب نشط
              </span>
            </div>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant mt-1 max-w-3xl leading-relaxed">
              إدارة طاقم الإشراف والرقابة لمنصة سفريات المدن ZoolGo، وتعيين الأدوار الوظيفية، ومتابعة
              نشاط المشرفين اللحظي ومستويات الأمان والحوكمة المؤسسية.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-space-sm shrink-0">
            <button
              type="button"
              onClick={exportCsv}
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-surface-container-lowest text-secondary hover:bg-surface-container-high transition-colors font-label-lg text-xs font-bold shadow-sm border border-surface-container-high/60 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>تصدير قائمة الإداريين (Excel/CSV)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-2 h-10 px-5 rounded-lg bg-primary-container text-on-primary hover:opacity-95 transition-opacity font-label-lg text-xs font-bold shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>+ دعوة / إضافة مشرف جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="px-space-lg">
        <AdminMetricsCards metrics={metrics} />
      </div>

      {/* Table & Filtering */}
      <div className="px-space-lg pb-space-xl">
        <AdminTable
          users={users}
          totalCount={metrics.totalAdmins}
          filters={filters}
          onFilterChange={applyFilters}
          onFreezeUser={(id) => freezeAccount(id, 'تجميد احترازي من شاشة الإشراف')}
          onUnfreezeUser={unfreezeAccount}
        />
      </div>

      {/* Invite Modal */}
      <AdminInviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={inviteUser}
      />
    </div>
  );
};
