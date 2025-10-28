'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api/supabase';
import { EventRegistrationWithDetails } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/toast';
import { Loader2, Users, LayoutGrid, List } from 'lucide-react';
import { RegistrationCard } from './RegistrationCard';
import { RegistrationsFilters } from './RegistrationsFilters';

interface EventRegistrationsListProps {
  eventId: string;
  societyId: string;
  onUpdate?: () => void;
}

export default function EventRegistrationsList({
  eventId,
  societyId,
  onUpdate,
}: EventRegistrationsListProps) {
  const { toast } = useToast();

  const [registrations, setRegistrations] = useState<EventRegistrationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [registrationToCancel, setRegistrationToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [eventId, societyId]);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('event_registrations')
        .select(`
          *,
          member:members(*),
          society:societies(*),
          event:events(*)
        `)
        .eq('event_id', eventId);

      // Filter by society if provided
      if (societyId) {
        query = query.eq('society_id', societyId);
      }

      const { data, error } = await query.order('bib_number') as {
        data: EventRegistrationWithDetails[] | null;
        error: any
      };

      if (error) {
        console.error('Error fetching registrations:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile caricare le iscrizioni',
          variant: 'destructive',
        });
        return;
      }

      setRegistrations(data || []);
    } catch (error) {
      console.error('Error in fetchRegistrations:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = (registrationId: string) => {
    setRegistrationToCancel(registrationId);
  };

  const handleCancelRegistration = async (registrationId: string) => {
    try {
      setIsCancelling(true);

      const { error } = await (supabase
        .from('event_registrations') as any)
        .update({ status: 'cancelled' })
        .eq('id', registrationId);

      if (error) {
        console.error('Error cancelling registration:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile annullare l\'iscrizione',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Successo',
        description: 'Iscrizione annullata',
      });

      // Refresh list
      fetchRegistrations();
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error in handleCancelRegistration:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
      setRegistrationToCancel(null);
    }
  };

  // Get available categories
  const availableCategories = Array.from(new Set(registrations.map(r => r.category).filter(Boolean))) as string[];

  // Filter registrations - only show confirmed
  const confirmedRegistrations = registrations.filter(r => r.status === 'confirmed');

  const filteredRegistrations = confirmedRegistrations.filter((reg) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      reg.member.first_name.toLowerCase().includes(searchLower) ||
      reg.member.last_name.toLowerCase().includes(searchLower) ||
      reg.member.fiscal_code?.toLowerCase().includes(searchLower) ||
      reg.member.membership_number?.toLowerCase().includes(searchLower) ||
      reg.bib_number?.toLowerCase().includes(searchLower);

    // Organization filter
    const matchesOrganization = selectedOrganizations.length === 0 ||
      (reg.organization && selectedOrganizations.includes(reg.organization));

    // Category filter
    const matchesCategory = selectedCategories.length === 0 ||
      (reg.category && selectedCategories.includes(reg.category));

    return matchesSearch && matchesOrganization && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters and View Toggle */}
      <Card className="border-2 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Title and View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Atleti Iscritti
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredRegistrations.length} {filteredRegistrations.length === 1 ? 'atleta' : 'atleti'}
                  {confirmedRegistrations.length !== filteredRegistrations.length && ` su ${confirmedRegistrations.length} totali`}
                </p>
              </div>
              {filteredRegistrations.length > 0 && (
                <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="gap-2"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Card
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="gap-2"
                  >
                    <List className="h-4 w-4" />
                    Lista
                  </Button>
                </div>
              )}
            </div>

            {/* Filters */}
            <RegistrationsFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedOrganizations={selectedOrganizations}
              onOrganizationsChange={setSelectedOrganizations}
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              availableCategories={availableCategories}
              totalCount={confirmedRegistrations.length}
              filteredCount={filteredRegistrations.length}
            />
          </div>
        </CardContent>
      </Card>

      {/* Registrations Display */}
      {filteredRegistrations.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="text-center py-16 px-4">
            <div className="max-w-sm mx-auto">
              <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || selectedOrganizations.length > 0 || selectedCategories.length > 0
                  ? 'Nessun risultato'
                  : 'Nessun atleta iscritto'}
              </h3>
              <p className="text-gray-500 text-sm">
                {searchQuery || selectedOrganizations.length > 0 || selectedCategories.length > 0
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Non ci sono ancora atleti iscritti a questo evento'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegistrations.map((reg) => (
            <RegistrationCard
              key={reg.id}
              registration={reg}
              onCancel={handleCancelClick}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <Card className="border-2 shadow-md">
          <CardContent className="p-0">
            <div className="space-y-2 p-4">
              {filteredRegistrations.map((reg) => (
                <RegistrationCard
                  key={reg.id}
                  registration={reg}
                  onCancel={handleCancelClick}
                  showActions={true}
                  compact={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Registration Dialog */}
      <AlertDialog open={!!registrationToCancel} onOpenChange={() => setRegistrationToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Annullamento</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler annullare questa iscrizione? L'azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (registrationToCancel) {
                  handleCancelRegistration(registrationToCancel);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Annullamento...
                </>
              ) : (
                'Conferma Annullamento'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
