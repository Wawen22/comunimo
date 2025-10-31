'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/api/supabase';
import { Championship, Society, Race } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Search, Check, ChevronsUpDown, UserPlus, X, Users, ArrowDown, Sparkles, Info, Flag, BarChart3 } from 'lucide-react';
import ChampionshipRegistrations from '@/components/races/ChampionshipRegistrations';
import ChampionshipRegistrationsList from '@/components/races/ChampionshipRegistrationsList';
import MemberSelectionDialog from '@/components/races/MemberSelectionDialog';
import { ChampionshipInfoModal } from '@/components/races/ChampionshipInfoModal';
import { ChampionshipStagesModal } from '@/components/races/ChampionshipStagesModal';
import { ChampionshipRankingsModal } from '@/components/races/ChampionshipRankingsModal';
import { useIsAdmin } from '@/lib/hooks/useUser';
import { getUserSocieties } from '@/lib/utils/userSocietyUtils';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ChampionshipRegistrationsPage() {
  const params = useParams();
  const router = useRouter();
  const championshipId = params.id as string;
  const isAdmin = useIsAdmin();

  const [championship, setChampionship] = useState<(Championship & { race_count: number }) | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showStagesModal, setShowStagesModal] = useState(false);
  const [showRankingsModal, setShowRankingsModal] = useState(false);
  const [raceRegistrationCounts, setRaceRegistrationCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
  }, [championshipId]);

  useEffect(() => {
    if (championshipId) {
      fetchTotalRegistrations();
    }
  }, [championshipId]);

  const hasSpecificSocietySelected = !!societyId && societyId !== 'all';
  const isAllSocietiesSelected = societyId === 'all';
  const hasAnySocietySelection = !!societyId;
  const stageRankingsCount = races.filter((race) => Boolean(race.results_url)).length;
  const championshipRankingsCount = [championship?.society_ranking_url, championship?.individual_ranking_url].filter(Boolean).length;
  const totalRankingsCount = stageRankingsCount + championshipRankingsCount;

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

      // Fetch races for this championship
      const { data: racesData, error: racesError } = await supabase
        .from('events')
        .select('*')
        .eq('championship_id', championshipId)
        .eq('is_active', true)
        .order('event_number', { ascending: true });

      if (racesError) throw racesError;

      setRaces(racesData || []);

      // Fetch registration counts for each race
      if (racesData && racesData.length > 0) {
        const raceIds = (racesData as Race[]).map(race => race.id);
        const { data: eventRegistrations } = await supabase
          .from('event_registrations')
          .select('event_id')
          .in('event_id', raceIds)
          .eq('status', 'confirmed');

        // Count registrations per race
        const counts: Record<string, number> = {};
        (eventRegistrations as { event_id: string }[] | null)?.forEach(reg => {
          counts[reg.event_id] = (counts[reg.event_id] || 0) + 1;
        });
        setRaceRegistrationCounts(counts);
      }

      setChampionship({
        ...(championshipData as Championship),
        race_count: racesData?.length || 0,
      });

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

  const handleChampionshipRankingChange = (kind: 'society' | 'individual', url: string | null) => {
    setChampionship((prev) => {
      if (!prev) return prev;

      if (kind === 'society') {
        return {
          ...prev,
          society_ranking_url: url,
        };
      }

      return {
        ...prev,
        individual_ranking_url: url,
      };
    });
  };

  const handleStageRankingChange = (raceId: string, url: string | null) => {
    setRaces((prev) =>
      prev.map((race) =>
        race.id === raceId
          ? {
              ...race,
              results_url: url,
            }
          : race,
      ),
    );
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/races/championships')}
            className="hover:bg-white/80 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna ai Campionati
          </Button>
        </div>

        {/* Hero Header - Soft Gradient */}
        <div className="mb-6 sm:mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 md:p-8 shadow-lg border border-blue-100">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/20 rounded-full -ml-48 -mb-48 blur-3xl" />

            <div className="relative z-10">
              {/* Mobile Layout (<768px) */}
              <div className="md:hidden space-y-3">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100/80 backdrop-blur-sm border border-blue-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse-slow" />
                  <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">
                    Gestione Iscrizioni
                  </span>
                </div>

                {/* Title + Stats Inline */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-extrabold text-gray-900 mb-1.5 leading-tight">
                      {championship.name}
                    </h1>
                    <p className="text-gray-700 text-xs">
                      {championship.season && `Stagione ${championship.season} • `}
                      Anno {championship.year}
                    </p>
                  </div>

                  {/* Quick Stats - Compact Badge */}
                  <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md rounded-lg px-3 py-2 border border-blue-200 shadow-md flex-shrink-0">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-xl font-bold text-gray-900 leading-none">
                        {totalRegistrations}
                      </div>
                      <div className="text-[9px] text-gray-600 uppercase tracking-wide font-medium mt-0.5">
                        Iscritti
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Mobile */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg animate-pulse">
                        INFO
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowInfoModal(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 border-0 h-12 font-bold ring-2 ring-blue-300 ring-offset-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-white/20 rounded-lg">
                          <Info className="h-5 w-5" />
                        </div>
                        <span>Info</span>
                      </div>
                    </Button>
                  </div>
                  <div className="flex-1 relative">
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg">
                        {championship.race_count}
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowStagesModal(true)}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 border-0 h-12 font-bold ring-2 ring-orange-300 ring-offset-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-white/20 rounded-lg">
                          <Flag className="h-5 w-5" />
                      </div>
                      <span>Tappe</span>
                    </div>
                  </Button>
                  </div>
                  <div className="flex-1 relative">
                    {totalRankingsCount > 0 && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg">
                          {totalRankingsCount}
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={() => setShowRankingsModal(true)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 border-0 h-12 font-bold ring-2 ring-emerald-300 ring-offset-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-white/20 rounded-lg">
                          <BarChart3 className="h-5 w-5" />
                        </div>
                        <span>Classifiche</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Desktop Layout (≥768px) */}
              <div className="hidden md:flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 backdrop-blur-sm mb-4 border border-blue-200">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-slow" />
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Gestione Iscrizioni
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
                    {championship.name}
                  </h1>
                  <p className="text-gray-700 text-base md:text-lg mb-4">
                    {championship.season && `Stagione ${championship.season} • `}
                    Anno {championship.year}
                  </p>

                  {/* Action Buttons - Desktop */}
                  <div className="flex gap-4 w-full">
                    <div className="relative">
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-blue-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                          INFO
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowInfoModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 border-0 h-12 font-semibold px-6 ring-2 ring-blue-300 ring-offset-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-white/20 rounded-lg">
                            <Info className="h-5 w-5" />
                          </div>
                          <span>Informazioni Campionato</span>
                        </div>
                      </Button>
                    </div>
                    <div className="relative">
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                          {championship.race_count} {championship.race_count === 1 ? 'TAPPA' : 'TAPPE'}
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowStagesModal(true)}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 border-0 h-12 font-semibold px-6 ring-2 ring-orange-300 ring-offset-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-white/20 rounded-lg">
                            <Flag className="h-5 w-5" />
                          </div>
                        <span>Tappe del Campionato</span>
                      </div>
                    </Button>
                    </div>
                    <div className="relative ml-auto">
                      {totalRankingsCount > 0 && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <div className="bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                            {totalRankingsCount}
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={() => setShowRankingsModal(true)}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 border-0 h-12 font-semibold px-6 ring-2 ring-emerald-300 ring-offset-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-white/20 rounded-lg">
                            <BarChart3 className="h-5 w-5" />
                          </div>
                          <span>Classifiche</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Stats - Desktop */}
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-blue-200 min-w-[120px] shadow-md">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {totalRegistrations}
                  </div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                    Iscritti Totali
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Society Selector Card - for Admins and Multi-Society Users */}
        {(societies.length > 0 || userIsAdmin) && (
          <div className="mb-8 relative">
            {/* Animated Arrow Indicator - Only show when no society selected */}
            {!societyId && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    INIZIA QUI
                  </div>
                  <ArrowDown className="h-6 w-6 text-yellow-500 drop-shadow-lg" />
                </div>
              </div>
            )}

            <div className={cn(
              "bg-white rounded-xl border-2 shadow-lg p-6 transition-all duration-300",
              !hasAnySocietySelection
                ? "border-yellow-400 shadow-yellow-200 animate-pulse-slow ring-4 ring-yellow-100"
                : hasSpecificSocietySelected
                  ? "border-green-400 shadow-green-200"
                  : "border-blue-400 shadow-blue-200 ring-4 ring-blue-100/70"
            )}>
              <div className="flex items-center gap-3 mb-4">
                {/* Step Badge */}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shadow-md font-bold text-white text-lg",
                  !hasAnySocietySelection
                    ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                    : hasSpecificSocietySelected
                      ? "bg-gradient-to-br from-green-500 to-emerald-600"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600"
                )}>
                  {!hasAnySocietySelection ? "1" : hasSpecificSocietySelected ? "✓" : "!"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <label className="block text-lg font-bold text-gray-900">
                      {!hasAnySocietySelection
                        ? "STEP 1: Seleziona Società"
                        : hasSpecificSocietySelected
                          ? "Società Selezionata"
                          : "Vista: Tutte le Società"}
                    </label>
                    {hasSpecificSocietySelected && (
                      <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
                        COMPLETATO
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {!hasAnySocietySelection
                      ? "Prima scegli la società per cui gestire le iscrizioni"
                      : hasSpecificSocietySelected
                        ? "Ora puoi aggiungere nuovi iscritti"
                        : "Seleziona una società specifica per aggiungere nuovi iscritti"}
                  </p>
                  {isAllSocietiesSelected && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                      <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>Per registrare nuovi atleti, scegli una società specifica dal menu.</span>
                    </div>
                  )}
                </div>
              </div>

          {/* Society Selector Button */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(true)}
            data-tour-anchor="championship-society-selector"
            className={cn(
              "flex h-14 w-full items-center justify-between rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
              !hasAnySocietySelection
                ? "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 hover:border-yellow-500 hover:shadow-lg focus:ring-yellow-500 shadow-md"
                : hasSpecificSocietySelected
                  ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-500 hover:shadow-md focus:ring-green-500"
                  : "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-500 hover:shadow-md focus:ring-blue-500"
            )}
          >
            <span className={cn(
              "font-bold",
              !hasAnySocietySelection && "text-gray-600",
              hasAnySocietySelection && "text-gray-900"
            )}>
              {societyId === 'all'
                ? '🏢 Tutte le Società'
                : (() => {
                    const society = societies.find(s => s.id === societyId);
                    if (!society) return '👉 Clicca qui per selezionare una società';
                    return society.society_code
                      ? `${society.name} (${society.society_code})`
                      : society.name;
                  })()}
            </span>
            <ChevronsUpDown className={cn(
              "h-5 w-5",
              !hasAnySocietySelection
                ? "text-yellow-600"
                : hasSpecificSocietySelected
                  ? "text-green-600"
                  : "text-blue-600"
            )} />
          </button>

          {/* Society Selection Dialog - Centered */}
          <Dialog open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                      Seleziona Società
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-1">
                      Scegli la società per visualizzare e gestire le iscrizioni
                    </DialogDescription>
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
                  <Input
                    type="text"
                    placeholder="Cerca società per nome o codice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-2 border-gray-300 focus:border-blue-500 rounded-lg bg-white"
                    autoFocus
                  />
                </div>
              </DialogHeader>

              {/* Options List */}
              <div className="overflow-y-auto p-4 max-h-[50vh]">
                <div className="space-y-2">
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
                        "relative flex w-full cursor-pointer select-none items-center rounded-xl py-4 pl-12 pr-4 text-sm outline-none transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-2",
                        societyId === 'all'
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-300 shadow-md"
                          : "border-gray-200 hover:border-blue-300"
                      )}
                    >
                      <span className="absolute left-4 flex h-6 w-6 items-center justify-center">
                        {societyId === 'all' && <Check className="h-6 w-6 text-blue-600 font-bold" />}
                      </span>
                      <span className="font-bold text-base">🏢 Tutte le Società</span>
                    </button>
                  )}

                  {/* Gradient Separator */}
                  {userIsAdmin && societies.length > 0 && (
                    <div className="my-3 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
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
                          "relative flex w-full cursor-pointer select-none items-center rounded-xl py-4 pl-12 pr-4 text-sm outline-none transition-all hover:bg-gray-50 hover:shadow-md border-2",
                          societyId === society.id
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-300 shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <span className="absolute left-4 flex h-6 w-6 items-center justify-center">
                          {societyId === society.id && <Check className="h-6 w-6 text-blue-600 font-bold" />}
                        </span>
                        <div className="flex flex-col items-start">
                          <span className="font-semibold text-base">{society.name}</span>
                          {society.society_code && (
                            <span className="text-xs text-gray-500 mt-1">
                              Codice: {society.society_code}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}

                  {/* No Results */}
                  {societies.filter(society =>
                    society.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    society.society_code?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="py-12 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Search className="h-10 w-10 text-gray-300" />
                      </div>
                      <p className="text-base text-gray-600 font-semibold">Nessuna società trovata</p>
                      <p className="text-sm text-gray-400 mt-2">Prova con un altro termine di ricerca</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
            </div>
          </div>
        )}

        {/* Main Content - Registrations List */}
        {societyId ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ChampionshipRegistrationsList
              key={refreshKey}
              championshipId={championship.id}
              societyId={societyId}
              onUpdate={() => setRefreshKey((prev) => prev + 1)}
              onNewRegistration={societyId !== 'all' ? () => setIsDialogOpen(true) : undefined}
            />
          </div>
        ) : (
          <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50 rounded-2xl border-2 border-dashed border-yellow-400 shadow-xl p-12 sm:p-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-2xl mx-auto">
              {/* Animated Icon */}
              <div className="relative mb-8">
                <div className="h-24 w-24 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl animate-pulse-slow">
                  <Search className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-yellow-900" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                Inizia da qui! 👆
              </h3>

              {/* Instructions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 border-2 border-yellow-200 shadow-lg">
                <p className="text-lg text-gray-700 font-semibold mb-4">
                  Per aggiungere nuovi iscritti, segui questi semplici passaggi:
                </p>

                <div className="space-y-4 text-left">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">Seleziona una Società</p>
                      <p className="text-sm text-gray-600">
                        Clicca sul pulsante "STEP 1" qui sopra per scegliere la società
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 opacity-60">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-700 mb-1">Aggiungi Iscritti</p>
                      <p className="text-sm text-gray-500">
                        Dopo aver selezionato la società, potrai cliccare su "Nuova Iscrizione"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <p className="text-gray-500 text-sm">
                {societies.length > 1
                  ? `Hai accesso a ${societies.length} società`
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

        {/* Championship Info Modal */}
        <ChampionshipInfoModal
          championship={championship}
          open={showInfoModal}
          onOpenChange={setShowInfoModal}
        />

        {/* Championship Stages Modal */}
        <ChampionshipStagesModal
          races={races}
          championshipId={championshipId}
          open={showStagesModal}
          onOpenChange={setShowStagesModal}
          registrationCounts={raceRegistrationCounts}
        />

        <ChampionshipRankingsModal
          open={showRankingsModal}
          onOpenChange={setShowRankingsModal}
          championship={championship}
          races={races}
          isAdmin={Boolean(userIsAdmin || isAdmin)}
          onUpdateChampionshipRanking={handleChampionshipRankingChange}
          onUpdateRaceRanking={handleStageRankingChange}
        />
      </div>
    </div>
  );
}
