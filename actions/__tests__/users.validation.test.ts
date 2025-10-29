import { describe, expect, it } from 'vitest';
import { createUserSchema, updateUserSchema } from '@/actions/users.schemas';

describe('user action schemas', () => {
  describe('createUserSchema', () => {
    it('validates a standard admin payload', () => {
      const result = createUserSchema.safeParse({
        email: 'admin@example.com',
        role: 'admin',
        isActive: true,
      });
      expect(result.success).toBe(true);
    });

    it('fails when society_admin has no societies', () => {
      const result = createUserSchema.safeParse({
        email: 'society@example.com',
        role: 'society_admin',
        isActive: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateUserSchema', () => {
    const basePayload = {
      userId: '11111111-1111-1111-1111-111111111111',
    };

    it('allows updating full name only', () => {
      const result = updateUserSchema.safeParse({
        ...basePayload,
        fullName: 'Mario Rossi',
      });
      expect(result.success).toBe(true);
    });

    it('requires societies when switching to society_admin', () => {
      const result = updateUserSchema.safeParse({
        ...basePayload,
        role: 'society_admin',
      });
      expect(result.success).toBe(false);
    });
  });
});
