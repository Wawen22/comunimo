'use client';

import { NavItem } from './NavItem';
import { RequireRole } from '@/components/auth/RequireRole';
import { ManagedSocietiesWidget } from './ManagedSocietiesWidget';
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  Trophy,
  Settings,
  Shield,
  UserCog,
  Megaphone,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay with backdrop blur */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transition-transform duration-300 lg:sticky lg:z-0 lg:translate-x-0',
          'bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20',
          'border-r border-blue-100/50 shadow-xl shadow-blue-500/5',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col relative">
          {/* Decorative gradient orb */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/15 to-pink-400/15 rounded-full blur-2xl pointer-events-none" />

          {/* Logo */}
          <div className="relative flex h-16 items-center px-6 border-b border-blue-100/50 bg-white/40 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                ComUniMo
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto p-4 relative z-10 scrollbar-thin scrollbar-thumb-blue-200/50 scrollbar-track-transparent">
            {/* Main Section */}
            <div className="space-y-1">
              <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-blue-500/60 flex items-center gap-2">
                <span>Menu Principale</span>
                <div className="h-px flex-1 bg-gradient-to-r from-blue-300/40 to-transparent" />
              </div>

              <NavItem
                href="/dashboard"
                icon={LayoutDashboard}
                label="Dashboard"
                onClick={onClose}
              />

              <NavItem
                href="/dashboard/societies"
                icon={Building2}
                label="Società gestite"
                onClick={onClose}
              />

              <NavItem
                href="/dashboard/members"
                icon={Users}
                label="Atleti gestiti"
                onClick={onClose}
              />
            </div>

            {/* Separator */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center px-3">
                <div className="w-full border-t border-gradient-to-r from-transparent via-blue-200/30 to-transparent" />
              </div>
              <div className="relative flex justify-center">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400/40 to-purple-400/40" />
              </div>
            </div>

            {/* Events & Competitions Section */}
            <div className="space-y-1">
              <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-purple-500/60 flex items-center gap-2">
                <span>Eventi & Gare</span>
                <div className="h-px flex-1 bg-gradient-to-r from-purple-300/40 to-transparent" />
              </div>

              <NavItem
                href="/dashboard/races/championships"
                icon={Trophy}
                label="Campionati"
                onClick={onClose}
                tourAnchor="nav-championships"
              />

              <NavItem
                href="/dashboard/events"
                icon={Calendar}
                label="Eventi"
                onClick={onClose}
              />
            </div>

            {/* Admin Section */}
            <RequireRole role="admin">
              {/* Separator */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center px-3">
                  <div className="w-full border-t border-gradient-to-r from-transparent via-blue-200/30 to-transparent" />
                </div>
                <div className="relative flex justify-center">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400/40 to-purple-400/40" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-blue-600/70 flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  <span>Amministrazione</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-300/50 to-transparent" />
                </div>

                <RequireRole role="super_admin">
                  <NavItem
                    href="/dashboard/admin/audit-log"
                    icon={ClipboardList}
                    label="Audit Log"
                    onClick={onClose}
                  />
                  <NavItem
                    href="/dashboard/users"
                    icon={UserCog}
                    label="Gestione Utenti"
                    onClick={onClose}
                  />
                </RequireRole>

                <NavItem
                  href="/dashboard/communications"
                  icon={Megaphone}
                  label="Comunicazioni"
                  onClick={onClose}
                />

                <NavItem
                  href="/dashboard/settings"
                  icon={Settings}
                  label="Impostazioni"
                  onClick={onClose}
                />

                <RequireRole role="super_admin">
                  <div className="mt-1">
                    <NavItem
                      href="/dashboard/admin"
                      icon={Shield}
                      label="Admin Panel"
                      onClick={onClose}
                    />
                  </div>
                </RequireRole>
              </div>
            </RequireRole>
          </nav>

          {/* Managed Societies Widget (for society_admin) */}
          <ManagedSocietiesWidget />

          {/* Footer */}
          <div className="relative z-10 border-t border-blue-100/50 bg-white/30 backdrop-blur-sm p-4">
            <div className="text-xs text-slate-600/80 space-y-1">
              <p className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                © {new Date().getFullYear()} ComUniMo
              </p>
              <p className="text-slate-500">
                Comitato Unitario Modena
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
