'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/api/supabase';
import { Member, Championship, Race } from '@/types/database';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Loader2, UserPlus } from 'lucide-react';
import MemberSelectionList from './MemberSelectionList';
import { getNextBibNumbers } from '@/lib/utils/bibNumberUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChampionshipRegistrationFormProps {
  championship: Championship;
  societyId: string;
  onSuccess?: () => void;
}

export default function ChampionshipRegistrationForm({
  championship,
  societyId,
  onSuccess,
}: ChampionshipRegistrationFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [alreadyRegisteredIds, setAlreadyRegisteredIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [organizationFilter, setOrganizationFilter] = useState<'all' | 'FIDAL' | 'UISP'>('all');

  useEffect(() => {
    fetchData();
  }, [championship.id, societyId]);

  const fetchData = async () => {
    try {
      setIsFetching(true);

      // Fetch society members
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('society_id', societyId)
        .eq('is_active', true)
        .order('last_name', { ascending: true });

      if (membersError) throw membersError;

      // Fetch championship races
      const { data: racesData, error: racesError } = await supabase
        .from('events')
        .select('*')
        .eq('championship_id', championship.id)
        .eq('is_active', true)
        .order('event_number', { ascending: true });

      if (racesError) throw racesError;

      // Fetch already registered members
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('championship_registrations')
        .select('member_id')
        .eq('championship_id', championship.id)
        .eq('status', 'confirmed') as { data: any[] | null; error: any };

      if (registrationsError) throw registrationsError;

      setMembers(membersData || []);
      setRaces(racesData || []);
      setAlreadyRegisteredIds(
        registrationsData?.map((r) => r.member_id) || []
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i dati. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedMemberIds.length === 0) {
      toast({
        title: 'Attenzione',
        description: 'Seleziona almeno un atleta da iscrivere.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Check for existing cancelled registrations
      const { data: existingCancelled, error: checkError } = await supabase
        .from('championship_registrations')
        .select('*')
        .eq('championship_id', championship.id)
        .in('member_id', selectedMemberIds)
        .eq('status', 'cancelled') as { data: any[] | null; error: any };

      if (checkError) throw checkError;

      const existingCancelledIds = existingCancelled?.map((r) => r.member_id) || [];
      const newMemberIds = selectedMemberIds.filter((id) => !existingCancelledIds.includes(id));

      let insertedRegistrations: any[] = [];

      // Reactivate cancelled registrations
      if (existingCancelled && existingCancelled.length > 0) {
        const { data: reactivated, error: reactivateError } = await supabase
          .from('championship_registrations')
          // @ts-expect-error - Supabase type inference issue
          .update({
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('championship_id', championship.id)
          .in('member_id', existingCancelledIds)
          .eq('status', 'cancelled')
          .select() as { data: any[] | null; error: any };

        if (reactivateError) throw reactivateError;
        if (reactivated) insertedRegistrations.push(...reactivated);
      }

      // Create new registrations for members without cancelled registrations (with retry for bib number conflicts)
      if (newMemberIds.length > 0) {
        const MAX_RETRIES = 3;
        let newRegistrations: any[] | null = null;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          // Get next bib numbers (re-fetched on each retry)
          const bibNumbers = await getNextBibNumbers(
            championship.id,
            newMemberIds.length
          );

          const championshipRegistrations = newMemberIds.map((memberId, index) => {
            const member = members.find((m) => m.id === memberId);
            return {
              championship_id: championship.id,
              member_id: memberId,
              society_id: societyId,
              bib_number: bibNumbers[index],
              organization: member?.organization || null,
              category: member?.category || null,
              status: 'confirmed' as const,
              created_by: user?.id || null,
            };
          });

          const { data: insertedData, error: champRegError } = await supabase
            .from('championship_registrations')
            .insert(championshipRegistrations as any)
            .select() as { data: any[] | null; error: any };

          if (!champRegError) {
            newRegistrations = insertedData;
            break; // Success
          }

          // If it's a duplicate key error on bib_number, retry with fresh bib numbers
          if (champRegError.code === '23505' && attempt < MAX_RETRIES - 1) {
            console.warn(`Bib number conflict (attempt ${attempt + 1}), retrying...`);
            continue;
          }

          throw champRegError; // Non-retryable error or last attempt
        }

        if (newRegistrations) insertedRegistrations.push(...newRegistrations);
      }

      if (insertedRegistrations.length === 0) throw new Error('No registrations created');

      // Get all race IDs for this championship
      const raceIds = races.map((r) => r.id);

      // Reactivate cancelled event registrations for reactivated championship registrations
      if (existingCancelledIds.length > 0) {
        const { error: reactivateEventError } = await supabase
          .from('event_registrations')
          // @ts-expect-error - Supabase type inference issue
          .update({
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .in('member_id', existingCancelledIds)
          .in('event_id', raceIds)
          .eq('status', 'cancelled');

        if (reactivateEventError) throw reactivateEventError;
      }

      // Prepare event registrations for NEW championship registrations only
      const eventRegistrations: any[] = [];
      const newRegistrations = insertedRegistrations.filter((r) => newMemberIds.includes(r.member_id));

      for (const champReg of newRegistrations) {
        for (const race of races) {
          eventRegistrations.push({
            event_id: race.id,
            member_id: champReg.member_id,
            bib_number: champReg.bib_number,
            organization: champReg.organization,
            category: champReg.category,
            status: 'confirmed',
          });
        }
      }

      // Insert new event registrations
      if (eventRegistrations.length > 0) {
        const { error: eventRegError } = await supabase
          .from('event_registrations')
          .insert(eventRegistrations as any);

        if (eventRegError) throw eventRegError;
      }

      toast({
        title: 'Iscrizioni completate',
        description: `${selectedMemberIds.length} atleti iscritti con successo al campionato.`,
      });

      // Reset selection
      setSelectedMemberIds([]);

      // Refresh data
      await fetchData();

      // Call onSuccess callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error registering members:', error);

      let errorMessage = 'Impossibile completare le iscrizioni. Riprova.';

      if (error.code === '23505') {
        // Unique constraint violation
        errorMessage = 'Uno o più atleti sono già iscritti a questo campionato.';
      }

      toast({
        title: 'Errore',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Filter members by organization
  const filteredMembers = organizationFilter === 'all'
    ? members
    : members.filter((m) => m.organization === organizationFilter);

  return (
    <div className="space-y-6">
      {/* Organization Filter Tabs */}
      <Tabs value={organizationFilter} onValueChange={(value) => setOrganizationFilter(value as 'all' | 'FIDAL' | 'UISP')}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">
            Tutti ({members.length})
          </TabsTrigger>
          <TabsTrigger value="FIDAL">
            FIDAL ({members.filter((m) => m.organization === 'FIDAL').length})
          </TabsTrigger>
          <TabsTrigger value="UISP">
            UISP ({members.filter((m) => m.organization === 'UISP').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <MemberSelectionList
        members={filteredMembers}
        selectedMemberIds={selectedMemberIds}
        onSelectionChange={setSelectedMemberIds}
        alreadyRegisteredIds={alreadyRegisteredIds}
      />

      {/* Submit Button */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
        <div>
          <p className="font-medium">
            {selectedMemberIds.length} atleti selezionati
          </p>
          <p className="text-sm text-gray-600">
            Verranno iscritti a tutte le {races.length} tappe del campionato
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || selectedMemberIds.length === 0}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iscrizione in corso...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Iscrivi Selezionati ({selectedMemberIds.length})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

