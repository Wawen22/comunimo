'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/api/supabase';
import type { Profile, Society } from '@/lib/types/database';
import { getUserSocieties } from '@/lib/utils/userSocietyUtils';

interface UserState {
  profile: Profile | null;
  societies: Society[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching and managing user profile data
 * Fetches profile from the profiles table based on authenticated user
 * Also fetches user's assigned societies
 */
export function useUser() {
  const [userState, setUserState] = useState<UserState>({
    profile: null,
    societies: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setUserState({ profile: null, societies: [], loading: false, error: null });
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Fetch user societies
        const societies = await getUserSocieties(user.id);

        setUserState({ profile, societies, loading: false, error: null });
      } catch (error) {
        setUserState({
          profile: null,
          societies: [],
          loading: false,
          error: error as Error,
        });
      }
    }

    fetchProfile();

    // Listen for auth changes and refetch profile
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  return userState;
}

/**
 * Hook to check if current user is admin
 */
export function useIsAdmin(): boolean {
  const { profile } = useUser();
  return profile?.role === 'admin' || profile?.role === 'super_admin';
}

/**
 * Hook to check if current user is super admin
 */
export function useIsSuperAdmin(): boolean {
  const { profile } = useUser();
  return profile?.role === 'super_admin';
}

/**
 * Hook to check if current user has a specific role
 */
export function useHasRole(role: 'society_admin' | 'admin' | 'super_admin'): boolean {
  const { profile } = useUser();

  if (!profile) return false;

  // Role hierarchy: super_admin > admin > society_admin
  const roleHierarchy = {
    society_admin: 1,
    admin: 2,
    super_admin: 3,
  };

  return roleHierarchy[profile.role] >= roleHierarchy[role];
}

/**
 * Hook to get user's societies
 */
export function useUserSocieties(): Society[] {
  const { societies } = useUser();
  return societies;
}
