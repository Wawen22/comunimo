'use server';

import { supabaseAdmin } from '@/lib/api/supabase-server';

/**
 * Get the next available bib numbers for a championship.
 * Uses supabaseAdmin to bypass RLS and see ALL registrations across all societies.
 *
 * @param championshipId - Championship ID
 * @param count - Number of bib numbers needed
 * @returns Array of bib number strings (e.g., ["011", "012", "013"])
 */
export async function getNextBibNumbersAction(
  championshipId: string,
  count: number
): Promise<{ success: true; bibNumbers: string[] } | { success: false; error: string }> {
  try {
    // Fetch ALL bib numbers for this championship using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('championship_registrations')
      .select('bib_number')
      .eq('championship_id', championshipId);

    if (error) {
      console.error('Error fetching bib numbers (admin):', error);
      return { success: false, error: error.message };
    }

    let nextNumber = 1;

    if (data && data.length > 0) {
      // Parse all bib numbers as integers and find the true numeric max
      const numericBibs = data
        .map((d: any) => parseInt(String(d.bib_number), 10))
        .filter((n: number) => !isNaN(n));

      if (numericBibs.length > 0) {
        const maxBib = Math.max(...numericBibs);
        nextNumber = maxBib + 1;
      }
    }

    const bibNumbers: string[] = [];
    for (let i = 0; i < count; i++) {
      bibNumbers.push(String(nextNumber + i).padStart(3, '0'));
    }

    return { success: true, bibNumbers };
  } catch (error: any) {
    console.error('Error in getNextBibNumbersAction:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
