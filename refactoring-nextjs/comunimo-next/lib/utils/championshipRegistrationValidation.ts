/**
 * Championship Registration Validation
 * Zod schemas for championship registration forms
 */

import { z } from 'zod';

/**
 * Championship registration schema
 */
export const championshipRegistrationSchema = z.object({
  championship_id: z.string()
    .uuid('ID campionato non valido'),

  member_id: z.string()
    .uuid('ID atleta non valido'),

  society_id: z.string()
    .uuid('ID società non valido')
    .nullable()
    .optional(),

  bib_number: z.string()
    .min(1, 'Il numero pettorale è obbligatorio')
    .max(10, 'Il numero pettorale non può superare 10 caratteri'),

  organization: z.string()
    .min(1, 'L\'organizzazione è obbligatoria')
    .max(50, 'L\'organizzazione non può superare 50 caratteri')
    .nullable()
    .optional(),

  category: z.string()
    .min(1, 'La categoria è obbligatoria')
    .max(50, 'La categoria non può superare 50 caratteri')
    .nullable()
    .optional(),

  status: z.enum(['confirmed', 'cancelled'])
    .default('confirmed'),

  notes: z.string()
    .max(1000, 'Le note non possono superare 1000 caratteri')
    .nullable()
    .optional(),
});

/**
 * Bulk registration schema (multiple members)
 */
export const bulkChampionshipRegistrationSchema = z.object({
  championship_id: z.string()
    .uuid('ID campionato non valido'),

  member_ids: z.array(z.string().uuid('ID atleta non valido'))
    .min(1, 'Seleziona almeno un atleta')
    .max(100, 'Puoi iscrivere massimo 100 atleti alla volta'),

  society_id: z.string()
    .uuid('ID società non valido')
    .nullable()
    .optional(),

  notes: z.string()
    .max(1000, 'Le note non possono superare 1000 caratteri')
    .nullable()
    .optional(),
});

/**
 * Update championship registration schema
 */
export const updateChampionshipRegistrationSchema = z.object({
  status: z.enum(['confirmed', 'cancelled'])
    .optional(),

  bib_number: z.string()
    .min(1, 'Il numero pettorale è obbligatorio')
    .max(10, 'Il numero pettorale non può superare 10 caratteri')
    .optional(),

  notes: z.string()
    .max(1000, 'Le note non possono superare 1000 caratteri')
    .nullable()
    .optional(),
});

/**
 * Type exports
 */
export type ChampionshipRegistrationFormData = z.infer<typeof championshipRegistrationSchema>;
export type BulkChampionshipRegistrationFormData = z.infer<typeof bulkChampionshipRegistrationSchema>;
export type UpdateChampionshipRegistrationFormData = z.infer<typeof updateChampionshipRegistrationSchema>;

