'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/api/supabase';
import { Championship, Event } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { useIsAdmin } from '@/lib/hooks/useUser';
import { ArrowLeft, Edit, Trash2, Plus, Calendar, MapPin, Users, Trophy, Flag, UserPlus, Clock, ArrowRight } from 'lucide-react';
import { DeleteChampionshipDialog } from './DeleteChampionshipDialog';
import { getRaceStatus, getStatusColor, getStatusLabel } from '@/lib/utils/raceUtils';
import { RaceTimeline } from './RaceTimeline';

interface ChampionshipWithRaces extends Championship {
  races: Event[];
  race_count: number;
}

interface ChampionshipDetailProps {
  championshipId: string;
}

export function ChampionshipDetail({ championshipId }: ChampionshipDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();

  const [championship, setChampionship] = useState<ChampionshipWithRaces | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [registrationsCount, setRegistrationsCount] = useState<number>(0);
  const [raceRegistrationCounts, setRaceRegistrationCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchChampionship();
  }, [championshipId]);

  const fetchChampionship = async () => {
    try {
      setIsLoading(true);

      // Fetch championship
      const { data: championshipData, error: championshipError } = await supabase
        .from('championships')
        .select('*')
        .eq('id', championshipId)
        .eq('is_active', true)
        .single();

      if (championshipError) throw championshipError;

      // Fetch races for this championship
      const { data: racesData, error: racesError } = await supabase
        .from('events')
        .select('*')
        .eq('championship_id', championshipId)
        .eq('is_active', true)
        .order('event_number', { ascending: true });

      if (racesError) throw racesError;

      // Fetch registrations count for this championship
      const { count: regCount } = await supabase
        .from('championship_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('championship_id', championshipId)
        .eq('status', 'confirmed');

      setRegistrationsCount(regCount || 0);

      // Fetch registration counts for each race
      if (racesData && racesData.length > 0) {
        const raceIds = racesData.map(race => race.id);
        const { data: eventRegistrations } = await supabase
          .from('event_registrations')
          .select('event_id')
          .in('event_id', raceIds)
          .eq('status', 'confirmed');

        // Count registrations per race
        const counts: Record<string, number> = {};
        eventRegistrations?.forEach(reg => {
          counts[reg.event_id] = (counts[reg.event_id] || 0) + 1;
        });
        setRaceRegistrationCounts(counts);
      }

      if (championshipData) {
        setChampionship({
          ...(championshipData as Championship),
          races: racesData || [],
          race_count: racesData?.length || 0,
        } as ChampionshipWithRaces);
      }
    } catch (error: any) {
      console.error('Error fetching championship:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i dati del campionato',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cross_country':
        return 'Corsa Campestre';
      case 'road':
        return 'Strada';
      case 'track':
        return 'Pista';
      case 'other':
        return 'Altro';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cross_country':
        return 'bg-green-100 text-green-800';
      case 'road':
        return 'bg-blue-100 text-blue-800';
      case 'track':
        return 'bg-purple-100 text-purple-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!championship) {
    return (
      <div className="text-center py-12">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Campionato non trovato</h3>
        <p className="text-muted-foreground mt-2">
          Il campionato richiesto non esiste o è stato eliminato
        </p>
        <Link href="/dashboard/races/championships">
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla lista
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/races/championships">
          <Button variant="outline" size="sm" className="hover:bg-yellow-50 hover:border-yellow-500 hover:text-yellow-700 transition-all">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
        </Link>
      </div>

      {/* Modern Hero Header Card - Soft Gradient */}
      <Card className="relative overflow-hidden border-2 border-orange-100 shadow-lg">
        {/* Soft Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" />

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/30 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-100/20 rounded-full -ml-48 -mb-48 blur-3xl" />

        {/* Floating Trophy Icon */}
        <div className="absolute inset-0 opacity-[0.03]">
          <Trophy className="absolute top-8 right-12 h-32 w-32 text-orange-600 animate-float" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4 sm:gap-6">
            <div className="flex-1 space-y-3 sm:space-y-4">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 text-orange-700 border border-orange-200 shadow-md">
                  <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-bold">{championship.year}</span>
                </div>
                <Badge className={`${getTypeColor(championship.championship_type)} border-0 shadow-md text-xs sm:text-sm px-2.5 sm:px-3 py-0.5 sm:py-1`}>
                  {getTypeLabel(championship.championship_type)}
                </Badge>
                {championship.season && (
                  <Badge className="bg-orange-100/80 backdrop-blur-md text-orange-700 border border-orange-200 shadow-md text-xs sm:text-sm">
                    Stagione {championship.season}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                {championship.name}
              </h1>

              {/* Description Preview */}
              {championship.description && (
                <p className="text-gray-700 text-sm sm:text-base md:text-lg font-medium max-w-3xl line-clamp-2">
                  {championship.description}
                </p>
              )}
            </div>

            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex gap-2 flex-wrap">
                <Link href={`/dashboard/races/championships/${championship.id}/edit`}>
                  <Button
                    size="sm"
                    className="bg-white border-2 border-orange-300 text-orange-700 hover:bg-orange-50 shadow-md transition-all"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica
                  </Button>
                </Link>
                <Button
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 shadow-md transition-all"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Championship Info */}
      <Card className="border-2 border-gray-200 hover:border-yellow-500/50 hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-yellow-50 via-orange-50 to-transparent">
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <Trophy className="h-5 w-5" />
            Informazioni Campionato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {championship.description && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-200">
              <h3 className="text-sm font-semibold mb-2 text-gray-900">Descrizione</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{championship.description}</p>
            </div>
          )}

          {/* Stats Grid - Light & Compact */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {/* Data Inizio */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-200/50 hover:border-blue-300 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-blue-700 uppercase tracking-wide">Data Inizio</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-gray-900">
                {formatDate(championship.start_date)}
              </p>
            </div>

            {/* Data Fine */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-200/50 hover:border-purple-300 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-purple-700 uppercase tracking-wide">Data Fine</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-gray-900">
                {formatDate(championship.end_date)}
              </p>
            </div>

            {/* Tappe */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100/50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-orange-200/50 hover:border-orange-300 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/10">
                  <Flag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-orange-700 uppercase tracking-wide">Tappe</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {championship.race_count}
              </p>
            </div>

            {/* Iscritti */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100/50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-green-200/50 hover:border-green-300 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-green-700 uppercase tracking-wide">Iscritti</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {registrationsCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registrations CTA - Modern Hero Card */}
      <Card className="relative overflow-hidden border-2 border-blue-200 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 opacity-100" />

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full -ml-48 -mb-48 blur-3xl group-hover:scale-110 transition-transform duration-700" />

        {/* Floating Icons Background */}
        <div className="absolute inset-0 opacity-5">
          <Users className="absolute top-4 right-8 h-16 w-16 text-white animate-pulse-slow" />
          <UserPlus className="absolute bottom-8 left-12 h-12 w-12 text-white animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <CardContent className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left: Content */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    {/* Pulse Ring */}
                    <div className="absolute inset-0 rounded-2xl bg-white/30 animate-ping opacity-75" />
                  </div>
                </div>

                {/* Title & Description */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-3">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Gestione Completa
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
                    Gestisci Iscrizioni
                  </h3>
                  <p className="text-blue-100 text-base sm:text-lg font-medium">
                    Visualizza, aggiungi e gestisci tutti gli atleti iscritti al campionato
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-3">
                {/* Iscritti */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white leading-none">
                      {registrationsCount}
                    </div>
                    <div className="text-xs text-blue-100 mt-0.5">
                      {registrationsCount === 1 ? 'Iscritto' : 'Iscritti'}
                    </div>
                  </div>
                </div>

                {/* Tappe */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Flag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white leading-none">
                      {championship.race_count}
                    </div>
                    <div className="text-xs text-blue-100 mt-0.5">
                      {championship.race_count === 1 ? 'Tappa' : 'Tappe'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: CTA Button */}
            <div className="w-full lg:w-auto">
              <Link href={`/dashboard/races/championships/${championship.id}/registrations`} className="block">
                <Button
                  size="lg"
                  className="w-full lg:w-auto bg-white text-blue-700 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 font-bold text-base px-8 py-6 h-auto group/btn"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                      <UserPlus className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-base font-bold">Vai alle Iscrizioni</div>
                      <div className="text-xs text-blue-600 font-normal">Gestisci tutti gli atleti</div>
                    </div>
                    <ArrowRight className="h-5 w-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Races List */}
      <Card className="border-2 border-gray-200 hover:border-orange-500/50 hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-orange-50 via-yellow-50 to-transparent">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Flag className="h-5 w-5" />
                Tappe del Campionato
              </CardTitle>
              <CardDescription className="mt-2">
                {championship.race_count === 0
                  ? 'Nessuna tappa ancora creata'
                  : `${championship.race_count} ${championship.race_count === 1 ? 'tappa' : 'tappe'} in questo campionato`}
              </CardDescription>
            </div>
            {isAdmin && (
              <Link href={`/dashboard/races/championships/${championship.id}/races/new`}>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Tappa
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {championship.races.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-6 shadow-xl">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                <Flag className="h-10 w-10 text-white relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Nessuna tappa ancora</h3>
              <p className="text-gray-600 mt-2 max-w-md mx-auto">
                Inizia aggiungendo la prima tappa del campionato per organizzare le gare
              </p>
              {isAdmin && (
                <Link href={`/dashboard/races/championships/${championship.id}/races/new`}>
                  <Button className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Prima Tappa
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <RaceTimeline
              races={championship.races}
              championshipId={championship.id}
              registrationCounts={raceRegistrationCounts}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <DeleteChampionshipDialog
          championship={{ ...championship, race_count: championship.race_count }}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onSuccess={() => router.push('/dashboard/races/championships')}
        />
      )}
    </div>
  );
}
