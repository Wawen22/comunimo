'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/api/supabase';
import { Championship } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useIsAdmin } from '@/lib/hooks/useUser';
import { Plus, Search, Trophy, Calendar, MapPin } from 'lucide-react';
import { ChampionshipCard } from './ChampionshipCard';

interface ChampionshipWithRaces extends Championship {
  race_count: number;
}

export function ChampionshipsList() {
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();
  
  const [championships, setChampionships] = useState<ChampionshipWithRaces[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'active' | 'archived'>('active');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    fetchChampionships();
  }, [searchQuery, page, view]);

  const fetchChampionships = async () => {
    try {
      setIsLoading(true);

      // Build query
      const today = new Date().toISOString().split('T')[0];
      let query = supabase
        .from('championships')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('year', { ascending: false })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (view === 'archived') {
        query = query.lt('end_date', today);
      } else {
        query = query.or(`end_date.is.null,end_date.gte.${today}`);
      }

      // Apply search filter
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error, count } = await query as { data: any[] | null; error: any; count: number | null };

      if (error) throw error;

      // Fetch race counts for each championship
      const championshipsWithCounts = await Promise.all(
        (data || []).map(async (championship) => {
          const { count: raceCount } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('championship_id', championship.id)
            .eq('is_active', true);

          return {
            ...championship,
            race_count: raceCount || 0,
          };
        })
      );

      setChampionships(championshipsWithCounts);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error('Error fetching championships:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i campionati',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
  };

  const handleViewChange = (nextView: 'active' | 'archived') => {
    setView(nextView);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca campionati..."
                className="pl-10"
                disabled
                value=""
                readOnly
              />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" disabled>
                In corso
              </Button>
              <Button size="sm" variant="outline" disabled>
                Archivio
              </Button>
            </div>
          </div>
          {isAdmin && (
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Campionato
            </Button>
          )}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-tour-anchor="championships-list">
      {/* Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca campionati..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={view === 'active' ? 'default' : 'outline'}
              onClick={() => handleViewChange('active')}
            >
              In corso
            </Button>
            <Button
              size="sm"
              variant={view === 'archived' ? 'default' : 'outline'}
              onClick={() => handleViewChange('archived')}
            >
              Archivio
            </Button>
          </div>
        </div>
        
        {isAdmin && (
          <Link href="/dashboard/races/championships/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Campionato
            </Button>
          </Link>
        )}
      </div>

      {/* Championships Grid */}
      {championships.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nessun campionato trovato</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery
              ? 'Prova a modificare i criteri di ricerca'
              : view === 'archived'
                ? 'Non ci sono campionati archiviati'
                : 'Inizia creando il tuo primo campionato'}
          </p>
          {isAdmin && !searchQuery && view === 'active' && (
            <Link href="/dashboard/races/championships/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Crea Campionato
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {championships.map((championship) => (
              <ChampionshipCard
                key={championship.id}
                championship={championship}
                onUpdate={fetchChampionships}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Pagina {page} di {totalPages} ({totalCount} campionati {view === 'archived' ? 'archiviati' : 'in corso'})
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Precedente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Successiva
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
