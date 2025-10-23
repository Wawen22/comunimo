'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/api/supabase';
import { Championship, Society } from '@/types/database';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ChampionshipRegistrations from '@/components/races/ChampionshipRegistrations';
import { useIsAdmin } from '@/lib/hooks/useUser';
import { getUserSocieties } from '@/lib/utils/userSocietyUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ChampionshipRegistrationsPage() {
  const params = useParams();
  const router = useRouter();
  const championshipId = params.id as string;
  const isAdmin = useIsAdmin();

  const [championship, setChampionship] = useState<Championship | null>(null);
  const [societyId, setSocietyId] = useState<string | null>(null);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [championshipId]);

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

      setChampionship(championshipData);

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

      const userIsAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

      if (userIsAdmin) {
        // Admin can manage all registrations - fetch all societies
        const { data: societiesData, error: societiesError } = await supabase
          .from('societies')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true }) as { data: Society[] | null; error: any };

        if (societiesError) throw societiesError;

        setSocieties(societiesData || []);
        // Don't set societyId yet - admin will select it
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
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/races/championships/${championshipId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna al Campionato
        </Button>
      </div>

      {/* Society Selector for Admins and Multi-Society Users */}
      {societies.length > 1 && (
        <div className="mb-6 max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleziona Società
          </label>
          <Select value={societyId || ''} onValueChange={setSocietyId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona una società..." />
            </SelectTrigger>
            <SelectContent>
              {societies.map((society) => (
                <SelectItem key={society.id} value={society.id}>
                  {society.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Main Content */}
      {societyId ? (
        <ChampionshipRegistrations
          championship={championship}
          societyId={societyId}
          isAdmin={isAdmin}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {societies.length > 1
              ? 'Seleziona una società per gestire le iscrizioni'
              : 'Caricamento...'}
          </p>
        </div>
      )}
    </div>
  );
}

