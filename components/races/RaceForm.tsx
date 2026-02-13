'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/api/supabase';
import { Race } from '@/types/database';
import { raceSchema } from '@/lib/utils/raceValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { ArrowLeft, Save, Calendar, MapPin, Users, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';
import { StageRankingUpload } from '@/components/races/StageRankingUpload';

type RaceFormData = z.infer<typeof raceSchema>;

interface RaceFormProps {
  race?: Race;
  championshipId: string;
  mode?: 'create' | 'edit';
}

export function RaceForm({ race, championshipId, mode = 'create' }: RaceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [nextEventNumber, setNextEventNumber] = useState<number>(1);
  const [currentResultsUrl, setCurrentResultsUrl] = useState<string | null>(race?.results_url ?? null);

  const toDateInputValue = (value?: string | null) => {
    if (!value) return '';
    return value.length >= 10 ? value.slice(0, 10) : value;
  };

  const toTimeInputValue = (value?: string | null) => {
    if (!value) return '';
    return value.length >= 5 ? value.slice(0, 5) : value;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RaceFormData>({
    resolver: zodResolver(raceSchema),
    defaultValues: race
      ? {
          championship_id: race.championship_id || '',
          society_id: race.society_id || '',
          title: race.title || '',
          description: race.description || '',
          event_date: toDateInputValue(race.event_date),
          event_time: toTimeInputValue(race.event_time),
          location: race.location || '',
          event_number: race.event_number || 1,
          registration_start_date: toDateInputValue(race.registration_start_date),
          registration_end_date: toDateInputValue(race.registration_end_date),
          max_participants: race.max_participants || null,
          poster_url: race.poster_url || '',
          results_url: race.results_url || '',
          has_specialties: race.has_specialties || false,
          is_public: race.is_public ?? true,
        }
      : {
          championship_id: championshipId,
          society_id: '',
          title: '',
          description: '',
          event_date: '',
          event_time: '',
          location: '',
          event_number: 1,
          registration_start_date: '',
          registration_end_date: '',
          max_participants: null,
          poster_url: '',
          results_url: '',
          has_specialties: false,
          is_public: true,
        },
  });

  // Fetch next event number for new races
  useEffect(() => {
    if (mode === 'create') {
      fetchNextEventNumber();
    }
  }, [mode, championshipId]);

  useEffect(() => {
    setCurrentResultsUrl(race?.results_url ?? null);
  }, [race?.results_url]);

  const fetchNextEventNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('event_number')
        .eq('championship_id', championshipId)
        .eq('is_active', true)
        .order('event_number', { ascending: false })
        .limit(1) as { data: any[] | null; error: any };

      if (error) throw error;

      const maxNumber = data && data.length > 0 && data[0]?.event_number
        ? data[0].event_number
        : 0;

      setNextEventNumber(maxNumber + 1);
    } catch (error) {
      console.error('Error fetching next event number:', error);
      setNextEventNumber(1);
    }
  };

  const onSubmit = async (values: RaceFormData) => {
    try {
      setIsLoading(true);

      const raceData = {
        ...values,
        championship_id: championshipId,
        event_number: mode === 'create' ? nextEventNumber : values.event_number,
        society_id: values.society_id || null,
        description: values.description || null,
        event_time: values.event_time || null,
        location: values.location || null,
        registration_start_date: values.registration_start_date || null,
        registration_end_date: values.registration_end_date || null,
        max_participants: values.max_participants || null,
        poster_url: values.poster_url || null,
        results_url: currentResultsUrl,
        created_by: mode === 'create' ? user?.id : undefined,
        updated_at: new Date().toISOString(),
      };

      if (mode === 'create') {
        const { data, error } = await supabase
          .from('events')
          .insert([raceData] as any)
          .select()
          .single() as { data: any; error: any };

        if (error) throw error;

        toast({
          title: 'Gara creata',
          description: 'La gara è stata creata con successo.',
        });

        router.push(`/dashboard/races/championships/${championshipId}/races/${data.id}`);
      } else {
        const { error } = await supabase
          .from('events')
          // @ts-expect-error - Supabase type inference issue
          .update(raceData)
          .eq('id', race!.id);

        if (error) throw error;

        toast({
          title: 'Gara aggiornata',
          description: 'La gara è stata aggiornata con successo.',
        });

        router.push(`/dashboard/races/championships/${championshipId}/races/${race!.id}`);
      }
    } catch (error) {
      console.error('Error saving race:', error);
      toast({
        title: 'Errore',
        description: mode === 'create' 
          ? 'Impossibile creare la gara. Riprova.' 
          : 'Impossibile aggiornare la gara. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informazioni Generali
          </CardTitle>
          <CardDescription>
            Inserisci le informazioni principali della tappa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="title">
                Titolo Tappa <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="es. 1° Tappa Campionato Corsa Campestre"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="event_number">
                Numero Tappa <span className="text-destructive">*</span>
              </Label>
              <Input
                id="event_number"
                type="number"
                {...register('event_number', {
                  setValueAs: (v) => v === '' ? nextEventNumber : parseInt(v, 10)
                })}
                placeholder={mode === 'create' ? `${nextEventNumber}` : '1'}
                disabled={mode === 'create'}
              />
              {mode === 'create' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Assegnato automaticamente
                </p>
              )}
              {errors.event_number && (
                <p className="text-sm text-destructive mt-1">{errors.event_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="event_date">
                Data Gara <span className="text-destructive">*</span>
              </Label>
              <Input
                id="event_date"
                type="date"
                {...register('event_date')}
              />
              {errors.event_date && (
                <p className="text-sm text-destructive mt-1">{errors.event_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="event_time">Ora Gara</Label>
              <Input
                id="event_time"
                type="time"
                {...register('event_time')}
                placeholder="09:00"
              />
              {errors.event_time && (
                <p className="text-sm text-destructive mt-1">{errors.event_time.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Luogo</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="es. Parco Ferrari, Modena"
              />
              {errors.location && (
                <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descrizione della gara..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Iscrizioni
          </CardTitle>
          <CardDescription>
            Configura le date e i limiti per le iscrizioni
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="registration_start_date">Data Inizio Iscrizioni</Label>
              <Input
                id="registration_start_date"
                type="date"
                {...register('registration_start_date')}
              />
              {errors.registration_start_date && (
                <p className="text-sm text-destructive mt-1">{errors.registration_start_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="registration_end_date">Data Fine Iscrizioni</Label>
              <Input
                id="registration_end_date"
                type="date"
                {...register('registration_end_date')}
              />
              {errors.registration_end_date && (
                <p className="text-sm text-destructive mt-1">{errors.registration_end_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="max_participants">Numero Massimo Partecipanti</Label>
              <Input
                id="max_participants"
                type="number"
                {...register('max_participants', {
                  setValueAs: (v) => v === '' ? null : parseInt(v, 10)
                })}
                placeholder="Illimitato"
              />
              {errors.max_participants && (
                <p className="text-sm text-destructive mt-1">{errors.max_participants.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Classifica ufficiale
          </CardTitle>
          <CardDescription>
            Gestisci il PDF della classifica per questa tappa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'edit' && race?.id ? (
            <StageRankingUpload
              championshipId={championshipId}
              raceId={race.id}
              currentUrl={currentResultsUrl}
              onChange={setCurrentResultsUrl}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10 p-4 text-sm text-muted-foreground">
              Salva la tappa e riapri la pagina di modifica per caricare la classifica in PDF.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/races/championships/${championshipId}/registrations`}>
          <Button type="button" variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Annulla
          </Button>
        </Link>

        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Salvataggio...' : mode === 'create' ? 'Crea Gara' : 'Salva Modifiche'}
        </Button>
      </div>
    </form>
  );
}
