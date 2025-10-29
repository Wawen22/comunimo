import { z } from 'zod';
import { validateSocietyAdminAssignment } from '@/lib/utils/userManagementGuards';

export const userRoleEnum = z.enum(['society_admin', 'admin', 'super_admin']);

export const createUserSchema = z
  .object({
    email: z.string().trim().email({ message: 'Email non valida' }),
    fullName: z
      .string()
      .trim()
      .max(120, { message: 'Il nome può avere al massimo 120 caratteri' })
      .optional(),
    role: userRoleEnum,
    isActive: z.boolean().optional(),
    societyIds: z.array(z.string().min(1)).optional(),
  })
  .superRefine((data, ctx) => {
    const message = validateSocietyAdminAssignment(data.role, data.societyIds);
    if (message) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: ['societyIds'],
      });
    }
  });

export const updateUserSchema = z
  .object({
    userId: z.string().uuid({ message: 'ID utente non valido' }),
    fullName: z
      .string()
      .trim()
      .max(120, { message: 'Il nome può avere al massimo 120 caratteri' })
      .optional(),
    role: userRoleEnum.optional(),
    isActive: z.boolean().optional(),
    societyIds: z.array(z.string().min(1)).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role) {
      const message = validateSocietyAdminAssignment(data.role, data.societyIds);
      if (message) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
          path: ['societyIds'],
        });
      }
    }
  });

export const resetPasswordSchema = z.object({
  userId: z.string().uuid({ message: 'ID utente non valido' }),
});

