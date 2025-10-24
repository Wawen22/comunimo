'use client';

import { NavItem } from './NavItem';
import { RequireRole } from '@/components/auth/RequireRole';
import { ManagedSocietiesWidget } from './ManagedSocietiesWidget';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Calendar,
  Trophy,
  Settings,
  Shield,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 border-r border-gray-200 bg-white transition-transform duration-300 lg:sticky lg:z-0 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-gray-200 px-6">
            <h1 className="text-xl font-bold text-blue-900">ComUniMo</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            <NavItem
              href="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
            />

            <NavItem
              href="/dashboard/societies"
              icon={Building2}
              label="Società"
            />

            <NavItem href="/dashboard/members" icon={Users} label="Atleti" />

            <NavItem
              href="/dashboard/races/championships"
              icon={Trophy}
              label="Campionati"
            />

            <NavItem
              href="/dashboard/payments"
              icon={CreditCard}
              label="Pagamenti"
            />

            <NavItem href="/dashboard/events" icon={Calendar} label="Eventi" />

            {/* Admin Section */}
            <RequireRole role="admin">
              <div className="pt-4">
                <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Amministrazione
                </div>

                <NavItem
                  href="/dashboard/users"
                  icon={UserCog}
                  label="Gestione Utenti"
                />

                <NavItem
                  href="/dashboard/settings"
                  icon={Settings}
                  label="Impostazioni"
                />

                <RequireRole role="super_admin">
                  <NavItem
                    href="/dashboard/admin"
                    icon={Shield}
                    label="Admin Panel"
                  />
                </RequireRole>
              </div>
            </RequireRole>
          </nav>

          {/* Managed Societies Widget (for society_admin) */}
          <ManagedSocietiesWidget />

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <p className="text-xs text-gray-500">
              {/* Current year automatic */}
              © {new Date().getFullYear()} ComUniMo

              <br />
              Comitato Unitario Modena
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

