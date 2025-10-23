/**
 * Role-Based Access Control (RBAC) utilities
 * Manages user roles and permissions throughout the application
 */

import type { UserRole } from '@/types/database';

/**
 * Role hierarchy levels
 * Higher number = more permissions
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  society_admin: 1,
  admin: 2,
  super_admin: 3,
};

/**
 * Check if a user has a specific role or higher
 * @param userRole - The user's current role
 * @param requiredRole - The minimum required role
 * @returns true if user has the required role or higher
 * 
 * @example
 * hasRole('admin', 'user') // true - admin has user permissions
 * hasRole('user', 'admin') // false - user doesn't have admin permissions
 * hasRole('super_admin', 'admin') // true - super_admin has admin permissions
 */
export function hasRole(
  userRole: UserRole | null | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;
  
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  
  return userLevel >= requiredLevel;
}

/**
 * Check if a user is an admin (admin or super_admin)
 * @param userRole - The user's current role
 * @returns true if user is admin or super_admin
 */
export function isAdmin(userRole: UserRole | null | undefined): boolean {
  return hasRole(userRole, 'admin');
}

/**
 * Check if a user is a super admin
 * @param userRole - The user's current role
 * @returns true if user is super_admin
 */
export function isSuperAdmin(userRole: UserRole | null | undefined): boolean {
  return userRole === 'super_admin';
}

/**
 * Permission actions that can be performed in the system
 */
export type PermissionAction =
  // Society permissions
  | 'society:create'
  | 'society:read'
  | 'society:update'
  | 'society:delete'
  // Member permissions
  | 'member:create'
  | 'member:read'
  | 'member:update'
  | 'member:delete'
  // Payment permissions
  | 'payment:create'
  | 'payment:read'
  | 'payment:update'
  | 'payment:delete'
  // Event permissions
  | 'event:create'
  | 'event:read'
  | 'event:update'
  | 'event:delete'
  // User management permissions
  | 'user:create'
  | 'user:read'
  | 'user:update'
  | 'user:delete'
  // System permissions
  | 'system:settings'
  | 'system:logs';

/**
 * Permission matrix defining which roles can perform which actions
 *
 * Note: society_admin can manage their assigned societies
 * RLS policies enforce society-level access control
 */
const PERMISSIONS: Record<PermissionAction, UserRole[]> = {
  // Society permissions
  'society:create': ['admin', 'super_admin'],
  'society:read': ['society_admin', 'admin', 'super_admin'],
  'society:update': ['admin', 'super_admin'],
  'society:delete': ['super_admin'],

  // Member permissions (society_admin can manage members of assigned societies)
  'member:create': ['society_admin', 'admin', 'super_admin'],
  'member:read': ['society_admin', 'admin', 'super_admin'],
  'member:update': ['society_admin', 'admin', 'super_admin'],
  'member:delete': ['society_admin', 'admin', 'super_admin'],

  // Payment permissions
  'payment:create': ['society_admin', 'admin', 'super_admin'],
  'payment:read': ['society_admin', 'admin', 'super_admin'],
  'payment:update': ['society_admin', 'admin', 'super_admin'],
  'payment:delete': ['super_admin'],

  // Event permissions
  'event:create': ['admin', 'super_admin'],
  'event:read': ['society_admin', 'admin', 'super_admin'],
  'event:update': ['admin', 'super_admin'],
  'event:delete': ['admin', 'super_admin'],

  // User management permissions
  'user:create': ['super_admin'],
  'user:read': ['admin', 'super_admin'],
  'user:update': ['super_admin'],
  'user:delete': ['super_admin'],

  // System permissions
  'system:settings': ['super_admin'],
  'system:logs': ['super_admin'],
};

/**
 * Check if a user can perform a specific action
 * @param userRole - The user's current role
 * @param action - The action to check permission for
 * @returns true if user has permission to perform the action
 * 
 * @example
 * canPerform('admin', 'society:create') // true
 * canPerform('user', 'society:create') // false
 * canPerform('super_admin', 'user:delete') // true
 */
export function canPerform(
  userRole: UserRole | null | undefined,
  action: PermissionAction
): boolean {
  if (!userRole) return false;
  
  const allowedRoles = PERMISSIONS[action];
  return allowedRoles.includes(userRole);
}

/**
 * Get all permissions for a specific role
 * @param userRole - The user's role
 * @returns Array of actions the user can perform
 */
export function getRolePermissions(userRole: UserRole): PermissionAction[] {
  return Object.entries(PERMISSIONS)
    .filter(([_, roles]) => roles.includes(userRole))
    .map(([action]) => action as PermissionAction);
}

/**
 * Check if user can access admin routes
 * @param userRole - The user's current role
 * @returns true if user can access admin routes
 */
export function canAccessAdmin(userRole: UserRole | null | undefined): boolean {
  return isAdmin(userRole);
}

/**
 * Get user role display name in Italian
 * @param role - The user's role
 * @returns Italian display name for the role
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    society_admin: 'Amministratore Società',
    admin: 'Amministratore',
    super_admin: 'Super Amministratore',
  };

  return roleNames[role];
}

/**
 * Check if user is a society admin
 * @param userRole - The user's current role
 * @returns true if user is society_admin
 */
export function isSocietyAdmin(userRole: UserRole | null | undefined): boolean {
  return userRole === 'society_admin';
}

