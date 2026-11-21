import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth-context';

/** Gate for the whole admin shell: shows a loader while the session is restored. */
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface-variant" dir="rtl">
        <span className="material-symbols-outlined animate-spin text-secondary me-2">progress_activity</span>
        جارٍ التحقق من الجلسة…
      </div>
    );
  }
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <>{children}</>;
};

/** Hides children unless the admin holds the permission (UI only — the API enforces it too). */
export const Can: React.FC<{ permission: string; children: React.ReactNode; fallback?: React.ReactNode }> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { can } = useAuth();
  return <>{can(permission) ? children : fallback}</>;
};
