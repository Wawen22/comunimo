/**
 * Frontend-only category calculator.
 * Calculates the athletic category from birth_date + gender
 * based on the official age-range table (FIDAL/UISP standard).
 *
 * This is for DISPLAY ONLY — do NOT store the result in the DB.
 */

interface CategoryRange {
  gender: 'M' | 'F';
  ageFrom: number;
  ageTo: number;
  code: string;
}

/**
 * Official category ranges.
 * Source: standard FIDAL/UISP category table.
 */
const CATEGORY_RANGES: CategoryRange[] = [
  // Femminile
  { gender: 'F', ageFrom: 0, ageTo: 5, code: 'Baby /F' },
  { gender: 'F', ageFrom: 6, ageTo: 7, code: 'Es 6/F' },
  { gender: 'F', ageFrom: 8, ageTo: 9, code: 'Es 8/F' },
  { gender: 'F', ageFrom: 10, ageTo: 11, code: 'Es 10/F' },
  { gender: 'F', ageFrom: 12, ageTo: 13, code: 'Rag /F' },
  { gender: 'F', ageFrom: 14, ageTo: 15, code: 'Cad /F' },
  { gender: 'F', ageFrom: 16, ageTo: 17, code: 'All /F' },
  { gender: 'F', ageFrom: 18, ageTo: 19, code: 'Jun /F' },
  { gender: 'F', ageFrom: 20, ageTo: 34, code: 'Sen /F' },
  { gender: 'F', ageFrom: 35, ageTo: 99, code: 'Am /F' },

  // Maschile
  { gender: 'M', ageFrom: 0, ageTo: 5, code: 'Baby /M' },
  { gender: 'M', ageFrom: 6, ageTo: 7, code: 'Es 6/M' },
  { gender: 'M', ageFrom: 8, ageTo: 9, code: 'Es 8/M' },
  { gender: 'M', ageFrom: 10, ageTo: 11, code: 'Es 10/M' },
  { gender: 'M', ageFrom: 12, ageTo: 13, code: 'Rag /M' },
  { gender: 'M', ageFrom: 14, ageTo: 15, code: 'Cad /M' },
  { gender: 'M', ageFrom: 16, ageTo: 17, code: 'All /M' },
  { gender: 'M', ageFrom: 18, ageTo: 19, code: 'Jun /M' },
  { gender: 'M', ageFrom: 20, ageTo: 34, code: 'Sen /M' },
  { gender: 'M', ageFrom: 35, ageTo: 44, code: 'Am A/M' },
  { gender: 'M', ageFrom: 45, ageTo: 54, code: 'Am B/M' },
  { gender: 'M', ageFrom: 55, ageTo: 99, code: 'Am C/M' },
];

/**
 * Calculate age from birth date string (YYYY-MM-DD).
 */
function calcAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Calculate the athletic category code for display.
 *
 * @param birthDate  ISO date string (YYYY-MM-DD) or null
 * @param gender     'M' | 'F' or null
 * @returns          Category code string, or null when it cannot be determined
 */
export function calculateDisplayCategory(
  birthDate: string | null | undefined,
  gender: string | null | undefined,
): string | null {
  if (!birthDate || !gender) return null;

  const normalizedGender: 'M' | 'F' = gender === 'F' ? 'F' : 'M';
  const age = calcAge(birthDate);
  if (age < 0) return null;

  const match = CATEGORY_RANGES.find(
    (r) => r.gender === normalizedGender && age >= r.ageFrom && age <= r.ageTo,
  );

  return match?.code ?? null;
}
