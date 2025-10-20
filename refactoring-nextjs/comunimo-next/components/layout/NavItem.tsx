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
}

export function NavItem({ href, icon: Icon, label, badge }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-semibold',
            isActive
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

