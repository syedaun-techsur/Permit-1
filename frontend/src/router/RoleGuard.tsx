import React from 'react';
import { useAuthStore } from '../store/auth.store';
import type { UserRole } from '../types/auth.types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-heading-xl text-feedback-error mb-2">403</h1>
          <p className="text-body-md text-text-secondary">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
