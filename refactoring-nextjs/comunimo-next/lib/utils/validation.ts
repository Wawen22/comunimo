import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Email non valida');

/**
 * Phone validation schema (Italian format)
 */
export const phoneSchema = z
  .string()
  .regex(/^[0-9]{10}$/, 'Numero di telefono non valido (10 cifre)');

/**
 * Fiscal code validation schema (Italian)
 */
export const fiscalCodeSchema = z
  .string()
  .regex(
    /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/,
    'Codice fiscale non valido'
  );

/**
 * VAT number validation schema (Italian)
 */
export const vatNumberSchema = z
  .string()
  .regex(/^[0-9]{11}$/, 'Partita IVA non valida (11 cifre)');

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, 'La password deve contenere almeno 8 caratteri')
  .regex(/[A-Z]/, 'La password deve contenere almeno una lettera maiuscola')
  .regex(/[a-z]/, 'La password deve contenere almeno una lettera minuscola')
  .regex(/[0-9]/, 'La password deve contenere almeno un numero');

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}

