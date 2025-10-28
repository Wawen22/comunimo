'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/api/supabase';
import type { Championship, Event } from '@/types/database';
import { isRegistrationOpen } from '@/lib/utils/registrationUtils';

/**
 * Hook to fetch the active championship
 */
export function useActiveChampionship() {
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchChampionship() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('championships')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (fetchError) {
          // If no active championship found, it's not an error
          if (fetchError.code === 'PGRST116') {
            setChampionship(null);
          } else {
            throw fetchError;
          }
        } else {
          setChampionship(data);
        }
      } catch (err) {
        console.error('Error fetching championship:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchChampionship();
  }, []);

  return { championship, loading, error };
}

/**
 * Hook to fetch championship stages/events
 */
export function useChampionshipStages(championshipId: string | null) {
  const [stages, setStages] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStages() {
      if (!championshipId) {
        setStages([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .eq('championship_id', championshipId)
          .eq('is_active', true)
          .order('event_date', { ascending: true });

        if (fetchError) throw fetchError;

        setStages(data || []);
      } catch (err) {
        console.error('Error fetching stages:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchStages();
  }, [championshipId]);

  return { stages, loading, error };
}

/**
 * Hook to determine registration status
 */
export function useRegistrationStatus(events: Event[]) {
  const [status, setStatus] = useState<'open' | 'closed'>('closed');

  useEffect(() => {
    const isOpen = isRegistrationOpen(events);
    setStatus(isOpen ? 'open' : 'closed');
  }, [events]);

  return status;
}

/**
 * Combined hook for all landing page data
 */
export function useLandingData() {
  const { championship, loading: championshipLoading, error: championshipError } = useActiveChampionship();
  const { stages, loading: stagesLoading, error: stagesError } = useChampionshipStages(championship?.id || null);
  const registrationStatus = useRegistrationStatus(stages);

  return {
    championship,
    stages,
    registrationStatus,
    loading: championshipLoading || stagesLoading,
    error: championshipError || stagesError,
  };
}

