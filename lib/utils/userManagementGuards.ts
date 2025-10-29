import type { UserRole } from '@/types/database';

/**
 * Determine whether a given role requires at least one society assignment.
 */
export function requiresSocietyAssignment(role: UserRole): boolean {
  return role === 'society_admin';
}

/**
 * Validate society assignments for a role and return an error message if invalid.
 */
export function validateSocietyAdminAssignment(
  role: UserRole,
  societyIds: string[] | undefined
): string | null {
  if (!requiresSocietyAssignment(role)) {
    return null;
  }

  if (!societyIds || societyIds.length === 0) {
    return 'Assegna almeno una società agli amministratori di società';
  }

  return null;
}

interface SuperAdminChangeParams {
  existingRole: UserRole;
  targetRole: UserRole;
  targetActive: boolean;
  isTargetLastActiveSuperAdmin: boolean;
}

/**
 * Determine if a requested change would leave the system without any active super admins.
 */
export function shouldBlockSuperAdminChange({
  existingRole,
  targetRole,
  targetActive,
  isTargetLastActiveSuperAdmin,
}: SuperAdminChangeParams): boolean {
  if (existingRole !== 'super_admin') {
    return false;
  }

  if (!isTargetLastActiveSuperAdmin) {
    return false;
  }

  return targetRole !== 'super_admin' || targetActive === false;
}

