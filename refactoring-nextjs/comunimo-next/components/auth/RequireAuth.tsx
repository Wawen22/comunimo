'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component that requires authentication
 * Redirects to login if user is not authenticated
 */
export function RequireAuth({
  children,
  redirectTo = '/login',
}: RequireAuthProps) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push(redirectTo);
    }
  }, [session, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}

