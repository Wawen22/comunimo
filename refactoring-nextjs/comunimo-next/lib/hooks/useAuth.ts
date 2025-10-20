'use client';

import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/api/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

/**
 * Hook for managing authentication state
 * Provides session, user, and loading state
 * Automatically updates when auth state changes
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return authState;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { session, loading } = useAuth();
  return { isAuthenticated: !!session, loading };
}

