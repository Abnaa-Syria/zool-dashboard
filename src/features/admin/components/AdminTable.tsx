import React from 'react';
import { Link } from 'react-router-dom';
import type { AdminUser } from '../types/admin';
import type { AdminFilters } from '../services/adminService';

interface AdminTableProps {
  users: AdminUser[];
  totalCount: number;
  filters: AdminFilters;
  onFilterChange: (filters: Partial<AdminFilters>) => void;
  onFreezeUser: (userId: string) => void;
  onUnfreezeUser: (userId: string) => void;
}

export const AdminTable: React.FC<AdminTableProps> = ({
  users,
  totalCount,
  filters,
  onFilterChange,
  onFreezeUser,
  onUnfreezeUser,
}) => {
  const getDepartmentLabel = (dept: string) => {
    switch (dept) {
      case 'executive':
        return 'الإدارة العليا التنفيذية';
      case 'finance':
        return 'القطاع المالي والتسويات';
      case 'operations':
        return 'العمليات ومراقبة الموانئ';
      case 'support':
        return 'خدمة الركاب والنزاعات';
      case 'security':
        return 'الأمن والشبكات الرقمية';
      default:
        return dept;
    }
  };

  const getStatusBadge = (user: AdminUser) => {
    if (user.status === 'online') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          متصل الآن
        </span>
      );
    }
    if (user.status === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-md text-xs font-medium">
          <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span>
          نشط ومعتمد
        </span>
      );
    }
    if (user.status === 'leave') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-md text-xs font-medium">
          <span className="material-symbols-outlined text-[14px]">beach_access</span>
          إجازة سنوية
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-md text-xs font-semibold">
        <span className="material-symbols-outlined text-[14px]">lock</span>
        مقيد مؤقتاً
      </span>
    );
  };

  const handleResetFilters = () => {
    onFilterChange({
      searchQuery: '',
      roleId: 'all',
      status: 'all',
      department: 'all',
    });
  };

  return (
    <div className="flex flex-col gap-space-md">
      {/* Filtering Toolbar */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high/60">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-space-md">
          {/* Search Field */}
          <div className="relative w-full lg:max-w-md">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="search"
              value={filters.searchQuery || ''}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="البحث بالاسم، البريد الداخلي، أو الكود (مثال: ADM-004)..."
              className="w-full h-10 pr-9 pl-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant font-body-sm text-sm focus:outline-none focus:ring-2 focus:ring-secondary border border-transparent focus:border-secondary transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-space-sm w-full lg:w-auto">
            {/* Role Filter */}
            <div className="relative">
              <select
                value={filters.roleId || 'all'}
                onChange={(e) => onFilterChange({ roleId: e.target.value })}
                className="h-10 pr-3 pl-8 rounded-lg bg-surface-container-low text-on-surface font-label-md text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer border border-transparent"
              >
                <option value="all">كافة الأدوار الوظيفية</option>
                <option value="super-admin">المشرف العام (Super Admin)</option>
                <option value="cfo">المدقق المالي والمحاسبي</option>
                <option value="fleet">مدير الأسطول والعمليات</option>
                <option value="compliance">مسؤول الحوكمة ومكافحة الاحتيال</option>
                <option value="support">مسؤول الدعم وحجوزات التذاكر</option>
              </select>
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filters.status || 'all'}
                onChange={(e) => onFilterChange({ status: e.target.value })}
                className="h-10 pr-3 pl-8 rounded-lg bg-surface-container-low text-on-surface font-label-md text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer border border-transparent"
              >
                <option value="all">كافة الحالات</option>
                <option value="online">متصل الآن</option>
                <option value="active">نشط ومعتمد</option>
                <option value="restricted">مقيد مؤقتاً</option>
                <option value="leave">إجازة اعتيادية</option>
              </select>
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>

            {/* Department Filter */}
            <div className="relative">
              <select
                value={filters.department || 'all'}
                onChange={(e) => onFilterChange({ department: e.target.value })}
                className="h-10 pr-3 pl-8 rounded-lg bg-surface-container-low text-on-surface font-label-md text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-secondary cursor-pointer border border-transparent"
              >
                <option value="all">كافة الأقسام</option>
                <option value="executive">الإدارة العليا التنفيذية</option>
                <option value="finance">القطاع المالي والتسويات</option>
                <option value="operations">العمليات ومراقبة الموانئ</option>
                <option value="support">خدمة الركاب والنزاعات</option>
                <option value="security">الأمن والشبكات الرقمية</option>
              </select>
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-10 px-3 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-dim transition-colors font-label-md text-xs flex items-center gap-1.5"
              title="إعادة ضبط الفلاتر"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>إعادة ضبط</span>
            </button>
          </div>

          {/* Result Counter */}
          <div className="font-label-md text-xs text-on-surface-variant shrink-0 bg-surface-container-low px-3 py-2 rounded-lg">
            عرض <strong className="text-on-surface font-bold">{users.length}</strong> من أصل{' '}
            <strong className="text-on-surface font-bold">{totalCount}</strong> حساباً
          </div>
        </div>
      </div>

      {/* High-Density Admin Datagrid */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-surface-container-high/60">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-xs h-12 border-b border-surface-container-high">
                <th className="px-space-md py-3 text-right">المشرف والكود الوظيفي</th>
                <th className="px-space-md py-3 text-right">الدور والصلاحية المقررة</th>
                <th className="px-space-md py-3 text-right">القسم / النطاق الإداري</th>
                <th className="px-space-md py-3 text-right">بروتوكول الأمان و 2FA</th>
                <th className="px-space-md py-3 text-right">آخر جلسة ونشاط</th>
                <th className="px-space-md py-3 text-right">حالة الحساب</th>
                <th className="px-space-md py-3 text-center">إجراءات الحوكمة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface font-body-sm text-xs">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2 block">
                      person_off
                    </span>
                    لا يوجد مشرفون مطابقون لشروط التصفية الحالية.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isOnline = user.status === 'online';
                  const activeSession = user.activeSessions[0];
                  return (
                    <tr key={user.id} className="h-16 hover:bg-surface-container-low/60 transition-colors">
                      {/* Name & ID */}
                      <td className="px-space-md py-2">
                        <div className="flex items-center gap-space-sm">
                          <div className="relative shrink-0">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-surface-container"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary font-headline-sm text-sm flex items-center justify-center font-bold shadow-sm">
                                {user.avatarInitials}
                              </div>
                            )}
                            {isOnline && (
                              <span
                                className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-secondary ring-2 ring-surface-container-lowest"
                                title="متصل الآن"
                              ></span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-label-lg text-sm text-on-surface font-bold truncate">
                                {user.name}
                              </span>
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-bold">
                                {user.id}
                              </span>
                            </div>
                            <div className="font-body-sm text-[11px] text-on-surface-variant truncate mt-0.5 flex items-center gap-2">
                              <span>{user.email}</span>
                              <span className="text-outline">•</span>
                              <span dir="ltr">{user.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-space-md py-2 font-medium">
                        <span className="text-on-surface font-semibold block">{user.arabicRoleTitle}</span>
                        <span className="text-[10px] text-on-surface-variant font-mono">{user.employeeCode}</span>
                      </td>

                      {/* Department */}
                      <td className="px-space-md py-2">
                        <span className="px-2.5 py-1 rounded-md bg-surface-container-low text-on-surface font-label-md text-[11px]">
                          {getDepartmentLabel(user.department)}
                        </span>
                      </td>

                      {/* 2FA */}
                      <td className="px-space-md py-2">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-secondary text-[16px]">
                            {user.twoFactorMethod === 'fido2' ? 'key' : 'verified_user'}
                          </span>
                          <span className="text-[11px] text-on-surface font-medium">
                            {user.twoFactorMethod === 'fido2'
                              ? 'FIDO2 Hardware Key'
                              : user.twoFactorMethod === 'authenticator'
                              ? 'Google Authenticator'
                              : 'OTP SMS (Zain/Sudani)'}
                          </span>
                        </div>
                      </td>

                      {/* Last Active */}
                      <td className="px-space-md py-2">
                        <div className="text-[11px]">
                          <span className="text-on-surface block font-medium">
                            {activeSession ? activeSession.lastActive : 'لا توجد جلسة نشطة'}
                          </span>
                          <span className="text-on-surface-variant text-[10px] block mt-0.5">
                            {user.workLocation.split(' - ')[0]}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-space-md py-2">{getStatusBadge(user)}</td>

                      {/* Actions */}
                      <td className="px-space-md py-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            to={`/admin/team/${user.id}`}
                            className="p-1.5 rounded-lg bg-surface-container hover:bg-secondary hover:text-on-secondary transition-colors text-on-surface"
                            title="عرض الملف الكامل والصلاحيات"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </Link>
                          {user.status === 'restricted' ? (
                            <button
                              type="button"
                              onClick={() => onUnfreezeUser(user.id)}
                              className="p-1.5 rounded-lg bg-surface-container hover:bg-secondary-container text-secondary transition-colors"
                              title="إلغاء التجميد وتفعيل الحساب"
                            >
                              <span className="material-symbols-outlined text-[18px]">lock_open</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onFreezeUser(user.id)}
                              className="p-1.5 rounded-lg bg-surface-container hover:bg-error-container text-error transition-colors"
                              title="تجميد الحساب احترازياً"
                            >
                              <span className="material-symbols-outlined text-[18px]">lock_clock</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
