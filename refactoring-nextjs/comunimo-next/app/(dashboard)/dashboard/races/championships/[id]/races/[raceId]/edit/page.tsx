'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/api/supabase';
import { Race } from '@/types/database';
import { RaceForm } from '@/components/races/RaceForm';
import { Calendar } from 'lucide-react';

export default function EditRacePage() {
  const params = useParams();
  const raceId = params.raceId as string;
  const championshipId = params.id as string;

  const [race, setRace] = useState<Race | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRace();
  }, [raceId]);

  const fetchRace = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', raceId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      setRace(data);
    } catch (error) {
      console.error('Error fetching race:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Gara non trovata</h2>
          <p className="text-muted-foreground">
            La gara che stai cercando non esiste o è stata eliminata.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="h-8 w-8" />
          Modifica Tappa
        </h1>
        <p className="text-muted-foreground mt-2">
          Modifica le informazioni della tappa
        </p>
      </div>

      <RaceForm race={race} championshipId={championshipId} mode="edit" />
    </div>
  );
}

