/**
 * CSV Export utilities for members data
 */

import { Member } from '@/lib/types/database';

interface MemberWithSociety extends Member {
  society?: {
    id: string;
    name: string;
    society_code: string | null;
  } | null;
}

/**
 * Format date for CSV export
 * @param date - Date string or null
 * @returns Formatted date (DD/MM/YYYY) or empty string
 */
function formatDateForCSV(date: string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('it-IT');
}

/**
 * Format gender for CSV export
 * @param gender - Gender code (M/F) or null
 * @returns Full gender name in Italian
 */
function formatGenderForCSV(gender: string | null): string {
  if (!gender) return '';
  switch (gender) {
    case 'M': return 'Maschio';
    case 'F': return 'Femmina';
    default: return gender;
  }
}

/**
 * Format membership status for CSV export
 * @param status - Membership status code
 * @returns Status label in Italian
 */
function formatStatusForCSV(status: string | null): string {
  if (!status) return '';
  switch (status) {
    case 'active': return 'Attivo';
    case 'suspended': return 'Sospeso';
    case 'expired': return 'Scaduto';
    default: return status;
  }
}

/**
 * Escape CSV field value
 * Handles quotes, commas, and newlines
 * @param value - Field value
 * @returns Escaped value
 */
function escapeCSVField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Convert members array to CSV content
 * @param members - Array of members with society data
 * @returns CSV content as string
 */
export function generateMembersCSV(members: MemberWithSociety[]): string {
  // Define CSV headers
  const headers = [
    'Nome',
    'Cognome',
    'Codice Fiscale',
    'Data di Nascita',
    'Sesso',
    'Email',
    'Telefono',
    'Indirizzo',
    'Città',
    'CAP',
    'Provincia',
    'Società',
    'Codice Società',
    'Ente',
    'Numero Tessera',
    'Categoria',
    'Stato Tesseramento',
    'Data Emissione Tessera',
    'Data Scadenza Tessera',
    'Data Certificato Medico',
    'Data Scadenza Certificato Medico',
    'Atleta Straniero',
    'Note',
  ];

  // Create CSV rows
  const rows = members.map(member => [
    escapeCSVField(member.first_name),
    escapeCSVField(member.last_name),
    escapeCSVField(member.fiscal_code),
    escapeCSVField(formatDateForCSV(member.birth_date)),
    escapeCSVField(formatGenderForCSV(member.gender)),
    escapeCSVField(member.email),
    escapeCSVField(member.phone),
    escapeCSVField(member.address),
    escapeCSVField(member.city),
    escapeCSVField(member.postal_code),
    escapeCSVField(member.province),
    escapeCSVField(member.society?.name),
    escapeCSVField(member.society?.society_code),
    escapeCSVField(member.organization),
    escapeCSVField(member.membership_card_number),
    escapeCSVField(member.category),
    escapeCSVField(formatStatusForCSV(member.membership_status)),
    escapeCSVField(formatDateForCSV(member.card_issue_date)),
    escapeCSVField(formatDateForCSV(member.card_expiry_date)),
    escapeCSVField(formatDateForCSV(member.medical_certificate_date)),
    escapeCSVField(formatDateForCSV(member.medical_certificate_expiry)),
    escapeCSVField(member.is_foreign ? 'Sì' : 'No'),
    escapeCSVField(member.notes),
  ]);

  // Combine headers and rows
  const csvLines = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ];

  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  return BOM + csvLines.join('\n');
}

/**
 * Download CSV file
 * @param content - CSV content
 * @param filename - Filename (without extension)
 */
export function downloadCSV(content: string, filename: string): void {
  // Create blob with CSV content
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export members to CSV file
 * @param members - Array of members to export
 * @param filename - Optional custom filename (default: atleti_YYYYMMDD_HHMMSS)
 */
export function exportMembersToCSV(
  members: MemberWithSociety[],
  filename?: string
): void {
  // Generate CSV content
  const csvContent = generateMembersCSV(members);
  
  // Generate filename with timestamp if not provided
  const defaultFilename = filename || `atleti_${new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_')}`;
  
  // Download file
  downloadCSV(csvContent, defaultFilename);
}

/**
 * Get export statistics
 * @param members - Array of members
 * @returns Object with export statistics
 */
export function getExportStats(members: MemberWithSociety[]): {
  total: number;
  active: number;
  withEmail: number;
  withPhone: number;
} {
  return {
    total: members.length,
    active: members.filter(m => m.membership_status === 'active').length,
    withEmail: members.filter(m => m.email).length,
    withPhone: members.filter(m => m.phone).length,
  };
}

