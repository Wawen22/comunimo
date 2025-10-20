'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/api/supabase';
import { useUser } from '@/lib/hooks/useUser';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/toast';
import { User, Settings, LogOut } from 'lucide-react';
import { getRoleDisplayName } from '@/lib/utils/permissions';

export function UserMenu() {
  const router = useRouter();
  const { profile } = useUser();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Logout effettuato',
        description: 'A presto!',
        variant: 'success',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante il logout',
        variant: 'destructive',
      });
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-100">
          <Avatar
            fallback={profile.full_name || profile.email}
            className="h-8 w-8"
          />
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-gray-900">
              {profile.full_name || 'Utente'}
            </p>
            <p className="text-xs text-gray-500">
              {getRoleDisplayName(profile.role)}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">
              {profile.full_name || 'Utente'}
            </p>
            <p className="text-xs text-gray-500">{profile.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={() => router.push('/dashboard/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profilo</span>
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => router.push('/dashboard/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Impostazioni</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

