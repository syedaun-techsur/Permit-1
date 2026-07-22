import React from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col h-screen">
    <TopBar />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-surface-base p-6">
        {children}
      </main>
    </div>
  </div>
);
