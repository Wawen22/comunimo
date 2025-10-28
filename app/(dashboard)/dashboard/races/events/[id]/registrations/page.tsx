'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/api/supabase';
import { Event } from '@/types/database';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import EventRegistrations from '@/components/races/EventRegistrations';
import { useToast } from '@/components/ui/toast';
import { getUserFirstSociety } from '@/lib/utils/userSocietyUtils';

export default function EventRegistrationsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('user');
  const [userSocietyId, setUserSocietyId] = useState<string>('');

  useEffect(() => {
    fetchEventAndUser();
  }, [eventId]);

  const fetchEventAndUser = async () => {
    try {
      setIsLoading(true);

      // Fetch current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch user profile to get role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single() as { data: { role: string } | null; error: any };

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: 'Errore',
          description: 'Impossibile caricare il profilo utente',
          variant: 'destructive',
        });
        return;
      }

      setUserRole(profile?.role || 'user');

      // Get user's first assigned society (for backward compatibility)
      // Admin users don't need a society pre-selected
      const isAdminUser = profile?.role === 'admin' || profile?.role === 'super_admin';
      if (!isAdminUser) {
        const firstSociety = await getUserFirstSociety(user.id);
        setUserSocietyId(firstSociety?.id || '');
      }

      // Fetch event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('Error fetching event:', eventError);
        toast({
          title: 'Errore',
          description: 'Impossibile caricare la gara',
          variant: 'destructive',
        });
        return;
      }

      setEvent(eventData);
    } catch (error) {
      console.error('Error in fetchEventAndUser:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Gara non trovata</p>
        </div>
      </div>
    );
  }

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>
      </div>

      {/* Event Registrations Component */}
      <EventRegistrations
        event={event}
        societyId={userSocietyId}
        isAdmin={isAdmin}
      />
    </div>
  );
}

