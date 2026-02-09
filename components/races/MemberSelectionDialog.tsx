'use client';

import { useState, useEffect } from 'react';
import { Member, Championship, Race } from '@/types/database';
import { supabase } from '@/lib/api/supabase';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import MemberSelectionList from './MemberSelectionList';
import { getNextBibNumbersAction } from '@/actions/championships';

interface MemberSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  championship: Championship;
  societyId: string;
  onSuccess?: () => void;
}

export default function MemberSelectionDialog({
  open,
  onOpenChange,
  championship,
  societyId,
  onSuccess,
}: MemberSelectionDialogProps) {
  const { toast } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [alreadyRegisteredIds, setAlreadyRegisteredIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, championship.id, societyId]);

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

      // Fetch already registered members (only confirmed, not cancelled)
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('championship_registrations')
        .select('member_id, id, status')
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

      // Check for existing cancelled registrations
      const { data: existingCancelled, error: existingError } = await supabase
        .from('championship_registrations')
        .select('id, member_id, bib_number')
        .eq('championship_id', championship.id)
        .in('member_id', selectedMemberIds)
        .eq('status', 'cancelled') as { data: any[] | null; error: any };

      if (existingError) throw existingError;

      const existingCancelledMap = new Map(
        (existingCancelled || []).map((r) => [r.member_id, r])
      );

      // Separate members into those to update and those to insert
      const membersToUpdate: string[] = [];
      const membersToInsert: string[] = [];

      selectedMemberIds.forEach((memberId) => {
        if (existingCancelledMap.has(memberId)) {
          membersToUpdate.push(memberId);
        } else {
          membersToInsert.push(memberId);
        }
      });

      let champRegData: any[] = [];

      // Update cancelled registrations
      if (membersToUpdate.length > 0) {
        for (const memberId of membersToUpdate) {
          const existing = existingCancelledMap.get(memberId);
          const member = members.find((m) => m.id === memberId);

          const { data: updated, error: updateError } = await supabase
            .from('championship_registrations')
            // @ts-expect-error - Supabase type inference issue
            .update({
              status: 'confirmed',
              organization: member?.organization || null,
              category: member?.category || null,
              society_id: societyId,
            })
            .eq('id', existing.id)
            .select() as { data: any[] | null; error: any };

          if (updateError) throw updateError;
          if (updated) champRegData.push(...updated);
        }
      }

      // Insert new registrations (with retry for bib number conflicts)
      if (membersToInsert.length > 0) {
        const MAX_RETRIES = 3;
        let inserted: any[] | null = null;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          // Get next available bib numbers via server action (bypasses RLS to see all societies)
          const bibResult = await getNextBibNumbersAction(
            championship.id,
            membersToInsert.length
          );

          if (!bibResult.success) {
            throw new Error(bibResult.error);
          }

          const nextBibNumbers = bibResult.bibNumbers;

          const championshipRegistrations = membersToInsert.map((memberId, index) => {
            const member = members.find((m) => m.id === memberId);
            return {
              championship_id: championship.id,
              member_id: memberId,
              society_id: societyId,
              bib_number: nextBibNumbers[index],
              organization: member?.organization || null,
              category: member?.category || null,
              status: 'confirmed',
            };
          });

          const { data: insertedData, error: insertError } = await supabase
            .from('championship_registrations')
            .insert(championshipRegistrations as any)
            .select() as { data: any[] | null; error: any };

          if (!insertError) {
            inserted = insertedData;
            break; // Success
          }

          // If it's a duplicate key error on bib_number, retry with fresh bib numbers
          if (insertError.code === '23505' && attempt < MAX_RETRIES - 1) {
            console.warn(`Bib number conflict (attempt ${attempt + 1}), retrying...`);
            continue;
          }

          throw insertError; // Non-retryable error or last attempt
        }

        if (inserted) champRegData.push(...inserted);
      }

      // Handle event registrations for all races
      for (const race of races) {
        // Check for existing cancelled event registrations
        const { data: existingEventCancelled, error: existingEventError } = await supabase
          .from('event_registrations')
          .select('id, member_id, bib_number')
          .eq('event_id', race.id)
          .in('member_id', selectedMemberIds)
          .eq('status', 'cancelled') as { data: any[] | null; error: any };

        if (existingEventError) throw existingEventError;

        const existingEventMap = new Map(
          (existingEventCancelled || []).map((r) => [r.member_id, r])
        );

        // Update cancelled event registrations
        for (const champReg of champRegData || []) {
          if (existingEventMap.has(champReg.member_id)) {
            // Update existing cancelled registration
            const existing = existingEventMap.get(champReg.member_id);
            const { error: updateError } = await supabase
              .from('event_registrations')
              // @ts-expect-error - Supabase type inference issue
              .update({
                status: 'confirmed',
                bib_number: champReg.bib_number,
                organization: champReg.organization,
                category: champReg.category,
                society_id: societyId,
              })
              .eq('id', existing.id);

            if (updateError) throw updateError;
          } else {
            // Insert new event registration
            const { error: insertError } = await supabase
              .from('event_registrations')
              .insert({
                society_id: societyId,
                event_id: race.id,
                member_id: champReg.member_id,
                bib_number: champReg.bib_number,
                organization: champReg.organization,
                category: champReg.category,
                status: 'confirmed',
              } as any);

            if (insertError) throw insertError;
          }
        }
      }

      toast({
        title: 'Iscrizioni completate',
        description: `${selectedMemberIds.length} atleti iscritti con successo al campionato.`,
      });

      // Reset selection
      setSelectedMemberIds([]);

      // Close dialog
      onOpenChange(false);

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



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 gap-0 flex flex-col">
        {/* Sticky Header with Action Buttons - Fixed Height */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
            <DialogTitle className="text-xl sm:text-2xl">Iscrivi Atleti al Campionato</DialogTitle>
            <DialogDescription className="text-sm sm:text-base mt-1 sm:mt-2">
              Seleziona gli atleti da iscrivere. Verranno automaticamente iscritti a tutte le {races.length} tappe del campionato e riceveranno un numero pettorale persistente.
            </DialogDescription>
          </DialogHeader>

          {/* Action Bar - Responsive */}
          <div className="px-4 sm:px-6 pb-4">
            {/* Desktop Layout (≥640px) */}
            <div className="hidden sm:flex items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              {/* Counter */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">Atleti selezionati</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedMemberIds.length}
                    {members.length > 0 && (
                      <span className="text-base font-normal text-gray-500 ml-1">
                        / {members.filter(m => !alreadyRegisteredIds.includes(m.id)).length}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  size="lg"
                  className="font-semibold"
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || selectedMemberIds.length === 0}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all hover:scale-105 font-bold min-w-[180px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iscrizione in corso...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Iscrivi {selectedMemberIds.length > 0 ? `(${selectedMemberIds.length})` : ''}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile Layout (<640px) */}
            <div className="sm:hidden space-y-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              {/* Counter - Compact */}
              <div className="flex items-center gap-3 justify-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <UserPlus className="h-4 w-4 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-600">Selezionati</div>
                  <div className="text-xl font-bold text-gray-900">
                    {selectedMemberIds.length}
                    {members.length > 0 && (
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        / {members.filter(m => !alreadyRegisteredIds.includes(m.id)).length}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Full Width */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || selectedMemberIds.length === 0}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg font-bold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iscrizione in corso...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Iscrivi {selectedMemberIds.length > 0 ? `(${selectedMemberIds.length})` : ''}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  size="lg"
                  className="w-full font-semibold"
                >
                  Annulla
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content - Flexible Height */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6 min-h-0">
          {isFetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <MemberSelectionList
              members={members}
              selectedMemberIds={selectedMemberIds}
              onSelectionChange={setSelectedMemberIds}
              alreadyRegisteredIds={alreadyRegisteredIds}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

