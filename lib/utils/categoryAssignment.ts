/**
 * Category Assignment Utility
 * 
 * Handles automatic assignment of athletic categories based on age and gender.
 * Used in member forms to auto-populate the category field.
 */

export type Gender = 'M' | 'F' | 'other';

export type CategoryCode = 
  | 'SM' | 'SF'  // Senior (18-34)
  | 'AM' | 'AF'  // Master A (35-49)
  | 'BM' | 'BF'  // Master B (50-59)
  | 'CM' | 'CF'  // Master C (60+)
  | 'PM' | 'PF'  // Promesse (16-17)
  | 'JM' | 'JF'  // Junior (14-15)
  | 'RM' | 'RF'; // Ragazzi (12-13)

export interface Category {
  code: CategoryCode;
  name: string;
  ageMin: number;
  ageMax: number | null; // null means no upper limit
  gender: 'M' | 'F';
  description: string;
}

/**
 * Complete list of athletic categories
 */
export const CATEGORIES: Category[] = [
  // Youth categories
  { code: 'RM', name: 'Ragazzi M', ageMin: 12, ageMax: 13, gender: 'M', description: 'Ragazzi (12-13 anni)' },
  { code: 'RF', name: 'Ragazzi F', ageMin: 12, ageMax: 13, gender: 'F', description: 'Ragazze (12-13 anni)' },
  { code: 'JM', name: 'Junior M', ageMin: 14, ageMax: 15, gender: 'M', description: 'Junior (14-15 anni)' },
  { code: 'JF', name: 'Junior F', ageMin: 14, ageMax: 15, gender: 'F', description: 'Junior (14-15 anni)' },
  { code: 'PM', name: 'Promesse M', ageMin: 16, ageMax: 17, gender: 'M', description: 'Promesse (16-17 anni)' },
  { code: 'PF', name: 'Promesse F', ageMin: 16, ageMax: 17, gender: 'F', description: 'Promesse (16-17 anni)' },
  
  // Adult categories
  { code: 'SM', name: 'Senior M', ageMin: 18, ageMax: 34, gender: 'M', description: 'Senior (18-34 anni)' },
  { code: 'SF', name: 'Senior F', ageMin: 18, ageMax: 34, gender: 'F', description: 'Senior (18-34 anni)' },
  { code: 'AM', name: 'Master A M', ageMin: 35, ageMax: 49, gender: 'M', description: 'Master A (35-49 anni)' },
  { code: 'AF', name: 'Master A F', ageMin: 35, ageMax: 49, gender: 'F', description: 'Master A (35-49 anni)' },
  { code: 'BM', name: 'Master B M', ageMin: 50, ageMax: 59, gender: 'M', description: 'Master B (50-59 anni)' },
  { code: 'BF', name: 'Master B F', ageMin: 50, ageMax: 59, gender: 'F', description: 'Master B (50-59 anni)' },
  { code: 'CM', name: 'Master C M', ageMin: 60, ageMax: null, gender: 'M', description: 'Master C (60+ anni)' },
  { code: 'CF', name: 'Master C F', ageMin: 60, ageMax: null, gender: 'F', description: 'Master C (60+ anni)' },
];

/**
 * Athletic organizations supported by the system
 */
export const ORGANIZATIONS = [
  { code: 'FIDAL', name: 'FIDAL', description: 'Federazione Italiana di Atletica Leggera' },
  { code: 'UISP', name: 'UISP', description: 'Unione Italiana Sport Per tutti' },
  { code: 'CSI', name: 'CSI', description: 'Centro Sportivo Italiano' },
  { code: 'RUNCARD', name: 'RUNCARD', description: 'Runcard' },
] as const;

/**
 * Calculate age from birth date
 * @param birthDate - Birth date in YYYY-MM-DD format or Date object
 * @param referenceDate - Reference date for age calculation (defaults to today)
 * @returns Age in years
 */
export function calculateAge(
  birthDate: string | Date,
  referenceDate: Date = new Date()
): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDiff = referenceDate.getMonth() - birth.getMonth();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get category based on age and gender
 * @param age - Age in years
 * @param gender - Gender ('M' or 'F')
 * @returns Category code or null if no match
 */
export function getCategoryByAge(age: number, gender: 'M' | 'F'): CategoryCode | null {
  // Filter categories by gender
  const genderCategories = CATEGORIES.filter(cat => cat.gender === gender);
  
  // Find matching category
  for (const category of genderCategories) {
    if (age >= category.ageMin) {
      if (category.ageMax === null || age <= category.ageMax) {
        return category.code;
      }
    }
  }
  
  return null;
}

/**
 * Assign category based on birth date and gender
 * @param birthDate - Birth date in YYYY-MM-DD format or Date object
 * @param gender - Gender ('M', 'F', or 'other')
 * @param referenceDate - Reference date for age calculation (defaults to today)
 * @returns Category code or empty string if cannot be determined
 */
export function assignCategory(
  birthDate: string | Date,
  gender: Gender,
  referenceDate: Date = new Date()
): string {
  // Cannot assign category for 'other' gender
  if (gender !== 'M' && gender !== 'F') {
    return '';
  }
  
  // Cannot assign without birth date
  if (!birthDate) {
    return '';
  }
  
  try {
    const age = calculateAge(birthDate, referenceDate);
    
    // Cannot assign category for age < 12
    if (age < 12) {
      return '';
    }
    
    const category = getCategoryByAge(age, gender);
    return category || '';
  } catch (error) {
    console.error('Error assigning category:', error);
    return '';
  }
}

/**
 * Get category details by code
 * @param code - Category code
 * @returns Category object or undefined if not found
 */
export function getCategoryByCode(code: string): Category | undefined {
  return CATEGORIES.find(cat => cat.code === code);
}

/**
 * Get all categories for a specific gender
 * @param gender - Gender ('M' or 'F')
 * @returns Array of categories
 */
export function getCategoriesByGender(gender: 'M' | 'F'): Category[] {
  return CATEGORIES.filter(cat => cat.gender === gender);
}

/**
 * Validate if a category code is valid
 * @param code - Category code to validate
 * @returns True if valid, false otherwise
 */
export function isValidCategory(code: string): boolean {
  return CATEGORIES.some(cat => cat.code === code);
}

/**
 * Get organization by code
 * @param code - Organization code
 * @returns Organization object or undefined if not found
 */
export function getOrganizationByCode(code: string) {
  return ORGANIZATIONS.find(org => org.code === code);
}

/**
 * Format category for display
 * @param code - Category code
 * @returns Formatted category string (e.g., "Senior M (18-34 anni)")
 */
export function formatCategory(code: string): string {
  const category = getCategoryByCode(code);
  if (!category) return code;
  
  const ageRange = category.ageMax 
    ? `${category.ageMin}-${category.ageMax} anni`
    : `${category.ageMin}+ anni`;
  
  return `${category.name} (${ageRange})`;
}

