import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api/client';
import { errorMessage } from '../../lib/api/errors';

/* ------------------------------------------------------------------ DTOs */

export type AdminStatus = 'ACTIVE' | 'SUSPENDED';

/** GET /admins, GET /admins/:id (backend `admins.service` toDto). */
export type AdminUser = {
  id: string;
  employeeCode: string;
  displayName: string;
  status: AdminStatus | string;
  isBootstrap: boolean;
  authzVersion: number;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  identities: Array<{ type: string; value: string; isPrimary: boolean }>;
  roles: Array<{ id: string; key: string; name: string }>;
};

/** GET /roles (backend `roles.service` toDto). */
export type Role = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  memberCount: number;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};

/** GET /permissions (DB catalog). */
export type Permission = { id: string; key: string; module: string; description: string | null };

/** GET /sessions (active refresh sessions; tokenHash never exposed). */
export type AdminSession = {
  id: string;
  adminUserId: string;
  familyId: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string | null;
};

/** GET /audit-logs. */
export type AuditLog = {
  id: string;
  actorAdminId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  requestId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  metadata: unknown;
};

export type AuditFilters = {
  page?: number;
  pageSize?: number;
  actorAdminId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  requestId?: string;
  /** ISO date-time (inclusive). */
  from?: string;
  /** ISO date-time (inclusive). */
  to?: string;
};

export type SettingValue = number | boolean | string;

/** GET /admin/settings (D-SET-02). */
export type SystemSetting = {
  key: string;
  type: 'integer' | 'boolean' | 'string';
  description: string;
  value: SettingValue;
  defaultValue: SettingValue;
  isDefault: boolean;
  min?: number;
  max?: number;
  options?: string[];
  updatedAt: string | null;
  updatedBy: { id: string; displayName: string } | null;
};

/* ------------------------------------------------------------ query keys */

export const adminKeys = {
  all: ['sys-admins'] as const,
  list: (f: { page: number; pageSize: number }) => [...adminKeys.all, 'list', f] as const,
  detail: (id: string) => [...adminKeys.all, 'detail', id] as const,
  sessions: (adminId: string) => ['sys-sessions', adminId] as const,
};

export const roleKeys = {
  all: ['sys-roles'] as const,
  permissions: ['sys-permissions'] as const,
};

export const auditKeys = {
  all: ['sys-audit'] as const,
  list: (f: AuditFilters) => [...auditKeys.all, 'list', f] as const,
};

export const settingsKeys = { all: ['sys-settings'] as const };

/* --------------------------------------------------------------- admins */

export function useAdmins(params: { page: number; pageSize: number }, enabled = true) {
  return useQuery({
    queryKey: adminKeys.list(params),
    queryFn: ({ signal }) => api.get<AdminUser[]>('/admins', params, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useAdmin(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.detail(id ?? ''),
    queryFn: ({ signal }) => api.get<AdminUser>(`/admins/${id}`, undefined, signal).then((r) => r.data),
    enabled: Boolean(id),
  });
}

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { displayName: string; employeeCode: string; phone: string; roleIds: string[] }) =>
      api.post<AdminUser>('/admins', input).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
      qc.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

/** Writes the fresh DTO into the detail cache and refreshes lists. */
function useAdminMutation<V>(fn: (vars: V) => Promise<AdminUser>, extraKeys: ReadonlyArray<readonly unknown[]> = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (admin) => {
      qc.setQueryData(adminKeys.detail(admin.id), admin);
      qc.invalidateQueries({ queryKey: adminKeys.all });
      for (const key of extraKeys) qc.invalidateQueries({ queryKey: key });
    },
  });
}

export function useUpdateAdminProfile() {
  return useAdminMutation((v: { id: string; displayName: string }) =>
    api.patch<AdminUser>(`/admins/${v.id}`, { displayName: v.displayName }).then((r) => r.data),
  );
}

export function useUpdateAdminStatus() {
  return useAdminMutation(
    (v: { id: string; status: AdminStatus }) => api.patch<AdminUser>(`/admins/${v.id}/status`, { status: v.status }).then((r) => r.data),
    [['sys-sessions'], auditKeys.all],
  );
}

export function useSetAdminRoles() {
  return useAdminMutation(
    (v: { id: string; roleIds: string[] }) => api.put<AdminUser>(`/admins/${v.id}/roles`, { roleIds: v.roleIds }).then((r) => r.data),
    [roleKeys.all],
  );
}

