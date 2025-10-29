import { describe, expect, it } from 'vitest';
import {
  requiresSocietyAssignment,
  validateSocietyAdminAssignment,
  shouldBlockSuperAdminChange,
} from '@/lib/utils/userManagementGuards';

describe('userManagementGuards', () => {
  describe('requiresSocietyAssignment', () => {
    it('returns true for society_admin role', () => {
      expect(requiresSocietyAssignment('society_admin')).toBe(true);
    });

    it('returns false for admin roles', () => {
      expect(requiresSocietyAssignment('admin')).toBe(false);
      expect(requiresSocietyAssignment('super_admin')).toBe(false);
    });
  });

  describe('validateSocietyAdminAssignment', () => {
    it('returns null when role does not require societies', () => {
      expect(validateSocietyAdminAssignment('admin', undefined)).toBeNull();
    });

    it('returns error message when society_admin has no societies', () => {
      expect(validateSocietyAdminAssignment('society_admin', [])).toBe(
        'Assegna almeno una società agli amministratori di società'
      );
    });

    it('returns null when society_admin has at least one society', () => {
      expect(validateSocietyAdminAssignment('society_admin', ['society-1'])).toBeNull();
    });
  });

  describe('shouldBlockSuperAdminChange', () => {
    it('allows changes when user is not super admin', () => {
      const result = shouldBlockSuperAdminChange({
        existingRole: 'admin',
        targetRole: 'admin',
        targetActive: true,
        isTargetLastActiveSuperAdmin: false,
      });
      expect(result).toBe(false);
    });

    it('allows changes when there are other active super admins', () => {
      const result = shouldBlockSuperAdminChange({
        existingRole: 'super_admin',
        targetRole: 'admin',
        targetActive: true,
        isTargetLastActiveSuperAdmin: false,
      });
      expect(result).toBe(false);
    });

    it('blocks demotion of the last active super admin', () => {
      const result = shouldBlockSuperAdminChange({
        existingRole: 'super_admin',
        targetRole: 'admin',
        targetActive: true,
        isTargetLastActiveSuperAdmin: true,
      });
      expect(result).toBe(true);
    });

    it('blocks deactivation of the last active super admin', () => {
      const result = shouldBlockSuperAdminChange({
        existingRole: 'super_admin',
        targetRole: 'super_admin',
        targetActive: false,
        isTargetLastActiveSuperAdmin: true,
      });
      expect(result).toBe(true);
    });
  });
});

