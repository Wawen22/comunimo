'use client';

import { useState, useEffect } from 'react';
import { Event, Society } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Calendar, MapPin } from 'lucide-react';
import EventRegistrationsList from './EventRegistrationsList';
import EventMemberSelectionDialog from './EventMemberSelectionDialog';
import { supabase } from '@/lib/api/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface EventRegistrationsProps {
  event: Event;
  societyId: string;
  isAdmin?: boolean;
}

export default function EventRegistrations({
  event,
  societyId: initialSocietyId,
  isAdmin = false,
}: EventRegistrationsProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>(initialSocietyId);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [isLoadingSocieties, setIsLoadingSocieties] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch societies for admin users
  useEffect(() => {
    if (isAdmin) {
      fetchSocieties();
    }
  }, [isAdmin]);

  const fetchSocieties = async () => {
    try {
      setIsLoadingSocieties(true);
      const { data, error } = await supabase
        .from('societies')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching societies:', error);
        return;
      }

      setSocieties(data || []);
    } catch (error) {
      console.error('Error in fetchSocieties:', error);
    } finally {
      setIsLoadingSocieties(false);
    }
  };

  const handleRegistrationSuccess = () => {
    // Refresh the list
    setRefreshKey((prev) => prev + 1);
  };

  const handleSocietyChange = (newSocietyId: string) => {
    setSelectedSocietyId(newSocietyId);
    setRefreshKey((prev) => prev + 1);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Event Info and Action Button */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestione Iscrizioni</h1>
          <div className="mt-4 space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {event.event_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.event_date)}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="lg">
          <UserPlus className="mr-2 h-4 w-4" />
          Nuova Iscrizione
        </Button>
      </div>

      {/* Society Selector for Admin */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Seleziona Società</CardTitle>
            <CardDescription>
              Scegli la società per cui gestire le iscrizioni
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="society-select">Società</Label>
              <Select
                value={selectedSocietyId}
                onValueChange={handleSocietyChange}
                disabled={isLoadingSocieties}
              >
                <SelectTrigger id="society-select">
                  <SelectValue placeholder="Seleziona una società" />
                </SelectTrigger>
                <SelectContent>
                  {societies.map((society) => (
                    <SelectItem key={society.id} value={society.id}>
                      {society.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registrations List */}
      <EventRegistrationsList
        key={refreshKey}
        eventId={event.id}
        societyId={selectedSocietyId}
        onUpdate={() => setRefreshKey((prev) => prev + 1)}
      />

      {/* Member Selection Dialog */}
      <EventMemberSelectionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        event={event}
        societyId={selectedSocietyId}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
}

