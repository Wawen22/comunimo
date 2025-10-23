'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/api/supabase';
import { Championship } from '@/types/database';
import { ChampionshipForm } from '@/components/races/ChampionshipForm';
import { useToast } from '@/components/ui/toast';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditChampionshipPage({ params }: PageProps) {
  const { toast } = useToast();
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChampionship();
  }, [params.id]);

  const fetchChampionship = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('championships')
        .select('*')
        .eq('id', params.id)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      setChampionship(data);
    } catch (error: any) {
      console.error('Error fetching championship:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare il campionato',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="text-sm text-gray-500">Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!championship) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Campionato non trovato</h3>
          <p className="text-muted-foreground mt-2">
            Il campionato richiesto non esiste o è stato eliminato
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <ChampionshipForm championship={championship} mode="edit" />
    </div>
  );
}

