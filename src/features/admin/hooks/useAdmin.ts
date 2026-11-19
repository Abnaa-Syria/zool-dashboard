import { useState, useCallback } from 'react';
import type {
  AdminUser,
  AdminMetrics,
  AdminDepartment,
  RoleArchetype,
  RbacActionPermission,
} from '../types/admin';
import { adminService, type AdminFilters } from '../services/adminService';

export function useAdminTeam(initialFilters: AdminFilters = {}) {
  const [filters, setFilters] = useState<AdminFilters>(initialFilters);
  const [data, setData] = useState<{ users: AdminUser[]; metrics: AdminMetrics }>(() =>
    adminService.getAdminTeam(initialFilters)
  );

  const applyFilters = useCallback((newFilters: Partial<AdminFilters>) => {
    setFilters((prev) => {
      const merged = { ...prev, ...newFilters };
      setData(adminService.getAdminTeam(merged));
      return merged;
    });
  }, []);

  const refresh = useCallback(() => {
    setData(adminService.getAdminTeam(filters));
  }, [filters]);

  const inviteUser = useCallback(
    (userData: {
      name: string;
      email: string;
      phone: string;
      roleId: string;
      department: AdminDepartment;
      workLocation: string;
    }) => {
      const user = adminService.inviteAdminUser(userData);
      refresh();
      return user;
    },
    [refresh]
  );

  const freezeAccount = useCallback(
    (userId: string, reason: string) => {
      const user = adminService.freezeAdminAccount(userId, reason);
      refresh();
      return user;
    },
    [refresh]
  );

  const unfreezeAccount = useCallback(
    (userId: string) => {
      const user = adminService.unfreezeAdminAccount(userId);
      refresh();
      return user;
    },
    [refresh]
  );

  const exportCsv = useCallback(() => {
    const csvContent = adminService.exportAdminTeamCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zoolgo_admin_team_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    users: data.users,
    metrics: data.metrics,
    filters,
    applyFilters,
    refresh,
    inviteUser,
    freezeAccount,
    unfreezeAccount,
    exportCsv,
  };
}

export function useAdminUser(userId: string) {
  const [user, setUser] = useState<AdminUser | undefined>(() =>
    adminService.getAdminUser(userId)
  );

  const refresh = useCallback(() => {
    setUser(adminService.getAdminUser(userId));
  }, [userId]);

  const updateUser = useCallback(
    (updates: Partial<AdminUser>) => {
      const updated = adminService.updateAdminUser(userId, updates);
      setUser(updated);
      return updated;
    },
    [userId]
  );

  const terminateSession = useCallback(
    (sessionId: string) => {
      const updated = adminService.terminateAdminSession(userId, sessionId);
      setUser(updated);
      return updated;
    },
    [userId]
  );

  const terminateAllSessions = useCallback(() => {
    const updated = adminService.terminateAllAdminSessions(userId);
    setUser(updated);
    return updated;
  }, [userId]);

  const freezeAccount = useCallback(
    (reason: string) => {
      const updated = adminService.freezeAdminAccount(userId, reason);
      setUser(updated);
      return updated;
    },
    [userId]
  );

  const unfreezeAccount = useCallback(() => {
    const updated = adminService.unfreezeAdminAccount(userId);
    setUser(updated);
    return updated;
  }, [userId]);

  return {
    user,
    refresh,
    updateUser,
    terminateSession,
    terminateAllSessions,
    freezeAccount,
    unfreezeAccount,
  };
}

export function useRbacGovernance() {
  const [roles, setRoles] = useState<RoleArchetype[]>(() =>
    adminService.getRoleArchetypes()
  );
  const [permissions, setPermissions] = useState<RbacActionPermission[]>(() =>
    adminService.getRbacMatrix()
  );

  const refresh = useCallback(() => {
    setRoles([...adminService.getRoleArchetypes()]);
    setPermissions([...adminService.getRbacMatrix()]);
  }, []);

  const createRole = useCallback(
    (roleData: {
      nameArabic: string;
      nameEnglish: string;
      department: AdminDepartment;
      description: string;
      colorToken: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'surface-tint';
      financialApprovalCapSdg?: number;
      riskLevel?: 'high' | 'medium' | 'low';
    }) => {
      const newRole = adminService.createRoleArchetype(roleData);
      refresh();
      return newRole;
    },
    [refresh]
  );

  const updatePermission = useCallback(
    (permissionId: string, updates: Partial<RbacActionPermission>) => {
      const updated = adminService.updateRbacPermission(permissionId, updates);
      setPermissions([...adminService.getRbacMatrix()]);
      return updated;
    },
    []
  );

  return {
    roles,
    permissions,
    refresh,
    createRole,
    updatePermission,
  };
}
