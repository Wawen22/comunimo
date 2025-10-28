'use client';

import { useState, useEffect } from 'react';
import { Member, Event } from '@/types/database';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, UserPlus } from 'lucide-react';
import MemberSelectionList from './MemberSelectionList';
import { getNextEventBibNumbers } from '@/lib/utils/bibNumberUtils';

interface EventMemberSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  societyId: string;
  onSuccess?: () => void;
}

export default function EventMemberSelectionDialog({
  open,
  onOpenChange,
  event,
  societyId,
  onSuccess,
}: EventMemberSelectionDialogProps) {
  const { toast } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [alreadyRegisteredIds, setAlreadyRegisteredIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [organizationFilter, setOrganizationFilter] = useState<'all' | 'FIDAL' | 'UISP'>('all');

  useEffect(() => {
    if (open && societyId) {
      fetchData();
    }
  }, [open, event.id, societyId]);

  const fetchData = async () => {
    try {
      setIsFetching(true);

      // Fetch members from the selected society
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('society_id', societyId)
        .eq('is_active', true)
        .order('last_name');

      if (membersError) throw membersError;

      // Fetch existing registrations for this event
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('event_registrations')
        .select('member_id')
        .eq('event_id', event.id)
        .neq('status', 'cancelled') as { data: any[] | null; error: any };

      if (registrationsError) throw registrationsError;

      setMembers(membersData || []);
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
        .from('event_registrations')
        .select('id, member_id, bib_number')
        .eq('event_id', event.id)
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

      // Update cancelled registrations
      if (membersToUpdate.length > 0) {
        for (const memberId of membersToUpdate) {
          const existing = existingCancelledMap.get(memberId);
          const member = members.find((m) => m.id === memberId);

          const { error: updateError } = await supabase
            .from('event_registrations')
            // @ts-expect-error - Supabase type inference issue
            .update({
              status: 'confirmed',
              organization: member?.organization || null,
              category: member?.category || null,
              society_id: societyId,
              registration_date: new Date().toISOString().split('T')[0],
            })
            .eq('id', existing.id);

          if (updateError) throw updateError;
        }
      }

      // Insert new registrations
      if (membersToInsert.length > 0) {
        // Get next available bib numbers only for new registrations
        const nextBibNumbers = await getNextEventBibNumbers(
          event.id,
          membersToInsert.length
        );

        const eventRegistrations = membersToInsert.map((memberId, index) => {
          const member = members.find((m) => m.id === memberId);
          return {
            event_id: event.id,
            member_id: memberId,
            society_id: societyId,
            bib_number: nextBibNumbers[index],
            organization: member?.organization || null,
            category: member?.category || null,
            status: 'confirmed',
            registration_date: new Date().toISOString().split('T')[0],
          };
        });

        const { error: insertError } = await supabase
          .from('event_registrations')
          .insert(eventRegistrations as any);

        if (insertError) throw insertError;
      }

      toast({
        title: 'Iscrizioni completate',
        description: `${selectedMemberIds.length} atleti iscritti con successo all'evento.`,
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
        errorMessage = 'Uno o più atleti sono già iscritti a questo evento.';
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

  // Filter members by organization
  const filteredMembers = organizationFilter === 'all'
    ? members
    : members.filter((m) => m.organization === organizationFilter);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Iscrivi Atleti all'Evento</DialogTitle>
          <DialogDescription>
            Seleziona gli atleti da iscrivere all'evento "{event.title}".
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
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
          </div>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="text-sm text-gray-600">
            {selectedMemberIds.length} atleti selezionati
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || selectedMemberIds.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iscrizione in corso...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Iscrivi {selectedMemberIds.length > 0 ? `(${selectedMemberIds.length})` : ''}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

