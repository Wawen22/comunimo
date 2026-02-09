/**
 * Bib Number Utilities
 * Utilities for managing bib numbers in championship registrations
 */

import { supabase } from '@/lib/api/supabase';

/**
 * Get the next available bib number for a championship.
 * Fetches ALL existing bib numbers and computes the numeric max in JS
 * to avoid text-ordering bugs (e.g. "9" > "10" in lexicographic order).
 * @param championshipId - Championship ID
 * @returns Next bib number as string (e.g., "001", "002", ...)
 */
export async function getNextBibNumber(championshipId: string): Promise<string> {
  try {
    // Fetch ALL bib numbers for this championship (including cancelled)
    const { data, error } = await supabase
      .from('championship_registrations')
      .select('bib_number')
      .eq('championship_id', championshipId) as { data: any[] | null; error: any };

    if (error) {
      console.error('Error fetching bib numbers:', error);
      return '001';
    }

    if (!data || data.length === 0) {
      return '001'; // First registration
    }

    // Parse all bib numbers as integers and find the true numeric max
    const numericBibs = data
      .map((d) => parseInt(String(d.bib_number), 10))
      .filter((n) => !isNaN(n));

    if (numericBibs.length === 0) {
      return '001';
    }

    const maxBib = Math.max(...numericBibs);
    const nextNumber = maxBib + 1;
    return String(nextNumber).padStart(3, '0');
  } catch (error) {
    console.error('Error in getNextBibNumber:', error);
    return '001';
  }
}

/**
 * Get multiple next bib numbers for bulk registration
 * @param championshipId - Championship ID
 * @param count - Number of bib numbers needed
 * @returns Array of bib numbers
 */
export async function getNextBibNumbers(
  championshipId: string,
  count: number
): Promise<string[]> {
  const firstBibNumber = await getNextBibNumber(championshipId);
  const firstNumber = parseInt(firstBibNumber, 10);

  const bibNumbers: string[] = [];
  for (let i = 0; i < count; i++) {
    const number = firstNumber + i;
    bibNumbers.push(String(number).padStart(3, '0'));
  }

  return bibNumbers;
}

/**
 * Check if a bib number is already assigned in a championship
 * @param championshipId - Championship ID
 * @param bibNumber - Bib number to check
 * @returns True if bib number is already assigned
 */
export async function isBibNumberAssigned(
  championshipId: string,
  bibNumber: string
): Promise<boolean> {

  try {
    const { data, error } = await supabase
      .from('championship_registrations')
      .select('id')
      .eq('championship_id', championshipId)
      .eq('bib_number', bibNumber)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error checking bib number:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isBibNumberAssigned:', error);
    return false;
  }
}

/**
 * Format bib number for display
 * @param bibNumber - Bib number
 * @returns Formatted bib number
 */
export function formatBibNumber(bibNumber: string): string {
  const number = parseInt(bibNumber, 10);
  if (isNaN(number)) {
    return bibNumber;
  }
  return String(number).padStart(3, '0');
}

/**
 * Validate bib number format
 * @param bibNumber - Bib number to validate
 * @returns True if valid
 */
export function isValidBibNumber(bibNumber: string): boolean {
  if (!bibNumber || bibNumber.trim() === '') {
    return false;
  }

  const number = parseInt(bibNumber, 10);
  return !isNaN(number) && number > 0;
}

/**
 * Get the next available bib number for a standalone event.
 * Fetches ALL existing bib numbers and computes the numeric max in JS
 * to avoid text-ordering bugs.
 * @param eventId - Event ID
 * @returns Next bib number as string (e.g., "001", "002", ...)
 */
export async function getNextEventBibNumber(eventId: string): Promise<string> {
  try {
    // Fetch ALL bib numbers for this event (including cancelled)
    const { data, error } = await supabase
      .from('event_registrations')
      .select('bib_number')
      .eq('event_id', eventId) as { data: any[] | null; error: any };

    if (error) {
      console.error('Error fetching bib numbers for event:', error);
      return '001';
    }

    if (!data || data.length === 0) {
      return '001'; // First registration
    }

    // Parse all bib numbers as integers and find the true numeric max
    const numericBibs = data
      .map((d) => parseInt(String(d.bib_number), 10))
      .filter((n) => !isNaN(n));

    if (numericBibs.length === 0) {
      return '001';
    }

    const maxBib = Math.max(...numericBibs);
    const nextNumber = maxBib + 1;
    return String(nextNumber).padStart(3, '0');
  } catch (error) {
    console.error('Error in getNextEventBibNumber:', error);
    return '001';
  }
}

/**
 * Get multiple next bib numbers for bulk event registration
 * @param eventId - Event ID
 * @param count - Number of bib numbers needed
 * @returns Array of bib numbers
 */
export async function getNextEventBibNumbers(
  eventId: string,
  count: number
): Promise<string[]> {
  const firstBibNumber = await getNextEventBibNumber(eventId);
  const firstNumber = parseInt(firstBibNumber, 10);

  const bibNumbers: string[] = [];
  for (let i = 0; i < count; i++) {
    const number = firstNumber + i;
    bibNumbers.push(String(number).padStart(3, '0'));
  }

  return bibNumbers;
}

/**
 * Check if a bib number is already assigned in an event
 * @param eventId - Event ID
 * @param bibNumber - Bib number to check
 * @returns True if bib number is already assigned
 */
export async function isEventBibNumberAssigned(
  eventId: string,
  bibNumber: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('bib_number', bibNumber)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error checking event bib number:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isEventBibNumberAssigned:', error);
    return false;
  }
}

