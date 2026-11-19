import { describe, it, expect } from 'vitest';
import { adminService } from './adminService';

describe('AdminService', () => {
  it('returns initial admin team with correct metrics', () => {
    const { users, metrics } = adminService.getAdminTeam();
    expect(users.length).toBeGreaterThanOrEqual(5);
    expect(metrics.totalAdmins).toBeGreaterThanOrEqual(6);
    expect(metrics.twoFactorCompliancePercent).toBe(100);
  });

  it('filters admin members by search query matching name or ID', () => {
    const { users } = adminService.getAdminTeam({ searchQuery: 'هشام' });
    expect(users.some((u) => u.id === 'ADM-004')).toBe(true);

    const { users: codeUsers } = adminService.getAdminTeam({ searchQuery: 'ADM-001' });
    expect(codeUsers.length).toBe(1);
    expect(codeUsers[0].name).toContain('أحمد السر');
  });

  it('filters admin members by department and role', () => {
    const { users } = adminService.getAdminTeam({ department: 'finance' });
    expect(users.every((u) => u.department === 'finance')).toBe(true);

    const { users: roleUsers } = adminService.getAdminTeam({ roleId: 'fleet' });
    expect(roleUsers.every((u) => u.roleId === 'fleet')).toBe(true);
  });

  it('retrieves detailed admin profile for ADM-004', () => {
    const user = adminService.getAdminUser('ADM-004');
    expect(user).toBeDefined();
    expect(user?.employeeCode).toBe('ZG-EMP-8840-SD');
    expect(user?.grantedCapabilities.length).toBeGreaterThanOrEqual(2);
    expect(user?.activeSessions.length).toBeGreaterThanOrEqual(1);
    expect(user?.auditTrail.length).toBeGreaterThanOrEqual(2);
  });

  it('terminates a specific admin session and all sessions', () => {
    const userBefore = adminService.getAdminUser('ADM-004');
    const sessionId = userBefore?.activeSessions[0]?.id;
    expect(sessionId).toBeDefined();

    if (sessionId) {
      const updated = adminService.terminateAdminSession('ADM-004', sessionId);
      expect(updated.activeSessions.some((s) => s.id === sessionId)).toBe(false);
    }

    const cleared = adminService.terminateAllAdminSessions('ADM-004');
    expect(cleared.activeSessions.length).toBe(0);
  });

  it('freezes and unfreezes an admin account with audit trail', () => {
    const frozen = adminService.freezeAdminAccount('ADM-004', 'تدقيق أمني احترازي');
    expect(frozen.status).toBe('restricted');
    expect(frozen.auditTrail[0].action).toContain('تجميد');

    const unfrozen = adminService.unfreezeAdminAccount('ADM-004');
    expect(unfrozen.status).toBe('active');
    expect(unfrozen.auditTrail[0].action).toContain('رفع التجميد');
  });

  it('invites a new admin user properly', () => {
    const newUser = adminService.inviteAdminUser({
      name: 'مهند تاج السر البشير',
      email: 'mohanad.taj@zoolgo.sd',
      phone: '+249 912 999 888',
      roleId: 'cfo',
      department: 'finance',
      workLocation: 'بورتسودان - الميناء البري',
    });

    expect(newUser.id).toMatch(/^ADM-\d+/);
    expect(newUser.name).toBe('مهند تاج السر البشير');
    expect(newUser.twoFactorEnabled).toBe(true);
  });

  it('creates role archetype and updates RBAC permission', () => {
    const newRole = adminService.createRoleArchetype({
      nameArabic: 'مدقق تسويات وضمان الجودة المالية',
      nameEnglish: 'Settlements Quality Auditor',
      department: 'finance',
      description: 'متابعة وتدقيق حركات شحن محافظ الوكلاء وتأكيد تسويات مبيعات تذاكر الحافلات.',
      colorToken: 'secondary',
      financialApprovalCapSdg: 250000,
    });

    expect(newRole.id).toBe('settlements-quality-auditor');
    expect(newRole.financialApprovalCapSdg).toBe(250000);

    const updatedPerm = adminService.updateRbacPermission('perm-fin-01', {
      fleetDispatcher: true,
    });
    expect(updatedPerm.fleetDispatcher).toBe(true);
  });

  it('exports admin team to UTF-8 BOM CSV', () => {
    const csv = adminService.exportAdminTeamCsv();
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('هشام كمال الدين الفكي');
    expect(csv).toContain('ZG-EMP-8840-SD');
  });
});
