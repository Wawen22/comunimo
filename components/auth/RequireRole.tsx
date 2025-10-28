'use client';

import { ReactNode } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { hasRole, canPerform, type PermissionAction } from '@/lib/utils/permissions';
import type { UserRole } from '@/types/database';

interface RequireRoleProps {
  children: ReactNode;
  /** Minimum required role */
  role?: UserRole;
  /** Specific permission action required */
  permission?: PermissionAction;
  /** Content to show when user doesn't have permission */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user role or permission
 * 
 * @example
 * // Require admin role
 * <RequireRole role="admin">
 *   <AdminPanel />
 * </RequireRole>
 * 
 * @example
 * // Require specific permission
 * <RequireRole permission="society:create">
 *   <CreateSocietyButton />
 * </RequireRole>
 * 
 * @example
 * // With fallback content
 * <RequireRole role="admin" fallback={<p>Non hai i permessi</p>}>
 *   <AdminPanel />
 * </RequireRole>
 */
export function RequireRole({
  children,
  role,
  permission,
  fallback = null,
}: RequireRoleProps) {
  const { profile, loading } = useUser();

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // No profile means no access
  if (!profile) {
    return <>{fallback}</>;
  }

  // Check role-based access
  if (role && !hasRole(profile.role, role)) {
    return <>{fallback}</>;
  }

  // Check permission-based access
  if (permission && !canPerform(profile.role, permission)) {
    return <>{fallback}</>;
  }

  // User has required role/permission
  return <>{children}</>;
}

/**
 * Hook to check if current user has a specific role
 * @param requiredRole - The minimum required role
 * @returns true if user has the required role or higher
 */
export function useHasRole(requiredRole: UserRole): boolean {
  const { profile } = useUser();
  return hasRole(profile?.role, requiredRole);
}

/**
 * Hook to check if current user can perform a specific action
 * @param action - The action to check permission for
 * @returns true if user has permission to perform the action
 */
export function useCanPerform(action: PermissionAction): boolean {
  const { profile } = useUser();
  return canPerform(profile?.role, action);
}

/**
 * Hook to check if current user is an admin
 * @returns true if user is admin or super_admin
 */
export function useIsAdmin(): boolean {
  return useHasRole('admin');
}

/**
 * Hook to check if current user is a super admin
 * @returns true if user is super_admin
 */
export function useIsSuperAdmin(): boolean {
  const { profile } = useUser();
  return profile?.role === 'super_admin';
}

