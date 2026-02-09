/**
 * Excel Import Utilities for FIDAL/UISP Athletes
 * 
 * This module provides functions to:
 * - Parse Excel files (FIDAL/UISP formats)
 * - Validate data with Zod schemas
 * - Transform Excel rows to Member data
 * - Upsert members with society handling
 */

import * as XLSX from 'xlsx';
import { z } from 'zod';
import { supabase } from '@/lib/api/supabase';
import type { Member, AllSociety } from '@/lib/types/database';

// ============================================================================
// TYPES
// ============================================================================

/**
 * FIDAL Excel Row (25 columns)
 * Note: Excel may convert some fields to numbers or Date objects
 * Actual columns from FIDAL file:
 * GEST, COD_REG, SGR_PROV, SETTORE, CATEG, FL_RIN, COD_SOC, DAT_MOV, NUM_TES,
 * COGN, NOME, LOC_NAS, DAT_NAS, STRAN, TEL_ATL, DAT_SYS, INDI, CAP, LOCA,
 * PROV, COD_FISC, COD_PROF, FAS_INT, MILITARE, SOCPROV
 */
export interface FIDALRow {
  GEST?: string | number;                // Gestione (es: "S" o "N")
  COD_REG?: string | number;             // Codice regionale (es: "EMI")
  SGR_PROV?: string | number;            // Sigla provincia (es: "R")
  SETTORE?: string | number;             // Settore (es: "A")
  CATEG: string;                         // Categoria (es: "SM55")
  FL_RIN?: string | number;              // Flag rinnovo (es: "R")
  COD_SOC: string | number;              // Codice società (es: "MO497")
  DAT_MOV?: string | number | Date;      // Data tessera (Date object, string, or Excel serial)
  NUM_TES: string | number;              // Numero tessera (es: "AA000326")
  COGN: string;                          // Cognome
  NOME: string;                          // Nome
  LOC_NAS?: string | number;             // Località nascita
  DAT_NAS: string | number | Date;       // Data nascita (Date object, string, or Excel serial)
  STRAN?: string | number;               // Straniero (es: "S" o "I")
  TEL_ATL?: string | number;             // Telefono atleta
  DAT_SYS?: string | number | Date;      // Data sistema FIDAL (Date object, string, or Excel serial)
  INDI?: string;                         // Indirizzo
  CAP?: string | number;                 // CAP
  LOCA?: string;                         // Località
  PROV?: string;                         // Provincia
  COD_FISC?: string | number;            // Codice fiscale
  COD_PROF?: string | number;            // Codice professione
  FAS_INT?: string | number;             // Fascia interesse
  MILITARE?: string | number;            // Militare
  SOCPROV?: string | number;             // Società provincia
}

/**
 * Parsed data with validation result
 */
export interface ParsedFIDALData {
  rowNumber: number;
  data: Partial<Member>;
  isValid: boolean;
  errors: string[];
}

/**
 * Import result
 */
export interface ImportResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  errorDetails: Array<{ row: number; message: string }>;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Zod schema for FIDAL Excel row
 * Note: Excel might convert values to numbers or Date objects
 */
