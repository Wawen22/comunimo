'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api/supabase';
import { ChampionshipRegistrationWithDetails } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/toast';
import { Search, Loader2, UserX, Users, LayoutGrid, List } from 'lucide-react';
import { RegistrationCard } from './RegistrationCard';
import { RegistrationsFilters } from './RegistrationsFilters';

interface ChampionshipRegistrationsListProps {
  championshipId: string;
  societyId: string;
  onUpdate?: () => void;
}

export default function ChampionshipRegistrationsList({
  championshipId,
  societyId,
  onUpdate,
}: ChampionshipRegistrationsListProps) {
  const { toast } = useToast();

  const [registrations, setRegistrations] = useState<ChampionshipRegistrationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [registrationToCancel, setRegistrationToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [championshipId, societyId]);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);

      // Build query
      let query = supabase
        .from('championship_registrations')
        .select(`
          *,
          member:members(*),
          society:societies(*),
          championship:championships(*)
        `)
        .eq('championship_id', championshipId)
        .eq('status', 'confirmed');

      // Only filter by society if not "all"
      if (societyId !== 'all') {
        query = query.eq('society_id', societyId);
      }

      const { data, error } = await query.order('bib_number', { ascending: true });

      if (error) throw error;

      setRegistrations(data as any || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le iscrizioni. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRegistration = (registrationId: string) => {
    setRegistrationToCancel(registrationId);
  };

  const confirmCancelRegistration = async () => {
    if (!registrationToCancel) return;

    try {
      setIsCancelling(true);

      // Update championship registration status
      const { error: champError } = await supabase
        .from('championship_registrations')
        // @ts-expect-error - Supabase type inference issue
        .update({ status: 'cancelled' })
        .eq('id', registrationToCancel);

      if (champError) throw champError;

      // Also cancel all event registrations for this member in this championship
      const registration = registrations.find((r) => r.id === registrationToCancel);
      if (registration) {
        // Get event IDs for this championship
        const eventsResult = await supabase
          .from('events')
          .select('id')
          .eq('championship_id', championshipId) as { data: any[] | null; error: any };

        const eventIds = eventsResult.data?.map((e) => e.id) || [];

        const { error: eventError } = await supabase
          .from('event_registrations')
          // @ts-expect-error - Supabase type inference issue
          .update({ status: 'cancelled' })
          .eq('member_id', registration.member_id)
          .in('event_id', eventIds);

        if (eventError) throw eventError;
      }

      toast({
        title: 'Iscrizione cancellata',
        description: 'L\'iscrizione è stata cancellata con successo.',
      });

      setRegistrationToCancel(null);
      await fetchRegistrations();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile cancellare l\'iscrizione. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Get available categories
  const availableCategories = Array.from(new Set(registrations.map(r => r.category).filter(Boolean))) as string[];

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const member = reg.member as any;
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      fullName.includes(query) ||
      reg.bib_number.includes(query) ||
      member.fiscal_code?.toLowerCase().includes(query) ||
      member.membership_number?.toLowerCase().includes(query);

    const matchesOrganization = selectedOrganizations.length === 0 ||
      (reg.organization && selectedOrganizations.includes(reg.organization));

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
                  {registrations.length !== filteredRegistrations.length && ` su ${registrations.length} totali`}
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
              totalCount={registrations.length}
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
                  : 'Non ci sono ancora atleti iscritti a questo campionato'}
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
              onCancel={handleCancelRegistration}
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
                  onCancel={handleCancelRegistration}
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
                  confirmCancelRegistration();
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
