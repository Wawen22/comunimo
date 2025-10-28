'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api/supabase';
import { Member, Event } from '@/types/database';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Loader2, UserPlus } from 'lucide-react';
import MemberSelectionList from './MemberSelectionList';
import { getNextEventBibNumbers } from '@/lib/utils/bibNumberUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EventRegistrationFormProps {
  event: Event;
  societyId: string;
  onSuccess?: () => void;
}

export default function EventRegistrationForm({
  event,
  societyId,
  onSuccess,
}: EventRegistrationFormProps) {
  const { toast } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');

  useEffect(() => {
    if (societyId) {
      fetchMembers();
    }
  }, [societyId, event.id]);

  const fetchMembers = async () => {
    try {
      setIsLoadingMembers(true);

      // Fetch members from the selected society
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('society_id', societyId)
        .eq('is_active', true)
        .order('last_name') as { data: Member[] | null; error: any };

      if (membersError) {
        console.error('Error fetching members:', membersError);
        toast({
          title: 'Errore',
          description: 'Impossibile caricare gli atleti',
          variant: 'destructive',
        });
        return;
      }

      // Fetch existing registrations for this event
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('event_registrations')
        .select('member_id, status')
        .eq('event_id', event.id) as {
          data: { member_id: string; status: string }[] | null;
          error: any
        };

      if (registrationsError) {
        console.error('Error fetching registrations:', registrationsError);
      }

      // Filter out members who are already registered (and not cancelled)
      const registeredMemberIds = new Set(
        (registrationsData || [])
          .filter((reg) => reg.status !== 'cancelled')
          .map((reg) => reg.member_id)
      );

      const availableMembers = (membersData || []).filter(
        (member) => !registeredMemberIds.has(member.id)
      );

      setMembers(availableMembers);
    } catch (error) {
      console.error('Error in fetchMembers:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedMemberIds.length === 0) {
      toast({
        title: 'Attenzione',
        description: 'Seleziona almeno un atleta',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Get next bib numbers for the event
      const bibNumbers = await getNextEventBibNumbers(event.id, selectedMemberIds.length);

      // Prepare registrations
      const registrations = selectedMemberIds.map((memberId, index) => {
        const member = members.find((m) => m.id === memberId);
        return {
          event_id: event.id,
          member_id: memberId,
          society_id: societyId,
          bib_number: bibNumbers[index],
          organization: member?.organization || null,
          category: member?.category || null,
          specialty: null,
          registration_date: new Date().toISOString(),
          status: 'confirmed',
          notes: null,
        };
      });

      // Insert registrations
      const { error: insertError } = await supabase
        .from('event_registrations')
        .insert(registrations as any);

      if (insertError) {
        console.error('Error inserting registrations:', insertError);
        toast({
          title: 'Errore',
          description: 'Impossibile completare le iscrizioni',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Successo',
        description: `${selectedMemberIds.length} atleti iscritti con successo`,
      });

      // Reset form
      setSelectedMemberIds([]);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!societyId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Seleziona una società per iniziare</p>
      </div>
    );
  }

  if (isLoadingMembers) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization Filter Tabs */}
      <Tabs value={organizationFilter} onValueChange={setOrganizationFilter}>
        <TabsList>
          <TabsTrigger value="all">Tutti</TabsTrigger>
          <TabsTrigger value="FIDAL">FIDAL</TabsTrigger>
          <TabsTrigger value="UISP">UISP</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <MemberSelectionList
            members={members}
            selectedMemberIds={selectedMemberIds}
            onSelectionChange={setSelectedMemberIds}
          />
        </TabsContent>

        <TabsContent value="FIDAL" className="mt-6">
          <MemberSelectionList
            members={members.filter((m) => m.organization === 'FIDAL')}
            selectedMemberIds={selectedMemberIds}
            onSelectionChange={setSelectedMemberIds}
          />
        </TabsContent>

        <TabsContent value="UISP" className="mt-6">
          <MemberSelectionList
            members={members.filter((m) => m.organization === 'UISP')}
            selectedMemberIds={selectedMemberIds}
            onSelectionChange={setSelectedMemberIds}
          />
        </TabsContent>
      </Tabs>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-sm text-gray-600">
          {selectedMemberIds.length} atleti selezionati
        </p>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedMemberIds.length === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iscrizione in corso...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Iscrivi Atleti
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

