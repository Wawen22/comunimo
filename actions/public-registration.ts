'use server';

import { supabaseAdmin } from '@/lib/api/supabase-server';
import { getNextBibNumbersAction } from '@/actions/championships';

export interface PublicRegistrationInput {
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: 'M' | 'F';
  membership_number: string;
  membership_type: 'UISP' | 'FIDAL' | 'ALTRO';
  society_name: string;
  society_code: string;
  category: string | null;
}

/**
 * Register an athlete via the public form (no auth required).
 * 1. Creates a member record
 * 2. Registers to the active championship (with bib number)
 * 3. Registers to all races in that championship
 */
export async function publicRegisterAthleteAction(
  input: PublicRegistrationInput
): Promise<{ success: true; memberId: string; bibNumber: string } | { success: false; error: string }> {
  try {
    // 1. Look up society — first in societies table, then in all_societies
    let societyId: string | null = null;
    const societyCode = input.society_code.trim();

    if (societyCode) {
      // Try direct match in societies table first
      const { data: directSociety } = await (supabaseAdmin
        .from('societies') as any)
        .select('id')
        .eq('society_code', societyCode)
        .maybeSingle();

      if (directSociety) {
        societyId = directSociety.id;
      } else {
        // Fallback: look in all_societies for a managed link
        const { data: allSociety } = await (supabaseAdmin
          .from('all_societies') as any)
          .select('id, managed_society_id')
          .eq('society_code', societyCode)
          .maybeSingle();

        if (allSociety?.managed_society_id) {
          societyId = allSociety.managed_society_id;
        }
      }
    }

    // 2. Map membership type to organization string
    const organizationMap: Record<string, string> = {
      UISP: 'UISP',
      FIDAL: 'FIDAL',
      ALTRO: 'ALTRO',
    };
    const organization = organizationMap[input.membership_type] ?? null;

    // 3. Find the active championship
    const { data: championship, error: champError } = await (supabaseAdmin
      .from('championships') as any)
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (champError || !championship) {
      console.error('No active championship found:', champError);
      return { success: false, error: 'Nessun campionato attivo trovato. Contatta il comitato.' };
    }

    // 4. Get next bib number
    const bibResult = await getNextBibNumbersAction(championship.id, 1);
    if (!bibResult.success) {
      return { success: false, error: 'Errore nella generazione del pettorale. Riprova.' };
    }
    const bibNumber = bibResult.bibNumbers[0];

    // 5. Find existing member or create new one
    let memberId: string;

    // First check if a member with this membership_number + organization already exists
    const { data: existingMember } = await (supabaseAdmin
      .from('members') as any)
      .select('id')
      .eq('membership_number', input.membership_number.trim())
      .eq('organization', organization)
      .maybeSingle();

    if (existingMember) {
      memberId = existingMember.id;
    } else {
      // Create new member
      const { data: newMember, error: memberError } = await (supabaseAdmin
        .from('members') as any)
        .insert({
          first_name: input.first_name.trim(),
          last_name: input.last_name.trim(),
          birth_date: input.birth_date,
          gender: input.gender,
          membership_number: input.membership_number.trim() || null,
          membership_type: input.membership_type,
          organization,
          category: input.category,
          society_id: societyId,
          membership_status: 'active',
          is_active: true,
          notes: `Iscrizione pubblica - Società: ${input.society_name.trim()} (${input.society_code.trim()})`,
        } as any)
        .select('id')
        .single();

      if (memberError) {
        console.error('Error inserting member (public registration):', JSON.stringify(memberError, null, 2));
        return { success: false, error: 'Errore durante il salvataggio dell\'atleta. Riprova più tardi.' };
      }
      memberId = newMember.id;
    }

    // Check if this member is already registered to the championship
    const { data: existingReg } = await (supabaseAdmin
      .from('championship_registrations') as any)
      .select('id, bib_number, status')
      .eq('championship_id', championship.id)
      .eq('member_id', memberId)
      .maybeSingle();

    if (existingReg) {
      if (existingReg.status === 'confirmed') {
        return { success: false, error: `Questo atleta è già iscritto al campionato con pettorale n° ${existingReg.bib_number}.` };
      }
      // Reactivate cancelled registration
      await (supabaseAdmin
        .from('championship_registrations') as any)
        .update({ status: 'confirmed' })
        .eq('id', existingReg.id);

      return { success: true, memberId, bibNumber: existingReg.bib_number };
    }

    // 6. Insert championship registration
    const registrationNotes = !societyId
      ? `Società: ${input.society_name.trim()} (${input.society_code.trim()})`
      : null;

    const { error: regError } = await (supabaseAdmin
      .from('championship_registrations') as any)
      .insert({
        championship_id: championship.id,
        member_id: memberId,
        society_id: societyId,
        bib_number: bibNumber,
        organization,
        category: input.category,
        status: 'confirmed' as const,
        notes: registrationNotes,
      });

    if (regError) {
      console.error('Error inserting championship registration:', JSON.stringify(regError, null, 2));
      // Clean up: member was created but registration failed
      return { success: false, error: 'Errore durante l\'iscrizione al campionato. Riprova più tardi.' };
    }

    // 7. Insert event registrations for all races in the championship
    const { data: races } = await (supabaseAdmin
      .from('events') as any)
      .select('id')
      .eq('championship_id', championship.id)
      .eq('is_active', true);

    if (races && races.length > 0) {
      const eventRegistrations = races.map((race: any) => ({
        event_id: race.id,
        member_id: memberId,
        society_id: societyId,
        bib_number: bibNumber,
        organization,
        category: input.category,
        status: 'confirmed',
      }));

      const { error: eventRegError } = await (supabaseAdmin
        .from('event_registrations') as any)
        .insert(eventRegistrations);

      if (eventRegError) {
        console.error('Error inserting event registrations:', JSON.stringify(eventRegError, null, 2));
        // Non-fatal: championship registration succeeded, events can be added later
      }
    }

    return { success: true, memberId, bibNumber: bibNumber! };
  } catch (error: any) {
    console.error('Error in publicRegisterAthleteAction:', error);
    return { success: false, error: error.message || 'Errore sconosciuto' };
  }
}
