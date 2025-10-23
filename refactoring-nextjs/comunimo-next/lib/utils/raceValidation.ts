/**
 * Race Validation Schemas
 * Zod schemas for championship and race validation
 */

import { z } from 'zod';

/**
 * Championship validation schema
 */
export const championshipSchema = z.object({
  name: z.string()
    .min(3, 'Il nome deve contenere almeno 3 caratteri')
    .max(200, 'Il nome non può superare 200 caratteri'),
  
  slug: z.string()
    .min(3, 'Lo slug deve contenere almeno 3 caratteri')
    .max(200, 'Lo slug non può superare 200 caratteri')
    .regex(/^[a-z0-9-]+$/, 'Lo slug può contenere solo lettere minuscole, numeri e trattini'),
  
  year: z.number()
    .int('L\'anno deve essere un numero intero')
    .min(2020, 'L\'anno deve essere almeno 2020')
    .max(2030, 'L\'anno non può superare 2030'),
  
  season: z.string()
    .max(50, 'La stagione non può superare 50 caratteri')
    .optional()
    .nullable(),
  
  description: z.string()
    .max(1000, 'La descrizione non può superare 1000 caratteri')
    .optional()
    .nullable(),
  
  start_date: z.string()
    .optional()
    .nullable(),
  
  end_date: z.string()
    .optional()
    .nullable(),
  
  championship_type: z.enum(['cross_country', 'road', 'track', 'other'], {
    errorMap: () => ({ message: 'Tipo di campionato non valido' }),
  }),
  
  is_active: z.boolean().default(true),
}).refine(
  (data) => {
    // If both dates are provided, end_date must be after start_date
    if (data.start_date && data.end_date) {
      return new Date(data.end_date) >= new Date(data.start_date);
    }
    return true;
  },
  {
    message: 'La data di fine deve essere successiva alla data di inizio',
    path: ['end_date'],
  }
);

export type ChampionshipFormData = z.infer<typeof championshipSchema>;

/**
 * Race validation schema
 */
export const raceSchema = z.object({
  championship_id: z.string()
    .refine(
      (val) => !val || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
      { message: 'ID campionato non valido' }
    )
    .optional()
    .nullable(),

  society_id: z.string()
    .refine(
      (val) => !val || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
      { message: 'ID società non valido' }
    )
    .optional()
    .nullable(),
  
  title: z.string()
    .min(3, 'Il titolo deve contenere almeno 3 caratteri')
    .max(200, 'Il titolo non può superare 200 caratteri'),
  
  description: z.string()
    .refine(
      (val) => !val || val.length <= 2000,
      { message: 'La descrizione non può superare 2000 caratteri' }
    )
    .optional()
    .nullable(),
  
  event_date: z.string()
    .min(1, 'La data della gara è obbligatoria'),
  
  event_time: z.string()
    .refine(
      (val) => !val || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val),
      { message: 'Formato ora non valido (HH:MM)' }
    )
    .optional()
    .nullable(),
  
  location: z.string()
    .refine(
      (val) => !val || val.length >= 2,
      { message: 'La località deve contenere almeno 2 caratteri' }
    )
    .refine(
      (val) => !val || val.length <= 200,
      { message: 'La località non può superare 200 caratteri' }
    )
    .optional()
    .nullable(),
  
  max_participants: z.number()
    .int('Il numero massimo di partecipanti deve essere un numero intero')
    .positive('Il numero massimo di partecipanti deve essere maggiore di 0')
    .optional()
    .nullable(),
  
  registration_deadline: z.string()
    .optional()
    .nullable(),
  
  event_number: z.number()
    .int('Il numero della gara deve essere un numero intero')
    .positive('Il numero della gara deve essere maggiore di 0')
    .optional()
    .nullable(),
  
  registration_start_date: z.string()
    .optional()
    .nullable(),
  
  registration_end_date: z.string()
    .optional()
    .nullable(),
  
  poster_url: z.string()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      { message: 'URL non valido' }
    )
    .optional()
    .nullable(),

  results_url: z.string()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      { message: 'URL non valido' }
    )
    .optional()
    .nullable(),
  
  has_specialties: z.boolean().default(false),
  
  is_public: z.boolean().default(false),
  
  is_active: z.boolean().default(true),
}).refine(
  (data) => {
    // If both registration dates are provided, end must be after start
    if (data.registration_start_date && data.registration_end_date) {
      return new Date(data.registration_end_date) >= new Date(data.registration_start_date);
    }
    return true;
  },
  {
    message: 'La data di fine iscrizioni deve essere successiva alla data di inizio',
    path: ['registration_end_date'],
  }
).refine(
  (data) => {
    // If registration_end_date is provided, it must be before event_date
    if (data.registration_end_date && data.event_date) {
      return new Date(data.event_date) >= new Date(data.registration_end_date);
    }
    return true;
  },
  {
    message: 'La data della gara deve essere successiva alla data di fine iscrizioni',
    path: ['event_date'],
  }
);

export type RaceFormData = z.infer<typeof raceSchema>;

/**
 * Validate championship data
 */
export function validateChampionship(data: unknown) {
  return championshipSchema.safeParse(data);
}

/**
 * Validate race data
 */
export function validateRace(data: unknown) {
  return raceSchema.safeParse(data);
}

/**
 * Check if slug is unique (to be used with database check)
 */
export function isSlugValid(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

/**
 * Validate event number is positive
 */
export function isEventNumberValid(eventNumber: number | null): boolean {
  if (eventNumber === null) return true;
  return eventNumber > 0;
}

/**
 * Validate date is in the future
 */
export function isFutureDate(date: string): boolean {
  const now = new Date();
  const eventDate = new Date(date);
  return eventDate > now;
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: string | null, endDate: string | null): boolean {
  if (!startDate || !endDate) return true;
  return new Date(endDate) >= new Date(startDate);
}

