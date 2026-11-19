export type AdminDepartment = 
  | 'executive'
  | 'finance'
  | 'operations'
  | 'support'
  | 'security';

export type AdminStatus = 'active' | 'online' | 'restricted' | 'leave';

export type TwoFactorMethod = 
  | 'fido2'
  | 'authenticator'
  | 'sms_otp'
  | 'hardware_key';

export interface AdminSession {
  id: string;
  device: string;
  os: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AdminAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actionType: 'approval' | 'override' | 'security' | 'financial' | 'update';
  details: string;
  targetRef?: string;
  ipAddress: string;
  hash: string;
}

export interface AdminUser {
  id: string; // e.g., 'ADM-001'
  employeeCode: string; // e.g., 'ZG-EMP-8840-SD'
  name: string;
  arabicRoleTitle: string;
  englishRoleTitle: string;
  roleId: string;
  department: AdminDepartment;
  email: string;
  phone: string;
  status: AdminStatus;
  avatarUrl?: string;
  avatarInitials: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  twoFactorLabel: string;
  ipWhitelist?: string[];
  approvedDevice?: string;
  passwordDaysRemaining: number;
  joinedDate: string;
  workLocation: string;
  grantedCapabilities: string[];
  strictRestrictions: string[];
  activeSessions: AdminSession[];
  auditTrail: AdminAuditEntry[];
}

export interface RbacActionPermission {
  id: string;
  name: string;
  module: string;
  resource: string;
  description: string;
  impactLevel: 'critical' | 'high' | 'medium' | 'normal';
  requiresSoD: boolean;
  superAdmin: boolean;
  financialController: boolean;
  fleetDispatcher: boolean;
  supportLead: boolean;
  complianceOfficer: boolean;
}

export interface RoleArchetype {
  id: string;
  nameArabic: string;
  nameEnglish: string;
  department: AdminDepartment;
  description: string;
  activeMembersCount: number;
  permissionsCount: number;
  permissionsPercent: number;
  colorToken: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'surface-tint';
  riskLevel: 'high' | 'medium' | 'low';
  financialApprovalCapSdg?: number;
  requiresTwoFactor: boolean;
}

export interface AdminMetrics {
  totalAdmins: number;
  onlineNowCount: number;
  twoFactorCompliancePercent: number;
  restrictedCount: number;
  sensitiveActionsToday: number;
  sodCompliancePercent: number;
}
