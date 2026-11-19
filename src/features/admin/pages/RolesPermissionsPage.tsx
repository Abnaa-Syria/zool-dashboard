import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRbacGovernance } from '../hooks/useAdmin';
import { RoleArchetypeCards } from '../components/RoleArchetypeCards';
import { RbacMatrixTable } from '../components/RbacMatrixTable';
import { RoleDrawer } from '../components/RoleDrawer';
import type { RoleArchetype } from '../types/admin';

export const RolesPermissionsPage: React.FC = () => {
  const { roles, permissions, createRole, updatePermission } = useRbacGovernance();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleArchetype | null>(null);

  const handleOpenCreateDrawer = () => {
    setSelectedRole(null);
    setIsDrawerOpen(true);
  };

  const handleSelectRole = (role: RoleArchetype) => {
    setSelectedRole(role);
    setIsDrawerOpen(true);
  };

  const handleExportMatrixPdf = () => {
    window.print();
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="p-space-lg md:p-space-xl space-y-space-lg max-w-[1600px] mx-auto w-full">
        {/* Section 1: Breadcrumb & Top Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          <div className="space-y-1">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-label-md text-xs text-on-surface-variant">
              <Link to="/overview" className="hover:text-secondary transition-colors">
                الرئيسية والعمليات
              </Link>
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              <span className="text-on-surface-variant">إدارة النظام والصلاحيات</span>
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              <span className="text-secondary font-bold">مصفوفة الأدوار والصلاحيات (RBAC Matrix)</span>
            </nav>

            {/* Title & Subtitle */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-2.5 h-7 bg-primary-container rounded-full"></div>
              <h1 className="font-headline-lg text-lg md:text-2xl text-on-surface font-bold tracking-tight">
                إدارة الأدوار ومصفوفة الصلاحيات والحوكمة
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-bold">
                v3.2 نشط
              </span>
            </div>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant max-w-4xl leading-relaxed">
              تعريف الأدوار القياسية والمخصصة لنظام ZoolGo وضبط أذونات الوصول الدقيقة لكل شاشة ومورد وعملية مالية
              لمنع تعارض المصالح وتعزيز موثوقية الأسطول.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-space-sm flex-wrap">
            <Link
              to="/admin/audit"
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-surface-container-lowest text-secondary font-label-lg text-xs font-bold shadow-sm hover:bg-surface-container-high transition-all border border-surface-container-high/60 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span>سجل تدقيق الصلاحيات</span>
            </Link>

            <button
              type="button"
              onClick={handleExportMatrixPdf}
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-surface-container-low text-on-surface font-label-lg text-xs font-bold hover:bg-surface-container-high transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>تصدير المصفوفة (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateDrawer}
              className="flex items-center gap-2 h-10 px-5 rounded-lg bg-primary-container text-on-primary font-label-lg text-xs font-bold shadow-sm hover:opacity-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_moderator</span>
              <span>+ إنشاء دور وظيفي جديد</span>
            </button>
          </div>
        </div>

        {/* Section 2: Role Archetype Cards (Mosaic) */}
        <RoleArchetypeCards roles={roles} onSelectRole={handleSelectRole} />

        {/* Section 3: High-Density Granular RBAC Matrix Table */}
        <RbacMatrixTable
          permissions={permissions}
          onUpdatePermission={updatePermission}
        />
      </div>

      {/* Role Configuration Drawer (Screen _33) */}
      <RoleDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCreateRole={createRole}
        selectedRole={selectedRole}
      />
    </div>
  );
};
