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
import { ArrowLeft, Edit, Trash2, Plus, Calendar, MapPin, Users, Trophy, Flag, UserPlus, Clock } from 'lucide-react';
import { DeleteChampionshipDialog } from './DeleteChampionshipDialog';
import { getRaceStatus, getStatusColor, getStatusLabel } from '@/lib/utils/raceUtils';

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
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
        </Link>
      </div>

      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background px-6 py-6 border-b">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-sm font-semibold">
                  {championship.year}
                </Badge>
                <Badge className={getTypeColor(championship.championship_type)}>
                  {getTypeLabel(championship.championship_type)}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">{championship.name}</h1>
              {championship.season && (
                <p className="text-muted-foreground text-lg">
                  Stagione {championship.season}
                </p>
              )}
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <Link href={`/dashboard/races/championships/${championship.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                  Elimina
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Championship Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Informazioni Campionato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {championship.description && (
            <div>
              <h3 className="text-sm font-medium mb-2">Descrizione</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{championship.description}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Data Inizio</span>
              </div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                {formatDate(championship.start_date)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Data Fine</span>
              </div>
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                {formatDate(championship.end_date)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-1">
                <Flag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Tappe</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {championship.race_count}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Iscritti</span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {registrationsCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registrations CTA */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
              <Users className="h-8 w-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Gestisci Iscrizioni</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Gestisci tutte le iscrizioni degli atleti al campionato <strong>{championship.name}</strong>.
                Visualizza, modifica e organizza i partecipanti.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
              <Link href={`/dashboard/races/championships/${championship.id}/registrations`}>
                <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Vai alle Iscrizioni
                </Button>
              </Link>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{registrationsCount}</div>
                <div className="text-xs text-muted-foreground">Iscritti Totali</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{championship.race_count}</div>
                <div className="text-xs text-muted-foreground">Tappe del Campionato</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {championship.race_count > 0
                    ? Math.round(registrationsCount / championship.race_count)
                    : 0}
                </div>
                <div className="text-xs text-muted-foreground">Media Iscritti/Tappa</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Races List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Tappe del Campionato
              </CardTitle>
              <CardDescription>
                {championship.race_count === 0
                  ? 'Nessuna tappa ancora creata'
                  : `${championship.race_count} ${championship.race_count === 1 ? 'tappa' : 'tappe'} in questo campionato`}
              </CardDescription>
            </div>
            {isAdmin && (
              <Link href={`/dashboard/races/championships/${championship.id}/races/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Tappa
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {championship.races.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Flag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Nessuna tappa</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Inizia aggiungendo la prima tappa del campionato
              </p>
              {isAdmin && (
                <Link href={`/dashboard/races/championships/${championship.id}/races/new`}>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Prima Tappa
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {championship.races.map((race) => {
                const status = getRaceStatus(race);
                return (
                  <Link
                    key={race.id}
                    href={`/dashboard/races/championships/${championship.id}/races/${race.id}`}
                  >
                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {race.event_number && (
                              <Badge variant="outline" className="font-semibold">
                                Tappa {race.event_number}
                              </Badge>
                            )}
                            <Badge className={getStatusColor(status)}>
                              {getStatusLabel(status)}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {race.title}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(race.event_date)}
                            </span>
                            {race.event_time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {race.event_time}
                              </span>
                            )}
                            {race.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {race.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
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

