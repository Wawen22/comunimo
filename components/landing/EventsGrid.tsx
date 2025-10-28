'use client';

import { useState } from 'react';
import type { Event } from '@/types/database';
import type { EventsFilters } from '@/lib/hooks/useEventsData';
import { EventCard } from './EventCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  X,
  Calendar,
  Filter,
  SlidersHorizontal,
  CalendarDays,
  History,
  TrendingUp,
} from 'lucide-react';

interface EventsGridProps {
  events: Event[];
  filters: EventsFilters;
  onFiltersChange: (filters: EventsFilters) => void;
  loading: boolean;
}

/**
 * Events grid with filters and search
 * Features:
 * - Real-time search
 * - Date filtering (all/upcoming/past)
 * - Sorting options
 * - Responsive grid layout
 * - Empty states
 * - Filter badges
 */
export function EventsGrid({ events, filters, onFiltersChange, loading }: EventsGridProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleDateFilterChange = (value: 'all' | 'upcoming' | 'past') => {
    onFiltersChange({ ...filters, dateFilter: value });
  };

  const handleSortChange = (value: 'date-asc' | 'date-desc' | 'title') => {
    onFiltersChange({ ...filters, sortBy: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      dateFilter: 'all',
      sortBy: 'date-asc',
    });
  };

  const activeFiltersCount = [
    filters.search,
    filters.dateFilter !== 'all',
    filters.sortBy !== 'date-asc',
  ].filter(Boolean).length;

  if (loading) {
    return (
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 space-y-4">
            <div className="h-12 w-full max-w-md animate-pulse rounded-2xl bg-slate-200" />
            <div className="flex gap-3">
              <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-96 animate-pulse rounded-3xl bg-slate-200" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Cerca eventi per titolo, descrizione o località..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-12 rounded-2xl border-2 border-slate-200 bg-white pl-12 pr-12 text-base shadow-sm transition-all focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
            />
            {filters.search && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle Filters Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-2 border-slate-200 hover:border-purple-400 hover:bg-purple-50"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtri
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full bg-purple-500 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.dateFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateFilterChange('all')}
                className={filters.dateFilter === 'all' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0' 
                  : 'border-2 border-slate-200 hover:border-purple-400 hover:bg-purple-50'
                }
              >
                <Calendar className="mr-2 h-4 w-4" />
                Tutti
              </Button>
              <Button
                variant={filters.dateFilter === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateFilterChange('upcoming')}
                className={filters.dateFilter === 'upcoming' 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0' 
                  : 'border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'
                }
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                In Arrivo
              </Button>
              <Button
                variant={filters.dateFilter === 'past' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateFilterChange('past')}
                className={filters.dateFilter === 'past' 
                  ? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white border-0' 
                  : 'border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                }
              >
                <History className="mr-2 h-4 w-4" />
                Passati
              </Button>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <X className="mr-2 h-4 w-4" />
                Cancella Filtri
              </Button>
            )}
          </div>

          {/* Advanced Filters (Collapsible) */}
          {showFilters && (
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Ordinamento
                  </label>
                  <Select value={filters.sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="h-10 border-2 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-asc">Data (prima i più vicini)</SelectItem>
                      <SelectItem value="date-desc">Data (prima i più lontani)</SelectItem>
                      <SelectItem value="title">Titolo (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-slate-600">
            {events.length === 0 ? (
              'Nessun evento trovato'
            ) : (
              <>
                <span className="font-semibold text-slate-900">{events.length}</span>{' '}
                {events.length === 1 ? 'evento trovato' : 'eventi trovati'}
              </>
            )}
          </p>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <CalendarDays className="mx-auto h-16 w-16 text-slate-300" />
            <h3 className="mt-4 text-xl font-semibold text-slate-900">
              Nessun evento disponibile
            </h3>
            <p className="mt-2 text-slate-600">
              {filters.search || filters.dateFilter !== 'all'
                ? 'Prova a modificare i filtri di ricerca'
                : 'Al momento non ci sono eventi in programma'}
            </p>
            {activeFiltersCount > 0 && (
              <Button
                onClick={clearFilters}
                className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
              >
                Cancella Filtri
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

