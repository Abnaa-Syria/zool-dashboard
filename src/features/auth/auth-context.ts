import * as React from 'react';

export type AdminProfile = {
  id: string;
  employeeCode: string;
  displayName: string;
  status: string;
  isBootstrap: boolean;
  roles: Array<{ id: string; key: string; name: string }>;
  permissions: string[];
  identities: Array<{ type: string; value: string; isPrimary: boolean }>;
};

export type OtpChallenge = { challengeId: string; expiresAt: string; cooldownSeconds: number; devOtp?: string };

export type AuthState = {
  status: 'loading' | 'authenticated' | 'anonymous';
  admin: AdminProfile | null;
  requestOtp: (phone: string) => Promise<OtpChallenge>;
  verifyOtp: (input: { phone: string; code: string; challengeId: string }) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
};

export const AuthContext = React.createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
