import React, { useEffect } from 'react';
import { NavBar } from './NavBar';
import { SessionExpiryWarning } from '../auth/SessionExpiryWarning';

interface AppShellProps {
  children: React.ReactNode;
  title?: string; // Optional page title suffix, e.g., permit.reference_number
}

export const AppShell: React.FC<AppShellProps> = ({ children, title }) => {
  useEffect(() => {
    document.title = title
      ? `${title} — Permit Management System`
      : 'Permit Management System';
  }, [title]);

  return (
    <>
      {/* Skip link — visually hidden until focused */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Session expiry warning — renders null until 60s before token expiry */}
      <SessionExpiryWarning />

      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main id="main-content" tabIndex={-1} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 outline-none">
          {children}
        </main>
      </div>
    </>
  );
};
