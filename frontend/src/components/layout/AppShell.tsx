import React, { useEffect } from 'react';
import { NavBar } from './NavBar';

interface AppShellProps {
  children: React.ReactNode;
  title?: string; // Optional page title suffix, e.g., permit.reference_number
}

export const AppShell: React.FC<AppShellProps> = ({ children, title }) => {
  useEffect(() => {
    document.title = title ? `${title} | Permit System` : 'Permit System';
  }, [title]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};
