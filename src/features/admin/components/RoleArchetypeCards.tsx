import React from 'react';
import type { RoleArchetype } from '../types/admin';

interface RoleArchetypeCardsProps {
  roles: RoleArchetype[];
  onSelectRole: (role: RoleArchetype) => void;
}

export const RoleArchetypeCards: React.FC<RoleArchetypeCardsProps> = ({
  roles,
  onSelectRole,
}) => {
  const getTopBorderColor = (token: RoleArchetype['colorToken']) => {
    switch (token) {
      case 'primary':
        return 'bg-primary-container';
      case 'secondary':
        return 'bg-secondary';
      case 'tertiary':
        return 'bg-tertiary-container';
      case 'outline':
        return 'bg-outline';
      case 'surface-tint':
        return 'bg-surface-tint';
      default:
        return 'bg-secondary';
    }
  };

  const getRoleIcon = (id: string) => {
    switch (id) {
      case 'super-admin':
        return 'admin_panel_settings';
      case 'cfo':
        return 'payments';
      case 'fleet':
        return 'directions_bus';
      case 'support':
        return 'confirmation_number';
      case 'compliance':
        return 'verified_user';
      default:
        return 'shield_person';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-space-md mb-space-lg">
      {roles.map((role) => (
        <div
          key={role.id}
          className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow border border-surface-container-high/60"
        >
          {/* Top Accent Strip */}
          <div className={`absolute top-0 right-0 left-0 h-1.5 ${getTopBorderColor(role.colorToken)}`}></div>

          <div>
            <div className="flex items-center justify-between mb-3 pt-1">
              <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-md text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">group</span>
                {role.activeMembersCount} أعضاء
              </span>
              <span className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined text-[20px]">{getRoleIcon(role.id)}</span>
              </span>
            </div>

            <h3 className="font-headline-sm text-sm text-on-surface font-bold leading-snug">
              {role.nameArabic}
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant mt-2 line-clamp-3 leading-relaxed">
              {role.description}
            </p>
          </div>

          <div className="pt-3 mt-4 bg-surface-container-low/50 -mx-space-md -mb-space-md px-space-md pb-space-sm flex items-center justify-between border-t border-surface-container/60">
            <span className="font-label-md text-xs font-semibold text-secondary">
              {role.permissionsPercent}% الأذونات
            </span>
            <button
              type="button"
              onClick={() => onSelectRole(role)}
              className="text-on-surface-variant hover:text-secondary transition-colors font-label-md text-xs flex items-center gap-0.5 cursor-pointer"
            >
              <span>تعديل</span>
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
