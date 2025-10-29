'use client';

import { useState, useEffect, useTransition } from 'react';
import { supabase } from '@/lib/api/supabase';
import { RequireRole } from '@/components/auth/RequireRole';
import { UserManagementList } from '@/components/users/UserManagementList';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import type { Profile, Society } from '@/types/database';
import { useToast } from '@/components/ui/toast';
import { triggerPasswordReset } from '@/actions/users';
import { UserFormDialog } from '@/components/users/UserFormDialog';

export interface UserWithSocieties extends Profile {
  societies: Society[];
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserWithSocieties[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithSocieties | null>(null);
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [isResetPending, startResetTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all users (profiles)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // For each user, fetch their assigned societies
      const usersWithSocieties: UserWithSocieties[] = await Promise.all(
        (profiles || []).map(async (profile: Profile) => {
          const { data: userSocieties, error: userSocietiesError } = await supabase
            .from('user_societies')
            .select(`
              society_id,
              societies (
                id,
                name,
                society_code,
                is_active
              )
            `)
            .eq('user_id', profile.id);

          if (userSocietiesError) {
            console.error('Error fetching user societies:', userSocietiesError);
            return { ...profile, societies: [] };
          }

          const societies = (userSocieties || [])
            .map((us: any) => us.societies)
            .filter(Boolean);

          return { ...profile, societies };
        })
      );

      setUsers(usersWithSocieties);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento utenti');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (user: UserWithSocieties) => {
    setResettingUserId(user.id);
    startResetTransition(async () => {
      try {
        const result = await triggerPasswordReset({ userId: user.id });
        if (!result.success) {
          toast({
            title: 'Errore',
            description: result.error ?? 'Impossibile inviare il reset password',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Email inviata',
            description: result.message ?? 'Email di reset password inviata correttamente',
            variant: 'success',
          });
        }
      } finally {
        setResettingUserId(null);
      }
    });
  };

  return (
    <RequireRole role="super_admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8" />
              Gestione Utenti
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestisci gli utenti e le loro assegnazioni alle società
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo utente
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4 col-span-2 sm:col-span-1">
            <div className="text-sm font-medium text-gray-500">Totale Utenti</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{users.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 col-span-1">
            <div className="text-sm font-medium text-gray-500">Amministratori Società</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {users.filter(u => u.role === 'society_admin').length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 col-span-1">
            <div className="text-sm font-medium text-gray-500">Amministratori</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
            </div>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        ) : (
          <UserManagementList
            users={users}
            onUpdate={fetchUsers}
            onEditUser={setEditingUser}
            onResetPassword={handleResetPassword}
            resettingUserId={isResetPending ? resettingUserId : null}
          />
        )}

        <UserFormDialog
          mode="create"
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={fetchUsers}
        />

        {editingUser && (
          <UserFormDialog
            mode="edit"
            user={editingUser}
            open={Boolean(editingUser)}
            onOpenChange={(open) => {
              if (!open) setEditingUser(null);
            }}
            onSuccess={() => {
              setEditingUser(null);
              fetchUsers();
            }}
          />
        )}
      </div>
    </RequireRole>
  );
}
