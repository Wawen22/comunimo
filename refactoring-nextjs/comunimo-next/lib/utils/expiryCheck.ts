/**
 * Utility functions for checking document expiry status
 * Used for member cards and medical certificates
 */

export type ExpiryStatus = 'expired' | 'expiring' | 'valid' | 'unknown';

/**
 * Calculate the number of days until a date expires
 * @param expiryDate - The expiry date to check
 * @returns Number of days until expiry (negative if expired), or null if date is null
 */
export function getDaysUntilExpiry(expiryDate: Date | string | null): number | null {
  if (!expiryDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0); // Reset time to start of day

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Get the expiry status based on the number of days remaining
 * @param expiryDate - The expiry date to check
 * @param warningDays - Number of days before expiry to show warning (default: 30)
 * @returns ExpiryStatus: 'expired', 'expiring', 'valid', or 'unknown'
 */
export function getExpiryStatus(
  expiryDate: Date | string | null,
  warningDays: number = 30
): ExpiryStatus {
  const daysRemaining = getDaysUntilExpiry(expiryDate);

  if (daysRemaining === null) {
    return 'unknown';
  }

  if (daysRemaining < 0) {
    return 'expired';
  }

  if (daysRemaining <= warningDays) {
    return 'expiring';
  }

  return 'valid';
}

/**
 * Format an expiry date for display
 * @param expiryDate - The date to format
 * @returns Formatted date string (DD/MM/YYYY) or 'Non disponibile'
 */
export function formatExpiryDate(expiryDate: Date | string | null): string {
  if (!expiryDate) {
    return 'Non disponibile';
  }

  const date = new Date(expiryDate);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Data non valida';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Get a human-readable message about the expiry status
 * @param expiryDate - The expiry date to check
 * @returns A descriptive message about the expiry status
 */
export function getExpiryMessage(expiryDate: Date | string | null): string {
  const daysRemaining = getDaysUntilExpiry(expiryDate);

  if (daysRemaining === null) {
    return 'Data di scadenza non disponibile';
  }

  if (daysRemaining < 0) {
    const daysExpired = Math.abs(daysRemaining);
    return `Scaduto da ${daysExpired} ${daysExpired === 1 ? 'giorno' : 'giorni'}`;
  }

  if (daysRemaining === 0) {
    return 'Scade oggi';
  }

  if (daysRemaining === 1) {
    return 'Scade domani';
  }

  if (daysRemaining <= 30) {
    return `Scade tra ${daysRemaining} giorni`;
  }

  return `Valido (scade il ${formatExpiryDate(expiryDate)})`;
}

