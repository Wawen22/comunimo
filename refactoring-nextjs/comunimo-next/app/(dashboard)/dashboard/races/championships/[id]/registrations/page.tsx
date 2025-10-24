'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/api/supabase';
import { Championship, Society } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Search, Check, ChevronsUpDown } from 'lucide-react';
import ChampionshipRegistrations from '@/components/races/ChampionshipRegistrations';
import ChampionshipRegistrationsList from '@/components/races/ChampionshipRegistrationsList';
import MemberSelectionDialog from '@/components/races/MemberSelectionDialog';
import { useIsAdmin } from '@/lib/hooks/useUser';
import { getUserSocieties } from '@/lib/utils/userSocietyUtils';
import { cn } from '@/lib/utils';

export default function ChampionshipRegistrationsPage() {
  const params = useParams();
  const router = useRouter();
  const championshipId = params.id as string;
  const isAdmin = useIsAdmin();

  const [championship, setChampionship] = useState<Championship | null>(null);
  const [societyId, setSocietyId] = useState<string | null>(null);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchData();
  }, [championshipId]);

  useEffect(() => {
    if (championshipId) {
      fetchTotalRegistrations();
    }
  }, [championshipId]);

  const fetchTotalRegistrations = async () => {
    try {
      const { count, error } = await supabase
        .from('championship_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('championship_id', championshipId)
        .eq('status', 'confirmed');

      if (!error && count !== null) {
        setTotalRegistrations(count);
      }
    } catch (error) {
      console.error('Error fetching total registrations:', error);
    }
  };

  const handleRegistrationSuccess = () => {
    // Refresh the list and total count
    setRefreshKey((prev) => prev + 1);
    fetchTotalRegistrations();
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch championship
      const { data: championshipData, error: championshipError } = await supabase
        .from('championships')
        .select('*')
        .eq('id', championshipId)
        .eq('is_active', true)
        .single();

      if (championshipError) throw championshipError;

      if (!championshipData) {
        setError('Campionato non trovato');
        return;
      }

      setChampionship(championshipData);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Devi effettuare il login per accedere a questa pagina');
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single() as { data: { role: string } | null };

      const isUserAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
      setUserIsAdmin(isUserAdmin);

      if (isUserAdmin) {
        // Admin can manage all registrations - fetch all societies
        const { data: societiesData, error: societiesError } = await supabase
          .from('societies')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true }) as { data: Society[] | null; error: any };

        if (societiesError) throw societiesError;

        setSocieties(societiesData || []);
        // Set "all" as default for admin to see all registrations
        setSocietyId('all');
      } else {
        // Get user's assigned societies from user_societies table
        const userSocieties = await getUserSocieties(user.id);

        if (!userSocieties || userSocieties.length === 0) {
          setError('Non hai società assegnate. Contatta un amministratore per richiedere l\'accesso.');
          return;
        }

        // Filter only active societies
        const activeSocieties = userSocieties.filter((s) => s.is_active);

        if (activeSocieties.length === 0) {
          setError('Non hai società attive assegnate.');
          return;
        }

        setSocieties(activeSocieties);
        // Auto-select first society if only one
        if (activeSocieties.length === 1 && activeSocieties[0]) {
          setSocietyId(activeSocieties[0].id);
        }
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError('Errore nel caricamento dei dati');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !championship) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Errore'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Impossibile caricare il campionato'}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna Indietro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/races/championships/${championshipId}`)}
            className="hover:bg-white/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna al Campionato
          </Button>
        </div>

        {/* Gestione Iscrizioni Header - Always visible */}
        <div className="mb-6">
          <ChampionshipRegistrations
            championship={championship}
            societyId={societyId || ''}
            isAdmin={isAdmin}
            totalRegistrations={totalRegistrations}
            onlyHeader={true}
            onNewRegistration={() => setIsDialogOpen(true)}
          />
        </div>

        {/* Society Selector Card - for Admins and Multi-Society Users */}
        {(societies.length > 0 || userIsAdmin) && (
          <div className="mb-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Seleziona Società
              </label>

          {/* Custom Searchable Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex h-11 w-full items-center justify-between rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-all hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500"
            >
              <span className={cn(!societyId && "text-gray-500", societyId && "text-gray-900")}>
                {societyId === 'all'
                  ? '🏢 Tutte le Società'
                  : (() => {
                      const society = societies.find(s => s.id === societyId);
                      if (!society) return 'Seleziona una società...';
                      return society.society_code
                        ? `${society.name} (${society.society_code})`
                        : society.name;
                    })()}
              </span>
              <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            </button>

            {isDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />

                {/* Dropdown */}
                <div className="absolute z-50 mt-2 w-full rounded-lg border-2 border-gray-200 bg-white shadow-xl">
                  {/* Search Input */}
                  <div className="border-b border-gray-200 p-3 bg-gray-50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Cerca società..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 text-sm border-gray-300 focus:border-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="max-h-64 overflow-y-auto p-2">
                    {/* "Tutte le Società" option - only for admin */}
                    {userIsAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setSocietyId('all');
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className={cn(
                          "relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 pl-9 pr-3 text-sm outline-none transition-colors hover:bg-blue-50",
                          societyId === 'all' && "bg-blue-50 text-blue-700"
                        )}
                      >
                        <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
                          {societyId === 'all' && <Check className="h-4 w-4 text-blue-600" />}
                        </span>
                        <span className="font-semibold">🏢 Tutte le Società</span>
                      </button>
                    )}

                    {/* Separator if admin */}
                    {userIsAdmin && societies.length > 0 && (
                      <div className="my-2 h-px bg-gray-200" />
                    )}

                    {/* Society Options */}
                    {societies
                      .filter(society =>
                        society.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        society.society_code?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((society) => (
                        <button
                          key={society.id}
                          type="button"
                          onClick={() => {
                            setSocietyId(society.id);
                            setIsDropdownOpen(false);
                            setSearchQuery('');
                          }}
                          className={cn(
                            "relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 pl-9 pr-3 text-sm outline-none transition-colors hover:bg-gray-50",
                            societyId === society.id && "bg-blue-50 text-blue-700 font-medium"
                          )}
                        >
                          <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center">
                            {societyId === society.id && <Check className="h-4 w-4 text-blue-600" />}
                          </span>
                          <div className="flex flex-col items-start">
                            <span>{society.name}</span>
                            {society.society_code && (
                              <span className="text-xs text-gray-500 font-mono">
                                {society.society_code}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}

                    {/* No results */}
                    {societies.filter(society =>
                      society.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      society.society_code?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 && (
                      <div className="py-8 text-center text-sm text-gray-500">
                        <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>Nessuna società trovata</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
            </div>
          </div>
        )}

        {/* Main Content - Registrations List */}
        {societyId ? (
          <ChampionshipRegistrationsList
            key={refreshKey}
            championshipId={championship.id}
            societyId={societyId}
            onUpdate={() => setRefreshKey((prev) => prev + 1)}
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Seleziona una Società
              </h3>
              <p className="text-gray-600">
                {societies.length > 1
                  ? 'Scegli una società dal menu sopra per visualizzare e gestire le iscrizioni'
                  : 'Caricamento delle società...'}
              </p>
            </div>
          </div>
        )}

        {/* Member Selection Dialog - only render if specific society selected */}
        {societyId && societyId !== 'all' && (
          <MemberSelectionDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            championship={championship}
            societyId={societyId}
            onSuccess={handleRegistrationSuccess}
          />
        )}
      </div>
    </div>
  );
}

