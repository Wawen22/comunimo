'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: string | number;
  onClick?: () => void;
}

export function NavItem({ href, icon: Icon, label, badge, onClick }: NavItemProps) {
  const pathname = usePathname();

  // Special handling for /dashboard to avoid matching all sub-routes
  const isActive = href === '/dashboard'
    ? pathname === '/dashboard'
    : pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="relative">
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          'hover:scale-[1.02] active:scale-[0.98]',
          isActive
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
            : 'text-slate-700 hover:bg-white/60 hover:shadow-md hover:shadow-blue-500/10 backdrop-blur-sm'
        )}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
        )}

        {/* Icon with animation */}
        <Icon
          className={cn(
            "h-5 w-5 transition-all duration-200",
            isActive
              ? "scale-110"
              : "group-hover:scale-110 group-hover:rotate-3"
          )}
        />

        <span className="flex-1">{label}</span>

        {badge !== undefined && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold transition-all duration-200',
              isActive
                ? 'bg-white/20 text-white backdrop-blur-sm'
                : 'bg-blue-100 text-blue-700 group-hover:bg-blue-200'
            )}
          >
            {badge}
          </span>
        )}

        {/* Hover glow effect */}
        {!isActive && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
        )}
      </Link>

      {/* Subtle bottom separator dot */}
      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r from-blue-200/0 via-blue-300/30 to-blue-200/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
}

