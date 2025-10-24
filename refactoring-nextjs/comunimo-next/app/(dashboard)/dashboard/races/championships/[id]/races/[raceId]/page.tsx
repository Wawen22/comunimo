'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/api/supabase';
import { Race, Championship } from '@/types/database';
import { RaceDetail } from '@/components/races/RaceDetail';
import { Calendar } from 'lucide-react';

export default function RaceDetailPage() {
  const params = useParams();
  const raceId = params.raceId as string;
  const championshipId = params.id as string;

  const [race, setRace] = useState<Race | null>(null);
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [registrationsCount, setRegistrationsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRaceAndChampionship();
  }, [raceId, championshipId]);

  const fetchRaceAndChampionship = async () => {
    try {
      setIsLoading(true);

      // Fetch race
      const { data: raceData, error: raceError } = await supabase
        .from('events')
        .select('*')
        .eq('id', raceId)
        .eq('is_active', true)
        .single();

      if (raceError) throw raceError;

      // Fetch championship
      const { data: championshipData, error: championshipError } = await supabase
        .from('championships')
        .select('*')
        .eq('id', championshipId)
        .eq('is_active', true)
        .single();

      if (championshipError) throw championshipError;

      // Fetch registrations count for this championship
      const { count: regCount } = await supabase
        .from('championship_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('championship_id', championshipId)
        .eq('status', 'confirmed');

      setRace(raceData);
      setChampionship(championshipData);
      setRegistrationsCount(regCount || 0);
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
    <div className="container mx-auto py-6">
      <RaceDetail
        race={race}
        championship={championship || undefined}
        registrationsCount={registrationsCount}
      />
    </div>
  );
}