export function useRevokeAllSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (adminId: string) =>
      api.post<{ revokedCount: number }>(`/admins/${adminId}/sessions/revoke-all`).then((r) => r.data),
    onSuccess: (_d, adminId) => {
      qc.invalidateQueries({ queryKey: adminKeys.sessions(adminId) });
      qc.invalidateQueries({ queryKey: adminKeys.detail(adminId) });
    },
  });
}

/* ------------------------------------------------------------- sessions */

export function useAdminSessions(adminId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: adminKeys.sessions(adminId ?? ''),
    queryFn: ({ signal }) => api.get<AdminSession[]>('/sessions', { adminId, pageSize: 50 }, signal),
    enabled: enabled && Boolean(adminId),
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { sessionId: string; adminId: string }) => api.delete<{ revoked: boolean }>(`/sessions/${v.sessionId}`),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: adminKeys.sessions(v.adminId) }),
  });
}

/* ---------------------------------------------------------------- roles */

export function useRoles(enabled = true) {
  return useQuery({
    queryKey: roleKeys.all,
    queryFn: ({ signal }) => api.get<Role[]>('/roles', undefined, signal).then((r) => r.data),
    enabled,
  });
}

export function usePermissionCatalog(enabled = true) {
  return useQuery({
    queryKey: roleKeys.permissions,
    queryFn: ({ signal }) => api.get<Permission[]>('/permissions', undefined, signal).then((r) => r.data),
    staleTime: 10 * 60_000,
    enabled,
  });
}

function useRoleMutation<V, R>(fn: (vars: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.all });
      // Member DTOs embed role names.
      qc.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useCreateRole() {
  return useRoleMutation((v: { key: string; name: string; description?: string; permissionKeys: string[] }) =>
    api.post<Role>('/roles', v).then((r) => r.data),
  );
}

export function useUpdateRole() {
  return useRoleMutation((v: { id: string; name?: string; description?: string | null; isActive?: boolean }) => {
    const { id, ...body } = v;
    return api.patch<Role>(`/roles/${id}`, body).then((r) => r.data);
  });
}

export function useSetRolePermissions() {
  return useRoleMutation((v: { id: string; permissionKeys: string[] }) =>
    api.put<Role>(`/roles/${v.id}/permissions`, { permissionKeys: v.permissionKeys }).then((r) => r.data),
  );
}

export function useDeleteRole() {
  return useRoleMutation((id: string) => api.delete<{ deleted: boolean }>(`/roles/${id}`).then((r) => r.data));
}

/* ---------------------------------------------------------------- audit */

export function useAuditLogs(filters: AuditFilters, enabled = true) {
  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: ({ signal }) => api.get<AuditLog[]>('/audit-logs', filters, signal),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/* ------------------------------------------------------------- settings */

export function useSystemSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: ({ signal }) => api.get<SystemSetting[]>('/admin/settings', undefined, signal).then((r) => r.data),
  });
}

export function useUpdateSystemSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: Record<string, SettingValue>) =>
      api.patch<SystemSetting[]>('/admin/settings', { values }).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(settingsKeys.all, data);
      qc.invalidateQueries({ queryKey: auditKeys.all });
    },
  });
}

/* --------------------------------------------------------------- errors */

/** Admin-module specific messages on top of the shared `errorMessage`. */
export function adminErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === 'BOOTSTRAP_PROTECTED') {
      if (/delete system role/i.test(err.message)) return 'لا يمكن حذف دور نظامي.';
      if (/deactivate/i.test(err.message)) return 'لا يمكن تعطيل دور المدير العام (Super Admin).';
      if (/retain/i.test(err.message)) return 'المدير العام التأسيسي يجب أن يحتفظ بدور Super Admin.';
      return 'إجراء محظور: لا يمكن إيقاف آخر مدير عام تأسيسي نشط حتى لا يُغلق النظام أمام الجميع.';
    }
    if (err.code === 'CONFLICT') {
      if (/own account/i.test(err.message)) return 'لا يمكنك إيقاف حسابك الشخصي.';
      if (/phone/i.test(err.message)) return 'رقم الهاتف أو الرقم الوظيفي مسجل لمشرف آخر.';
      if (/role key/i.test(err.message)) return 'مفتاح الدور مستخدم بالفعل.';
    }
    if (err.code === 'VALIDATION_ERROR') {
      if (/roles are invalid/i.test(err.message)) return 'دور أو أكثر غير صالح أو غير نشط.';
      if (/permission keys are invalid/i.test(err.message)) return 'صلاحية أو أكثر غير معروفة.';
      const field = (err.details as { field?: string } | null)?.field;
      if (field) return `قيمة غير صالحة (${field}): ${err.message}`;
    }
  }
  return errorMessage(err);
}
