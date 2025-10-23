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
import { ArrowLeft, Edit, Trash2, Plus, Calendar, MapPin, Users, Trophy, Flag, UserPlus } from 'lucide-react';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/races/championships">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Indietro
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{championship.name}</h1>
            <p className="text-muted-foreground">
              {championship.season && `Stagione ${championship.season}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/races/championships/${championship.id}/registrations`}>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Gestisci Iscrizioni
            </Button>
          </Link>
          {isAdmin && (
            <>
              <Link href={`/dashboard/races/championships/${championship.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifica
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                Elimina
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Championship Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informazioni Campionato</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{championship.year}</Badge>
              <Badge className={getTypeColor(championship.championship_type)}>
                {getTypeLabel(championship.championship_type)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {championship.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Descrizione</h3>
              <p className="text-sm">{championship.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Data Inizio</h3>
              <p className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(championship.start_date)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Data Fine</h3>
              <p className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(championship.end_date)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Numero Gare</h3>
            <p className="text-sm flex items-center gap-2">
              <Flag className="h-4 w-4" />
              {championship.race_count} {championship.race_count === 1 ? 'gara' : 'gare'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Races List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gare del Campionato</CardTitle>
              <CardDescription>
                {championship.race_count === 0
                  ? 'Nessuna gara ancora creata'
                  : `${championship.race_count} ${championship.race_count === 1 ? 'gara' : 'gare'} in questo campionato`}
              </CardDescription>
            </div>
            {isAdmin && (
              <Link href={`/dashboard/races/championships/${championship.id}/races/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Gara
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {championship.races.length === 0 ? (
            <div className="text-center py-8">
              <Flag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nessuna gara</h3>
              <p className="text-muted-foreground mt-2">
                Inizia aggiungendo la prima gara del campionato
              </p>
              {isAdmin && (
                <Link href={`/dashboard/races/championships/${championship.id}/races/new`}>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Prima Gara
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
                    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {race.event_number && (
                              <Badge variant="outline">Tappa {race.event_number}</Badge>
                            )}
                            <Badge className={getStatusColor(status)}>
                              {getStatusLabel(status)}
                            </Badge>
                          </div>
                          <h4 className="font-semibold">{race.title}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(race.event_date)}
                            </span>
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

