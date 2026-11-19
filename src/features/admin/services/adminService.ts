import type {
  AdminUser,
  RoleArchetype,
  RbacActionPermission,
  AdminMetrics,
  AdminDepartment,
} from '../types/admin';
import {
  initialAdminMetrics,
  initialRoleArchetypes,
  initialRbacPermissions,
  initialAdminUsers,
} from '../fixtures/adminFixtures';

export interface AdminFilters {
  searchQuery?: string;
  roleId?: string;
  status?: string;
  department?: string;
}

class AdminService {
  private users: AdminUser[] = [...initialAdminUsers];
  private roles: RoleArchetype[] = [...initialRoleArchetypes];
  private permissions: RbacActionPermission[] = [...initialRbacPermissions];
  private metrics: AdminMetrics = { ...initialAdminMetrics };

  public getAdminTeam(filters: AdminFilters = {}): { users: AdminUser[]; metrics: AdminMetrics } {
    let filtered = [...this.users];

    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q) ||
          u.employeeCode.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.includes(q)
      );
    }

    if (filters.roleId && filters.roleId !== 'all') {
      filtered = filtered.filter((u) => u.roleId === filters.roleId);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((u) => u.status === filters.status);
    }

    if (filters.department && filters.department !== 'all') {
      filtered = filtered.filter((u) => u.department === filters.department);
    }

    // Refresh dynamic metrics
    const totalAdmins = this.users.length;
    const onlineNowCount = this.users.reduce(
      (acc, u) => acc + (u.activeSessions.some((s) => s.isCurrent || s.lastActive.includes('نشط') || s.lastActive.includes('الآن')) ? 1 : 0),
      0
    );
    const restrictedCount = this.users.filter((u) => u.status === 'restricted' || u.status === 'leave').length;
    const twoFactorCount = this.users.filter((u) => u.twoFactorEnabled).length;
    const twoFactorCompliancePercent = Math.round((twoFactorCount / (totalAdmins || 1)) * 100);

    const metrics: AdminMetrics = {
      ...this.metrics,
      totalAdmins,
      onlineNowCount: Math.max(onlineNowCount, 7),
      twoFactorCompliancePercent,
      restrictedCount,
    };

    return { users: filtered, metrics };
  }

  public getAdminUser(id: string): AdminUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  public updateAdminUser(id: string, updates: Partial<AdminUser>): AdminUser {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`Admin user not found: ${id}`);
    }

    const auditTrail = updates.auditTrail
      ? updates.auditTrail
      : [
          {
            id: `aud-update-${Date.now()}`,
            timestamp: 'الآن',
            action: 'تعديل بيانات الحساب الإداري',
            actionType: 'update' as const,
            details: 'تم تحديث بيانات ومحددات الحساب الإشرافي عبر البوابة المركزية.',
            ipAddress: '196.29.112.10',
            hash: `SHA256:${Math.random().toString(36).substring(2, 10)}`,
          },
          ...this.users[index].auditTrail,
        ];

    const updated: AdminUser = {
      ...this.users[index],
      ...updates,
      auditTrail,
    };

    this.users[index] = updated;
    return updated;
  }

  public terminateAdminSession(userId: string, sessionId: string): AdminUser {
    const user = this.getAdminUser(userId);
    if (!user) throw new Error(`User not found: ${userId}`);

    const updatedSessions = user.activeSessions.filter((s) => s.id !== sessionId);
    return this.updateAdminUser(userId, {
      activeSessions: updatedSessions,
      status: updatedSessions.length === 0 ? 'active' : user.status,
    });
  }

  public terminateAllAdminSessions(userId: string): AdminUser {
    return this.updateAdminUser(userId, {
      activeSessions: [],
      status: 'active',
    });
  }

  public freezeAdminAccount(userId: string, reason: string): AdminUser {
    const user = this.getAdminUser(userId);
    if (!user) throw new Error(`User not found: ${userId}`);

    return this.updateAdminUser(userId, {
      status: 'restricted',
      activeSessions: [],
      auditTrail: [
        {
          id: `aud-freeze-${Date.now()}`,
          timestamp: 'الآن',
          action: 'تجميد الحساب الإداري احترازياً',
          actionType: 'security',
          details: `تم تجميد الحساب: ${reason}`,
          ipAddress: '196.29.112.10',
          hash: `SHA256:${Math.random().toString(36).substring(2, 10)}`,
        },
        ...user.auditTrail,
      ],
    });
  }

  public unfreezeAdminAccount(userId: string): AdminUser {
    const user = this.getAdminUser(userId);
    if (!user) throw new Error(`User not found: ${userId}`);

    return this.updateAdminUser(userId, {
      status: 'active',
      auditTrail: [
        {
          id: `aud-unfreeze-${Date.now()}`,
          timestamp: 'الآن',
          action: 'رفع التجميد وإعادة تنشيط الحساب',
          actionType: 'security',
          details: 'تم إلغاء التجميد واستعادة صلاحيات الوصول بموجب اعتماد المشرف العام.',
          ipAddress: '196.29.112.10',
          hash: `SHA256:${Math.random().toString(36).substring(2, 10)}`,
        },
        ...user.auditTrail,
      ],
    });
  }

  public inviteAdminUser(data: {
    name: string;
    email: string;
    phone: string;
    roleId: string;
    department: AdminDepartment;
    workLocation: string;
  }): AdminUser {
    const nextNum = this.users.length + 1;
    const id = `ADM-${String(nextNum).padStart(3, '0')}`;
    const employeeCode = `ZG-EMP-${Math.floor(1000 + Math.random() * 9000)}-SD`;
    const role = this.roles.find((r) => r.id === data.roleId);

    const newUser: AdminUser = {
      id,
      employeeCode,
      name: data.name,
      arabicRoleTitle: role ? role.nameArabic : 'مشرف إداري جديد',
      englishRoleTitle: role ? role.nameEnglish : 'New Administrative Supervisor',
      roleId: data.roleId,
      department: data.department,
      email: data.email,
      phone: data.phone,
      status: 'active',
      avatarInitials: data.name.trim().charAt(0) || 'أ',
      twoFactorEnabled: true,
      twoFactorMethod: 'authenticator',
      twoFactorLabel: 'مفتاح التحقق الثنائي (إلزامي)',
      ipWhitelist: ['196.29.112.0/24'],
      passwordDaysRemaining: 90,
      joinedDate: 'اليوم',
      workLocation: data.workLocation || 'الخرطوم (المقر الرئيسي)',
      grantedCapabilities: [
        'أذونات العمل المعتمدة وفق الدور الوظيفي المختار.',
        'متابعة مهام النظام الموكلة وتوثيق العمليات الإدارية.',
      ],
      strictRestrictions: [
        'يخضع لقواعد الفصل بين المهام (SoD) والحوكمة المعتمدة.',
      ],
      activeSessions: [],
      auditTrail: [
        {
          id: `aud-create-${Date.now()}`,
          timestamp: 'الآن',
          action: 'إنشاء حساب إشرافي جديد',
          actionType: 'security',
          details: `تم إنشاء الحساب وإرسال دعوة التفعيل المشفرة إلى ${data.email}`,
          ipAddress: '196.29.112.10',
          hash: `SHA256:${Math.random().toString(36).substring(2, 10)}`,
        },
      ],
    };

    this.users.unshift(newUser);
    return newUser;
  }

  public getRoleArchetypes(): RoleArchetype[] {
    return this.roles;
  }

  public createRoleArchetype(roleData: {
    nameArabic: string;
    nameEnglish: string;
    department: AdminDepartment;
    description: string;
    colorToken: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'surface-tint';
    financialApprovalCapSdg?: number;
    riskLevel?: 'high' | 'medium' | 'low';
  }): RoleArchetype {
    const id = roleData.nameEnglish.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newRole: RoleArchetype = {
      id,
      nameArabic: roleData.nameArabic,
      nameEnglish: roleData.nameEnglish,
      department: roleData.department,
      description: roleData.description,
      activeMembersCount: 0,
      permissionsCount: 22,
      permissionsPercent: 42.3,
      colorToken: roleData.colorToken,
      riskLevel: roleData.riskLevel || 'medium',
      financialApprovalCapSdg: roleData.financialApprovalCapSdg,
      requiresTwoFactor: true,
    };

    this.roles.push(newRole);
    return newRole;
  }

  public getRbacMatrix(): RbacActionPermission[] {
    return this.permissions;
  }

  public updateRbacPermission(
    permissionId: string,
    updates: Partial<RbacActionPermission>
  ): RbacActionPermission {
    const index = this.permissions.findIndex((p) => p.id === permissionId);
    if (index === -1) throw new Error(`Permission not found: ${permissionId}`);

    const updated = {
      ...this.permissions[index],
      ...updates,
    };
    this.permissions[index] = updated;
    return updated;
  }

  public exportAdminTeamCsv(): string {
    const BOM = '\uFEFF';
    const headers = [
      'الكود الوظيفي',
      'معرف المشرف',
      'الاسم الكامل',
      'الدور الوظيفي',
      'القسم',
      'البريد الإلكتروني',
      'رقم الهاتف',
      'حالة الحساب',
      'التحقق الثنائي 2FA',
      'مقر العمل',
      'تاريخ الانضمام',
    ];

    const rows = this.users.map((u) => [
      `"${u.employeeCode}"`,
      `"${u.id}"`,
      `"${u.name}"`,
      `"${u.arabicRoleTitle}"`,
      `"${u.department}"`,
      `"${u.email}"`,
      `"${u.phone}"`,
      `"${u.status === 'online' ? 'متصل الآن' : u.status === 'active' ? 'نشط' : 'مقيد/معلق'}"`,
      `"${u.twoFactorEnabled ? 'مفعل (' + u.twoFactorLabel + ')' : 'معطل'}"`,
      `"${u.workLocation}"`,
      `"${u.joinedDate}"`,
    ]);

    return BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }
}

export const adminService = new AdminService();
