'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/api/supabase';
import { Championship } from '@/types/database';
import { championshipSchema } from '@/lib/utils/raceValidation';
import { generateSlug } from '@/lib/utils/raceUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';

type ChampionshipFormData = z.infer<typeof championshipSchema>;

interface ChampionshipFormProps {
  championship?: Championship;
  mode?: 'create' | 'edit';
}

export function ChampionshipForm({ championship, mode = 'create' }: ChampionshipFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChampionshipFormData>({
    resolver: zodResolver(championshipSchema),
    defaultValues: championship
      ? {
          name: championship.name || '',
          slug: championship.slug || '',
          year: championship.year || new Date().getFullYear(),
          season: championship.season || '',
          championship_type: championship.championship_type || 'cross_country',
          description: championship.description || '',
          start_date: championship.start_date || '',
          end_date: championship.end_date || '',
        }
      : {
          name: '',
          slug: '',
          year: new Date().getFullYear(),
          season: '',
          championship_type: 'cross_country',
          description: '',
          start_date: '',
          end_date: '',
        },
  });

  const watchName = watch('name');
  const watchSlug = watch('slug');

  // Auto-generate slug from name
  useEffect(() => {
    if (autoSlug && watchName && mode === 'create') {
      const newSlug = generateSlug(watchName);
      setValue('slug', newSlug, { shouldValidate: false, shouldDirty: false });
    }
  }, [watchName, autoSlug, mode, setValue]);

  // Disable auto-slug if user manually edits slug
  useEffect(() => {
    if (mode === 'create' && watchSlug !== undefined) {
      const expectedSlug = generateSlug(watchName || '');
      if (watchSlug !== '' && watchSlug !== expectedSlug) {
        setAutoSlug(false);
      }
    }
  }, [watchSlug, watchName, mode]);

  const onSubmit = async (data: ChampionshipFormData) => {
    try {
      setIsLoading(true);

      if (mode === 'create') {
        // Create new championship
        const { data: newChampionship, error } = await supabase
          .from('championships')
          .insert({
            ...data,
            created_by: user?.id,
          } as any)
          .select()
          .single() as { data: any; error: any };

        if (error) throw error;

        toast({
          title: 'Campionato creato',
          description: 'Il campionato è stato creato con successo',
        });

        router.push(`/dashboard/races/championships/${newChampionship?.id}`);
      } else {
        // Update existing championship
        const { error } = await supabase
          .from('championships')
          // @ts-expect-error - Supabase type inference issue
          .update(data)
          .eq('id', championship!.id);

        if (error) throw error;

        toast({
          title: 'Campionato aggiornato',
          description: 'Il campionato è stato aggiornato con successo',
        });

        router.push(`/dashboard/races/championships/${championship!.id}`);
      }
    } catch (error: any) {
      console.error('Error saving championship:', error);
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile salvare il campionato',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={championship ? `/dashboard/races/championships/${championship.id}` : '/dashboard/races/championships'}>
            <Button type="button" variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Annulla
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {mode === 'create' ? 'Nuovo Campionato' : 'Modifica Campionato'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'create'
                ? 'Crea un nuovo campionato con le sue gare'
                : 'Modifica le informazioni del campionato'}
            </p>
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Salvataggio...' : 'Salva'}
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informazioni Base</CardTitle>
          <CardDescription>
            Inserisci le informazioni principali del campionato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">
                Nome Campionato <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="es. Campionato Corsa Campestre 2024/2025"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="slug">
                Slug (URL) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="campionato-corsa-campestre-2024-2025"
              />
              {autoSlug && mode === 'create' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Generato automaticamente dal nome
                </p>
              )}
              {errors.slug && (
                <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="year">
                Anno <span className="text-destructive">*</span>
              </Label>
              <Input
                id="year"
                type="number"
                {...register('year', {
                  setValueAs: (v) => v === '' ? new Date().getFullYear() : parseInt(v, 10)
                })}
                placeholder="2024"
              />
              {errors.year && (
                <p className="text-sm text-destructive mt-1">{errors.year.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="season">Stagione</Label>
              <Input
                id="season"
                {...register('season')}
                placeholder="es. 2024/2025"
              />
              {errors.season && (
                <p className="text-sm text-destructive mt-1">{errors.season.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="championship_type">
                Tipo Campionato <span className="text-destructive">*</span>
              </Label>
              <select
                id="championship_type"
                {...register('championship_type')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="cross_country">Corsa Campestre</option>
                <option value="road">Strada</option>
                <option value="track">Pista</option>
                <option value="other">Altro</option>
              </select>
              {errors.championship_type && (
                <p className="text-sm text-destructive mt-1">{errors.championship_type.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrizione</Label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Descrizione del campionato..."
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Date</CardTitle>
          <CardDescription>
            Specifica il periodo del campionato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data Inizio</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive mt-1">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_date">Data Fine</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
              />
              {errors.end_date && (
                <p className="text-sm text-destructive mt-1">{errors.end_date.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

