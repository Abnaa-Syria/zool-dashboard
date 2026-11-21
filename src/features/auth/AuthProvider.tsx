import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, onSessionChange, refreshSession, setAccessToken } from '../../lib/api/client';
import { AuthContext, type AdminProfile, type AuthState, type OtpChallenge } from './auth-context';

type TokensDto = { accessToken: string; admin: AdminProfile };

/** Restores the session from the refresh cookie on load, and exposes login/logout + permissions. */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = React.useState<AuthState['status']>('loading');
  const [admin, setAdmin] = React.useState<AdminProfile | null>(null);

  React.useEffect(() => {
    const off = onSessionChange((event, payload) => {
      if (event === 'refreshed') {
        const data = payload as Partial<TokensDto> | undefined;
        if (data?.admin) setAdmin(data.admin);
        setStatus('authenticated');
      } else {
        setAccessToken(null);
        setAdmin(null);
        setStatus('anonymous');
        queryClient.clear();
      }
    });
    let cancelled = false;
    refreshSession().then((ok) => {
      if (!cancelled && !ok) setStatus('anonymous');
    });
    return () => {
      cancelled = true;
      off();
    };
  }, [queryClient]);

  const refreshProfile = React.useCallback(async () => {
    // A stale token (authz version bumped) is refreshed and retried by the API client.
    const { data } = await api.get<AdminProfile>('/auth/me');
    setAdmin(data);
  }, []);

  const value = React.useMemo<AuthState>(() => {
    const permissions = new Set(admin?.permissions ?? []);
    return {
      status,
      admin,
      can: (p) => permissions.has(p),
      refreshProfile,
      requestOtp: async (phone) => (await api.post<OtpChallenge>('/auth/otp/request', { phone }, { noRetry: true })).data,
      verifyOtp: async (input) => {
        const { data } = await api.post<TokensDto>('/auth/otp/verify', input, { noRetry: true });
        setAccessToken(data.accessToken);
        setAdmin(data.admin);
        setStatus('authenticated');
      },
      logout: async () => {
        try {
          await api.post('/auth/logout', {}, { noRetry: true });
        } finally {
          setAccessToken(null);
          setAdmin(null);
          setStatus('anonymous');
          queryClient.clear();
        }
      },
    };
  }, [status, admin, queryClient, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
