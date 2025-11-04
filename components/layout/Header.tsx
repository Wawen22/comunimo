'use client';

import { UserMenu } from './UserMenu';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { usePathname } from 'next/navigation';
import { GuidedRegistrationLauncher } from '@/components/dashboard/guided-registration/GuidedRegistrationLauncher';

interface HeaderProps {
  onMenuClick: () => void;
}

// Get page title from pathname
function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  const titles: Record<string, string> = {
    'dashboard': 'Dashboard',
    'societies': 'Società',
    'members': 'Atleti',
    'championships': 'Campionati',
    'events': 'Eventi',
    'users': 'Gestione Utenti',
    'communications': 'Comunicazioni',
    'settings': 'Impostazioni',
    'admin': 'Admin Panel',
    'profile': 'Profilo',
  };

  return (lastSegment && titles[lastSegment]) || 'Dashboard';
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-blue-100/50 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/20 backdrop-blur-md px-4 lg:px-6 shadow-sm shadow-blue-500/5">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden hover:bg-white/60 hover:scale-105 transition-all duration-200 rounded-xl"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5 text-slate-700" />
      </Button>

      {/* Page Title - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
          {pageTitle}
        </h2>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        <GuidedRegistrationLauncher orientation="horizontal" className="hidden md:flex" />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
