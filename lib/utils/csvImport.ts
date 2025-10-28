/**
 * CSV Import utilities for bulk member import
 */

import Papa from 'papaparse';
import { z } from 'zod';

// Validation schema for CSV import (simplified from MemberForm)
const importMemberSchema = z.object({
  first_name: z.string().min(1, 'Nome obbligatorio'),
  last_name: z.string().min(1, 'Cognome obbligatorio'),
  fiscal_code: z.string()
    .regex(/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/, 'Codice fiscale non valido')
    .optional()
    .or(z.literal('')),
  birth_date: z.string().min(1, 'Data di nascita obbligatoria'),
  gender: z.enum(['M', 'F'], { required_error: 'Genere obbligatorio (M/F)' }),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  postal_code: z.string().optional().or(z.literal('')),
  province: z.string().optional().or(z.literal('')),
  society_code: z.string().min(1, 'Codice società obbligatorio'),
  organization: z.enum(['FIDAL', 'UISP', 'CSI', 'RUNCARD'], {
    required_error: 'Ente obbligatorio (FIDAL/UISP/CSI/RUNCARD)',
  }),
  category: z.string().optional().or(z.literal('')),
  membership_status: z.enum(['active', 'suspended', 'expired']).optional().or(z.literal('')),
  medical_certificate_date: z.string().optional().or(z.literal('')),
  medical_certificate_expiry: z.string().optional().or(z.literal('')),
  is_foreign: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type ImportMemberData = z.infer<typeof importMemberSchema>;

export interface ParsedCSVRow {
  rowNumber: number;
  data: Partial<ImportMemberData>;
  isValid: boolean;
  errors: string[];
}

export interface CSVParseResult {
  success: boolean;
  rows: ParsedCSVRow[];
  validCount: number;
  errorCount: number;
  totalCount: number;
}

/**
 * Parse date from CSV (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
 */
function parseCSVDate(dateStr: string): string {
  if (!dateStr || dateStr.trim() === '') return '';
  
  // Try DD/MM/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    if (day && month && year) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  
  // Try YYYY-MM-DD format (already correct)
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  
  return dateStr; // Return as-is, validation will catch errors
}

/**
 * Parse boolean from CSV (Sì/No, true/false, 1/0)
 */
function parseCSVBoolean(value: string): string {
  if (!value || value.trim() === '') return '';
  
  const normalized = value.toLowerCase().trim();
  if (normalized === 'sì' || normalized === 'si' || normalized === 'true' || normalized === '1') {
    return 'true';
  }
  if (normalized === 'no' || normalized === 'false' || normalized === '0') {
    return 'false';
  }
  
  return value;
}

/**
 * Parse CSV file and validate rows
 */
export async function parseCSVFile(file: File): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize headers (remove spaces, lowercase)
        return header.trim().toLowerCase().replace(/\s+/g, '_');
      },
      complete: (results) => {
        const rows: ParsedCSVRow[] = [];
        let validCount = 0;
        let errorCount = 0;

        results.data.forEach((row: any, index: number) => {
          const rowNumber = index + 2; // +2 because: +1 for 1-based, +1 for header row
          
          // Transform row data
          const transformedData: Partial<ImportMemberData> = {
            first_name: row.nome || row.first_name || '',
            last_name: row.cognome || row.last_name || '',
            fiscal_code: (row.codice_fiscale || row.fiscal_code || '').toUpperCase(),
            birth_date: parseCSVDate(row.data_di_nascita || row.birth_date || ''),
            gender: (row.sesso || row.gender || '').toUpperCase(),
            email: row.email || '',
            phone: row.telefono || row.phone || '',
            address: row.indirizzo || row.address || '',
            city: row.città || row.city || '',
            postal_code: row.cap || row.postal_code || '',
            province: row.provincia || row.province || '',
            society_code: row.codice_società || row.society_code || '',
            organization: (row.ente || row.organization || '').toUpperCase(),
            category: row.categoria || row.category || '',
            membership_status: (row.stato_tesseramento || row.membership_status || '').toLowerCase(),
            medical_certificate_date: parseCSVDate(row.data_certificato_medico || row.medical_certificate_date || ''),
            medical_certificate_expiry: parseCSVDate(row.data_scadenza_certificato_medico || row.medical_certificate_expiry || ''),
            is_foreign: parseCSVBoolean(row.atleta_straniero || row.is_foreign || ''),
            notes: row.note || row.notes || '',
          };

          // Validate row
          const validation = importMemberSchema.safeParse(transformedData);
          
          if (validation.success) {
            rows.push({
              rowNumber,
              data: transformedData,
              isValid: true,
              errors: [],
            });
            validCount++;
          } else {
            const errors = validation.error.errors.map(
              (err) => `${err.path.join('.')}: ${err.message}`
            );
            rows.push({
              rowNumber,
              data: transformedData,
              isValid: false,
              errors,
            });
            errorCount++;
          }
        });

        resolve({
          success: errorCount === 0,
          rows,
          validCount,
          errorCount,
          totalCount: rows.length,
        });
      },
      error: (error) => {
        resolve({
          success: false,
          rows: [],
          validCount: 0,
          errorCount: 0,
          totalCount: 0,
        });
      },
    });
  });
}

/**
 * Generate CSV template for download
 */
export function generateCSVTemplate(): string {
  const headers = [
    'nome',
    'cognome',
    'codice_fiscale',
    'data_di_nascita',
    'sesso',
    'email',
    'telefono',
    'indirizzo',
    'città',
    'cap',
    'provincia',
    'codice_società',
    'ente',
    'numero_tessera',
    'categoria',
    'stato_tesseramento',
    'data_emissione_tessera',
    'data_scadenza_tessera',
    'data_certificato_medico',
    'data_scadenza_certificato_medico',
    'atleta_straniero',
    'note',
  ];

  const exampleRow = [
    'Mario',
    'Rossi',
    'RSSMRA80A01H501U',
    '01/01/1980',
    'M',
    'mario.rossi@example.com',
    '3331234567',
    'Via Roma 1',
    'Modena',
    '41121',
    'MO',
    'MO123',
    'FIDAL',
    '12345',
    'SM35',
    'active',
    '01/01/2025',
    '31/12/2025',
    '15/01/2025',
    '15/01/2026',
    'No',
    'Note esempio',
  ];

  const BOM = '\uFEFF';
  return BOM + headers.join(',') + '\n' + exampleRow.join(',');
}

/**
 * Download CSV template
 */
export function downloadCSVTemplate(): void {
  const content = generateCSVTemplate();
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'template_import_atleti.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

