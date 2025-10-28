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
        <button className="flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-white/60 hover:scale-105 hover:shadow-md hover:shadow-blue-500/10 group">
          <Avatar
            fallback={profile.full_name || profile.email}
            className="h-8 w-8 ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all duration-200"
          />
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {profile.full_name || 'Utente'}
            </p>
            <p className="text-xs text-slate-500">
              {getRoleDisplayName(profile.role)}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 border-blue-100/50 shadow-xl shadow-blue-500/10">
        <DropdownMenuLabel className="bg-gradient-to-r from-blue-50 to-purple-50/30">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
              {profile.full_name || 'Utente'}
            </p>
            <p className="text-xs text-slate-600">{profile.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-blue-200/30 to-transparent" />

        <DropdownMenuItem
          onSelect={() => router.push('/dashboard/profile')}
          className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50/30 transition-all duration-200"
        >
          <User className="mr-2 h-4 w-4 text-blue-600" />
          <span>Profilo</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => router.push('/dashboard/settings')}
          className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50/30 transition-all duration-200"
        >
          <Settings className="mr-2 h-4 w-4 text-purple-600" />
          <span>Impostazioni</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-blue-200/30 to-transparent" />

        <DropdownMenuItem
          onSelect={handleLogout}
          className="cursor-pointer hover:bg-red-50 transition-all duration-200 text-red-600 focus:text-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

