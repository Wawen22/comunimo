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
import { Search, Loader2, UserX, Users, LayoutGrid, List, UserPlus, Sparkles } from 'lucide-react';
import { RegistrationCard } from './RegistrationCard';
import { RegistrationsFilters } from './RegistrationsFilters';

interface ChampionshipRegistrationsListProps {
  championshipId: string;
  societyId: string;
  onUpdate?: () => void;
  onNewRegistration?: () => void;
}

export default function ChampionshipRegistrationsList({
  championshipId,
  societyId,
  onUpdate,
  onNewRegistration,
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
      <Card className="border-2 border-gray-200 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-5">
            {/* Title and View Mode Toggle */}
            <div className="space-y-3 sm:space-y-4">
              {/* Header Row: Title + View Toggle */}
              <div className="flex items-center justify-between gap-3">
                {/* Left: Icon + Title */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                      Atleti Iscritti
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 font-medium">
                      <span className="text-blue-600 font-bold">{filteredRegistrations.length}</span> {filteredRegistrations.length === 1 ? 'atleta' : 'atleti'}
                      {registrations.length !== filteredRegistrations.length && (
                        <span className="text-gray-400"> su {registrations.length} totali</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right: View Mode Toggle - Compact on Mobile */}
                {filteredRegistrations.length > 0 && (
                  <div className="flex items-center gap-0.5 sm:gap-1 bg-white border-2 border-gray-300 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-md flex-shrink-0">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`gap-1 transition-all text-xs px-2 py-1.5 sm:px-3 sm:py-2 h-auto ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md' : ''}`}
                    >
                      <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline text-xs">Card</span>
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={`gap-1 transition-all text-xs px-2 py-1.5 sm:px-3 sm:py-2 h-auto ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md' : ''}`}
                    >
                      <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline text-xs">Lista</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* New Registration Button Row - Full Width on Mobile */}
              {societyId !== 'all' && onNewRegistration && (
                <div className="relative">
                  {/* Step 2 Badge - Floating above button */}
                  <div className="absolute -top-3 -left-2 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    STEP 2
                  </div>
                  <Button
                    onClick={onNewRegistration}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all hover:scale-105 font-bold text-sm sm:text-base ring-2 ring-green-300 ring-offset-2"
                  >
                    <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Nuova Iscrizione
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
        <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="text-center py-20 px-4">
            <div className="max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="h-24 w-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <UserPlus className="h-12 w-12 text-blue-600" />
                </div>
                {!(searchQuery || selectedOrganizations.length > 0 || selectedCategories.length > 0) && (
                  <>
                    <div className="absolute top-0 right-1/3 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                    <div className="absolute top-0 right-1/3 w-3 h-3 bg-blue-500 rounded-full" />
                  </>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchQuery || selectedOrganizations.length > 0 || selectedCategories.length > 0
                  ? 'Nessun risultato trovato'
                  : 'Nessun atleta iscritto'}
              </h3>
              <p className="text-gray-600 text-base mb-6">
                {searchQuery || selectedOrganizations.length > 0 || selectedCategories.length > 0
                  ? 'Prova a modificare i filtri di ricerca per trovare altri atleti'
                  : 'Non ci sono ancora atleti iscritti a questo campionato. Inizia aggiungendo la prima iscrizione!'}
              </p>

              {/* Show "Nuova Iscrizione" button only when no filters are active and societyId is not 'all' */}
              {!(searchQuery || selectedOrganizations.length > 0 || selectedCategories.length > 0) &&
               societyId !== 'all' &&
               onNewRegistration && (
                <div className="relative inline-block">
                  {/* Step 2 Badge - Floating above button */}
                  <div className="absolute -top-3 -left-3 z-10 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    STEP 2
                  </div>
                  <Button
                    onClick={onNewRegistration}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-xl hover:shadow-2xl transition-all hover:scale-105 font-bold text-base px-8 py-6 ring-2 ring-green-300 ring-offset-2"
                  >
                    <UserPlus className="mr-2 h-6 w-6" />
                    Nuova Iscrizione
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredRegistrations.map((reg, index) => (
            <div
              key={reg.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <RegistrationCard
                registration={reg}
                onCancel={handleCancelRegistration}
                showActions={true}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-gray-200 shadow-xl bg-white">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {filteredRegistrations.map((reg, index) => (
                <div
                  key={reg.id}
                  className="animate-in fade-in slide-in-from-left-2 duration-300 hover:bg-gray-50 transition-colors"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="p-4">
                    <RegistrationCard
                      registration={reg}
                      onCancel={handleCancelRegistration}
                      showActions={true}
                      compact={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Registration Dialog */}
      <AlertDialog open={!!registrationToCancel} onOpenChange={() => setRegistrationToCancel(null)}>
        <AlertDialogContent className="border-2 border-red-200">
          <AlertDialogHeader>
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <UserX className="h-7 w-7 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-2xl">Conferma Annullamento</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              Sei sicuro di voler annullare questa iscrizione? <br />
              <span className="font-semibold text-red-600">L'azione non può essere annullata.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (registrationToCancel) {
                  confirmCancelRegistration();
                }
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Annullamento...
                </>
              ) : (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Conferma Annullamento
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
