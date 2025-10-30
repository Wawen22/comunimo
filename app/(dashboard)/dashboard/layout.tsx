'use client';

import { useState } from 'react';
import { ToastProvider } from '@/components/ui/toast';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { GuidedTourProvider } from '@/components/guided-tour/GuidedTourProvider';
import { GuidedRegistrationTourManager } from '@/components/dashboard/guided-registration/GuidedRegistrationTourManager';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <RequireAuth>
        <GuidedTourProvider>
          <GuidedRegistrationTourManager />
          <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Header */}
              <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

              {/* Page content */}
              <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </GuidedTourProvider>
      </RequireAuth>
    </ToastProvider>
  );
}