const fidalRowSchema = z.object({
  NUM_TES: z.union([z.string(), z.number()]).transform(val => String(val)).pipe(z.string().min(1, 'Numero tessera obbligatorio')),
  COD_SOC: z.union([z.string(), z.number()]).transform(val => String(val)).pipe(z.string().min(1, 'Codice società obbligatorio')),
  COGN: z.string().min(1, 'Cognome obbligatorio'),
  NOME: z.string().min(1, 'Nome obbligatorio'),
  DAT_NAS: z.union([z.string(), z.number(), z.date()]).optional(),
  CATEG: z.string().min(2, 'Categoria obbligatoria (min 2 caratteri)'),
  GEST: z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  LOC_NAS: z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  COD_REG: z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  SGR_PROV: z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  SETTORE: z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  FL_RIN: z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  DAT_MOV: z.union([z.string(), z.number(), z.date(), z.undefined()]).optional(),
  DAT_SYS: z.union([z.string(), z.number(), z.date(), z.undefined()]).optional(),
  COD_FISC: z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  TEL_ATL: z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  INDI: z.union([z.string(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  CAP: z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  LOCA: z.union([z.string(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  PROV: z.union([z.string(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  STRAN: z.union([z.string(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  COD_PROF: z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  FAS_INT: z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  MILITARE: z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  SOCPROV: z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
}).passthrough(); // Allow extra fields

/**
 * Zod schema for Member data from FIDAL
 */
const memberFromFIDALSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  birth_date: z.string(),
  birth_place: z.string().nullable(),
  gender: z.enum(['M', 'F']),
  membership_number: z.string().min(1),
  society_code: z.string().min(1),
  regional_code: z.string().nullable(),
  category: z.string().nullable(),
  card_date: z.string().nullable(),
  system_date: z.string().nullable(),
  organization: z.literal('FIDAL'),
  fiscal_code: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  postal_code: z.string().nullable(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  is_foreign: z.boolean(),
});

// ============================================================================
// UISP TYPES AND SCHEMAS
// ============================================================================

/**
 * UISP Excel Row
 * Columns: Id persona, Codice fiscale aff., Codice fiscale, Cognome, Nome,
 * Indirizzo, N° civ., Cap, Comune, Localita, Data nascita, Comune nascita,
 * Sesso, Telefono, Email, Cellulare, AbsContaRiga, N° tess., Id tesseramento,
 * Cod. tess., Prodotto, Prodotto integ., Prod. int. codice, Categoria,
 * Data tessera, Tipo tess. integrazioni, Abbinata, Data abbinata, Squadra,
 * Disciplina, Cod. disciplina, SdA, Cod. affiliata, Ragione sociale,
 * Id affiliata, Regionale, Provinciale, Delegazione, Scad. certificato,
 * Tipo certificato
 */
export interface UISPRow {
  'Cognome': string;
  'Nome': string;
  'Data nascita': string | number | Date;
  'Sesso': string;                          // M or F
  'N° tess.': string | number;
  'Data tessera': string | number | Date;
  'Cod. affiliata': string | number;
  'Ragione sociale': string;
  'Scad. certificato'?: string | number | Date;
  // Optional fields
  'Codice fiscale'?: string;
  'Telefono'?: string | number;
  'Cellulare'?: string | number;
  'Email'?: string;
  'Indirizzo'?: string;
  'N° civ.'?: string | number;
  'Cap'?: string | number;
  'Comune'?: string;
  'Categoria'?: string;
  [key: string]: any;  // Allow other fields
}

/**
 * Parsed data with validation result for UISP
 */
export interface ParsedUISPData {
  rowNumber: number;
  data: Partial<Member>;
  isValid: boolean;
  errors: string[];
}

/**
 * Zod schema for UISP Excel row
 */
const uispRowSchema = z.object({
  'Cognome': z.string().min(1, 'Cognome obbligatorio'),
  'Nome': z.string().min(1, 'Nome obbligatorio'),
  'Data nascita': z.union([z.string(), z.number(), z.date()]).optional(),
  'Sesso': z.string().min(1, 'Sesso obbligatorio'),
  'N° tess.': z.union([z.string(), z.number()]).transform(val => String(val)).pipe(z.string().min(1, 'Numero tessera obbligatorio')),
  'Data tessera': z.union([z.string(), z.number(), z.date()]).optional(),
  'Cod. affiliata': z.union([z.string(), z.number()]).transform(val => String(val)).pipe(z.string().min(1, 'Codice affiliata obbligatorio')),
  'Ragione sociale': z.string().min(1, 'Ragione sociale obbligatoria'),
  'Scad. certificato': z.union([z.string(), z.number(), z.date(), z.undefined()]).optional(),
  'Codice fiscale': z.union([z.string(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  'Telefono': z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  'Cellulare': z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  'Email': z.union([z.string(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  'Indirizzo': z.union([z.string(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  'N° civ.': z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  'Cap': z.union([z.string(), z.number(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  'Comune': z.union([z.string(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
  'Categoria': z.union([z.string(), z.undefined()]).transform(val => val ? String(val) : '').optional(),
}).passthrough(); // Allow extra fields

/**
 * Zod schema for Member data from UISP
 */
const memberFromUISPSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  birth_date: z.string(),
  gender: z.enum(['M', 'F']),
  membership_number: z.string().min(1),
  society_code: z.string().min(1),
  card_date: z.string().nullable(),
  medical_certificate_expiry: z.string().nullable(),
  organization: z.literal('UISP'),
  fiscal_code: z.string().nullable(),
  phone: z.string().nullable(),
  mobile: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  postal_code: z.string().nullable(),
  city: z.string().nullable(),
  category: z.string().nullable(),
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse date from DD/MM/YYYY to YYYY-MM-DD
 * Also handles Excel serial dates (numbers) and Date objects
 */
export function parseDate(dateStr: string | number | Date | undefined): string | null {
  if (!dateStr || dateStr === '') return null;

  try {
    // If it's a Date object
    if (dateStr instanceof Date) {
      const year = dateStr.getFullYear();
      const month = String(dateStr.getMonth() + 1).padStart(2, '0');
      const day = String(dateStr.getDate()).padStart(2, '0');
      const result = `${year}-${month}-${day}`;
      console.log('📅 Date object parsed:', dateStr, '→', result);
      return result;
    }

    // If it's a number, check if it's a YYYYMMDD compact date (e.g., 20251231)
    // or an Excel serial date
    if (typeof dateStr === 'number') {
      // YYYYMMDD numbers are >= 10000101 and <= 99991231
      if (dateStr >= 10000101 && dateStr <= 99991231) {
        const str = String(dateStr);
        const year = str.substring(0, 4);
        const month = str.substring(4, 6);
        const day = str.substring(6, 8);
        const result = `${year}-${month}-${day}`;
        console.log('📅 YYYYMMDD numeric date parsed:', dateStr, '→', result);
        return result;
      }
      // Otherwise treat as Excel serial date
      const excelDate = XLSX.SSF.parse_date_code(dateStr);
      const year = excelDate.y;
      const month = String(excelDate.m).padStart(2, '0');
      const day = String(excelDate.d).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // If it's a string, try to parse it
    const dateString = String(dateStr).trim();

    // If it's empty after trim
    if (!dateString) return null;

    // If it's in DD/MM/YYYY format
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const [day, month, yearPart] = parts;
        if (!day || !month || !yearPart) return null;
        // Handle 2-digit years (e.g., 97 -> 1997, 24 -> 2024)
        let fullYear = yearPart;
        if (yearPart.length === 2) {
          const yearNum = parseInt(yearPart, 10);
          fullYear = yearNum > 50 ? `19${yearPart}` : `20${yearPart}`;
        }
        return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }

    // If it's in DD-MM-YYYY format
    if (dateString.includes('-') && dateString.match(/^\d{1,2}-\d{1,2}-\d{2,4}$/)) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const [day, month, yearPart] = parts;
        if (!day || !month || !yearPart) return null;
        // Handle 2-digit years
        let fullYear = yearPart;
        if (yearPart.length === 2) {
          const yearNum = parseInt(yearPart, 10);
          fullYear = yearNum > 50 ? `19${yearPart}` : `20${yearPart}`;
        }
        return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }

    // If it's in YYYYMMDD compact format (e.g., 20251231 → 2025-12-31)
    // Used by newer FIDAL Excel exports for DAT_MOV, DAT_NAS, DAT_SYS
    if (dateString.match(/^\d{8}$/)) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      const result = `${year}-${month}-${day}`;
      console.log('📅 YYYYMMDD compact date parsed:', dateString, '→', result);
      return result;
    }

    // If it's already in YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    // Try to parse as ISO date string
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    console.warn('⚠️ Could not parse date:', dateStr);
    return null;
  } catch (error) {
    console.error('❌ Error parsing date:', dateStr, error);
    return null;
  }
}

/**
 * Extract gender from CATEG field (2nd letter)
 * Examples: SM55 → M, SF40 → F
 */
export function extractGender(categ: string): 'M' | 'F' {
  if (categ.length < 2) return 'M'; // Default
  const secondLetter = categ.charAt(1).toUpperCase();
  return secondLetter === 'F' ? 'F' : 'M';
}

/**
 * Transform FIDAL row to Member data
 */
export function transformFIDALToMember(row: FIDALRow): Partial<Member> {
  return {
    first_name: row.NOME,
    last_name: row.COGN,
    birth_date: parseDate(row.DAT_NAS),
    birth_place: row.LOC_NAS ? String(row.LOC_NAS) : null,
    gender: extractGender(row.CATEG),
    membership_number: String(row.NUM_TES),
    society_code: String(row.COD_SOC),
    regional_code: row.COD_REG ? String(row.COD_REG) : null,
    category: row.CATEG || null,
    card_date: parseDate(row.DAT_MOV),
    system_date: parseDate(row.DAT_SYS),
    organization: 'FIDAL',
    fiscal_code: row.COD_FISC ? String(row.COD_FISC) : null,
    phone: row.TEL_ATL ? String(row.TEL_ATL) : null,
    address: row.INDI || null,
    postal_code: row.CAP ? String(row.CAP) : null,
    city: row.LOCA || null,
    province: row.PROV || null,
    is_foreign: row.STRAN ? String(row.STRAN).toUpperCase() === 'S' : false,
  };
}

/**
 * Transform UISP row to Member data
 */
export function transformUISPToMember(row: UISPRow): Partial<Member> {
  // Normalize gender (M or F)
  const gender = row['Sesso']?.toString().toUpperCase().trim();
  const normalizedGender: 'M' | 'F' = gender === 'F' ? 'F' : 'M';

  // Combine address fields
  let fullAddress = row['Indirizzo'] || '';
  if (row['N° civ.']) {
    fullAddress += fullAddress ? `, ${row['N° civ.']}` : String(row['N° civ.']);
  }

  // Use mobile if available, otherwise phone
  const phone = row['Cellulare'] ? String(row['Cellulare']) : (row['Telefono'] ? String(row['Telefono']) : null);
  const mobile = row['Cellulare'] ? String(row['Cellulare']) : null;

  return {
    first_name: row['Nome'],
    last_name: row['Cognome'],
    birth_date: parseDate(row['Data nascita']),
    gender: normalizedGender,
    membership_number: String(row['N° tess.']),
    society_code: String(row['Cod. affiliata']),
    card_date: parseDate(row['Data tessera']),
    medical_certificate_expiry: parseDate(row['Scad. certificato']),
    organization: 'UISP',
    fiscal_code: row['Codice fiscale'] ? String(row['Codice fiscale']) : null,
    phone: phone,
    mobile: mobile,
    email: row['Email'] ? String(row['Email']) : null,
    address: fullAddress || null,
    postal_code: row['Cap'] ? String(row['Cap']) : null,
    city: row['Comune'] ? String(row['Comune']) : null,
    category: row['Categoria'] ? String(row['Categoria']) : null,
    is_foreign: false, // UISP doesn't have this field
  };
}

// ============================================================================
// EXCEL PARSING
// ============================================================================

/**
 * Parse FIDAL Excel file
 */
export async function parseFIDALExcel(file: File): Promise<ParsedFIDALData[]> {
  console.log('🔍 Starting FIDAL Excel parsing...');
  console.log('📄 File:', file.name, 'Size:', file.size);

  const buffer = await file.arrayBuffer();

  // Read workbook with options for Excel files
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,      // Parse dates as Date objects
    cellNF: false,        // Don't parse number formats
    cellText: false,      // Don't parse as text
    dense: false,         // Use normal structure
    WTF: false,           // Don't throw on unexpected features
  });

  console.log('📊 Workbook sheets:', workbook.SheetNames);

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    console.error('❌ No sheets found in workbook!');
    throw new Error('Il file Excel non contiene fogli. Verifica che sia un file Excel valido.');
  }

  const [firstSheetName] = workbook.SheetNames;
  if (!firstSheetName) {
    console.error('❌ No sheets found in workbook');
    return [];
  }

  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    console.error('❌ Worksheet is empty!');
    throw new Error('Il foglio Excel è vuoto.');
  }

  // Parse with header row - keep raw values to preserve dates
  const rows: FIDALRow[] = XLSX.utils.sheet_to_json(worksheet, {
    raw: true,            // Keep raw values (dates as Date objects, numbers as numbers)
    defval: '',           // Default value for empty cells
    blankrows: false,     // Skip blank rows
  });

  console.log('📋 Total rows parsed:', rows.length);
  console.log('🔍 First row sample:', rows[0]);

  const parsedData: ParsedFIDALData[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 for header + 1-based

    try {
      // Validate row
      fidalRowSchema.parse(row);

      // Transform to Member data
      const memberData = transformFIDALToMember(row);

      // Validate member data
      memberFromFIDALSchema.parse(memberData);

      parsedData.push({
        rowNumber,
        data: memberData,
        isValid: true,
        errors: [],
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.warn(`❌ Row ${rowNumber} validation error:`, error.errors);
        parsedData.push({
          rowNumber,
          data: {},
          isValid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        });
      } else {
        console.error(`❌ Row ${rowNumber} unknown error:`, error);
        parsedData.push({
          rowNumber,
          data: {},
          isValid: false,
          errors: ['Errore sconosciuto durante il parsing'],
        });
      }
    }
  });

  console.log('✅ Parsing complete. Valid:', parsedData.filter(d => d.isValid).length, 'Errors:', parsedData.filter(d => !d.isValid).length);

  return parsedData;
}

/**
 * Parse UISP Excel file
 */
export async function parseUISPExcel(file: File): Promise<ParsedUISPData[]> {
  console.log('🔍 Starting UISP Excel parsing...');
  console.log('📄 File:', file.name, 'Size:', file.size);

  const buffer = await file.arrayBuffer();

  // Read workbook with options for Excel files
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,      // Parse dates as Date objects
    cellNF: false,        // Don't parse number formats
    cellText: false,      // Don't parse as text
    dense: false,         // Use normal structure
    WTF: false,           // Don't throw on unexpected features
  });

  console.log('📊 Workbook sheets:', workbook.SheetNames);

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    console.error('❌ No sheets found in workbook!');
    throw new Error('Il file Excel non contiene fogli. Verifica che sia un file Excel valido.');
  }

  const [firstSheetName] = workbook.SheetNames;
  if (!firstSheetName) {
    console.error('❌ No sheets found in workbook');
    return [];
  }

  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    console.error('❌ Worksheet is empty!');
    throw new Error('Il foglio Excel è vuoto.');
  }

  // Parse with header row - keep raw values to preserve dates
  const rows: UISPRow[] = XLSX.utils.sheet_to_json(worksheet, {
    raw: true,            // Keep raw values (dates as Date objects, numbers as numbers)
    defval: '',           // Default value for empty cells
    blankrows: false,     // Skip blank rows
  });

  console.log('📋 Total rows parsed:', rows.length);
  console.log('🔍 First row sample:', rows[0]);

  const parsedData: ParsedUISPData[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 for header + 1-based

    try {
      // Validate row
      uispRowSchema.parse(row);

      // Transform to Member data
      const memberData = transformUISPToMember(row);

      // Validate member data
      memberFromUISPSchema.parse(memberData);

      parsedData.push({
        rowNumber,
        data: memberData,
        isValid: true,
        errors: [],
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.warn(`❌ Row ${rowNumber} validation error:`, error.errors);
        parsedData.push({
          rowNumber,
          data: {},
          isValid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        });
      } else {
        console.error(`❌ Row ${rowNumber} unknown error:`, error);
        parsedData.push({
          rowNumber,
          data: {},
          isValid: false,
          errors: ['Errore sconosciuto durante il parsing'],
        });
      }
    }
  });

  console.log('✅ Parsing complete. Valid:', parsedData.filter(d => d.isValid).length, 'Errors:', parsedData.filter(d => !d.isValid).length);

  return parsedData;
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Normalize organization name to uppercase standard format
 */
export function normalizeOrganization(org: string | undefined | null): string {
  if (!org) return 'FIDAL'; // Default

  const normalized = org.trim().toUpperCase();

  // Map common variations
  switch (normalized) {
    case 'FIDAL':
      return 'FIDAL';
    case 'UISP':
      return 'UISP';
    case 'RUNCARD':
      return 'RUNCARD';
    case 'CSI':
      return 'CSI';
    default:
      return normalized;
  }
}

/**
 * Lookup society in all_societies
 */
export async function lookupSociety(code: string): Promise<AllSociety | null> {
  const { data, error } = await supabase
    .from('all_societies')
    .select('*')
    .eq('society_code', code)
    .single();

  if (error) return null;
  return data;
}

/**
 * Create society in all_societies
 */
export async function createSociety(
  code: string,
  name: string,
  organization: string
): Promise<AllSociety | null> {
  const payload = {
    society_code: code,
    name,
    organization: normalizeOrganization(organization),
    is_managed: false,
    province: null,
    managed_society_id: null,
  };

  const { data, error } = await supabase
    .from('all_societies')
    .insert(payload as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating society:', error);
    return null;
  }

  return data;
}

/**
 * Get or create society in societies table
 */
async function getOrCreateManagedSociety(
  allSociety: AllSociety
): Promise<string | null> {
  try {
    // If already has managed_society_id, return it
    if (allSociety.managed_society_id) {
      console.log('✅ Using existing managed society:', allSociety.society_code, '→', allSociety.managed_society_id);
      return allSociety.managed_society_id;
    }

    // Check if society already exists by society_code
    const { data: existingSociety } = await supabase
      .from('societies')
      .select('id')
      .eq('society_code', allSociety.society_code)
      .maybeSingle();

    const existingSocietyId = (existingSociety as { id: string } | null)?.id;

    if (existingSocietyId) {
      // Update all_societies to link to existing society
      await (supabase
        .from('all_societies') as any)
        .update({
          managed_society_id: existingSocietyId,
          is_managed: true,
        })
        .eq('id', allSociety.id);

      console.log('✅ Linked to existing society:', allSociety.society_code, '→', existingSocietyId);
      return existingSocietyId;
    }

    // Create new society in societies table
    const { data: newSociety, error: createError } = await (supabase
      .from('societies') as any)
      .insert({
        name: allSociety.name,
        society_code: allSociety.society_code,
        province: allSociety.province,
        organization: normalizeOrganization(allSociety.organization) as any,
        is_active: true,
      })
      .select('id')
      .single();

    if (createError) {
      console.error('❌ Error creating managed society:', createError);
      return null;
    }

    const newSocietyId = (newSociety as { id: string } | null)?.id;
    if (!newSocietyId) {
      console.error('❌ Missing new society id after creation');
      return null;
    }

    // Update all_societies to link to the new society
    await (supabase
      .from('all_societies') as any)
      .update({
        managed_society_id: newSocietyId,
        is_managed: true,
      })
      .eq('id', allSociety.id);

    console.log('✅ Created managed society:', allSociety.society_code, '→', newSocietyId);

    return newSocietyId;
  } catch (error) {
    console.error('❌ Error in getOrCreateManagedSociety:', error);
    return null;
  }
}

/**
 * Upsert member from FIDAL data
 * Smart logic: identifies athlete by first_name + last_name + birth_date
 * Updates only if card_date is more recent (overwrites all data)
 */
export async function upsertMemberFromFIDAL(
  memberData: Partial<Member>
): Promise<{ success: boolean; action: 'inserted' | 'updated' | 'skipped'; error?: string }> {

  try {
    // 1. Lookup society in all_societies
    let allSociety = await lookupSociety(memberData.society_code!);

    // 2. Create society in all_societies if not exists
    if (!allSociety) {
      allSociety = await createSociety(
        memberData.society_code!,
        `Società ${memberData.society_code}`,
        'FIDAL'
      );
    }

    // 3. Get or create managed society (in societies table)
    let societyId: string | null = null;
    if (allSociety) {
      societyId = await getOrCreateManagedSociety(allSociety);
    }

    // 4. Check if member exists by NATURAL KEY: first_name + last_name + birth_date
    let existing: Member | null = null;

    if (memberData.first_name && memberData.last_name && memberData.birth_date) {
      const { data } = await supabase
        .from('members')
        .select('id, card_date, membership_number, fiscal_code, first_name, last_name, birth_date')
        .eq('first_name', memberData.first_name)
        .eq('last_name', memberData.last_name)
        .eq('birth_date', memberData.birth_date)
        .maybeSingle();
      existing = (data as Member | null);
    }

    // 5. Prepare member data
    const finalData = {
      ...memberData,
      society_id: societyId,
      membership_status: 'active' as const,
      is_active: true,
    };

    // 6. Upsert with smart date comparison
    if (existing) {
      const existingMember = existing as Member;
      // Compare card_date: only update if new date is more recent
      const existingDate = existingMember.card_date ? new Date(existingMember.card_date) : null;
      const newDate = memberData.card_date ? new Date(memberData.card_date) : null;

      // If new date is more recent (or existing has no date), OVERWRITE ALL DATA
      if (!existingDate || (newDate && newDate > existingDate)) {
        const { error } = await (supabase
          .from('members') as any)
          .update(finalData as any)
          .eq('id', existingMember.id);

        if (error) throw error;
        return { success: true, action: 'updated' };
      } else {
        // Skip update: existing data is more recent
        return { success: true, action: 'skipped' };
      }
    } else {
      // Insert new member
      const { error } = await (supabase
        .from('members') as any)
        .insert(finalData as any);

      if (error) throw error;
      return { success: true, action: 'inserted' };
    }
  } catch (error: any) {
    console.error('Error upserting member:', error);
    return { success: false, action: 'inserted', error: error.message };
  }
}

/**
 * Upsert member from UISP data
 * Smart logic: identifies athlete by first_name + last_name + birth_date
 * Updates only if card_date is more recent (overwrites all data)
 */
export async function upsertMemberFromUISP(
  memberData: Partial<Member>
): Promise<{ success: boolean; action: 'inserted' | 'updated' | 'skipped'; error?: string }> {

  try {
    // 1. Lookup society in all_societies
    let allSociety = await lookupSociety(memberData.society_code!);

    // 2. Create society in all_societies if not exists
    if (!allSociety) {
      allSociety = await createSociety(
        memberData.society_code!,
        `Società ${memberData.society_code}`,
        'UISP'
      );
    }

    // 3. Get or create managed society (in societies table)
    let societyId: string | null = null;
    if (allSociety) {
      societyId = await getOrCreateManagedSociety(allSociety);
    }

    // 4. Check if member exists by NATURAL KEY: first_name + last_name + birth_date
    let existing: Member | null = null;

    if (memberData.first_name && memberData.last_name && memberData.birth_date) {
      const { data } = await supabase
        .from('members')
        .select('id, card_date, membership_number, fiscal_code, first_name, last_name, birth_date')
        .eq('first_name', memberData.first_name)
        .eq('last_name', memberData.last_name)
        .eq('birth_date', memberData.birth_date)
        .maybeSingle();
      existing = (data as Member | null);
    }

    // 5. Prepare member data
    const finalData = {
      ...memberData,
      society_id: societyId,
      membership_status: 'active' as const,
      is_active: true,
    };

    // 6. Upsert with smart date comparison
    if (existing) {
      const existingMember = existing as Member;
      // Compare card_date: only update if new date is more recent
      const existingDate = existingMember.card_date ? new Date(existingMember.card_date) : null;
      const newDate = memberData.card_date ? new Date(memberData.card_date) : null;

      // If new date is more recent (or existing has no date), OVERWRITE ALL DATA
      if (!existingDate || (newDate && newDate > existingDate)) {
        const { error } = await (supabase
          .from('members') as any)
          .update(finalData as any)
          .eq('id', existingMember.id);

        if (error) throw error;
        return { success: true, action: 'updated' };
      } else {
        // Skip update: existing data is more recent
        return { success: true, action: 'skipped' };
      }
    } else {
      // Insert new member
      const { error } = await (supabase
        .from('members') as any)
        .insert(finalData as any);

      if (error) throw error;
      return { success: true, action: 'inserted' };
    }
  } catch (error: any) {
    console.error('Error upserting UISP member:', error);
    return { success: false, action: 'inserted', error: error.message };
  }
}
